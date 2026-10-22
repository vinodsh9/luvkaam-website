# Luvkaam website

Static site (16 browser-based PDF/image tools) plus a small Cloudflare Worker (`_worker.js`) that stores registrations in a D1 database.

- `index.html`, `privacy.html`, `terms.html`, `assets/` : the site
- `_worker.js` : `/api/register`, `/api/optout`, `/api/request` (needs D1 binding `DB`; tables are created automatically)
- `wrangler.toml` : Workers config (assets + D1 binding)
- `.assetsignore` : keeps server files from being served publicly

## Deploy (Workers, the project type this repo is set up for)
1. Cloudflare dashboard > Workers & Pages > Storage & Databases > D1 > Create database `luvkaam-db`. Copy its Database ID.
2. In `wrangler.toml`, add under `[[d1_databases]]`:  `database_id = "paste-id-here"`  and commit.
3. The push redeploys. No Supabase keys are needed any more; you can delete them.

## If your project is Cloudflare Pages instead
Workers & Pages > your project > Settings > Bindings > Add > D1 database, variable name `DB`, choose `luvkaam-db`, then redeploy.

## Reading registrations
D1 > luvkaam-db > Console: `SELECT name, email, phone, consent_promo, created_at FROM users;`
Promotional messages: only to rows where `consent_promo = 1`.

## Before going live
Fill the `todo` placeholders in `privacy.html` and `terms.html` (business name, address, grievance officer).

## Tool pages
Each tool has its own page (e.g. `/merge-pdf`, `/hindi-ocr`). They are generated from `index.html` by `build-pages.js` in the source package; edit the generator, not the pages.

## Hindi OCR
OCR language data (`assets/ocr/eng.traineddata.gz`, `hin.traineddata.gz`) is served from this site, not a CDN.

## Usage records (for returning-user measurement)
When a registered person finishes using a tool, the site stores the tool name and date in `tool_events` (never the file). The Privacy Policy and the signup notice say so (version 2026-10-22).
To erase one person, delete their usage rows first, then the rest:
```sql
DELETE FROM tool_events WHERE user_id = (SELECT id FROM users WHERE email = 'person@example.com');
DELETE FROM consent_log WHERE user_id = (SELECT id FROM users WHERE email = 'person@example.com');
DELETE FROM users WHERE email = 'person@example.com';
```

## Page generator
`node build-pages.js` rebuilds the tool pages, guides (from `content/extras.json`) and the sitemap. The Luvi employee uses it; you can also run it yourself.
