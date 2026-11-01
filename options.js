// ClipPaster Options & Management Page Logic
(function () {
  'use strict';

  // State
  let config = {
    modifier: 'ctrl_shift',
    keyScope: 'numpad_only',
    showToast: true,
    snippets: {
      '0': { label: 'Quick Note', text: 'Will reply in a few minutes!' },
      '1': { label: 'Greeting', text: 'Hello! Hope you are having a wonderful day.' },
      '2': { label: 'Email Signature', text: 'Best regards,\n[Your Name]\n[Your Title / Contact]' },
      '3': { label: 'Meeting Link', text: 'https://meet.google.com/xyz-abcd-efg' },
      '4': { label: 'Support Response', text: 'Thank you for reaching out! We are currently investigating this issue and will get back to you shortly.' },
      '5': { label: 'Bug Report Template', text: 'Steps to Reproduce:\n1. \n2. \nExpected:\nActual:' },
      '6': { label: '', text: '' },
      '7': { label: '', text: '' },
      '8': { label: '', text: '' },
      '9': { label: '', text: '' }
    }
  };

  const samplePresets = {
    '0': { label: 'Quick Note', text: 'Will reply in a few minutes!' },
    '1': { label: 'Greeting', text: 'Hello! Hope you are having a wonderful day.' },
    '2': { label: 'Email Signature', text: 'Best regards,\n[Your Name]\n[Your Title / Contact]' },
    '3': { label: 'Meeting Link', text: 'https://meet.google.com/xyz-abcd-efg' },
    '4': { label: 'Support Response', text: 'Thank you for reaching out! We are currently investigating this issue and will get back to you shortly.' },
    '5': { label: 'Bug Report Template', text: 'Steps to Reproduce:\n1. \n2. \nExpected:\nActual:' },
    '6': { label: 'Address', text: '123 Innovation Drive, Tech Park, Suite 400' },
    '7': { label: 'Personal Bio', text: 'Passionate developer and technology enthusiast with a focus on web performance and user experience.' },
    '8': { label: 'Standard Disclaimer', text: 'This message and any attachments are confidential and intended solely for the addressee.' },
    '9': { label: 'Code Snippet', text: 'console.log("ClipPaster Test:", { timestamp: new Date().toISOString() });' }
  };

  let saveTimeout = null;

  // DOM Elements
  const modifierSelect = document.getElementById('modifier-select');
  const keyScopeSelect = document.getElementById('keyscope-select');
  const toastToggle = document.getElementById('toast-toggle');
  const snippetsContainer = document.getElementById('snippets-container');
  const saveStatus = document.getElementById('save-status');
  const saveBtn = document.getElementById('save-btn');
  const saveBottomBtn = document.getElementById('save-bottom-btn');
  const modDisplay = document.getElementById('current-mod-display');
  const sandboxHint = document.getElementById('sandbox-shortcut-hint');
  const sandboxInput = document.getElementById('sandbox-input');
  const clearSandboxBtn = document.getElementById('clear-sandbox');
  const exportBtn = document.getElementById('export-btn');
  const importInput = document.getElementById('import-input');
  const loadSamplesBtn = document.getElementById('load-samples-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Friendly modifier names
  function getModifierLabel(mod) {
    switch (mod) {
      case 'ctrl_shift': return 'Ctrl + Shift';
      case 'alt_shift': return 'Alt + Shift';
      case 'ctrl_alt': return 'Ctrl + Alt';
      case 'alt': return 'Alt';
      default: return 'Ctrl + Shift';
    }
  }

  function getSlotHotkeyString(digit) {
    const mod = getModifierLabel(config.modifier);
    const keyType = config.keyScope === 'numpad_only' ? `Num ${digit}` : `Num ${digit} / ${digit}`;
    return `${mod} + ${keyType}`;
  }

  // Update all badges and hints across the page
  function updateShortcutLabels() {
    const modText = getModifierLabel(config.modifier);
    if (modDisplay) modDisplay.textContent = modText;
    if (sandboxHint) {
      const sampleKey = config.keyScope === 'numpad_only' ? 'Num 1' : '1';
      sandboxHint.textContent = `${modText} + ${sampleKey}`;
    }

    for (let i = 0; i <= 9; i++) {
      const badge = document.getElementById(`hotkey-badge-${i}`);
      if (badge) {
        badge.textContent = getSlotHotkeyString(i);
      }
    }
  }

  // Render the 10 snippet cards
  function renderSnippetCards() {
    snippetsContainer.innerHTML = '';

    for (let i = 0; i <= 9; i++) {
      const digit = i.toString();
      const snippet = (config.snippets && config.snippets[digit]) || { label: '', text: '' };

      const card = document.createElement('div');
      card.className = 'snippet-card';
      card.dataset.slot = digit;

      card.innerHTML = `
        <div class="snippet-card-top">
          <div class="slot-badge-group">
            <span class="slot-number-pill">${digit}</span>
            <span id="hotkey-badge-${digit}" class="slot-hotkey-badge">${getSlotHotkeyString(digit)}</span>
          </div>
          <div class="snippet-card-actions">
            <button class="btn-icon copy-slot-btn" data-slot="${digit}" title="Copy this snippet to clipboard">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
            <button class="btn-icon clear-slot-btn" data-slot="${digit}" title="Clear this slot">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Clear
            </button>
          </div>
        </div>

        <input 
          type="text" 
          id="label-${digit}" 
          class="snippet-label-input" 
          placeholder="Slot ${digit} Label / Nickname (e.g. Work Email, Signature)"
          value="${escapeHtml(snippet.label || '')}"
        >

        <textarea 
          id="text-${digit}" 
          class="snippet-textarea" 
          placeholder="Type or paste the text chunk for Slot ${digit} here..."
        >${escapeHtml(snippet.text || '')}</textarea>

        <div class="snippet-card-footer">
          <span id="char-count-${digit}">${(snippet.text || '').length} characters</span>
          <span style="opacity:0.7;">Slot ${digit}</span>
        </div>
      `;

      snippetsContainer.appendChild(card);

      // Event listeners for this card
      const labelInput = card.querySelector(`#label-${digit}`);
      const textArea = card.querySelector(`#text-${digit}`);
      const charCounter = card.querySelector(`#char-count-${digit}`);

      labelInput.addEventListener('input', () => {
        config.snippets[digit].label = labelInput.value;
        triggerAutoSave();
      });

      textArea.addEventListener('input', () => {
        config.snippets[digit].text = textArea.value;
        charCounter.textContent = `${textArea.value.length} characters`;
        triggerAutoSave();
      });

      // Quick Copy button
      card.querySelector('.copy-slot-btn').addEventListener('click', (e) => {
        const textToCopy = config.snippets[digit].text || '';
        if (!textToCopy) {
          flashBtnText(e.currentTarget, 'Empty!');
          return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
          flashBtnText(e.currentTarget, 'Copied!');
        });
      });

      // Clear button
      card.querySelector('.clear-slot-btn').addEventListener('click', () => {
        labelInput.value = '';
        textArea.value = '';
        charCounter.textContent = '0 characters';
        config.snippets[digit].label = '';
        config.snippets[digit].text = '';
        triggerAutoSave();
      });
    }
  }

  function flashBtnText(btn, tempText) {
    const original = btn.innerHTML;
    btn.textContent = tempText;
    setTimeout(() => {
      btn.innerHTML = original;
    }, 1200);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Load config from Chrome Storage Sync
  function loadSettings() {
    chrome.storage.sync.get(null, (data) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to load settings:', chrome.runtime.lastError);
        return;
      }

      if (data && data.clipPasterConfig) {
        config = Object.assign(config, data.clipPasterConfig);
      } else {
        // Migrate legacy flat keys if present (e.g. data['Numpad1'])
        let foundLegacy = false;
        for (let i = 0; i <= 9; i++) {
          const oldKey = 'Numpad' + i;
          if (data && data[oldKey]) {
            foundLegacy = true;
            config.snippets[i.toString()] = {
              label: 'Slot ' + i,
              text: data[oldKey]
            };
          }
        }
        if (foundLegacy) {
          saveSettingsImmediately();
        }
      }

      // Populate form controls
      if (config.modifier) modifierSelect.value = config.modifier;
      if (config.keyScope) keyScopeSelect.value = config.keyScope;
      toastToggle.checked = config.showToast !== false;

      // Render cards
      renderSnippetCards();
      updateShortcutLabels();
    });
  }

  // Save settings with debouncing
  function triggerAutoSave() {
    saveStatus.textContent = 'Saving changes...';
    saveStatus.classList.add('unsaved');

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveSettingsImmediately();
    }, 500);
  }

  function saveSettingsImmediately() {
    config.modifier = modifierSelect.value;
    config.keyScope = keyScopeSelect.value;
    config.showToast = toastToggle.checked;

    chrome.storage.sync.set({ clipPasterConfig: config }, () => {
      if (chrome.runtime.lastError) {
        saveStatus.textContent = 'Error saving changes!';
        saveStatus.classList.add('unsaved');
        console.error(chrome.runtime.lastError);
      } else {
        saveStatus.textContent = 'All changes saved!';
        saveStatus.classList.remove('unsaved');
        setTimeout(() => {
          if (!saveStatus.classList.contains('unsaved')) {
            saveStatus.textContent = 'All changes saved';
          }
        }, 2000);
      }
    });
  }

  // Event Listeners for global options
  modifierSelect.addEventListener('change', () => {
    config.modifier = modifierSelect.value;
    updateShortcutLabels();
    triggerAutoSave();
  });

  keyScopeSelect.addEventListener('change', () => {
    config.keyScope = keyScopeSelect.value;
    updateShortcutLabels();
    triggerAutoSave();
  });

  toastToggle.addEventListener('change', () => {
    config.showToast = toastToggle.checked;
    triggerAutoSave();
  });

  saveBtn.addEventListener('click', saveSettingsImmediately);
  saveBottomBtn.addEventListener('click', saveSettingsImmediately);

  // Clear Sandbox
  clearSandboxBtn.addEventListener('click', () => {
    sandboxInput.value = '';
    sandboxInput.focus();
  });

  // Handle live testing inside the Sandbox
  sandboxInput.addEventListener('keydown', (e) => {
    if (!e.ctrlKey && !e.altKey) return;

    let matchMod = false;
    switch (config.modifier) {
      case 'ctrl_shift':
        matchMod = e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey;
        break;
      case 'alt_shift':
        matchMod = e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey;
        break;
      case 'ctrl_alt':
        matchMod = e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey;
        break;
      case 'alt':
        matchMod = e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey;
        break;
    }
    if (!matchMod) return;

    let digit = null;
    if (e.code && e.code.startsWith('Numpad')) {
      const num = e.code.replace('Numpad', '');
      if (/^[0-9]$/.test(num)) digit = num;
    } else if (config.keyScope === 'both' && e.code && e.code.startsWith('Digit')) {
      const num = e.code.replace('Digit', '');
      if (/^[0-9]$/.test(num)) digit = num;
    } else if (/^[0-9]$/.test(e.key)) {
      digit = e.key;
    }

    if (digit !== null) {
      const snippet = config.snippets && config.snippets[digit];
      if (snippet && snippet.text) {
        e.preventDefault();
        e.stopPropagation();

        const start = sandboxInput.selectionStart;
        const end = sandboxInput.selectionEnd;
        const text = snippet.text;
        sandboxInput.value = sandboxInput.value.slice(0, start) + text + sandboxInput.value.slice(end);
        sandboxInput.selectionStart = sandboxInput.selectionEnd = start + text.length;

        // Flash border briefly to give visual delight
        sandboxInput.style.borderColor = '#10b981';
        setTimeout(() => {
          sandboxInput.style.borderColor = '';
        }, 300);
      }
    }
  });

  // Export JSON backup
  exportBtn.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `clippaster-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Import JSON backup
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && (imported.snippets || imported.clipPasterConfig)) {
          const newConfig = imported.clipPasterConfig || imported;
          if (newConfig.snippets) config.snippets = newConfig.snippets;
          if (newConfig.modifier) config.modifier = newConfig.modifier;
          if (newConfig.keyScope) config.keyScope = newConfig.keyScope;
          if (typeof newConfig.showToast === 'boolean') config.showToast = newConfig.showToast;

          modifierSelect.value = config.modifier;
          keyScopeSelect.value = config.keyScope;
          toastToggle.checked = config.showToast;

          renderSnippetCards();
          updateShortcutLabels();
          saveSettingsImmediately();
          alert('Snippets imported successfully!');
        } else {
          alert('Invalid ClipPaster backup file.');
        }
      } catch (err) {
        alert('Could not parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  });

  // Load sample presets
  loadSamplesBtn.addEventListener('click', () => {
    if (confirm('Load helpful sample presets? This will fill empty slots with sample snippets.')) {
      for (let i = 0; i <= 9; i++) {
        const digit = i.toString();
        if (!config.snippets[digit] || !config.snippets[digit].text) {
          config.snippets[digit] = Object.assign({}, samplePresets[digit]);
        }
      }
      renderSnippetCards();
      saveSettingsImmediately();
    }
  });

  // Reset / Clear all slots
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all 10 snippet slots? This cannot be undone.')) {
      for (let i = 0; i <= 9; i++) {
        config.snippets[i.toString()] = { label: '', text: '' };
      }
      renderSnippetCards();
      saveSettingsImmediately();
    }
  });

  // Initial Boot
  loadSettings();

})();
