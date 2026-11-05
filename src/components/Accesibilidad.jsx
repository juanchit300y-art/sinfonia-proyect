// importamos los hooks de React necesarios para manejar estado, efectos y referencias
import { useState, useEffect, useRef } from "react";
// importamos createPortal para renderizar el panel flotante directamente en el body sin ser recortado por contenedores padres
import { createPortal } from "react-dom";
// importamos el componente de iconos del proyecto
import Icono from "./Icono.jsx";
// importamos la hoja de estilos propia del componente de accesibilidad
import "./Accesibilidad.css";

// clave unica para guardar y leer las preferencias en el almacenamiento local del dispositivo
const CLAVE_STORAGE = "sintonia_accesibilidad";
// clave donde PreferenciasCookies guarda el estado detallado de cada categoria de cookies
const CLAVE_STORAGE_COOKIES = "sintonia-consentimiento-categorias";
// nombre de la cookie oficial de preferencias de accesibilidad
const NOMBRE_COOKIE_ACC = "accesibilidad";
// valor minimo permitido para el porcentaje de tamaño de texto
const TAMANO_MIN = 80;
// valor maximo permitido para el porcentaje de tamaño de texto
const TAMANO_MAX = 140;
// incremento o decremento por cada clic en los botones - y +
const PASO_TAMANO = 10;

// funcion auxiliar para leer una cookie especifica del navegador
function leerCookie(nombre) {
  // buscamos la cookie por su nombre mediante expresion regular
  const coincidencia = document.cookie.match(new RegExp("(^|;\\s*)" + nombre + "=([^;]*)"));
  // devolvemos el valor decodificado si existe, o null si no se encontro
  return coincidencia ? decodeURIComponent(coincidencia[2]) : null;
}

// funcion que verifica si el usuario tiene activas las cookies de Preferencias (accesibilidad, idioma, etc.)
function permiteGuardarPreferencias() {
  // intentamos revisar primero el detalle por categorias guardado por PreferenciasCookies
  try {
    // leemos el objeto de categorias desde localStorage
    const guardadoCategorias = localStorage.getItem(CLAVE_STORAGE_COOKIES);
    // si existe una configuracion detallada guardada, verificamos especificamente la categoria "preferencias"
    if (guardadoCategorias) {
      // convertimos la cadena JSON en objeto
      const categorias = JSON.parse(guardadoCategorias);
      // retornamos true unicamente si la categoria de preferencias esta activa
      return categorias?.preferencias === true;
    }
  } catch {
    // ignoramos errores de lectura de localStorage
  }
  // si no hay detalle por categorias, verificamos si la cookie general de consentimiento fue aceptada
  return leerCookie("consentimiento") === "aceptado";
}

