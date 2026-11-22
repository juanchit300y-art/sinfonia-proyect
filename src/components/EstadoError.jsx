// Importamos el componente reutilizable de pastillas para indicar el tipo o codigo de fallo
import Etiqueta from "./Etiqueta.jsx";
// Importamos los iconos vectoriales del sistema de diseno
import Icono from "./Icono.jsx";
// Importamos la hoja de estilos concisa del estado de error
import "./EstadoError.css";

// Funcion auxiliar que resuelve el mensaje traducido desde textos.errores o textos.estados sin quemar texto
function resolverMensajeError(error, textosEstados, textosErrores, esSinConexion) {
  // Si el fallo es de red o sin internet, usamos la descripcion general de error de carga
  if (esSinConexion) {
    // Preferimos la descripcion general de error de carga o el error generico de la API
    return textosEstados?.error?.descripcion ?? textosErrores?.generico ?? "";
  }

  // Buscamos si la API devolvio un codigo semantico (ej. "falla_simulada", "error_interno", "demasiadas_peticiones")
  const codigo = error?.codigo;
  // Consultamos la traduccion exacta del codigo en el diccionario textos.errores
  const mensajePorCodigo = codigo ? textosErrores?.[codigo] : null;

  // Si existe una traduccion especifica para ese codigo la preparamos
  if (mensajePorCodigo) {
    // Si es 429 con Retry-After, sustituimos el marcador {segundos} con los segundos reales
    if (error?.retryAfter && mensajePorCodigo.includes("{segundos}")) {
      // Reemplazamos el marcador dinamico recibido de la API
      return mensajePorCodigo.replace("{segundos}", String(error.retryAfter));
    }
    // Devolvemos la traduccion directa del codigo de error
    return mensajePorCodigo;
  }

  // Como respaldo usamos la descripcion del estado de error o el error generico de textos.errores
  return textosEstados?.error?.descripcion ?? textosErrores?.generico ?? "";
}

// Declaramos y exportamos el componente reutilizable EstadoError para fallos recuperables (500, 503, red)
export default function EstadoError({
  // Instancia de ErrorApi (o booleano verdadero) con status, codigo, esRed y retryAfter
  error,
  // Subobjeto textos.estados descargado desde GET /api/v1/textos
  textosEstados,
  // Subobjeto textos.errores descargado desde GET /api/v1/textos
  textosErrores,
  // Texto opcional de respaldo para el boton si el padre paso un prop directo
  textoReintentar = "",
  // Funcion callback que reintenta la peticion fallida (ej. recargar del hook useConsulta)
  onReintentar,
  // Nivel semantico del encabezado ("h1" | "h2" | "h3") segun la vista donde se muestre
  nivelTitulo = "h3",
  // Clase CSS opcional adicional enviada por el componente padre
  className = "",
}) {
  // Detectamos si el error corresponde a falta de red, sin internet o tiempo agotado
  const esSinConexion = Boolean(
    // Revisamos tanto la bandera booleana esRed como el codigo semantico sin_conexion
    error?.esRed || error?.codigo === "sin_conexion"
  );

  // Determinamos la etiqueta de la pastilla roja: "Sin conexion" si no hay red, o el numero HTTP (ej. 503)
  const textoPastilla = esSinConexion
    ? textosEstados?.sinConexion?.etiqueta ?? ""
    : typeof error?.status === "number" && error.status >= 400
      ? String(error.status)
      : "";

  // Resolvemos el titulo traducido segun sea error de red o fallo del servidor
  const titulo = esSinConexion
    ? textosEstados?.sinConexion?.titulo ?? textosEstados?.error?.titulo ?? ""
    : textosEstados?.error?.titulo ?? "";

  // Resolvemos la descripcion traducida consultando textos.errores[codigo] y textos.estados
  const descripcion = resolverMensajeError(
    // Objeto de error recibido
    error,
    // Diccionario de estados traducidos
    textosEstados,
    // Diccionario de errores traducidos por codigo
    textosErrores,
    // Indicador de fallo de red
    esSinConexion
  );

  // Resolvemos el texto del boton de reintento desde los textos oficiales de la API
  const etiquetaBoton = esSinConexion
    ? textosEstados?.sinConexion?.botones?.reintentar ??
      textosEstados?.error?.botones?.reintentar ??
      textoReintentar
    : textosEstados?.error?.botones?.reintentar ?? textoReintentar;

  // Seleccionamos la etiqueta de encabezado correcta para respetar la accesibilidad de cada vista
  const EtiquetaTitulo =
    nivelTitulo === "h1" ? "h1" : nivelTitulo === "h2" ? "h2" : "h3";

  // Combinamos la clase base con cualquier clase adicional
  const clases = `estado-error ${className}`.trim();

  // Retornamos la tarjeta accesible de alerta con boton de reintento real
  return (
    // Region de alerta que anuncia de inmediato el fallo a lectores de pantalla
    <div className={clases} role="alert">
      {/* Medallon circular con tono rojo suave del sistema de diseno */}
      <div className="estado-error-icono" aria-hidden="true">
        {/* Mostramos icono de sin conexion o de alerta segun la causa */}
        <Icono nombre={esSinConexion ? "sinConexion" : "alerta"} />
      </div>

      {/* Pastilla opcional con la variante oficial "error" de Etiqueta */}
      {textoPastilla && (
        // Pastilla informativa roja (ej. "503" o "Sin conexion")
        <Etiqueta variante="error">{textoPastilla}</Etiqueta>
      )}

      {/* Titulo principal del fallo reutilizando la clase predefinida titular-h3 */}
      {titulo && (
        <EtiquetaTitulo className="estado-error-titulo titular-h3">
          {/* Texto traducido (ej. "Algo salio mal" o "No hay conexion a internet") */}
          {titulo}
        </EtiquetaTitulo>
      )}

      {/* Descripcion traducida reutilizando la clase predefinida cuerpo-p */}
      {descripcion && (
        <p className="estado-error-descripcion cuerpo-p">
          {/* Mensaje especifico de textos.errores[codigo] o descripcion general */}
          {descripcion}
        </p>
      )}

      {/* Boton de reintento real visible cuando existe manejador y texto traducido */}
      {typeof onReintentar === "function" && etiquetaBoton && (
        // Boton accesible reutilizando la clase predefinida cuerpo-p-fuerte
        <button
          // Tipo button explicito
          type="button"
          // Estilos del boton de reintento mas tipografia predefinida
          className="estado-error-boton cuerpo-p-fuerte"
          // Vuelve a disparar la consulta fallida via useConsulta.recargar()
          onClick={onReintentar}
        >
          {/* Icono vectorial de recarga */}
          <Icono nombre="reintentar" className="estado-error-boton-icono" />
          {/* Etiqueta "Reintentar" / "Try again" desde la API */}
          <span>{etiquetaBoton}</span>
        </button>
      )}
    </div>
  );
}
