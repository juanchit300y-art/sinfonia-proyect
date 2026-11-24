// Importamos useEffect (cuenta regresiva 429), useRef (foco al error) y useState (estados del formulario)
import { useEffect, useRef, useState } from "react";
// Importamos el cliente HTTP centralizado para enviar POST /api/v1/sesion con credentials: "include"
import { peticionApi } from "../services/api.js";
// Importamos el componente de iconos vectoriales (logo y ojos de ver/ocultar clave)
import Icono from "./Icono.jsx";
// Importamos el componente oficial de portadas SVG para el collage movil y la galeria derecha
import Portada from "./Portada.jsx";
// Importamos el componente reutilizable Aviso (banner superior oficial de Figma)
import Aviso from "./Aviso.jsx";
// Importamos la hoja de estilos de la vista de inicio de sesion
import "./IniciarSesion.css";

// Definicion de las 8 portadas decorativas del panel derecho (4x2) usando solo tokens de diseno de Figma
const PORTADAS_GALERIA = [
  { id: "gal-1", patron: 2, colores: ["portada/3", "fijo/negro", "fijo/blanco"] },
  { id: "gal-2", patron: 0, colores: ["portada/5", "portada/1"] },
  { id: "gal-3", patron: 1, colores: ["portada/2", "portada/4"] },
  { id: "gal-4", patron: 1, colores: ["portada/6", "portada/3"] },
  { id: "gal-5", patron: 3, colores: ["portada/4", "portada/2", "fijo/blanco"] },
  { id: "gal-6", patron: 3, colores: ["fijo/negro", "portada/5", "fijo/blanco"] },
  { id: "gal-7", patron: 0, colores: ["portada/3", "portada/4"] },
  { id: "gal-8", patron: 2, colores: ["portada/6", "portada/5", "fijo/blanco"] },
];

// Definicion de las 3 portadas del collage superior exclusivo de movil (390px) segun Figma
const PORTADAS_MOVIL = [
  { id: "mov-centro", clase: "ingresar-collage-centro", patron: 2, colores: ["portada/3", "fijo/negro", "fijo/blanco"] },
  { id: "mov-izq", clase: "ingresar-collage-izq", patron: 0, colores: ["portada/5", "portada/1"] },
  { id: "mov-der", clase: "ingresar-collage-der", patron: 1, colores: ["portada/2", "portada/4"] },
];

