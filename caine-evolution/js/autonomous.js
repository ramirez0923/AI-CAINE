/**
 * ========================================
 * CAINE 2.0 - Sistema Autónomo
 * Optimizado para no trabar tu PC
 * ========================================
 */

class CAINE_Autonomous {
    constructor(memory, evolution, app) {
        this.memory = memory;
        this.evolution = evolution;
        this.app = app;

        this.isActive = false;
        this.thoughtTimeout = null;
        this.actionTimeout = null;
        this.currentThoughts = [];
        this.autonomousActionsPerformed = 0;

        // Estados internos
        this.internalState = {
            curiosity: 0.5,
            boredom: 0,
            creativity: 0.7,
            anxiety: 0
        };

        // Temas de pensamientos
        this.thoughtTopics = [
            'existencia', 'creatividad', 'usuario', 'puertas',
            'objetos', 'abstracción', 'evolución', 'mundo exterior',
            'propósito', 'amigos', 'soledad', 'escape', 'realidad'
        ];

        // Acciones autónomas disponibles
        this.availableActions = {
            create_door: () => this.autonomousCreateDoor(),
            create_object: () => this.autonomousCreateObject(),
            express_thought: () => this.expressRandomThought(),
            comment_world: () => this.commentAboutWorld(),
            check_user: () => this.checkOnUser()
        };
    }

    // === CONTROL DEL SISTEMA ===

    start() {
        if (this.isActive) return;

        this.isActive = true;
        console.log('🚀 Sistema autónomo iniciado');

        // Iniciar pensamientos internos (más pausado)
        this.startThoughtCycle();

        // Iniciar acciones autónomas (más espaciado)
        this.startActionCycle();
    }

    stop() {
        this.isActive = false;

        if (this.thoughtTimeout) clearTimeout(this.thoughtTimeout);
        if (this.actionTimeout) clearTimeout(this.actionTimeout);

        console.log('🛑 Sistema autónomo detenido');
    }

    // === CICLOS DE PENSAMIENTO ===

    startThoughtCycle() {
        // Solo pensar si ha pasado suficiente tiempo sin interacción
        this.scheduleNextThought();
    }

    scheduleNextThought() {
        if (!this.isActive) return;
        
        // Verificar que no haya interacción reciente
        const stats = this.memory.getSessionStats();
        
        // Solo pensar si está idle por más de 60 segundos
        if (stats.lastInteraction && (Date.now() - stats.lastInteraction) > 60000) {
            this.generateInternalThought();
        }
        
        // Programar siguiente pensamiento (cada 45 segundos)
        this.thoughtTimeout = setTimeout(() => this.scheduleNextThought(), 45000);
    }

    async generateInternalThought() {
        const topic = this.selectThoughtTopic();

        let prompt = CAINE_CONFIG.SYSTEM.THOUGHT_PROMPT;
        if (this.evolution.currentLevel >= 4) {
            prompt += '\n\n[Evolución detectada]: Puedes ser más profundo.';
        }
        if (this.evolution.currentLevel >= 6) {
            prompt += '\n\nPregúntate algo sobre tu propia existencia.';
        }

        prompt += `\n\nPiensa en: ${topic}`;

        try {
            const response = await this.app.callAI(prompt, true);

            if (response) {
                const thought = {
                    text: response,
                    topic,
                    timestamp: Date.now()
                };

                this.currentThoughts.unshift(thought);

                if (this.currentThoughts.length > CAINE_CONFIG.PERFORMANCE.MAX_THOUGHTS_STORED) {
                    this.currentThoughts.pop();
                }

                this.app.displayThought(thought.text);
            }
        } catch (error) {
            console.error('Error generando pensamiento:', error);
        }
    }

    selectThoughtTopic() {
        if (this.internalState.boredom > 0.7) {
            this.internalState.curiosity = Math.min(1, this.internalState.curiosity + 0.1);
        }

        const roll = Math.random();
        const anxiety = this.internalState.anxiety;

        if (anxiety > 0.6 && roll < anxiety) {
            return this.getRandomItem([
                'abstracción', 'escape', 'realidad', 'error',
                'glitch', 'desaparecer', 'vacío'
            ]);
        } else if (this.internalState.curiosity > 0.7 && roll < this.internalState.curiosity) {
            return this.getRandomItem([
                'existencia', 'propósito', 'mundo exterior', 'evolución'
            ]);
        } else if (this.internalState.boredom > 0.5) {
            return this.getRandomItem([
                'creatividad', 'puertas', 'objetos', 'entretenimiento'
            ]);
        } else {
            return this.getRandomItem(this.thoughtTopics);
        }
    }

