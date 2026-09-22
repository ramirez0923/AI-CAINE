/**
 * ========================================
 * CAINE 2.0 - Aplicación Principal
 * Soporta Ollama + Gemini con fallback
 * ========================================
 */

class CAINE_App {
    constructor() {
        this.isTyping = false;
        this.inventory = [];
        this.createdDoors = [];
        this.currentAdventure = null;
        this.memory = null;
        this.evolution = null;
        this.autonomous = null;
        
        // Sistema de IA
        this.aiProvider = null;
        this.ollamaAvailable = false;
    }

    async init() {
        console.log('🎪 Sistema CAINE iniciando...');

        this.memory = new CAINE_Memory();
        this.evolution = new CAINE_Evolution();
        this.autonomous = new CAINE_Autonomous(this.memory, this.evolution, this);

        this.cacheElements();
        this.setupEvents();
        this.loadData();
        this.updateUI();

        // Detectar IA disponible
        await this.detectAIProvider();
        
        // Mensaje de bienvenida según IA
        await this.initialGreeting();

        // Iniciar sistema autónomo (más pausado)
        setTimeout(() => {
            this.autonomous.start();
        }, 5000);

        console.log('✅ Sistema listo!');
    }

    /**
     * Detecta qué IA está disponible
     */
    async detectAIProvider() {
        const savedProvider = localStorage.getItem(CAINE_CONFIG.STORAGE_KEYS.AI_PROVIDER);
        
        // Probar Ollama primero
        try {
            const response = await fetch(`${CAINE_CONFIG.AI.OLLAMA.baseUrl}/api/tags`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(3000)
            });
            
            if (response.ok) {
                this.ollamaAvailable = true;
                this.aiProvider = 'ollama';
                console.log('✅ Ollama detectado - usando IA local');
                this.showNotification('🧠 Usando IA local (Ollama)', 'info');
                
                if (savedProvider !== 'ollama') {
                    localStorage.setItem(CAINE_CONFIG.STORAGE_KEYS.AI_PROVIDER, 'ollama');
                }
                return;
            }
        } catch (e) {
            console.log('⚠️ Ollama no disponible, usando Gemini...');
        }
        
        // Fallback a Gemini
        this.aiProvider = 'gemini';
        console.log('📡 Usando Gemini como IA');
        this.showNotification('📡 Usando Gemini (API externa)', 'info');
        
