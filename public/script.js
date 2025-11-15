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
        this.updateStatus('Gotowy do rozmowy');
        
        // Pokaz debug panel w development
        if (window.location.hostname === 'localhost') {
            this.debugPanel.style.display = 'block';
        }
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.updateStatus('Przeglądarka nie obsługuje rozpoznawania mowy');
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
        };

        this.recognition.onresult = async (event) => {
            const text = event.results[0][0].transcript;
            this.updateStatus(`Usłyszałem: "${text}"`);
            this.debugLog(`Rozpoznano: ${text}`);
            
            await this.processUserInput(text);
        };

        this.recognition.onerror = (event) => {
            this.debugLog(`Błąd rozpoznawania: ${event.error}`);
            this.setNormalState();
            this.updateStatus('Błąd rozpoznawania mowy');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (!this.isThinking && !this.isTalking) {
                this.setNormalState();
            }
        };
    }

    setupEventListeners() {
        document.getElementById('listenBtn').addEventListener('click', () => {
            this.toggleListening();
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
    }

    setupAnimations() {
        // Losowe mruganie
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
            
            // Ogranicz ruch źrenic
            const limit = 10;
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

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
            this.setNormalState();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                this.debugLog(`Błąd startu rozpoznawania: ${error}`);
            }
        }
    }

    async processUserInput(text) {
        this.setThinkingState();
        
        try {
            const response = await this.sendToAI(text);
            await this.speakResponse(response);
        } catch (error) {
            this.debugLog(`Błąd przetwarzania: ${error}`);
            this.updateStatus('Błąd przetwarzania żądania');
            this.speakResponse('Przepraszam, wystąpił błąd. Spróbuj ponownie.');
        }
    }

    async sendToAI(userText) {
        this.debugLog(`Wysyłanie do AI: ${userText}`);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.debugLog(`Otrzymano odpowiedź: ${data.response}`);
            return data.response;
            
        } catch (error) {
            this.debugLog(`Błąd API: ${error}`);
            return 'Przepraszam, nie mogę się teraz połączyć z systemem. Spróbuj ponownie za chwilę.';
        }
    }

    async speakResponse(text) {
        this.setTalkingState();
        
        return new Promise((resolve) => {
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
                this.updateStatus('Gotowy do rozmowy');
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.debugLog(`Błąd TTS: ${event.error}`);
                this.setNormalState();
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