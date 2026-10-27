import {useTextos} from "./hooks/useTextos.js";
import "./App.css"
import Navbar from "./components/Navbar";
import {useEffect, useState} from "react";
import Footer from "./components/Footer.jsx";

function leerRuta(){
    const ruta = window.location.pathname.replace(/^\//, "");
    return ruta || "inicio";
}

function App() {
    const [idioma, setIdioma] = useState("es");
    const [activo, setActivo] = useState(leerRuta);
    const [textoGrande, setTextoGrande] = useState(false);

    const datos = useTextos(idioma);
    console.log(datos);

    const ingles = idioma === "en";
    
    function navegar(destino) {
        window.history.pushState(null, "", destino);
        setActivo(leerRuta());
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

    useEffect(() => {
        document.documentElement.style.fontSize = textoGrande ? "112%" : "";
        return () => {document.documentElement.style.fontSize = ""}
    },[textoGrande])

    return (
        <div className="sitio">
            <Navbar 
                {...datos} 
                idioma={idioma} 
                cambiarIdioma={setIdioma} 
                activo={activo}
                textoGrande={textoGrande}
                alternarTexto={() => setTextoGrande((valor) => !valor)}
                onNavegar={navegar}
            />
            <main className="contenido contenedor">
                {/* vista de inicio */}
                {(activo === "inicio" || activo === "descubrir" || activo === "") && (
                    <section id="inicio" className="seccion">
                        <h2>{datos.textos?.navbar?.enlaces?.inicio ?? (ingles ? "Home" : "Inicio")}</h2>
                    </section>
                )}

                {/* vista del catalogo */}
                {activo === "catalogo" && (
                    <section id="catalogo" className="seccion">
                        <h2>{datos.textos?.navbar?.enlaces?.catalogo ?? (ingles ? "Catalog" : "Catálogo")}</h2>
                    </section>
                )}

                {/* vista para inisiar sesion*/}
                {activo === "ingresar" && (
                    <section id="ingresar" className="seccion">
                        <h2>{datos.textos?.navbar?.botones?.invitado?.ingresar ?? "Ingresar"}</h2>
                    </section>
                )}

                {/* vista para crear cuenta */}
                {(activo === "crear-cuenta" || activo === "crearCuenta") && (
                    <section id="crear-cuenta" className="seccion">
                        <h2>{datos.textos?.navbar?.botones?.invitado?.crearCuenta ?? "Crear cuenta"}</h2>
                    </section>
                )}

                {/* vista de terminos legales del footer */}
                {activo === "terminos" && (
                <section id="terminos" className="seccion">
                    <h2>{datos.textos?.footer?.columnas?.legal?.enlaces?.terminos ?? (ingles ? "Terms of use" : "Términos de uso")}</h2>
                </section>
                )}

            </main>
            <Footer
                textos={datos.textos}
                idioma={idioma}
                onNavegar={navegar}
            />
        </div>
    )
}

export default App;