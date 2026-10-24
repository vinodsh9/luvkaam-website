# Google Play app (no coding)

The site is now an installable app (manifest, icons, service worker).
1. Wait until luvkaam.com shows the new version. Open it in Chrome on a phone: the menu should offer "Install app".
2. Go to pwabuilder.com, enter https://luvkaam.com and press Start. It should show the app as ready.
3. Choose Package for stores > Android > Google Play. Download the zip. It holds the .aab file, a signing key and a "signing key info" file. KEEP the key and its password safe; you need them for every update.
4. Create a Google Play developer account (one-time fee of USD 25) at play.google.com/console.
5. Create the app, upload the .aab, add the privacy policy link https://luvkaam.com/privacy, screenshots and a short description.
6. PWABuilder also gives a `assetlinks.json` line. Put it at /.well-known/assetlinks.json on the site (ask Claude to add it) so the app opens without a browser bar.
