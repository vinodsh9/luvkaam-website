# Luvkaam repair package — deployment notes

This package includes a defensive registration-popup fix in `index.html`, the existing Cloudflare Pages Function at `functions/api/register.js`, and the Supabase schema at `supabase/schema.sql`.

## Deploy
1. Extract this ZIP. Open the `luvkaam-website` folder.
2. Upload/commit the contents of that folder to the root of the GitHub repository connected to the **Cloudflare Pages** project (do not upload the outer folder as a nested directory).
3. Confirm the deployed Pages build includes `index.html` and the `functions/api/register.js` file.
4. In Supabase SQL Editor, run `supabase/schema.sql` once if it has not already been run.
5. In Cloudflare Pages project settings, add server-side environment variables/secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (the service role key must never be placed in browser HTML). Redeploy after setting them.
6. Test `https://luvkaam.com` in a private/incognito window. Test that Register free opens first, then submit a test registration and verify the row in Supabase.

## Important limits
- This package cannot change the live website until you deploy it to the connected Cloudflare Pages project.
- The popup fix is a defensive client-side fix; it cannot guarantee success if the site serves a different build or a separate JavaScript error prevents the page from loading.
- Registration submissions require the Supabase schema and Cloudflare Pages secrets above. A ZIP alone cannot configure your accounts.
- The current OCR/image-to-text and selectable-text PDF extraction tools are browser-side demos. A general AI backend is **not included or connected** in this package. AI summarization and other tools requiring a model/API will not work until an AI provider/backend is implemented and configured. Do not advertise those as working yet.
- Phone ownership verification via SMS OTP is not implemented.
