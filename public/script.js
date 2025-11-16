class RobotApp {
    constructor() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.continuousMode = false;
        this.recognition = null;
        this.microphonePermissionGranted = false;
        
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
        this.updateStatus('Kliknij ▶️ Start aby rozpocząć rozmowę');
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
            this.microphonePermissionGranted = true;
            this.setListeningState();
            if (this.continuousMode) {
                this.updateStatus('Tryb ciągły - Mów teraz...');
            } else {
                this.updateStatus('Mów teraz...');
            }
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
            
            if (event.error === 'not-allowed') {
                this.updateStatus('Brak uprawnień do mikrofonu');
                this.microphonePermissionGranted = false;
                this.stopContinuousMode();
            } else if (event.error === 'no-speech') {
                // W trybie ciągłym, po prostu spróbuj ponownie
                if (this.continuousMode) {
                    console.log('⚠️ No speech detected, restarting...');
                    setTimeout(() => {
                        if (this.continuousMode && !this.isThinking && !this.isTalking) {
                            this.startListening();
                        }
                    }, 500);
                } else {
                    this.setNormalState();
                    this.updateStatus('Nie wykryto mowy');
                    setTimeout(() => {
                        this.updateStatus('Kliknij 🎤 aby rozmawiać');
                    }, 2000);
                }
            } else {
                if (this.continuousMode) {
                    // W trybie ciągłym, kontynuuj po błędzie
                    setTimeout(() => {
                        if (this.continuousMode && !this.isThinking && !this.isTalking) {
                            this.startListening();
                        }
                    }, 1000);
                } else {
                    this.setNormalState();
                    this.updateStatus('Błąd rozpoznawania mowy');
                    setTimeout(() => {
                        this.updateStatus('Kliknij 🎤 aby rozmawiać');
                    }, 2000);
                }
            }
        };

        this.recognition.onend = () => {
            console.log('⏹️ Listening ended');
            this.isListening = false;
            
            // Jeśli tryb ciągły jest aktywny i nie jesteśmy w trakcie myślenia/mówienia
            if (this.continuousMode && !this.isThinking && !this.isTalking) {
                // Automatycznie rozpocznij słuchanie ponownie
                setTimeout(() => {
                    if (this.continuousMode && !this.isThinking && !this.isTalking) {
                        this.startListening();
                    }
                }, 300);
            } else if (!this.isThinking && !this.isTalking) {
                this.setNormalState();
                this.updateStatus('Kliknij 🎤 aby rozmawiać');
            }
        };
    }

    setupEventListeners() {
        // Start Continuous Mode button
        document.getElementById('startContinuousBtn').addEventListener('click', () => {
            this.startContinuousMode();
        });

        // Stop Continuous Mode button
        document.getElementById('stopContinuousBtn').addEventListener('click', () => {
            this.stopContinuousMode();
        });

        // Single listen button
        document.getElementById('listenBtn').addEventListener('click', () => {
            if (!this.continuousMode) {
                this.toggleListening();
            }
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

    async startContinuousMode() {
        if (this.continuousMode) return;
        
        console.log('🔄 Starting continuous mode');
        this.continuousMode = true;
        
        // Update UI
        document.getElementById('startContinuousBtn').style.display = 'none';
        document.getElementById('stopContinuousBtn').style.display = 'flex';
        document.getElementById('listenBtn').disabled = true;
        document.getElementById('listenBtn').style.opacity = '0.5';
        document.body.classList.add('continuous-active');
        
        this.updateStatus('Tryb ciągły aktywny - Poproszę o dostęp do mikrofonu...');
        
        // Request microphone permission and start listening
        setTimeout(() => {
            this.startListening();
        }, 500);
    }

    stopContinuousMode() {
        if (!this.continuousMode) return;
        
        console.log('⏹️ Stopping continuous mode');
        this.continuousMode = false;
        
        // Stop any ongoing listening
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        // Stop any ongoing speech
        window.speechSynthesis.cancel();
        
        // Update UI
        document.getElementById('startContinuousBtn').style.display = 'flex';
        document.getElementById('stopContinuousBtn').style.display = 'none';
        document.getElementById('listenBtn').disabled = false;
        document.getElementById('listenBtn').style.opacity = '1';
        document.body.classList.remove('continuous-active');
        
        this.setNormalState();
        this.updateStatus('Tryb ciągły zatrzymany - Kliknij ▶️ Start aby rozpocząć ponownie');
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
            if (this.continuousMode) {
                this.stopContinuousMode();
            }
            return;
        }
        
        try {
            window.speechSynthesis.cancel();
            this.recognition.start();
        } catch (error) {
            console.log('❌ Start error:', error);
            this.updateStatus('Błąd mikrofonu');
            
            // W trybie ciągłym, spróbuj ponownie po krótkiej przerwie
            if (this.continuousMode) {
                setTimeout(() => {
                    if (this.continuousMode && !this.isThinking && !this.isTalking) {
                        this.startListening();
                    }
                }, 1000);
            }
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
            this.setNormalState();
            this.updateStatus('Anulowano');
        } else {
            this.startListening();
        }
    }

    resetApp() {
        // Stop continuous mode if active
        if (this.continuousMode) {
            this.stopContinuousMode();
        }
        
        if (this.recognition) {
            this.recognition.stop();
        }
        window.speechSynthesis.cancel();
        
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        
        this.setNormalState();
        this.updateStatus('Kliknij ▶️ Start aby rozpocząć rozmowę');
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
            await this.speakResponse('Przepraszam, spróbuj ponownie.');
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
                // W trybie ciągłym, kontynuuj słuchanie
                if (this.continuousMode) {
                    setTimeout(() => {
                        this.startListening();
                    }, 500);
                }
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'pl-PL';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            
            utterance.onend = () => {
                this.setNormalState();
                
                // W trybie ciągłym, automatycznie rozpocznij słuchanie ponownie
                if (this.continuousMode) {
                    this.updateStatus('Tryb ciągły - Czekam na twoją odpowiedź...');
                    setTimeout(() => {
                        if (this.continuousMode) {
                            this.startListening();
                        }
                    }, 500);
                } else {
                    this.updateStatus('Kliknij 🎤 aby rozmawiać');
                }
                
                resolve();
            };
            
            utterance.onerror = () => {
                this.setNormalState();
                
                // W trybie ciągłym, kontynuuj mimo błędu
                if (this.continuousMode) {
                    this.updateStatus('Tryb ciągły - Czekam na twoją odpowiedź...');
                    setTimeout(() => {
                        if (this.continuousMode) {
                            this.startListening();
                        }
                    }, 500);
                } else {
                    this.updateStatus('Kliknij 🎤 aby rozmawiać');
                }
                
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
        const micBtn = document.getElementById('listenBtn');
        micBtn.style.animation = '';
        micBtn.textContent = '🎤';
    }

    setListeningState() {
        this.robotFace.className = 'robot-face listening';
        const micBtn = document.getElementById('listenBtn');
        if (!this.continuousMode) {
            micBtn.style.animation = 'pulse 1s infinite';
            micBtn.textContent = '🔴';
        }
    }

    setThinkingState() {
        this.isThinking = true;
        this.robotFace.className = 'robot-face thinking';
        if (this.continuousMode) {
            this.updateStatus('Tryb ciągły - Myślę...');
        } else {
            this.updateStatus('Myślę...');
        }
    }

    setTalkingState() {
        this.isTalking = true;
        this.robotFace.className = 'robot-face talking';
        if (this.continuousMode) {
            this.updateStatus('Tryb ciągły - Mówię...');
        } else {
            this.updateStatus('Mówię...');
        }
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
