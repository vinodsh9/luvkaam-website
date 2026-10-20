# Luvkaam Cloudflare upload package

## Important deployment note
This package fixes the malformed registration JavaScript and includes the browser-side Image-to-Text OCR and PDF-to-Text extraction already present in the site. Other cards that are marked as planned are not implemented in this build.

Cloudflare Pages drag-and-drop static upload alone does not reliably deploy a Pages Functions backend. This package includes `_worker.js` for Cloudflare Pages advanced mode. Deploy using a Pages project that supports a `_worker.js` file, or deploy with Wrangler from a local terminal.

## Deploy
1. Extract this ZIP. The contents inside this folder (`index.html`, assets, `_worker.js`, `_routes.json`, `schema.sql`) are the site output.
2. In Cloudflare Pages, use the project connected to `luvkaam.com`. For a Wrangler deployment, create `wrangler.toml` with:

```toml
name = "luvkaam-website"
compatibility_date = "2026-10-20"
main = "_worker.js"

[assets]
directory = "."
binding = "ASSETS"
run_worker_first = true
```

3. From this folder, run `npx wrangler deploy`. (Requires Node.js and Cloudflare login.)
4. In Cloudflare Worker settings, add secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never place the service-role key in HTML or a public repository.
5. In Supabase SQL Editor, run `schema.sql`. Confirm the profiles table has `id`, `full_name`, `email`, `phone`, `created_at`; confirm consent_events has `user_id`, `consent_type`, `granted`, `consent_version`, `source`, `captured_at`. If the schema differs, adapt it before going live.
6. Configure Supabase Auth email invitation/verification settings and test with a unique email. Verify the row in Supabase tables; a popup message alone is not proof of storage.

## Included working tools
- Image to Text: JPG/PNG/WEBP using Tesseract.js loaded from a CDN.
- PDF to Text: text-based PDFs using PDF.js loaded from a CDN. Scanned-PDF OCR is not included.

## Honest limitations
- This package does not implement AI summarisation or all cards (PDF merge/compress, PDF-to-Word/Excel, etc.). Do not advertise planned cards as working.
- Browser OCR/PDF tools need internet access to load their libraries.
- Registration cannot save to Supabase until secrets, schema and Auth are configured. Test deployment and inspect Supabase records before treating registration as production-ready.