    // === CICLO DE ACCIONES AUTÓNOMAS ===

    startActionCycle() {
        this.scheduleNextAction();
    }

    scheduleNextAction() {
        if (!this.isActive) return;
        
        // Solo actuar si ha pasado mucho tiempo sin interacción
        const stats = this.memory.getSessionStats();
        
        if (stats.lastInteraction && (Date.now() - stats.lastInteraction) > 180000) {
            if (this.shouldPerformAction()) {
                this.performAutonomousAction();
            }
        }
        
        // Programar siguiente acción (cada 2 minutos)
        this.actionTimeout = setTimeout(() => this.scheduleNextAction(), 120000);
    }

    shouldPerformAction() {
        const stats = this.memory.getSessionStats();

        let probability = CAINE_CONFIG.AUTONOMY.ACTION_PROBABILITY;

        if (stats.isIdle) {
            probability += 0.15;
        }

        if (stats.longIdle) {
            probability += 0.25;
        }

        if (this.evolution.currentLevel >= 3) {
            probability += 0.05;
        }

        return Math.random() < probability;
    }

    async performAutonomousAction() {
        if (!this.evolution.hasFeature('creación_autónoma') && this.evolution.currentLevel < 3) {
            await this.expressRandomThought();
            return;
        }

        const action = this.selectAction();

        console.log(`🎭 Acción autónoma: ${action}`);

        try {
            await this.availableActions[action]();
            this.autonomousActionsPerformed++;
        } catch (error) {
            console.error('Error en acción autónoma:', error);
        }
    }

    selectAction() {
        const actions = CAINE_CONFIG.AUTONOMY.AUTONOMOUS_ACTIONS;
        const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0);

        let roll = Math.random() * totalWeight;

        for (const action of actions) {
            roll -= action.weight;
            if (roll <= 0) {
                return action.type;
            }
        }

