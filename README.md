# 🎙️ Web Speech Selector

> A dual-distribution suite (Standalone Web App & Chrome Extension Manifest V3) designed to explore, calibrate, and implement the native **Web Speech API** with cross-browser consistency and dynamic AI/framework integration.

🚀 **[Try the Live Web Studio Demo](https://QuentinMerle.github.io/web-speech-selector/web/)**

🤖 **For AI agents and LLMs**: See [`llms-full.txt`](llms-full.txt) for structured technical context.

---

## 🌟 Overview & Philosophy

The native Text-to-Speech (TTS) functionality built into web browsers can be highly fragmented across rendering engines (Chromium, WebKit, Gecko) and operating systems (macOS, Windows, iOS, Android). Voice names change, loading occurs asynchronously, and audio playback speed or pitch scales can yield vastly different acoustic results.

**Web Speech Selector** solves these inconsistencies by providing a straightforward, responsive calibration playground. Wrapped in a vibrant, tactile **"POP Arcade"** neo-brutalist user interface, it is built to be a helpful workspace for developers, AI prompt designers, and accessibility advocates.

---

## ✨ Key Features

### 🎛️ 1. Responsive Acoustic Calibration
* **Granular Controls**: Easily fine-tune **Pitch** (tonal scale, from `0.1` to `2.0`) and **Rate** (playback speed, from `0.1` to `2.0`).
* **Live Interruption Feedback**: Adjusting any slider while audio is playing instantly pauses the current speech and restarts it with the updated parameters, giving you immediate auditory feedback without manual toggling.
* **Instant Filtering**: Search through available browser voices by name or region tags (`en-US`, `fr-FR`, `ja-JP`, etc.) instantly.

### 🔌 2. Dynamic AI Voice Configurator
* **Acoustic Prompt Engineer**: Generates a pre-formatted, robust system instruction prompt in English to calibrate **LLMs** (ChatGPT, Claude, Gemini, etc.) so they structure written outputs to sound highly natural when read by browser speech synthesis engines.
* **Custom Personas**: Select the ideal acoustic character—*Voice Assistant* (clear & direct), *Audiobook Narrator* (expressive, rhythmic), *Technical Educator* (slow, precise), or *Retro RPG NPC* (theatrical, dramatic).
* **Phonetic Spelling Guides**: Automatically instructs the LLM to write complex terms phonetically (e.g. spelling out `API` as `"ay-pee-eye"`, `JSON` as `"jay-son"`, `UI` as `"you-eye"`) so the native browser voice doesn't spell them out awkwardly.
* **Punctuation-based Breath Pauses**: Instructs the AI to pace written phrases using commas and ellipsis for natural breaks, simulating realistic human breaths without requiring complex SSML markup.

### 🛠️ 3. Robust Multi-Framework Snippet Generator
* **Tabbed Developer Dashboard**: Instantly inspect and copy perfectly calibrated, production-grade text-to-speech implementation templates tailored directly to your framework of choice:
  * **Vanilla JS**: Standard pure async function wrapper with smart Firefox speed compensation.
  * **React Hook**: Custom `useSpeechSynthesis` hook managing state, asynchronous voice list updates, and proper cleanup side-effects to prevent memory leaks.
  * **Vue 3**: Reactive Composition API `useSpeech()` composable with built-in `onMounted` and `onUnmounted` handlers.
  * **Svelte**: Fully reactive store-based store sub-bar.

### 🧩 4. Chrome Extension: "The Active Web Reader"
* **Highlight Detection**: Leveraging Manifest V3 `activeTab` and `scripting` permissions, the extension popup **automatically detects highlighted text** on your active browser tab and pre-fills the reader on launch.
* **Instant TTS Utility**: Turn the extension into a powerful accessibility reader that articulates complex documentation or articles using your exact favorite calibrated voice profile in one click.
* **Starred Voices**: Click the star icon next to your favorite voices to automatically pin them to the top of the selection list.
* **Seamless Local Storage**: fully persistent settings via `localStorage` on the web app and `chrome.storage.local` inside the browser extension.

### 🛡️ 5. Local Execution & Privacy (Zero-CDN)
* **Manifest V3 Compliant**: All script dependencies, utility styles, and standalone icon distributions (**Lucide UMD Standalone**) are bundled locally.
* **Offline Ready**: Operates completely offline with zero external web requests, ensuring perfect privacy for your text inputs and solid reliability.

---

## 🚀 Getting Started

### Option A: Standalone Web App
Because modern browsers strictly restrict local cross-origin policies (CORS) when fetching local system voices over the `file:///` protocol, we recommend running the local development server:

```bash
# 1. Clone the repository
git clone https://github.com/quentin/web-speech-selector.git
cd web-speech-selector

# 2. Install dependencies (TailwindCSS, local serve server)
npm install

# 3. Start the local workspace
npm run dev
```
The app will automatically open at `http://localhost:3000` (or the local designated port).

### Option B: Chrome Extension Popup
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the upper right corner.
3. Click **Load unpacked** and select the `/extension` directory from this repository.
4. Pin the 🎙️ icon to your browser toolbar for quick speech testing on any webpage.

---

## ⌨️ Accessibility & Hotkeys (A11Y)

The user interface adheres to high-contrast **WCAG AAA** readability metrics (> 7:1 contrast ratios) and supports convenient keyboard shortcuts:
* <kbd>Space</kbd> : Toggle Play/Pause speech playback inside the live playground.
* <kbd>Esc</kbd> : Immediately halt active audio synthesis.
* **Screen Reader Support**: Critical voice state changes are announced silently via dedicated live update sections (`aria-live="polite"`).
* **Layout Safeguards**: Strict horizontal container locks (`min-w-0`, `overflow-x-hidden`) prevent overflowing flex items, ensuring clear keyboard focus traversal.

---

## 🏗️ Repository Architecture

```text
web-speech-selector/
├── package.json              # Development scripts and build tasks
├── src/
│   └── input.css             # Source Tailwind CSS tokens
├── web/                      # 🌐 STANDALONE WEB WORKSPACE
│   ├── index.html            # Tactile arcade UI layout
│   ├── app.js                # Core speech synthesis engine
│   ├── lucide.min.js         # Local bundled icon scripts
│   └── output.css            # Fully contained compiled styles
└── extension/                # 🧩 CHROME EXTENSION V3
    ├── manifest.json         # Extension permission mapping
    ├── popup.html            # Compact popup dashboard
    ├── scripts/
    │   ├── popup.js          # Lightweight local storage engine
    │   └── lucide.min.js     # Bundled local icons
    └── styles/
        └── output.css        # Isolated extension styling
```

---

## 🛠️ Build Scripts

The style compilation utilizes two separate pipeline outputs via Tailwind CSS to guarantee completely encapsulated classes for both targets:
* **Build all targets**: `npm run build`
* **Build Web style only**: `npm run build:web`
* **Build Extension style only**: `npm run build:ext`

---

## 📜 License

Distributed under the **MIT** License. Feel free to fork, adapt, and incorporate this codebase into your personal or commercial projects.
