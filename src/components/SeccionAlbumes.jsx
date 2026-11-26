import React from "react";
// Importamos el componente reutilizable de tarjeta individual de album
import TarjetaAlbum from "./TarjetaAlbum.jsx";
import EstadoCarga from "./EstadoCarga.jsx";
import EstadoError from "./EstadoError.jsx";
import EstadoVacio from "./EstadoVacio.jsx";
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
    textosEstados, // subobjeto textos.estados de la API para carga, vacio y error
    textosErrores, // subobjeto textos.errores de la API para mensajes por codigo
    textoVacioTitulo = "", // titulo especifico de vacio (ej. textos.paginas.catalogo.vacio.titulo)
    textoVacioDescripcion = "", // descripcion especifica de vacio (ej. textos.paginas.catalogo.vacio.texto)
    cantidadEsqueletos = 6, // cantidad de tarjetas esqueleto mientras carga
    textoCargando = "",
    textoReintentar = "",
    onRecargar, //funcion callback para reintenar la peticion en caso de fallo
    onNavegar, //funcion de navegacion para dirigir dentro de la pagina
    onAlbumClick //callback al hacer clic en un album especifico
}) {
    // normalizamos el arreglo para soportar de forma segura null o undefined sin errores
    const listaAlbumes = Array.isArray(albumes) ? albumes : [];

    // funcion interna para manejar la navegacion del enlace superior sin recargar la pagina
    function manejarClickEnlace(evento) {
        if (evento) evento.preventDefault();
        if (typeof onNavegar === "function") {
            onNavegar(enlaceHref)
        }
    }

    // retorno la estructura semantica de la seccion
    return (
        // contenedor de seccion vinculado a su titulo accesible
        <section
            id={idSeccion}
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

            {/* esqueleto accesible de carga visible unicamente mientras se descarga la API */}
            {cargando && listaAlbumes.length === 0 && (
                <EstadoCarga
                    variante="albumes"
                    cantidad={cantidadEsqueletos}
                    textoAria={textosEstados?.cargando?.aria}
                    textoTitulo={textosEstados?.cargando?.titulo ?? textoCargando}
                />
            )}

            {/* tarjeta de error recuperable con boton de reintento si falla la peticion */}
            {!cargando && error && listaAlbumes.length === 0 && (
                <EstadoError
                    error={error}
                    textosEstados={textosEstados}
                    textosErrores={textosErrores}
                    textoReintentar={textoReintentar}
                    onReintentar={onRecargar}
                />
            )}

            {/* estado vacio cuando la API respondio sin errores pero la lista de albumes esta vacia */}
            {!cargando && !error && listaAlbumes.length === 0 && (
                <EstadoVacio
                    titulo={textoVacioTitulo || textosEstados?.vacio?.generico}
                    descripcion={textoVacioDescripcion}
                />
            )}

            {/* ---------------------- */}
            {/* cuadricula de tarjetas de albumes que se dibuja cuando existen albumes */}
            {listaAlbumes.length > 0 && (
                // contenedor responsive con cuadricula de tarjetas
                <div className="seccion-albumes-cuadricula">
                    {/* recorro el arreglo de albumes recibido usando la tarjeta reutilizable */}
                    {listaAlbumes.map((album) => (
                        // componente reutilizable TarjetaAlbum con enlace semantico a /albumes/:id
                        <TarjetaAlbum
                            // clave unica de React por identificador de album
                            key={album.id}
                            // objeto completo del album recibido desde la API
                            album={album}
                            // callback personalizado del padre si fue provisto
                            onClick={onAlbumClick}
                            // funcion SPA de navegacion como respaldo directo al detalle
                            onNavegar={onNavegar}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}