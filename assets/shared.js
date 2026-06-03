/**
 * Edusky — Shared Component Loader
 * Loads _data/settings.json and injects shared elements:
 * nav brand, footer contact/social, WhatsApp link, copyright.
 * Runs on all pages. CloudCannon edits settings.json, changes propagate everywhere.
 */
(function() {
  'use strict';

  async function loadSettings() {
    try {
      var res = await fetch('_data/settings.json');
      if (!res.ok) throw new Error(res.status);
      var s = await res.json();
      injectSettings(s);
    } catch (e) {
      console.log('Shared: using fallback (' + e.message + ')');
    }
  }

  function injectSettings(s) {
    setText('[data-shared="brand_name"]', s.brand_name || s.site_name);
    setText('[data-shared="footer_brand"]', s.site_name);
    setText('[data-shared="footer_tagline"]', getF(s, 'footer.tagline') || s.tagline);

    var addr = s.address;
    if (addr) {
      setHtml('[data-shared="footer_address"]', addr.line1, addr.line2, addr.line3);
    }

    if (s.contact) {
      setText('[data-shared="footer_phone_text"]', s.contact.phone_display);
      setAttr('[data-shared="footer_phone"]', 'href', 'tel:' + s.contact.phone_raw);
      setText('[data-shared="footer_whatsapp_text"]', s.contact.whatsapp_display);
      setAttr('[data-shared="footer_whatsapp"]', 'href', 'https://wa.me/' + s.contact.whatsapp_raw);
      setText('[data-shared="footer_email_text"]', s.contact.email);
      setAttr('[data-shared="footer_email"]', 'href', 'mailto:' + s.contact.email);
      var msg = encodeURIComponent(s.contact.whatsapp_message || 'Hi');
      setAttr('[data-shared="whatsapp_link"]', 'href', 'https://wa.me/' + s.contact.whatsapp_raw + '?text=' + msg);
    }

    if (s.social) {
      setAttr('[data-shared="social_facebook"]', 'href', s.social.facebook);
      setAttr('[data-shared="social_instagram"]', 'href', s.social.instagram);
      setAttr('[data-shared="social_tiktok"]', 'href', s.social.tiktok);
      setAttr('[data-shared="social_youtube"]', 'href', s.social.youtube);
    }

    setText('[data-shared="footer_copyright"]', getF(s, 'footer.copyright') || ('© 2026 ' + (s.site_name || '') + '. All rights reserved.'));
    setText('[data-shared="footer_built"]', getF(s, 'footer.built_with'));
    setText('[data-shared="smips_code"]', s.smips_code);
  }

  function getF(obj, path) {
    return path.split('.').reduce(function(o, k) { return o && o[k]; }, obj);
  }

  function setText(sel, val) {
    if (val == null) return;
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) els[i].textContent = val;
  }

  function setAttr(sel, attr, val) {
    if (!val) return;
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) els[i].setAttribute(attr, val);
  }

  function setHtml(sel, line1, line2, line3) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      el.textContent = '';
      var parts = [line1, line2, line3].filter(Boolean);
      for (var j = 0; j < parts.length; j++) {
        if (j > 0) el.appendChild(document.createElement('br'));
        el.appendChild(document.createTextNode(parts[j]));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSettings);
  } else {
    loadSettings();
  }
})();
