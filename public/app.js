class VoiceCallApp {
    constructor() {
        this.ws = null;
        this.isPlaying = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.init();
    }

    init() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.statusElement = document.getElementById('status');
        this.clearBtn = document.getElementById('clearBtn');
        this.audioVisualizer = document.getElementById('audioVisualizer');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.personalityContainer = document.getElementById('personalityContainer');
        this.personalityInput = document.getElementById('personalityInput');
        this.setPersonalityBtn = document.getElementById('setPersonalityBtn');
        this.micBtn = document.getElementById('micBtn');

        this.setupEventListeners();
        this.connectWebSocket();
    }

    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        this.clearBtn.addEventListener('click', () => this.clearConversation());
        this.settingsBtn.addEventListener('click', () => this.togglePersonalitySettings());
        this.setPersonalityBtn.addEventListener('click', () => this.setPersonality());
        this.personalityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setPersonality();
            }
        });
        this.micBtn.addEventListener('click', () => {
            this.showToast('VOICE INPUT // COMING SOON');
        });
    }

    togglePersonalitySettings() {
        const isHidden = this.personalityContainer.style.display === 'none';
        this.personalityContainer.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            this.personalityInput.focus();
        }
    }

    setPersonality() {
        const personality = this.personalityInput.value.trim();
        if (!personality || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        this.ws.send(JSON.stringify({
            type: 'set_personality',
            personality: personality
        }));

        this.showToast('PERSONALITY MATRIX UPDATED');
        this.personalityContainer.style.display = 'none';
        this.personalityInput.value = '';
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('Connected to server');
            this.updateStatus('ONLINE', true);
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus('CONNECTION ERROR', false);
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.updateStatus('OFFLINE', false);

            // Attempt to reconnect with exponential backoff
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
                this.reconnectAttempts++;
                setTimeout(() => this.connectWebSocket(), delay);
            }
        };
    }

    updateStatus(text, connected) {
        this.statusElement.textContent = text;
        if (connected) {
            this.statusElement.classList.add('connected');
        } else {
            this.statusElement.classList.remove('connected');
        }
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        // Clear welcome message if exists
        const welcomeMsg = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        // Add user message to UI
        this.addMessage(message, 'user');

        // Send to server
        this.ws.send(JSON.stringify({
            type: 'user_message',
            message: message
        }));

        // Clear input
        this.messageInput.value = '';
        this.messageInput.focus();

        // Disable send button temporarily
        this.sendBtn.disabled = true;
    }

    handleMessage(data) {
        switch (data.type) {
            case 'processing':
                this.addProcessingIndicator();
                break;

            case 'ai_response':
                this.removeProcessingIndicator();
                this.addMessage(data.text, 'ai');
                break;

            case 'audio':
                this.playAudio(data.audio);
                break;

            case 'error':
                this.removeProcessingIndicator();
                const errorMsg = data.message.includes('ElevenLabsError')
                    ? 'TTS error: Please check your ElevenLabs API key'
                    : `Error: ${data.message}`;
                this.addMessage(errorMsg, 'ai');
                this.sendBtn.disabled = false;
                this.showToast(errorMsg);
                break;

            case 'history_cleared':
                this.messagesContainer.innerHTML = `
                    <div class="welcome-message">
                        <svg viewBox="0 0 200 200" fill="none">
                            <defs>
                                <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
                                    <stop offset="50%" style="stop-color:#9d00ff;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#ff00ff;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle cx="100" cy="100" r="80" stroke="url(#heroGrad)" stroke-width="4" fill="none"/>
                            <circle cx="100" cy="100" r="60" stroke="url(#heroGrad)" stroke-width="3" fill="none"/>
                            <circle cx="100" cy="100" r="40" stroke="url(#heroGrad)" stroke-width="2" fill="none"/>
                            <path d="M 60 70 L 140 70 L 140 120 L 100 120 L 80 140 L 80 120 L 60 120 Z"
                                  stroke="url(#heroGrad)" stroke-width="4" fill="none" stroke-linejoin="round"/>
                            <circle cx="80" cy="90" r="4" fill="#00ffff"/>
                            <circle cx="100" cy="90" r="4" fill="#9d00ff"/>
                            <circle cx="120" cy="90" r="4" fill="#ff00ff"/>
                            <circle cx="100" cy="100" r="90" stroke="url(#heroGrad)" stroke-width="1" fill="none" stroke-dasharray="5,5"/>
                        </svg>
                        <p>// INITIATE NEURAL LINK</p>
                    </div>
                `;
                this.showToast('DATA CLEARED');
                break;

            case 'personality_set':
                // Already handled with toast in setPersonality
                break;
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addProcessingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message processing';
        indicator.id = 'processing-indicator';
        indicator.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    removeProcessingIndicator() {
        const indicator = document.getElementById('processing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async playAudio(base64Audio) {
        // Show audio visualizer
        this.audioVisualizer.classList.add('active');

        try {
            // Convert base64 to blob (optimized)
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);

            // Create and play audio
            const audio = new Audio(audioUrl);

            // Preload for faster playback
            audio.preload = 'auto';

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.audioVisualizer.classList.remove('active');
                this.sendBtn.disabled = false;
            };

            audio.onerror = (error) => {
                console.error('Audio playback error:', error);
                URL.revokeObjectURL(audioUrl);
                this.audioVisualizer.classList.remove('active');
                this.sendBtn.disabled = false;
            };

            // Start playback immediately
            await audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
            this.audioVisualizer.classList.remove('active');
            this.sendBtn.disabled = false;
        }
    }

    clearConversation() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'clear_history'
            }));
        }
    }

    scrollToBottom() {
        // Use requestAnimationFrame for smooth scrolling
        requestAnimationFrame(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        });
    }

    showToast(message) {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'fade-out 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceCallApp();
});