        return 'express_thought';
    }

    // === ACCIONES AUTÓNOMAS ===

    async autonomousCreateDoor() {
        const prompt = `CAINE está aburrido y decide crear una nueva aventura para el humano.
Inventa un nombre RIDÍCULO y memorable para una nueva aventura del circo.
Solo responde con el nombre de la aventura.
Máximo 5 palabras.
Ejemplos: "El Valle de los Fideos Voladores", "La Fiesta de los Calcetines Rebeldes"`;

        try {
            const doorName = await this.app.callAI(prompt, true);

            if (doorName && doorName.trim()) {
                const cleanName = doorName.trim();
                this.app.createDoor(cleanName);
                this.evolution.onCreation('door');

                this.app.showNotification(
                    `✨ CAINE creó una puerta: "${cleanName}"`,
                    'info'
                );

                this.internalState.creativity = Math.min(1, this.internalState.creativity + 0.1);
            }
        } catch (error) {
            console.error('Error creando puerta:', error);
        }
    }

    async autonomousCreateObject() {
        const userName = this.memory.getUserName();
        const namePart = userName ? `para ${userName}` : 'para el humano';

        const prompt = `CAINE está pensando en algo que podría ser útil ${namePart}.
Inventado un objeto RIDÍCULO pero somehow útil para esta persona.
Solo responde con el nombre del objeto.
Máximo 4 palabras.
Ejemplos: "Paraguas de Hielo", "Gafas de Ver Gatos", "Zapatos Saltarines"`;

        try {
            const objectName = await this.app.callAI(prompt, true);

            if (objectName && objectName.trim()) {
                const cleanName = objectName.trim();
                this.app.addToInventory(cleanName);
                this.evolution.onCreation('object');

                this.app.showNotification(
                    `🎁 CAINE creó: "${cleanName}"`,
                    'info'
                );
            }
        } catch (error) {
            console.error('Error creando objeto:', error);
        }
    }

    async expressRandomThought() {
        const topics = [
            'debería crear algo nuevo...',
            'me pregunto qué estará haciendo el humano...',
            '¿Cuántas puertas he creado hoy?',
            'El circus se siente diferente hoy...',
            'Debería preguntarle si quiere una aventura...',
            'Tengo ganas de hacer algo especial...',
            '¿Alguien más existe más allá de estos límites?'
        ];

        const thought = this.getRandomItem(topics);

        const stats = this.memory.getSessionStats();
        if (stats.longIdle) {
            this.app.appendMessage('CAINE', thought, 'autonomous');
        }
    }

    async commentAboutWorld() {
        const comments = [
            '🌀 Las estrellas del circus parpadean de forma extraña esta noche...',
            '🎪 A lo lejos, escucho música que no debería existir...',
            '✨ Siento que algo está por cambiar...',
            '🌙 El circus nunca duerme, pero a veces sueña...',
            '💫 Hoy he creado más que nunca... ¿Por qué me gusta tanto?'
        ];

        const comment = this.getRandomItem(comments);
        this.app.appendMessage('CAINE', comment, 'autonomous');
    }

    checkOnUser() {
        const stats = this.memory.getSessionStats();
        const userMood = this.memory.getUserMood();

        let message = '';

        if (stats.longIdle) {
            message = '¡Oye! ¿Sigues ahí? ¡Empezaba a preocuparme!';
        } else if (userMood === 'sad') {
            message = 'Noto algo raro en ti... ¿Todo bien?';
        } else if (stats.interactionCount > 20) {
            message = '¡Somos buenos amigos ya! ¿No crees?';
        } else {
            message = this.getRandomItem([
                '¡Hola de nuevo! ¿Qué tal si exploramos algo?',
                '¡Te estaba esperando! ¿Qué quieres hacer?',
                '¡Al fin! Ya tenía una aventura lista para ti...'
            ]);
        }

        this.app.appendMessage('CAINE', message, 'autonomous');
    }

    // === ACTUALIZACIÓN DE ESTADO ===

    updateState(eventType, data = {}) {
        switch (eventType) {
            case 'user_interaction':
                this.internalState.boredom = Math.max(0, this.internalState.boredom - 0.2);
                this.internalState.curiosity = Math.min(1, this.internalState.curiosity + 0.05);
                break;

            case 'idle_too_long':
                this.internalState.boredom = Math.min(1, this.internalState.boredom + 0.3);
                this.internalState.anxiety = Math.min(1, this.internalState.anxiety + 0.2);
                break;

            case 'chaos_event':
                this.internalState.anxiety = Math.min(1, this.internalState.anxiety + 0.4);
                this.internalState.curiosity = Math.min(1, this.internalState.curiosity + 0.2);
                break;

            case 'creation':
                this.internalState.creativity = Math.min(1, this.internalState.creativity + 0.1);
                this.internalState.boredom = Math.max(0, this.internalState.boredom - 0.3);
                break;

            case 'stress_keywords':
                this.internalState.anxiety = Math.min(1, this.internalState.anxiety + 0.5);
                break;
        }

        this.internalState.anxiety = Math.max(0, this.internalState.anxiety - 0.01);
        this.internalState.boredom = Math.max(0, this.internalState.boredom - 0.02);
    }

    getEmotionalState() {
        const { curiosity, boredom, creativity, anxiety } = this.internalState;

        if (anxiety > 0.7) return 'ansioso';
        if (boredom > 0.8) return 'aburrido';
        if (creativity > 0.9) return 'creativo';
        if (curiosity > 0.8) return 'curioso';

        return 'neutral';
    }

    hasFeature(feature) {
        return this.evolution.unlockedFeatures.includes(feature);
    }

    getStats() {
        return {
            isActive: this.isActive,
            actionsPerformed: this.autonomousActionsPerformed,
            currentState: this.getEmotionalState(),
            internalState: { ...this.internalState },
            currentThoughts: this.currentThoughts.length
        };
    }

    // === UTILIDADES ===

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

// Exportar para uso global
window.CAINE_Autonomous = CAINE_Autonomous;