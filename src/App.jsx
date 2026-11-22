import { useTextos } from "./hooks/useTextos.js";
import { useInicio } from "./hooks/useInicio.js";

import "./App.css";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer.jsx";
import InicioPublico from "./components/InicioPublico.jsx";
import BannerCookies from "./components/BannerCookies.jsx";
import CatalogoMusical from "./components/CatalogoMusical.jsx";
import DetalleAlbum from "./components/DetalleAlbum.jsx";
import NoEncontrado from "./components/NoEncontrado.jsx";

// Extrae la vista principal (primer segmento) y el ID dinamico (segundo segmento, ej. /albumes/alb_luz-de-paramo)
function leerRutaActual() {
  const segmentos = window.location.pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);

  return {
    vista: segmentos[0] || "inicio",
    parametroId: segmentos[1] ? decodeURIComponent(segmentos[1]) : null,
  };
}

// Lee el valor de una cookie por su nombre
function leerCookieApp(nombre) {
  const coincidencia = document.cookie.match(
    new RegExp("(^|;\\s*)" + nombre + "=([^;]*)")
  );
  return coincidencia ? decodeURIComponent(coincidencia[2]) : null;
}

// Determina el idioma inicial desde la cookie solo si hubo consentimiento previo
function obtenerIdiomaInicial() {
  const consentimiento = leerCookieApp("consentimiento");
  if (consentimiento === "aceptado") {
    const guardado = leerCookieApp("idioma");
    if (guardado === "es" || guardado === "en") return guardado;
  }
  return "es";
}

// Actualiza o crea la meta descripcion del documento para las vistas principales
function actualizarDescripcionDocumento(descripcion) {
  if (!descripcion) return;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", descripcion);
}

