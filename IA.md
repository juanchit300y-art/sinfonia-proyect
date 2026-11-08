# Bitacora de Uso de IA

## Entrada 1 - Enlaces del Navbar (Error de la IA y correccion)

- Que se le pidio a la IA:
Configurar los enlaces de navegacion del navbar (Inicio y Catalogo) leyendo los textos desde la API en GET /api/v1/textos.

- Respuesta equivocada de la IA:
La IA sugirio sacar la palabra Inicio desde los textos de usuario logueado (textos.navbar.enlaces.conSesion.inicio) y dejar Catalogo quemado con un condicional:

```javascript
const enlaces = [
  {
    clave: "inicio",
    ruta: "/",
    etiqueta: nav?.enlaces?.conSesion?.inicio ?? (ingles ? "Home" : "Inicio"),
  },
  {
    clave: "catalogo",
    ruta: "/catalogo",
    etiqueta: ingles ? "Catalog" : "Catalogo",
  },
];
```

- Por que estaba mal:
1. En el sprint 1 estamos haciendo la vista de invitado sin sesion, asi que usar propiedades de conSesion mezclaba la vista privada con la publica.
2. La API ya mandaba directamente textos.navbar.enlaces.inicio y textos.navbar.enlaces.catalogo, y las reglas del sprint no permiten dejar textos quemados en el codigo.

- Correccion:
Revise la respuesta de la API en el navegador, actualice la validacion en useTextos.js y conecte los enlaces en Navbar.jsx directamente a nav.enlaces.inicio y nav.enlaces.catalogo sin tocar nada de conSesion ni usar texto quemado.

---

## Entrada 2 - Guardado de accesibilidad sin permiso de cookies (Error de la IA y correccion)

- Que se le pidio a la IA:
Hacer que las opciones del panel de accesibilidad (alto contraste, reducir movimiento, tamaño de texto, etc.) se guardaran en el navegador y cuadraran con el modal de cookies.

- Respuesta equivocada de la IA:
La IA guardaba siempre las preferencias en localStorage y creaba la cookie apenas el usuario movia cualquier interruptor, sin revisar antes si el usuario habia aceptado las cookies de la categoria de preferencias.

- Por que estaba mal:
Si el usuario rechaza las cookies o solo deja las necesarias, la aplicacion no puede guardar ninguna preferencia en disco ni en cookies para visitas futuras porque no tiene consentimiento.

- Correccion:
Implemente la funcion permiteGuardarPreferencias() en Accesibilidad.jsx y PreferenciasCookies.jsx para verificar que la categoria preferencias este activa o que la cookie de consentimiento diga aceptado. Si no hay permiso, los ajustes funcionan en la sesion actual pero se limpian del almacenamiento local para que al recargar vuelvan a los valores del sistema.

---

## Entrada 3 - Dibujo de portadas y generos en SVG (Portada.jsx)

- Que se le pidio a la IA:
Ayuda para crear el componente Portada.jsx que dibuja las caratulas de albumes y las figuras de generos en SVG a partir del campo portada.patron y los colores que manda la API.

- Como se valido y adapto:
- Se armo la funcion resolverColor para mapear los nombres que manda la API (como portada/3 o fijo/negro) a las variables CSS del proyecto (var(--portada-3), var(--fijo-negro)).
- Se probo cada figura SVG ajustando las coordenadas en el viewBox 0 0 100 100 para que coincidieran con el diseño de Figma, tanto en las tarjetas cuadradas de albumes como en las tarjetas inclinadas de generos.

---

## Entrada 4 - Filtro de generos en la URL y cancelacion de peticiones

- Que se le pidio a la IA:
Orientacion sobre como sincronizar el filtro de generos del catalogo con la barra de direcciones (?genero=...) usando URLSearchParams y pushState, para que si alguien comparte o recarga el enlace de un genero se abra directamente ese genero sin recargar la pagina.

- Como se valido y adapto:
- Se implemento obtenerGeneroDeUrl() en useCatalogo.js para leer el parametro genero al cargar la pagina.
- Se conecto al evento popstate y a la navegacion interna de la aplicacion para que al darle atras o adelante en el navegador el catalogo cargue las canciones y albumes del genero correcto.
- Se le agrego AbortController a las peticiones con un tiempo limite para cancelar llamadas anteriores si el usuario cambia rapido de genero antes de que el servidor termine de responder.
