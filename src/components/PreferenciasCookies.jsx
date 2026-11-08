import { useId, useRef, useState, useEffect } from "react";
import Icono from "./Icono.jsx";
import "./PreferenciasCookies.css";

// clave unica para guardar el detalle de las categorias en localStorage
const CLAVE_STORAGE_COOKIES = "sintonia-consentimiento-categorias";
const NOMBRE_COOKIE_CONSENTIMIENTO = "consentimiento";

// funcion auxiliar para guardar una cookie en el navegador por 1 año
function guardarCookieNavegador(nombre, valor) {
  // calculamos la fecha de expiracion a 365 dias
  const expira = new Date(Date.now() + 365 * 864e5).toUTCString();
  // escribimos la cookie con ruta global y politica SameSite
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${expira}; path=/; SameSite=Lax`;
}

// funcion que construye el objeto de estado para las 4 categorias de cookies
function crearSeleccion(activarOpcionales = false) {
  // necesarias siempre va en true; las otras 3 dependen del parametro recibido
  return {
    necesarias: true,
    preferencias: activarOpcionales,
    analiticas: activarOpcionales,
    marketing: activarOpcionales,
  };
}

// funcion para leer la seleccion guardada previamente en el navegador
function leerSeleccionGuardada(idsCategorias) {
  // intentamos recuperar y parsear el JSON desde localStorage
  try {
    // leemos la cadena guardada en localStorage
    const guardada = JSON.parse(localStorage.getItem(CLAVE_STORAGE_COOKIES));
    // si no existe un objeto guardado previo, verificamos si ya habia aceptado en el banner general
    if (!guardada) {
      // buscamos la cookie general de consentimiento
      const coincidencia = document.cookie.match(new RegExp("(^|;\\s*)" + NOMBRE_COOKIE_CONSENTIMIENTO + "=([^;]*)"));
      // decodificamos el valor de la cookie si existe
      const decisionCookie = coincidencia ? decodeURIComponent(coincidencia[2]) : null;
      // si habia aceptado todo en el banner, marcamos todas como activas
      return crearSeleccion(decisionCookie === "aceptado");
    }
    // reconstruimos el objeto asegurando que necesarias siempre sea true
    return Object.fromEntries(
      idsCategorias.map((idCat) => [idCat, idCat === "necesarias" || guardada?.[idCat] === true])
    );
  } catch {
    // si ocurre algun fallo al leer, retornamos la seleccion por defecto (solo necesarias)
    return crearSeleccion(false);
  }
}

// exportamos el componente PreferenciasCookies
export default function PreferenciasCookies({
  textos,
  textoGuardado = "", // mensaje de confirmacion desde la API
  textoError = "", // mensaje de error general desde la API
  onGuardar, // callback opcional para notificar a App.jsx cuando se guardan cambios
}) {
  // identificador unico accesible para vincular aria-labelledby y aria-describedby
  const id = useId();
  const dialogo = useRef(null);
  // referencia al boton que abre el modal para devolverle el foco al cerrar
  const disparador = useRef(null);
  // estado con los interruptores de las 4 categorias
  const [seleccion, setSeleccion] = useState(() => crearSeleccion(false));
  // estado para anunciar el mensaje de confirmacion a lectores de pantalla
  const [mensaje, setMensaje] = useState("");
  // estado para mostrar mensaje de error si falla el guardado en el navegador
  const [error, setError] = useState("");

  // construimos el listado de las 4 categorias tomando los textos de la API
  const categorias = [
    {
      id: "necesarias",
      titulo: textos?.categorias?.necesarias?.nombre,
      descripcion:
        textos?.categorias?.necesarias?.descripcion,
      cookies:
        textos?.categorias?.necesarias?.cookies,
    },
    {
      id: "preferencias",
      titulo: textos?.categorias?.preferencias?.nombre,
      descripcion:
        textos?.categorias?.preferencias?.descripcion,
      cookies:
        textos?.categorias?.preferencias?.cookies,
    },
    {
      id: "analiticas",
      titulo: textos?.categorias?.analiticas?.nombre,
      descripcion:
        textos?.categorias?.analiticas?.descripcion,
      cookies:
        textos?.categorias?.analiticas?.cookies,
    },
    {
      id: "marketing",
      titulo: textos?.categorias?.marketing?.nombre,
      descripcion:
        textos?.categorias?.marketing?.descripcion,
      cookies:
        textos?.categorias?.marketing?.cookies,
    },
  ];

  // funcion que carga los valores actuales y abre el modal nativo <dialog>
  function abrir() {
    // obtenemos los ids de las 4 categorias
    const ids = categorias.map((cat) => cat.id);
    // actualizamos el estado con la seleccion guardada actualmente
    setSeleccion(leerSeleccionGuardada(ids));
    //limpiamos mensajes de error
    setError("");
    setMensaje("");
    // abrimos el dialogo modal nativo
    dialogo.current?.showModal();
  }

  // efecto para permitir abrir este modal desde otros componentes (como el BannerCookies) mediante un evento global
  useEffect(() => {
    // manejador que invoca la funcion abrir
    function escucharAperturaExterna() {
      abrir();
    }
    // registramos el evento personalizado en window
    window.addEventListener("sintonia-abrir-preferencias-cookies", escucharAperturaExterna);
    // limpiamos el evento al desmontar
    return () => window.removeEventListener("sintonia-abrir-preferencias-cookies", escucharAperturaExterna);
  });

  // funcion que guarda la configuracion elegida por el usuario y cierra el modal
  function guardar(valores) {
    // intentamos guardar en localStorage y en la cookie de consentimiento
    try {
      // guardamos el objeto detallado de categorias en localStorage
      localStorage.setItem(CLAVE_STORAGE_COOKIES, JSON.stringify(valores));
      // determinamos si el usuario permitio las cookies de preferencias
      const decisionGeneral = valores.preferencias ? "aceptado" : "rechazado";
      // actualizamos la cookie oficial de consentimiento para sincronizar con App.jsx y BannerCookies
      guardarCookieNavegador(NOMBRE_COOKIE_CONSENTIMIENTO, decisionGeneral);
      // si el usuario desactivo las cookies de preferencias, borramos los datos guardados de accesibilidad e idioma
      if (!valores.preferencias) {
        // eliminamos las preferencias de accesibilidad almacenadas en localStorage
        localStorage.removeItem("sintonia_accesibilidad");
        // expiramos la cookie de accesibilidad
        document.cookie = "accesibilidad=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
        // expiramos la cookie de idioma
        document.cookie = "idioma=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
      }
      // emitimos un evento global para que BannerCookies y Accesibilidad sincronicen su estado inmediatamente
      window.dispatchEvent(new CustomEvent("sintonia-consentimiento-actualizado", { detail: decisionGeneral }));
    } catch {
      // mostramos mensaje de error desde la API si el navegador bloqueo el almacenamiento
      setError(textoError);
      return;
    }
    // actualizamos el estado local con los valores guardados
    setSeleccion(valores);
    // notificamos al componente padre si paso el callback onGuardar
    onGuardar?.(valores);
    // establecemos el mensaje accesible de confirmacion desde la API
    setMensaje(textoGuardado);
    // cerramos el modal nativo <dialog>
    dialogo.current?.close();
  }

  // titulo general del modal y del boton disparador desde la API
  const tituloModal = textos?.titulo;
  // descripcion explicativa debajo del titulo desde la API
  const descripcionModal =
    textos?.descripcion;

  // retornamos el enlace disparador y el dialogo modal
  return (
    // contenedor principal del componente de preferencias de cookies
    <div className="cookies">
      {/* boton con aspecto de enlace del footer para abrir el modal de preferencias */}
      <button
        ref={disparador}
        className="cookies-enlace-pie cuerpo-p"
        type="button"
        onClick={abrir}
      >
        {tituloModal}
      </button>

      {/* region viva oculta visualmente para anunciar confirmacion a lectores de pantalla */}
      <span className="cookies-confirmacion" role="status" aria-live="polite">
        {mensaje}
      </span>

      {/* elemento modal nativo <dialog> */}
      <dialog
        ref={dialogo}
        className="cookies-dialogo"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-descripcion`}
        onClose={() => disparador.current?.focus()}
        onClick={(evento) => {
          // si el usuario hace clic directamente sobre el fondo oscuro (backdrop) fuera de la caja, cerramos el modal
          if (evento.target === dialogo.current) {
            dialogo.current.close();
          }
        }}
      >
        {/* contenedor interior con todos los elementos del modal */}
        <div className="cookies-contenido">
          {/* cabecera con el titulo a la izquierda y el boton cerrar X a la derecha */}
          <header className="cookies-encabezado">
            {/* titulo h2 del modal */}
            <h2 id={`${id}-titulo`} className="titular-h3">
              {tituloModal}
            </h2>

            {/* boton circular para cerrar el dialogo */}
            <button
              className="cookies-cerrar"
              type="button"
              aria-label={
                textos?.aria?.cerrar
              }
              onClick={() => dialogo.current?.close()}
            >
              {/* icono de equis */}
              <Icono nombre="cerrar" />
            </button>
          </header>

          {/* parrafo descriptivo de instrucciones */}
          <p id={`${id}-descripcion`} className="cookies-descripcion">
            {descripcionModal}
          </p>

          {/* mapeo de las 4 tarjetas de categorias de cookies */}
          {categorias.map(({ id: categoria, titulo, descripcion, cookies }) => (
            // seccion individual para cada categoria con su switch
            <section
              className="cookies-categoria"
              key={categoria}
              aria-labelledby={`${id}-${categoria}`}
            >
              {/* columna izquierda con nombre, descripcion y lista de cookies */}
              <div className="cookies-detalle">
                {/* nombre de la categoria */}
                <h3 id={`${id}-${categoria}`}>{titulo}</h3>
                {/* explicacion de uso de la categoria */}
                <p id={`${id}-${categoria}-descripcion`}>{descripcion}</p>
                {/* etiqueta pequeña con los nombres tecnicos de las cookies */}
                <small>{cookies}</small>
              </div>

              {/* columna derecha con el interruptor switch y la nota "Siempre activas" */}
              <div className="cookies-control">
                {/* boton interruptor con rol switch accesible */}
                <button
                  className="cookies-interruptor"
                  type="button"
                  role="switch"
                  aria-checked={Boolean(seleccion[categoria])}
                  aria-labelledby={`${id}-${categoria}`}
                  aria-describedby={`${id}-${categoria}-descripcion`}
                  disabled={categoria === "necesarias"}
                  onClick={() =>
                    setSeleccion((actual) => ({
                      ...actual,
                      [categoria]: !actual[categoria],
                    }))
                  }
                >
                  {/* circulo deslizante del interruptor */}
                  <span />
                </button>

                {/* si es la categoria de necesarias, mostramos el texto "Siempre activas" */}
                {categoria === "necesarias" && (
                  <small className="cookies-siempre-activas">
                    {textos?.etiquetas?.siempreActivas}
                  </small>
                )}
              </div>
            </section>
          ))}

          {/* mensaje de alerta en caso de error al guardar */}
          {error && (
            <p className="cookies-error" role="alert">
              {error}
            </p>
          )}

          {/* pie del modal con los 3 botones de accion */}
          <footer className="cookies-acciones">
            {/* boton principal para guardar la seleccion personalizada */}
            <button
              className="cookies-boton cookies-boton-primario"
              type="button"
              onClick={() => guardar(seleccion)}
            >
              {textos?.botones?.guardar}
            </button>

            {/* boton para rechazar todas las opcionales y dejar solo las necesarias */}
            <button
              className="cookies-boton"
              type="button"
              onClick={() => guardar(crearSeleccion(false))}
            >
              {textos?.botones?.rechazar}
            </button>

            {/* boton para aceptar todas las categorias */}
            <button
              className="cookies-boton"
              type="button"
              onClick={() => guardar(crearSeleccion(true))}
            >
              {textos?.botones?.aceptar}
            </button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}

