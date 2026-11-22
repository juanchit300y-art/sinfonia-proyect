import { useState, useEffect } from "react";
import { useConsulta } from "./useConsulta.js";

const LISTA_VACIA = [];
const extraerLista = (respuesta) => respuesta?.datos ?? LISTA_VACIA;
const extraerAlbumes = (respuesta) => (respuesta?.datos ?? LISTA_VACIA).slice(0, 6);

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
    // Conservamos otros query params activos (ej. simularLatencia o simularError para pruebas)
    const parametros = new URLSearchParams(window.location.search);
    if (nuevoId) {
      parametros.set("genero", nuevoId);
    } else {
      parametros.delete("genero");
    }
    const consulta = parametros.toString();
    const nuevaRuta = consulta ? `/catalogo?${consulta}` : "/catalogo";
    window.history.pushState({ interno: true }, "", nuevaRuta);
    setGeneroId(nuevoId);
  }

  // Los 12 generos se consultan una sola vez al montar la vista
  const consultaGeneros = useConsulta("/generos", {
    valorInicial: LISTA_VACIA,
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
      valorInicial: LISTA_VACIA,
      transformar: extraerAlbumes,
    }
  );

  // Estados independientes del bloque de contenido (detalle del genero activo o destacados)
  const cargandoContenido = generoId
    ? consultaDetalle.cargando
    : consultaDestacados.cargando;
  const errorContenido = generoId
    ? consultaDetalle.error
    : consultaDestacados.error;

  // Reintenta exclusivamente la consulta de generos
  function recargarGeneros() {
    consultaGeneros.recargar();
  }

  // Reintenta exclusivamente el contenido principal (genero activo o albumes destacados)
  function recargarContenido() {
    if (generoId) {
      consultaDetalle.recargar();
    } else {
      consultaDestacados.recargar();
    }
  }

  // Reintenta toda la vista (generos si fallaron o estan vacios + contenido actual)
  function recargar() {
    if (consultaGeneros.error || consultaGeneros.datos.length === 0) {
      consultaGeneros.recargar();
    }
    recargarContenido();
  }

  return {
    generos: consultaGeneros.datos,
    generoId,
    detalleGenero: consultaDetalle.datos,
    albumesDestacados: consultaDestacados.datos,
    // Estados combinados (compatibilidad)
    cargando: consultaGeneros.cargando || cargandoContenido,
    error: consultaGeneros.error || errorContenido,
    // Estados granulares para aislar carga/error entre generos y contenido
    cargandoGeneros: consultaGeneros.cargando,
    errorGeneros: consultaGeneros.error,
    cargandoContenido,
    errorContenido,
    seleccionarGenero,
    recargar,
    recargarGeneros,
    recargarContenido,
  };
}
