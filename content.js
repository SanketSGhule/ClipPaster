// ClipPaster Content Script
(function () {
  'use strict';

  // Default configuration
  let config = {
    modifier: 'ctrl_shift', // 'ctrl_shift', 'alt_shift', 'ctrl_alt', 'alt'
    keyScope: 'numpad_only', // 'numpad_only' or 'both'
    showToast: true,
    snippets: {
      '0': { label: 'Quick Note', text: 'Will reply soon!' },
      '1': { label: 'Greeting', text: 'Hello, hope you are having a great day!' },
      '2': { label: 'Email Signature', text: 'Best regards,\n[Your Name]' },
      '3': { label: 'Sample Link', text: 'https://example.com' },
      '4': { label: '', text: '' },
      '5': { label: '', text: '' },
      '6': { label: '', text: '' },
      '7': { label: '', text: '' },
      '8': { label: '', text: '' },
      '9': { label: '', text: '' }
    }
  };

  // Load config from chrome.storage.sync
  function loadConfig() {
    if (!chrome.storage || !chrome.storage.sync) return;

    chrome.storage.sync.get(null, (data) => {
      if (chrome.runtime.lastError) {
        console.warn('ClipPaster storage load error:', chrome.runtime.lastError);
        return;
      }

      if (data && data.clipPasterConfig) {
        config = Object.assign(config, data.clipPasterConfig);
      } else {
        // Check for legacy format (e.g. data['Numpad1'] = 'some text')
        let hasLegacy = false;
        for (let i = 0; i <= 9; i++) {
          const oldKey = 'Numpad' + i;
          if (data && data[oldKey]) {
            hasLegacy = true;
            config.snippets[i.toString()] = {
              label: 'Slot ' + i,
              text: data[oldKey]
            };
          }
        }
        if (hasLegacy) {
          chrome.storage.sync.set({ clipPasterConfig: config });
        }
      }
    });
  }

  loadConfig();

  // Listen for configuration updates live
  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes.clipPasterConfig) {
        config = Object.assign(config, changes.clipPasterConfig.newValue || {});
      }
    });
  }

  // Check if modifier matches the current keydown event
  function isModifierMatch(e, modSetting) {
    switch (modSetting) {
      case 'ctrl_shift':
        return e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey;
      case 'alt_shift':
        return e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey;
      case 'ctrl_alt':
        return e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey;
      case 'alt':
        return e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey;
      default:
        return e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey;
    }
  }

  // Extract digit 0-9 from event based on numpad / top-row setting
  function extractDigit(e, scope) {
    // Check Numpad code: e.code is "Numpad0" - "Numpad9"
    if (e.code && e.code.startsWith('Numpad')) {
      const num = e.code.replace('Numpad', '');
      if (/^[0-9]$/.test(num)) return num;
    }

    // Check location for Numpad fallback
    if (e.location === 3 && /^[0-9]$/.test(e.key)) {
      return e.key;
    }

    // If both Numpad and Top-row numbers are enabled
    if (scope === 'both') {
      if (e.code && e.code.startsWith('Digit')) {
        const num = e.code.replace('Digit', '');
        if (/^[0-9]$/.test(num)) return num;
      }
      if (/^[0-9]$/.test(e.key)) {
        return e.key;
      }
    }

    return null;
  }

  // Find the deepest focused editable element (handles shadow roots)
  function getDeepActiveEditable() {
    let el = document.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) {
      el = el.shadowRoot.activeElement;
    }

    if (!el) return null;

    if (el.isContentEditable) return el;

    if (el.tagName === 'TEXTAREA') {
      return (!el.readOnly && !el.disabled) ? el : null;
    }

    if (el.tagName === 'INPUT') {
      const nonText = ['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'];
      const type = (el.type || 'text').toLowerCase();
      if (!nonText.includes(type) && !el.readOnly && !el.disabled) {
        return el;
      }
    }

    // Check if focused element is inside a contenteditable parent
    if (typeof el.closest === 'function') {
      const editableParent = el.closest('[contenteditable="true"]');
      if (editableParent) return editableParent;
    }

    return null;
  }

  // Insert text at cursor reliably
  function insertTextAtCursor(target, text) {
    if (!target) return false;

    // Method 1: document.execCommand('insertText')
    // Best because it integrates natively with browser undo/redo (Ctrl+Z)
    // and fires synthetic events for React/Vue/Angular
    let executed = false;
    try {
      executed = document.execCommand('insertText', false, text);
    } catch (e) {
      executed = false;
    }

    if (executed) return true;

    // Method 2: Standard input / textarea fallback
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      try {
        const start = target.selectionStart;
        const end = target.selectionEnd;

        if (typeof start === 'number' && typeof end === 'number') {
          if (typeof target.setRangeText === 'function') {
            target.setRangeText(text, start, end, 'end');
          } else {
            const original = target.value || '';
            target.value = original.slice(0, start) + text + original.slice(end);
            target.selectionStart = target.selectionEnd = start + text.length;
          }
        } else {
          target.value = (target.value || '') + text;
        }

        // Dispatch input and change events so framework data bindings react
        target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } catch (err) {
        // Fallback for types that forbid selection (e.g. number/email)
        target.value = (target.value || '') + text;
        target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }

    // Method 3: Rich-text contenteditable fallback
    if (target.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
        target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
        return true;
      }
    }

    return false;
  }

  // Display unobtrusive toast notification
  let toastTimer = null;
  function showToast(title, preview) {
    if (!config.showToast) return;

    let toast = document.getElementById('clippaster-feedback-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'clippaster-feedback-toast';
      toast.setAttribute('style', `
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        background: #1e1b4b !important;
        color: #ffffff !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
        padding: 10px 16px !important;
        border-radius: 8px !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3) !important;
        border: 1px solid #4338ca !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        pointer-events: none !important;
        opacity: 0 !important;
        transform: translateY(8px) scale(0.96) !important;
        transition: opacity 0.18s ease, transform 0.18s ease !important;
      `);
      document.body.appendChild(toast);
    }

    const cleanPreview = preview.length > 40 ? preview.substring(0, 37) + '...' : preview;
    toast.innerHTML = `
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;"></span>
      <strong>ClipPaster:</strong> Pasted [${title || 'Snippet'}] <span style="opacity:0.75;font-size:12px;">"${cleanPreview.replace(/[\n\r]/g, ' ')}"</span>
    `;

    // Trigger animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0) scale(1)';
    });

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px) scale(0.96)';
    }, 1600);
  }

  // Keyboard listener on window (using capture to intercept reliably)
  window.addEventListener('keydown', (e) => {
    // Fast check: is any modifier active?
    if (!e.ctrlKey && !e.altKey) return;

    if (!isModifierMatch(e, config.modifier)) return;

    const digit = extractDigit(e, config.keyScope);
    if (digit === null) return;

    const target = getDeepActiveEditable();
    if (!target) return;

    const snippetItem = config.snippets && config.snippets[digit];
    if (!snippetItem || !snippetItem.text) {
      // Empty slot - do not interfere with standard typing unless preferred
      return;
    }

    // Prevent Chrome / browser default actions and stop page handlers
    e.preventDefault();
    e.stopPropagation();

    // Insert text
    const success = insertTextAtCursor(target, snippetItem.text);
    if (success) {
      showToast(snippetItem.label || ('Slot ' + digit), snippetItem.text);
    }
  }, true);

})();
