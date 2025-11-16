class RobotApp {
    constructor() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.speechTimeout = null;
        this.lastSpeechTime = null;
        
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
        
        this.debugLog('Aplikacja gotowa');
        
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
        this.recognition.interimResults = true;
        this.recognition.lang = 'pl-PL';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.setListeningState();
            this.updateStatus('Mów teraz...');
            this.debugLog('Speech recognition started');
            this.startSpeechTimeout();
        };

        this.recognition.onresult = (event) => {
            clearTimeout(this.speechTimeout);
            
            let finalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += transcript;
                } else {
                    interimText += transcript;
                }
            }

            this.lastSpeechTime = Date.now();
            
            if (finalText) {
                this.debugLog(`Rozpoznano FINAL: ${finalText}`);
                this.processFinalText(finalText);
            } else if (interimText) {
                this.debugLog(`Rozpoznano INTERIM: ${interimText}`);
                this.updateStatus(`Słyszę: "${interimText}"`);
                this.startSpeechTimeout();
            }
        };

        this.recognition.onerror = (event) => {
            this.debugLog(`Błąd rozpoznawania: ${event.error}`);
            clearTimeout(this.speechTimeout);
            this.setNormalState();
            this.updateStatus('Kliknij 🎤 aby rozmawiać');
        };

        this.recognition.onend = () => {
            this.debugLog('Speech recognition ended');
            clearTimeout(this.speechTimeout);
            this.isListening = false;
            
            if (!this.isThinking && !this.isTalking) {
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
            }
        };
    }

    startSpeechTimeout() {
        clearTimeout(this.speechTimeout);
        this.speechTimeout = setTimeout(() => {
            this.debugLog('Speech timeout - no speech detected');
            if (this.isListening) {
                this.recognition.stop();
            }
        }, 3000);
    }

    async processFinalText(text) {
        this.updateStatus(`Usłyszałem: "${text}"`);
        
        try {
            this.recognition.stop();
        } catch (e) {}
        
        this.isListening = false;
        await this.processUserInput(text);
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

        document.addEventListener('mousemove', (e) => {
            this.moveEyes(e.clientX, e.clientY);
        });

        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.moveEyes(touch.clientX, touch.clientY);
        });
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

    startListening() {
        if (this.isListening || this.isThinking || this.isTalking) {
            return;
        }
        
        if (!this.recognition) {
            this.updateStatus('Rozpoznawanie mowy niedostępne');
            return;
        }
        
        try {
            this.recognition.stop();
        } catch (e) {}
        
        clearTimeout(this.speechTimeout);
        this.lastSpeechTime = null;
        
        setTimeout(() => {
            try {
                this.recognition.start();
                this.debugLog('Manual start listening');
            } catch (error) {
                this.debugLog(`Błąd startu: ${error}`);
                this.updateStatus('Błąd mikrofonu');
                this.setNormalState();
            }
        }, 100);
    }

    toggleListening() {
        if (this.isListening) {
            this.debugLog('Manual stop - user clicked mic again');
            clearTimeout(this.speechTimeout);
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
            } catch (error) {}
        }
        
        window.speechSynthesis.cancel();
        clearTimeout(this.speechTimeout);
        
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
            
            return data.response;
            
        } catch (error) {
            this.debugLog(`💥 Błąd fetch: ${error.message}`);
            return 'Przepraszam, nie mogę się teraz połączyć z systemem. Spróbuj ponownie.';
        }
    }

    async speakResponse(text) {
        if (this.isListening) {
            this.recognition.stop();
        }
        window.speechSynthesis.cancel();
        
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
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.debugLog(`Błąd TTS: ${event.error}`);
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 100);
        });
    }

    setNormalState() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.robotFace.className = 'robot-face';
        const micBtn = document.getElementById('listenBtn');
        micBtn.style.animation = '';
    }

    setListeningState() {
        this.robotFace.className = 'robot-face listening';
        const micBtn = document.getElementById('listenBtn');
        micBtn.style.animation = 'pulse 1s infinite';
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

document.addEventListener('DOMContentLoaded', () => {
    new RobotApp();
});