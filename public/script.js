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
        
        console.log('🤖 Robot initialized');
        
        // Pokaż debug panel na localhost i w development
        if (window.location.hostname === 'localhost' || window.location.protocol === 'http:') {
            this.debugPanel.style.display = 'block';
        }
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.updateStatus('Przeglądarka nie obsługuje rozpoznawania mowy');
            console.error('❌ Speech Recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'pl-PL';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            console.log('🎤 Rozpoczęto słuchanie');
            this.isListening = true;
            this.setListeningState();
            this.updateStatus('Mów teraz...');
        };

        this.recognition.onresult = async (event) => {
            if (event.results.length > 0) {
                const text = event.results[0][0].transcript;
                console.log('🗣️ Rozpoznano:', text);
                
                this.updateStatus(`Usłyszałem: "${text}"`);
                this.isListening = false;
                
                await this.processUserInput(text);
            }
        };

        this.recognition.onerror = (event) => {
            console.log('❌ Błąd rozpoznawania:', event.error);
            
            // Specyficzne komunikaty dla różnych błędów
            if (event.error === 'not-allowed') {
                this.updateStatus('Brak uprawnień do mikrofonu');
                this.debugLog('❌ Microphone permission denied');
            } else if (event.error === 'audio-capture') {
                this.updateStatus('Nie znaleziono mikrofonu');
                this.debugLog('❌ No microphone found');
            } else {
                this.updateStatus('Błąd rozpoznawania mowy');
                this.debugLog(`❌ Speech error: ${event.error}`);
            }
            
            this.setNormalState();
        };

        this.recognition.onend = () => {
            console.log('⏹️ Zakończono słuchanie');
            this.isListening = false;
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

        // Ulepszone event listeners dla mobile
        listenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleListening();
        });

        listenBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleListening();
        });

        resetBtn.addEventListener('click', () => {
            this.resetListening();
        });

        resetBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.resetListening();
        });

        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        fullscreenBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.toggleFullscreen();
        });

        // Ruch oczu - ulepszone dla mobile
        document.addEventListener('mousemove', (e) => {
            this.moveEyes(e.clientX, e.clientY);
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.moveEyes(touch.clientX, touch.clientY);
            }
        }, { passive: true });

        // Zapobiegaj zoomowaniu na dłuższe tapnięcia
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    setupAnimations() {
        setInterval(() => {
            if (!this.isListening && !this.isThinking && !this.isTalking) {
                this.blink();
            }
        }, 3000);
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
            console.log('⏹️ Already busy, stopping current session');
            this.recognition.stop();
            return;
        }
        
        if (!this.recognition) {
            this.updateStatus('Rozpoznawanie mowy niedostępne');
            return;
        }
        
        try {
            // Anuluj wszelką syntezę mowy przed rozpoczęciem nasłuchiwania
            window.speechSynthesis.cancel();
            
            console.log('🎤 Ręczne uruchomienie słuchania');
            this.recognition.start();
            
        } catch (error) {
            console.log('❌ Błąd uruchomienia:', error);
            this.updateStatus('Błąd mikrofonu - sprawdź uprawnienia');
            this.setNormalState();
            
            // Pokaż alert z instrukcją dla użytkownika
            setTimeout(() => {
                alert('Aby używać mikrofonu na mobile:\n1. Kliknij 🎤\n2. Zezwól na dostęp do mikrofonu\n3. Upewnij się, że masz połączenie z internetem');
            }, 500);
        }
    }

    toggleListening() {
        if (this.isListening) {
            console.log('⏹️ Ręczne zatrzymanie słuchania');
            this.recognition.stop();
            this.setNormalState();
            this.updateStatus('Kliknij 🎤 aby rozmawiać');
        } else {
            this.startListening();
        }
    }

    resetListening() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.log('⚠️ Error stopping recognition:', error);
            }
        }
        
        window.speechSynthesis.cancel();
        
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.setNormalState();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
        console.log('🔄 Reset');
        this.debugLog('System zresetowany');
    }

    async processUserInput(text) {
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
            this.debugLog(`Błąd: ${error.message}`);
            this.updateStatus('Błąd przetwarzania');
            this.speakResponse('Przepraszam, wystąpił błąd. Spróbuj ponownie.');
        }
    }

    async sendToAI(userText) {
        try {
            console.log('📤 Wysyłanie do API:', userText);
            this.debugLog(`Wysyłanie: "${userText}"`);
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText })
            });

            console.log('📥 Status odpowiedzi:', response.status);
            this.debugLog(`Status API: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Otrzymano odpowiedź:', data);
            
            return data.response;
            
        } catch (error) {
            console.log('❌ Błąd fetch:', error);
            this.debugLog(`Błąd fetch: ${error.message}`);
            return 'Przepraszam, nie mogę się teraz połączyć z systemem. Spróbuj ponownie.';
        }
    }

    async speakResponse(text) {
        console.log('🗣️ Rozpoczynam mówienie:', text);
        this.debugLog(`Mówię: "${text}"`);
        
        // Zatrzymaj wszystko przed mówieniem
        if (this.isListening) {
            this.recognition.stop();
        }
        window.speechSynthesis.cancel();
        
        this.setTalkingState();
        
        return new Promise((resolve) => {
            const cleanText = this.removeEmojis(text);
            console.log('🧹 Tekst po usunięciu emotek:', cleanText);
            
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
                console.log('❌ Błąd TTS:', event.error);
                this.debugLog(`Błąd TTS: ${event.error}`);
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            // Sprawdź czy TTS jest dostępny
            if (!window.speechSynthesis) {
                console.log('❌ TTS not supported');
                this.debugLog('TTS nieobsługiwane');
                this.setNormalState();
                this.updateStatus('Synteza mowy niedostępna');
                resolve();
                return;
            }
            
            window.speechSynthesis.speak(utterance);
        });
    }

    removeEmojis(text) {
        if (!text) return '';
        
        return text
            .replace(/[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ.,!?;:()\-+=\/]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
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
        this.robotFace.className = 'robot-face listening';
        const micBtn = document.getElementById('listenBtn');
        micBtn.style.animation = 'pulse 1s infinite';
        micBtn.textContent = '🔴';
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
        const timestamp = new Date().toLocaleTimeString();
        this.debugText.innerHTML = `[${timestamp}] ${message}<br>${this.debugText.innerHTML}`;
        
        // Ogranicz do 10 wiadomości
        const lines = this.debugText.innerHTML.split('<br>');
        if (lines.length > 10) {
            this.debugText.innerHTML = lines.slice(0, 10).join('<br>');
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

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    new RobotApp();
});

// Zapobiegaj domyślnej akcji na touch events
document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });