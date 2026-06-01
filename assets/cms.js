/**
 * Edusky CMS — JSON Content Injector
 * Loads JSON content and injects into HTML elements with data-field attributes.
 * Content is repo-managed (trusted source) — rendered as text for safety.
 */
(function() {
  'use strict';

  const page = document.body.dataset.content;
  if (!page) return;

  async function loadContent() {
    try {
      const res = await fetch('content/' + page + '.json');
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      inject(data);
    } catch (e) {
      console.log('CMS: using fallback content (' + e.message + ')');
    }
  }

  function inject(data) {
    document.querySelectorAll('[data-field]').forEach(el => {
      const path = el.dataset.field;
      const val = getPath(data, path);
      if (val == null) return;

      if (el.tagName === 'IMG' || el.dataset.type === 'image') {
        el.src = val;
      } else if (el.tagName === 'VIDEO' || el.dataset.type === 'video') {
        const source = el.querySelector('source');
        if (source) source.src = val;
        else el.src = val;
      } else {
        el.textContent = val;
      }
    });

    // Handle repeatable items (lists)
    document.querySelectorAll('[data-list]').forEach(container => {
      const path = container.dataset.list;
      const items = getPath(data, path);
      if (!Array.isArray(items)) return;
      const template = container.querySelector('[data-item]');
      if (!template) return;

      container.querySelectorAll('[data-item]').forEach((el, i) => {
        if (i > 0) el.remove();
      });

      items.forEach((item) => {
        const clone = template.cloneNode(true);
        clone.removeAttribute('data-item');
        clone.querySelectorAll('[data-field]').forEach(el => {
          const subPath = el.dataset.field;
          const val = getPath(item, subPath);
          if (val == null) return;
          if (el.tagName === 'IMG' || el.dataset.type === 'image') {
            el.src = val;
          } else {
            el.textContent = val;
          }
        });
        container.appendChild(clone);
      });
    });
  }

  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
