import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import Icono from "./Icono.jsx";
// importo el componente independiente del boton y panel de accesibilidad
import Accesibilidad from "./Accesibilidad.jsx";
// importo el traductor de tokens de color de la API (ej. "portada/1" -> "var(--portada-1)") para el avatar movil
import { resolverColor } from "./Portada.jsx";

// Funcion auxiliar que obtiene las iniciales del usuario desde la API o las calcula desde su nombre
function obtenerIniciales(usuario) {
  // Si la API ya entrego iniciales explicitas (ej. "SQ") las devolvemos en mayusculas
  if (typeof usuario?.iniciales === "string" && usuario.iniciales.trim()) {
    // Limpiamos espacios y aseguramos mayusculas
    return usuario.iniciales.trim().toUpperCase();
  }
  // Respaldo calculando las dos primeras iniciales a partir de usuario.nombre
  const partes = (usuario?.nombre ?? "").trim().split(/\s+/).filter(Boolean);
  // Unimos las primeras letras de hasta dos palabras en mayusculas
  return partes
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

// Funcion auxiliar que extrae solo el primer nombre para el pie compacto del menu movil (ej. "Sara")
function obtenerPrimerNombre(nombre) {
  // Tomamos la primera palabra del nombre completo sin espacios sobrantes
  return (nombre ?? "").trim().split(/\s+/)[0] || "";
}

// componente principal Navbar
const Navbar = ({
  textos, //objeto con todos los textos traducidos obtenidos de la API
  cargando, // boleano:  True mientras la API está consultando los textos
  error, // booleano true si la llamada a la API falla por red o servidor
  recargar, // funcion para volver a disparar la peticion a la API si hubo fallo
  idioma, // idioma activo
  activo, //clave de la ruta o vista activa actualmente (inicio, catalogo, etc)
  cambiarIdioma, // funcion para cambiar el estado global del idioma
  onNavegar, // funcion que ejecuta window.history.pushState para navegar sin recargar 
  usuario = null, // objeto del usuario autenticado desde GET /sesion (o null si es invitado)
  cargandoSesion = false, // booleano que evita parpadeo de botones de invitado mientras responde GET /sesion
  cerrandoSesion = false, // booleano que deshabilita "Cerrar sesion" mientras corre DELETE /sesion
  onCerrarSesion, // callback de App.jsx que ejecuta DELETE /sesion y regresa al inicio
}) => {
  // estado local para saber si el panel desplegable del menu movil está abierto o cerrado
  const [abierto, setAbierto] = useState(false);
  // estado local para saber si el menu desplegable de cuenta en escritorio esta abierto
  const [menuCuentaAbierto, setMenuCuentaAbierto] = useState(false);
  // referencia al botón hamburguesa para devolverle el foco al cerrar con Escape, que pueda recibir eventos de teclado
  const botonMenu = useRef(null);
  // referencia al contenedor del avatar + menu de cuenta en web para detectar clic afuera
  const contenedorCuentaRef = useRef(null);
  // referencia al boton circular del avatar en web para devolverle el foco al cerrar con Escape
  const botonCuentaRef = useRef(null);
  // acceso directo y seguro al subobjeto de navbar dentro de textos de la API
  const nav = textos?.navbar;
  // iniciales y datos derivados del usuario autenticado para web y movil
  const inicialesUsuario = obtenerIniciales(usuario);
  // primer nombre para la barra inferior del menu hamburguesa movil (ej. "Sara")
  const primerNombre = obtenerPrimerNombre(usuario?.nombre);
  // color dinamico del avatar movil segun el token usuario.color de la API (ej. "portada/1" -> morado)
  const colorAvatarMovil = resolverColor(usuario?.color, "var(--portada-1)");
  // si el color de fondo del avatar es amarillo claro usamos texto oscuro para mantener contraste WCAG
  const esAvatarClaro = usuario?.color === "portada/4";

  // funcion que intercepta el clic en cualquier enlace interno de navegacion
  function manejarNavegacion(evento, ruta) {
    // si la funcion navegadora fue dada por App.jsx
    if (onNavegar) {
      // evita que el navegador recargue toda la pagina web
      evento.preventDefault();
      // notifica a App.jsx la nueva ruta para cambiar la vista mediante pushState
      onNavegar(ruta);
    }
    // cierra el menu movil automaticamente para que no tape la nueva vista seleccionada
    setAbierto(false);
    // cierra tambien el menu desplegable de cuenta en web si estaba abierto
    setMenuCuentaAbierto(false);
  }

  // manejador comun del boton "Cerrar sesion" tanto en el menu web como en la cortina movil
  async function manejarClickCerrarSesion() {
    // cerramos ambos menus de inmediato para una respuesta visual limpia
    setMenuCuentaAbierto(false);
    setAbierto(false);
    // ejecutamos DELETE /sesion a traves del callback recibido desde App.jsx
    await onCerrarSesion?.();
  }

  // texto accesible para el boton cuando el menu movil esta cerrado desde la API
  const abrir = textos?.menuMovil?.abrir;

  // texto accesible para el boton cuando el menu movil esta abierto desde la API
  const cerrar = textos?.menuMovil?.cerrar;

  // guardo en enlaces un arreglo de objetos con los 2 enlaces disponibles desde la API y su icono movil
  const enlaces = [
    {
      clave: "inicio", //identificador unico del enlace
      ruta: "/",
      // icono de casita mostrado junto al enlace en el menu hamburguesa movil
      icono: "inicio",
      //la etiqueta es lo que verá el usuario desde la API
      etiqueta: nav?.enlaces?.inicio,
    },
    {
      clave: "catalogo", //clave para el segundo enlace
      ruta: "/catalogo",
      // icono de lupa mostrado junto al enlace en el menu hamburguesa movil
      icono: "buscar",
      etiqueta: nav?.enlaces?.catalogo, //texto de catálogo desde la API
    },
  ];

  // Efecto de accesibilidad que permite cerrar el menu movil presionado la tecla Escape
  useEffect(() => {
    // funcion que escucha las pulsaciones del teclado
    function cerrarConEscape(evento) {
      // si el menu no esta abierto no hace nada
      if (!abierto) return;
      // si la tecla presionada fue "Escape"
      if (evento.key === "Escape") {
        // cierra el menu desplegable
        setAbierto(false);
        // devuelve el foco visual y del teclado al boton que abrió el menu
        botonMenu.current?.focus();
      }
    }
    // registra un evento global de escucha en el documento
    document.addEventListener("keydown", cerrarConEscape);
    // elimina el listener cuando el componente se desmonta o cambia el estado abierto
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [abierto]);

  // Efecto de accesibilidad para el menu de cuenta en web: cierra con Escape o al hacer clic afuera
  useEffect(() => {
    // si el popover de cuenta no esta abierto no registramos listeners
    if (!menuCuentaAbierto) return;

    // cierra el popover al pulsar Escape y devuelve el foco al boton circular de iniciales
    function manejarTecladoCuenta(evento) {
      // comprobamos la tecla Escape
      if (evento.key === "Escape") {
        // cerramos el menu de cuenta
        setMenuCuentaAbierto(false);
        // devolvemos el foco al avatar disparador
        botonCuentaRef.current?.focus();
      }
    }

    // cierra el popover si el usuario hace clic fuera del contenedor de cuenta
    function manejarClickExterior(evento) {
      // verificamos si el elemento clickeado esta fuera del bloque de cuenta
      if (
        contenedorCuentaRef.current &&
        !contenedorCuentaRef.current.contains(evento.target)
      ) {
        // cerramos el menu desplegable
        setMenuCuentaAbierto(false);
      }
    }

    // registramos ambos listeners globales mientras el menu esta abierto
    document.addEventListener("keydown", manejarTecladoCuenta);
    document.addEventListener("mousedown", manejarClickExterior);
    // limpiamos los listeners al cerrar el menu o desmontar el navbar
    return () => {
      document.removeEventListener("keydown", manejarTecladoCuenta);
      document.removeEventListener("mousedown", manejarClickExterior);
    };
  }, [menuCuentaAbierto]);

  // si el usuario cierra sesion, garantizamos que el popover de cuenta quede cerrado
  useEffect(() => {
    // cuando usuario vuelve a null apagamos el estado del desplegable
    if (!usuario) {
      setMenuCuentaAbierto(false);
    }
  }, [usuario]);

  // componente reutilizable para la pildora de idioma
  const selectorIdioma = (
    // contenedor con rol de grupo para lectores de pantalla
    <div className="navbar-idioma-segmentado" role="group" aria-label={nav?.aria?.idioma}>
      
      {/* boton para activar el idioma a español */}
      <button 
        type="button" 
        className={`navbar-idioma-pildora ${idioma === "es" ? "is-activo" : ""}`}
        onClick={() => cambiarIdioma("es")}
        aria-pressed={idioma === "es"}
      >
        {/* texto "ES" obtenido de la API */}
        {textos?.idioma?.codigos?.es}
      </button>
      
      {/* boton para activa el idioma ingles */}
      <button 
        type="button" 
        className={`navbar-idioma-pildora ${idioma === "en" ? "is-activo" : ""}`}
        onClick={() => cambiarIdioma("en")}
        aria-pressed={idioma === "en"}
      >
        {/* texto "EN" obtenido de la API */}
        {textos?.idioma?.codigos?.en}
      </button>
    </div>
  );

  return (
    <header className="navbar">
      {/* contenedor centralizado con ancho maximo y etiqueta accesible de navegacion */}
      <nav
        className="contenedor navbar-interior"
        aria-label={nav?.aria?.navegacion}
      >

        {/* Logo con icono de ondas de Sintonía que a la vez es un enlace interactivo que redirige al inicio */}
        <a
          href="/"
          className="navbar-marca"
          aria-label={nav?.logo?.aria}
          onClick={(evento) => manejarNavegacion(evento, "/")}
        >
          <Icono nombre="logo" />
          <span className="titular-h3 navbar-marca-texto">
            {nav?.logo?.texto?.toLowerCase()}
          </span>
        </a>

        {/* zona de botones interactivos visibles en moviles*/}
        <div className="navbar-movil-acciones">
          {/* en movil: si hay sesion iniciada mostramos la lupa de catalogo; si es invitado mostramos "Ingresar" */}
          {nav && !abierto && !cargandoSesion && (
            usuario ? (
              // enlace con icono de lupa hacia el catalogo igual que en Figma movil con sesion iniciada
              <a
                // destino hacia el catalogo musical
                href="/catalogo"
                // estilo circular compacto consistente con el navbar movil
                className="navbar-icono"
                // etiqueta accesible desde la API
                aria-label={textos?.general?.acciones?.buscar ?? nav?.enlaces?.catalogo}
                // navegacion SPA sin recarga
                onClick={(evento) => manejarNavegacion(evento, "/catalogo")}
              >
                {/* icono vectorial de lupa */}
                <Icono nombre="buscar" />
              </a>
            ) : (
              // enlace rapido a ingresar para usuarios invitados
              <a
                href="/ingresar"
                className="navbar-movil-enlace-ingresar"
                onClick={(evento) => manejarNavegacion(evento, "/ingresar")}
              >
                {nav?.botones?.invitado?.ingresar}
              </a>
            )
          )}

          {/* boton hamburguesa que abre y cierra el panel movil */}
          <button
            type="button"
            ref={botonMenu}
            className={`navbar-icono ${abierto ? "navbar-boton-cerrar": ""}`}
            aria-label={abierto ? cerrar : abrir}
            aria-expanded={abierto}
            aria-controls="navbar-panel"
            onClick={() => setAbierto((valor) => !valor)}
          >
            {/* si esta abierto muestra el icono "x" si esta cerrado muestra las 3 lineas */}
            <Icono nombre={abierto ? "cerrar" : "menu"} />
          </button>
        </div>

        {/* Panel de navegación, horizontal en web y cortina en movil */}
        <div
          id="navbar-panel"
          className={`navbar-panel${abierto ? " is-abierto" : ""}`}
          aria-busy={cargando}
        >
          {/* mensajes de carga accesible si la API aun esta obteniendo los textos */}
          {cargando && (
            <p className="navbar-estado" role="status">
              {textos?.estados?.cargando?.titulo}
            </p>
          )}

          {/* mensaje de error si falló la conexion con la API */}
          {error && (
            <div className="navbar-estado" role="alert">
              <p>
                {textos?.estados?.error?.titulo}
              </p>

              {/* boton para reintentar la solicitud de texto a la API */}
              <button type="button" onClick={recargar}>
                {textos?.general?.acciones?.reintentar}
              </button>
            </div>
          )}
          
          {/* solo dibuja los enlaces si nav ya cargó de la API para evitar errores */}
          {nav && (
            <ul className="navbar-enlaces">

              {/* recorre el arreglo de 2 enlaces y ejecuta esta funcion por cada uno, inicio y catalogo */}
              {enlaces.map((enlace) =>(
                // cada li necesita una key para que react sepa que elemento redibujar
                <li key={enlace.clave}>
                  <a
                    href={enlace.ruta}
                    // si está activo pinta la barrita verde abajo, 
                    aria-current={
                      activo === enlace.clave || window.location.pathname === enlace.ruta ? "page" : undefined
                    }
                    // cuando hay un clic encima maneja el cambio de pagina
                    onClick={(evento) => manejarNavegacion(evento, enlace.ruta)}
                  >
                    {/* icono visible solo en el menu hamburguesa movil (oculto en escritorio) */}
                    <Icono nombre={enlace.icono} className="navbar-enlace-icono-movil" />
                    {/* texto visible del enlace unicamente llamado de la API */}
                    <span>{enlace.etiqueta}</span>
                  </a>
                </li>  
              ))}
            </ul>
          )}

          {/* selector de idioma en movil, lo pongo luego de la lista de enlaces porque va hasta el final de ello*/}
          { nav && (
            <div className="navbar-fila-utilidad">
              <span className="navbar-utilidad-etiqueta">
                {textos?.menuMovil?.secciones?.idioma}
              </span>
              {/* llamo a mi variable que tiene todo el sistema de idioma */}
              {selectorIdioma} 
            </div>
          )}

          {/* fila de accesibilidad en el menu movil, ubicada justo debajo de la fila de idioma */}
          {nav && (
            // contenedor horizontal que pone el texto a la izquierda y el boton circular a la derecha
            <div className="navbar-fila-utilidad">
              {/* etiqueta "Accesibilidad" / "Accessibility" obtenida desde la API */}
              <span className="navbar-utilidad-etiqueta">
                {textos?.menuMovil?.secciones?.accesibilidad}
              </span>
              {/* componente de accesibilidad que al abrirse cierra la cortina del menu movil */}
              <Accesibilidad
                textos={textos}
                idioma={idioma}
                onNavegar={onNavegar}
                onAbrir={() => setAbierto(false)}
              />
            </div>
          )}

          {/* contenedor con las utilidades: a la derecha en web y al pie del panel en movil */}
          <div className={`navbar-utilidades${usuario ? " navbar-utilidades--con-sesion" : ""}`}>
            {/* controles de accesibilidad, idioma y estado de cuenta (invitado o autenticado) */}
            {nav && (
              <>
                {/* boton circular y popover de accesibilidad para escritorio (cierra menu de cuenta si abre) */}
                <Accesibilidad
                  textos={textos}
                  idioma={idioma}
                  onNavegar={onNavegar}
                  onAbrir={() => setMenuCuentaAbierto(false)}
                />

                {/* llamo a la variable de la pildora de idioma */}
                {selectorIdioma}

                {/* mientras GET /sesion verifica la cookie no pintamos invitado para evitar parpadeo */}
                {!cargandoSesion && (
                  usuario ? (
                    <>
                    {/* CASO DONDE SI TENGA SESION INICIADA aparece ese nuevo apartado-ventana */}
                      {/* Bloque de cuenta exclusivo de escritorio: avatar verde "SQ" + desplegable de 272px */}
                      <div className="navbar-cuenta-web" ref={contenedorCuentaRef}>
                        {/* Boton circular verde lima con iniciales del usuario */}
                        <button
                          // Tipo button explicito
                          type="button"
                          // Referencia para devolver foco al cerrar con Escape
                          ref={botonCuentaRef}
                          // Estilo circular verde con texto oscuro de alto contraste
                          className="navbar-avatar-web cuerpo-p-fuerte"
                          // Etiqueta accesible "Abrir el menu de tu cuenta" desde la API
                          aria-label={nav?.usuario?.menu}
                          // Indica si el menu desplegable esta abierto
                          aria-expanded={menuCuentaAbierto}
                          // Declara que despliega un menu
                          aria-haspopup="menu"
                          // Enlaza con el id del menu desplegable
                          aria-controls="navbar-menu-cuenta"
                          // Alterna la visibilidad del desplegable
                          onClick={() => setMenuCuentaAbierto((estado) => !estado)}
                        >
                          {/* Iniciales del usuario (ej. "SQ") */}
                          {inicialesUsuario}
                        </button>

                        {/* Menu desplegable de cuenta en escritorio (272px) fiel a Figma */}
                        {menuCuentaAbierto && (
                          <div
                            // Id vinculado a aria-controls del boton avatar
                            id="navbar-menu-cuenta"
                            // Caja flotante con sombra y bordes redondeados de 16px
                            className="navbar-menu-cuenta"
                            // Rol semantico de menu
                            role="menu"
                            // Etiqueta accesible del menu
                            aria-label={nav?.usuario?.menu}
                          >
                            {/* Cabecera del desplegable: avatar "SQ" + nombre completo + correo */}
                            <div className="navbar-menu-cuenta-cabecera">
                              {/* Avatar decorativo verde con las iniciales del usuario */}
                              <span className="navbar-avatar-web navbar-avatar-web--menu cuerpo-p-fuerte" aria-hidden="true">
                                {inicialesUsuario}
                              </span>
                              {/* Columna de nombre completo y correo electronico */}
                              <div className="navbar-menu-cuenta-datos">
                                {/* Nombre completo desde GET /sesion (ej. "Sara Quintero") */}
                                <span className="navbar-menu-cuenta-nombre cuerpo-p-fuerte">
                                  {usuario.nombre}
                                </span>
                                {/* Correo desde GET /sesion (ej. "sara.quintero@correo.co") */}
                                <span className="navbar-menu-cuenta-correo detalle-nota">
                                  {usuario.correo}
                                </span>
                              </div>
                            </div>

                            {/* Linea divisoria horizontal entre datos de cuenta y boton cerrar sesion */}
                            <div className="navbar-menu-cuenta-divisor" />

                            {/* Accion Cerrar sesion con icono salir y llamada a DELETE /sesion */}
                            <button
                              // Tipo button explicito
                              type="button"
                              // Rol de opcion de menu
                              role="menuitem"
                              // Boton de ancho completo con icono y texto
                              className="navbar-menu-cuenta-salir cuerpo-p-fuerte"
                              // Bloqueado mientras se ejecuta DELETE /sesion para evitar doble envio
                              disabled={cerrandoSesion}
                              // Dispara el cierre real de sesion
                              onClick={manejarClickCerrarSesion}
                            >
                              {/* Icono vectorial de puerta saliendo */}
                              <Icono nombre="salir" className="navbar-menu-cuenta-salir-icono" />
                              {/* Texto "Cerrar sesion" / "Log out" desde la API */}
                              <span>{nav?.usuario?.cerrarSesion}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Bloque de cuenta exclusivo del pie del menu hamburguesa movil */}
                      <div className="navbar-cuenta-movil">
                        {/* Lado izquierdo: avatar circular de color del usuario + primer nombre + "Sesion iniciada" */}
                        <div className="navbar-cuenta-movil-info">
                          {/* Circulo de 44px con el color dinamico usuario.color de la API (morado para Sara) */}
                          <span
                            // Estilo circular del avatar movil
                            className={`navbar-avatar-movil cuerpo-p-fuerte${esAvatarClaro ? " navbar-avatar-movil--oscuro" : ""}`}
                            // Aplicamos el token de color devuelto por la API
                            style={{ backgroundColor: colorAvatarMovil }}
                            // Oculto a lectores de pantalla porque el nombre aparece al lado
                            aria-hidden="true"
                          >
                            {/* Iniciales del usuario (ej. "SQ") */}
                            {inicialesUsuario}
                          </span>
                          {/* Textos de la cuenta autenticada en movil */}
                          <div className="navbar-cuenta-movil-textos">
                            {/* Primer nombre del usuario (ej. "Sara") */}
                            <span className="navbar-cuenta-movil-nombre cuerpo-m-fuerte">
                              {primerNombre}
                            </span>
                            {/* Subtitulo "Sesion iniciada" desde textos.menuMovil.secciones.cuenta */}
                            <span className="navbar-cuenta-movil-estado detalle-nota">
                              {textos?.menuMovil?.secciones?.cuenta}
                            </span>
                          </div>
                        </div>

                        {/* Lado derecho: boton pildora con contorno "Cerrar sesion" */}
                        <button
                          // Tipo button explicito
                          type="button"
                          // Estilo pildora con borde fiel a la Foto 5 de Figma
                          className="navbar-cuenta-movil-salir cuerpo-p-fuerte"
                          // Deshabilitado mientras corre DELETE /sesion
                          disabled={cerrandoSesion}
                          // Dispara el cierre real de sesion
                          onClick={manejarClickCerrarSesion}
                        >
                          {/* Texto "Cerrar sesion" desde textos.menuMovil.botones.conSesion.cerrarSesion */}
                          {textos?.menuMovil?.botones?.conSesion?.cerrarSesion ?? nav?.usuario?.cerrarSesion}
                        </button>
                      </div>
                    </>
                  ) : (
                    // CASO DONDE NO TENGA SESION INICIADA
                    <>
                      {/* boton y enlace para iniciar sesion (invitado) */}
                      <a
                        className="navbar-boton-ingresar"
                        href="/ingresar"
                        onClick={(evento) => manejarNavegacion(evento, "/ingresar")}
                      >
                        {/* texto de Ingresar desde la API */}
                        {nav?.botones?.invitado?.ingresar}
                      </a>
                      
                      {/* boton para crear cuenta (invitado) */}
                      <a
                        className="navbar-boton-registro"
                        href="/crear-cuenta"
                        onClick={(evento) =>
                          manejarNavegacion(evento, "/crear-cuenta")
                        }
                      >
                        {/* texto de Crear Cuenta desde la API */}
                        {nav?.botones?.invitado?.crearCuenta}
                      </a>
                    </>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

// exportacion por defecto para ser importando y consumido en App.jsx
export default Navbar;