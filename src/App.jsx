import { useTextos } from "./hooks/useTextos.js";
import { useInicio } from "./hooks/useInicio.js";
// Importamos el hook global de sesion persistente (GET /sesion y DELETE /sesion con cookie httpOnly)
import { useSesion } from "./hooks/useSesion.js";

import "./App.css";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer.jsx";
import InicioPublico from "./components/InicioPublico.jsx";
import BannerCookies from "./components/BannerCookies.jsx";
import CatalogoMusical from "./components/CatalogoMusical.jsx";
import DetalleAlbum from "./components/DetalleAlbum.jsx";
import IniciarSesion from "./components/IniciarSesion.jsx";
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

  // Consultamos y gestionamos la sesion global desde la cookie httpOnly "sesion" (sin usar localStorage)
  const {
    usuario,
    cargandoSesion,
    cerrandoSesion,
    iniciarSesionLocal,
    cerrarSesion,
  } = useSesion({
    // Si una peticion autenticada recibe 401 no_autenticado, redirigimos a /ingresar
    onNoAutenticado: () => navegar("/ingresar"),
  });

  // Cierra la sesion en el servidor (DELETE /sesion) y lleva al usuario de vuelta al inicio
  async function manejarCerrarSesion() {
    // Esperamos a que el servidor borre la cookie httpOnly "sesion"
    const cerro = await cerrarSesion();
    // Si la sesion quedo cerrada limpiamente, regresamos a la portada principal
    if (cerro) {
      // Navegacion SPA hacia el inicio
      navegar("/");
    }
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
  const esIngresar = activo === "ingresar";
  const esCrearCuenta = activo === "crear-cuenta" || activo === "crearCuenta";
  const esRutaConocida =
    esInicio ||
    activo === "catalogo" ||
    esDetalleAlbum ||
    activo === "artista" ||
    esIngresar ||
    esCrearCuenta ||
    activo === "terminos" ||
    activo === "accesibilidad";

  // Si el usuario ya tiene sesion iniciada y entra a /ingresar, lo redirigimos al inicio
  useEffect(() => {
    // Esperamos a que termine GET /sesion para no redirigir por error durante la verificacion inicial
    if (!cargandoSesion && usuario && esIngresar) {
      // Reemplazamos la entrada de /ingresar en el historial por "/" para que el boton Atras no vuelva al login
      window.history.replaceState({ interno: true }, "", "/");
      // Actualizamos el estado de ruta de React hacia la vista de inicio
      setRutaActual(leerRutaActual());
      // Notificamos el cambio de ruta a otros hooks suscritos
      window.dispatchEvent(new CustomEvent("sintonia-navegacion"));
    }
  }, [cargandoSesion, usuario, esIngresar]);

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
      {/* En la vista dividida de inicio de sesion no se muestra el navbar global segun Figma */}
      {!esIngresar && (
        <Navbar
          {...datos}
          idioma={idioma}
          cambiarIdioma={cambiarIdiomaSeguro}
          activo={activo}
          onNavegar={navegar}
          usuario={usuario}
          cargandoSesion={cargandoSesion}
          cerrandoSesion={cerrandoSesion}
          onCerrarSesion={manejarCerrarSesion}
        />
      )}
      {/* En /ingresar el main ocupa el 100% sin margenes de .contenedor para llegar de borde a borde */}
      <main className={esIngresar ? "contenido" : "contenido contenedor"}>
        {/* Vista 1 · Inicio publico */}
        {esInicio && (
          <InicioPublico
            textosInicio={datos.textos?.paginas?.inicioPublico}
            textosEstados={datos.textos?.estados}
            textosErrores={datos.textos?.errores}
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
            textosErrores={datos.textos?.errores}
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
        {esIngresar && (
          <IniciarSesion
            textos={datos.textos}
            onNavegar={navegar}
            onIngresoExitoso={iniciarSesionLocal}
          />
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
      {/* En la vista de inicio de sesion el pie legal vive dentro de su propia columna izquierda */}
      {!esIngresar && (
        <Footer textos={datos.textos} idioma={idioma} onNavegar={navegar} />
      )}
    </div>
  );
}

export default App;
