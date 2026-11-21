import { useState, useEffect } from "react";
import { useConsulta } from "./useConsulta.js";

const extraerLista = (respuesta) => respuesta?.datos ?? [];
const extraerAlbumes = (respuesta) => (respuesta?.datos ?? []).slice(0, 6);

function obtenerGeneroDeUrl() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get("genero") || null;
}

// Hook de la vista de catalogo: sincroniza ?genero= con la URL y delega las peticiones a useConsulta
export function useCatalogo() {
  const [generoId, setGeneroId] = useState(obtenerGeneroDeUrl);

  // Sincroniza el filtro cuando el usuario usa Atrás/Adelante o navega internamente en la SPA
  useEffect(() => {
    function alCambiarUrl() {
      setGeneroId(obtenerGeneroDeUrl());
    }

    window.addEventListener("popstate", alCambiarUrl);
    window.addEventListener("sintonia-navegacion", alCambiarUrl);
    return () => {
      window.removeEventListener("popstate", alCambiarUrl);
      window.removeEventListener("sintonia-navegacion", alCambiarUrl);
    };
  }, []);

  function seleccionarGenero(id) {
    // Si se toca el mismo genero activo, se quita el filtro
    const nuevoId = id === generoId ? null : id;
    const nuevaRuta = nuevoId
      ? `/catalogo?genero=${encodeURIComponent(nuevoId)}`
      : "/catalogo";
    window.history.pushState(null, "", nuevaRuta);
    setGeneroId(nuevoId);
  }

  // Los 12 generos se consultan una sola vez al montar la vista
  const consultaGeneros = useConsulta("/generos", {
    valorInicial: [],
    transformar: extraerLista,
  });

  // Solo consulta el detalle cuando hay un genero seleccionado en la URL
  const consultaDetalle = useConsulta(
    generoId ? `/generos/${encodeURIComponent(generoId)}` : null
  );

  // Solo consulta los albumes populares cuando NO hay genero filtrado
  const consultaDestacados = useConsulta(
    generoId ? null : "/albumes?orden=populares&limite=6",
    {
      valorInicial: [],
      transformar: extraerAlbumes,
    }
  );

  function recargar() {
    if (consultaGeneros.error || consultaGeneros.datos.length === 0) {
      consultaGeneros.recargar();
    }
    if (generoId) {
      consultaDetalle.recargar();
    } else {
      consultaDestacados.recargar();
    }
  }

  return {
    generos: consultaGeneros.datos,
    generoId,
    detalleGenero: consultaDetalle.datos,
    albumesDestacados: consultaDestacados.datos,
    cargando:
      consultaGeneros.cargando ||
      (generoId ? consultaDetalle.cargando : consultaDestacados.cargando),
    error:
      consultaGeneros.error ||
      (generoId ? consultaDetalle.error : consultaDestacados.error),
    seleccionarGenero,
    recargar,
  };
}
