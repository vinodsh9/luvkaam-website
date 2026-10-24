// Generates one landing page per tool from index.html (header, footer, register modal) and updates
// sitemap.xml and the tool-page link list on the home page. Run:  node build-pages.js
const fs = require('fs'), path = require('path');
const SITE = fs.existsSync(path.join(__dirname, 'index.html')) ? __dirname : path.join(__dirname, 'site');
const ORIGIN = 'https://luvkaam.com', TODAY = new Date().toISOString().slice(0, 10);
const index = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');

const T = [
  { slug: 'merge-pdf', tool: 'merge', name: 'Merge PDF', title: 'Merge PDF Online Free | Combine PDF Files | Luvkaam',
    desc: 'Merge PDF files online for free. Combine several PDFs into one document in your browser. Your files are never uploaded.',
    h1: 'Merge PDF files into one', intro: 'Combine two or more PDF files into a single document. Put them in the order you want, then download the merged PDF. Everything runs on your device.',
    steps: ['Choose or drop two or more PDF files.', 'Drag the order using the arrows so the files are in the right sequence.', 'Press Merge and download your combined PDF.'],
    faq: [['How do I combine PDF files for free?', 'Add your PDFs, arrange them in order and press Merge. Luvkaam is free after a one-time registration.'], ['Are my PDFs uploaded to a server?', 'No. The merge happens inside your browser, so your documents stay on your device.'], ['Can I merge password-protected PDFs?', 'Not directly. Unlock each file first with the Unlock PDF tool, then merge.']] },
  { slug: 'compress-pdf', tool: 'compress', name: 'Compress PDF', title: 'Compress PDF Online Free | Reduce PDF Size | Luvkaam',
    desc: 'Compress PDF files online for free and reduce PDF size for email or form uploads. Runs in your browser; your file is never uploaded.',
    h1: 'Compress PDF to a smaller size', intro: 'Make a PDF smaller so it is easy to email or upload to a form that has a size limit. Choose how much to shrink it, then download the result.',
    steps: ['Choose or drop your PDF.', 'Pick lossless, balanced or smallest.', 'Press Compress and compare the new size before you download.'],
    faq: [['How do I reduce the size of a PDF?', 'Pick Balanced or Smallest. These turn pages into lower resolution pictures, which cuts size a lot for scans and photos.'], ['Will the text stay selectable?', 'Lossless keeps text selectable but may save little. Balanced and Smallest turn pages into images, so text is no longer selectable.'], ['Why did my file not get much smaller?', 'A PDF that is already compressed or is mostly text has little to save. Try the Smallest setting.']] },
  { slug: 'jpg-to-pdf', tool: 'imagepdf', name: 'JPG to PDF', title: 'JPG to PDF Converter Free | Image to PDF Online | Luvkaam',
    desc: 'Convert JPG, PNG and WEBP images to a PDF online for free. Put several pictures in one PDF, in your browser, with no upload.',
    h1: 'Convert JPG to PDF', intro: 'Turn one or many pictures into a single PDF. Choose the page size and margin, set the order, and download. Works with JPG, PNG, WEBP, GIF and BMP.',
    steps: ['Choose or drop your images.', 'Set page size (A4, Letter or same as image) and margin.', 'Press Create PDF and download.'],
    faq: [['How do I convert a JPG to PDF?', 'Add the image, choose a page size and press Create PDF. You can add many images to make one multi-page PDF.'], ['Can I convert PNG or WEBP too?', 'Yes. JPG, PNG, WEBP, GIF and BMP images are supported.'], ['Does the picture quality drop?', 'JPG images are placed as they are. Other formats are converted without extra loss of quality.']] },
  { slug: 'image-to-text', tool: 'image', name: 'Image to Text', title: 'Image to Text Converter | Free OCR Online (English & Hindi) | Luvkaam',
    desc: 'Extract text from an image with free online OCR. Reads English and Hindi from JPG, PNG and WEBP pictures, in your browser.',
    h1: 'Image to text (OCR)', intro: 'Read printed text out of a photo or screenshot and copy it. Supports English and Hindi. Sharp, straight, well lit pictures give the best result.',
    steps: ['Choose or drop a picture.', 'Pick the language: English, Hindi or both.', 'Press Extract text, then copy or download the text.'],
    faq: [['Does it read Hindi?', 'Yes. Choose Hindi, or Hindi and English mixed, before you extract. Printed Devanagari text works best.'], ['Why is my result wrong?', 'Blur, tilt, shadows and handwriting reduce accuracy. Use a sharper, straighter photo.'], ['Is my image uploaded?', 'No. Recognition runs in your browser. Only the open-source OCR code is downloaded.']] },
  { slug: 'hindi-ocr', tool: 'image', lang: 'hin', name: 'Hindi OCR', title: 'Hindi OCR Online Free | Image to Hindi Text (हिन्दी) | Luvkaam',
    desc: 'Free Hindi OCR online. Extract Hindi (Devanagari) text from images and scanned PDFs, in your browser with no upload.',
    h1: 'Hindi OCR: image to Hindi text', intro: 'Extract Hindi (देवनागरी) text from a photo or screenshot. Works for printed text. For a scanned PDF use the OCR scanned PDF tool and choose Hindi.',
    steps: ['Choose or drop a picture with Hindi text.', 'Language is already set to Hindi. Change it to mixed Hindi and English if the page has both.', 'Press Extract text, then copy or download the result.'],
    faq: [['Can I get Hindi text from a scanned PDF?', 'Yes. Use <a class="inl" href="/ocr-scanned-pdf">OCR scanned PDF</a> and choose Hindi.'], ['How accurate is Hindi OCR?', 'Clear printed text is read well. Handwriting, low light, small print and stylised fonts reduce accuracy, so always check the result.'], ['Can I save the Hindi text as a Word file?', 'Yes. Copy the text into <a class="inl" href="/text-to-word-pdf">Text to Word &amp; PDF</a> and save as Word. Use Word, not PDF, for Hindi.']] },
  { slug: 'ocr-scanned-pdf', tool: 'scan', name: 'OCR Scanned PDF', title: 'OCR Scanned PDF Online Free | Scanned PDF to Text | Luvkaam',
    desc: 'OCR a scanned PDF online for free and get the text. English and Hindi supported. Runs in your browser; the file is not uploaded.',
    h1: 'OCR a scanned PDF', intro: 'A scanned PDF is a set of pictures, so its words cannot be copied. This tool reads each page and gives you the text. English and Hindi are supported, up to 20 pages at a time.',
    steps: ['Choose or drop your scanned PDF.', 'Pick the language printed on the pages.', 'Press Read scanned pages and copy or download the text.'],
    faq: [['How many pages can I read at once?', 'The first 20 pages. Use Split PDF to read a longer document in parts.'], ['Can it read Hindi scans?', 'Yes. Choose Hindi, or Hindi and English mixed.'], ['Why is it slow?', 'Recognition runs on your own device, so a long document on a slow phone takes longer.']] },
  { slug: 'pdf-to-text', tool: 'pdf', name: 'PDF to Text', title: 'PDF to Text Converter Free | Extract Text from PDF | Luvkaam',
    desc: 'Extract text from a PDF online for free. Copy or download the text. Runs in your browser; your PDF is not uploaded.',
    h1: 'PDF to text', intro: 'Copy the text out of a PDF that has selectable words. For scanned PDFs use the OCR tool instead.',
    steps: ['Choose or drop your PDF.', 'Press Extract text.', 'Copy the text or download it as a .txt file.'],
    faq: [['Why do I get no text?', 'The PDF is probably a scan. Use <a class="inl" href="/ocr-scanned-pdf">OCR scanned PDF</a>.'], ['Is the layout kept?', 'No. You get the words, not the page design.'], ['Is my PDF uploaded?', 'No. It is read inside your browser.']] },
  { slug: 'pdf-to-word', tool: 'word', name: 'PDF to Word', title: 'PDF to Word Converter Free | PDF to DOCX Online | Luvkaam',
    desc: 'Convert a PDF to an editable Word (.docx) file online for free. Keeps the text, in your browser, with no upload.',
    h1: 'PDF to Word', intro: 'Get the text of a PDF into an editable Word document. This keeps the text only, not columns, tables or pictures.',
    steps: ['Choose or drop a PDF with selectable text.', 'Press Convert.', 'Download the .docx and edit it in Word.'],
    faq: [['Will the layout stay the same?', 'No. Only the text and paragraphs are carried over. Tables and images are not.'], ['What about scanned PDFs?', 'Run <a class="inl" href="/ocr-scanned-pdf">OCR scanned PDF</a> first, then paste the text into <a class="inl" href="/text-to-word-pdf">Text to Word &amp; PDF</a>.'], ['Is it free?', 'Yes, after a one-time registration.']] },
  { slug: 'pdf-to-excel', tool: 'excel', name: 'PDF to Excel', title: 'PDF to Excel Converter Free | Extract Tables | Luvkaam',
    desc: 'Extract simple tables from a PDF into Excel or CSV for free. Runs in your browser; your PDF is not uploaded.',
    h1: 'PDF to Excel', intro: 'Pull simple tables out of a text-based PDF into an Excel (.xlsx) or CSV file. Complex layouts are a best guess, so check the result.',
    steps: ['Choose or drop a PDF that has a table.', 'Press Convert.', 'Download the Excel or CSV file.'],
    faq: [['Does it work on scanned PDFs?', 'No. The PDF needs selectable text.'], ['Why are my columns wrong?', 'Merged cells and complex layouts confuse column detection. Simple grid tables work best.'], ['Is my file uploaded?', 'No.']] },
  { slug: 'split-pdf', tool: 'split', name: 'Split PDF', title: 'Split PDF Online Free | Extract PDF Pages | Luvkaam',
    desc: 'Split a PDF or extract pages online for free. Choose ranges, every page, or pull pages into one file. No upload.',
    h1: 'Split PDF and extract pages', intro: 'Cut a PDF into parts or pull out only the pages you need. Enter ranges like 1-3, 5, 8-10.',
    steps: ['Choose or drop a PDF.', 'Choose ranges, extract pages or every page.', 'Press Split and download the files (a ZIP when there are several).'],
    faq: [['How do I extract one page from a PDF?', 'Choose "Extract pages into one file" and type the page number.'], ['Can I split into single pages?', 'Yes, choose "Every page".'], ['Are my pages uploaded?', 'No. Splitting happens in your browser.']] },
  { slug: 'rotate-pdf', tool: 'rotate', name: 'Rotate PDF', title: 'Rotate PDF Pages Online Free | Luvkaam',
    desc: 'Rotate PDF pages online for free. Fix sideways or upside-down pages in your browser. No upload.',
    h1: 'Rotate PDF pages', intro: 'Turn sideways or upside-down pages the right way up and save a new PDF.',
    steps: ['Choose or drop a PDF.', 'Pick the angle and, if you like, which pages to turn.', 'Press Rotate and download.'],
    faq: [['Can I rotate only some pages?', 'Yes. Choose the pages in the options.'], ['Does rotation change quality?', 'No. The page content is not re-drawn.'], ['Is my file uploaded?', 'No.']] },
  { slug: 'protect-pdf', tool: 'protect', name: 'Protect PDF', title: 'Protect PDF with Password Online Free | Luvkaam',
    desc: 'Add a password to a PDF online for free. Encrypts the file in your browser; it is never uploaded.',
    h1: 'Protect a PDF with a password', intro: 'Add a password so only people who know it can open the PDF. Encryption happens on your device.',
    steps: ['Choose or drop a PDF.', 'Type a password and keep it safe.', 'Press Protect and download the locked PDF.'],
    faq: [['What if I forget the password?', 'It cannot be recovered. Keep a safe copy of the password.'], ['Is the password sent anywhere?', 'No. It stays in your browser.'], ['What encryption is used?', 'AES-256 PDF encryption.']] },
  { slug: 'unlock-pdf', tool: 'unlock', name: 'Unlock PDF', title: 'Unlock PDF Online Free | Remove PDF Password | Luvkaam',
    desc: 'Remove the password from a PDF you own, online for free. Runs in your browser with no upload.',
    h1: 'Unlock a PDF', intro: 'Remove the password from a PDF you are allowed to open. You must know the current password. This tool does not break or guess passwords.',
    steps: ['Choose or drop the protected PDF.', 'Enter its current password and tick the box that you own the file.', 'Press Unlock and download the open copy.'],
    faq: [['Can you crack a password I forgot?', 'No. You need to know the password.'], ['Is it legal?', 'Only use it on files you own or have permission to open.'], ['Is my file uploaded?', 'No.']] },
  { slug: 'sign-pdf', tool: 'sign', name: 'Sign PDF', title: 'Sign PDF Online Free | Add Signature to PDF | Luvkaam',
    desc: 'Sign a PDF online for free. Draw or type your signature and place it on any page. No upload.',
    h1: 'Sign a PDF', intro: 'Draw or type your signature and place it on the page. This adds an image of your signature, not a certificate-based digital signature.',
    steps: ['Choose or drop a PDF.', 'Draw or type your signature.', 'Click the page to place it and download.'],
    faq: [['Is this a legally valid signature?', 'It is an image of your signature. Whether it is accepted depends on who receives the document.'], ['Can I sign on a phone?', 'Yes. Draw with your finger.'], ['Is my file uploaded?', 'No.']] },
  { slug: 'text-to-word-pdf', tool: 'office', name: 'Text to Word & PDF', title: 'Text to Word and PDF Online Free | Luvkaam',
    desc: 'Type or paste text and save it as a Word (.docx) or PDF file online for free. Hindi works in Word.',
    h1: 'Text to Word and PDF', intro: 'Paste or type text and save it as a Word document or a PDF. Use Word for Hindi and other non-Latin scripts.',
    steps: ['Type or paste your text.', 'Choose Word or PDF.', 'Press Create and download.'],
    faq: [['Does it support Hindi?', 'Yes in Word. The PDF option supports English and other Latin letters only.'], ['Is my text stored?', 'No. It stays in your browser.'], ['Can I add a title?', 'Yes, there is a title field.']] },
  { slug: 'convert-images', tool: 'jpg', name: 'Convert Images', title: 'JPG to PNG, PNG to JPG, WEBP Converter Free | Luvkaam',
    desc: 'Convert images between JPG, PNG and WEBP online for free. Runs in your browser with no upload.',
    h1: 'Convert images: JPG, PNG, WEBP', intro: 'Change the format of one or many pictures. Choose the output format and download.',
    steps: ['Choose or drop your images.', 'Pick JPG, PNG or WEBP.', 'Press Convert images and download the results.'],
    faq: [['How do I convert PNG to JPG?', 'Add the PNG, choose JPG and press Convert.'], ['Is quality lost?', 'JPG and WEBP are lossy. PNG is not.'], ['Is my picture uploaded?', 'No.']] },
  { slug: 'summarize-pdf', tool: 'summarize', name: 'Summarise PDF', title: 'Summarize PDF Online Free | Key Sentences from a PDF | Luvkaam',
    desc: 'Summarise a PDF or pasted text online for free. Picks the most important sentences; not AI-written. Runs in your browser.',
    h1: 'Summarise a PDF', intro: 'Pick the most important sentences from a PDF or pasted text to get a short overview. It selects existing sentences and is not generative AI.',
    steps: ['Choose a PDF or paste text.', 'Choose how many key points you want.', 'Press Summarise and copy the result.'],
    faq: [['Is this AI?', 'No. It ranks sentences by importance and shows the best ones. It does not write new text.'], ['Does it work on scans?', 'Run OCR first, then paste the text.'], ['Is my file uploaded?', 'No.']] },
];

