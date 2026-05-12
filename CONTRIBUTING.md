# Contributing to Web Speech Selector

Thank you for your interest in contributing! This project aims to provide a robust, premium studio experience for the Web Speech API.

## 🌟 Vision
We solve browser fragmentation (Chrome/Safari/Firefox) by providing a calibrated, accessible, and AI-ready TTS workflow.

## 🛠️ Development Standards

### 1. Code Style
- **JavaScript**: Use ES6+ classes. Keep logic modular.
- **HTML**: Use semantic HTML5 elements.
- **CSS**: Use Tailwind CSS for utility-first styling. Maintain the "Studio" aesthetic (Dark mode, glassmorphism, refined transitions).

### 2. Browser Compatibility
All changes must be tested on:
- **Chrome/Edge**: Focus on `onvoiceschanged` async loading.
- **Safari**: Focus on system voice integration.
- **Firefox**: Focus on standard compliance.

### 3. Accessibility (A11y)
- Every interactive element must have a unique ID.
- Use `aria-live` for status updates.
- Ensure keyboard navigation works (Hotkeys: Space, Esc).

## 🚀 Workflow

### Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Start Tailwind watcher: `npm run watch`.

### Pull Request Process
1. Create a feature branch.
2. Ensure your code follows the standards.
3. Update documentation if necessary.
4. Submit your PR with a clear description of changes.

## 🧩 Extension Specifics
When working on the extension, ensure that all settings are persisted via `chrome.storage.local` to maintain a seamless user experience across sessions.

## 📜 License
By contributing, you agree that your contributions will be licensed under the MIT License.
