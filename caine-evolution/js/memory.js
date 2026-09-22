/**
 * ========================================
 * CAINE 2.0 - Sistema de Memoria
 * Optimizado para rendimiento
 * ========================================
 */

class CAINE_Memory {
    constructor() {
        this.shortTerm = [];
        this.preferences = {};
        this.learnedPatterns = {};
        this.interactionCount = 0;
        this.lastInteraction = Date.now();
        this.sessionStart = Date.now();
        this.load();
    }

    load() {
        try {
            const prefs = localStorage.getItem(CAINE_CONFIG.STORAGE_KEYS.PREFERENCES);
            if (prefs) this.preferences = JSON.parse(prefs);
        } catch (e) {
            this.preferences = {};
        }
        try {
            const patterns = localStorage.getItem('caine_patterns');
            if (patterns) this.learnedPatterns = JSON.parse(patterns);
        } catch (e) {
            this.learnedPatterns = {};
        }
    }

    save() {
        try {
            localStorage.setItem(CAINE_CONFIG.STORAGE_KEYS.PREFERENCES, JSON.stringify(this.preferences));
            localStorage.setItem('caine_patterns', JSON.stringify(this.learnedPatterns));
        } catch (e) {
            console.error('Error guardando memoria:', e);
        }
    }

    addToShortTerm(role, content) {
        this.shortTerm.push({ role, content, time: Date.now() });
        
        // Limitar tamaño
        const maxItems = CAINE_CONFIG.PERFORMANCE.MAX_SHORT_TERM || 15;
        while (this.shortTerm.length > maxItems) {
            this.shortTerm.shift();
        }
        
        this.interactionCount++;
        this.lastInteraction = Date.now();
    }

    getConversationContext() {
        if (this.shortTerm.length === 0) return '';
        
        const recent = this.shortTerm.slice(-6);
        let ctx = '\n\n[CONVERSACIÓN RECIENTE]:\n';
        
        recent.forEach(m => {
            const role = m.role === 'user' ? 'Humano' : 'CAINE';
            ctx += `${role}: ${m.content}\n`;
        });
        
        if (this.learnedPatterns.userName) {
            ctx += `\n[El humano se llama ${this.learnedPatterns.userName}]`;
        }
        
        return ctx;
    }

    learnFromUser(message) {
        this.detectName(message);
        this.detectEmotions(message);
        this.save();
    }

    detectName(msg) {
        const patterns = [
            /me llamo\s+(\w+)/i, 
            /soy\s+(\w+)/i, 
            /mi nombre es\s+(\w+)/i,
            /llamo\s+(\w+)/i
        ];
        
        for (const p of patterns) {
            const m = msg.match(p);
            if (m && m[1].length > 2 && m[1].length < 20) {
                this.learnedPatterns.userName = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
                return;
            }
        }
    }

    detectEmotions(msg) {
        const lower = msg.toLowerCase();
        const emotions = {
            happy: ['feliz', 'genial', 'gracias', 'increíble', 'genial', 'bueno', 'cool'],
            sad: ['triste', 'mal', 'aburrido', 'frustrado', 'decepcionado', 'enojado'],
            scared: ['miedo', 'asustado', 'preocupado', 'nervioso', 'ansioso']
        };
        
        for (const [emotion, words] of Object.entries(emotions)) {
            if (words.some(w => lower.includes(w))) {
                this.preferences.lastEmotion = emotion;
                break;
            }
        }
    }

    getUserName() {
        return this.learnedPatterns.userName || null;
    }

    getUserMood() {
        return this.preferences.lastEmotion || 'neutral';
    }

    incrementChaosEvents() {
        this.preferences.chaosEvents = (this.preferences.chaosEvents || 0) + 1;
        this.save();
    }

    /**
     * Obtener estadísticas de la sesión
     * Importante para el sistema autónomo
     */
    getSessionStats() {
        const now = Date.now();
        const idleTime = now - this.lastInteraction;
        
        return {
            interactionCount: this.interactionCount,
            lastInteraction: this.lastInteraction,
            sessionDuration: now - this.sessionStart,
            isIdle: idleTime > 60000,           // Más de 1 minuto sin actividad
            longIdle: idleTime > 180000,        // Más de 3 minutos sin actividad
            idleTimeSeconds: Math.floor(idleTime / 1000)
        };
    }
}