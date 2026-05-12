// Web Speech Selector - Extension Popup Logic

class PopupStudio {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;
        this.isSpeaking = false;
        this.isPaused = false;
        this.favorites = [];

        // UI Elements
        this.voiceSearch = document.getElementById('voiceSearch');
        this.voiceList = document.getElementById('voiceList');
        this.pitchSlider = document.getElementById('pitch');
        this.rateSlider = document.getElementById('rate');
        this.pitchValue = document.getElementById('pitchValue');
        this.rateValue = document.getElementById('rateValue');
        this.playgroundInput = document.getElementById('playgroundInput');
        this.textOverlay = document.getElementById('textOverlay');
        this.playBtn = document.getElementById('playBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.statusBadge = document.getElementById('statusBadge');
        this.copyPromptBtn = document.getElementById('copyPromptBtn');

        this.init();
    }

    async init() {
        // Load saved settings
        const saved = await chrome.storage.local.get(['pitch', 'rate', 'voiceName', 'text', 'favorites']);
        if (saved.favorites) {
            this.favorites = saved.favorites;
        }
        if (saved.pitch) {
            this.pitchSlider.value = saved.pitch;
            this.pitchValue.textContent = saved.pitch;
        }
        if (saved.rate) {
            this.rateSlider.value = saved.rate;
            this.rateValue.textContent = saved.rate;
        }
        if (saved.text) {
            this.playgroundInput.value = saved.text;
            this.syncOverlay();
        }

        // Load voices
        this.loadVoices(saved.voiceName);
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices(saved.voiceName);
        }

        // Listeners
        this.voiceSearch.addEventListener('input', () => this.renderVoiceList());
        this.pitchSlider.addEventListener('input', () => this.updateCalibration());
        this.rateSlider.addEventListener('input', () => this.updateCalibration());
        this.playBtn.addEventListener('click', () => this.toggleSpeech());
        this.stopBtn.addEventListener('click', () => this.stopSpeech());
        this.copyPromptBtn.addEventListener('click', () => this.copyAIPrompt());
        this.playgroundInput.addEventListener('input', () => {
            this.syncOverlay();
            chrome.storage.local.set({ text: this.playgroundInput.value });
        });

