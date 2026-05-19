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
        this.codeSnippet = document.getElementById('codeSnippet');
        this.snippetTabs = document.getElementById('snippetTabs');
        this.activeSnippetTab = 'vanilla';
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
        
        // Tab Clicks for Snippets
        if (this.snippetTabs) {
            this.snippetTabs.addEventListener('click', (e) => {
                const button = e.target.closest('[data-tab]');
                if (!button) return;
                
                // Update active tab styling
                const buttons = this.snippetTabs.querySelectorAll('[data-tab]');
                buttons.forEach(btn => {
                    btn.className = "text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg border-2 border-slate-700 hover:border-amber-500/50 text-slate-300 transition-all focus:outline-none whitespace-nowrap";
                });
                button.className = "text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg border-2 border-amber-500 bg-amber-500 text-slate-950 transition-all focus:outline-none whitespace-nowrap";
                
                this.activeSnippetTab = button.dataset.tab;
                this.updateSnippet();
            });
        }
        
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
        }
        this.updateSnippet();
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
        if (!this.codeSnippet) return;

        const pitch = this.pitchSlider.value;
        const rate = this.rateSlider.value;
        const voiceName = this.selectedVoice?.name || "Selected Voice";

        let snippetHTML = "";

        if (this.activeSnippetTab === 'vanilla') {
            snippetHTML = `<span class="text-pink-500">const</span> <span class="text-yellow-400">speak</span> = (text) => {
  <span class="text-pink-500">const</span> synth = window.speechSynthesis;
  <span class="text-pink-500">const</span> utterance = <span class="text-pink-500">new</span> <span class="text-yellow-400">SpeechSynthesisUtterance</span>(text);
  
  <span class="text-slate-500">// Calibrated Settings</span>
  utterance.pitch = <span class="text-orange-400">${pitch}</span>;
  
  <span class="text-slate-500">// Engine Calibration: Firefox default cadence is often faster</span>
  <span class="text-pink-500">const</span> baseRate = <span class="text-orange-400">${rate}</span>;
  utterance.rate = navigator.userAgent.<span class="text-yellow-400">includes</span>(<span class="text-green-400">"Firefox"</span>) 
    ? baseRate * <span class="text-orange-400">0.85</span> 
    : baseRate;
  
  <span class="text-slate-500">// Robust voice matching</span>
  <span class="text-pink-500">const</span> voices = synth.<span class="text-yellow-400">getVoices</span>();
  utterance.voice = voices.<span class="text-yellow-400">find</span>(v => 
    v.name.<span class="text-yellow-400">includes</span>(<span class="text-green-400">"${voiceName}"</span>)
  ) || voices[<span class="text-orange-400">0</span>];
  
  synth.<span class="text-yellow-400">speak</span>(utterance);
};`;
        } else if (this.activeSnippetTab === 'react') {
            snippetHTML = `<span class="text-pink-500">import</span> { useCallback, useEffect, useState } <span class="text-pink-500">from</span> <span class="text-green-400">'react'</span>;

<span class="text-pink-500">export const</span> <span class="text-yellow-400">useSpeechSynthesis</span> = () => {
  <span class="text-pink-500">const</span> [voices, setVoices] = <span class="text-yellow-400">useState</span>([]);

  <span class="text-yellow-400">useEffect</span>(() => {
    <span class="text-pink-500">const</span> <span class="text-yellow-400">updateVoices</span> = () => {
      <span class="text-yellow-400">setVoices</span>(window.speechSynthesis.<span class="text-yellow-400">getVoices</span>());
    };
    <span class="text-yellow-400">updateVoices</span>();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    <span class="text-pink-500">return</span> () => {
      window.speechSynthesis.onvoiceschanged = <span class="text-pink-500">null</span>;
    };
  }, []);

  <span class="text-pink-500">const</span> speak = <span class="text-yellow-400">useCallback</span>((text) => {
    <span class="text-pink-500">const</span> synth = window.speechSynthesis;
    synth.<span class="text-yellow-400">cancel</span>(); <span class="text-slate-500">// Stop active playback</span>

    <span class="text-pink-500">const</span> utterance = <span class="text-pink-500">new</span> <span class="text-yellow-400">SpeechSynthesisUtterance</span>(text);
    
    <span class="text-slate-500">// Calibrated Settings</span>
    utterance.pitch = <span class="text-orange-400">${pitch}</span>;

    <span class="text-pink-500">const</span> baseRate = <span class="text-orange-400">${rate}</span>;
    utterance.rate = navigator.userAgent.<span class="text-yellow-400">includes</span>(<span class="text-green-400">"Firefox"</span>) 
      ? baseRate * <span class="text-orange-400">0.85</span> 
      : baseRate;

    <span class="text-pink-500">const</span> selectedVoice = voices.<span class="text-yellow-400">find</span>(v => 
      v.name.<span class="text-yellow-400">includes</span>(<span class="text-green-400">"${voiceName}"</span>)
    ) || voices[<span class="text-orange-400">0</span>];

    <span class="text-pink-500">if</span> (selectedVoice) utterance.voice = selectedVoice;

    synth.<span class="text-yellow-400">speak</span>(utterance);
  }, [voices]);

  <span class="text-pink-500">return</span> { speak, voices };
};`;
        } else if (this.activeSnippetTab === 'vue') {
            snippetHTML = `<span class="text-pink-500">import</span> { ref, onMounted, onUnmounted } <span class="text-pink-500">from</span> <span class="text-green-400">'vue'</span>;

<span class="text-pink-500">export function</span> <span class="text-yellow-400">useSpeech</span>() {
  <span class="text-pink-500">const</span> voices = <span class="text-yellow-400">ref</span>([]);

  <span class="text-pink-500">const</span> <span class="text-yellow-400">updateVoices</span> = () => {
    voices.value = window.speechSynthesis.<span class="text-yellow-400">getVoices</span>();
  };

  <span class="text-yellow-400">onMounted</span>(() => {
    <span class="text-yellow-400">updateVoices</span>();
    <span class="text-pink-500">if</span> (window.speechSynthesis.onvoiceschanged !== <span class="text-pink-500">undefined</span>) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  });

  <span class="text-yellow-400">onUnmounted</span>(() => {
    window.speechSynthesis.onvoiceschanged = <span class="text-pink-500">null</span>;
  });

  <span class="text-pink-500">const</span> <span class="text-yellow-400">speak</span> = (text) => {
    <span class="text-pink-500">const</span> synth = window.speechSynthesis;
    synth.<span class="text-yellow-400">cancel</span>();

    <span class="text-pink-500">const</span> utterance = <span class="text-pink-500">new</span> <span class="text-yellow-400">SpeechSynthesisUtterance</span>(text);
    
    <span class="text-slate-500">// Calibrated Settings</span>
    utterance.pitch = <span class="text-orange-400">${pitch}</span>;

    <span class="text-pink-500">const</span> baseRate = <span class="text-orange-400">${rate}</span>;
    utterance.rate = navigator.userAgent.<span class="text-yellow-400">includes</span>(<span class="text-green-400">"Firefox"</span>)
      ? baseRate * <span class="text-orange-400">0.85</span>
      : baseRate;

    <span class="text-pink-500">const</span> selectedVoice = voices.value.<span class="text-yellow-400">find</span>(v =>
      v.name.<span class="text-yellow-400">includes</span>(<span class="text-green-400">"${voiceName}"</span>)
    ) || voices.value[<span class="text-orange-400">0</span>];

    <span class="text-pink-500">if</span> (selectedVoice) utterance.voice = selectedVoice;

    synth.<span class="text-yellow-400">speak</span>(utterance);
  };

  <span class="text-pink-500">return</span> { speak, voices };
}`;
        } else if (this.activeSnippetTab === 'svelte') {
            snippetHTML = `<span class="text-pink-500">import</span> { writable } <span class="text-pink-500">from</span> <span class="text-green-400">'svelte/store'</span>;

<span class="text-pink-500">export const</span> voices = <span class="text-yellow-400">writable</span>([]);

<span class="text-pink-500">if</span> (<span class="text-pink-500">typeof</span> window !== <span class="text-green-400">'undefined'</span>) {
  <span class="text-pink-500">const</span> <span class="text-yellow-400">updateVoices</span> = () => voices.<span class="text-yellow-400">set</span>(window.speechSynthesis.<span class="text-yellow-400">getVoices</span>());
  <span class="text-yellow-400">updateVoices</span>();
  window.speechSynthesis.onvoiceschanged = updateVoices;
}

<span class="text-pink-500">export function</span> <span class="text-yellow-400">speak</span>(text) {
  <span class="text-pink-500">const</span> synth = window.speechSynthesis;
  synth.<span class="text-yellow-400">cancel</span>();

  <span class="text-pink-500">const</span> utterance = <span class="text-pink-500">new</span> <span class="text-yellow-400">SpeechSynthesisUtterance</span>(text);
  
  <span class="text-slate-500">// Calibrated Settings</span>
  utterance.pitch = <span class="text-orange-400">${pitch}</span>;
  
  <span class="text-pink-500">const</span> baseRate = <span class="text-orange-400">${rate}</span>;
  utterance.rate = navigator.userAgent.<span class="text-yellow-400">includes</span>(<span class="text-green-400">"Firefox"</span>) 
    ? baseRate * <span class="text-orange-400">0.85</span> 
    : baseRate;

  <span class="text-pink-500">let</span> allVoices = [];
  voices.<span class="text-yellow-400">subscribe</span>(v => allVoices = v)();

  <span class="text-pink-500">const</span> selectedVoice = allVoices.<span class="text-yellow-400">find</span>(v => 
    v.name.<span class="text-yellow-400">includes</span>(<span class="text-green-400">"${voiceName}"</span>)
  ) || allVoices[<span class="text-orange-400">0</span>];

  <span class="text-pink-500">if</span> (selectedVoice) utterance.voice = selectedVoice;

  synth.<span class="text-yellow-400">speak</span>(utterance);
}`;
        }

        this.codeSnippet.innerHTML = snippetHTML;
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
        const personaElement = document.getElementById('promptPersona');
        const phoneticElement = document.getElementById('promptPhonetic');
        const breathsElement = document.getElementById('promptBreaths');

        const persona = personaElement ? personaElement.value : 'assistant';
        const usePhonetic = phoneticElement ? phoneticElement.checked : true;
        const useBreaths = breathsElement ? breathsElement.checked : true;

        let personaInstructions = "";
        if (persona === 'assistant') {
            personaInstructions = "Adopt a clear, polite, and direct voice assistant tone. Prioritize short and well-structured sentences.";
        } else if (persona === 'narrator') {
            personaInstructions = "Adopt the tone of an audiobook narrator. Pacing should be narrative-driven, expressive, and marked with natural breath pauses.";
        } else if (persona === 'educator') {
            personaInstructions = "Adopt the tone of a technical instructor or educator. Be highly didactic, speak calmly, and articulate precisely.";
        } else if (persona === 'game') {
            personaInstructions = "Adopt the theatrical and immersive tone of an RPG game character. Be dramatic and highly expressive.";
        }

        let rules = [];
        if (usePhonetic) {
            rules.push("- Spell out complex technical terms or acronyms phonetically to aid speech synthesis (e.g., write 'ay-pee-eye' for 'API', 'jay-son' for 'JSON', 'you-eye' for 'UI', 'el-el-em' for 'LLM').");
        }
        if (useBreaths) {
            rules.push("- Use punctuation marks to pace the natural cadence of the voice. Insert commas (,) for brief pauses and ellipsis (...) for longer transitions or breath breaks.");
        }
        rules.push("- Avoid overly long parenthesis or unusual punctuation marks that might disrupt the engine's pronunciation.");

        const prompt = `Act as an Acoustic Prompt Engineer. The following native Web Speech API voice profile has been calibrated:
- Voice Name: "${this.selectedVoice?.name || 'Default'}"
- Language Code: ${this.selectedVoice?.lang || 'en'}
- Calibrated Pitch: ${this.pitchSlider.value}
- Calibrated Rate: ${this.rateSlider.value}

Text Generation Directives:
1. TONALITY: ${personaInstructions}
2. DICTION DIRECTIVES:
${rules.join('\n')}

Generate an optimized response in a JSON object format containing the keys 'text' (the optimized speech text tailored to the rules above) and 'visualText' (the clean, correctly spelled text suitable for screen display).`;

        navigator.clipboard.writeText(prompt).then(() => {
            const originalText = this.copyPromptBtn.innerHTML;
            this.copyPromptBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-green-400"></i> <span class="font-medium text-green-400">Prompt Copied!</span>';
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
