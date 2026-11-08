import React, {useState, useEffect} from "react";
import "./BannerCookies.css";

// nombre oficial de la cookie
const NOMBRE_COOKIE = "consentimiento";

// funcion para leer una cookie del navegador por su nombre
function leerCookie(nombre){
    // buscamos la cookie mediante expresión regular
    const coincidencia = document.cookie.match(new RegExp("(^|;\\s*)" + nombre + "=([^;]*)"));
    // si existe devolvemos su valor decodificado, de lo contrario null
    return coincidencia ? decodeURIComponent(coincidencia[2]) : null;
}

// funcion para guardar una cookie en el navegador con duracion de 1 año
function guardarCookie(nombre, valor) {
    // calculamos la fecha de expiración para 365 días en el futuro
    const expira = new Date(Date.now() + 365 * 864e5).toUTCString();
    // escribimos la cookie con ruta global y política de seguridad SameSite
    document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${expira}; path=/; SameSite=Lax`;
}

// definimos y exportamos el componente del BannerCookies
export default function BannerCokies({
    textos, //subobjeto cookies.banner desde la API
    onConsentimiento, //callback opcional para avisarle a App cuando el usuario decide
}){
    // estado local para saber si el banner debe mostrarse o permanecer oculto
    const [visible, setVisible] = useState(false);

    // efecto para consultar si el usuario ya aceptó o rechazó las cookies anteriormente
    useEffect(() => {
        // leemos la cookie real de consentimiento
        const decisionGuardada = leerCookie(NOMBRE_COOKIE);

        // si no existe desicion previa, activamos la visibilidad del banner
        if(!decisionGuardada){
            setVisible(true);
        }

        // escuchamos si el usuario guardo sus preferencias desde el modal de PreferenciasCookies
        function sincronizarConModal(evento) {
            // ocultamos el banner inferior porque ya tomo una decision en el modal
            setVisible(false);
            // avisamos a App.jsx la decision tomada
            if (typeof onConsentimiento === "function" && evento.detail) {
                onConsentimiento(evento.detail);
            }
        }
        // registramos el oyente en window
        window.addEventListener("sintonia-consentimiento-actualizado", sincronizarConModal);
        // limpiamos el oyente al desmontar
        return () => window.removeEventListener("sintonia-consentimiento-actualizado", sincronizarConModal);
    },[]);

    // funcion que procesa la respuesta del usuario (aceptar o rechazar)
    function responder(decision){
        // guarda la decisión en la cookie real "consentimiento"
        guardarCookie(NOMBRE_COOKIE, decision);
        // sincronizamos tambien el detalle de categorias en localStorage para PreferenciasCookies y Accesibilidad
        try {
            // activamos las categorias opcionales solo si acepto
            const activar = decision === "aceptado";
            // guardamos el estado de las 4 categorias
            localStorage.setItem(
                "sintonia-consentimiento-categorias",
                JSON.stringify({
                    necesarias: true,
                    preferencias: activar,
                    analiticas: activar,
                    marketing: activar,
                })
            );
            // si rechazo, eliminamos cualquier dato previo de accesibilidad o idioma
            if (!activar) {
                // borramos accesibilidad de localStorage
                localStorage.removeItem("sintonia_accesibilidad");
                // expiramos la cookie de accesibilidad
                document.cookie = "accesibilidad=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
                // expiramos la cookie de idioma
                document.cookie = "idioma=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
            }
        } catch {
            // ignoramos errores de almacenamiento
        }
        // notificamos globalmente a Accesibilidad y PreferenciasCookies el cambio de consentimiento
        window.dispatchEvent(new CustomEvent("sintonia-consentimiento-actualizado", { detail: decision }));
        // avisa al componente padre App para que sincoronice el idioma
        if(typeof onConsentimiento === "function"){
            onConsentimiento(decision);
        }
        // ocultamos el banner en la interfaz
        setVisible(false);
    }

    // si ya se tomó una deisicion o aun está verificando no renderizamos nada del DOM
    if (!visible){
        return null;
    }

    // obtenemos los textos desde la API con respaldo entre texto y descripcion
    const titulo = textos?.titulo;
    const descripcion = textos?.texto ?? textos?.descripcion;
    const botonRechazar = textos?.botones?.rechazar;
    const botonAceptar = textos?.botones?.aceptar;

    return(
        // etiqueta semantica aside con rol accesible
        <aside 
            className="banner-cookies"
            role="region"
            aria-label={titulo}
        >
            {/* targeta flotante interior centrada */}
            <div className="banner-cookies-caja">

                {/* columna con los textos informativos */}
                <div className="banner-cookies-textos">
                    
                    {/* titulo en negrita */}
                    <h2 className="banner-cookies-titulo">
                        {titulo}
                    </h2>

                    {/* parrafo con la politica de cookies */}
                    <p className="banner-cookies-descripcion">
                        {descripcion}
                    </p>
                </div>
                
                {/* contenedor de los dos botones de desicion */}
                <div className="banner-cookies-botones">

                    {/* boton de rechazar cookies */}
                    <button 
                        className="banner-cookies-boton banner-cookies-boton--rechazar"
                        type="button"
                        onClick={() => responder("rechazado")}
                    >
                        {botonRechazar}
                    </button>

                    {/* boton de aceptar cookies */}
                    <button 
                        className="banner-cookies-boton banner-cookies-boton--aceptar"
                        type="button"
                        onClick={()=> responder("aceptado")}
                    >
                        {botonAceptar}
                    </button>
                </div>
            </div>
        </aside>
    );
}