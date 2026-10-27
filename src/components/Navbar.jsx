import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import Icono from "./Icono.jsx";

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
}) => {
  // estado local para saber si el panel desplegable del menu movil está abierto o cerrado
  const [abierto, setAbierto] = useState(false);
  // referencia al botón hamburguesa para devolverle el foco al cerrar con Escape, que pueda recibir eventos de teclado
  const botonMenu = useRef(null);
  // acceso directo y seguro al subobjeto de navbar dentro de textos de la API
  const nav = textos?.navbar;
  // booleano para saber si el idioma activo es ingles
  const ingles = idioma === "en";

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
  }

  // texto accesible para el boton cuando el menu movil esta cerrado
  const abrir =
    textos?.menuMovil?.abrir ?? (ingles ? "Open menu" : "Abrir menú");

  // texto accesible para el boton cuando el menu movil esta abierto
  const cerrar =
    textos?.menuMovil?.cerrar ?? (ingles ? "Close menu" : "Cerrar menú");

  // guardo en enlaces un arreglo de objetos con los 2 enlaces disponibles
  const enlaces = [
    {
      clave:"inicio", //identificador unico del enlace
      ruta:"/",
      //la etiqueta es lo que verá el usuario, primero intento sacarlo de la API, si no responde tomo Home si está en ingles, e Inicio si está en español
      etiqueta: nav?.enlaces?.inicio ?? (ingles? "Home" : "Inicio"),
    },
    {
      clave: "catalogo", //clave para el segundo enlace
      ruta: "/catalogo",
      etiqueta: nav?.enlaces?.catalogo ?? (ingles? "Catalog" : "Catálogo"), //Catalog si está en ingles, Catálogo si está en español
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

  // componente reutilizable para la pildora de idioma
  const selectorIdioma = (
    // contenedor con rol de grupo para lectores de pantalla
    <div className="navbar-idioma-segmentado" role="group" aria-label={nav?.aria?.idioma ?? (ingles ? "Change language" : "Cambiar idioma")}>
      
      {/* boton para activar el idioma a español */}
      <button 
        type="button" 
        className={`navbar-idioma-pildora ${idioma === "es" ? "is-activo" : ""}`}
        onClick={() => cambiarIdioma("es")}
        aria-pressed={idioma === "es"}
      >
        {/* texto "ES" obtenido de la API */}
        {textos?.idioma?.codigos?.es ?? "ES"}
      </button>
      
      {/* boton para activa el idioma ingles */}
      <button 
        type="button" 
        className={`navbar-idioma-pildora ${idioma === "en" ? "is-activo" : ""}`}
        onClick={() => cambiarIdioma("en")}
        aria-pressed={idioma === "en"}
      >
        {/* texto "EN" obtenido de la API */}
        {textos?.idioma?.codigos?.en ?? "EN"}
      </button>
    </div>
  );

  return (
    <header className="navbar">
      {/* contenedor centralizado con ancho maximo y etiqueta accesible de navegacion */}
      <nav
        className="contenedor navbar-interior"
        aria-label={nav?.aria?.navegacion ?? "Navegación principal"}
      >
        {/* Logo con icono de ondas de Sintonía que a la vez es un enlace interactivo que redirige al inicio */}
        <a
          href="/"
          className="navbar-marca"
          aria-label={nav?.logo?.aria ?? (ingles ? "Sintonía, go to home" : "Sintonía, ir al inicio")}
          onClick={(evento) => manejarNavegacion(evento, "/")}
        >
          <Icono nombre="logo" />
          <span className="titular-h3 navbar-marca-texto">
            {nav?.logo?.texto?.toLowerCase() ?? "sintonía"}
          </span>
        </a>

        {/* zona de botones interactivos visibles en moviles*/}
        <div className="navbar-movil-acciones">
          {/* enlace rapido a ingresar en movil, solo se muestra si el panel está cerrado */}
          {nav && !abierto && (
            <a
              href="/ingresar"
              className="navbar-movil-enlace-ingresar"
              onClick={(evento) => manejarNavegacion(evento, "/ingresar")}
            >
              {nav?.botones?.invitado?.ingresar ?? (ingles ? "Log in" : "Ingresar")}
            </a>
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
          {/* aunque no tiene mucho sentido porque esos mensajes se cargan de la API, y la API todavia no está cargada, por ende llama siempre al respaldo */}
          {cargando && (
            <p className="navbar-estado" role="status">
              {textos?.estados?.cargando?.titulo ?? (ingles ? "Loading..." : "Cargando...")}
            </p>
          )}

          {/* mensaje de error si falló la conexion con la API */}
          {error && (
            <div className="navbar-estado" role="alert">
              <p>
                {textos?.estados?.error?.titulo ?? (ingles ? "Navigation could not be loaded" : "No pudimos cargar el menú.")}
              </p>

              {/* boton para reintentar la solicitud de texto a la API */}
              <button type="button" onClick={recargar}>
                {textos?.general?.acciones?.reintentar ?? (ingles ? "Try again" : "Reintentar")}
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
                    {/* texto visible del enlace unicamente llamado de la API */}
                    {enlace.etiqueta}
                  </a>
                </li>  
              ))}
            </ul>
          )}

          {/* selector de idioma en movil, lo pongo luego de la lista de enlaces porque va hasta el final de ello*/}
          { nav && (
            <div className="navbar-fila-utilidad">
              <span className="navbar-utilidad-etiqueta">
                {textos?.menuMovil?.secciones?.idioma ?? (ingles? "Language" : "Idioma")}
              </span>
              {/* llamo a mi variable que tiene todo el sistema de idioma */}
              {selectorIdioma} 
            </div>
          )}

          {/* contenedor con las utilidades, en este caso botones a la derecha del navbar en web, y al final del panel en movil */}
          <div className="navbar-utilidades">

            
            {/* botones de autenticacion para usuarios invitados */}
            {nav && (
              <>
                {/* llamo a la variable de la pildora de idioma */}
                {selectorIdioma}

                {/* boton y enlace para iniciar sesion */}
                <a
                  className="navbar-boton-ingresar"
                  href="/ingresar"
                  onClick={(evento) => manejarNavegacion(evento, "/ingresar")}
                >
                  {/* texto de Ingresar desde la API */}
                  {nav?.botones?.invitado?.ingresar ?? (ingles ? "Log in" : "Ingresar")}
                </a>
                
                {/* boton para crear cuenta */}
                <a
                  className="navbar-boton-registro"
                  href="/crear-cuenta"
                  onClick={(evento) =>
                    manejarNavegacion(evento, "/crear-cuenta")
                  }
                >
                  {/* texto de Crear Cuenta desde la API */}
                  {nav?.botones?.invitado?.crearCuenta ?? (ingles ? "Sign up" : "Crear cuenta")}
                </a>
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