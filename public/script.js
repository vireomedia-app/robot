class RobotApp {
    constructor() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.recognition = null;
        this.speechTimeout = null;
        
        this.robotFace = document.getElementById('robotFace');
        this.mouth = document.getElementById('mouth');
        this.status = document.getElementById('status');
        this.debugPanel = document.getElementById('debugPanel');
        this.debugText = document.getElementById('debugText');
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
        
        // Inicjalizacja rozpoznawania mowy z opóźnieniem
        setTimeout(() => {
            this.setupSpeechRecognition();
        }, 1000);
        
        console.log('🤖 Robot initialized');
        
        // Pokaż debug panel w development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.debugPanel.style.display = 'block';
        }
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.updateStatus('Brak wsparcia rozpoznawania mowy');
            this.debugLog('Speech Recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'pl-PL';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            console.log('🎤 Rozpoczęto słuchanie');
            this.debugLog('Rozpoczęto słuchanie');
            this.isListening = true;
            this.setListeningState();
            this.updateStatus('Mów teraz...');
            
            // Timeout na słuchanie - 8 sekund
            this.speechTimeout = setTimeout(() => {
                if (this.isListening) {
                    console.log('⏰ Timeout słuchania');
                    this.recognition.stop();
                }
            }, 8000);
        };

        this.recognition.onresult = (event) => {
            console.log('📝 Otrzymano wynik');
            this.clearTimeout();
            
            if (event.results && event.results.length > 0) {
                const result = event.results[0];
                if (result.length > 0) {
                    const text = result[0].transcript;
                    console.log('🗣️ Rozpoznano:', text);
                    this.debugLog(`Rozpoznano: "${text}"`);
                    
                    this.handleSpeechResult(text);
                    return;
                }
            }
            
            console.log('❌ Brak rozpoznanego tekstu');
            this.handleNoSpeech();
        };

        this.recognition.onerror = (event) => {
            console.log('❌ Błąd rozpoznawania:', event.error);
            this.clearTimeout();
            
            switch (event.error) {
                case 'not-allowed':
                case 'permission-denied':
                    this.updateStatus('Brak uprawnień do mikrofonu');
                    this.debugLog('Brak uprawnień do mikrofonu');
                    break;
                case 'no-speech':
                    this.handleNoSpeech();
                    break;
                default:
                    this.updateStatus('Błąd rozpoznawania mowy');
                    this.debugLog(`Błąd: ${event.error}`);
            }
            
            this.setNormalStateWithDelay();
        };

        this.recognition.onend = () => {
            console.log('⏹️ Zakończono słuchanie');
            this.debugLog('Zakończono słuchanie');
            this.clearTimeout();
            this.isListening = false;
            
            if (!this.isThinking && !this.isTalking) {
                setTimeout(() => {
                    if (!this.isThinking && !this.isTalking) {
                        this.setNormalState();
                        this.updateStatus('Kliknij 🎤 aby rozmawiać');
                    }
                }, 1000);
            }
        };
    }

    handleSpeechResult(text) {
        this.isListening = false;
        this.updateStatus(`Usłyszałem: "${text}"`);
        
        // Krótkie opóźnienie przed przetwarzaniem
        setTimeout(async () => {
            await this.processUserInput(text);
        }, 500);
    }

    handleNoSpeech() {
        this.updateStatus('Nie usłyszałem nic, spróbuj ponownie');
        this.debugLog('Nie wykryto mowy');
        this.setNormalStateWithDelay();
    }

    setupEventListeners() {
        const listenBtn = document.getElementById('listenBtn');
        const resetBtn = document.getElementById('resetBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');

        // Click events
        listenBtn.addEventListener('click', () => {
            this.toggleListening();
        });

        resetBtn.addEventListener('click', () => {
            this.resetApp();
        });

        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Touch events dla mobile
        listenBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.toggleListening();
        });

        resetBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.resetApp();
        });

        fullscreenBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.toggleFullscreen();
        });

        // Ruch oczu
        document.addEventListener('mousemove', (e) => {
            this.moveEyes(e.clientX, e.clientY);
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.moveEyes(touch.clientX, touch.clientY);
            }
        }, { passive: true });

        // Zapobiegaj domyślnej akcji przeglądarki
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupAnimations() {
        // Mrugnięcie co 3-5 sekund
        setInterval(() => {
            if (!this.isListening && !this.isThinking && !this.isTalking) {
                this.blink();
            }
        }, 3000 + Math.random() * 2000);
    }

    moveEyes(x, y) {
        const pupils = document.querySelectorAll('.pupil');
        
        pupils.forEach((pupil) => {
            const eye = pupil.parentElement;
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;
            
            const deltaX = (x - eyeCenterX) / 50;
            const deltaY = (y - eyeCenterY) / 50;
            
            const limit = 8;
            const moveX = Math.max(-limit, Math.min(limit, deltaX));
            const moveY = Math.max(-limit, Math.min(limit, deltaY));
            
            pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    blink() {
        const pupils = document.querySelectorAll('.pupil');
        pupils.forEach(pupil => {
            pupil.style.animation = 'blink 0.3s ease';
            setTimeout(() => {
                pupil.style.animation = '';
            }, 300);
        });
    }

    startListening() {
        if (this.isListening || this.isThinking || this.isTalking) {
            console.log('⚠️ System zajęty, resetowanie...');
            this.resetApp();
            return;
        }
        
        if (!this.recognition) {
            this.updateStatus('Rozpoznawanie mowy niedostępne');
            return;
        }
        
        try {
            // Anuluj syntezę mowy przed rozpoczęciem nasłuchiwania
            window.speechSynthesis.cancel();
            
            console.log('🎤 Uruchamianie rozpoznawania mowy...');
            this.debugLog('Uruchamianie rozpoznawania mowy');
            this.recognition.start();
            
        } catch (error) {
            console.log('❌ Błąd uruchomienia:', error);
            this.debugLog(`Błąd uruchomienia: ${error.message}`);
            this.updateStatus('Błąd mikrofonu');
            this.setNormalStateWithDelay();
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.log('⚠️ Błąd zatrzymywania:', error);
            }
        }
        this.clearTimeout();
        this.isListening = false;
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
            this.setNormalState();
            this.updateStatus('Anulowano słuchanie');
        } else {
            this.startListening();
        }
    }

    resetApp() {
        console.log('🔄 Reset aplikacji');
        this.debugLog('Reset aplikacji');
        
        this.stopListening();
        window.speechSynthesis.cancel();
        
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        
        this.setNormalState();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
    }

    async processUserInput(text) {
        if (!text || text.trim().length === 0) {
            console.log('❌ Pusty tekst');
            this.setNormalState();
            this.updateStatus('Brak tekstu do przetworzenia');
            return;
        }
        
        console.log('🧠 Przetwarzanie:', text);
        this.debugLog(`Przetwarzanie: "${text}"`);
        this.setThinkingState();
        
        try {
            const response = await this.sendToAI(text);
            console.log('🤖 Odpowiedź AI:', response);
            this.debugLog(`Odpowiedź: "${response}"`);
            await this.speakResponse(response);
            
        } catch (error) {
            console.log('❌ Błąd przetwarzania:', error);
            this.debugLog(`Błąd: ${error.message}`);
            this.updateStatus('Błąd przetwarzania');
            this.speakResponse('Przepraszam, wystąpił błąd. Spróbuj ponownie.');
        }
    }

    async sendToAI(userText) {
        try {
            console.log('📤 Wysyłanie do API...');
            this.debugLog(`Wysyłanie: "${userText}"`);
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText })
            });

            console.log('📥 Status:', response.status);
            this.debugLog(`Status API: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Otrzymano odpowiedź');
            
            return data.response;
            
        } catch (error) {
            console.log('❌ Błąd API:', error);
            this.debugLog(`Błąd API: ${error.message}`);
            return 'Przepraszam, nie mogę się połączyć z systemem. Spróbuj ponownie.';
        }
    }

    async speakResponse(text) {
        if (!text || text.trim().length === 0) {
            console.log('❌ Pusty tekst do powiedzenia');
            this.setNormalState();
            return;
        }
        
        console.log('🗣️ Rozpoczynam mówienie...');
        this.debugLog(`Mówię: "${text}"`);
        
        this.stopListening();
        window.speechSynthesis.cancel();
        
        this.setTalkingState();
        
        return new Promise((resolve) => {
            const cleanText = this.cleanTextForSpeech(text);
            
            if (!window.speechSynthesis) {
                console.log('❌ TTS nieobsługiwane');
                this.setNormalState();
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'pl-PL';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            utterance.onstart = () => {
                console.log('🔊 Rozpoczęto mowę');
                this.debugLog('Synteza mowy rozpoczęta');
            };
            
            utterance.onend = () => {
                console.log('🔇 Zakończono mowę');
                this.debugLog('Synteza mowy zakończona');
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            utterance.onerror = (event) => {
                console.log('❌ Błąd mowy:', event.error);
                this.debugLog(`Błąd TTS: ${event.error}`);
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            // Krótkie opóźnienie dla stabilności
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 200);
        });
    }

    cleanTextForSpeech(text) {
        if (!text) return '';
        // Usuń emotki i specjalne znaki, zostaw polskie znaki
        return text
            .replace(/[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ.,!?;:()\-+=\/]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    clearTimeout() {
        if (this.speechTimeout) {
            clearTimeout(this.speechTimeout);
            this.speechTimeout = null;
        }
    }

    setNormalState() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.robotFace.className = 'robot-face';
        const micBtn = document.getElementById('listenBtn');
        micBtn.style.animation = '';
        micBtn.textContent = '🎤';
    }

    setNormalStateWithDelay() {
        setTimeout(() => {
            this.setNormalState();
            this.updateStatus('Kliknij 🎤 aby rozmawiać');
        }, 2000);
    }

    setListeningState() {
        this.robotFace.className = 'robot-face listening';
        const micBtn = document.getElementById('listenBtn');
        micBtn.style.animation = 'pulse 1.5s infinite';
        micBtn.textContent = '🔴';
    }

    setThinkingState() {
        this.isThinking = true;
        this.isListening = false;
        this.robotFace.className = 'robot-face thinking';
        this.updateStatus('Myślę...');
    }

    setTalkingState() {
        this.isThinking = false;
        this.isTalking = true;
        this.robotFace.className = 'robot-face talking';
        this.updateStatus('Mówię...');
    }

    updateStatus(message) {
        this.status.textContent = message;
    }

    debugLog(message) {
        console.log(message);
        const timestamp = new Date().toLocaleTimeString();
        this.debugText.innerHTML = `[${timestamp}] ${message}<br>` + this.debugText.innerHTML;
        
        // Ogranicz do 6 wiadomości
        const lines = this.debugText.innerHTML.split('<br>');
        if (lines.length > 6) {
            this.debugText.innerHTML = lines.slice(0, 6).join('<br>');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('❌ Błąd pełnego ekranu:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicjalizacja aplikacji Robo');
    new RobotApp();
});