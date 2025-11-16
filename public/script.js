class RobotApp {
    constructor() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.recognition = null;
        
        this.robotFace = document.getElementById('robotFace');
        this.mouth = document.getElementById('mouth');
        this.status = document.getElementById('status');
        this.debugPanel = document.getElementById('debugPanel');
        this.debugText = document.getElementById('debugText');
        
        this.init();
    }

    init() {
        this.setupSpeechRecognition();
        this.setupEventListeners();
        this.setupAnimations();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
        
        console.log('🤖 Robot initialized');
        
        if (window.location.hostname === 'localhost' || window.location.protocol === 'http:') {
            this.debugPanel.style.display = 'block';
        }
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.updateStatus('Przeglądarka nie obsługuje rozpoznawania mowy');
            console.error('❌ Speech Recognition not supported');
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
        };

        this.recognition.onresult = async (event) => {
            console.log('📝 Wynik rozpoznawania otrzymany');
            if (event.results && event.results.length > 0 && event.results[0].length > 0) {
                const text = event.results[0][0].transcript;
                console.log('🗣️ Rozpoznano:', text);
                this.debugLog(`Rozpoznano: "${text}"`);
                
                this.isListening = false;
                this.updateStatus(`Usłyszałem: "${text}"`);
                
                await this.processUserInput(text);
            } else {
                console.log('❌ Brak rozpoznanego tekstu');
                this.debugLog('Brak rozpoznanego tekstu');
                this.setNormalState();
                this.updateStatus('Nic nie usłyszałem, spróbuj ponownie');
            }
        };

        this.recognition.onerror = (event) => {
            console.log('❌ Błąd rozpoznawania:', event.error);
            
            let errorMessage = 'Błąd rozpoznawania mowy';
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = 'Brak uprawnień do mikrofonu';
                    break;
                case 'audio-capture':
                    errorMessage = 'Nie znaleziono mikrofonu';
                    break;
                case 'network':
                    errorMessage = 'Błąd sieci';
                    break;
                case 'no-speech':
                    errorMessage = 'Nie wykryto mowy';
                    break;
                default:
                    errorMessage = `Błąd: ${event.error}`;
            }
            
            this.updateStatus(errorMessage);
            this.debugLog(`Błąd rozpoznawania: ${event.error}`);
            this.setNormalState();
            
            // Automatyczny reset po błędzie
            setTimeout(() => {
                if (!this.isThinking && !this.isTalking) {
                    this.updateStatus('Kliknij 🎤 aby rozmawiać');
                }
            }, 2000);
        };

        this.recognition.onend = () => {
            console.log('⏹️ Zakończono słuchanie');
            this.debugLog('Zakończono słuchanie');
            this.isListening = false;
            
            // Jeśli nie przetwarzamy i nie mówimy, wróć do stanu normalnego
            if (!this.isThinking && !this.isTalking) {
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
            }
        };
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
            this.resetListening();
        });

        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Touch events dla mobile
        listenBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleListening();
        }, { passive: false });

        resetBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.resetListening();
        }, { passive: false });

        fullscreenBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleFullscreen();
        }, { passive: false });

        // Ruch oczu
        document.addEventListener('mousemove', (e) => {
            this.moveEyes(e.clientX, e.clientY);
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.moveEyes(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        }, { passive: false });

        // Zapobiegaj domyślnej akcji przeglądarki
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                // Zapobiegaj domyślnej akcji
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
        const eyes = document.querySelectorAll('.eye');
        const pupils = document.querySelectorAll('.pupil');
        
        eyes.forEach((eye, index) => {
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;
            
            const deltaX = (x - eyeCenterX) / 50;
            const deltaY = (y - eyeCenterY) / 50;
            
            const limit = 8;
            const moveX = Math.max(-limit, Math.min(limit, deltaX));
            const moveY = Math.max(-limit, Math.min(limit, deltaY));
            
            pupils[index].style.transform = `translate(${moveX}px, ${moveY}px)`;
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

    async startListening() {
        if (this.isListening || this.isThinking || this.isTalking) {
            console.log('⏹️ System zajęty, zatrzymuję obecną sesję');
            this.recognition.stop();
            await this.delay(500);
        }
        
        if (!this.recognition) {
            this.updateStatus('Rozpoznawanie mowy niedostępne');
            return;
        }
        
        try {
            // Anuluj syntezę mowy przed rozpoczęciem nasłuchiwania
            window.speechSynthesis.cancel();
            
            console.log('🎤 Próba uruchomienia słuchania');
            this.debugLog('Uruchamianie rozpoznawania mowy...');
            this.recognition.start();
            
        } catch (error) {
            console.log('❌ Błąd uruchomienia rozpoznawania:', error);
            this.debugLog(`Błąd uruchomienia: ${error.message}`);
            this.updateStatus('Błąd mikrofonu');
            this.setNormalState();
            
            // Spróbuj ponownie po krótkim opóźnieniu
            setTimeout(() => {
                if (!this.isListening) {
                    this.updateStatus('Kliknij 🎤 aby spróbować ponownie');
                }
            }, 1000);
        }
    }

    toggleListening() {
        if (this.isListening) {
            console.log('⏹️ Ręczne zatrzymanie słuchania');
            this.recognition.stop();
            this.setNormalState();
            this.updateStatus('Anulowano słuchanie');
            
            // Powrót do stanu początkowego po krótkim czasie
            setTimeout(() => {
                if (!this.isThinking && !this.isTalking) {
                    this.updateStatus('Kliknij 🎤 aby rozmawiać');
                }
            }, 1500);
            
        } else {
            this.startListening();
        }
    }

    resetListening() {
        console.log('🔄 Reset systemu');
        this.debugLog('Reset systemu');
        
        // Zatrzymaj rozpoznawanie mowy
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.log('⚠️ Błąd przy zatrzymywaniu rozpoznawania:', error);
            }
        }
        
        // Zatrzymaj syntezę mowy
        window.speechSynthesis.cancel();
        
        // Zresetuj stany
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        
        this.setNormalState();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
    }

    async processUserInput(text) {
        if (!text || text.trim().length === 0) {
            console.log('❌ Pusty tekst do przetworzenia');
            this.setNormalState();
            this.updateStatus('Nie usłyszałem co powiedziałeś');
            return;
        }
        
        console.log('🧠 Przetwarzanie:', text);
        this.debugLog(`Przetwarzanie: "${text}"`);
        this.setThinkingState();
        
        try {
            const response = await this.sendToAI(text);
            console.log('🤖 Odpowiedź AI:', response);
            this.debugLog(`Odpowiedź AI: "${response}"`);
            await this.speakResponse(response);
            
        } catch (error) {
            console.log('❌ Błąd przetwarzania:', error);
            this.debugLog(`Błąd przetwarzania: ${error.message}`);
            this.updateStatus('Błąd przetwarzania');
            this.speakResponse('Przepraszam, wystąpił błąd. Spróbuj ponownie.');
        }
    }

    async sendToAI(userText) {
        try {
            console.log('📤 Wysyłanie do API:', userText);
            this.debugLog(`Wysyłanie do API: "${userText}"`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sekund timeout
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            console.log('📥 Status odpowiedzi:', response.status);
            this.debugLog(`Status API: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Otrzymano odpowiedź API');
            
            return data.response;
            
        } catch (error) {
            console.log('❌ Błąd komunikacji z API:', error);
            this.debugLog(`Błąd API: ${error.message}`);
            
            if (error.name === 'AbortError') {
                return 'Przepraszam, odpowiedź zajęła zbyt dużo czasu. Spróbuj ponownie.';
            }
            
            return 'Przepraszam, nie mogę się teraz połączyć z systemem. Spróbuj ponownie za chwilę.';
        }
    }

    async speakResponse(text) {
        if (!text || text.trim().length === 0) {
            console.log('❌ Pusty tekst do powiedzenia');
            this.setNormalState();
            this.updateStatus('Brak odpowiedzi do powiedzenia');
            return;
        }
        
        console.log('🗣️ Rozpoczynam mówienie:', text);
        this.debugLog(`Rozpoczynam mówienie: "${text}"`);
        
        // Zatrzymaj rozpoznawanie mowy przed mówieniem
        if (this.isListening) {
            this.recognition.stop();
        }
        
        // Zatrzymaj wszelką istniejącą syntezę mowy
        window.speechSynthesis.cancel();
        
        this.setTalkingState();
        
        return new Promise((resolve) => {
            const cleanText = this.removeEmojis(text);
            console.log('🧹 Tekst po czyszczeniu:', cleanText);
            
            // Sprawdź czy TTS jest dostępny
            if (!window.speechSynthesis) {
                console.log('❌ TTS nie jest obsługiwane');
                this.debugLog('TTS nieobsługiwane');
                this.setNormalState();
                this.updateStatus('Synteza mowy niedostępna');
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'pl-PL';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            utterance.onstart = () => {
                console.log('🔊 Rozpoczęto syntezę mowy');
                this.debugLog('Synteza mowy rozpoczęta');
            };
            
            utterance.onend = () => {
                console.log('🔇 Zakończono syntezę mowy');
                this.debugLog('Synteza mowy zakończona');
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            utterance.onerror = (event) => {
                console.log('❌ Błąd syntezy mowy:', event.error);
                this.debugLog(`Błąd TTS: ${event.error}`);
                this.setNormalState();
                this.updateStatus('Błąd syntezy mowy');
                resolve();
            };
            
            // Opóźnienie dla stabilności
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 100);
        });
    }

    removeEmojis(text) {
        if (!text) return '';
        
        return text
            .replace(/[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ.,!?;:()\-+=\/]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    setListeningState() {
        this.isListening = true;
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
        this.isListening = false;
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
        
        // Ogranicz do 8 wiadomości
        const lines = this.debugText.innerHTML.split('<br>');
        if (lines.length > 8) {
            this.debugText.innerHTML = lines.slice(0, 8).join('<br>');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('❌ Błąd pełnego ekranu:', err);
                this.debugLog(`Błąd fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicjalizacja aplikacji Robo');
    window.robotApp = new RobotApp();
});

// Globalna obsługa błędów
window.addEventListener('error', (event) => {
    console.error('🚨 Globalny błąd:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Nieobsłużony promise:', event.reason);
});