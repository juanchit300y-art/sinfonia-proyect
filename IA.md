# Bitácora de Uso de Inteligencia Artificial (`IA.md`)

En este documento se registran las consultas realizadas a herramientas de Inteligencia Artificial durante el desarrollo del **Sprint 1** de **Sintonía**, incluyendo el análisis crítico de las respuestas obtenidas, las correcciones manuales aplicadas cuando la IA cometió errores y la verificación final en el código.

---

## Entrada 1 · Consulta de enlaces del `Navbar` en vista de invitado (Respuesta equivocada de la IA y cómo se corrigió)

- **Contexto / Historia de usuario:** `US-SIN-S1-02` (Navegar por el sitio en web y móvil) y `US-SIN-S1-05` (Cambiar el idioma entre español e inglés).
- **Qué se le pidió a la IA:** Configurar los enlaces de navegación del encabezado (`Inicio` y `Catálogo`) consumiendo los textos desde `GET /api/v1/textos`.
- **Respuesta equivocada de la IA:**
  En una primera versión, la IA sugirió extraer la palabra «Inicio» desde el subobjeto de usuario autenticado (`textos.navbar.enlaces.conSesion.inicio`) y dejar la palabra «Catálogo» escrita manualmente con un condicional ternario (`ingles ? "Catalog" : "Catálogo"`):
  ```js
  // Sugerencia errónea inicial de la IA:
  const enlaces = [
    {
      clave: "inicio",
      ruta: "/",
      etiqueta: nav?.enlaces?.conSesion?.inicio ?? (ingles ? "Home" : "Inicio"),
    },
    {
      clave: "catalogo",
      ruta: "/catalogo",
      etiqueta: ingles ? "Catalog" : "Catálogo",
    },
  ];
  ```
- **Por qué estaba mal:**
  1. En el Sprint 1 se está construyendo la vista pública (visitante sin sesión iniciada), por lo que leer propiedades de `conSesion` mezclaba responsabilidades de vistas privadas con públicas.
  2. La API actualizada ya provee directamente `textos.navbar.enlaces.inicio` y `textos.navbar.enlaces.catalogo`, y la historia `US-SIN-S1-05` prohíbe dejar textos de interfaz escritos manualmente dentro de los componentes.
- **Cómo se corrigió:**
  Se inspeccionó la respuesta real del endpoint `GET /api/v1/textos?idioma=es` y `GET /api/v1/textos?idioma=en`, se actualizó la validación en `src/hooks/useTextos.js` y se conectaron ambos enlaces en `src/components/Navbar.jsx` directamente a `nav?.enlaces?.inicio` y `nav?.enlaces?.catalogo` sin tocar `conSesion` ni usar textos quemados.

---

## Entrada 2 · Maquetación de las columnas del `Footer` y sincronización de cookies con `Accesibilidad` (Respuesta equivocada de la IA y cómo se corrigió)

- **Contexto / Historia de usuario:** `US-SIN-S1-02` (Pie de página responsivo) y `US-SIN-S1-06` (Consentimiento de cookies).
- **Qué se le pidió a la IA:** Ajustar las tres columnas de enlaces del `Footer` en escritorio y agregar el enlace de «Preferencias de cookies» junto con la persistencia de opciones de accesibilidad.
- **Respuesta equivocada de la IA:**
  1. **En el `Footer`:** La IA aplicó un `grid-template-columns: repeat(auto-fit, minmax(130px, 1fr))` sin un ancho suficiente en el contenedor de escritorio, lo que provocaba que textos como *«Catálogo musical»*, *«Iniciar sesión»* y *«Preferencias de cookies»* se partieran en dos renglones en pantallas de escritorio (`1440 px`), rompiendo el diseño de Figma.
  2. **En `Accesibilidad` y `PreferenciasCookies`:** Inicialmente la IA guardaba los cambios de accesibilidad en `localStorage` siempre que el usuario movía un interruptor, sin comprobar antes si el usuario había aceptado las cookies de la categoría `preferencias`.
- **Cómo se corrigió:**
  1. En `src/components/Footer.css`, se corrigió la disposición en escritorio (`@media (min-width: 900px)`) usando `display: flex` con `gap: var(--espacio-16)` y `white-space: nowrap` en los enlaces para que ninguna opción se parta en dos líneas, manteniendo el ajuste de línea natural en móvil (`390 px`).
  2. En `src/components/Accesibilidad.jsx` y `src/components/PreferenciasCookies.jsx`, se implementó la función `permiteGuardarPreferencias()` que verifica tanto la categoría `preferencias` en `sintonia-consentimiento-categorias` como la cookie `consentimiento=aceptado`. Si el usuario rechaza o desactiva las cookies de preferencias, los ajustes funcionan durante la visita actual pero se limpian del almacenamiento (`limpiarPreferenciasGuardadas()`) para no persistir al recargar.

---

## Entrada 3 · Generación de carátulas geométricas en SVG (`Portada.jsx`)

- **Contexto / Historia de usuario:** `US-SIN-S1-01`, `US-SIN-S1-03` y `US-SIN-S1-04`.
- **Qué se le pidió a la IA:** Construir un componente reutilizable en React (`src/components/Portada.jsx`) que dibuje las portadas de los álbumes y las miniaturas de los géneros en formato SVG usando `portada.patron` y los tokens de color de la API (`portada/1` a `portada/6`, `fijo/negro`, `fijo/blanco`).
- **Cómo se validó y adaptó:**
  - Se creó la función exportada `resolverColor(colorApi, fallback)` que transforma cadenas del tipo `"portada/3"` o `"fijo/negro"` en variables CSS del sistema de diseño (`var(--portada-3)`, `var(--fijo-negro)`).
  - Se verificó cada uno de los trazados vectoriales (`<circle>`, `<line>`) sobre un `viewBox="0 0 100 100"` comparándolos visualmente contra el bloque «Sprint 1» de Figma tanto en las tarjetas de álbum como en las tarjetas inclinadas de género.

---

## Entrada 4 · Manejo de estado de filtro en la URL (`?genero=`) y cancelación de peticiones con `AbortController`

- **Contexto / Historia de usuario:** `US-SIN-S1-03` (Inicio público) y `US-SIN-S1-04` (Catálogo musical).
- **Qué se le pidió a la IA:** Diseñar los hooks personalizados `useInicio.js` y `useCatalogo.js` para consultar `GET /generos` y `GET /generos/:id`, manteniendo sincronizado el parámetro `?genero=` en la barra de direcciones del navegador sin recargar la página.
- **Cómo se validó y adaptó:**
  - Se implementó `obtenerGeneroDeUrl()` con `URLSearchParams(window.location.search)` para leer el género inicial al cargar o compartir un enlace como `/catalogo?genero=gen_salsa`.
  - Se conectaron los eventos `popstate` (botones Atrás/Adelante del navegador) y un evento personalizado `sintonia-navegacion` en `App.jsx` para que al navegar entre vistas o seleccionar otro género con `window.history.pushState`, el hook actualice automáticamente los artistas, álbumes y canciones más escuchadas del género elegido.
  - Se añadió `AbortController` con un límite de tiempo de 12 segundos en cada `useEffect` para cancelar peticiones pendientes si el usuario cambia rápidamente de género o de vista.
