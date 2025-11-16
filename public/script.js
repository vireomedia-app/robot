class RobotApp {
    constructor() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        
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
        
        // NIE uruchamiaj automatycznie słuchania - czekaj na kliknięcie
        this.debugLog('Aplikacja gotowa - czekam na kliknięcie mikrofonu');
        
        if (window.location.hostname === 'localhost') {
            this.debugPanel.style.display = 'block';
        }
        
        // Dodaj obsługę orientacji ekranu
        this.setupOrientationHandler();
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.updateStatus('Przeglądarka nie obsługuje rozpoznawania mowy');
            this.debugLog('SpeechRecognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'pl-PL';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.setListeningState();
            this.updateStatus('Słucham...');
            this.debugLog('Speech recognition started');
        };

        this.recognition.onresult = async (event) => {
            const text = event.results[0][0].transcript;
            this.updateStatus(`Usłyszałem: "${text}"`);
            this.debugLog(`Rozpoznano: ${text}`);
            
            await this.processUserInput(text);
        };

        this.recognition.onerror = (event) => {
            this.debugLog(`Błąd rozpoznawania: ${event.error}`);
            
            // Automatyczne restartowanie przy niektórych błędach
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                this.debugLog('Automatyczne restartowanie rozpoznawania...');
                setTimeout(() => {
                    if (!this.isThinking && !this.isTalking) {
                        this.setNormalState();
                        this.updateStatus('Kliknij 🎤 aby rozmawiać');
                    }
                }, 1000);
            }
            
            this.setNormalState();
            this.updateStatus('Błąd rozpoznawania mowy');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.debugLog('Speech recognition ended');
            
            // Automatyczne restartowanie jeśli nie jesteśmy w trakcie procesowania
            if (!this.isThinking && !this.isTalking) {
                setTimeout(() => {
                    this.setNormalState();
                    this.updateStatus('Kliknij 🎤 aby rozmawiać');
                }, 500);
            }
        };
    }

    setupEventListeners() {
        document.getElementById('listenBtn').addEventListener('click', () => {
            this.toggleListening();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetListening();
        });

        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Ruch myszą - oczy śledzą kursor
        document.addEventListener('mousemove', (e) => {
            this.moveEyes(e.clientX, e.clientY);
        });

        // Ruch dotykowy - dla telefonów
        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.moveEyes(touch.clientX, touch.clientY);
        });

        // Zapobieganie zoomowaniu na telefonach
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    }

    setupAnimations() {
        // Losowe mruganie tylko gdy nieaktywny
        setInterval(() => {
            if (!this.isListening && !this.isThinking && !this.isTalking) {
                this.blink();
            }
        }, 3000);
    }

    setupOrientationHandler() {
        // Obsługa zmiany orientacji ekranu
        window.addEventListener('resize', () => {
            this.debugLog(`Ekran: ${window.innerWidth}x${window.innerHeight}`);
        });
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
            
            // Ogranicz ruch źrenic
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

    startListening() {
        if (this.isListening || this.isThinking || this.isTalking) {
            this.debugLog('Cannot start listening - busy');
            return;
        }
        
        // Sprawdź czy przeglądarka wspiera rozpoznawanie mowy
        if (!this.recognition) {
            this.updateStatus('Rozpoznawanie mowy niedostępne');
            this.debugLog('SpeechRecognition not available');
            return;
        }
        
        try {
            this.recognition.start();
            this.debugLog('Manual start listening - user initiated');
        } catch (error) {
            this.debugLog(`Błąd startu rozpoznawania: ${error}`);
            this.updateStatus('Błąd mikrofonu');
            
            // Spróbuj ponownie po chwili
            setTimeout(() => {
                if (!this.isThinking && !this.isTalking) {
                    this.setNormalState();
                    this.updateStatus('Kliknij 🎤 aby rozmawiać');
                }
            }, 1000);
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
            this.setNormalState();
            this.updateStatus('Kliknij 🎤 aby rozmawiać');
            this.debugLog('Manual stop listening');
        } else {
            this.startListening();
        }
    }

    resetListening() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (error) {
                // Ignoruj błędy przy zatrzymywaniu
            }
        }
        
        // Zatrzymaj mowienie
        window.speechSynthesis.cancel();
        
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.setNormalState();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
        this.debugLog('Manual reset');
    }

    async processUserInput(text) {
        this.setThinkingState();
        
        try {
            const response = await this.sendToAI(text);
            await this.speakResponse(response);
        } catch (error) {
            this.debugLog(`Błąd przetwarzania: ${error}`);
            this.updateStatus('Błąd przetwarzania');
            this.speakResponse('Przepraszam, wystąpił błąd. Spróbuj ponownie.');
        }
    }

    async sendToAI(userText) {
        this.debugLog(`📤 Wysyłanie: "${userText}"`);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText })
            });

            this.debugLog(`📥 Status odpowiedzi: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.debugLog(`✅ Otrzymano: ${data.response}`);
            
            if (data.error) {
                this.debugLog(`❌ Błąd API: ${data.error}`);
            }
            
            return data.response;
            
        } catch (error) {
            this.debugLog(`💥 Błąd fetch: ${error.message}`);
            return 'Przepraszam, nie mogę się teraz połączyć z systemem. Spróbuj ponownie.';
        }
    }

    async speakResponse(text) {
        this.setTalkingState();
        
        return new Promise((resolve) => {
            // Zatrzymaj poprzednie mowienie
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pl-PL';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            
            utterance.onstart = () => {
                this.debugLog(`Rozpoczynam mówienie: ${text}`);
            };
            
            utterance.onend = () => {
                this.debugLog('Zakończono mówienie');
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.debugLog(`Błąd TTS: ${event.error}`);
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            window.speechSynthesis.speak(utterance);
        });
    }

    setNormalState() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.robotFace.className = 'robot-face';
    }

    setListeningState() {
        this.robotFace.className = 'robot-face listening';
    }

    setThinkingState() {
        this.isThinking = true;
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
        this.debugText.textContent = message;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                this.debugLog(`Błąd pełnego ekranu: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Inicjalizacja aplikacji po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    new RobotApp();
});

// Obsługa PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}