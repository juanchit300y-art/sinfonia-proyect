import {useTextos} from "./hooks/useTextos.js";
import "./App.css"
import Navbar from "./components/Navbar";
import {useEffect, useState} from "react";
import Footer from "./components/Footer.jsx";

function leerRuta(){
    const ruta = window.location.pathname.replace(/^\//, "");
    return ruta || "descubrir";
}


function App() {
    const [idioma, setIdioma] = useState("es");
    const [activo, setActivo] = useState(leerRuta);
    const [consulta, setConsulta] = useState("");
    const [textoGrande, setTextoGrande] = useState(false);


    const datos = useTextos(idioma);
    console.log(datos);

    const ingles = idioma === "en";
    const titulo =
        activo === "favoritos"
        ? datos.textos?.navbar?.botones?.favoritos
        : datos.textos?.navbar?.enlaces?.[activo];
    
    function navegar(destino) {
        window.history.pushState(null, "", destino);
        setActivo(leerRuta());
    }

    // Sincroniza el estado cuando el usuario usa las flechas Atrás / Adelante del navegador
    useEffect(() => {
        function actualizar(){
            setActivo(leerRuta());
            setConsulta("");
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

    function buscar(valor){
        setConsulta(valor);
        setActivo("heroes");
        //window.history es el que da acceso al hsitorial de la pestaña
        window.history.replaceState(null, "", "#heroes");
    }

    return (
        <div className="sitio">
            <Navbar 
                {...datos} 
                idioma={idioma} 
                cambiarIdioma={setIdioma} 
                activo={activo}
                onBuscar={buscar}
                textoGrande={textoGrande}
                alternarTexto={() => setTextoGrande((valor) => !valor)}
                onNavegar={navegar}
            />
            <main className="contenido contenedor">
                {(activo === "inicio" || activo === "descubrir" || activo === "") && (
                    <section id="inicio" className="seccion">
                        <h2>{ingles ? "Home" : "Inicio"}</h2>
                    </section>
                )}
                {activo === "catalogo" && (
                    <section id="catalogo" className="seccion">
                        <h2>{ingles ? "Catalog" : "Catálogo"}</h2>
                    </section>
                )}
                {activo === "planes" && (
                    <section id="planes" className="seccion">
                        <h2>{datos.textos?.navbar?.enlaces?.invitado?.planes ?? "Planes"}</h2>
                    </section>
                )}
                {(activo === "para-artistas" || activo === "paraArtistas") && (
                    <section id="para-artistas" className="seccion">
                        <h2>{datos.textos?.navbar?.enlaces?.invitado?.paraArtistas ?? "Para artistas"}</h2>
                    </section>
                )}
                {activo === "ayuda" && (
                    <section id="ayuda" className="seccion">
                        <h2>{datos.textos?.navbar?.enlaces?.invitado?.ayuda ?? "Ayuda"}</h2>
                    </section>
                )}
                {activo === "ingresar" && (
                    <section id="ingresar" className="seccion">
                        <h2>{datos.textos?.navbar?.botones?.invitado?.ingresar ?? "Ingresar"}</h2>
                    </section>
                )}
                {(activo === "crear-cuenta" || activo === "crearCuenta") && (
                    <section id="crear-cuenta" className="seccion">
                        <h2>{datos.textos?.navbar?.botones?.invitado?.crearCuenta ?? "Crear cuenta"}</h2>
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