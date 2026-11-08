# Sintonía · Frontend (Sprint 1)

Aplicación web de música y pódcast desarrollada como proyecto académico para el curso de Desarrollo Frontend. Este repositorio contiene la implementación completa del **Sprint 1** conectada a la API oficial de Sintonía.

---

## Requisitos previos

- **Node.js** (versión 18 o superior recomendada)
- **npm** (incluido con Node.js)

---

## Cómo instalar y ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/juanchit300y-art/sinfonia-proyect.git
cd sinfonia-proyect
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Crea un archivo llamado `.env` en la raíz del proyecto con la dirección base de la API de Sintonía:

```env
VITE_API_URL=https://yanethm-sintonia-api.fly.dev/api/v1
```

> **Nota:** Para el despliegue en **Vercel**, agrega esta misma variable (`VITE_API_URL`) en *Project Settings → Environment Variables*.

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

Abre en tu navegador la dirección local que indique la terminal (por defecto `http://localhost:5173`).

### 5. Compilar para producción

```bash
npm run build
npm run preview
```

---

## Alcance implementado en el Sprint 1

- **US-SIN-S1-01 · Configuración y sistema de diseño:** Variables CSS (`src/styles/tokens.css`) fieles al sistema de diseño de Figma (colores, tipografías `Syne` e `Inter`, espaciados, radios y sombras) y estilos base (`src/styles/global.css`).
- **US-SIN-S1-02 · Navegación en web y móvil:** Encabezado (`Navbar`), menú hamburguesa accesible con soporte de teclado (`Escape` y retorno de foco) y pie de página (`Footer`) semántico en todas las vistas (`390 px` a `1440 px`).
- **US-SIN-S1-03 · Inicio público (Vista 1):** Hero con cifras dinámicas y collage de portadas SVG, sección «Suena esta semana», cuadrícula «Explora por género» y llamado a la acción (`BannerCta`), consumiendo `GET /generos` y `GET /generos/:id`.
- **US-SIN-S1-04 · Catálogo musical (Vista 2):** Ruta `/catalogo` con filtro de género persistente en la URL (`?genero=gen_salsa`), visualización de artistas, álbumes y canciones más escuchadas del género seleccionado, y dibujo vectorial de portadas (`Portada.jsx`) según `portada.patron` y `portada.colores`.
- **US-SIN-S1-05 · Cambio de idioma (`ES` | `EN`):** Textos de la interfaz cargados dinámicamente desde `GET /textos?idioma=es` y `GET /textos?idioma=en`, actualización de `<html lang>` y persistencia en la cookie `idioma` cuando existe consentimiento.
- **US-SIN-S1-06 · Consentimiento y preferencias de cookies + Accesibilidad:** Banner de primera visita (`BannerCookies`), modal de configuración por categorías (`PreferenciasCookies`) y panel de opciones de accesibilidad (`Accesibilidad`) sincronizados con la cookie `consentimiento`.
