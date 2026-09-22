/**
 * ========================================
 * CAINE 2.0 - Sistema Visual Avanzado
 * Fase 2: Canvas, Partículas y Animaciones
 * ========================================
 */

class CAINE_Visual {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.maxParticles = 50; // Ligero para tu PC
        this.animationFrame = null;
        this.glitchOverlay = null;
        this.caineAura = null;
        this.speechBubble = null;
        
        // Estado de animaciones
        this.isGlitching = false;
        this.isChaosMode = false;
        
        // Colores del circo
        this.circusColors = [
            '#ffcc00', // dorado
            '#ff0055', // rojo
            '#00ffff', // cian
            '#ff88ff', // rosa
            '#88ff88', // verde
            '#8888ff', // azul
        ];
        
        // Estrellas decorativas
        this.stars = [];
        
        // Inicializar
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupCanvas();
        this.createStars();
        this.startRenderLoop();
        this.setupClickEffects();
    }

    cacheElements() {
        this.canvas = document.getElementById('particle-canvas');
        this.glitchOverlay = document.getElementById('glitch-overlay');
        this.caineAura = document.getElementById('caine-aura');
        this.speechBubble = document.getElementById('speech-bubble');
        this.stage = document.getElementById('circus-stage');
    }

    setupCanvas() {
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // === SISTEMA DE PARTÍCULAS ===

    createStars() {
        this.stars = [];
        for (let i = 0; i < 30; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.1,
                twinkle: Math.random() * Math.PI * 2,
                color: this.circusColors[Math.floor(Math.random() * this.circusColors.length)]
            });
        }
    }

    createParticle(x, y, type = 'default') {
        if (this.particles.length >= this.maxParticles) {
            // Eliminar la partícula más antigua
            this.particles.shift();
        }

        const particle = {
            x: x || Math.random() * window.innerWidth,
            y: y || Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 4 + 2,
            life: 1,
            decay: 0.01 + Math.random() * 0.02,
            color: this.circusColors[Math.floor(Math.random() * this.circusColors.length)],
            type: type,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };

        this.particles.push(particle);
    }

    createBurst(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 2 + Math.random() * 3;
            
            const particle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 2,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                color: this.circusColors[Math.floor(Math.random() * this.circusColors.length)],
                type: 'burst',
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            };
            
            this.particles.push(particle);
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Actualizar posición
            p.x += p.vx;
            p.y += p.vy;
            
            // Aplicar gravedad ligera
            p.vy += 0.02;
            
            // Reducir vida
            p.life -= p.decay;
            
            // Rotación
            p.rotation += p.rotationSpeed;
            
            // Eliminar partículas muertas
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Partículas ambientales espontáneas
        if (Math.random() < 0.02) {
            this.createParticle();
        }
    }

    renderParticles() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar estrellas
        for (const star of this.stars) {
            star.twinkle += 0.05;
            const opacity = 0.3 + Math.sin(star.twinkle) * 0.3;
            
            this.ctx.save();
            this.ctx.globalAlpha = opacity;
            this.ctx.fillStyle = star.color;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Renderizar partículas
        for (const p of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            
            if (p.type === 'burst') {
                // Forma de estrella para bursts
                this.drawStar(0, 0, 5, p.size, p.size / 2);
            } else {
                // Círculo normal
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerRadius;
            let y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }

        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }

    startRenderLoop() {
        const render = () => {
            this.updateParticles();
            this.renderParticles();
            this.animationFrame = requestAnimationFrame(render);
        };
        
        render();
    }

    // === EFECTOS DE GLITCH ===

    triggerGlitch(duration = 3000) {
        if (this.isGlitching) return;
        
        this.isGlitching = true;
        
        // Efecto en el overlay
        this.glitchOverlay.classList.add('active');
        
        // Efecto en el cuerpo
        document.body.classList.add('glitching');
        
        // Crear partículas de glitch
        const glitchInterval = setInterval(() => {
            for (let i = 0; i < 5; i++) {
                this.createParticle(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight,
                    'glitch'
                );
            }
        }, 100);
        
        // Terminar glitch
        setTimeout(() => {
            this.isGlitching = false;
            this.glitchOverlay.classList.remove('active');
            document.body.classList.remove('glitching');
            clearInterval(glitchInterval);
        }, duration);
    }

    // === MODO CAOS ===

    activateChaosMode() {
        this.isChaosMode = true;
        document.body.classList.add('chaos-mode');
        
        // Incrementar partículas
        this.maxParticles = 100;
        
        // Efecto en aura
        if (this.caineAura) {
            this.caineAura.style.animation = 'aura-chaos 0.3s infinite';
        }
    }

    deactivateChaosMode() {
        this.isChaosMode = false;
        document.body.classList.remove('chaos-mode');
        
        // Restaurar partículas
        this.maxParticles = 50;
        
        if (this.caineAura) {
            this.caineAura.style.animation = 'aura-pulse 3s infinite';
        }
    }

    // === AURA DE CAINE ===

    createAura() {
        if (!this.caineAura || !document.getElementById('caine-img')) return;
        
        const caineImg = document.getElementById('caine-img');
        
        this.caineAura.style.position = 'absolute';
        this.caineAura.style.width = caineImg.offsetWidth + 'px';
        this.caineAura.style.height = caineImg.offsetHeight + 'px';
        this.caineAura.style.borderRadius = '50%';
        this.caineAura.style.background = 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)';
        this.caineAura.style.animation = 'aura-pulse 3s infinite';
        this.caineAura.style.zIndex = '-1';
        this.caineAura.style.top = '50%';
        this.caineAura.style.left = '50%';
        this.caineAura.style.transform = 'translate(-50%, -50%)';
    }

    // === BURBUJA DE DIÁLOGO ===

    showSpeechBubble(text, duration = 3000) {
        if (!this.speechBubble) return;
        
        const speechText = document.getElementById('speech-text');
        speechText.textContent = text;
        this.speechBubble.classList.remove('hidden');
        this.speechBubble.classList.add('visible');
        
        setTimeout(() => {
            this.speechBubble.classList.remove('visible');
            this.speechBubble.classList.add('hidden');
        }, duration);
    }

    // === CLICK EFFECTS ===

    setupClickEffects() {
        document.addEventListener('click', (e) => {
            // Crear burst en el lugar del click
            this.createBurst(e.clientX, e.clientY, 10);
        });
    }

    // === TRANSICIONES DE ESCENARIO ===

    changeBackgroundColor(color, transitionDuration = 1000) {
        this.stage.style.transition = `background-color ${transitionDuration}ms ease`;
        this.stage.style.backgroundColor = color;
    }

    // === ANIMACIONES DE PUERTAS ===

    animateDoorCreation(doorElement) {
        doorElement.style.animation = 'door-spawn 0.8s ease forwards';
        
        // Crear partículas alrededor de la puerta
        const rect = doorElement.getBoundingClientRect();
        this.createBurst(rect.left + rect.width/2, rect.top + rect.height/2, 15);
    }

    // === EFECTO DE ESCALADO PARA CAINE ===

    pulseCaine(intensity = 1) {
        const caineImg = document.getElementById('caine-img');
        if (!caineImg) return;
        
        caineImg.style.transform = `scale(${1 + intensity * 0.1})`;
        caineImg.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            caineImg.style.transform = 'scale(1)';
        }, 200);
    }

    // === LIMPIEZA ===

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.particles = [];
    }
}

// Exportar
window.CAINE_Visual = CAINE_Visual;