// funcion auxiliar para borrar cualquier dato de accesibilidad guardado cuando no hay permiso de cookies
function limpiarPreferenciasGuardadas() {
  // intentamos eliminar la clave de accesibilidad del localStorage
  try {
    // borramos el registro local de accesibilidad
    localStorage.removeItem(CLAVE_STORAGE);
  } catch {
    // ignoramos errores si el almacenamiento esta restringido
  }
  // expiramos tambien la cookie de accesibilidad en el navegador
  document.cookie = `${NOMBRE_COOKIE_ACC}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// funcion que obtiene los valores iniciales predeterminados segun la configuracion del sistema operativo del usuario
function obtenerValoresSistema() {
  // verificamos si el entorno window existe en el navegador
  const hayWindow = typeof window !== "undefined" && typeof window.matchMedia === "function";
  // consultamos si el sistema operativo pide alto contraste por defecto
  const contrasteSistema = hayWindow ? window.matchMedia("(prefers-contrast: more)").matches : false;
  // consultamos si el sistema operativo pide reducir el movimiento por defecto
  const movimientoSistema = hayWindow ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

  // retornamos el objeto con las 5 opciones de accesibilidad en su estado base
  return {
    // porcentaje base del tamaño del texto en 100%
    tamanoTexto: 100,
    // estado de alto contraste tomado del sistema
    altoContraste: contrasteSistema,
    // estado de reducir movimiento tomado del sistema
    reducirMovimiento: movimientoSistema,
    // subrayado de enlaces desactivado inicialmente
    subrayarEnlaces: false,
    // espaciado de lectura desactivado inicialmente
    espaciado: false,
  };
}

// funcion para cargar las preferencias guardadas previamente en este dispositivo
function cargarPreferenciasGuardadas() {
  // obtenemos los valores base del sistema como respaldo
  const base = obtenerValoresSistema();
  // si el usuario NO tiene activadas las cookies de preferencias, limpiamos cualquier rastro y usamos los valores base
  if (!permiteGuardarPreferencias()) {
    // borramos datos residuales para que al recargar no se mantengan cambios sin permiso
    limpiarPreferenciasGuardadas();
    // devolvemos los valores iniciales del sistema
    return base;
  }
  // intentamos leer la configuracion almacenada en el dispositivo
  try {
    // primero verificamos en localStorage
    const guardadoLocal = localStorage.getItem(CLAVE_STORAGE);
    // si no hay en localStorage, verificamos si existe en la cookie de accesibilidad
    const guardadoCookie = leerCookie(NOMBRE_COOKIE_ACC);
    // tomamos la fuente de datos que este disponible
    const cadenaJson = guardadoLocal || guardadoCookie;
    // si no hay datos previos guardados, devolvemos los valores del sistema
    if (!cadenaJson) return base;
    // convertimos el texto JSON a objeto de JavaScript
    const parseado = JSON.parse(cadenaJson);
    // combinamos de forma segura los valores guardados con los valores base
    return {
      // validamos que el tamaño del texto sea un numero dentro del rango permitido
      tamanoTexto:
        typeof parseado.tamanoTexto === "number"
          ? Math.min(TAMANO_MAX, Math.max(TAMANO_MIN, parseado.tamanoTexto))
          : base.tamanoTexto,
      // convertimos a booleano el estado de alto contraste
      altoContraste: Boolean(parseado.altoContraste),
      // convertimos a booleano el estado de reducir movimiento
      reducirMovimiento: Boolean(parseado.reducirMovimiento),
      // convertimos a booleano el estado de subrayar enlaces
      subrayarEnlaces: Boolean(parseado.subrayarEnlaces),
      // convertimos a booleano el estado de espaciado de lectura
      espaciado: Boolean(parseado.espaciado),
    };
  } catch {
    // en caso de cualquier error de lectura, retornamos los valores del sistema
    return base;
  }
}

// funcion que aplica los atributos y variables CSS directamente sobre la etiqueta raiz <html>
function aplicarPreferenciasEnDocumento(preferencias) {
  // obtenemos la referencia al elemento raiz <html>
  const raiz = document.documentElement;
  // calculamos el factor de escala dividiendo el porcentaje entre 100
  const factorEscala = preferencias.tamanoTexto / 100;
  // asignamos la variable CSS --escala-texto para escalar las tipografias proporcionalmente
  raiz.style.setProperty("--escala-texto", String(factorEscala));
  // activamos o desactivamos el atributo de alto contraste en <html>
  raiz.setAttribute("data-alto-contraste", String(preferencias.altoContraste));
  // activamos o desactivamos el atributo de reducir movimiento en <html>
  raiz.setAttribute("data-reducir-movimiento", String(preferencias.reducirMovimiento));
  // activamos o desactivamos el atributo de subrayar enlaces en <html>
  raiz.setAttribute("data-subrayar-enlaces", String(preferencias.subrayarEnlaces));
  // activamos o desactivamos el atributo de espaciado de lectura en <html>
  raiz.setAttribute("data-espaciado-lectura", String(preferencias.espaciado));
}

// funcion para persistir las preferencias en el dispositivo unicamente si las cookies de preferencias estan activas
function guardarPreferenciasEnDispositivo(preferencias) {
  // verificamos si el usuario autorizo guardar cookies de preferencias (accesibilidad)
  if (!permiteGuardarPreferencias()) {
    // si no estan activas, nos aseguramos de no dejar nada guardado para que al recargar vuelva al estado original
    limpiarPreferenciasGuardadas();
    return;
  }
  // serializamos el objeto de preferencias a formato JSON
  const serializado = JSON.stringify(preferencias);
  // intentamos guardar en localStorage
  try {
    // guardamos bajo la clave oficial del proyecto
    localStorage.setItem(CLAVE_STORAGE, serializado);
  } catch {
    // ignoramos errores si el navegador tiene bloqueado el almacenamiento local
  }
  // calculamos expiracion a 1 año para la cookie de accesibilidad
  const expira = new Date(Date.now() + 365 * 864e5).toUTCString();
  // escribimos la cookie codificada
  document.cookie = `${NOMBRE_COOKIE_ACC}=${encodeURIComponent(serializado)}; expires=${expira}; path=/; SameSite=Lax`;
}

// componente principal e independiente de Accesibilidad
export default function Accesibilidad({
  textos, // objeto global de textos proveniente de useTextos en App.jsx
  idioma = "es", // idioma activo ("es" o "en")
  onNavegar, // funcion de navegacion SPA para el enlace de Declaracion de accesibilidad
  onAbrir, // callback opcional que se ejecuta al abrir el panel (util en movil para cerrar el menu hamburguesa)
}) {
  // estado booleano que controla si el panel de accesibilidad esta visible o cerrado
  const [abierto, setAbierto] = useState(false);
  // estado con los 5 valores de configuracion de accesibilidad
  const [preferencias, setPreferencias] = useState(cargarPreferenciasGuardadas);
  // estado para guardar las coordenadas de posicionamiento del panel en escritorio
  const [posicionPanel, setPosicionPanel] = useState({ top: 76, right: 24 });

  // referencia al boton circular que abre el panel para devolverle el foco y calcular su posicion
  const botonDisparadorRef = useRef(null);
  // referencia a la caja del panel desplegable para detectar clics fuera de el
  const panelRef = useRef(null);

  // determinamos si el idioma actual es ingles para los textos de respaldo
  const ingles = idioma === "en";
  // extraemos el subobjeto de textos de accesibilidad de la API
  const txtAcc = textos?.accesibilidad;
  // extraemos el subobjeto de textos del navbar de la API
  const txtNav = textos?.navbar;

  // efecto que aplica las preferencias al documento HTML cada vez que cambian
  useEffect(() => {
    // inyectamos los atributos y variables en <html>
    aplicarPreferenciasEnDocumento(preferencias);
  }, [preferencias]);

  // efecto para mantener sincronizadas multiples instancias del componente (escritorio y movil)
  useEffect(() => {
    // funcion que actualiza el estado local cuando otra instancia dispara un cambio
    function sincronizarInstancias(evento) {
      // si el evento trae nuevas preferencias, actualizamos el estado
      if (evento.detail) {
        setPreferencias(evento.detail);
      }
    }
    // escuchamos el evento personalizado en window
    window.addEventListener("sintonia-accesibilidad-cambio", sincronizarInstancias);
    // limpiamos el oyente al desmontar
    return () => window.removeEventListener("sintonia-accesibilidad-cambio", sincronizarInstancias);
  }, []);

  // efecto para reaccionar cuando el usuario activa o desactiva las cookies de preferencias
  useEffect(() => {
    // funcion que guarda o limpia las preferencias actuales al cambiar el consentimiento de cookies
    function sincronizarConsentimientoCookies() {
      // guardarPreferenciasEnDispositivo verifica si hay permiso: si lo hay guarda el estado actual, y si no lo limpia
      guardarPreferenciasEnDispositivo(preferencias);
    }
    // escuchamos el evento que emite PreferenciasCookies o BannerCookies
    window.addEventListener("sintonia-consentimiento-actualizado", sincronizarConsentimientoCookies);
    // limpiamos el oyente al desmontar
    return () => window.removeEventListener("sintonia-consentimiento-actualizado", sincronizarConsentimientoCookies);
  }, [preferencias]);

  // funcion centralizada para actualizar cualquier preferencia, guardarla y notificar a otras instancias
  function actualizarPreferencias(nuevas) {
    // actualizamos el estado de React
    setPreferencias(nuevas);
    // persistimos en el dispositivo
    guardarPreferenciasEnDispositivo(nuevas);
    // emitimos el evento global para que el boton de movil y el de escritorio tengan el mismo estado
    window.dispatchEvent(new CustomEvent("sintonia-accesibilidad-cambio", { detail: nuevas }));
  }

  // funcion para calcular la posicion exacta del panel debajo del boton en escritorio
  function calcularPosicionEscritorio() {
    // verificamos que exista la referencia al boton en el DOM
    if (!botonDisparadorRef.current) return;
    // obtenemos las medidas y coordenadas del boton respecto a la ventana
    const rect = botonDisparadorRef.current.getBoundingClientRect();
    // si el boton tiene ancho mayor a 0 (es visible en pantalla), alineamos el panel con su borde derecho
    if (rect.width > 0) {
      // calculamos la distancia desde el borde superior (12px debajo del boton)
      const top = Math.round(rect.bottom + 12);
      // calculamos la distancia desde el borde derecho de la ventana
      const right = Math.max(16, Math.round(window.innerWidth - rect.right));
      // actualizamos las coordenadas del panel
      setPosicionPanel({ top, right });
    }
  }

  // funcion para alternar la apertura o cierre del panel al pulsar el boton circular
  function alternarPanel() {
    // si se va a abrir el panel
    if (!abierto) {
      // calculamos donde debe ubicarse en escritorio
      calcularPosicionEscritorio();
      // si nos pasaron el callback onAbrir (por ejemplo para cerrar la cortina movil), lo ejecutamos
      if (typeof onAbrir === "function") {
        onAbrir();
      }
      // abrimos el panel
      setAbierto(true);
    } else {
      // si ya estaba abierto, lo cerramos
      setAbierto(false);
    }
  }

  // efecto para cerrar el panel con la tecla Escape, al hacer clic afuera o al redimensionar ventana
  useEffect(() => {
    // si el panel esta cerrado no registramos oyentes innecesarios
    if (!abierto) return;

    // manejador para cerrar al presionar Escape
    function manejarTeclado(evento) {
      // si la tecla es Escape
      if (evento.key === "Escape") {
        // cerramos el panel
        setAbierto(false);
        // devolvemos el foco al boton que lo abrio
        botonDisparadorRef.current?.focus();
      }
    }

    // manejador para cerrar al hacer clic fuera del panel en escritorio
    function manejarClicExterior(evento) {
      // si el clic fue dentro del propio panel, no cerramos
      if (panelRef.current && panelRef.current.contains(evento.target)) return;
      // si el clic fue en el boton disparador, dejamos que alternarPanel lo maneje
      if (botonDisparadorRef.current && botonDisparadorRef.current.contains(evento.target)) return;
      // en cualquier otro lugar fuera del panel, lo cerramos
      setAbierto(false);
    }

    // manejador para recalcular posicion si cambia el tamaño de la ventana
    function manejarResize() {
      // recalculamos la alineacion con el boton en escritorio
      calcularPosicionEscritorio();
    }

    // registramos los tres eventos globales
    document.addEventListener("keydown", manejarTeclado);
    document.addEventListener("mousedown", manejarClicExterior);
    window.addEventListener("resize", manejarResize);

    // limpiamos los eventos cuando se cierra el panel o se desmonta el componente
    return () => {
      document.removeEventListener("keydown", manejarTeclado);
      document.removeEventListener("mousedown", manejarClicExterior);
      window.removeEventListener("resize", manejarResize);
    };
  }, [abierto]);

  // funcion para disminuir el tamaño del texto en pasos de 10%
  function reducirTexto() {
    // calculamos el nuevo valor sin bajar del limite minimo
    const nuevoTamano = Math.max(TAMANO_MIN, preferencias.tamanoTexto - PASO_TAMANO);
    // actualizamos las preferencias con el nuevo porcentaje
    actualizarPreferencias({ ...preferencias, tamanoTexto: nuevoTamano });
  }

  // funcion para aumentar el tamaño del texto en pasos de 10%
  function aumentarTexto() {
    // calculamos el nuevo valor sin superar el limite maximo
    const nuevoTamano = Math.min(TAMANO_MAX, preferencias.tamanoTexto + PASO_TAMANO);
    // actualizamos las preferencias con el nuevo porcentaje
    actualizarPreferencias({ ...preferencias, tamanoTexto: nuevoTamano });
  }

  // funcion para alternar cualquiera de los 4 interruptores booleanos (switches)
  function alternarOpcion(clave) {
    // invertimos el valor booleano de la clave recibida
    actualizarPreferencias({
      ...preferencias,
      [clave]: !preferencias[clave],
    });
  }

  // funcion para restablecer todas las opciones a los valores iniciales del sistema
  function restablecerOpciones() {
    // obtenemos los valores limpios del sistema operativo
    const valoresIniciales = obtenerValoresSistema();
    // eliminamos el registro guardado en localStorage
    try {
      localStorage.removeItem(CLAVE_STORAGE);
    } catch {
      // ignoramos si localStorage no esta disponible
    }
    // borramos la cookie de accesibilidad si existia
    document.cookie = `${NOMBRE_COOKIE_ACC}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    // actualizamos el estado y notificamos a todas las instancias
    setPreferencias(valoresIniciales);
    // sincronizamos cualquier otra instancia montada
    window.dispatchEvent(new CustomEvent("sintonia-accesibilidad-cambio", { detail: valoresIniciales }));
  }

  // funcion para navegar a la vista de declaracion de accesibilidad sin recargar la pagina
  function irADeclaracion(evento) {
    // prevenimos la recarga por defecto del navegador
    evento.preventDefault();
    // cerramos el panel flotante de accesibilidad
    setAbierto(false);
    // si recibimos la funcion onNavegar desde App/Navbar, navegamos a /accesibilidad
    if (typeof onNavegar === "function") {
      onNavegar("/accesibilidad", evento);
    }
  }

  // formateamos el texto del porcentaje reemplazando {valor} segun la plantilla de la API
  const textoPorcentaje = txtAcc?.tamanoTexto?.valor
    ? txtAcc.tamanoTexto.valor.replace("{valor}", String(preferencias.tamanoTexto))
    : `${preferencias.tamanoTexto} %`;

  // lista estructurada con los 4 interruptores (switches) obtenidos de los textos de la API
  const interruptores = [
    {
      // identificador de la propiedad en el estado
      clave: "altoContraste",
      // titulo del interruptor desde la API
      etiqueta: txtAcc?.altoContraste?.etiqueta ?? (ingles ? "High contrast" : "Alto contraste"),
      // texto descriptivo de ayuda desde la API
      ayuda:
        txtAcc?.altoContraste?.ayuda ??
        (ingles ? "More difference between text and background" : "Más diferencia entre el texto y el fondo"),
    },
    {
      // identificador de la propiedad en el estado
      clave: "reducirMovimiento",
      // titulo del interruptor desde la API
      etiqueta: txtAcc?.reducirMovimiento?.etiqueta ?? (ingles ? "Reduce motion" : "Reducir movimiento"),
      // texto descriptivo de ayuda desde la API
      ayuda:
        txtAcc?.reducirMovimiento?.ayuda ??
        (ingles ? "No animations or transitions" : "Sin animaciones ni transiciones"),
    },
    {
      // identificador de la propiedad en el estado
      clave: "subrayarEnlaces",
      // titulo del interruptor desde la API
      etiqueta: txtAcc?.subrayarEnlaces?.etiqueta ?? (ingles ? "Underline links" : "Subrayar enlaces"),
      // texto descriptivo de ayuda desde la API
      ayuda:
        txtAcc?.subrayarEnlaces?.ayuda ??
        (ingles ? "Links stand out without relying on color" : "Los enlaces se distinguen sin depender del color"),
    },
    {
      // identificador de la propiedad en el estado
      clave: "espaciado",
      // titulo del interruptor desde la API
      etiqueta: txtAcc?.espaciado?.etiqueta ?? (ingles ? "Reading spacing" : "Espaciado de lectura"),
      // texto descriptivo de ayuda desde la API
      ayuda:
        txtAcc?.espaciado?.ayuda ??
        (ingles ? "More space between lines and letters" : "Más espacio entre líneas y entre letras"),
    },
  ];

  // retornamos el boton circular disparador y el portal con el panel desplegable
  return (
    // contenedor en linea para el boton de accesibilidad
    <div className="accesibilidad-contenedor">
      {/* boton circular con el icono de accesibilidad */}
      <button
        ref={botonDisparadorRef}
        type="button"
        className="navbar-icono accesibilidad-boton-disparador"
        aria-label={
          txtNav?.aria?.accesibilidad ??
          (ingles ? "Open accessibility options" : "Abrir opciones de accesibilidad")
        }
        aria-expanded={abierto}
        aria-haspopup="dialog"
        onClick={alternarPanel}
      >
        {/* icono vectorial de accesibilidad definido en Icono.jsx */}
        <Icono nombre="accesibilidad" />
      </button>

      {/* si el panel esta abierto, lo renderizamos en document.body mediante createPortal */}
      {abierto &&
        createPortal(
          // capa envolvente que en movil muestra el fondo oscurecido y en escritorio posiciona el popover
          <div className="accesibilidad-capa" role="presentation">
            {/* cuadro de dialogo accesible del panel de accesibilidad */}
            <aside
              ref={panelRef}
              className="accesibilidad-panel"
              role="dialog"
              aria-modal="false"
              aria-label={txtAcc?.titulo ?? (ingles ? "Accessibility" : "Accesibilidad")}
              style={{
                // variables en linea para alinear el popover exactamente debajo del boton en escritorio
                "--acc-top": `${posicionPanel.top}px`,
                "--acc-right": `${posicionPanel.right}px`,
              }}
            >
              {/* cabecera del panel con el titulo a la izquierda y el boton X a la derecha */}
              <header className="accesibilidad-cabecera">
                {/* titulo principal del panel de accesibilidad */}
                <h2 className="titular-h3 accesibilidad-titulo">
                  {txtAcc?.titulo ?? (ingles ? "Accessibility" : "Accesibilidad")}
                </h2>

                {/* boton para cerrar el panel de accesibilidad */}
                <button
                  type="button"
                  className="accesibilidad-boton-cerrar"
                  aria-label={
                    txtAcc?.aria?.cerrar ??
                    (ingles ? "Close accessibility panel" : "Cerrar el panel de accesibilidad")
                  }
                  onClick={() => {
                    // cerramos el panel
                    setAbierto(false);
                    // devolvemos el foco al boton disparador
                    botonDisparadorRef.current?.focus();
                  }}
                >
                  {/* icono de equis para cerrar */}
                  <Icono nombre="cerrar" />
                </button>
              </header>

              {/* bloque de control para ajustar el porcentaje de tamaño del texto */}
              <div className="accesibilidad-bloque-tamano">
                {/* etiqueta superior de Tamaño del texto */}
                <span className="accesibilidad-etiqueta-seccion">
                  {txtAcc?.tamanoTexto?.etiqueta ?? (ingles ? "Text size" : "Tamaño del texto")}
                </span>

                {/* barra con boton -, porcentaje central y boton + */}
                <div className="accesibilidad-tamano-control" role="group" aria-label={txtAcc?.tamanoTexto?.etiqueta ?? (ingles ? "Text size" : "Tamaño del texto")}>
                  {/* boton para reducir el tamaño del texto */}
                  <button
                    type="button"
                    className="accesibilidad-tamano-boton"
                    aria-label={
                      txtAcc?.tamanoTexto?.reducir ??
                      (ingles ? "Decrease text size" : "Reducir el tamaño del texto")
                    }
                    onClick={reducirTexto}
                    disabled={preferencias.tamanoTexto <= TAMANO_MIN}
                  >
                    {/* simbolo menos */}
                    &minus;
                  </button>

                  {/* indicador numerico del porcentaje actual (ej. 100 %) */}
                  <span className="accesibilidad-tamano-valor" aria-live="polite">
                    {textoPorcentaje}
                  </span>

                  {/* boton para aumentar el tamaño del texto */}
                  <button
                    type="button"
                    className="accesibilidad-tamano-boton"
                    aria-label={
                      txtAcc?.tamanoTexto?.aumentar ??
                      (ingles ? "Increase text size" : "Aumentar el tamaño del texto")
                    }
                    onClick={aumentarTexto}
                    disabled={preferencias.tamanoTexto >= TAMANO_MAX}
                  >
                    {/* simbolo mas */}
                    +
                  </button>
                </div>
              </div>

              {/* lista de los 4 interruptores (switches) de configuracion */}
              <div className="accesibilidad-lista-opciones">
                {/* recorremos cada una de las 4 opciones para dibujar su fila y su switch */}
                {interruptores.map((item) => {
                  // consultamos si esta opcion especifica se encuentra activa
                  const activoSwitch = Boolean(preferencias[item.clave]);
                  // construimos un id unico para vincular el texto con el switch
                  const idEtiqueta = `acc-switch-${item.clave}`;

                  return (
                    // fila individual con textos a la izquierda y switch a la derecha
                    <div key={item.clave} className="accesibilidad-opcion">
                      {/* columna de textos con el nombre de la opcion y su explicacion */}
                      <div className="accesibilidad-opcion-textos" id={idEtiqueta}>
                        {/* nombre principal de la opcion en negrita */}
                        <span className="accesibilidad-opcion-titulo">
                          {item.etiqueta}
                        </span>
                        {/* descripcion secundaria de ayuda */}
                        <span className="accesibilidad-opcion-ayuda">
                          {item.ayuda}
                        </span>
                      </div>

                      {/* boton con rol switch accesible para activar o desactivar la opcion */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={activoSwitch}
                        aria-labelledby={idEtiqueta}
                        className={`accesibilidad-switch ${activoSwitch ? "is-activo" : ""}`}
                        onClick={() => alternarOpcion(item.clave)}
                      >
                        {/* circulo interior deslizante del interruptor */}
                        <span className="accesibilidad-switch-pulgar" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* nota informativa sobre el guardado en el dispositivo y valores del sistema */}
              <p className="detalle-nota accesibilidad-nota">
                {txtAcc?.mensajes?.nota ??
                  (ingles
                    ? "Saved on this device. The starting values come from what you already set on your system."
                    : "Se guarda en este dispositivo. Los valores iniciales salen de lo que ya definiste en tu sistema.")}
              </p>

              {/* pie del panel con el enlace a la declaracion y el boton de restablecer */}
              <footer className="accesibilidad-pie">
                {/* enlace hacia la declaracion de accesibilidad */}
                <a
                  href="/accesibilidad"
                  className="accesibilidad-enlace-declaracion"
                  onClick={irADeclaracion}
                >
                  {txtAcc?.enlaces?.declaracion ??
                    (ingles ? "Accessibility statement" : "Declaración de accesibilidad")}
                </a>

                {/* boton para restaurar todos los ajustes a sus valores por defecto */}
                <button
                  type="button"
                  className="accesibilidad-boton-restablecer"
                  onClick={restablecerOpciones}
                >
                  {txtAcc?.botones?.restablecer ?? (ingles ? "Reset" : "Restablecer")}
                </button>
              </footer>
            </aside>
          </div>,
          // destino del portal en el cuerpo principal del documento
          document.body
        )}
    </div>
  );
}

