class RobotApp {
    constructor() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.continuousMode = false; // NOWA FUNKCJA: Tryb ciągłego nasłuchiwania
        this.recognition = null;
        
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
        
        // Debug tylko na localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.debugPanel.style.display = 'block';
        }
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
            
            if (event.error === 'not-allowed') {
                this.updateStatus('Brak uprawnień do mikrofonu');
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
            
            // Sprawdź, czy tryb ciągły jest aktywny
            if (this.continuousMode) {
                console.log('🔄 Tryb ciągły aktywny - timeout ciszy wykryty');
                
                // Jeśli robot nie myśli ani nie mówi, automatycznie wznów nasłuchiwanie
                if (!this.isThinking && !this.isTalking) {
                    console.log('🔄 Automatyczne wznowienie nasłuchiwania po ciszy (1.5s)...');
                    this.updateStatus('Tryb ciągły: czekam na Twoją wypowiedź...');
                    
                    // Wznów nasłuchiwanie po krótkim opóźnieniu
                    setTimeout(() => {
                        // Sprawdź ponownie, czy tryb ciągły jest nadal aktywny
                        if (this.continuousMode && !this.isListening && !this.isThinking && !this.isTalking) {
                            console.log('🔄 Wznawianie nasłuchiwania...');
                            this.startListening();
                        }
                    }, 1500);
                } else {
                    // Robot myśli lub mówi - nasłuchiwanie zostanie wznowione przez handleAfterSpeaking()
                    console.log('🔄 Robot zajęty (myśli/mówi) - nasłuchiwanie zostanie wznowione później');
                }
            } else {
                // Normalny tryb - bez automatycznego wznowienia
                if (!this.isThinking && !this.isTalking) {
                    this.setNormalState();
                    this.updateStatus('Kliknij 🎤 aby rozmawiać');
                }
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
            window.speechSynthesis.cancel();
            this.recognition.start();
        } catch (error) {
            console.log('❌ Start error:', error);
            this.updateStatus('Błąd mikrofonu');
        }
    }

    toggleListening() {
        // Jeśli tryb ciągły jest aktywny, wyłącz go
        if (this.continuousMode) {
            console.log('🔄 Wyłączanie trybu ciągłego');
            this.continuousMode = false;
            if (this.isListening) {
                this.recognition.stop();
            }
            this.setNormalState();
            this.updateStatus('Tryb ciągły wyłączony - kliknij 🎤 aby włączyć');
            return;
        }
        
        // Jeśli normalnie słucha, anuluj
        if (this.isListening) {
            this.recognition.stop();
            this.setNormalState();
            this.updateStatus('Anulowano');
            return;
        }
        
        // Włącz tryb ciągły i zacznij słuchać
        console.log('🔄 Włączanie trybu ciągłego');
        this.continuousMode = true;
        this.updateStatus('Tryb ciągły WŁĄCZONY - kliknij ponownie aby wyłączyć');
        
        // Czekaj chwilę przed rozpoczęciem nasłuchiwania
        setTimeout(() => {
            if (this.continuousMode) {
                this.startListening();
            }
        }, 1000);
    }

    resetApp() {
        console.log('🔄 Reset aplikacji');
        
        if (this.recognition) {
            this.recognition.stop();
        }
        window.speechSynthesis.cancel();
        
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.continuousMode = false; // Wyłącz tryb ciągły przy resecie
        
        this.setNormalState();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
    }

    async processUserInput(text) {
        console.log('🧠 Processing:', text);
        this.setThinkingState();
        
        try {
            const response = await this.sendToAI(text);
            console.log('🤖 Response:', response);
            await this.speakResponse(response);
        } catch (error) {
            console.log('❌ Process error:', error);
            this.updateStatus('Błąd przetwarzania');
            this.speakResponse('Przepraszam, spróbuj ponownie.');
        }
    }

    async sendToAI(userText) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText })
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
            
        } catch (error) {
            console.log('❌ API error:', error);
            return 'Przepraszam, problem z połączeniem. Spróbuj ponownie.';
        }
    }

    async speakResponse(text) {
        this.setTalkingState();
        
        return new Promise((resolve) => {
            const cleanText = text.replace(/[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ.,!?;:()\-+=\/]/g, ' ').replace(/\s+/g, ' ').trim();
            
            if (!window.speechSynthesis) {
                this.setNormalState();
                this.handleAfterSpeaking();
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'pl-PL';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            
            utterance.onend = () => {
                console.log('🔊 Skończyłem mówić');
                this.setNormalState();
                this.handleAfterSpeaking();
                resolve();
            };
            
            utterance.onerror = () => {
                console.log('❌ Błąd mowy');
                this.setNormalState();
                this.handleAfterSpeaking();
                resolve();
            };
            
            window.speechSynthesis.speak(utterance);
        });
    }
    
    handleAfterSpeaking() {
        // KLUCZOWA FUNKCJA: Jeśli tryb ciągły jest włączony, automatycznie zacznij słuchać ponownie
        if (this.continuousMode) {
            console.log('🔄 Tryb ciągły: Automatyczne wznowienie nasłuchiwania...');
            this.updateStatus('Słucham... (tryb ciągły aktywny)');
            
            // Małe opóźnienie przed ponownym rozpoczęciem nasłuchiwania
            setTimeout(() => {
                if (this.continuousMode && !this.isListening && !this.isThinking && !this.isTalking) {
                    this.startListening();
                }
            }, 1000);
        } else {
            this.updateStatus('Kliknij 🎤 aby rozmawiać');
        }
    }

    setNormalState() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.robotFace.className = 'robot-face';
        const micBtn = document.getElementById('listenBtn');
        
        // Wizualna informacja o trybie ciągłym
        if (this.continuousMode) {
            micBtn.style.animation = 'pulse-slow 2s infinite';
            micBtn.textContent = '🔴';
            micBtn.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        } else {
            micBtn.style.animation = '';
            micBtn.textContent = '🎤';
            micBtn.style.backgroundColor = '';
        }
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
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RobotApp();
});