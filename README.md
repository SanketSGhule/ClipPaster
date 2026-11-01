<p align="center">
  <img src="icon128.png" width="96" height="96" alt="ClipPaster Logo">
</p>

<h1 align="center">ClipPaster</h1>

<p align="center">
  <strong>Instant text snippet expansion and quick numpad pasting for Google Chrome.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-brightgreen.svg" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Chrome-Extension-blue.svg" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Version-1.1.0-indigo.svg" alt="Version 1.1.0">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License MIT">
</p>

---

## 🚀 Overview

**ClipPaster** allows you to instantly insert custom text chunks (emails, templates, signatures, code snippets, meeting links) into any typing place using customizable keyboard shortcuts.

### 💡 Why not `Ctrl + 1-9`?
In Google Chrome on Windows, `Ctrl + 1` through `Ctrl + 8` is reserved by the browser to switch tabs, and `Ctrl + 9` jumps to the last tab. This shortcut is intercepted at the browser level and cannot be suppressed.

**ClipPaster's Conflict-Free Solution:**
- Defaults to **`Ctrl + Shift + [Numpad / Numbers]`** so you never accidentally switch browser tabs.
- Lets you choose your preferred modifier: `Ctrl + Shift`, `Alt + Shift`, `Ctrl + Alt`, or `Alt`.
- Supports **Numpad only** or **Both Numpad and Top-Row digits**.

---

## ✨ Features

- **⚡ 10 Quick Slots (0 to 9):** Assign custom titles and multi-line text snippets to numbers 0 through 9.
- **↩️ Full Undo / Redo Support:** Uses native insertion so pressing `Ctrl + Z` undoes pastes naturally.
- **🌐 Universal Typing Compatibility:** Works seamlessly inside `<input>`, `<textarea>`, rich-text editors (`contenteditable` like Gmail, Slack, Discord, Twitter/X, Reddit), and Web Components / Shadow DOM.
- **🎛️ Dedicated Manager (`options.html`):** Clean, modern settings dashboard with character counters, slot labels, and sample presets.
- **🧪 Interactive Live Sandbox:** Test your shortcuts directly inside the settings page in real time.
- **💾 Auto-Save & Backup:** Changes save automatically as you type, plus 1-click JSON backup export & import.
- **📋 Toolbar Quick Popup:** View all configured snippets at a glance with 1-click copy buttons.
- **🔒 100% Private:** No analytics, no tracking, no external servers. All data stays local or syncs across your personal Chrome profile.

---

## 🛠️ Installation

### Option 1: Load Unpacked (Developer Mode)
1. Download or clone this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** (top-left).
5. Select the `CLIPPASTER` folder.
6. The extension is now active!

### Option 2: Chrome Web Store
*(Link will be updated once approved on the Chrome Web Store).*

---

## ⌨️ Default Shortcuts

| Shortcut | Slot | Default Content |
| :--- | :---: | :--- |
| `Ctrl + Shift + Num 0` | 0 | Quick Note: *"Will reply in a few minutes!"* |
| `Ctrl + Shift + Num 1` | 1 | Greeting: *"Hello! Hope you are having a wonderful day."* |
| `Ctrl + Shift + Num 2` | 2 | Email Signature |
| `Ctrl + Shift + Num 3` | 3 | Meeting Link |
| `Ctrl + Shift + Num 4` | 4 | Support Response |
| `Ctrl + Shift + Num 5` | 5 | Bug Report Template |
| `Ctrl + Shift + Num 6-9` | 6–9 | Configurable (Empty by default) |

*You can customize all shortcuts and slot contents anytime in the Extension Options.*

---

## 📁 Project Structure

```text
CLIPPASTER/
├── manifest.json       # Manifest V3 extension configuration
├── content.js          # Injected content script for hotkey listening & text insertion
├── options.html        # Snippet management & settings page
├── options.css         # Management page styling (light & dark mode)
├── options.js          # Options page logic, auto-save, and live sandbox
├── popup.html          # Toolbar popup UI
├── popup.css           # Toolbar popup styling
├── popup.js            # Toolbar popup logic & quick copy
├── icon16.png          # 16x16 toolbar icon
├── icon48.png          # 48x48 extensions list icon
├── icon128.png         # 128x128 store & high-res icon
├── privacy-policy.html # Privacy policy document
├── LICENSE             # MIT License
└── README.md           # Documentation
```

---

## 🛡️ Permissions Justification

- **`storage`**: Used exclusively to store and sync your customized text snippets and shortcut preferences locally across your Chrome browser.
- **`<all_urls>` (Content Script)**: Required so you can trigger your shortcuts and paste snippets into text fields across any website you visit.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
