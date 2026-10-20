# Luvkaam website update (Cloudflare Pages + Supabase)

This package contains the updated homepage, your logo assets, a Cloudflare Pages registration Function, a Supabase SQL schema, and setup instructions.

## Included changes
- Added a required Privacy Notice / Terms acknowledgement.
- Added separate optional promotional consent, unchecked by default.
- Registration request now sends both choices and a consent version to `/api/register`.
- Added a Supabase-backed Cloudflare Pages Function that creates an email invitation, saves the profile and stores consent events.
- Expanded the Privacy Notice and Terms draft.
- Preserved the existing browser-based image OCR and selectable-PDF-text demos.
- Kept unimplemented tools labelled as planned; this package does not falsely claim every listed tool is functional.

## Important limitation
The registration database will **not** work until you configure Supabase and Cloudflare environment secrets. Do not collect real user data until setup and tests are complete. The policy text is a draft and is not legal advice.

## Deploy to your existing Cloudflare Pages project
1. Download/unzip this package.
2. In your local copy of the GitHub repository `vinodsh9/luvkaam-website`, replace `index.html` and add/replace:
   - `luvkaam-icon.png`
   - `luvkaam-logo.png`
   - `functions/api/register.js`
   - `supabase/schema.sql`
3. Commit and push the files to the branch Cloudflare Pages deploys from (usually `main`). Keep the `functions` folder at the repository root, alongside `index.html`.
4. Open Supabase and create a project for Luvkaam.
5. In Supabase → SQL Editor, run the contents of `supabase/schema.sql`.
6. In Supabase → Project Settings / API, copy the project URL and the **service_role** key. The service-role key is highly privileged: never put it in `index.html`, a public repository, a screenshot, or this chat.
7. In Cloudflare → Workers & Pages → `luvkaam-website` → Settings → Variables and Secrets, add these as **encrypted secrets**:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service_role key
8. In Supabase Authentication settings, configure email delivery, the site URL `https://luvkaam.com`, and allowed redirect URLs. Verify invitation emails arrive and links return to your site.
9. Wait for Cloudflare to deploy. Test with a test email address you control.

## Test checklist
- Register with valid test details and privacy acknowledgement.
- Confirm that promotional consent starts unchecked.
- Submit with marketing consent unchecked; inspect `consent_events` and confirm `promotional_communications.granted = false`.
- Repeat with a different test email and marketing consent checked; confirm it is saved as true.
- Confirm the invitation email arrives and its link works.
- Try invalid email, invalid phone, missing privacy acknowledgement, and duplicate email.
- Confirm no service-role key appears in page source or browser network responses.
- Test the live site on mobile and desktop.

## Before public launch (not yet completed by this package)
- Add Cloudflare Turnstile and server-side rate limiting to the registration endpoint.
- Implement account login, account recovery, consent withdrawal, profile editing and account deletion workflows.
- Configure real support/grievance contact details and document/file retention rules.
- Review all third-party libraries and any future AI providers; disclose data sharing accurately.
- Add malware/file validation, file-size/page limits, abuse controls, security headers, monitoring and backup procedures.
- Have the final privacy notice and terms reviewed for India and the jurisdictions you target.
- Do not send promotions to users who have not opted in; maintain an unsubscribe/withdrawal mechanism.

## Tools status
The current homepage's working tools are image OCR (JPG/PNG/WEBP) and extraction of selectable text from PDFs. Many other cards are deliberately labelled coming soon because they need real implementations and tests. The registration backend in this package is a starting point, not a complete production account system.


## Registration consent defaults
- The required Privacy Notice / Terms acknowledgement is checked by default, and the form requires it to remain checked.
- Promotional consent is a separate optional checkbox and is **unchecked by default**. Users can register without opting in.
- On successful registration, the server writes both the promotional choice (`granted: true/false`) and its capture timestamp (`captured_at`) to `public.consent_events`, alongside the notice/version and source. Do not treat a false choice as marketing permission.


## SEO content update
The homepage title, meta description, social share metadata, visible headings and explanatory copy have been improved with natural phrases related to the working tools (image-to-text converter, OCR online, PDF-to-text converter, extract text from PDF) and accurately described planned PDF conversions. Keywords are integrated into readable content rather than added as a keyword list. Planned tools remain labelled as not yet available.
