# Sintonia - Frontend

Frontend de la plataforma de musica y podcast Sintonia, desarrollado con React y Vite.

## Requisitos

- Node.js (v18 o superior)
- npm

## Instalacion y ejecucion

### 1. Clonar el repositorio
```bash
git clone https://github.com/juanchit300y-art/sinfonia-proyect.git
cd sinfonia-proyect
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de entorno (Opcional)
El proyecto ya tiene la URL de la API oficial configurada por defecto (`https://yanethm-sintonia-api.fly.dev/api/v1`). Si necesitas apuntar a otra API, puedes crear un archivo `.env` en la raiz:

```env
VITE_API_URL=https://yanethm-sintonia-api.fly.dev/api/v1
```

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```

La pagina abrira en `http://localhost:5173`.

### 5. Compilacion para produccion
Para generar el build de produccion y probarlo localmente:

```bash
npm run build
npm run preview
```

## Despliegue en Vercel
El proyecto esta listo para Vercel. Incluye la configuracion en `vercel.json` para el manejo de rutas de aplicacion de una sola pagina (SPA) y los scripts de compilacion en `package.json`.
