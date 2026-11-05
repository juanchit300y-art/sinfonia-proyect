import {useTextos} from "./hooks/useTextos.js";
import {useInicio} from "./hooks/useInicio.js"

import "./App.css"
import {useEffect, useState} from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer.jsx";

// importo la vista completa de inicio publico
import InicioPublico from "./components/InicioPublico.jsx";
import BannerCookies from "./components/BannerCookies.jsx";
import CatalogoMusical from "./components/CatalogoMusical.jsx";

function leerRuta(){
    // extraemos la ruta sin la barra inicial y tomamos el primer segmento para soportar subrutas como /album/:id o /artista/:id
    const ruta = window.location.pathname.replace(/^\//, "").split("/")[0];
    return ruta || "inicio";
}

// funcion para leer el valor de la cookie por su nombre
function leerCookieApp(nombre) {
    // buscamos con expresión regular la cookie deseada dentro de document.cookie
    const coincidencia = document.cookie.match(new RegExp("(^|;\\s*)" + nombre + "=([^;]*)"));
    // si la encontramos devolvemos su valor decodificado, si no devolvemos null
    return coincidencia ? decodeURIComponent(coincidencia[2]) : null;
}

// declaramos la función para determinar el idioma inicial al cargar la página
function obtenerIdiomaInicial() {
    // leemos el estado de consentimiento de cookies guardado previamente
    const consentimiento = leerCookieApp("consentimiento");
    // verificamos si el usuario aceptó explícitamente las cookies
    if (consentimiento === "aceptado") {
        // leemos la cookie donde se guardó la preferencia de idioma
        const guardado = leerCookieApp("idioma");
        // si la cookie es válida (es o en) la retornamos como idioma activo
        if (guardado === "es" || guardado === "en") return guardado;
    }
    // si no ha aceptado cookies o no hay valor guardado, iniciamos en español por defecto
    return "es";
}

function App() {
    // hace que inicie con el idioma guardado en la cookie si hay consentimiento
    const [idioma, setIdioma] = useState(obtenerIdiomaInicial);
    const [activo, setActivo] = useState(leerRuta);

    const datos = useTextos(idioma);
    const { generos, albumes, cargando, error, recargar } = useInicio();

    const ingles = idioma === "en";
    
    // funcion para cambiar de idioma y sincronizarlo con las cookies
    function cambiarIdiomaSeguro(nuevoIdioma) {
        // actualizamos inmediatamente el estado en React para cambiar los textos
        setIdioma(nuevoIdioma);
        // leemos si el usuario tiene aceptadas las cookies en este momento
        const consentimiento = leerCookieApp("consentimiento");
        // evaluamos si el usuario dio consentimiento
        if (consentimiento === "aceptado") {
            // calculamos la fecha de expiración para 1 año en el futuro
            const expira = new Date(Date.now() + 365 * 864e5).toUTCString();
            // guardamos la cookie de idioma en el navegador
            document.cookie = `idioma=${nuevoIdioma}; expires=${expira}; path=/; SameSite=Lax`;
        } else {
            // si las rechazó, eliminamos cualquier cookie de idioma previa
            document.cookie = "idioma=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
        }
    }



    // le agrego la variable opcional de evento para no repetir la funcion de manejarClickEnlace en todos los componentes
    function navegar(destino, evento) {
        if (evento) evento.preventDefault(); // Si viene de un clic en <a>, evita recargar la página aquí mismo
        window.history.pushState(null, "", destino);
        setActivo(leerRuta());
        // emitimos un evento personalizado para que hooks como useCatalogo sincronicen los query params (?genero=...)
        window.dispatchEvent(new CustomEvent("sintonia-navegacion"));
    }


    // Sincroniza el estado cuando el usuario usa las flechas Atrás / Adelante del navegador
    useEffect(() => {
        function actualizar(){
            setActivo(leerRuta());
        }
        window.addEventListener("popstate", actualizar);
        return () => window.removeEventListener("popstate", actualizar);
    }, []);

    useEffect(() => {
        document.documentElement.lang = idioma;
    },[idioma])

    return (
        <div className="sitio">
            <Navbar 
                {...datos} 
                idioma={idioma} 
                cambiarIdioma={cambiarIdiomaSeguro} 
                activo={activo}
                onNavegar={navegar}
            />
            <main className="contenido contenedor">
                {/* vista de inicio */}
                {(activo === "inicio" || activo === "descubrir" || activo === "") && (
                    <InicioPublico
                        // Pasamos el subobjeto con todos los textos de inicio
                        textosInicio={datos.textos?.paginas?.inicioPublico}
                        // Pasamos los textos de estados (cargando / error / reintentar) de la API
                        textosEstados={datos.textos?.estados}
                        // Pasamos los álbumes descargados de la API
                        albumes={albumes}
                        // Pasamos los géneros descargados de la API
                        generos={generos}
                        // Pasamos el estado de carga
                        cargando={cargando}
                        // Pasamos el estado de error
                        error={error}
                        // Pasamos la función de reintento
                        onRecargar={recargar}
                        // Pasamos la función de navegación SPA
                        onNavegar={navegar}
                    />
                )}

                {/* vista del catalogo */}
                {activo === "catalogo" && (
                    <CatalogoMusical
                        textosCatalogo={datos.textos?.paginas?.catalogo}
                        textosEstados={datos.textos?.estados}
                        idioma={idioma}
                        onNavegar={navegar}
                    />
                )}

                {/* vista de detalle de album (Sprint 2) */}
                {activo === "album" && (
                    <section id="album" className="seccion">
                        <h1 className="titular-h1">{datos.textos?.general?.tipos?.album ?? (ingles ? "Album" : "Álbum")}</h1>
                    </section>
                )}

                {/* vista de detalle de artista (Sprint 2) */}
                {activo === "artista" && (
                    <section id="artista" className="seccion">
                        <h1 className="titular-h1">{datos.textos?.general?.tipos?.artista ?? (ingles ? "Artist" : "Artista")}</h1>
                    </section>
                )}

                {/* vista para iniciar sesion */}
                {activo === "ingresar" && (
                    <section id="ingresar" className="seccion">
                        <h1 className="titular-h1">{datos.textos?.navbar?.botones?.invitado?.ingresar ?? (ingles ? "Log in" : "Ingresar")}</h1>
                    </section>
                )}

                {/* vista para crear cuenta */}
                {(activo === "crear-cuenta" || activo === "crearCuenta") && (
                    <section id="crear-cuenta" className="seccion">
                        <h1 className="titular-h1">{datos.textos?.navbar?.botones?.invitado?.crearCuenta ?? (ingles ? "Sign up" : "Crear cuenta")}</h1>
                    </section>
                )}

                {/* vista de terminos legales del footer */}
                {activo === "terminos" && (
                <section id="terminos" className="seccion">
                    <h1 className="titular-h1">{datos.textos?.footer?.columnas?.legal?.enlaces?.terminos ?? (ingles ? "Terms of use" : "Términos de uso")}</h1>
                </section>
                )}

                {/* vista de declaracion de accesibilidad */}
                {activo === "accesibilidad" && (
                    <section id="accesibilidad" className="seccion">
                        <h1 className="titular-h1">{datos.textos?.accesibilidad?.enlaces?.declaracion ?? (ingles ? "Accessibility statement" : "Declaración de accesibilidad")}</h1>
                    </section>
                )}

            </main>
            <BannerCookies
                textos={datos.textos?.cookies?.banner}

                // callback qeu se ejecuta cuando el usuario preciona aceptar o rechazar
                onConsentimiento={(decision) => {
                    // evaluamos si el usuario eligió aceptar las cookies
                    if (decision === "aceptado") {
                        // calculamos la fecha de expiración para 1 año
                        const expira = new Date(Date.now() + 365 * 864e5).toUTCString();
                        // guardamos el idioma activo en la cookie oficial idioma
                        document.cookie = `idioma=${idioma}; expires=${expira}; path=/; SameSite=Lax`;
                    }
                }}
            />
            <Footer
                textos={datos.textos}
                idioma={idioma}
                onNavegar={navegar}
            />
        </div>
    )
}

export default App;