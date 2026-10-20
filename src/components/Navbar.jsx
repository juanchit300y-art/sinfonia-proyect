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

  // Enlaces de la vista pública / invitado
  const enlaces = Object.entries(nav?.enlaces?.invitado ?? {});

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

          {nav && (
            <ul className="navbar-enlaces">
              {enlaces.map(([clave, etiqueta]) => (
                <li key={clave}>
                  <a
                    href={DESTINOS[clave] ?? `/${clave}`}
                    aria-current={
                      activo === clave ||
                      `/${activo}` === (DESTINOS[clave] ?? `/${clave}`)
                        ? "page"
                        : undefined
                    }
                    onClick={(evento) =>
                      manejarNavegacion(
                        evento,
                        DESTINOS[clave] ?? `/${clave}`
                      )
                    }
                  >
                    {etiqueta}
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
          </div>

          {/* fila de accesibilidad en movil */}
          <button 
            type="button"
            className="navbar-fila-accesibilidad"
            onClick={alternarTexto}
            aria-pressed={textoGrande}
            aria-label={nav?.aria?.accesibilidad ?? (ingles ? "Enlarge text" : "Aumentar texto")}
          >
            <Icono nombre="accesibilidad" />
            <span>{ingles ? "Accessibility" : "Accesibilidad"}</span>
          </button>

          {/* Utilidades y botones a la derecha */}
          <div className="navbar-utilidades">
            <label className="navbar-idioma">
              <Icono nombre="idioma" />
              <select
                value={idioma}
                onChange={(evento) => cambiarIdioma(evento.target.value)}
                aria-label={nav?.aria?.idioma ?? "Cambiar idioma"}
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
              <Icono nombre="chevronAbajo" className="navbar-chevron" />
            </label>

            <button
              className="navbar-icono navbar-accesibilidad"
              type="button"
              aria-label={
                nav?.aria?.accesibilidad ??
                (ingles ? "Enlarge text" : "Aumentar texto")
              }
              aria-pressed={textoGrande}
              onClick={alternarTexto}
            >
              <Icono nombre="accesibilidad" />
            </button>

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