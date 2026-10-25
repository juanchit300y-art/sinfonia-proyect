import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import Icono from "./Icono.jsx";

const DESTINOS = {
  descubrir: "/descubrir",
  planes: "/planes",
  paraArtistas: "/para-artistas",
  ayuda: "/ayuda",
};

const Navbar = ({
  textos,
  cargando,
  error,
  recargar,
  idioma,
  activo,
  textoGrande,
  alternarTexto,
  cambiarIdioma,
  onNavegar,
}) => {
  const [abierto, setAbierto] = useState(false);
  const botonMenu = useRef(null);
  const nav = textos?.navbar;

  function manejarNavegacion(evento, ruta) {
    if (onNavegar) {
      evento.preventDefault();
      onNavegar(ruta);
    }
    setAbierto(false);
  }
  const ingles = idioma === "en";

  const abrir =
    textos?.menuMovil?.abrir ?? (ingles ? "Open menu" : "Abrir menú");
  const cerrar =
    textos?.menuMovil?.cerrar ?? (ingles ? "Close menu" : "Cerrar menú");

  // guardo en enlaces un arreglo de objetos con los 2 enlaces disponibles
  const enlaces = [
    {
      clave:"inicio", //identificador unico del enlace
      ruta:"/",
      //la etiqueta es lo que verá el usuario, primero intento sacarlo de la API, si no responde tomo Home si está en ingles, e Inicio si está en español
      etiqueta: nav?.enlaces?.conSesion?.inicio ?? (ingles? "Home" : "Inicio"),
    },
    {
      clave: "catalogo", //clave para el segundo enlace
      ruta: "/catalogo",
      etiqueta: ingles? "Catalog" : "Catálogo", //Catalog si está en ingles, Catálogo si está en español
    },
  ];

  // Cerrar menú con la tecla Escape
  useEffect(() => {
    function cerrarConEscape(evento) {
      if (!abierto) return;
      if (evento.key === "Escape") {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    }
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [abierto]);

  const selectorIdioma = (
    <div className="navbar-idioma-segmentado" role="group" aria-label="Seleccionar idioma">
      <button 
        type="button" 
        className={`navbar-idioma-pildora ${idioma === "es" ? "is-activo" : ""}`}
        onClick={() => cambiarIdioma("es")}
        aria-pressed={idioma === "es"}
      >
        ES
      </button>
      <button 
        type="button" 
        className={`navbar-idioma-pildora ${idioma === "en" ? "is-activo" : ""}`}
        onClick={() => cambiarIdioma("en")}
        aria-pressed={idioma === "en"}
      >
        EN
      </button>
    </div>
  );

  return (
    <header className="navbar">
      <nav
        className="contenedor navbar-interior"
        aria-label={nav?.aria?.navegacion ?? "Navegación principal"}
      >
        {/* Logo con icono de ondas de Sintonía */}
        <a
          href="/descubrir"
          className="navbar-marca"
          aria-label={nav?.logo?.aria ?? "Sintonía, ir al inicio"}
          onClick={(evento) => manejarNavegacion(evento, "/descubrir")}
        >
          <Icono nombre="logo" />
          <span className="navbar-marca-texto">
            {nav?.logo?.texto?.toLowerCase() ?? "sintonía"}
          </span>
        </a>

        {/* Acciones en móvil */}
        {/* boton para registrarme*/}
        <div className="navbar-movil-acciones">
          {!abierto && (
            <a
              href="/ingresar"
              className="navbar-movil-enlace-ingresar"
              onClick={(e) => manejarNavegacion(e, "/ingresar")}
            >
              {nav?.botones?.invitado?.ingresar ?? "Ingresar"}
            </a>
          )}
          <button
            type="button"
            ref={botonMenu}
            className={`navbar-icono ${abierto ? "navbar-boton-cerrar": ""}`}
            aria-label={abierto ? cerrar : abrir}
            aria-expanded={abierto}
            aria-controls="navbar-panel"
            onClick={() => setAbierto((valor) => !valor)}
          >
            <Icono nombre={abierto ? "cerrar" : "menu"} />
          </button>
        </div>

        {/* Panel de navegación (responsive) */}
        <div
          id="navbar-panel"
          className={`navbar-panel${abierto ? " is-abierto" : ""}`}
          aria-busy={cargando}
        >
          {cargando && (
            <p className="navbar-estado" role="status">
              {ingles ? "Loading navigation…" : "Cargando navegación…"}
            </p>
          )}

          {error && (
            <div className="navbar-estado" role="alert">
              <p>
                {ingles
                  ? "Navigation could not be loaded."
                  : "No pudimos cargar el menú."}
              </p>
              <button type="button" onClick={recargar}>
                {ingles ? "Try again" : "Reintentar"}
              </button>
            </div>
          )}
          
          {/* solo dibuja el menu si nav ya cargó de la API para evitar errores */}
          {nav && (
            <ul className="navbar-enlaces">
              {/* recorre el arreglo de 2 enlaces y ejecuta esta funcion por cada uno */}
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
                    {enlace.etiqueta}
                  </a>
                </li>  
              ))}
            </ul>
          )}

          {/* selector de idioma en movil, lo pongo luego de la lista de enlaces porque va hasta el final de ello*/}
          <div className="navbar-fila-utilidad">
            <span className="navbar-utilidad-etiqueta">
              {ingles? "Lenguage" : "Idioma"}
            </span>
            {/* llamo a mi variable que tiene todo el sistema de idioma */}
            {selectorIdioma} 
          </div>

          {/* Utilidades y botones a la derecha */}
          <div className="navbar-utilidades">
            {/* llamo a la variable de la pildora de idioma */}
            {selectorIdioma}

            {nav && (
              <>
                <a
                  className="navbar-boton-ingresar"
                  href="/ingresar"
                  onClick={(evento) => manejarNavegacion(evento, "/ingresar")}
                >
                  {nav?.botones?.invitado?.ingresar ?? "Ingresar"}
                </a>

                <a
                  className="navbar-boton-registro"
                  href="/crear-cuenta"
                  onClick={(evento) =>
                    manejarNavegacion(evento, "/crear-cuenta")
                  }
                >
                  {nav?.botones?.invitado?.crearCuenta ?? "Crear cuenta"}
                </a>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;