function App() {
  const [idioma, setIdioma] = useState(obtenerIdiomaInicial);
  const [rutaActual, setRutaActual] = useState(leerRutaActual);

  const activo = rutaActual.vista;
  const parametroId = rutaActual.parametroId;

  const datos = useTextos(idioma);
  const { generos, albumes, cargando, error, recargar } = useInicio();

  // Cambia el idioma en estado y lo persiste en cookie unicamente si el usuario acepto cookies
  function cambiarIdiomaSeguro(nuevoIdioma) {
    setIdioma(nuevoIdioma);
    const consentimiento = leerCookieApp("consentimiento");
    if (consentimiento === "aceptado") {
      const expira = new Date(Date.now() + 365 * 864e5).toUTCString();
      document.cookie = `idioma=${nuevoIdioma}; expires=${expira}; path=/; SameSite=Lax`;
    } else {
      document.cookie =
        "idioma=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
    }
  }

  // Navegacion SPA sin recargar pagina: marca estado interno para que el boton volver funcione sin sacar al usuario del sitio
  function navegar(destino, evento) {
    if (evento) evento.preventDefault();
    window.history.pushState({ interno: true }, "", destino);
    setRutaActual(leerRutaActual());
    window.scrollTo({ top: 0, behavior: "instant" });
    // Notifica a hooks como useCatalogo para sincronizar query params (?genero=...)
    window.dispatchEvent(new CustomEvent("sintonia-navegacion"));
  }

  // Sincroniza la vista cuando el usuario usa los botones Atras / Adelante del navegador
  useEffect(() => {
    function actualizar() {
      setRutaActual(leerRutaActual());
    }
    window.addEventListener("popstate", actualizar);
    return () => window.removeEventListener("popstate", actualizar);
  }, []);

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  const esInicio = activo === "inicio" || activo === "descubrir" || activo === "";
  const esDetalleAlbum = (activo === "albumes" || activo === "album") && Boolean(parametroId);
  const esCrearCuenta = activo === "crear-cuenta" || activo === "crearCuenta";
  const esRutaConocida =
    esInicio ||
    activo === "catalogo" ||
    esDetalleAlbum ||
    activo === "artista" ||
    activo === "ingresar" ||
    esCrearCuenta ||
    activo === "terminos" ||
    activo === "accesibilidad";

  // Mantiene titulo y meta description sincronizados en vistas principales y 404 (DetalleAlbum maneja los suyos)
  useEffect(() => {
    const textos = datos.textos;
    if (!textos) return;

    const separador = textos.general?.formatos?.separador ?? " · ";
    const nombreSitio = textos.sitio?.nombre;

    if (esInicio) {
      if (textos.paginas?.inicioPublico?.seo?.titulo) {
        document.title = textos.paginas.inicioPublico.seo.titulo;
      }
      actualizarDescripcionDocumento(textos.paginas?.inicioPublico?.seo?.descripcion);
    } else if (activo === "catalogo") {
      if (textos.paginas?.catalogo?.seo?.titulo) {
        document.title = textos.paginas.catalogo.seo.titulo;
      }
      actualizarDescripcionDocumento(textos.paginas?.catalogo?.seo?.descripcion);
    } else if (activo === "ingresar") {
      if (textos.paginas?.ingresar?.seo?.titulo) {
        document.title = textos.paginas.ingresar.seo.titulo;
      }
      actualizarDescripcionDocumento(textos.paginas?.ingresar?.seo?.descripcion);
    } else if (!esRutaConocida && textos.estados?.noEncontrado?.titulo) {
      document.title = [textos.estados.noEncontrado.titulo, nombreSitio]
        .filter(Boolean)
        .join(separador);
      actualizarDescripcionDocumento(textos.estados?.noEncontrado?.descripcion);
    }
  }, [activo, esInicio, esRutaConocida, datos.textos]);

  return (
    <div className="sitio">
      <Navbar
        {...datos}
        idioma={idioma}
        cambiarIdioma={cambiarIdiomaSeguro}
        activo={activo}
        onNavegar={navegar}
      />
      <main className="contenido contenedor">
        {/* Vista 1 · Inicio publico */}
        {esInicio && (
          <InicioPublico
            textosInicio={datos.textos?.paginas?.inicioPublico}
            textosEstados={datos.textos?.estados}
            albumes={albumes}
            generos={generos}
            cargando={cargando}
            error={error}
            onRecargar={recargar}
            onNavegar={navegar}
          />
        )}

        {/* Vista 2 · Catalogo musical */}
        {activo === "catalogo" && (
          <CatalogoMusical
            textosCatalogo={datos.textos?.paginas?.catalogo}
            textosEstados={datos.textos?.estados}
            idioma={idioma}
            onNavegar={navegar}
          />
        )}

        {/* Vista 3 · Detalle de un album (/albumes/:id) */}
        {esDetalleAlbum && (
          <DetalleAlbum
            albumId={parametroId}
            textos={datos.textos}
            idioma={idioma}
            onNavegar={navegar}
          />
        )}

        {/* Vista de detalle de artista */}
        {activo === "artista" && (
          <section id="artista" className="seccion">
            <h1 className="titular-h1">{datos.textos?.general?.tipos?.artista}</h1>
          </section>
        )}

        {/* Vista 4 · Iniciar sesion */}
        {activo === "ingresar" && (
          <section id="ingresar" className="seccion">
            <h1 className="titular-h1">
              {datos.textos?.navbar?.botones?.invitado?.ingresar}
            </h1>
          </section>
        )}

        {/* Vista 5 · Crear cuenta */}
        {esCrearCuenta && (
          <section id="crear-cuenta" className="seccion">
            <h1 className="titular-h1">
              {datos.textos?.navbar?.botones?.invitado?.crearCuenta}
            </h1>
          </section>
        )}

        {/* Vista de terminos legales del footer */}
        {activo === "terminos" && (
          <section id="terminos" className="seccion">
            <h1 className="titular-h1">
              {datos.textos?.footer?.columnas?.legal?.enlaces?.terminos}
            </h1>
          </section>
        )}

        {/* Vista de declaracion de accesibilidad */}
        {activo === "accesibilidad" && (
          <section id="accesibilidad" className="seccion">
            <h1 className="titular-h1">
              {datos.textos?.accesibilidad?.enlaces?.declaracion}
            </h1>
          </section>
        )}

        {/* Estado 404 para rutas inexistentes o /albumes sin identificador */}
        {!esRutaConocida && (
          <NoEncontrado
            titulo={datos.textos?.estados?.noEncontrado?.titulo}
            descripcion={datos.textos?.estados?.noEncontrado?.descripcion}
            textoBoton={datos.textos?.estados?.noEncontrado?.botones?.irAlInicio}
            destinoBoton="/"
            onNavegar={navegar}
          />
        )}
      </main>
      <BannerCookies
        textos={datos.textos?.cookies?.banner}
        onConsentimiento={(decision) => {
          if (decision === "aceptado") {
            const expira = new Date(Date.now() + 365 * 864e5).toUTCString();
            document.cookie = `idioma=${idioma}; expires=${expira}; path=/; SameSite=Lax`;
          }
        }}
      />
      <Footer textos={datos.textos} idioma={idioma} onNavegar={navegar} />
    </div>
  );
}

export default App;
