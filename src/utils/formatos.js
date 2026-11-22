// Utilitarios puros de formato para duraciones, fechas sin zona horaria y cifras.
// Se evita deliberadamente new Date() para fechas ISO "YYYY-MM-DD" para que nunca se corran de dia por UTC.

const MESES_POR_IDIOMA = {
  es: [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

// Convierte una cantidad de segundos (ej. 70) en formato "m:ss" (ej. "1:10")
export function formatearDuracion(duracionSeg) {
  const total = Number(duracionSeg);
  if (!Number.isFinite(total) || total < 0) return "0:00";
  const enteros = Math.floor(total);
  const minutos = Math.floor(enteros / 60);
  const segundos = enteros % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}

// Formatea la duracion total del album usando las plantillas traducidas de la API
export function formatearDuracionTotal(duracionSeg, textosAlbum, textosGeneral) {
  const total = Number(duracionSeg);
  if (!Number.isFinite(total) || total <= 0) return "";

  const totalMinutos = Math.max(1, Math.round(total / 60));

  if (totalMinutos >= 60) {
    const horas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;
    const plantillaHoras = textosGeneral?.formatos?.duracionHorasMinutos;
    if (plantillaHoras) {
      return plantillaHoras
        .replace("{horas}", String(horas))
        .replace("{minutos}", String(minutosRestantes));
    }
  }

  const plantillaMin = textosAlbum?.encabezado?.duracion ?? textosGeneral?.formatos?.minutos;
  return plantillaMin
    ? plantillaMin.replace("{minutos}", String(totalMinutos))
    : `${totalMinutos} min`;
}

// Extrae el anio "YYYY" directamente de la cadena "YYYY-MM-DD" sin pasar por new Date()
export function extraerAnio(fechaIso) {
  if (typeof fechaIso !== "string") return "";
  const partes = fechaIso.trim().split("-");
  return partes[0] || "";
}

// Formatea "2025-10-06" en fecha legible sin pasar por new Date() (evita desfases en UTC-5)
export function formatearFechaLarga(fechaIso, idioma = "es") {
  if (typeof fechaIso !== "string") return "";
  const [anioStr, mesStr, diaStr] = fechaIso.trim().split("-");
  const mesIndice = Number.parseInt(mesStr, 10) - 1;
  const dia = Number.parseInt(diaStr, 10);

  if (!anioStr || !Number.isFinite(mesIndice) || !Number.isFinite(dia)) {
    return fechaIso;
  }

  const listaMeses = MESES_POR_IDIOMA[idioma] ?? MESES_POR_IDIOMA.es;
  const nombreMes = listaMeses[mesIndice];
  if (!nombreMes) return fechaIso;

  return idioma === "en"
    ? `${nombreMes} ${dia}, ${anioStr}`
    : `${dia} de ${nombreMes} de ${anioStr}`;
}

// Formatea cantidades grandes de reproducciones con separador de miles segun idioma
export function formatearReproducciones(cantidad, idioma = "es") {
  const valor = Number(cantidad);
  if (!Number.isFinite(valor)) return "";
  const locale = idioma === "en" ? "en-US" : "es-CO";
  return new Intl.NumberFormat(locale).format(valor);
}

// Traduce el tipo de lanzamiento ("album", "ep", "sencillo", "enVivo") desde los textos de la API
export function obtenerEtiquetaTipo(tipo, textosAlbum, textosGeneral) {
  if (!tipo) return "";
  return (
    textosAlbum?.encabezado?.etiquetas?.tipo?.[tipo] ??
    textosGeneral?.tipos?.[tipo] ??
    tipo
  );
}
