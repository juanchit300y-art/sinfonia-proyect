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

---

## Entrada 5 - Maquetacion y estilos de DetalleAlbum (Error de la IA y correccion)

- Que se le pidio a la IA:
Construir la Vista 3 de detalle de un album (DetalleAlbum.jsx y DetalleAlbum.css) fiel a los disenos de Figma en movil (390px) y escritorio (1440px), reutilizando las clases de tokens.css y conectada a GET /api/v1/albumes/:id.

- Respuesta equivocada de la IA:
En la primera iteracion la IA escribio demasiadas reglas CSS manuales en lugar de reutilizar las clases tipograficas ya definidas en tokens.css (.cuerpo-p, .titular-h2, .detalle-nota), alineo la columna de reproducciones a la derecha en vez de a la izquierda, dibujo las tarjetas de "Mas de {artista}" demasiado grandes en comparacion con la portada principal, y dejo visibles en movil secciones exclusivas de escritorio (fecha larga, aviso legal y "Mas de {artista}"). Ademas quedo un espacio excesivo entre el contenido y el footer.

- Por que estaba mal:
No respetaba las proporciones exactas de Figma (176x176px en las tarjetas inferiores frente a 220x220px arriba), duplicaba estilos que ya existian en el sistema de diseno y recargaba la vista movil con bloques que solo pertenecen a escritorio.

- Correccion:
Se simplifico DetalleAlbum.css reutilizando las clases predefinidas de tokens.css, se alineo la columna de reproducciones a la izquierda, se fijaron las tarjetas de "Mas de {artista}" a 176x176px exactos, se ocultaron el pie legal y "Mas de {artista}" en movil y se ajusto el margen inferior a 16px (var(--espacio-4)) para igualar la separacion con el footer de Figma.

---

## Entrada 6 - Texto visible de carga y contraste en modo claro en los estados de interfaz (Error de la IA y correccion)

- Que se le pidio a la IA:
Crear los componentes reutilizables EstadoCarga, EstadoVacio y EstadoError para CatalogoMusical y DetalleAlbum alimentados 100% con los textos de GET /api/v1/textos y probables con las cabeceras X-Simular-Latencia y X-Simular-Error.

- Respuesta equivocada de la IA:
En EstadoCarga.jsx la IA dejo textos.estados.cargando.titulo ("Cargando...") unicamente como respaldo oculto para lectores de pantalla en lugar de mostrarlo visible en pantalla junto a los esqueletos. Ademas, en EstadoError.css y EstadoVacio.css uso var(--marca-primario) (#c6f24e) para el texto y borde de los botones, lo cual perdia contraste sobre fondo blanco al activar el tema claro ([data-tema="claro"]).

- Por que estaba mal:
Para Sintonia el contrato indica que textos.estados.cargando.titulo es el texto visible y textos.estados.cargando.aria es el aria-label del indicador; y un boton verde lima claro sobre blanco no cumple contraste accesible en modo claro.

- Correccion:
Se mostro de forma visible textos.estados.cargando.titulo encima de los esqueletos conservando textos.estados.cargando.aria en aria-label, se reemplazaron los colores de borde y texto de los botones por var(--texto-marca) (#486200 en claro y #c6f24e en oscuro), se agrego contraste especifico para los esqueletos en [data-tema="claro"] y se conecto obtenerCabecerasSimulacion en api.js saltando /textos para simular latencia y error 503 sin perder traducciones.

---

## Entrada 7 - Formulario de inicio de sesion, validacion, POST /sesion y errores 401/429/red (IniciarSesion.jsx y Aviso.jsx)

- Que se le pidio a la IA:
Construir la Vista 4 (/ingresar) de forma incremental en 4 pasos: maquetacion visual movil (390px) y web (1440px), boton de ver/ocultar contrasena, validacion de campos con foco automatico + envio real POST /api/v1/sesion, y manejo de errores 401, 422, 429 (Retry-After) y sin conexion.

- Como se valido y adapto:
- Se creo el componente reutilizable Aviso.jsx con las 3 variantes de Figma (error, exito, info) y se integro el estado de carga del boton ("Ingresando...") con spinner respetando Reducir movimiento.
- Se auditaron y corrigieron detalles de navegador y CSS: ocultacion del ojo nativo duplicado en Edge (::-ms-reveal), estilos :-webkit-autofill para modo oscuro, especificidad de .ingresar-enlace:hover frente a a:hover de global.css y proteccion contra el hover decorativo de Portada.css.
- Se verifico el contrato oficial enviando unicamente { correo, clave } con credentials: "include" (cookie httpOnly), cuenta regresiva en vivo para el error 429 leyendo la cabecera Retry-After y cambio del boton principal a "Reintentar" cuando falla la red conservando lo escrito.

---

## Entrada 8 - Sesion persistente con cookie httpOnly y Navbar autenticado (useSesion.js y Navbar.jsx)

- Que se le pidio a la IA:
Implementar la persistencia de sesion usando exclusivamente la cookie httpOnly "sesion" mediante GET /api/v1/sesion y DELETE /api/v1/sesion (sin localStorage), redirigir ante 401 no_autenticado y adaptar el Navbar en web (1440px) y movil (390px) segun los disenos de Figma.

- Como se valido y adapto:
- Se creo el hook useSesion.js con AbortController para consultar GET /sesion al abrir o recargar la app, exponer cerrarSesion() (DELETE /sesion 204) y escuchar el evento global sintonia-no-autenticado emitido por api.js cuando una ruta privada devuelve 401.
- Se maqueto el avatar verde circular SQ y su menu desplegable de 272px en web (cerrable con Escape y clic exterior) y la barra inferior con avatar de color dinamico (usuario.color) y boton Cerrar sesion en el menu movil.
- En las pruebas se corrigio la especificidad de .navbar button { font: inherit } sobre las clases tipograficas de los botones nuevos y se elimino la franja negra inferior sobrante del menu movil ajustando el margen negativo inferior a -24px.