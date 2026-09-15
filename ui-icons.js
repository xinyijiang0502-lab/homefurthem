// Translate existing visual emoji into the site's small hand-drawn SVG family.
// Text nodes are replaced without rewriting volunteer data or interactive elements.
(() => {
  const art = {
    support: '<path d="M12 10C4 6 7 1 10 4l2 2 2-2c4-3 6 3-2 6Z" fill="currentColor" fill-opacity=".15"/><path d="m3 15 4-3 5 1c3 0 3 3 0 3H9m-6 4 5-2 7 1 6-6c1-2-1-3-3-1l-3 3M3 14v7"/>',
    heart: '<path d="M12 20C8 17 2 13 3 8c1-5 6-5 9-1 3-4 8-4 9 1 1 5-5 9-9 12Z"/>',
    'heart-filled': '<path d="M12 20C8 17 2 13 3 8c1-5 6-5 9-1 3-4 8-4 9 1 1 5-5 9-9 12Z" fill="currentColor" fill-opacity=".24"/>',
    paw: '<path d="M7 16c0-3 3-3 4-6 1-2 3-1 4 1s5 4 3 7c-1 2-4 0-6 1s-5 0-5-3Z" fill="currentColor" fill-opacity=".18"/><ellipse cx="5" cy="10" rx="2" ry="3" transform="rotate(-25 5 10)"/><ellipse cx="10" cy="5" rx="2" ry="3"/><ellipse cx="16" cy="6" rx="2" ry="3" transform="rotate(15 16 6)"/><ellipse cx="21" cy="11" rx="1.6" ry="2.5" transform="rotate(25 21 11)"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 5-6 13 0 18 6-5 6-13 0-18Z"/><path d="M5 6q7 4 14 0M5 18q7-4 14 0" opacity=".5"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v5m8-5v5M4 11h16"/><path d="m9 15 3 3 3-3"/>',
    ruler: '<path d="m3 15 12-12 6 6L9 21Z"/><path d="m12 6 3 3m-7 1 2 2m-6 2 3 3"/>',
    scissors: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="m9 9 11 11M9 15 20 4"/>',
    check: '<path d="M20 11v2a8 8 0 1 1-4-8"/><path d="m8 11 4 4 9-11"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9 9c0-5 8-4 6 0-1 2-3 2-3 5m0 3v.2"/>',
    pause: '<circle cx="12" cy="12" r="9"/><path d="M9 8v8m6-8v8"/>',
    link: '<path d="m10 8 3-3c6-5 11 2 6 6l-3 3M14 16l-3 3c-6 5-11-2-6-6l3-3m0 8 8-8"/>',
    search: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
    pin: '<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    arrow: '<path d="M3 12h17m-6-6 6 6-6 6"/>',
    diagonal: '<path d="M5 19 19 5M5 5h14v14"/>',
    bone: '<path d="m8 8 8 8c5-2 7 3 3 4-1 4-6 2-4-2L7 10c-5 2-7-3-3-4 1-4 6-2 4 2Z" fill="currentColor" fill-opacity=".12"/>',
    home: '<path d="m3 10 9-8 9 8M6 8v13h12V8M10 21v-7h4v7"/><path d="M9 8c-2-3-4 0 0 2 4-2 2-5 0-2Z" fill="currentColor" fill-opacity=".3"/>',
    flower: '<path d="M12 21V11m0 6c-4 0-6-2-6-5 4 0 6 2 6 5Zm0 2c4 0 6-2 6-5-4 0-6 2-6 5Z"/><path d="M7 3 10 5l2-3 2 3 3-2v5c0 6-10 6-10 0Z" fill="currentColor" fill-opacity=".18"/>',
    dog: '<path d="m5 10-2-8 7 6m9 2 2-8-7 6M5 10c3-5 11-5 14 0v6c0 8-14 8-14 0Z"/><path d="M9 12v1m6-1v1m-5 4 2 1 2-1m-2 1v2"/>',
  };
  const tokens = {
    '💝': 'support', '❤': 'heart-filled', '🤍': 'heart', '🐾': 'paw',
    '🌐': 'globe', '🌍': 'globe', '🎂': 'calendar', '📏': 'ruler',
    '✂': 'scissors', '✅': 'check', '⏳': 'clock', '❔': 'question',
    '⏸': 'pause', '🔗': 'link', '🔍': 'search', '📍': 'pin',
    '👉': 'arrow', '🦴': 'bone', '🤝': 'home', '🌷': 'flower', '🐶': 'dog',
    '🇨🇳': 'CN', '🇺🇸': 'US', '🇫🇷': 'FR', '🇩🇰': 'DK', '↗': 'diagonal',
  };
  const countries = {
    CN: ['中国', 'China'], US: ['美国', 'United States'],
    FR: ['法国', 'France'], DK: ['丹麦', 'Denmark'],
  };
  const pattern = new RegExp(`(${Object.keys(tokens).join('|')})\\uFE0F?`, 'gu');
  const excluded = 'script, style, textarea, input, svg, .ui-icon, [contenteditable]';

  function makeIcon(token) {
    const name = tokens[token.replace(/\uFE0F/g, '')];
    const el = document.createElement('span');
    el.className = 'ui-icon';
    el.dataset.icon = name;
    const zh = document.documentElement.lang.startsWith('zh');
    if (countries[name]) {
      el.classList.add('country-stamp');
      el.textContent = name;
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', countries[name][zh ? 0 : 1]);
    } else {
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">${art[name]}</svg>`;
      if (name === 'calendar' || name === 'ruler') {
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', name === 'calendar' ? (zh ? '年龄' : 'Age') : (zh ? '体型' : 'Size'));
      } else {
        el.setAttribute('aria-hidden', 'true');
      }
    }
    return el;
  }

  function decorateText(node) {
    if (!node.isConnected || !node.parentElement || node.parentElement.closest(excluded)) return;
    const text = node.nodeValue;
    const matches = [...text.matchAll(pattern)];
    if (!matches.length) return;
    const fragment = document.createDocumentFragment();
    let offset = 0;
    for (const match of matches) {
      fragment.append(document.createTextNode(text.slice(offset, match.index)), makeIcon(match[0]));
      offset = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(text.slice(offset)));
    node.replaceWith(fragment);
  }

  function decorate(root) {
    if (root.nodeType === Node.TEXT_NODE) return decorateText(root);
    if (root.nodeType !== Node.ELEMENT_NODE || root.closest(excluded)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(decorateText);
  }

  document.addEventListener('DOMContentLoaded', () => {
    decorate(document.body);
    // Search, favorites, language and modal content can introduce fresh text.
    const observer = new MutationObserver(records => {
      observer.disconnect();
      const roots = new Set();
      for (const record of records) {
        if (record.type === 'characterData') roots.add(record.target);
        else record.addedNodes.forEach(node => roots.add(node));
      }
      roots.forEach(node => { if (node.isConnected) decorate(node); });
      observe();
    });
    const observe = () => observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    observe();
  });
})();
