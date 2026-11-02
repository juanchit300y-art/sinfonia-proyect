// es un hook personalizado para consultar los generos y albumes destacados desde la API
// usa los endpoints de GET /api/v1/generos (lista de todos los 12 géneros disponibles) y GET /api/v1/generos/:id (detalle de género con su lista de álbumes reales)

import { useState, useEffect } from "react";

// direccion base de la API
const API_BASE = import.meta.env.VITE_API_URL;

// lista de IDs de los generos representativos que consultaremos para "suena esta semana"
const GENEROS_DESTACADOS = [
    "gen_indie",
    "gen_pop",
    "gen_electronica",
    "gen_andina",
    "gen_rock",
    "gen_salsa"
];

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
                // consultamos la lista completa de generos
                const respuestaGeneros = await fetch(`${API_BASE}/generos`,{
                    signal: controlador.signal
                });
                
                // si la respuesta no fue exitosa, disparamos error
                if(!respuestaGeneros.ok){
                    throw new Error(`Error HTTP al consultar géneros: ${respuestaGeneros.status}`);
                }

                // parseamos la respuesta a JSON
                const datosGeneros = await respuestaGeneros.json();

                // extraemos el arreglo de generos de la propiedad "datos"
                const listaGeneros = datosGeneros?.datos ?? [];

                // consultamos los detalles de los generos destacados en paralelo usando Promise.all
                const promesasDetalles = GENEROS_DESTACADOS.map(async(idGenero) => {
                    try {
                        const respuestaDetalle = await fetch(`${API_BASE}/generos/${idGenero}`, {
                            signal: controlador.signal
                        });

                        // si falla un genero individual, devolvemos null para no romper todos los demas
                        if (!respuestaDetalle.ok) return null;
                        return await respuestaDetalle.json();
                    } catch {
                        return null;
                    }
                });

                // esperamos a que se terminen todas las consultas de albumes
                const resultadosDetalles = await Promise.all(promesasDetalles);

                // recolectamos los albumes obtenidos en unasola lista
                const listaAlbumes = [];
                for (const detalle of resultadosDetalles){
                    if (detalle && Array.isArray(detalle.albumes)){
                        for(const alb of detalle.albumes){
                            listaAlbumes.push(alb);
                        }
                    }
                }

                // si el componente sigue activo en pantalla, actualizamos el restado
                if (vigente) {
                    setGeneros(listaGeneros);
                    // tomtamos los primeros 6 albumes para la cuadricula
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