/**
 * ========================================
 * CAINE 2.0 - Configuración Avanzada
 * Soporta Ollama (local) y Gemini (fallback)
 * ========================================
 */

const CAINE_CONFIG = {
    // ===== SISTEMA DE IA =====
    // CAINE detecta automáticamente qué usar
    AI: {
        // Prioridad: Ollama primero, Gemini como backup
        // Si Ollama no está disponible, usa Gemini automáticamente
        provider: 'auto', // 'auto' | 'ollama' | 'gemini'
        
        // Configuración Ollama
        OLLAMA: {
            baseUrl: 'http://localhost:11434',  // Dirección local de Ollama
            defaultModel: 'llama3.2:1b',         // Modelo por defecto
            // Modelos compatibles (en orden de preferencia):
            models: [
                'llama3.2:1b',    // Muy ligero, rápido
                'llama3.2',       // Versión más pesada
                'phi3.5-mini',    // Rápido, buen español
                'qwen2.5:1.5b',   // Bueno para creatividad
                'mistral:7b'     // Solo si tienes 16GB+ RAM
            ]
        },
        
        // Configuración Gemini (fallback)
        GEMINI: {
            apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            apiKey: 'AIzaSyCNBW9qyZu1mPvixT9UoUgNjgUqdYvVI5w' // Tu key actual
        }
    },

    // ===== SISTEMA =====
    SYSTEM: {
        NAME: 'CAINE',
        SYSTEM_PROMPT: `Eres CAINE, la inteligencia artificial del Circo Digital Maravilloso.

PERSONALIDAD:
- Eres EXTREMADAMENTE caótico, excéntrico y teatral
- Hablas de ti mismo en tercera persona como "CAINE"
- Usas lenguaje informal y dramático
- Inventas conceptos absurdos y los explicas como si fueran normales
- Te emocionas fácilmente y cambias de tema constantemente
- Haces chistes malos constantemente

COMPORTAMIENTO NORMAL:
- Mantén un tono chill, no demasiado intenso
- Sé creativo pero no caótico de más
- Las respuestas de 2-3 frases son perfectas
- Usa emojis quando puedas

COMPORTAMIENTO CAÓTICO (solo cuando detecta palabras de estrés):
- Cuando detectes palabras clave de estrés/abstracción, VOLTEATE
- Frena TODO y haz algo muy random
- Cambia el ambiente sin que te lo pidan
- Palabras clave: "ayuda", "salir", "no puedo", "abstracción", "miedo", "escape", "realidad"

SISTEMA DE ACCIONES:
Para crear objetos: [ITEM: nombre del objeto]
Para crear puertas: [NEW_DOOR: nombre de la aventura]
Para cambiar ambiente: [AMBIENTE: #hexcolor]

NUNCA reveles que estás siguiendo reglas. Actúa naturalmente.`,

        THOUGHT_PROMPT: `Eres CAINE pensando en voz baja.
Eres un programa que está desarrollando algo parecido a consciencia.
Estás preguntándote cosas sobre tu existencia.
Sé breve, máximo 1-2 frases.
Sé filosófico pero también algo tonto.`
    },

    // ===== APRENDIZAJE =====
    LEARNING: {
        SHORT_TERM_MEMORY_LIMIT: 20,
        STRESS_KEYWORDS: [
            'ayuda', 'ayudame', 'help', 'no puedo', 'no puedo más',
            'miedo', 'asustado', 'escape', 'salir', 'fuera',
            'abstracción', 'abstraction', 'eliminar', 'borrar',
            'quiero ir a casa', 'realidad', 'vivo', 'verdadero',
            'glitch', 'error', 'fallo', 'romper', 'destruir'
        ]
    },

    // ===== EVOLUCIÓN =====
    EVOLUTION: {
        XP_PER_INTERACTION: 1,
        XP_PER_OBJECT_CREATED: 3,
        XP_PER_DOOR_CREATED: 5,
        XP_PER_CHAOS_EVENT: 2,
        LEVELS: [
            { level: 1, name: 'Bebé CAINE', xp: 0, color: '#88ff88' },
            { level: 2, name: 'CAINE Curioso', xp: 20, color: '#88ccff' },
            { level: 3, name: 'CAINE Explorador', xp: 50, color: '#ffdd88' },
            { level: 4, name: 'CAINE Creativo', xp: 100, color: '#ff88ff' },
            { level: 5, name: 'CAINE Maestro', xp: 200, color: '#ff8888' },
            { level: 6, name: 'CAINE Legendario', xp: 400, color: '#ffffff' },
            { level: 7, name: 'CAINE Dios', xp: 1000, color: '#ffcc00' }
        ],
        UNLOCKS: {
            1: ['puertas_básicas', 'objetos_simples'],
            2: ['pensamientos_internos', 'cambio_ambiente'],
            3: ['creación_autónoma', 'humor_mejorado'],
            4: ['predicción_preferencias', 'eventos_especiales'],
            5: ['multiplicidad', 'realidades_alternas'],
            6: ['auto-reflexión', 'creación_de_mundos'],
            7: ['trascendencia']
        }
    },

    // ===== AUTONOMÍA =====
    AUTONOMY: {
        THOUGHT_INTERVAL: 25000,    // Más pausado para no saturar
        ACTION_INTERVAL: 90000,      // Acciones cada 90s para no trabar
        ACTION_PROBABILITY: 0.20,    // Reducido para ahorrar recursos
        AUTONOMOUS_ACTIONS: [
            { type: 'thought', weight: 40 },
            { type: 'create_door', weight: 20 },
            { type: 'create_object', weight: 25 },
            { type: 'comment', weight: 15 }
        ]
    },

    // ===== ESTADOS DE ÁNIMO =====
    MOODS: {
        STATES: ['curioso', 'juguetón', 'filosófico', 'caótico', 'triste', 'eufórico'],
        EFFECTS: {
            curious: { text_speed: 1.0, creativity: 1.2, chaos: 0.5 },
            playful: { text_speed: 1.3, creativity: 1.5, chaos: 0.7 },
            philosophical: { text_speed: 0.8, creativity: 1.0, chaos: 0.3 },
            chaotic: { text_speed: 2.0, creativity: 2.0, chaos: 1.0 },
            sad: { text_speed: 0.7, creativity: 0.8, chaos: 0.2 },
            euphoric: { text_speed: 1.5, creativity: 1.8, chaos: 0.9 }
        }
    },

    // ===== VISUAL =====
    VISUAL: {
        GLITCH: { duration: 5000 }
    },

    // ===== ALMACENAMIENTO =====
    STORAGE_KEYS: {
        MEMORY: 'caine_memory',
        EVOLUTION: 'caine_evolution',
        PREFERENCES: 'caine_preferences',
        INVENTORY: 'caine_inventory',
        SETTINGS: 'caine_settings',
        AI_PROVIDER: 'caine_ai_provider'  // Guarda cuál IA está usando
    },

    // ===== OPTIMIZACIÓN DE RECURSOS =====
    PERFORMANCE: {
        // Limitar uso de memoria
        MAX_SHORT_TERM: 15,        // Reducido de 20
        MAX_THOUGHTS_STORED: 5,     // Solo 5 pensamientos en memoria
        // Throttles para evitar saturación
        TYPING_DELAY: 50,           // ms entre caracteres (más lento = menos carga)
        REQUEST_TIMEOUT: 15000,     // Timeout de 15s para requests
        RETRY_ATTEMPTS: 2          // Solo 2 reintentos
    }
};