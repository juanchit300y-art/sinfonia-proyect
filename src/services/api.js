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

  const cabeceras = { ...headers };
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

    throw new ErrorApi({
      status: respuesta.status,
      codigo: datos?.error?.codigo ?? "error_interno",
      mensaje: datos?.error?.mensaje ?? `Error HTTP ${respuesta.status}`,
      campos: datos?.error?.campos ?? null,
      retryAfter: Number.isFinite(retrySegundos) ? retrySegundos : null,
      esRed: false,
    });
  }

  return datos;
}
