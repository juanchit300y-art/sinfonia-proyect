import {useState, useEffect } from "react";

// direccion base de la API con respaldo seguro si no esta definida en el entorno
const API_BASE = import.meta.env.VITE_API_URL || "https://yanethm-sintonia-api.fly.dev/api/v1";

// funcion para leer el id del genero desde la url
function obtenerGeneroDeUrl(){
    // objeto para analizar los parametros de busqeuda de la url actual
    const parametros = new URLSearchParams(window.location.search);
    // extraemos valor asociado a la clave genero
    const id = parametros.get("genero");
    return id || null;
}

// declaramos y exportamos la funcion del hook useCatalogo
export function useCatalogo(){
    // estado react para almacenar el id del genero activo leido de la url
    const [generoId, setGeneroId] = useState(obtenerGeneroDeUrl);
    // estado react para guardar el listado de los 12 generos de la api
    const [generos, setGeneros] = useState([]);
    // estado react para almacenar el objeto de detalle del genero seleccionado
    const [detalleGenero, setDetalleGenero] = useState(null);
    // estado react para guardar los albumes destacados cuando no hay genero activo
    const [albumesDestacados, setAlbumesDestacados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [intento, setIntento] = useState(0);

    // efecto que sincroniza el estado cuando el usuario usa flechas atras o adelante o navega internamente
    useEffect(() => {
        // funcion listener que lee la nueva url tras presionar atras o adelante o navegar en la SPA
        function alCambiarUrl(){
            // actualizamos el estado local con el genero de la nueva url
            setGeneroId(obtenerGeneroDeUrl());
        }

        window.addEventListener("popstate", alCambiarUrl);
        // escuchamos tambien las navegaciones internas disparadas desde App.jsx
        window.addEventListener("sintonia-navegacion", alCambiarUrl);
        // removemos los listeners al desmontar
        return() => {
            window.removeEventListener("popstate", alCambiarUrl);
            window.removeEventListener("sintonia-navegacion", alCambiarUrl);
        };
    }, []);

    // funcion para cambiar de genero actualizando la url sin recargar la pagina
    function seleccionarGenero(id){
        // si se toca el mismo genero que ya estaba activo lo deseleccionamos con null
        const nuevoId = id === generoId ? null : id;
        // construimos la nueva ruta con el query param o limpia si es null
        const nuevaRuta = nuevoId ? `/catalogo?genero=${encodeURIComponent(nuevoId)}`:"/catalogo";
        // actualizamos barra de direcciones en el historial sin recargar la pagina
        window.history.pushState(null, "", nuevaRuta);
        // actualizamos el estado para disparar la carga del nuevo genero
        setGeneroId(nuevoId);
    }

    // funcion para poder reintentar la peticion si hubo un error
    function recargar(){
        setIntento((previo) => previo+1)
    }

    // efecto que realiza las peticiones cada vez que cambia el genero o el intento
    useEffect(() => {
        // instanciamos el controlador para cancelar peticiones pendientes
        const controlador = new AbortController();
        // temporizador de limite 12 segundos para cancelar si no responde
        const limiteTiempo = setTimeout(() => controlador.abort(), 12000);
        // evita modificar estado si el componente se desmontó
        let vigente = true;

        setCargando(true);
        setError(false);

        // funcion asincronica para coordinar las llamadas fetch a la API
        async function cargarDatosCatalogo(){
            // try para capturar cualquier excepcion de red o conexion
            try{
                // peticion fetch para obtener los 12 generos
                const respuestaGeneros = await fetch(`${API_BASE}/generos`, {
                    signal: controlador.signal
                });

                if (!respuestaGeneros.ok){
                    throw new Error(`Error HTTP generos: ${respuestaGeneros.status}`);
                }

                const datosGeneros = await respuestaGeneros.json();
                const listaGeneros = datosGeneros?.datos ?? [];

                let detalle = null; //para guardar el detalle de cada genero
                let listaDestacados = []; //albumes destacados

                if(generoId){ //para comprobar si el usuario tiene un genero activo en la url
                    // consultamos en la api el detalle completo de ese genero
                    const respuestaDetalle = await fetch(`${API_BASE}/generos/${encodeURIComponent(generoId)}`, {
                        signal: controlador.signal
                    });

                    if (respuestaDetalle.ok){
                        detalle = await respuestaDetalle.json();
                    }
                } else { //cuando no hay ningun genero seleccionado en la url
                    // consultamos los 6 albumes destacados directamente del endpoint oficial sin depender de IDs fijos de generos
                    const respuestaAlbumes = await fetch(`${API_BASE}/albumes?orden=populares&limite=6`, {
                        signal: controlador.signal
                    });

                    if (respuestaAlbumes.ok) {
                        const datosAlbumes = await respuestaAlbumes.json();
                        listaDestacados = datosAlbumes?.datos ?? [];
                    }
                }

                if (vigente){ //se verifica que la peticion siga vigente
                    setGeneros(listaGeneros);
                    setDetalleGenero(detalle);
                    setAlbumesDestacados(listaDestacados.slice(0, 6));
                    setCargando(false);
                }
            } catch(err){ //para capturar las excepciones
                if (vigente && err.name !== "AbortError"){ //vigente y sin cancelaciones voluntarias
                    setError(true);
                    setCargando(false);
                }
            } finally {
                clearTimeout(limiteTiempo);
            }
        }

        cargarDatosCatalogo();

        return () => { //retornamos la funcio de limpieza del efecto
            vigente = false,
            controlador.abort();
            clearTimeout(limiteTiempo);
        };
    }, [generoId, intento]); //definimos las dependencias del efecto

    return {
        generos, //lista de generos
        generoId, //genero activo
        detalleGenero, //detalle del genero activo
        albumesDestacados, //lista albumes destacados
        cargando, //booleanos
        error,
        seleccionarGenero, //funcion para seleccionar genero
        recargar //funcion para recargar
    };

}
