import { useConsulta } from "./useConsulta.js";

const extraerLista = (respuesta) => respuesta?.datos ?? [];
const extraerAlbumes = (respuesta) => (respuesta?.datos ?? []).slice(0, 6);

// Hook de la vista de inicio: consulta generos y albumes populares en paralelo via useConsulta
export function useInicio() {
  const consultaGeneros = useConsulta("/generos", {
    valorInicial: [],
    transformar: extraerLista,
  });

  const consultaAlbumes = useConsulta("/albumes?orden=populares&limite=6", {
    valorInicial: [],
    transformar: extraerAlbumes,
  });

  function recargar() {
    consultaGeneros.recargar();
    consultaAlbumes.recargar();
  }

  return {
    generos: consultaGeneros.datos,
    albumes: consultaAlbumes.datos,
    cargando: consultaGeneros.cargando || consultaAlbumes.cargando,
    error: consultaGeneros.error || consultaAlbumes.error,
    recargar,
  };
}