        // Global shortcuts (Escape to stop)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') this.stopSpeech();
        });
    }

    loadVoices(savedVoiceName) {
        this.voices = this.synth.getVoices().sort((a, b) => a.name.localeCompare(b.name));
        if (savedVoiceName && !this.selectedVoice) {
            this.selectedVoice = this.voices.find(v => v.name === savedVoiceName);
        }
        if (!this.selectedVoice && this.voices.length > 0) {
            this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
        }
        this.renderVoiceList();
    }

    renderVoiceList() {
        const query = this.voiceSearch.value.toLowerCase();
        const filtered = this.voices.filter(v => 
            v.name.toLowerCase().includes(query) || 
            v.lang.toLowerCase().includes(query)
        );

        // Sort favorites to the top
        const sortedFiltered = [...filtered].sort((a, b) => {
            const aFav = this.favorites.includes(a.name);
            const bFav = this.favorites.includes(b.name);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.name.localeCompare(b.name);
        });

        this.voiceList.innerHTML = sortedFiltered.map(voice => {
            const isFav = this.favorites.includes(voice.name);
            const isSelected = this.selectedVoice?.name === voice.name;
            const safeId = voice.name.replace(/[^a-zA-Z0-9]/g, '-');
            return `
                <div class="flex items-center justify-between p-1 rounded mb-1 transition-all box-border w-full ${
                    isSelected ? 'bg-gradient-to-r from-violet-950 to-indigo-950 border-l-2 border-yellow-400' : 'bg-slate-900/80 hover:bg-slate-800'
                }">
                    <button class="flex-1 min-w-0 text-left px-1 py-0.5 focus:outline-none flex justify-between items-center" id="v-${safeId}">
                        <span class="text-[10px] ${isSelected ? 'text-white font-bold' : 'text-slate-200'} truncate pr-1">${voice.name}</span>
                        <span class="text-[8px] px-1 rounded font-mono ${isSelected ? 'bg-yellow-400 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800'}">${voice.lang}</span>
                    </button>
                    <button class="px-1.5 py-0.5 text-slate-500 hover:text-amber-400 focus:outline-none flex items-center justify-center shrink-0" id="fav-${safeId}" title="Favorite">
                        <svg class="w-3 h-3 transition-colors ${isFav ? 'text-yellow-400 fill-yellow-400' : 'fill-transparent hover:text-slate-400'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.123.515-.429.917-.878.653l-4.73-2.793a.563.563 0 00-.57 0l-4.73 2.793c-.449.264-1.001-.138-.878-.653l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.95.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        // Add event listeners to buttons safely for CSP
        sortedFiltered.forEach(voice => {
            const safeId = voice.name.replace(/[^a-zA-Z0-9]/g, '-');
            const vBtn = document.getElementById(`v-${safeId}`);
            const favBtn = document.getElementById(`fav-${safeId}`);
            if (vBtn) vBtn.onclick = () => this.selectVoice(voice.name);
            if (favBtn) favBtn.onclick = () => this.toggleFavorite(voice.name);
        });

        if (filtered.length === 0) {
            this.voiceList.innerHTML = `<div class="p-2 text-slate-500 text-xs text-center">No voices found</div>`;
        }
    }

    selectVoice(name) {
        this.selectedVoice = this.voices.find(v => v.name === name);
        chrome.storage.local.set({ voiceName: name });
        this.renderVoiceList();
        this.stopSpeech();
    }

    toggleFavorite(name) {
        if (this.favorites.includes(name)) {
            this.favorites = this.favorites.filter(f => f !== name);
        } else {
            this.favorites.push(name);
        }
        chrome.storage.local.set({ favorites: this.favorites });
        this.renderVoiceList();
    }

    updateCalibration() {
        this.pitchValue.textContent = this.pitchSlider.value;
        this.rateValue.textContent = this.rateSlider.value;
        chrome.storage.local.set({ 
            pitch: this.pitchSlider.value, 
            rate: this.rateSlider.value 
        });

        // Impact live reading immediately
        if (this.synth.speaking && !this.isPaused) {
            this.startSpeech();
        }
    }

    syncOverlay() {
        this.textOverlay.textContent = this.playgroundInput.value;
    }

    setStatus(status) {
        const colors = { 'IDLE': 'bg-slate-600', 'SPEAKING': 'bg-green-500', 'PAUSED': 'bg-yellow-500' };
        this.statusBadge.innerHTML = `<div class="w-1.5 h-1.5 rounded-full ${colors[status] || 'bg-slate-600'} ${status === 'SPEAKING' ? 'animate-pulse' : ''}"></div> ${status}`;
        this.playBtn.innerHTML = status === 'SPEAKING' ? '<i data-lucide="pause" class="w-3.5 h-3.5 fill-slate-950"></i> Pause' : '<i data-lucide="play" class="w-3.5 h-3.5 fill-slate-950"></i> Play';
        lucide.createIcons();
    }

    toggleSpeech() {
        if (this.synth.speaking && !this.isPaused) {
            this.synth.pause();
            this.isPaused = true;
            this.setStatus('PAUSED');
            return;
        }
        if (this.isPaused) {
            this.synth.resume();
            this.isPaused = false;
            this.setStatus('SPEAKING');
            return;
        }
        this.startSpeech();
    }

    startSpeech() {
        this.synth.cancel();
        const text = this.playgroundInput.value;
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        utterance.pitch = parseFloat(this.pitchSlider.value);
        const baseRate = parseFloat(this.rateSlider.value);
        utterance.rate = navigator.userAgent.includes("Firefox") ? baseRate * 0.85 : baseRate;

        utterance.onstart = () => { this.isSpeaking = true; this.setStatus('SPEAKING'); };
        utterance.onend = () => { this.isSpeaking = false; this.isPaused = false; this.setStatus('IDLE'); this.syncOverlay(); };
        utterance.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled') return;
            console.error('Popup TTS error:', e.error || e);
            this.setStatus('IDLE');
            this.isSpeaking = false;
            this.isPaused = false;
        };
        utterance.onboundary = (event) => {
            if (event.name === 'word') this.highlightWord(event.charIndex, event.charLength);
        };

        this.synth.speak(utterance);
    }

    stopSpeech() {
        this.synth.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
        this.setStatus('IDLE');
        this.syncOverlay();
    }

    highlightWord(charIndex, charLength) {
        const text = this.playgroundInput.value;
        const before = text.substring(0, charIndex);
        const word = text.substring(charIndex, charIndex + charLength);
        const after = text.substring(charIndex + charLength);
        this.textOverlay.innerHTML = `${this.escapeHTML(before)}<span class="highlight-word text-transparent">${this.escapeHTML(word)}</span>${this.escapeHTML(after)}`;
    }

    escapeHTML(str) {
        return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
    }

    copyAIPrompt() {
        const prompt = `Voice: "${this.selectedVoice?.name}" | Pitch: ${this.pitchSlider.value} | Rate: ${this.rateSlider.value}`;
        navigator.clipboard.writeText(prompt).then(() => {
            const original = this.copyPromptBtn.innerHTML;
            this.copyPromptBtn.innerHTML = '<i data-lucide="check" class="w-3 h-3 text-green-400"></i> Copied!';
            lucide.createIcons();
            setTimeout(() => { this.copyPromptBtn.innerHTML = original; lucide.createIcons(); }, 1500);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.studio = new PopupStudio();
});
