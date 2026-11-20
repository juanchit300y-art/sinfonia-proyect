// es un hook personalizado para consultar los generos y albumes destacados desde la API
// usa los endpoints oficiales GET /api/v1/generos y GET /api/v1/albumes?orden=populares&limite=6

import { useState, useEffect } from "react";

// direccion base de la API con respaldo seguro si no esta definida en el entorno
const API_BASE = import.meta.env.VITE_API_URL || "https://yanethm-sintonia-api.fly.dev/api/v1";

// funcion del hook exportadora para ser consumida en la vista de inicio
export function useInicio() {
    // estado para almacenar la lista de todos los generos - 12
    const [generos, setGeneros] = useState([]);

    // estado para almacenar los 6 almbumes seleccionados para "suena esta semana"
    const [albumes, setAlbumes] = useState([]);

    // estado booleano que indica si las peticiones aun estan en proceso
    const [cargando, setCargando] = useState(true);

    // estado booleano para registrar si ocurrió algun error en la conexion
    const [error, setError] = useState(false);

    // contador de intentos para permitir recargar los datos manualmente si falla la red
    const [intento, setIntento] = useState(0);

    // efecto que se ejectua al montar el hook o cuando se incrementa "intento"
    useEffect(() => {
        // controlador de cancelacion para abortar peticiones si el usuario cambia de vista
        const controlador = new AbortController();

        // temporizador de 12 segundos, donde si el servidor no responde a tiempo cancelamos
        const limiteTiempo = setTimeout(() => controlador.abort(), 12000);

        // bandera de control para evitar actualizar estado en componentes desmontados
        let vigente = true;

        // marca el inicio de una nueva carga
        setCargando(true);
        setError(false);

        // funcion asincronica interna para coordinar las llamadas a la API
        async function cargarDatosInicio(){
            try {
                // consultamos en paralelo la lista completa de generos y los 6 albumes populares del contrato oficial
                const [respuestaGeneros, respuestaAlbumes] = await Promise.all([
                    fetch(`${API_BASE}/generos`, { signal: controlador.signal }),
                    fetch(`${API_BASE}/albumes?orden=populares&limite=6`, { signal: controlador.signal })
                ]);

                // si falla alguna peticion principal, disparamos error
                if (!respuestaGeneros.ok) {
                    throw new Error(`Error HTTP al consultar géneros: ${respuestaGeneros.status}`);
                }
                if (!respuestaAlbumes.ok) {
                    throw new Error(`Error HTTP al consultar álbumes: ${respuestaAlbumes.status}`);
                }

                // parseamos ambas respuestas JSON en paralelo
                const [datosGeneros, datosAlbumes] = await Promise.all([
                    respuestaGeneros.json(),
                    respuestaAlbumes.json()
                ]);

                // extraemos los arreglos desde la propiedad "datos" de cada respuesta
                const listaGeneros = datosGeneros?.datos ?? [];
                const listaAlbumes = datosAlbumes?.datos ?? [];

                // si el componente sigue activo en pantalla, actualizamos el estado
                if (vigente) {
                    setGeneros(listaGeneros);
                    setAlbumes(listaAlbumes.slice(0, 6));
                }
            } catch (errorPeticion){
                // si la peticion fue abortada intencionalmente por nosotros, no hacemos nada
                if (controlador.signal.aborted) return;

                // si ocurrio algun error de red real y el componente sigue montado, activamos el error
                if(vigente) {
                    console.error("Error al cargar datos de Inicio Público:", errorPeticion);
                    setError(true);
                }
            } finally {
                // simpiamos el temporizador de seguridad
                clearTimeout(limiteTiempo);

                // finalizamos el estado de carga
                if(vigente){
                    setCargando(false);
                }
            }
        }

        // ejecutamos la carga de datos
        cargarDatosInicio();

        // limpieza de react donde cancelamos las peticiones pendientes si el componente se desmonta
        return () => {
            vigente = false;
            clearTimeout(limiteTiempo);
            controlador.abort();
        };
    }, [intento]);

    // retornamos los datos y estados listos para ser consumidos por la vista
    return {
        generos, //arreglo con los 12 generos
        albumes, //arreglo con los 5 almubes para "suena esta semana"
        cargando, //true mientras descarga, false cuando termina
        error, //true si hubo fallo de red
        recargar: () => setIntento((prev) => prev+1) //funcion para reintentar la descarga
    };
}