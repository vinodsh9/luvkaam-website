// Luvkaam backend. One self-contained Cloudflare Worker (also valid as a Pages "_worker.js").
// Routes: POST /api/register, /api/optout, /api/request, /api/event. Everything else is the static site.
// Needs one D1 database bound as "DB". Tables are created automatically on first use.

// Must match CONSENT_VERSION in assets/register.js. Change both whenever the wording of the
// registration notice or the privacy policy changes in a way that affects what people agree to.
const CONSENT_VERSION = '2026-10-22';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    phone TEXT NOT NULL,
    accepted_terms INTEGER NOT NULL DEFAULT 0,
    consent_promo INTEGER NOT NULL DEFAULT 0,
    consent_version TEXT NOT NULL,
    consent_at TEXT NOT NULL,
    promo_changed_at TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS consent_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    event TEXT NOT NULL,
    consent_version TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS idx_consent_log_user ON consent_log(user_id)',
  `CREATE TABLE IF NOT EXISTS privacy_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    closed_at TEXT
  )`,
  'CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON privacy_requests(status)',
  // One row per person, tool and day. Only the tool name and the date are kept, never the file.
  `CREATE TABLE IF NOT EXISTS tool_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    tool TEXT NOT NULL,
    day TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (user_id, tool, day)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_tool_events_user_day ON tool_events(user_id, day)',
];

let schemaReady = null;
function ensureSchema(db) {
  if (!schemaReady) {
    schemaReady = db.batch(SCHEMA.map((sql) => db.prepare(sql))).catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

/* ---------- helpers ---------- */
function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}
function checkOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch (e) { return false; }
}
async function readJson(request, maxBytes = 4096) {
  const type = request.headers.get('content-type') || '';
  if (!type.toLowerCase().includes('application/json')) throw new Error('Send the request as JSON.');
  const text = await request.text();
  if (text.length > maxBytes) throw new Error('The request is too large.');
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('bad');
    return value;
  } catch (e) { throw new Error('The request could not be read.'); }
}
function cleanName(value) {
  const s = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  if (s.length < 2 || s.length > 80) return null;
  if (/[<>\u0000-\u001f\u007f]/.test(s)) return null;
  return s;
}
function cleanEmail(value) {
  const s = String(value == null ? '' : value).trim().toLowerCase();
  if (s.length < 5 || s.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : null;
}
// Returns a normalised phone number such as +919876543210, or null.
// A 10 digit number starting 6-9 is treated as an Indian mobile number.
function cleanPhone(value) {
  const raw = String(value == null ? '' : value).trim();
  if (!/^[+0-9()\s.-]{8,25}$/.test(raw)) return null;
  let digits = raw.replace(/\D/g, '');
  if (!raw.startsWith('+')) {
    if (digits.length === 10 && /^[6-9]/.test(digits)) digits = '91' + digits;
    else if (digits.length === 11 && digits[0] === '0') digits = '91' + digits.slice(1);
  }
  if (digits.length < 8 || digits.length > 15) return null;
  return '+' + digits;
}
function cleanText(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
}
function preflight(request, env) {
  if (!checkOrigin(request)) return json({ error: 'This request is not allowed.' }, 403);
  if (!env.DB) {
    console.error('The D1 binding "DB" is missing. See README.md.');
    return json({ error: 'Registration is temporarily unavailable. Please try again later.' }, 503);
  }
  return null;
}

/* ---------- POST /api/register ---------- */
async function register(request, env) {
  const early = preflight(request, env); if (early) return early;
  let body;
  try { body = await readJson(request); } catch (e) { return json({ error: e.message }, 400); }

  // Hidden field that people never see. Bots fill it in. Pretend it worked and store nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true });

  const name = cleanName(body.name), email = cleanEmail(body.email), phone = cleanPhone(body.phone);
  if (!name) return json({ error: 'Enter your full name (2 to 80 characters).' }, 400);
  if (!email) return json({ error: 'Enter a valid email address.' }, 400);
  if (!phone) return json({ error: 'Enter a valid phone number, with the country code if it is not an Indian number.' }, 400);
  if (body.acceptTerms !== true || body.confirmAge !== true) {
    return json({ error: 'Please confirm you are 18 or older and accept the Terms of Use and Privacy Policy.' }, 400);
  }
  if (body.consentVersion !== CONSENT_VERSION) {
    return json({ error: 'The registration notice was updated. Please reload the page and try again.' }, 409);
  }
  const promo = body.promo === true ? 1 : 0;
  const now = new Date().toISOString();

  try {
    await ensureSchema(env.DB);
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    // Someone who is already registered just gets access again. Their saved consent is not changed here.
    if (existing) return json({ ok: true, existing: true });

    const log = (event) => env.DB.prepare(
      'INSERT INTO consent_log (user_id, event, consent_version, created_at) VALUES ((SELECT id FROM users WHERE email = ?), ?, ?, ?)'
    ).bind(email, event, CONSENT_VERSION, now);
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO users (name, email, phone, accepted_terms, consent_promo, consent_version, consent_at, promo_changed_at, created_at) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)'
      ).bind(name, email, phone, promo, CONSENT_VERSION, now, promo ? now : null, now),
      log('register'),
      ...(promo ? [log('promo_opt_in')] : []),
    ]);
    return json({ ok: true, existing: false });
  } catch (e) {
    if (String(e && e.message).includes('UNIQUE')) return json({ ok: true, existing: true });
    console.error('register failed', e && e.message);
    return json({ error: 'We could not save your registration. Please try again.' }, 500);
  }
}

/* ---------- POST /api/optout ---------- */
// Withdraws consent for promotional messages. Always answers the same way, so the response
// never reveals whether an email address is registered.
async function optout(request, env) {
  const early = preflight(request, env); if (early) return early;
  let body;
  try { body = await readJson(request); } catch (e) { return json({ error: e.message }, 400); }
  if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true });
  const email = cleanEmail(body.email);
  if (!email) return json({ error: 'Enter a valid email address.' }, 400);
  const now = new Date().toISOString();
  try {
    await ensureSchema(env.DB);
    const res = await env.DB.prepare('UPDATE users SET consent_promo = 0, promo_changed_at = ? WHERE email = ? AND consent_promo = 1').bind(now, email).run();
    if (res && res.meta && res.meta.changes > 0) {
      await env.DB.prepare(
        'INSERT INTO consent_log (user_id, event, consent_version, created_at) VALUES ((SELECT id FROM users WHERE email = ?), ?, ?, ?)'
      ).bind(email, 'promo_opt_out', CONSENT_VERSION, now).run();
    }
    return json({ ok: true });
  } catch (e) {
    console.error('optout failed', e && e.message);
    return json({ error: 'We could not process this. Please try again or email us.' }, 500);
  }
}

/* ---------- POST /api/request ---------- */
const REQUEST_TYPES = ['access', 'correction', 'erasure', 'grievance'];
async function privacyRequest(request, env) {
  const early = preflight(request, env); if (early) return early;
  let body;
  try { body = await readJson(request, 6000); } catch (e) { return json({ error: e.message }, 400); }
  if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true });
  const email = cleanEmail(body.email), type = String(body.type || ''), message = cleanText(body.message, 1500);
  if (!email) return json({ error: 'Enter a valid email address.' }, 400);
  if (!REQUEST_TYPES.includes(type)) return json({ error: 'Choose the kind of request.' }, 400);
  if (type !== 'access' && type !== 'erasure' && message.length < 5) return json({ error: 'Add a short description of your request.' }, 400);
  try {
    await ensureSchema(env.DB);
    await env.DB.prepare("INSERT INTO privacy_requests (email, type, message, status, created_at) VALUES (?, ?, ?, 'open', ?)")
      .bind(email, type, message || null, new Date().toISOString()).run();
    return json({ ok: true });
  } catch (e) {
    console.error('request failed', e && e.message);
    return json({ error: 'We could not save your request. Please try again or email us.' }, 500);
  }
}

/* ---------- POST /api/event ---------- */
// Records that a registered person finished using a tool today. Used to tell returning users from
// one-time users. Always answers ok, so it never reveals whether an email is registered.
const TOOL_IDS = ['image', 'pdf', 'merge', 'compress', 'word', 'scan', 'imagepdf', 'office', 'split', 'rotate', 'protect', 'unlock', 'excel', 'sign', 'jpg', 'summarize'];
async function toolEvent(request, env) {
  const early = preflight(request, env); if (early) return early;
  let body;
  try { body = await readJson(request, 1024); } catch (e) { return json({ error: e.message }, 400); }
  const email = cleanEmail(body.email), tool = String(body.tool || '');
  if (!email || !TOOL_IDS.includes(tool)) return json({ ok: true });
  const now = new Date().toISOString();
  try {
    await ensureSchema(env.DB);
    await env.DB.prepare(
      'INSERT OR IGNORE INTO tool_events (user_id, tool, day, created_at) SELECT id, ?, ?, ? FROM users WHERE email = ?'
    ).bind(tool, now.slice(0, 10), now, email).run();
  } catch (e) { console.error('event failed', e && e.message); }
  return json({ ok: true });
}

/* ---------- router ---------- */
const ROUTES = { '/api/register': register, '/api/optout': optout, '/api/request': privacyRequest, '/api/event': toolEvent };

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const handler = ROUTES[pathname];
    if (handler) {
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { allow: 'POST' });
      return handler(request, env);
    }
    if (pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
    return env.ASSETS.fetch(request);
  },
};