// Optional extra content added by the SEO employee and approved by a person: content/extras.json
//   { "faqs": { "merge-pdf": [["Question?", "Answer html"]] },
//     "guides": [{ "slug": "x", "title": "...", "desc": "...", "h1": "...", "body": "<p>html</p>", "tools": ["merge-pdf"] }] }
let EXTRAS = { faqs: {}, guides: [] };
try { EXTRAS = Object.assign(EXTRAS, JSON.parse(fs.readFileSync(path.join(SITE, 'content', 'extras.json'), 'utf8'))); } catch (e) { /* none yet */ }
for (const t of T) { const more = (EXTRAS.faqs || {})[t.slug]; if (more && more.length) t.faq = t.faq.concat(more.filter((f) => !t.faq.some((x) => x[0] === f[0]))); }

const dropFrom = (s, a) => s.slice(s.indexOf(a));
const footer = dropFrom(index, '<div class="shell"><footer>').replace(/<\/body>[\s\S]*$/, '');
const modalAndScripts = footer.slice(footer.indexOf('<div class="toast"'));
const footerHtml = footer.slice(0, footer.indexOf('<div class="toast"'))
  .replace(/href="#tools"/g, 'href="/#tools"').replace(/href="#how-it-works"/g, 'href="/#how-it-works"').replace(/href="#faq"/g, 'href="/#faq"').replace(/href="#top"/g, 'href="/"');
