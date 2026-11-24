// URL base centralizada para toda la aplicacion (con respaldo a la API oficial si falta .env)
export const API_BASE =
  import.meta.env.VITE_API_URL || "https://yanethm-sintonia-api.fly.dev/api/v1";

// Error estructurado para distinguir fallos HTTP (401, 404, 422, 429, 503...) y falta de red
export class ErrorApi extends Error {
  constructor({
    status = 0,
    codigo = "error_interno",
    mensaje = "Error inesperado",
    campos = null,
    retryAfter = null,
    esRed = false,
  }) {
    super(mensaje);
    this.name = "ErrorApi";
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
    this.retryAfter = retryAfter;
    this.esRed = esRed;
  }
}

// Lee parametros opcionales de simulacion en la URL (?simularLatencia=2000&simularError=503)
// y los traduce a las cabeceras oficiales X-Simular-Latencia y X-Simular-Error de la API.
function obtenerCabecerasSimulacion(ruta) {
  // En entornos sin window o al pedir /textos no inyectamos simulacion para mantener la interfaz traducida
  if (typeof window === "undefined" || !ruta || ruta.includes("/textos")) {
    return {};
  }

  // Consultamos los parametros query actuales de la barra de direcciones
  const parametros = new URLSearchParams(window.location.search);
  const cabecerasSimulacion = {};

  // Si existe ?simularLatencia= con milisegundos enteros positivos, agregamos X-Simular-Latencia
  const latencia = parametros.get("simularLatencia");
  if (latencia && /^\d+$/.test(latencia)) {
    cabecerasSimulacion["X-Simular-Latencia"] = latencia;
  }

  // Si existe ?simularError= con codigo HTTP de 3 digitos (ej. 500 o 503), agregamos X-Simular-Error
  const errorSimulado = parametros.get("simularError");
  if (errorSimulado && /^\d{3}$/.test(errorSimulado)) {
    cabecerasSimulacion["X-Simular-Error"] = errorSimulado;
  }

  return cabecerasSimulacion;
}

/**
 * Cliente HTTP base para cualquier peticion (GET, POST, DELETE, etc.) a la API de Sintonia.
 * Usar directamente en eventos (onSubmit/onClick) o mediante el hook useConsulta para lecturas GET.
 */
export async function peticionApi(ruta, opciones = {}) {
  const {
    metodo = "GET",
    cuerpo = undefined,
    headers = {},
    signal = undefined,
  } = opciones;

  const url = ruta.startsWith("http")
    ? ruta
    : `${API_BASE}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;

  // Combinamos cabeceras de simulacion (si las hay en la URL) con las cabeceras explicitas del llamador
  const cabeceras = { ...obtenerCabecerasSimulacion(ruta), ...headers };
  if (cuerpo !== undefined && !cabeceras["Content-Type"]) {
    cabeceras["Content-Type"] = "application/json";
  }

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      // Necesario para que el navegador guarde y envie la cookie httpOnly "sesion"
      credentials: "include",
      signal,
    });
  } catch (errorRed) {
    // Si la peticion fue abortada voluntariamente por AbortController, la relanzamos sin envolverla
    if (errorRed?.name === "AbortError") {
      throw errorRed;
    }
    throw new ErrorApi({
      status: 0,
      codigo: "sin_conexion",
      mensaje: "No se pudo conectar con el servidor.",
      esRed: true,
    });
  }

  // Respuestas sin cuerpo (ej. 204 No Content en DELETE /sesion)
  if (respuesta.status === 204) {
    return null;
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    // Cabecera Retry-After usada por la API en respuestas 429 demasiadas_peticiones
    const retryHeader = respuesta.headers.get("Retry-After");
    const retrySegundos = retryHeader ? Number.parseInt(retryHeader, 10) : null;
    // Codigo semantico de error devuelto por la API en el cuerpo JSON
    const codigoError = datos?.error?.codigo ?? "error_interno";

    // Si una ruta privada (distinta a consultar/crear /sesion) responde 401 no_autenticado, avisamos a useSesion
    const rutaSinQuery = ruta.split("?")[0];
    const esConsultaSesion = rutaSinQuery === "/sesion" || rutaSinQuery.endsWith("/sesion");
    if (
      typeof window !== "undefined" &&
      respuesta.status === 401 &&
      codigoError === "no_autenticado" &&
      !esConsultaSesion
    ) {
      // Disparamos el evento global para que useSesion limpie el usuario y redirija a /ingresar
      window.dispatchEvent(new CustomEvent("sintonia-no-autenticado"));
    }

    throw new ErrorApi({
      status: respuesta.status,
      codigo: codigoError,
      mensaje: datos?.error?.mensaje ?? `Error HTTP ${respuesta.status}`,
      campos: datos?.error?.campos ?? null,
      retryAfter: Number.isFinite(retrySegundos) ? retrySegundos : null,
      esRed: false,
    });
  }

  return datos;
}
