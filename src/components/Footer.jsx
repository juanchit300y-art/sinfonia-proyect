//importo el css que le da estilo al footer
import "./Footer.css";
//importo el icono de sintonia
import Icono from "./Icono.jsx"
//declaro el componente Footer recibiendo los textos de la api, el idioma actual y onNavegar
export default function Footer({textos, idioma, onNavegar}){
    //true si el idioma esta en ingles, false en español
    const ingles = idioma === "en";
    // extraigo el objeto footer de la API de forma segura
    const pie = textos?.footer;
    // extraigo la seccion del navbar de la API para reutilizar los textos de navegacion
    const nav = textos?.navbar;
    //año actual para los derechos de autor
    const anio = new Date().getFullYear();
   
    
    //obtengo el texto de derechos reemplazando la variable anio por el año actual, lo extraigo desde la API, si esta tarda en responder lo escribo manualmente
    const textoDerechos = pie?.legal?.derechos?.replace("{anio}",anio)??`© ${anio} Sintonía · ${ingles ? "Academic project" : "Proyecto académico"}`;
    //obtengo el aviso legal de audio libre desde la API, si demora tengo su respaldo en ambos idiomas
    const textoAviso = pie?.legal?.aviso?? (ingles 
      ? "Free-use sample audio. Fictional artists and titles." 
      : "Audio de ejemplo de uso libre. Artistas y títulos ficticios.");

    //funcion interna que incercepta el clic en los enlaces para que react navegue sin recargar toda la web
    function manejarClickEnlace(evento, ruta){
        if(onNavegar){
            evento.preventDefault(); // evitamos la recarga del navegador
            onNavegar(ruta) /// cambiamos la vista
        }
    }

    return(
        <footer className="footer" aria-label={pie?.aria ?? (ingles ? "Footer" : "Pie de página")}>
            {/* contenedor centrado con el maximo de la app */}
            <div className="contenedor footer-interior">
                {/* seccion superior, logo y descripcion a la izquierda, y las 3 columnas a la derecha */}
                <div className="footer-principal">
                    {/* columna de la marca - izquierda */}
                    <div className="footer-columna-marca">
                        {/* enlace del logo que te lleva al inicio al hacer clic */}
                        <a
                            href="/"
                            className="footer-logo"
                            onClick={(e) => manejarClickEnlace(e, "/")}
                            aria-label="sintonía"
                        >
                            <Icono nombre="logo"/>
                            <span className="titular-h3 footer-logo-texto">sintonía</span>
                        </a>
                        {/* descripcion debajo del logo */}
                        <p className="cuerpo-p footer-lema">
                            {pie?.lema?? (
                                ingles ? "Albums and artist from all genres, in one place."
                                : "Álbumes y artistas de todos los géneros, en un solo lugar."
                            )}
                        </p>
                    </div>
                    {/* contenedor de las 3 columnas de navegacion */}
                    <div className="footer-columnas-navegacion">


                            {/* columna 1, explotacion */}
                            <div className="footer-columna">
                                <h3 className="detalle-etiqueta footer-columna-titulo">
                                    {textos?.paginas?.inicio?.vacio?.botones?.explorar ?? (ingles? "EXPLORE": "EXPLORA")}
                                </h3>
                                {/* lista de enlaces hacias las vistas 1 y 2, inicio y catalogo */}
                                <ul className="footer-lista">
                                    {/* primer enlace - Inicio */}
                                    <li>
                                        <a 
                                            href="/"
                                            className="cuerpo-p"
                                            onClick={(evento) => manejarClickEnlace(evento, "/")}
                                        >
                                            {/* lee de la API Inicio, si no manual */}
                                            {nav?.enlaces?.conSesion?.inicio ?? (ingles ? "Home" : "Inicio")}
                                        </a>
                                    </li>
                                    {/* segundo enlace - catalogo */}
                                    <li>
                                        <a 
                                            href="/catalogo"
                                            className="cuerpo-p"
                                            onClick={(evento) => manejarClickEnlace(evento, "/catalogo")}
                                        >
                                            {/* lee de la API catalogo, sino manual */}
                                            {nav?.enlaces?.invitado?.descubrir ?? (ingles? "Music catalog": "Catálogo musical")}
                                        </a>
                                    </li>
                                </ul>
                            </div>


                            {/* COLUMNA 2 - Tu cuenta */}
                            <div className="footer-columna">
                                {/* titulo de la columna */}
                                <h3 className="detalle-etiqueta footer-columna-titulo">
                                    {textos?.paginas?.registro?.pasos?.etiquetas?.cuenta ?? (ingles ? "YOUR ACCOUNT" : "TU CUENTA")}
                                </h3>
                                {/* enlaces hacia las vistas de ingresar y crear cuenta */}
                                <ul className="footer-lista">
                                    {/* primer enlace - ingresar */}
                                    <li>
                                        <a 
                                            href="/ingresar"
                                            className="cuerpo-p"
                                            onClick={(evento) => manejarClickEnlace(evento, "/ingresar")}
                                        >
                                            {/* lee de la API el texto, sino manual */}
                                            {nav?.botones?.invitado?.ingresar?? (ingles ? "Log in" : "Iniciar sesión")}
                                        </a>
                                    </li>
                                    {/* segundo enlace - registrarme*/}
                                    <li>
                                        <a 
                                            href="/crear-cuenta"
                                            className="cuerpo-p"
                                            onClick={(evento) => manejarClickEnlace(evento, "/crear-cuenta")}
                                        >
                                            {/* lee el texto de la API, sino manual */}
                                            {nav?.botones?.invitado?.crearCuenta ?? (ingles ? "Sign up" : "Crear cuenta")}
                                        </a>
                                    </li>
                                </ul>
                            </div>


                            {/* COLUMNA 3 - soporte */}
                            <div className="footer-columna">
                                {/* titulo de la columna */}
                                <h3 className="detalle-etiqueta footer-columna-titulo">
                                    {pie?.columnas?.soporte?.titulo ?? "LEGAL"}     
                                </h3>
                                {/* lista de los enlaces - terminos de uso */}
                                <ul className="footer-lista">
                                    <li>
                                        <a 
                                            href="/politica-cookies"
                                            className="cuerpo-p"
                                            onClick={(evento) => manejarClickEnlace(evento, "/politica-cookies")}
                                        >
                                            {/* texto del enlace */}
                                            {pie?.legal?.enlaces?.politicaCookies ?? (ingles ? "Terms of use" : "Términos de uso")}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                    {/* cierre de las 3 columnas */}
                    </div>  
                {/* cierre del bloque principal */}
                </div>
                {/* linea divisora horizontal */}
                <div className="footer-divisor"/>
                {/* franja interior del copyright y aviso */}
                <div className="footer-inferior">
                    <p className="detalle-nota footer-derechos">
                        {textoDerechos}
                    </p>
                    <p className="detalle-nota footer-aviso">
                        {textoAviso}
                    </p>
                {/* cierre del contenedor interior */}
                </div>
            </div>
        </footer>
    );
}   