const esc = (s) => s.replace(/&(?!amp;)/g, '&amp;');
const links = T.map((t) => `<a class="inl" href="/${t.slug}">${esc(t.name)}</a>`).join(' · ');

for (const t of T) {
  const url = `${ORIGIN}/${t.slug}`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: t.name, url, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', description: t.desc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map((f) => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&') } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Luvkaam', item: ORIGIN + '/' }, { '@type': 'ListItem', position: 2, name: t.name, item: url }] },
  ].map((o) => `<script type="application/ld+json">\n${JSON.stringify(o).replace(/</g, '\\u003c')}\n</script>`).join('\n');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fffaf7"><link rel="icon" type="image/png" href="/luvkaam-icon.png"><link rel="apple-touch-icon" href="/luvkaam-icon.png"><title>${esc(t.title)}</title>
<meta name="description" content="${t.desc.replace(/"/g, '&quot;')}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:url" content="${url}"><meta property="og:title" content="${esc(t.title)}"><meta property="og:description" content="${t.desc.replace(/"/g, '&quot;')}"><meta property="og:site_name" content="Luvkaam"><meta property="og:image" content="${ORIGIN}/luvkaam-logo.png"><meta name="twitter:card" content="summary">
${ld}
<link rel="stylesheet" href="/assets/site.css">
</head><body data-tool-page="${t.tool}"${t.lang ? ` data-lang="${t.lang}"` : ''}>
<a class="skip" href="#main">Skip to main content</a>
<noscript><div class="shell">Luvkaam needs JavaScript to run its tools in your browser. Please turn JavaScript on and reload the page.</div></noscript>
<header><div class="shell"><nav aria-label="Main"><a href="/" class="brand"><span class="mark"><img src="/luvkaam-icon.png" alt="" width="40" height="40"></span>Luvkaam</a><div class="navlinks"><a href="/#tools">All tools</a><a href="#workspace">Use this tool</a><a href="#faq">FAQ</a></div><div class="navright"><button class="btn primary" id="openRegister" type="button">Register free <span aria-hidden="true">↗</span></button></div></nav></div></header>
<main id="main"><div id="top"></div>
<section class="section shell"><nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:10px"><a class="inl" href="/">Luvkaam</a> › ${esc(t.name)}</nav><h1 style="font-size:clamp(30px,5vw,48px);line-height:1.1;margin:0 0 12px">${esc(t.h1)}</h1><p class="hero-copy">${t.intro}</p><p style="font-size:13px;margin-top:10px"><b>Free after one-time registration.</b> Your files are processed in your browser and never uploaded.</p></section>

<section class="shell workbench" id="workspace" aria-labelledby="wsTitle"><div class="workcopy"><div class="kicker">YOUR WORKSPACE</div><h2 id="wsTitle">${esc(t.name)}</h2><p id="toolBlurb">Add your file and get your result.</p><a href="/#tools" style="font-size:12px;font-weight:800;color:#d6ceff">Browse all tools ↗</a><div class="note">Your files are processed on your device and are not uploaded to Luvkaam. Registration is needed once per browser.</div></div><div class="panel" id="panel"></div></section>

<section class="section shell" id="how"><div class="sectionhead"><div><div class="kicker">Simple by design</div><h2>How to use ${esc(t.name)}</h2></div></div><ol style="line-height:1.8;padding-left:20px">${t.steps.map((s) => `<li>${s}</li>`).join('')}</ol></section>

<section class="section shell" id="faq"><div class="sectionhead"><div><div class="kicker">Helpful answers</div><h2>Frequently asked questions</h2></div></div><div class="faq-list">
${t.faq.map((f) => `<details><summary>${esc(f[0])}</summary><p>${f[1]}</p></details>`).join('\n')}
</div></section>

<section class="section shell" id="other-tools"><div class="sectionhead"><div><div class="kicker">More tools</div><h2>Other Luvkaam tools</h2></div></div><p style="line-height:2">${links}</p></section>
</main>
${footerHtml}${modalAndScripts}</body></html>
`;
  fs.writeFileSync(path.join(SITE, t.slug + '.html'), html);
}

// Home page: list of tool pages (idempotent block)
let home = index.replace(/<!--toolpages-->[\s\S]*?<!--\/toolpages-->/, '');
const block = `<!--toolpages--><section class="section shell" id="tool-pages"><div class="sectionhead"><div><div class="kicker">Tool pages</div><h2>Pick a tool by name</h2><p>Each tool has its own page with a how-to and answers to common questions.</p></div></div><p style="line-height:2">${links}</p></section><!--/toolpages-->\n`;
home = home.replace('<section class="section shell" id="more-tools">', block + '<section class="section shell" id="more-tools">');
fs.writeFileSync(path.join(SITE, 'index.html'), home);

// Contact page
{
  const url = ORIGIN + '/contact';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fffaf7"><link rel="icon" type="image/png" href="/luvkaam-icon.png"><title>Contact Luvkaam</title>
<meta name="description" content="Contact Luvkaam: send a message or email hello@luvkaam.com. For privacy requests use the Privacy page.">
<meta name="robots" content="index,follow"><link rel="canonical" href="${url}">
<link rel="stylesheet" href="/assets/site.css">
</head><body>
<a class="skip" href="#main">Skip to main content</a>
<header><div class="shell"><nav aria-label="Main"><a href="/" class="brand"><span class="mark"><img src="/luvkaam-icon.png" alt="" width="40" height="40"></span>Luvkaam</a><div class="navlinks"><a href="/#tools">All tools</a></div><div class="navright"><button class="btn primary" id="openRegister" type="button">Register free <span aria-hidden="true">↗</span></button></div></nav></div></header>
<main id="main"><article class="section shell legal-page"><div class="kicker">Contact</div><h1>Contact Luvkaam</h1>
<p>Questions, feedback or a problem with a tool? Write to us and we will reply to the email address you give.</p>
<p><b>Email:</b> <!--email_off--><a class="inl" href="mailto:hello@luvkaam.com">hello@luvkaam.com</a><!--/email_off--> <button class="btn softbtn" id="copyEmail" type="button" data-email="hello@luvkaam.com">Copy email address</button></p>
<h2>Or send a message here</h2>
<form class="legal-form" id="contactForm" novalidate>
<div><label for="cEmail">Your email address</label><input id="cEmail" name="email" type="email" required autocomplete="email" maxlength="254"></div>
<div><label for="cMsg">Your message</label><textarea id="cMsg" name="message" required rows="5" maxlength="1500"></textarea></div>
<div class="hp" aria-hidden="true"><label for="cWebsite">Leave this field empty</label><input id="cWebsite" name="website" type="text" tabindex="-1" autocomplete="off"></div>
<button class="btn primary" type="submit">Send message</button>
<div class="msg" role="status" hidden></div>
</form>
<p style="margin-top:18px">To access, correct or erase your data, or to stop promotional messages, use the <a class="inl" href="/privacy#rights">Privacy page</a>.</p>
</article></main>
${footerHtml}${modalAndScripts.replace('</body>', '')}<script src="/assets/contact.js"></script></body></html>
`;
  fs.writeFileSync(path.join(SITE, 'contact.html'), html);
}

// Guide articles
const guides = (EXTRAS.guides || []).filter((g) => /^[a-z0-9-]+$/.test(g.slug || ''));
if (guides.length) fs.mkdirSync(path.join(SITE, 'guides'), { recursive: true });
for (const g of guides) {
  const url = `${ORIGIN}/guides/${g.slug}`;
  const rel = (g.tools || []).map((s) => T.find((t) => t.slug === s)).filter(Boolean);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: g.h1 || g.title, description: g.desc, mainEntityOfPage: url, dateModified: g.date || TODAY, author: { '@type': 'Organization', name: 'Luvkaam' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Luvkaam', item: ORIGIN + '/' }, { '@type': 'ListItem', position: 2, name: g.h1 || g.title, item: url }] },
  ].map((o) => `<script type="application/ld+json">\n${JSON.stringify(o).replace(/</g, '\\u003c')}\n</script>`).join('\n');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fffaf7"><link rel="icon" type="image/png" href="/luvkaam-icon.png"><title>${esc(g.title)}</title>
<meta name="description" content="${(g.desc || '').replace(/"/g, '&quot;')}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:url" content="${url}"><meta property="og:title" content="${esc(g.title)}"><meta property="og:description" content="${(g.desc || '').replace(/"/g, '&quot;')}"><meta property="og:site_name" content="Luvkaam"><meta property="og:image" content="${ORIGIN}/luvkaam-logo.png"><meta name="twitter:card" content="summary">
${ld}
<link rel="stylesheet" href="/assets/site.css">
</head><body>
<a class="skip" href="#main">Skip to main content</a>
<header><div class="shell"><nav aria-label="Main"><a href="/" class="brand"><span class="mark"><img src="/luvkaam-icon.png" alt="" width="40" height="40"></span>Luvkaam</a><div class="navlinks"><a href="/#tools">All tools</a></div><div class="navright"><button class="btn primary" id="openRegister" type="button">Register free <span aria-hidden="true">↗</span></button></div></nav></div></header>
<main id="main"><article class="section shell" style="max-width:760px"><nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:10px"><a class="inl" href="/">Luvkaam</a> › Guides</nav><h1 style="font-size:clamp(28px,5vw,42px);line-height:1.15;margin:0 0 14px">${esc(g.h1 || g.title)}</h1><div style="line-height:1.75">${g.body}</div>
${rel.length ? `<p style="margin-top:22px"><b>Try it now:</b> ${rel.map((t) => `<a class="inl" href="/${t.slug}">${esc(t.name)}</a>`).join(' · ')}</p>` : ''}</article></main>
${footerHtml}${modalAndScripts}</body></html>
`;
  fs.writeFileSync(path.join(SITE, 'guides', g.slug + '.html'), html);
}
if (guides.length) {
  const glinks = guides.map((g) => `<a class="inl" href="/guides/${g.slug}">${esc(g.h1 || g.title)}</a>`).join(' · ');
  home = home.replace('<!--/toolpages-->', `<section class="section shell" id="guide-list"><div class="sectionhead"><div><div class="kicker">Guides</div><h2>How-to guides</h2></div></div><p style="line-height:2">${glinks}</p></section><!--/toolpages-->`);
  fs.writeFileSync(path.join(SITE, 'index.html'), home);
}

// Sitemap
const urls = [['', 'daily'], ...T.map((t) => [t.slug, 'weekly']), ...guides.map((g) => ['guides/' + g.slug, 'monthly']), ['contact', 'yearly'], ['privacy', 'yearly'], ['terms', 'yearly']];
fs.writeFileSync(path.join(SITE, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${ORIGIN}/${u[0]}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log('pages:', T.length);
