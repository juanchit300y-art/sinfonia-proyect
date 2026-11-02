import React from "react";
import Portada from "./Portada.jsx";
import "./SeccionAlbumes.css";

// definimos el componente reutilizable SeccionAlbumes con sus propiedades
export default function SeccionAlbumes({
    idSeccion = "destacados",
    titulo, //de momento para diferenciar entre "suena esta semana" o "albumes destacados"
    enlaceTexto, //texto opcional del enlace de descrubrir mas
    enlaceHref = "/catalogo", //ruta de hacia a donde apuntan, por defecto catalogo
    albumes = [], //lista de albumes a mostrar obtenida desde la API
    cargando = false,
    error = false,
    textoCargando = "Cargando...",
    textoReintentar = "Reintentar",
    onRecargar, //funcion callback para reintenar la peticion en caso de fallo
    onNavegar, //funcion de navegacion para dirigir dentro de la pagina
    onAlbumClick //callback al hacer clic en un album especifico
}) {
    // funcion interna para manejar la navegacion del enlace superior sin recargar la pagina
    function manejarClickEnlace(evento) {
        if (evento) evento.preventDefault();
        if (typeof onNavegar === "function") {
            onNavegar(enlaceHref)
        }
    }

    // funcion interna para capturar el clic o pulsacion de telcado sobre una targeta de album
    function manejarClickTargeta(evento, album) {
        if (evento) evento.preventDefault();
        // si el componente padre definió una accion personalizada para el album la ejecutamos
        if (typeof onAlbumClick === "function") {
            onAlbumClick(album);
            // de lo contrario por defecto navegamos al catalogo
        } else if (typeof onNavegar === "function") {
            onNavegar(enlaceHref)
        }
    }

    // retorno la estructura semantica de la seccion
    return (
        // contenedor de seccion vinculado a su titulo accesible
        <section
            className="seccion-albumes"
            aria-labelledby={`titulo-${idSeccion}`} //atributo ARIA que asocia la seccion con el id de su titulo
        >
            {/* cabecera de la seccion con titulo y enlace de accion */}
            <div className="seccion-albumes-cabecera">
                {/* titulo de la seccion */}
                <h2
                    id={`titulo-${idSeccion}`} //identificador para accesibilidad
                    className="seccion-albumes-titulo titular-h2"
                >
                    {/* renderizamos lo que nos habia llegado como parametro */}
                    {titulo}
                </h2>

                {/* mostrar enlace solo si se dió un texto para el */}
                {enlaceTexto && (
                    // enlace interactivo hacia la vista completa
                    <a
                        href={enlaceHref} //direccion de destino por parametro 
                        className="seccion-albumes-enlace"
                        onClick={manejarClickEnlace}
                    >
                        {/* texto del enlace seguido de una flecha */}
                        {enlaceTexto} &rarr;
                    </a>
                )}
            </div>

            {/* estado de carga accesible visible unicamente mientras se descarga la API */}
            {cargando && albumes.length === 0 && (
                // contendor con atributo aria-live para anunciar cambios a lectores de pantalla
                <div className="seccion-albumes-estado cuerpo-m" aria-live="polite">
                    {/* mensaje de espera */}
                    {textoCargando}
                </div>
            )}

            {/* estadp de errpr cpm eñ boton de reintento si falla la conexion */}

            {error && albumes.length === 0 && (
                <div className="seccion-albumes-estado seccion-albumes-error" role="alert">
                    {/* boton interactivo para reintentar la descarga */}
                    <button
                        type="button"
                        className="seccion-albumes-boton-reintentar"
                        onClick={onRecargar}
                    >
                        {textoReintentar}
                    </button>
                </div>     
            )}

            {/* ---------------------- */}
            {/* cuadricula de targetas de albumes que se dibuja cuando existen albumes */}
            {albumes.length>0 &&(
                // contenedor responsive con cuadricula de targetas
                <div className="seccion-albumes-cuadricula">
                    {/* recorro el arreglo de albumes recibido */}
                    {albumes.map((album) => (
                        // targeta interactiva dle album
                        <article 
                            className="seccion-album-targeta"
                            key={album.id}
                            onClick={(evento) => manejarClickTargeta(evento, album)}
                            role="button"
                            tabIndex={0} //permitir tab
                            // maneja las pulsaciones de teclado para personas sin raton
                            onKeyDown={(evento) => {
                                // Evaluamos si la tecla presionada es Enter o barra espaciadora
                                if (evento.key === "Enter" || evento.key === " ") {
                                    // Disparamos la acción de la tarjeta
                                    manejarClickTargeta(evento, album);
                                }
                            }}
                        >
                            {/* contendor cuadrado con relacion 1 a 1 para la portada */}
                            <div className="seccion-album-portada-caja">
                                {/* componente de portada dibujado con patrones vectoriales */}
                                <Portada 
                                    className="seccion-album-portada-svg"
                                    patron={album.portada?.patron ?? 0}
                                    colores={album.portada?.colores ?? ["portada/1", "portada/2"]}
                                >
                                </Portada>
                            </div>
                            
                            {/* contenedor con la informacion textual del album */}
                            <div className="seccion-album-info">

                                {/* titulo del album */}
                                <h3 className="seccion-album-titulo cuerpo-m-fuerte">
                                    {album.titulo}
                                </h3>

                                {/* nombre del artista o grupo musical*/}
                                <p className="seccion-album-artista cuerpo-p">
                                    {album.artista?.nombre}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}