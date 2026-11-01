// ClipPaster Quick Popup
(function () {
  'use strict';

  const shortcutPill = document.getElementById('active-shortcut-pill');
  const slotsList = document.getElementById('slots-list');
  const openOptionsBtn = document.getElementById('open-options-btn');
  const fullManagerBtn = document.getElementById('full-manager-btn');

  function getModifierLabel(mod) {
    switch (mod) {
      case 'ctrl_shift': return 'Ctrl + Shift';
      case 'alt_shift': return 'Alt + Shift';
      case 'ctrl_alt': return 'Ctrl + Alt';
      case 'alt': return 'Alt';
      default: return 'Ctrl + Shift';
    }
  }

  function openOptions() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  }

  openOptionsBtn.addEventListener('click', openOptions);
  fullManagerBtn.addEventListener('click', openOptions);

  // Load and render
  chrome.storage.sync.get('clipPasterConfig', (data) => {
    const config = (data && data.clipPasterConfig) || {
      modifier: 'ctrl_shift',
      keyScope: 'numpad_only',
      snippets: {}
    };

    const modText = getModifierLabel(config.modifier);
    const keyHint = config.keyScope === 'numpad_only' ? 'Num 0-9' : '0-9';
    shortcutPill.textContent = `${modText} + [${keyHint}]`;

    slotsList.innerHTML = '';

    for (let i = 0; i <= 9; i++) {
      const digit = i.toString();
      const snippet = (config.snippets && config.snippets[digit]) || { label: '', text: '' };
      const hasContent = Boolean(snippet.text && snippet.text.trim());

      const item = document.createElement('div');
      item.className = 'slot-item';

      const labelText = snippet.label || `Slot ${digit}`;
      const previewText = hasContent
        ? snippet.text.replace(/[\n\r]/g, ' ')
        : 'Empty slot';

      item.innerHTML = `
        <div class="slot-item-left">
          <div class="slot-num">${digit}</div>
          <div class="slot-info">
            <div class="slot-label">${escapeHtml(labelText)}</div>
            <div class="slot-preview" style="${hasContent ? '' : 'font-style: italic; opacity: 0.6;'}">
              ${escapeHtml(previewText)}
            </div>
          </div>
        </div>
        ${hasContent ? `<button class="copy-mini-btn" data-slot="${digit}">Copy</button>` : ''}
      `;

      if (hasContent) {
        const copyBtn = item.querySelector('.copy-mini-btn');
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(snippet.text).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1000);
          });
        });
      }

      slotsList.appendChild(item);
    }
  });

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
