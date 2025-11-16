class RobotApp {
    constructor() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.recognition = null;
        this.retryCount = 0;
        this.maxRetries = 2;
        
        this.robotFace = document.getElementById('robotFace');
        this.mouth = document.getElementById('mouth');
        this.status = document.getElementById('status');
        this.debugPanel = document.getElementById('debugPanel');
        this.debugText = document.getElementById('debugText');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
        this.setupSpeechRecognition();
        
        console.log('🤖 Robot initialized');
        console.log('📱 Platform:', this.detectPlatform());
        
        // Debug tylko na localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.debugPanel.style.display = 'block';
        }
    }

    detectPlatform() {
        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
        if (/Android/i.test(ua)) return 'Android';
        return 'Desktop';
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.updateStatus('Twoja przeglądarka nie obsługuje rozpoznawania mowy');
            console.log('❌ Speech Recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'pl-PL';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            console.log('🎤 Listening started');
            this.isListening = true;
            this.setListeningState();
            this.updateStatus('Mów teraz...');
        };

        this.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            console.log('🗣️ Recognized:', text);
            this.updateStatus(`Usłyszałem: "${text}"`);
            this.isListening = false;
            
            setTimeout(() => {
                this.processUserInput(text);
            }, 500);
        };

        this.recognition.onerror = (event) => {
            console.log('❌ Recognition error:', event.error);
            this.isListening = false;
            this.setNormalState();
            
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                this.updateStatus('Brak uprawnień do mikrofonu. Włącz mikrofon w ustawieniach.');
            } else if (event.error === 'no-speech') {
                this.updateStatus('Nie usłyszałem nic. Spróbuj ponownie.');
            } else if (event.error === 'network') {
                this.updateStatus('Błąd połączenia. Sprawdź internet.');
            } else {
                this.updateStatus('Błąd rozpoznawania mowy');
            }
            
            setTimeout(() => {
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
            }, 2000);
        };

        this.recognition.onend = () => {
            console.log('⏹️ Listening ended');
            this.isListening = false;
            if (!this.isThinking && !this.isTalking) {
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
            }
        };
    }

    setupEventListeners() {
        document.getElementById('listenBtn').addEventListener('click', () => {
            this.toggleListening();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetApp();
        });

        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Ruch oczu
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
            // Wyczyść kolejkę syntezy mowy przed rozpoczęciem słuchania
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            this.recognition.start();
        } catch (error) {
            console.log('❌ Start error:', error);
            this.updateStatus('Błąd mikrofonu. Spróbuj ponownie.');
            setTimeout(() => {
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
            }, 2000);
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
            this.setNormalState();
            this.updateStatus('Anulowano');
            setTimeout(() => {
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
            }, 1000);
        } else {
            this.startListening();
        }
    }

    resetApp() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.log('Stop recognition error:', e);
            }
        }
        
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.retryCount = 0;
        
        this.setNormalState();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
    }

    async processUserInput(text) {
        console.log('🧠 Processing:', text);
        this.setThinkingState();
        this.retryCount = 0;
        
        try {
            const response = await this.sendToAI(text);
            console.log('🤖 Response:', response);
            await this.speakResponse(response);
        } catch (error) {
            console.log('❌ Process error:', error);
            this.updateStatus('Błąd przetwarzania');
            await this.speakResponse('Przepraszam, spróbuj ponownie.');
        }
    }

    async sendToAI(userText) {
        const maxRetries = this.maxRetries;
        let lastError = null;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 API call attempt ${attempt + 1}/${maxRetries + 1}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
                
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: userText }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.response) {
                    console.log('✅ API success, source:', data.source);
                    return data.response;
                } else {
                    throw new Error('Empty response from API');
                }
                
            } catch (error) {
                lastError = error;
                console.log(`❌ API attempt ${attempt + 1} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    // Poczekaj przed kolejną próbą (exponential backoff)
                    const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.log('❌ All API attempts failed');
                }
            }
        }
        
        // Jeśli wszystkie próby zawiodły, zwróć fallback response
        console.log('⚠️ Using fallback response');
        return this.getFallbackResponse(userText);
    }

    getFallbackResponse(text) {
        const message = (text || '').toLowerCase().trim();
        
        if (/(cześć|hej|witaj|siema|hello|hi|dzień dobry)/i.test(message)) {
            return "Cześć! Jestem Robo! Mam problem z połączeniem, ale i tak możemy pogadać!";
        }
        
        return "Mam problem z połączeniem, ale jestem tu dla Ciebie! Spróbuj ponownie za chwilę.";
    }

    async speakResponse(text) {
        this.setTalkingState();
        
        return new Promise((resolve) => {
            const cleanText = text
                .replace(/[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ.,!?;:()\-+=\/]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            if (!window.speechSynthesis) {
                console.log('❌ Speech synthesis not available');
                this.setNormalState();
                resolve();
                return;
            }

            // Wyczyść kolejkę przed mówieniem
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'pl-PL';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // iOS fix: wybierz konkretny głos jeśli dostępny
            const voices = window.speechSynthesis.getVoices();
            const polishVoice = voices.find(voice => voice.lang.startsWith('pl'));
            if (polishVoice) {
                utterance.voice = polishVoice;
            }
            
            utterance.onend = () => {
                console.log('✅ Speech finished');
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            utterance.onerror = (error) => {
                console.log('❌ Speech error:', error);
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
                resolve();
            };
            
            // iOS fix: opóźnienie przed mówieniem
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
                console.log('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RobotApp();
});

// iOS fix: load voices
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('📢 Available voices:', voices.length);
    };
}
