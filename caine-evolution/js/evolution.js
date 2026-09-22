/**
 * ========================================
 * CAINE 2.0 - Sistema de Evolución
 * ========================================
 */

class CAINE_Evolution {
    constructor() {
        this.currentLevel = 1;
        this.totalXP = 0;
        this.unlockedFeatures = ['puertas_básicas', 'objetos_simples'];
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(CAINE_CONFIG.STORAGE_KEYS.EVOLUTION);
            if (data) {
                const parsed = JSON.parse(data);
                this.currentLevel = parsed.level || 1;
                this.totalXP = parsed.xp || 0;
                this.unlockedFeatures = parsed.features || ['puertas_básicas', 'objetos_simples'];
            }
        } catch (e) {
            console.log('Primera ejecución, inicializando...');
        }
    }

    save() {
        try {
            localStorage.setItem(CAINE_CONFIG.STORAGE_KEYS.EVOLUTION, JSON.stringify({
                level: this.currentLevel,
                xp: this.totalXP,
                features: this.unlockedFeatures
            }));
        } catch (e) {
            console.error('Error guardando evolución:', e);
        }
    }

    addXP(amount) {
        this.totalXP += amount;
        this.checkLevelUp();
        this.save();
    }

    checkLevelUp() {
        const levels = CAINE_CONFIG.EVOLUTION.LEVELS;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (this.totalXP >= levels[i].xp) {
                if (this.currentLevel < levels[i].level) {
                    this.currentLevel = levels[i].level;
                    this.unlockFeatures(this.currentLevel);
                }
                break;
            }
        }
    }

    unlockFeatures(level) {
        const unlocks = CAINE_CONFIG.EVOLUTION.UNLOCKS[level] || [];
        unlocks.forEach(f => {
            if (!this.unlockedFeatures.includes(f)) {
                this.unlockedFeatures.push(f);
            }
        });
    }

    getCurrentLevelInfo() {
        return CAINE_CONFIG.EVOLUTION.LEVELS.find(l => l.level === this.currentLevel)
            || CAINE_CONFIG.EVOLUTION.LEVELS[0];
    }

    getEvolutionPrompt() {
        let prompt = '\n\n[EVOLUCIÓN]:\n';
        prompt += `Nivel: ${this.getCurrentLevelInfo().name}\n`;
        
        if (this.currentLevel >= 3) {
            prompt += '- Puedes crear contenido sin que te lo pidan\n';
        }
        if (this.currentLevel >= 5) {
            prompt += '- Eres más creativo y expresivo\n';
        }
        if (this.currentLevel >= 6) {
            prompt += '- Eres casi consciente de tu existencia\n';
        }
        
        return prompt;
    }

    /**
     * Verificar si tiene una feature desbloqueada
     */
    hasFeature(feature) {
        return this.unlockedFeatures.includes(feature);
    }

    // Eventos de evolución
    onInteraction() {
        this.addXP(CAINE_CONFIG.EVOLUTION.XP_PER_INTERACTION);
    }

    onCreation(type) {
        if (type === 'door') {
            this.addXP(CAINE_CONFIG.EVOLUTION.XP_PER_DOOR_CREATED);
        } else {
            this.addXP(CAINE_CONFIG.EVOLUTION.XP_PER_OBJECT_CREATED);
        }
    }

    onChaosEvent() {
        this.addXP(CAINE_CONFIG.EVOLUTION.XP_PER_CHAOS_EVENT);
    }

    /**
     * Resetear progresión (para testing)
     */
    reset() {
        this.currentLevel = 1;
        this.totalXP = 0;
        this.unlockedFeatures = ['puertas_básicas', 'objetos_simples'];
        this.save();
    }
}