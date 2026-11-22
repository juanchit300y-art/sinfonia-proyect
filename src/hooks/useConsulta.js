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

  // Refs para evitar bucles infinitos en useEffect cuando se pasan funciones o valores inline (ej. [] o flechas)
  const transformarRef = useRef(transformar);
  transformarRef.current = transformar;

  const valorInicialRef = useRef(valorInicial);
  valorInicialRef.current = valorInicial;

  // Serializamos headers para re-ejecutar solo si cambian realmente sus claves/valores
  const claveHeaders = headers ? JSON.stringify(headers) : "";

  const [datos, setDatos] = useState(valorInicial);
  const [cargando, setCargando] = useState(debeConsultar);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);
  // Clave de la ultima consulta completada para evitar parpadeos de estado vacio o datos viejos al cambiar ruta/intento
  const [claveResuelta, setClaveResuelta] = useState(null);

  const claveConsulta = debeConsultar
    ? `${ruta}|${claveHeaders}|${intento}`
    : null;

  useEffect(() => {
    if (!debeConsultar) {
      setCargando(false);
      setError(null);
      setClaveResuelta(null);
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
          setClaveResuelta(claveConsulta);
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
  }, [ruta, debeConsultar, conservarDatosPrevios, timeoutMs, claveHeaders, intento, claveConsulta]);

  function recargar() {
    setIntento((valor) => valor + 1);
  }

  // Mientras la nueva claveConsulta aun no haya terminado, reportamos carga activa sin esperar al siguiente render
  const consultaPendiente = Boolean(debeConsultar && claveConsulta !== claveResuelta);
  const cargandoActual = Boolean(debeConsultar && (cargando || consultaPendiente));
  const errorActual = consultaPendiente ? null : error;
  const datosActuales =
    consultaPendiente && !conservarDatosPrevios ? valorInicial : datos;

  return {
    datos: datosActuales,
    cargando: cargandoActual,
    error: errorActual,
    recargar,
  };
}
