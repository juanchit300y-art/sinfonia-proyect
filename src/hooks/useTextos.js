import { useEffect, useState } from "react";

// direccion base oficial de la API de Sintonia con respaldo automatico si no esta definida en el entorno
const API_BASE = import.meta.env.VITE_API_URL || "https://yanethm-sintonia-api.fly.dev/api/v1";
// endpoint completo para la consulta de textos traducidos
const API = `${API_BASE}/textos`;
const CLAVES_MENU = ["inicio", "catalogo"];

function validarTextos(datos){
    const textos = datos?.textos;
    const nav = textos?.navbar;
    const etiquetas = [
        nav?.logo?.texto,
        nav?.logo?.aria,
        ...CLAVES_MENU.map((clave) => nav?.enlaces?.[clave]),
        nav?.buscador?.placeholder,
        nav?.buscador?.borrar,
        nav?.botones?.invitado?.ingresar,
        nav?.botones?.invitado?.crearCuenta,
        nav?.usuario?.menu,
        nav?.usuario?.tuResumen,
        nav?.usuario?.ajustes,
        nav?.usuario?.estudio,
        nav?.usuario?.cerrarSesion,
        nav?.aria?.navegacion,
        nav?.aria?.idioma,
        nav?.aria?.accesibilidad,
        textos?.menuMovil?.abrir,
        textos?.menuMovil?.cerrar,
    ]

    if (!etiquetas.every((valor) =>typeof valor === "string" && valor.trim())){
        throw new Error("la respuesta no contiene los textos del navbar.")
    }
    return textos;
}

export function useTextos(idioma){
    const [textos, setTextos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [intento, setIntento] = useState(0);

    useEffect (() =>{
        const controlador = new AbortController();
        const limite = setTimeout(() => controlador.abort(), 12000);
        let vigente = true
        setCargando(true);
        setError(false);
        // no seteamos textos a null aqui para evitar que el navbar y los componentes hijos (como accesibilidad)
        // se desmonten bruscamente de la interfaz mientras se reciben los textos del nuevo idioma
        // setTextos(null);

        async function cargarTextosNavbar(){
            try{
                const respuesta = await fetch(`${API}?idioma=${idioma}`,{
                    signal: controlador.signal,
                });
                if(!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
                //si si respondio los datos correctamente
                const datos = await respuesta.json();
                const nuevosTextos = validarTextos(datos);
                if(vigente) setTextos(nuevosTextos);

            }catch(errorConsulta){
                if (vigente){
                    console.error("Error al cargar los textos:", errorConsulta);
                    setError(true);
                }
            }finally{
                clearTimeout(limite);
                if (vigente) setCargando(false);
            }
        }

        cargarTextosNavbar();
        return () => {
            vigente = false;
            clearTimeout(limite);
            controlador.abort();
        };

    },[idioma, intento]);

    return {
        textos, 
        cargando, 
        error, 
        recargar: () => setIntento((valor) => valor + 1),
    }
}