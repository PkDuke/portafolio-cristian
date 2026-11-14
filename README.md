# Portafolio Personal — Cristian Villota Vega

Portafolio web minimalista y de alto rendimiento de **Cristian Villota Vega**, Lead 3D Web & Interactive Systems Engineer. Especializado en arquitectura de software 3D para el navegador, WebGPU, Three.js, React 19 y motores CAD de ultra alto rendimiento.

---

## 🚀 Proyectos Destacados Incluidos

1. **AFORO — Motor CAD 3D de Planificación Espacial (En Construcción / Alpha Activa)**
   - Software CAD 2D/3D especializado en diseño técnico de recintos de eventos.
   - Renderizado condicional bajo demanda (0W / 0 FPS en reposo).
   - GPU Instancing masivo con soporte de más de 1.000 elementos simultáneos a **145.5 FPS**.
   - Catálogo paramétrico con 902 objetos y 68 pruebas automatizadas (2.944 aserciones).
   - Demo en vivo: [https://aforo-web-azure.vercel.app/](https://aforo-web-azure.vercel.app/)
   - Repositorio: [https://github.com/PkDuke/aforo](https://github.com/PkDuke/aforo)

2. **Knowledge Universe — Grafo Mental & Espacio de Trabajo Cósmico Multi-IA**
   - Canvas 3D a **132 FPS** para orquestación interactiva con ChatGPT, Claude y Gemini.
   - Ingesta semántica profunda de documentos PDF y Word.
   - Demo en vivo: [https://knowledge-universe-mvp.vercel.app/](https://knowledge-universe-mvp.vercel.app/)
   - Repositorio: [https://github.com/PkDuke/Knowledge-Universe-MVP](https://github.com/PkDuke/Knowledge-Universe-MVP)

3. **Pipeline WebGPU & Rendimiento Gráfico Extremo**
   - Renderizado por lotes con apenas **2 draw calls** para escenas complejas.
   - Shaders personalizados en GLSL y WGSL.
   - Bucle de renderizado sin recolección de basura (Zero-GC loop).

4. **Juegos Educativos para Niños** (web, Android y Windows)
   - **Mundo Pequeño** — más de 25 juegos para 2 a 4 años; PWA offline + Capacitor, QA visual con Playwright.
   - **Lumbrera** — historias bíblicas interactivas para 8 a 12 años; TypeScript, Phaser, ElevenLabs.
   - **El Gran Reto Bíblico** — concurso de 15 preguntas; React + Capacitor + Electron.
     Demo web jugable en [`demos/gran-reto/`](demos/gran-reto/) (build de Vite).

5. **Datos & Territorio**
   - **ATLAS Arauca** — observatorio agrícola territorial sobre DANE MGN 2025 (en construcción).
   - **Análisis y Gestión de Datos** — KoBo Toolbox, PRIMES, Power BI y automatización de reportes.
   - **Cíclope** — aprendizaje personalizado con IA para K-12 (MVP).

---

## 🎨 Diseño y estructura (rediseño 2026)

- **Bilingüe ES / EN**: el español vive en `index.html`; el inglés en `i18n.js` (cada clave coincide con un atributo `data-i18n`). El idioma se detecta por navegador, se puede forzar con `?lang=en` o `?lang=es` y se recuerda.
- **Tema claro y oscuro**: sigue al sistema y se puede cambiar con el botón del encabezado. Todos los colores son tokens en `style.css`.
- **Sin dependencias ni build**: `index.html`, `style.css`, `main.js`, `i18n.js`.
- **Rendimiento**: fuentes variables autoalojadas en `assets/fonts/` e imágenes WebP en `assets/img/` (los originales siguen en `assets/`).
- **Boceto de la portada**: planta de salón en Canvas 2D que solo dibuja cuando algo cambia (0 FPS en reposo).

---

## 🛠️ Cómo Probar Localmente

Puedes abrir directamente `index.html` en cualquier navegador moderno, o servirlo con cualquier servidor local:

```bash
# Con Bun
bunx serve .

# O con npx
npx serve .

# O con Python
python -m http.server 8080
```

---

## 🌐 Despliegue en GitHub Pages

1. Sube este repositorio a tu cuenta de GitHub (por ejemplo, con el nombre `portfolio` o `pkduke.github.io`).
2. En GitHub, ve a **Settings** > **Pages**.
3. En **Branch**, selecciona `main` y la carpeta `/ (root)`.
4. Haz clic en **Save**. En 1 o 2 minutos estará disponible en:
   - `https://pkduke.github.io/portfolio/` (si el repo se llama `portfolio`)
   - O `https://pkduke.github.io/` (si el repo se llama `pkduke.github.io`).
