import { useEffect, useRef, useState } from "react";
import { ErrorApi, peticionApi } from "../services/api.js";

/**
 * Hook generico para consultas GET a la API.
 * Centraliza AbortController, tiempo limite, transformacion opcional y recarga manual.
 */
export function useConsulta(ruta, opciones = {}) {
  const {
    activa = true,
    valorInicial = null,
    conservarDatosPrevios = false,
    transformar = null,
    headers = undefined,
    // 20 s por defecto para cubrir el limite maximo de 15000 ms de X-Simular-Latencia
    timeoutMs = 20000,
  } = opciones;

  const debeConsultar = Boolean(activa && ruta);

  const [datos, setDatos] = useState(valorInicial);
  const [cargando, setCargando] = useState(debeConsultar);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  // Refs para evitar bucles infinitos en useEffect cuando se pasan funciones o valores inline (ej. [] o flechas)
  const transformarRef = useRef(transformar);
  transformarRef.current = transformar;

  const valorInicialRef = useRef(valorInicial);
  valorInicialRef.current = valorInicial;

  // Serializamos headers para re-ejecutar solo si cambian realmente sus claves/valores
  const claveHeaders = headers ? JSON.stringify(headers) : "";

  useEffect(() => {
    if (!debeConsultar) {
      setCargando(false);
      setError(null);
      if (!conservarDatosPrevios) {
        setDatos(valorInicialRef.current);
      }
      return;
    }

    const controlador = new AbortController();
    let canceladoPorTimeout = false;
    let vigente = true;

    const temporizador = setTimeout(() => {
      canceladoPorTimeout = true;
      controlador.abort();
    }, timeoutMs);

    setCargando(true);
    setError(null);
    if (!conservarDatosPrevios) {
      setDatos(valorInicialRef.current);
    }

    async function ejecutar() {
      try {
        const cabecerasParseadas = claveHeaders ? JSON.parse(claveHeaders) : undefined;
        const respuesta = await peticionApi(ruta, {
          metodo: "GET",
          headers: cabecerasParseadas,
          signal: controlador.signal,
        });

        const resultado = transformarRef.current
          ? transformarRef.current(respuesta)
          : respuesta;

        if (vigente) {
          setDatos(resultado);
        }
      } catch (err) {
        if (!vigente) return;

        // Ignoramos abortos voluntarios (cambio de ruta/genero o desmontaje del componente)
        if (err?.name === "AbortError" && !canceladoPorTimeout) {
          return;
        }

        if (canceladoPorTimeout) {
          setError(
            new ErrorApi({
              status: 0,
              codigo: "sin_conexion",
              mensaje: "La petición tardó demasiado en responder.",
              esRed: true,
            })
          );
        } else {
          setError(err);
        }
      } finally {
        clearTimeout(temporizador);
        if (vigente) {
          setCargando(false);
        }
      }
    }

    ejecutar();

    return () => {
      vigente = false;
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [ruta, debeConsultar, conservarDatosPrevios, timeoutMs, claveHeaders, intento]);

  function recargar() {
    setIntento((valor) => valor + 1);
  }

  return { datos, cargando, error, recargar };
}
