const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  }
});

const validEmail = (s) => typeof s === "string" &&
  s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const validPhone = (s) => typeof s === "string" &&
  s.length <= 30 && (s.match(/\d/g) || []).length >= 8 &&
  (s.match(/\d/g) || []).length <= 15 && /^[+0-9() .-]+$/.test(s.trim());

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Registration is not configured yet. Please try again later." }, 503);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "Send registration details as JSON." }, 415);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid request body." }, 400); }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const privacyConsent = body.privacyConsent === true;
  const marketingConsent = body.marketingConsent === true;
  const consentVersion = typeof body.consentVersion === "string"
    ? body.consentVersion.slice(0, 40) : "unknown";

  if (name.length < 2 || name.length > 80) return json({ error: "Enter a name between 2 and 80 characters." }, 400);
  if (!validEmail(email)) return json({ error: "Enter a valid email address." }, 400);
  if (!validPhone(phone)) return json({ error: "Enter a valid phone number." }, 400);
  if (!privacyConsent) return json({ error: "Please acknowledge the Privacy Notice and Terms of Use." }, 400);

  // Configure Cloudflare Turnstile and rate limiting before public production launch.
  const base = env.SUPABASE_URL.replace(/\/+$/, "");
  const headers = {
    "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
    "authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json"
  };

  try {
    // Supabase sends an invitation/verification email. Configure email delivery and redirect URL in Supabase.
    const inviteResponse = await fetch(`${base}/auth/v1/invite?redirect_to=${encodeURIComponent("https://luvkaam.com/")}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        data: { full_name: name, phone_number: phone }
      })
    });
    const inviteBody = await inviteResponse.json().catch(() => ({}));
    if (!inviteResponse.ok) {
      // Do not disclose whether a particular email address already has an account.
      if (inviteResponse.status === 422 || inviteResponse.status === 409) {
        return json({ error: "We could not create a new invitation for these details. If you already registered, check your email or use the account recovery flow." }, 409);
      }
      return json({ error: "We could not start registration. Please try again later." }, 502);
    }

    const userId = inviteBody?.id || inviteBody?.user?.id;
    if (!userId) return json({ error: "Registration could not be confirmed. Please try again later." }, 502);

    const profileResponse = await fetch(`${base}/rest/v1/profiles`, {
      method: "POST",
      headers: { ...headers, "prefer": "return=minimal" },
      body: JSON.stringify({
        id: userId,
        full_name: name,
        email,
        phone,
        phone_verified: false
      })
    });
    if (!profileResponse.ok) {
      // The invitation may already exist, so do not claim that a complete profile was saved.
      return json({ error: "An account invitation was created, but we could not save the profile. Please contact support before registering again." }, 502);
    }

    const now = new Date().toISOString();
    const consentRows = [
      {
        user_id: userId,
        consent_type: "privacy_notice_acknowledgement",
        granted: true,
        consent_version: consentVersion,
        captured_at: now,
        source: "website_registration"
      },
      {
        user_id: userId,
        consent_type: "promotional_communications",
        granted: marketingConsent,
        consent_version: consentVersion,
        captured_at: now,
        source: "website_registration"
      }
    ];
    const consentResponse = await fetch(`${base}/rest/v1/consent_events`, {
      method: "POST",
      headers: { ...headers, "prefer": "return=minimal" },
      body: JSON.stringify(consentRows)
    });
    if (!consentResponse.ok) {
      return json({ error: "The account invitation was started, but we could not save consent records. Please contact support before proceeding." }, 502);
    }

    return json({
      ok: true,
      message: "Check your email for the account invitation and follow its instructions to finish setting up your account."
    }, 201);
  } catch {
    return json({ error: "Registration service is temporarily unavailable. Please try again later." }, 503);
  }
}

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  return json({ error: "Method not allowed." }, 405);
}
