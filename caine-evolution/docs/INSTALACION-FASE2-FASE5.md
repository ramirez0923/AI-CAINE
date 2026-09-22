# 🎪 CAINE Evolution - GUÍA DE INSTALACIÓN FASE 2 + FASE 5
## Configurar en tu PC (VSCode + Python)

---

## 📦 PASO 1: Descargar archivos

Descarga el archivo `caine-evolution-fase2.zip` de mi workspace.

Descomprímelo en tu carpeta de proyectos:
```
C:\Users\TU_USUARIO\Documents\Proyectos\caine-evolution\
```

---

## 📁 Estructura esperada después de descomprimir

```
caine-evolution/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── autonomous.js
│   ├── config.js
│   ├── evolution.js
│   ├── memory.js
│   └── visual.js      ← NUEVO
├── img/
│   └── caine.png
└── docs/
    └── FASE2-VISUAL.md
```

---

## 🖥️ PASO 2: Comandos para tu terminal (VSCode)

Abre la terminal de VSCode: `Ctrl + ñ` o `Ver > Terminal`

### 2.1 Verificar que estés en la carpeta correcta

```bash
cd caine-evolution
ls
```

Deberías ver: `index.html  css/  js/  img/  docs/`

---

### 2.2 OPCIONAL: Instalar Ollama (IA local - más rápido y gratis)

Si quieres que CAINE funcione SIN depender de la API de Google:

```bash
# 1. Descargar Ollama desde https://ollama.com/download
#    - Descarga el instalador de Windows (.exe)
#    - Instálalo normalmente

# 2. Abrir una NUEVA terminal (o reiniciar VSCode) y ejecutar:

# Descargar el modelo ligero (1GB, funciona bien en 8GB RAM)
ollama pull llama3.2:1b

# Verificar que se instaló
ollama list
```

**Para que CAINE use Ollama:**
```bash
# Ejecutar en una terminal SEPARADA (mantenla abierta)
ollama serve
```

Luego abre `index.html` en tu navegador. CAINE detectará Ollama automáticamente.

---

### 2.3 Si NO quieres Ollama (usar Gemini)

No necesitas hacer nada, CAINE usará Gemini automáticamente.

Para verificar tu API key, edita el archivo `js/config.js` línea 22:
```javascript
apiKey: 'TU_API_KEY_AQUI'  // ← Pon tu key de Google AI Studio
```

---

## 🚀 PASO 3: Abrir el proyecto

```bash
# Desde la carpeta caine-evolution
code .
```

Esto abre VSCode en la carpeta del proyecto.

---

## 🎮 PASO 4: Probar la aplicación

### Opción A: Abrir directamente
```bash
# En Windows
start index.html

# En Mac
open index.html

# En Linux
xdg-open index.html
```

### Opción B: Usar Live Server (recomendado)
```bash
# Instalar la extensión "Live Server" en VSCode
# Luego click derecho en index.html → "Open with Live Server"
```

---

## 🎨 FASE 5: Generación de Imágenes (para que CAINE dibuje)

### Requisitos
- Tu NVIDIA GeForce GT 730 (2GB VRAM)
- Python instalado

### Comandos en terminal:

```bash
# 1. Crear carpeta para la generación de imágenes
mkdir image-gen
cd image-gen

# 2. Instalar Python (si no lo tienes)
# Descarga desde https://www.python.org/downloads/

# 3. Crear entorno virtual
python -m venv venv

# 4. Activar el entorno
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# 5. Instalar dependencias
pip install torch torchvision pillow flask

# 6. OPCIONAL: Descargar modelo Stable Diffusion
# Esto es pesado (~5GB), solo si quieres generación local
# pip install diffusers
```

---

## 🔧 Configurar CAINE para usar generación de imágenes

Edita `js/config.js` y agrega:

```javascript
IMAGE_GEN: {
    enabled: true,
    provider: 'local',  // 'local' o 'external'
    LOCAL: {
        // Configuración para generación local
        apiUrl: 'http://localhost:5000/generate'
    }
}
```

---

## 📝 NOTAS IMPORTANTES

1. **Tu GT 730 (2GB) es limitada para Stable Diffusion**
   - Modelos completos no funcionarán bien
   - Recomendación: usar modelos Tiny/LCM o generación en CPU

2. **Alternativa más fácil: usar API externa**
   - Stability AI (gratis con límites)
   - Replicate (pago por uso)

3. **Testear sin GPU:**
   - Puedes usar CPU-only, será lento pero funciona
   - No intentes Stable Diffusion con 2GB de VRAM

---

## ❓ Si tienes problemas

```bash
# Verificar versión de Python
python --version

# Verificar pip
pip --version

# Verificar que estés en el entorno correcto
pip list

# Reinstalar dependencias
pip uninstall torch pillow flask
pip install torch pillow flask
```

---

## 🎪 Próximos pasos después de instalar

1. Probar que CAINE responde
2. Verificar partículas y efectos visuales
3. Comenzar con Fase 5 si quieres que CAINE dibuje

¡Avísame si algo no funciona! 🚀