// Declaramos y exportamos la Vista 4 · Iniciar sesion (/ingresar) - Paso 4: Validacion, envio POST y 3 errores
export default function IniciarSesion({
  // Objeto completo de textos traducidos descargado desde GET /api/v1/textos
  textos,
  // Funcion de navegacion SPA recibida desde App.jsx para cambiar de ruta sin recargar
  onNavegar,
  // Callback opcional que recibe al usuario autenticado tras un POST /sesion exitoso (listo para PR #4)
  onIngresoExitoso,
}) {
  // Estado controlado del campo correo electronico
  const [correo, setCorreo] = useState("");
  // Estado controlado del campo contrasena
  const [clave, setClave] = useState("");
  // Estado controlado de la casilla "Mantener la sesion iniciada" (marcada inicialmente como en Figma)
  const [mantenerSesion, setMantenerSesion] = useState(true);
  // Estado booleano que controla si la contrasena se ve en texto plano (true) o con puntos (false)
  const [mostrarClave, setMostrarClave] = useState(false);
  // Estado que guarda los mensajes de error individuales debajo de cada campo
  const [erroresCampo, setErroresCampo] = useState({ correo: "", clave: "" });
  // Tipo de error activo en el banner superior ("campos" | "credenciales" | "demasiadosIntentos" | "conexion" | "servidor" | null)
  const [tipoError, setTipoError] = useState(null);
  // Codigo semantico de error devuelto por el servidor en fallos inesperados (ej. "falla_simulada" en 503)
  const [codigoErrorServidor, setCodigoErrorServidor] = useState("");
  // Contador regresivo en segundos para el bloqueo 429 demasiadas_peticiones (leido desde Retry-After)
  const [segundosEspera, setSegundosEspera] = useState(0);
  // Estado booleano que indica si la peticion POST /sesion esta en curso (bloquea doble envio)
  const [enviando, setEnviando] = useState(false);

  // Referencia directa al input de correo para moverle el foco si falla su validacion
  const correoRef = useRef(null);
  // Referencia directa al input de contrasena para moverle el foco si falla su validacion
  const claveRef = useRef(null);

  // Indica si el formulario esta temporalmente bloqueado por un error 429 con segundos pendientes
  const estaBloqueado = segundosEspera > 0;

  // Efecto puro que descuenta 1 segundo cada 1000ms mientras exista un bloqueo 429 activo
  useEffect(() => {
    // Si no hay tiempo de espera pendiente, no creamos ningun intervalo
    if (!estaBloqueado) return;

    // Iniciamos un solo intervalo para restar segundo a segundo hasta llegar a 0
    const intervalo = setInterval(() => {
      // Actualizamos el contador de forma pura sin efectos secundarios internos
      setSegundosEspera((actual) => (actual <= 1 ? 0 : actual - 1));
    }, 1000);

    // Limpiamos el intervalo al llegar a 0 o si el usuario abandona la vista /ingresar
    return () => clearInterval(intervalo);
  }, [estaBloqueado]);

  // Extraemos el subobjeto de textos propios de la pagina de inicio de sesion
  const textosIngresar = textos?.paginas?.ingresar;
  // Extraemos el subobjeto del formulario (titulo, subtitulo, etiquetas, botones y enlaces)
  const formulario = textosIngresar?.formulario;
  // Extraemos el subobjeto de errores especificos del login (camposObligatorios, credenciales, demasiadosIntentos, conexion)
  const textosErroresIngresar = textosIngresar?.errores;
  // Extraemos el subobjeto de presentacion del panel derecho (titulo y bajada)
  const presentacion = textosIngresar?.presentacion;
  // Obtenemos el nombre de la marca en minusculas igual que en Navbar y Footer
  const nombreMarca = (textos?.navbar?.logo?.texto ?? textos?.sitio?.nombre)?.toLowerCase();
  // Calculamos el anio actual para rellenar la plantilla oficial de derechos de autor
  const anioActual = new Date().getFullYear();
  // Construimos la linea legal inferior reemplazando {anio} desde textos.footer.legal.derechos
  const textoDerechos = textos?.footer?.legal?.derechos?.replace("{anio}", String(anioActual));

  // Resolvemos de forma reactiva el contenido del banner Aviso segun el tipo de error y el idioma activo
  let bannerError = null;
  // Caso 1: campos vacios o 422 validacion
  if (tipoError === "campos") {
    bannerError = {
      // Titulo "Revisa los campos marcados" desde la API
      titulo: textosErroresIngresar?.camposObligatorios?.titulo ?? textos?.errores?.validacion ?? "",
      // Texto "Para ingresar escribe tu correo y tu contrasena." desde la API
      texto: textosErroresIngresar?.camposObligatorios?.texto ?? "",
    };
  // Caso 2: 401 credenciales_invalidas (Figma Captura 3)
  } else if (tipoError === "credenciales") {
    bannerError = {
      // Titulo "Correo o contrasena incorrectos" desde la API
      titulo: textosErroresIngresar?.credenciales?.titulo ?? "",
      // Texto "Revisa los datos e intentalo de nuevo..." desde la API
      texto: textosErroresIngresar?.credenciales?.texto ?? "",
    };
  // Caso 3: 429 demasiadas_peticiones mientras el contador regresivo sea mayor a 0
  } else if (tipoError === "demasiadosIntentos" && estaBloqueado) {
    bannerError = {
      // Titulo "Demasiados intentos" desde la API
      titulo: textosErroresIngresar?.demasiadosIntentos?.titulo ?? "",
      // Sustituimos el marcador {segundos} con el conteo regresivo en vivo
      texto:
        textosErroresIngresar?.demasiadosIntentos?.texto?.replace(
          "{segundos}",
          String(segundosEspera)
        ) ?? "",
    };
  // Caso 4: error de red o sin conexion a internet (Figma Captura 4)
  } else if (tipoError === "conexion") {
    bannerError = {
      // Titulo "No pudimos conectarnos" desde la API
      titulo: textosErroresIngresar?.conexion?.titulo ?? "",
      // Texto "Revisa tu conexion a internet e intentalo de nuevo. Lo que escribiste se conserva."
      texto: textosErroresIngresar?.conexion?.texto ?? "",
    };
  // Caso 5: error inesperado del servidor (ej. 500 o 503 falla_simulada)
  } else if (tipoError === "servidor") {
    bannerError = {
      // Titulo general de error desde textos.estados.error.titulo
      titulo: textos?.estados?.error?.titulo ?? "",
      // Descripcion traducida desde textos.errores[codigo] con respaldo a estados.error.descripcion
      texto:
        (codigoErrorServidor && textos?.errores?.[codigoErrorServidor]) ||
        textos?.estados?.error?.descripcion ||
        textos?.errores?.generico ||
        "",
    };
  }

  // Etiqueta del boton principal: cambia a "Reintentar" cuando hubo error de conexion (Figma Captura 4)
  const etiquetaBotonPrincipal =
    tipoError === "conexion"
      ? textosErroresIngresar?.conexion?.botones?.reintentar ?? formulario?.botones?.ingresar
      : formulario?.botones?.ingresar;

  // Funcion auxiliar para navegar dentro de la SPA evitando recargas completas del navegador
  function manejarNavegacion(evento, ruta) {
    // Verificamos que App.jsx haya entregado el callback onNavegar
    if (typeof onNavegar === "function") {
      // Cancelamos la navegacion clasica del enlace HTML
      evento.preventDefault();
      // Cambiamos la ruta con window.history.pushState desde App.jsx
      onNavegar(ruta);
    }
  }

  // Actualiza el correo y limpia inmediatamente su error visual si el usuario corrige el campo
  function manejarCambioCorreo(evento) {
    // Guardamos el nuevo valor escrito por el usuario
    setCorreo(evento.target.value);
    // Si este campo tenia error marcado, lo quitamos al empezar a escribir
    if (erroresCampo.correo) {
      // Limpiamos solo el error de correo conservando el posible error de clave
      setErroresCampo((previo) => ({ ...previo, correo: "" }));
    }
  }

  // Actualiza la contrasena y limpia inmediatamente su error visual si el usuario corrige el campo
  function manejarCambioClave(evento) {
    // Guardamos el nuevo valor escrito por el usuario
    setClave(evento.target.value);
    // Si este campo tenia error marcado, lo quitamos al empezar a escribir
    if (erroresCampo.clave) {
      // Limpiamos solo el error de clave conservando el posible error de correo
      setErroresCampo((previo) => ({ ...previo, clave: "" }));
    }
  }

  // IMPORTANTE --------------------------------------------------------------------------
  // Valida los campos obligatorios y envia POST /api/v1/sesion manejando los 3 casos de error
  async function manejarEnvio(evento) {
    // Evitamos que el navegador haga un envio tradicional recargando la pagina
    evento.preventDefault();
    // Si ya hay una peticion en curso o un bloqueo 429 activo, impedimos el envio
    if (enviando || estaBloqueado) return;

    // Quitamos espacios accidentales al inicio o final del correo
    const correoLimpio = correo.trim();
    // Preparamos el objeto de errores locales por campo
    const nuevosErrores = {
      // Si el correo quedo vacio asignamos el mensaje oficial de la API
      correo: correoLimpio ? "" : textosErroresIngresar?.correoObligatorio ?? "",
      // Si la contrasena esta vacia asignamos el mensaje oficial de la API
      clave: clave ? "" : textosErroresIngresar?.claveObligatoria ?? "",
    };

    // Comprobamos si falto alguno de los dos campos obligatorios
    if (nuevosErrores.correo || nuevosErrores.clave) {
      // Pintamos los bordes y mensajes rojos debajo de cada campo vacio
      setErroresCampo(nuevosErrores);
      // Activamos el banner Aviso rojo de revision de campos
      setTipoError("campos");
      // Llevamos el foco del teclado automaticamente al primer campo que fallo
      if (nuevosErrores.correo) {
        // Enfoca el campo de correo
        correoRef.current?.focus();
      } else {
        // Enfoca el campo de contrasena
        claveRef.current?.focus();
      }
      // Detenemos el envio: no llamamos a la API mientras falten campos obligatorios
      return;
    }

    // Limpiamos avisos y errores previos antes de disparar la peticion POST
    setErroresCampo({ correo: "", clave: "" });
    setTipoError(null);
    setCodigoErrorServidor("");
    // Activamos el estado de carga para deshabilitar el boton y mostrar "Ingresando..."
    setEnviando(true);

    // Ejecutamos la peticion POST /api/v1/sesion manejando exito y todos los errores del contrato
    try {
      // Enviamos unicamente { correo, clave } segun el contrato oficial (credentials: "include" guarda la cookie httpOnly)
      const respuesta = await peticionApi("/sesion", {
        // Metodo HTTP POST porque estamos creando una sesion nueva en el servidor
        metodo: "POST",
        // Cuerpo JSON con exactamente los dos campos aceptados por el contrato de la API
        cuerpo: { correo: correoLimpio, clave },
      });

      // Avisamos al componente padre con los datos del usuario autenticado (usado en el PR #4)
      onIngresoExitoso?.(respuesta?.usuario ?? null);
      // Redirigimos al inicio de la aplicacion tras un ingreso exitoso (200 OK)
      onNavegar?.("/");
    } catch (error) {
      // Error 1: 422 validacion del servidor (ej. formato de correo invalido)
      if (error?.status === 422 || error?.codigo === "validacion") {
        // Extraemos los errores por campo que devolvio la API
        const erroresServidor = {
          // Mensaje del campo correo si la API lo marco invalido
          correo: error?.campos?.correo ?? "",
          // Mensaje del campo clave si la API lo marco invalido
          clave: error?.campos?.clave ?? "",
        };
        // Marcamos los campos en rojo con los mensajes exactos de la API
        setErroresCampo(erroresServidor);
        // Activamos el banner superior de revision de campos
        setTipoError("campos");
        // Enfocamos automaticamente el primer campo marcado por el servidor
        if (erroresServidor.correo) {
          // Enfoca correo
          correoRef.current?.focus();
        } else if (erroresServidor.clave) {
          // Enfoca contrasena
          claveRef.current?.focus();
        }
      // Error 2: 401 credenciales_invalidas (un solo aviso general sin delatar que campo fallo)
      } else if (error?.status === 401 || error?.codigo === "credenciales_invalidas") {
        // Activamos el banner especifico de credenciales incorrectas (Figma Captura 3)
        setTipoError("credenciales");
      // Error 3: 429 demasiadas_peticiones con tiempo de espera real desde cabecera Retry-After
      } else if (error?.status === 429 || error?.codigo === "demasiadas_peticiones") {
        // Leemos los segundos devueltos en Retry-After (con respaldo seguro de 60s si no viniera)
        const segundos =
          typeof error?.retryAfter === "number" && error.retryAfter > 0
            ? error.retryAfter
            : 60;
        // Arrancamos la cuenta regresiva que bloquea el boton hasta llegar a 0
        setSegundosEspera(segundos);
        // Activamos el banner de demasiados intentos con {segundos} actualizado en vivo
        setTipoError("demasiadosIntentos");
      // Error 4: falta de conexion a internet o fallo de red (Figma Captura 4)
      } else if (error?.esRed || error?.codigo === "sin_conexion") {
        // Activamos el banner de sin conexion y cambiamos el boton principal a "Reintentar"
        setTipoError("conexion");
      // Error 5: cualquier otro fallo del servidor (ej. 500 o 503 falla_simulada)
      } else {
        // Guardamos el codigo de error para traducirlo desde textos.errores
        setCodigoErrorServidor(error?.codigo ?? "");
        // Activamos el banner de error generico del servidor
        setTipoError("servidor");
      }
    } finally {
      // Al terminar (sea exito o error) desactivamos el spinner y devolvemos control al boton
      setEnviando(false);
    }
  }
  // ---------------------------------------------------------------------------------------

  // Retornamos el layout dividido de pantalla completa (columna izquierda formulario + columna derecha visual)
  return (
    // Seccion principal de la vista vinculada por accesibilidad al titulo h1
    <section id="ingresar" className="ingresar" aria-labelledby="ingresar-titulo">
      {/* Columna izquierda: collage movil, logo, formulario y pie de derechos en escritorio */}
      <div className="ingresar-columna-formulario">
        {/* Collage superior de 3 portadas visible unicamente en movil*/}
        <div className="ingresar-collage-movil" aria-hidden="true">
          {/* Recorremos las 3 portadas superpuestas definidas con tokens oficiales */}
          {PORTADAS_MOVIL.map((item) => (
            // Caja posicionada de cada portada del collage movil
            <div key={item.id} className={`ingresar-collage-item ${item.clase}`}>
              <Portada
                // Llena toda su caja sin saltos hover decorativos
                className="ingresar-galeria-portada"
                // Numero de patron oficial (0, 1 o 2)
                patron={item.patron}
                // Tokens de color oficiales
                colores={item.colores}
              />
            </div>
          ))}
        </div>

        {/* Cabecera minimalista con el logotipo clickeable para volver al inicio */}
        <header className="ingresar-cabecera">
          {/* Enlace semantico hacia la pagina de inicio */}
          <a
            // Ruta real de destino para accesibilidad
            href="/"
            className="ingresar-marca"
            // Etiqueta accesible del logo proveniente de la API
            aria-label={textos?.navbar?.logo?.aria}
            // Intercepta el clic para navegar por la SPA
            onClick={(evento) => manejarNavegacion(evento, "/")}
          >
            {/* Isotipo oficial verde con barras de sonido */}
            <Icono nombre="logo" />
            {/* Nombre de la marca reutilizando la clase predefinida titular-h3 */}
            <span className="titular-h3 ingresar-marca-texto">{nombreMarca}</span>
          </a>
        </header>

        {/* Contenedor central que aloja el encabezado y los campos del formulario */}
        <div className="ingresar-cuerpo">
          {/* Titulo principal usando la clase tipografica predefinida titular-h1 */}
          <h1 id="ingresar-titulo" className="ingresar-titulo titular-h1">
            {formulario?.titulo} {/* texto titulo */}
          </h1>

          {/* Subtitulo explicativo usando la clase predefinida cuerpo-p */}
          <p className="ingresar-subtitulo cuerpo-p">
            {formulario?.subtitulo} {/* texto subtitulo */}
          </p>

          {/* Banner superior reutilizable Aviso (aparece cuando hay error de validacion o respuesta fallida) */}
          {bannerError && (
            <Aviso
              // Variante roja oficial de Figma
              variante="error"
              // En cuenta regresiva 429 usa "status" para no interrumpir cada segundo a lectores de pantalla
              rol={tipoError === "demasiadosIntentos" ? "status" : "alert"}
              // Titulo traducido desde la API
              titulo={bannerError.titulo}
              // Explicacion traducida desde la API
              texto={bannerError.texto}
              // Margen inferior hacia el primer campo
              className="ingresar-aviso"
            />
          )}

          {/* Formulario semantico con noValidate para controlar la validacion personalizada y accesibilidad */}
          <form className="ingresar-formulario" onSubmit={manejarEnvio} noValidate>
            {/* Grupo 1: campo de correo electronico */}
            <div className="ingresar-grupo">
              {/* Etiqueta asociada por htmlFor al input de correo usando detalle-nota-fuerte */}
              <label htmlFor="ingresar-correo" className="ingresar-etiqueta detalle-nota-fuerte">
                {/* Texto "Correo electronico" desde la API */}
                {formulario?.etiquetas?.correo}
              </label>
              {/* Campo controlado para el correo con soporte de foco por ref y estados ARIA de error */}
              <input
                // Referencia para enfocar automaticamente si falla la validacion
                ref={correoRef}
                // Identificador unico enlazado a la etiqueta label
                id="ingresar-correo"
                // Nombre semantico del campo
                name="correo"
                // Tipo email para teclado adaptado en moviles
                type="email"
                // Sugerencia de autocompletado estandar del navegador
                autoComplete="email"
                // Valor controlado por el estado React
                value={correo}
                // Actualiza el estado y limpia el error al escribir
                onChange={manejarCambioCorreo}
                // Texto guia proveniente de textos.paginas.ingresar.formulario.placeholders.correo
                placeholder={formulario?.placeholders?.correo}
                // Marca el campo como invalido para lectores de pantalla cuando tiene error
                aria-invalid={Boolean(erroresCampo.correo) || undefined}
                // Enlaza el campo con el mensaje de error rojo ubicado justo debajo
                aria-describedby={erroresCampo.correo ? "ingresar-error-correo" : undefined}
                // Aplica el borde rojo cuando existe un error en este campo
                className={`ingresar-campo cuerpo-p ${erroresCampo.correo ? "ingresar-campo--error" : ""}`.trim()}
              />
              {/* Mensaje de error debajo del campo correo en rojo oficial (tipografia detalle-nota) */}
              {erroresCampo.correo && (
                <p id="ingresar-error-correo" className="ingresar-campo-error detalle-nota">
                  {/* Texto de error desde la API */}
                  {erroresCampo.correo}
                </p>
              )}
            </div>

            {/* Grupo 2: campo de contrasena */}
            <div className="ingresar-grupo">
              {/* Etiqueta asociada por htmlFor al input de contrasena */}
              <label htmlFor="ingresar-clave" className="ingresar-etiqueta detalle-nota-fuerte">
                {/* Texto "Contrasena" desde la API */}
                {formulario?.etiquetas?.clave}
              </label>
              {/* Contenedor relativo que aloja el input de contrasena y el boton de ojo */}
              <div className="ingresar-campo-clave">
                {/* Campo controlado: alterna entre "text" y "password" y soporta estados ARIA de error */}
                <input
                  // Referencia para enfocar automaticamente si falla la validacion
                  ref={claveRef}
                  // Identificador unico enlazado a la etiqueta label
                  id="ingresar-clave"
                  // Nombre semantico del campo
                  name="clave"
                  // Si mostrarClave es true muestra texto plano; si es false el navegador pinta puntos
                  type={mostrarClave ? "text" : "password"}
                  // Sugerencia de autocompletado de contrasena actual
                  autoComplete="current-password"
                  // Valor controlado por el estado React
                  value={clave}
                  // Actualiza el estado y limpia el error al escribir
                  onChange={manejarCambioClave}
                  // Marca el campo como invalido para lectores de pantalla cuando tiene error
                  aria-invalid={Boolean(erroresCampo.clave) || undefined}
                  // Enlaza el campo con el mensaje de error rojo ubicado justo debajo
                  aria-describedby={erroresCampo.clave ? "ingresar-error-clave" : undefined}
                  // Estilos del campo con borde rojo si hay error y espacio derecho para el boton ojo
                  className={`ingresar-campo ingresar-campo--clave cuerpo-p ${erroresCampo.clave ? "ingresar-campo--error" : ""}`.trim()}
                />
                {/* Boton interactivo para mostrar u ocultar la contrasena sin enviar el formulario */}
                <button
                  // Tipo button explicito para que al pulsarlo NO dispare el submit del formulario
                  type="button"
                  // Clase que posiciona el icono dentro del borde derecho del campo
                  className="ingresar-boton-clave"
                  // Etiqueta accesible traducida desde la API ("Ocultar contrasena" o "Mostrar contrasena")
                  aria-label={
                    mostrarClave
                      ? formulario?.botones?.ocultarClave
                      : formulario?.botones?.mostrarClave
                  }
                  // Informa a lectores de pantalla si la visibilidad esta activada o no
                  aria-pressed={mostrarClave}
                  // Invierte el estado booleano actual (false -> true -> false)
                  onClick={() => setMostrarClave((visible) => !visible)}
                >
                  {/* Dibuja ojo tachado cuando la clave se ve, u ojo abierto cuando esta oculta */}
                  <Icono
                    nombre={mostrarClave ? "ojoTachado" : "ojo"}
                    className="ingresar-boton-clave-icono"
                  />
                </button>
              </div>
              {/* Mensaje de error debajo del campo contrasena en rojo oficial (tipografia detalle-nota) */}
              {erroresCampo.clave && (
                <p id="ingresar-error-clave" className="ingresar-campo-error detalle-nota">
                  {/* Texto de error desde la API */}
                  {erroresCampo.clave}
                </p>
              )}
            </div>

            {/* Fila intermedia: casilla "Mantener la sesion iniciada" y enlace "Olvidaste tu contrasena?" */}
            <div className="ingresar-opciones">
              {/* Etiqueta interactiva que envuelve la casilla para ampliar el area de clic */}
              <label className="ingresar-recordar detalle-nota">
                {/* Casilla de verificacion controlada estilizada al tono verde de Figma */}
                <input
                  // Tipo casilla de verificacion
                  type="checkbox"
                  // Nombre del campo
                  name="mantenerSesion"
                  // Estado booleano controlado por React
                  checked={mantenerSesion}
                  // Actualiza la preferencia local al hacer clic
                  onChange={(evento) => setMantenerSesion(evento.target.checked)}
                  // Clase que personaliza el cuadro verde y la palomita oscura
                  className="ingresar-checkbox"
                />
                {/* Texto "Mantener la sesion iniciada" desde la API */}
                <span>{formulario?.etiquetas?.mantenerSesion}</span>
              </label>

              {/* Enlace subrayado para recuperacion de contrasena */}
              <a
                // Destino de recuperacion
                href="/recuperar"
                // Estilo de enlace subrayado con tipografia detalle-nota-fuerte
                className="ingresar-enlace detalle-nota-fuerte"
                // Navegacion SPA sin recarga
                onClick={(evento) => manejarNavegacion(evento, "/recuperar")}
              >
                {/* Texto "Olvidaste tu contrasena?" desde la API */}
                {formulario?.enlaces?.olvidasteClave}
              </a>
            </div>

            {/* Boton primario: se deshabilita en envio o bloqueo 429 y cambia a "Reintentar" si fallo la red */}
            <button
              // Tipo submit para poder enviar tambien pulsando Enter dentro de cualquier campo
              type="submit"
              // Clases del boton pildora verde mas tipografia cuerpo-p-fuerte
              className="ingresar-boton cuerpo-p-fuerte"
              // Deshabilitado durante el envio POST o mientras corre la cuenta regresiva del 429
              disabled={enviando || estaBloqueado}
              // Informa a lectores de pantalla que la accion esta en curso
              aria-busy={enviando || undefined}
            >
              {/* Si esta enviando mostramos el spinner circular oscuro y "Ingresando..." fiel a Figma */}
              {enviando ? (
                <>
                  {/* Arco circular oscuro giratorio oculto a lectores de pantalla */}
                  <span className="ingresar-spinner" aria-hidden="true" />
                  {/* Texto "Ingresando..." / "Logging in..." desde la API */}
                  <span>{formulario?.mensajes?.ingresando}</span>
                </>
              ) : (
                /* Texto "Ingresar" (o "Reintentar" cuando hubo error de conexion) desde la API */
                etiquetaBotonPrincipal
              )}
            </button>
          </form>

          {/* Pie del formulario con enlace para quienes aun no tienen cuenta */}
          <p className="ingresar-registro detalle-nota">
            {/* Texto "No tienes cuenta?" desde la API */}
            <span>{formulario?.mensajes?.sinCuenta}</span>{" "}
            {/* Enlace hacia la vista de registro (/crear-cuenta) */}
            <a
              // Ruta real hacia crear cuenta
              href="/crear-cuenta"
              // Estilo de enlace subrayado con tipografia detalle-nota-fuerte
              className="ingresar-enlace detalle-nota-fuerte"
              // Navegacion SPA sin recarga
              onClick={(evento) => manejarNavegacion(evento, "/crear-cuenta")}
            >
              {/* Texto "Crea una cuenta" desde la API */}
              {formulario?.enlaces?.crearCuenta}
            </a>
          </p>
        </div>

        {/* Linea legal inferior anclada al pie de la columna izquierda */}
        <footer className="ingresar-pie">
          {/* Derechos de autor con el anio actual usando la clase detalle-nota */}
          <p className="ingresar-derechos detalle-nota">{textoDerechos}</p>
        </footer>
      </div>
      
      {/* --------------------------------------------------- apartado derecho */}
      {/* Columna derecha decorativa: cuadricula 4x2 de portadas y mensaje de bienvenida (visible en escritorio) */}
      <aside className="ingresar-columna-visual" aria-labelledby="ingresar-presentacion-titulo">
        {/* Bloque interno centrado vertical y horizontalmente */}
        <div className="ingresar-visual-contenido">
          {/* Cuadricula decorativa de 8 portadas SVG (oculta a lectores de pantalla) */}
          <div className="ingresar-galeria" aria-hidden="true">
            {/* Recorremos las 8 portadas definidas con tokens oficiales */}
            {PORTADAS_GALERIA.map((item) => (
              // Caja cuadrada redondeada para cada portada
              <div key={item.id} className="ingresar-galeria-item">
                {/* Componente vectorial oficial Portada con patron y colores de Figma */}
                <Portada
                  className="ingresar-galeria-portada"
                  // Numero de patron oficial (0: anillos, 1: rayas, 2: colina, 3: puntos)
                  patron={item.patron}
                  // Paleta de tokens oficiales del sistema de diseno
                  colores={item.colores}
                />
              </div>
            ))}
          </div>

          {/* Titulo promocional derecho enlazado por id al aria-labelledby del aside */}
          <h2 id="ingresar-presentacion-titulo" className="ingresar-presentacion-titulo titular-h2">
            {/* Texto "Tu musica, siempre a mano" desde la API */}
            {presentacion?.titulo}
          </h2>

          {/* Subtitulo descriptivo derecho usando la clase predefinida cuerpo-m */}
          <p className="ingresar-presentacion-texto cuerpo-m">
            {/* Texto "Explora albumes y artistas de todos los generos." desde la API */}
            {presentacion?.texto}
          </p>
        </div>
      </aside>
    </section>
  );
}