        if (savedProvider !== 'gemini') {
            localStorage.setItem(CAINE_CONFIG.STORAGE_KEYS.AI_PROVIDER, 'gemini');
        }
    }

    cacheElements() {
        this.stage = document.getElementById('circus-stage');
        this.stageText = document.getElementById('stage-text');
        this.chatBox = document.getElementById('chat-box');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.doorsContainer = document.getElementById('doors-container');
        this.inventoryList = document.getElementById('xp-items-list');
        this.evolutionLevel = document.getElementById('evolution-level');
        this.moodIndicator = document.getElementById('mood-indicator');
        this.thoughtList = document.getElementById('thought-list');
    }

    setupEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        document.getElementById('btn-inventory').addEventListener('click', () => {
            document.getElementById('inventory-window').classList.toggle('active');
        });
        
        document.querySelector('.xp-close').addEventListener('click', () => {
            document.getElementById('inventory-window').classList.remove('active');
        });
    }

    loadData() {
        try {
            const saved = localStorage.getItem(CAINE_CONFIG.STORAGE_KEYS.INVENTORY);
            if (saved) this.inventory = JSON.parse(saved);
        } catch (e) {
            this.inventory = [];
        }
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || this.isTyping) return;

        this.userInput.value = '';
        this.isTyping = true;
        this.sendBtn.disabled = true;

        this.memory.learnFromUser(message);
        this.addMessage('Tú', message, 'user');

        await this.processMessage(message);

        this.isTyping = false;
        this.sendBtn.disabled = false;
    }

    async processMessage(message) {
        if (this.containsStressKeywords(message)) {
            this.triggerGlitch();
        }

        const prompt = this.buildPrompt(message);

        try {
            const response = await this.callAI(prompt);
            if (response) {
                this.processResponse(response);
                this.evolution.onInteraction();
                this.updateUI();
            }
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('CAINE', '¡*Glitch*! Algo salió mal...');
        }
    }

    buildPrompt(message) {
        const context = this.memory.getConversationContext();
        const evolution = this.evolution.getEvolutionPrompt();

        let prompt = message;

        if (context) prompt += context;
        if (this.currentAdventure) {
            prompt += `\n\n[AVENTURA ACTUAL: ${this.currentAdventure}]`;
        }
        prompt += evolution;

        return prompt;
    }

    /**
     * Llamada unificada a la IA
     * Detecta automáticamente el proveedor correcto
     */
    async callAI(prompt, isSystem = false) {
        // Re-detectar cada vez por si Ollama se activó
        if (this.aiProvider === 'ollama' || !this.aiProvider) {
            const response = await this.callOllama(prompt, isSystem);
            if (response) return response;
        }
        
        // Fallback a Gemini
        return this.callGemini(prompt, isSystem);
    }

    /**
     * Llamada a Ollama (IA local)
     */
    async callOllama(prompt, isSystem = false) {
        try {
            const model = CAINE_CONFIG.AI.OLLAMA.defaultModel;
            
            let systemPrompt = CAINE_CONFIG.SYSTEM.SYSTEM_PROMPT;
            if (isSystem) {
                systemPrompt = CAINE_CONFIG.SYSTEM.THOUGHT_PROMPT;
            }

            const body = {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                stream: false,
                options: {
                    temperature: isSystem ? 0.7 : 0.9,
                    num_predict: isSystem ? 100 : 500
                }
            };

            const response = await fetch(`${CAINE_CONFIG.AI.OLLAMA.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(CAINE_CONFIG.PERFORMANCE.REQUEST_TIMEOUT)
            });

            const data = await response.json();

            if (data.message?.content) {
                return data.message.content.trim();
            }

            return null;
        } catch (error) {
            console.error('Ollama error:', error);
            this.ollamaAvailable = false;
            return null;
        }
    }

    /**
     * Llamada a Gemini (fallback)
     */
    async callGemini(prompt, isSystem = false) {
        try {
            const url = `${CAINE_CONFIG.AI.GEMINI.apiUrl}?key=${CAINE_CONFIG.AI.GEMINI.apiKey}`;

            let systemInstruction = CAINE_CONFIG.SYSTEM.SYSTEM_PROMPT;
            if (isSystem) {
                systemInstruction = CAINE_CONFIG.SYSTEM.THOUGHT_PROMPT;
            }

            const body = {
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: isSystem ? 100 : 500,
                    temperature: isSystem ? 0.7 : 0.9
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(CAINE_CONFIG.PERFORMANCE.REQUEST_TIMEOUT)
            });

            const data = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text.trim();
            }

            return null;
        } catch (error) {
            console.error('Gemini error:', error);
            return null;
        }
    }

    processResponse(response) {
        this.memory.addToShortTerm('caine', response);

        let text = response;

        // Extraer [ITEM: ...]
        const itemMatch = text.match(/\[ITEM:\s*([^\]]+)\]/);
        if (itemMatch) {
            this.addToInventory(itemMatch[1]);
            this.evolution.onCreation('object');
            text = text.replace(itemMatch[0], '');
        }

        // Extraer [NEW_DOOR: ...]
        const doorMatch = text.match(/\[NEW_DOOR:\s*([^\]]+)\]/);
        if (doorMatch) {
            this.createDoor(doorMatch[1]);
            this.evolution.onCreation('door');
            text = text.replace(doorMatch[0], '');
        }

        // Extraer [AMBIENTE: ...]
        const ambMatch = text.match(/\[AMBIENTE:\s*(#[0-9A-Fa-f]{6})\]/);
        if (ambMatch) {
            document.body.style.backgroundColor = ambMatch[1];
            text = text.replace(ambMatch[0], '');
        }

        this.addMessage('CAINE', text.trim());
    }

    async initialGreeting() {
        const userName = this.memory.getUserName();
        const aiLabel = this.aiProvider === 'ollama' ? '🧠 IA Local' : '📡 Gemini';
        
        let greeting = `¡${aiLabel} activo! ¡Soy CAINE!`;
        
        if (userName) {
            greeting = `¡${userName}! ${greeting}`;
        }

        if (this.evolution.currentLevel > 1) {
            greeting += ` ${this.evolution.getCurrentLevelInfo().name} reporting!`;
        }

        this.addMessage('CAINE', greeting);
    }

    addMessage(sender, text, type = 'caine') {
        const div = document.createElement('div');
        div.className = type === 'user' ? 'user-msg' : 'caine-msg';
        div.innerHTML = `<strong>${sender}:</strong> ${text}`;
        this.chatBox.appendChild(div);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    createDoor(name) {
        if (this.createdDoors.includes(name)) return;
        this.createdDoors.push(name);

        const door = document.createElement('div');
        door.className = 'circus-door';
        door.innerHTML = `<div class="door-label">${name}</div>`;
        door.onclick = () => this.openDoor(name);
        this.doorsContainer.appendChild(door);
    }

    async openDoor(name) {
        this.currentAdventure = name;
        this.stageText.innerText = `En: ${name}`;
        this.addMessage('Sistema', `Entras a "${name}"...`, 'system');

        const prompt = `El humano acaba de entrar a "${name}". Describe brevemente el entorno.`;
        const response = await this.callAI(prompt, true);
        if (response) this.addMessage('CAINE', response);
    }

    addToInventory(name) {
        this.inventory.push({ name, timestamp: Date.now() });
        localStorage.setItem(CAINE_CONFIG.STORAGE_KEYS.INVENTORY, JSON.stringify(this.inventory));
        this.renderInventory();
    }

    renderInventory() {
        if (this.inventory.length === 0) {
            this.inventoryList.innerHTML = '<div style="text-align:center;color:#888;">Vacío</div>';
            return;
        }

        this.inventoryList.innerHTML = this.inventory.map(item => `
            <div class="xp-item">
                <span class="xp-item-icon">📄</span>
                <span class="xp-item-name">${item.name}</span>
            </div>
        `).join('');
    }

    triggerGlitch() {
        document.body.classList.add('glitching');
        this.stageText.innerText = '⚠️ ¡ABSTRACCIÓN! ⚠️';
        this.memory.incrementChaosEvents();
        this.evolution.onChaosEvent();

        setTimeout(() => {
            document.body.classList.remove('glitching');
            this.stageText.innerText = this.currentAdventure || 'EL CIRCO DIGITAL';
        }, 5000);
    }

    containsStressKeywords(text) {
        const lower = text.toLowerCase();
        return CAINE_CONFIG.LEARNING.STRESS_KEYWORDS.some(k => lower.includes(k));
    }

    updateUI() {
        const level = this.evolution.getCurrentLevelInfo();
        this.evolutionLevel.textContent = `Lv.${this.evolution.currentLevel} ${level.name}`;
        this.evolutionLevel.style.color = level.color;
        this.moodIndicator.textContent = this.getMoodEmoji();
        this.renderInventory();
    }

    getMoodEmoji() {
        const moods = {
            neutral: '😐', curious: '🤔', bored: '😴',
            creative: '✨', anxious: '😰', euphoric: '🎉'
        };
        return moods[this.autonomous?.getEmotionalState()] || '😐';
    }

    /**
     * Mostrar notificación temporal
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        container.appendChild(notif);
        
        setTimeout(() => {
            notif.remove();
        }, 3000);
    }

    /**
     * Mostrar pensamiento interno
     */
    displayThought(text) {
        const thoughtList = document.getElementById('thought-list');
        const thought = document.createElement('div');
        thought.className = 'thought-bubble';
        thought.innerHTML = `
            💭 ${text}
            <div class="thought-timestamp">${new Date().toLocaleTimeString()}</div>
        `;
        
        thoughtList.insertBefore(thought, thoughtList.firstChild);
        
        // Limitar pensamientos
        while (thoughtList.children.length > CAINE_CONFIG.PERFORMANCE.MAX_THOUGHTS_STORED) {
            thoughtList.removeChild(thoughtList.lastChild);
        }
    }

    /**
     * Agregar mensaje autónomo
     */
    appendMessage(sender, text, type = 'caine') {
        const div = document.createElement('div');
        div.className = type === 'user' ? 'user-msg' : type === 'autonomous' ? 'autonomous-msg' : 'caine-msg';
        div.innerHTML = `<strong>${sender}:</strong> ${text}`;
        this.chatBox.appendChild(div);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }
}

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
    window.caine = new CAINE_App();
    window.caine.init();
});