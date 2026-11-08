//importo el css que le da estilo al footer
import "./Footer.css";
//importo el icono de sintonia
import Icono from "./Icono.jsx"
//importo el componente modal de preferencias de cookies
import PreferenciasCookies from "./PreferenciasCookies.jsx";
//declaro el componente Footer recibiendo los textos de la api, el idioma actual y onNavegar
export default function Footer({textos, idioma, onNavegar}){
    // extraigo el objeto footer de la API de forma segura
    const pie = textos?.footer;
    //año actual para los derechos de autor
    const anio = new Date().getFullYear();
   
    
    //obtengo el texto de derechos reemplazando la variable anio por el año actual desde la API
    const textoDerechos = pie?.legal?.derechos?.replace("{anio}", anio);
    //obtengo el aviso legal de audio libre desde la API
    const textoAviso = pie?.legal?.nota;

    //funcion interna que incercepta el clic en los enlaces para que react navegue sin recargar toda la web
    function manejarClickEnlace(evento, ruta){
        if(onNavegar){
            evento.preventDefault(); // evitamos la recarga del navegador
            onNavegar(ruta) /// cambiamos la vista
        }
    }

    return(
        <footer className="footer" >
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
                            aria-label={textos?.navbar?.logo?.aria}
                        >
                            <Icono nombre="logo"/>
                            <span className="titular-h3 footer-logo-texto">{textos?.sitio?.nombre?.toLowerCase()}</span>
                        </a>
                        {/* descripcion debajo del logo */}
                        <p className="cuerpo-p footer-lema">
                            {pie?.lema}
                        </p>
                    </div>
                    {/* contenedor de las 3 columnas de navegacion */}
                    <div className="footer-columnas-navegacion">


                            {/* columna 1, explotacion */}
                            <div className="footer-columna">
                                <h3 className="detalle-etiqueta footer-columna-titulo">
                                    {pie?.columnas?.explora?.titulo}
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
                                            {/* lee de la API Inicio */}
                                            {pie?.columnas?.explora?.enlaces?.inicio}
                                        </a>
                                    </li>
                                    {/* segundo enlace - catalogo */}
                                    <li>
                                        <a 
                                            href="/catalogo"
                                            className="cuerpo-p"
                                            onClick={(evento) => manejarClickEnlace(evento, "/catalogo")}
                                        >
                                            {/* lee de la API catalogo */}
                                            {pie?.columnas?.explora?.enlaces?.catalogo}
                                        </a>
                                    </li>
                                </ul>
                            </div>


                            {/* COLUMNA 2 - Tu cuenta */}
                            <div className="footer-columna">
                                {/* titulo de la columna */}
                                <h3 className="detalle-etiqueta footer-columna-titulo">
                                    {pie?.columnas?.cuenta?.titulo}
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
                                            {/* lee de la API el texto */}
                                            {pie?.columnas?.cuenta?.enlaces?.ingresar}
                                        </a>
                                    </li>
                                    {/* segundo enlace - registrarme*/}
                                    <li>
                                        <a 
                                            href="/crear-cuenta"
                                            className="cuerpo-p"
                                            onClick={(evento) => manejarClickEnlace(evento, "/crear-cuenta")}
                                        >
                                            {/* lee el texto de la API */}
                                            {pie?.columnas?.cuenta?.enlaces?.crearCuenta}
                                        </a>
                                    </li>
                                </ul>
                            </div>


                            {/* COLUMNA 3 - soporte */}
                            <div className="footer-columna">
                                {/* titulo de la columna */}
                                <h3 className="detalle-etiqueta footer-columna-titulo">
                                    {pie?.columnas?.legal?.titulo}    
                                </h3>
                                {/* lista de los enlaces legales */}
                                <ul className="footer-lista">
                                    {/* primer enlace - terminos de uso */}
                                    <li>
                                        <a 
                                            href="/terminos"
                                            className="cuerpo-p"
                                            onClick={(evento) => manejarClickEnlace(evento, "/terminos")}
                                        >
                                            {/* texto del enlace */}
                                            {pie?.columnas?.legal?.enlaces?.terminos}
                                        </a>
                                    </li>

                                    {/* segundo enlace - accesibilidad */}
                                    <li>
                                        <a 
                                            href="/accesibilidad"
                                            className="cuerpo-p"
                                            onClick={(evento) => manejarClickEnlace(evento, "/accesibilidad")}
                                        >
                                            {/* texto del enlace de accesibilidad desde la API */}
                                            {pie?.columnas?.legal?.enlaces?.accesibilidad ?? textos?.accesibilidad?.titulo}
                                        </a>
                                    </li>

                                    {/* tercer elemento - boton y modal de preferencias de cookies */}
                                    <li>
                                        <PreferenciasCookies
                                            textos={textos?.cookies?.preferencias}
                                            textoGuardado={textos?.general?.etiquetas?.guardado}
                                            textoError={textos?.errores?.generico}
                                        />
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
