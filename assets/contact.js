/* Contact page: send a message, or copy the email address. */
(function () {
'use strict';
var form = document.getElementById('contactForm'); if (!form) return;
var out = form.querySelector('.msg');
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  var btn = form.querySelector('button[type=submit]'); btn.disabled = true;
  out.hidden = false; out.className = 'msg'; out.textContent = 'Sending…';
  try {
    var body = { email: form.elements.email.value.trim(), type: 'contact', message: form.elements.message.value.trim(), website: form.elements.website.value };
    var r = await fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    var data = {}; try { data = await r.json(); } catch (x) { /* ignore */ }
    if (!r.ok) throw new Error(data.error || 'Something went wrong. Please email us instead.');
    out.className = 'msg ok'; out.textContent = 'Thank you. We have your message and will reply to your email address.'; form.reset();
  } catch (err) { out.className = 'msg err'; out.textContent = err.message; }
  finally { btn.disabled = false; }
});
var copy = document.getElementById('copyEmail');
if (copy) copy.addEventListener('click', function () {
  var addr = copy.getAttribute('data-email');
  function done(t) { copy.textContent = t; setTimeout(function () { copy.textContent = 'Copy email address'; }, 2500); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr).then(function () { done('Copied'); }, function () { done(addr); });
  else done(addr);
});
})();
