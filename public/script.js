class RobotApp {
    constructor() {
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.continuousMode = false; // Track if continuous listening mode is active
        this.recognition = null;
        this.conversationHistory = []; // Store conversation history for context
        
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
            
            // Critical errors should stop continuous mode
            if (event.error === 'not-allowed' || event.error === 'no-speech') {
                if (event.error === 'not-allowed') {
                    this.continuousMode = false;
                    this.setNormalState();
                    this.updateStatus('Brak uprawnień do mikrofonu');
                } else if (event.error === 'no-speech' && this.continuousMode) {
                    // In continuous mode, no-speech is expected, just restart
                    console.log('🔄 No speech detected, restarting in continuous mode');
                    setTimeout(() => {
                        if (this.continuousMode) {
                            this.startListening();
                        }
                    }, 500);
                    return;
                } else {
                    this.setNormalState();
                    this.updateStatus('Błąd rozpoznawania mowy');
                }
            } else {
                this.setNormalState();
                this.updateStatus('Błąd rozpoznawania mowy');
            }
            
            if (!this.continuousMode) {
                setTimeout(() => {
                    this.updateStatus('Kliknij 🎤 aby rozmawiać');
                }, 2000);
            }
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
            window.speechSynthesis.cancel();
            this.recognition.start();
        } catch (error) {
            console.log('❌ Start error:', error);
            this.updateStatus('Błąd mikrofonu');
        }
    }

    toggleListening() {
        if (this.continuousMode) {
            // Stop continuous mode
            console.log('🔵 Stopping continuous mode');
            this.continuousMode = false;
            if (this.isListening) {
                this.recognition.stop();
            }
            this.setNormalState();
            this.updateStatus('Tryb ciągły wyłączony - Kliknij 🎤 aby rozmawiać');
        } else {
            // Start continuous mode
            console.log('🟢 Starting continuous mode');
            this.continuousMode = true;
            this.updateStatus('Tryb ciągły aktywny');
            this.startListening();
        }
    }

    resetApp() {
        if (this.recognition) {
            this.recognition.stop();
        }
        window.speechSynthesis.cancel();
        
        this.isListening = false;
        this.isThinking = false;
        this.isTalking = false;
        this.continuousMode = false; // Turn off continuous mode on reset
        this.conversationHistory = []; // Clear conversation history on reset
        
        this.setNormalState();
        this.updateStatus('Kliknij 🎤 aby rozmawiać');
        
        console.log('🔄 Conversation history cleared');
    }

    async processUserInput(text) {
        console.log('🧠 Processing:', text);
        this.setThinkingState();
        
        // Add user message to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: text
        });
        console.log(`📝 History length: ${this.conversationHistory.length} messages`);
        
        try {
            const response = await this.sendToAI(text);
            console.log('🤖 Response:', response);
            
            // Add assistant response to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: response
            });
            
            await this.speakResponse(response);
        } catch (error) {
            console.log('❌ Process error:', error);
            this.updateStatus('Błąd przetwarzania');
            const errorResponse = 'Przepraszam, spróbuj ponownie.';
            
            // Add error response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: errorResponse
            });
            
            await this.speakResponse(errorResponse);
        }
    }

    async sendToAI(userText) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userText,
                    history: this.conversationHistory // Send full conversation history
                })
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
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'pl-PL';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            
            utterance.onend = () => {
                console.log('🗣️ Finished speaking');
                
                // If continuous mode is active, automatically start listening again
                if (this.continuousMode) {
                    console.log('🔄 Continuous mode: restarting listening');
                    this.setNormalState();
                    this.updateStatus('Tryb ciągły: Słucham dalej...');
                    // Small delay before starting next listening session
                    setTimeout(() => {
                        if (this.continuousMode) { // Check again in case user stopped it
                            this.startListening();
                        }
                    }, 500);
                } else {
                    this.setNormalState();
                    this.updateStatus('Kliknij 🎤 aby rozmawiać');
                }
                resolve();
            };
            
            utterance.onerror = () => {
                console.log('❌ Speech synthesis error');
                
                // If continuous mode is active, try to continue anyway
                if (this.continuousMode) {
                    console.log('🔄 Continuous mode: restarting after error');
                    this.setNormalState();
                    this.updateStatus('Tryb ciągły: Słucham dalej...');
                    setTimeout(() => {
                        if (this.continuousMode) {
                            this.startListening();
                        }
                    }, 500);
                } else {
                    this.setNormalState();
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
        
        // Update button based on continuous mode status
        if (this.continuousMode) {
            micBtn.style.animation = 'pulse 2s infinite';
            micBtn.style.backgroundColor = '#4CAF50'; // Green background for continuous mode
            micBtn.textContent = '🟢';
        } else {
            micBtn.style.animation = '';
            micBtn.style.backgroundColor = '';
            micBtn.textContent = '🎤';
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