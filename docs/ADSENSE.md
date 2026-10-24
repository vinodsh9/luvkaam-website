# AdSense checklist (for Vinod)

Done in the site: guides (19), richer tool pages, About, Contact, Privacy with ads wording, 3 free uses/day on 4 tools, sitemap.

Do these after deploying:
1. Search Console: add luvkaam.com, submit https://luvkaam.com/sitemap.xml.
2. Wait until Google has indexed the guides (a few weeks is normal). Add more guides over time.
3. Apply at adsense.google.com with luvkaam.com.
4. After approval, Google gives a line like `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`. Put it in a file called `ads.txt` in the site root.
5. Paste Google's script tag into the page head, and add these to the CSP in `_headers`:
   script-src: https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net
   frame-src: https://googleads.g.doubleclick.net https://tpc.googlesyndication.com
   img-src / connect-src: https://*.googlesyndication.com https://*.doubleclick.net
6. In AdSense > Privacy & messaging, turn on Google's own consent message for EEA/UK.
7. Do not click your own ads.
