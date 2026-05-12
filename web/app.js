// Web Speech Selector - Core Logic

class TTSStudio {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.favorites = JSON.parse(localStorage.getItem('tts_favorites') || '[]');

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
        this.snipPitch = document.getElementById('snipPitch');
        this.snipRate = document.getElementById('snipRate');
        this.snipVoiceName = document.getElementById('snipVoiceName');
        this.copyPromptBtn = document.getElementById('copyPromptBtn');
        this.copySnippetBtn = document.getElementById('copySnippetBtn');

        this.init();
    }

    init() {
        // Load voices (Chrome/Safari async handling)
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }

        // Event Listeners
        this.voiceSearch.addEventListener('input', () => this.renderVoiceList());
        this.pitchSlider.addEventListener('input', () => this.updateCalibration());
        this.rateSlider.addEventListener('input', () => this.updateCalibration());
        this.playBtn.addEventListener('click', () => this.toggleSpeech());
        this.stopBtn.addEventListener('click', () => this.stopSpeech());
        this.copyPromptBtn.addEventListener('click', () => this.copyAIPrompt());
        this.copySnippetBtn.addEventListener('click', () => this.copySnippet());
        
        // Sync overlay on input
        this.playgroundInput.addEventListener('input', () => this.syncOverlay());
        this.syncOverlay();

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && (e.target === document.body || e.target === this.playgroundInput)) {
                if (e.target !== this.playgroundInput || e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleSpeech();
                }
            }
            if (e.code === 'Escape') {
                this.stopSpeech();
            }
        });
    }

    loadVoices() {
        this.voices = this.synth.getVoices().sort((a, b) => a.name.localeCompare(b.name));
        this.renderVoiceList();
        
        // Select first English voice by default if none selected
        if (!this.selectedVoice && this.voices.length > 0) {
            this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
            this.updateSnippet();
        }
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
            return `
                <div class="flex items-center gap-1 p-1 rounded-xl transition-all mb-1.5 box-border w-full ${
                    isSelected 
                    ? 'bg-gradient-to-r from-violet-950 to-indigo-950 border-2 border-yellow-400 shadow-xl' 
                    : 'bg-[#131c31] hover:bg-[#1e293b] border border-slate-800'
                }">
                    <button class="flex-1 min-w-0 text-left px-3 py-2 rounded-lg transition-colors group focus:outline-none"
                            onclick="studio.selectVoice('${voice.name}')">
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-xs ${isSelected ? 'text-white font-black' : 'text-slate-100 font-bold'} group-hover:text-white transition-colors block truncate">${voice.name}</span>
                            <span class="text-[9px] px-2 py-0.5 rounded font-mono font-black whitespace-nowrap ${
                                isSelected ? 'bg-yellow-400 text-slate-950' : 'bg-indigo-950 text-indigo-300 border border-indigo-800/40'
                            }">${voice.lang}</span>
                        </div>
                        ${voice.default ? '<span class="text-[9px] text-emerald-400 font-black uppercase tracking-wider mt-1 block">Default</span>' : ''}
                    </button>
                    <button class="p-2 rounded-lg transition-transform active:scale-95 hover:bg-slate-800/80 focus:outline-none flex items-center justify-center shrink-0"
                            onclick="studio.toggleFavorite('${voice.name}')"
                            title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                        <svg class="w-4 h-4 transition-colors ${isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 hover:text-slate-400 fill-transparent'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.123.515-.429.917-.878.653l-4.73-2.793a.563.563 0 00-.57 0l-4.73 2.793c-.449.264-1.001-.138-.878-.653l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.95.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        if (filtered.length === 0) {
            this.voiceList.innerHTML = `<div class="p-4 text-slate-400 text-sm font-medium text-center bg-slate-900 rounded-xl">No voices found matching "${query}"</div>`;
        }
    }

    selectVoice(name) {
        this.selectedVoice = this.voices.find(v => v.name === name);
        this.renderVoiceList();
        this.updateSnippet();
        this.stopSpeech();
    }

    toggleFavorite(name) {
        if (this.favorites.includes(name)) {
            this.favorites = this.favorites.filter(f => f !== name);
        } else {
            this.favorites.push(name);
        }
        localStorage.setItem('tts_favorites', JSON.stringify(this.favorites));
        this.renderVoiceList();
    }

    updateCalibration() {
        this.pitchValue.textContent = this.pitchSlider.value;
        this.rateValue.textContent = this.rateSlider.value;
        this.updateSnippet();
        
        // Impact live reading immediately
        if (this.synth.speaking && !this.isPaused) {
            this.startSpeech();
        }
    }

    updateSnippet() {
        if (this.snipPitch) this.snipPitch.textContent = this.pitchSlider.value;
        if (this.snipRate) this.snipRate.textContent = this.rateSlider.value;
        if (this.snipVoiceName) this.snipVoiceName.textContent = this.selectedVoice?.name || "Selected Voice";
    }

    syncOverlay() {
        this.textOverlay.textContent = this.playgroundInput.value;
    }

    setStatus(status) {
        const colors = {
            'IDLE': 'bg-slate-600',
            'SPEAKING': 'bg-green-500',
            'PAUSED': 'bg-yellow-500',
            'ERROR': 'bg-red-500'
        };
        
        this.statusBadge.innerHTML = `
            <div class="w-2 h-2 rounded-full ${colors[status] || 'bg-slate-600'} ${status === 'SPEAKING' ? 'animate-pulse' : ''}"></div> ${status}
        `;
        
        if (status === 'SPEAKING') {
            this.playBtn.innerHTML = '<i data-lucide="pause" class="w-6 h-6 fill-slate-950"></i> Pause';
        } else {
            this.playBtn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-slate-950"></i> Play';
        }
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

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.setStatus('SPEAKING');
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.isPaused = false;
            this.setStatus('IDLE');
            this.clearHighlight();
        };

        utterance.onerror = (e) => {
            // Ignore standard interruption or manual cancellation events
            if (e.error === 'interrupted' || e.error === 'canceled') {
                return;
            }
            console.error('Speech synthesis error:', e.error || e);
            this.setStatus('ERROR');
            this.isSpeaking = false;
            this.isPaused = false;
        };

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                this.highlightWord(event.charIndex, event.charLength);
            }
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    stopSpeech() {
        this.synth.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
        this.setStatus('IDLE');
        this.clearHighlight();
    }

    highlightWord(charIndex, charLength) {
        const text = this.playgroundInput.value;
        const before = text.substring(0, charIndex);
        const word = text.substring(charIndex, charIndex + charLength);
        const after = text.substring(charIndex + charLength);

        this.textOverlay.innerHTML = `${this.escapeHTML(before)}<span class="highlight-word">${this.escapeHTML(word)}</span>${this.escapeHTML(after)}`;
    }

    clearHighlight() {
        this.syncOverlay();
    }

    escapeHTML(str) {
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        })[m]);
    }

    copyAIPrompt() {
        const prompt = `Act as a Web Speech API Orchestrator. The following voice has been calibrated in the "Vibrisse Studio":
- Voice Name: "${this.selectedVoice?.name}"
- Language: ${this.selectedVoice?.lang}
- Calibrated Pitch: ${this.pitchSlider.value}
- Calibrated Rate: ${this.rateSlider.value}

Your task is to generate natural-sounding text optimized for this specific voice profile. Avoid complex abbreviations that this engine might mispronounce. Provide the output in a JSON format compatible with a custom utterance handler.`;
        
        navigator.clipboard.writeText(prompt).then(() => {
            const originalText = this.copyPromptBtn.innerHTML;
            this.copyPromptBtn.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-green-400"></i> <span class="font-medium text-green-400">Prompt Copied!</span>';
            lucide.createIcons();
            setTimeout(() => {
                this.copyPromptBtn.innerHTML = originalText;
                lucide.createIcons();
            }, 2000);
        });
    }

    copySnippet() {
        const code = document.getElementById('codeSnippet').innerText;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = this.copySnippetBtn.innerHTML;
            this.copySnippetBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i> Copied!';
            lucide.createIcons();
            setTimeout(() => {
                this.copySnippetBtn.innerHTML = originalText;
                lucide.createIcons();
            }, 2000);
        });
    }
}

// Global instance
const studio = new TTSStudio();
