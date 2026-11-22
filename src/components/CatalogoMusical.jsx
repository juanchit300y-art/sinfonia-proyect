import React from "react";
import { useCatalogo } from "../hooks/useCatalogo.js"; // importacion del hook para el catalogo
// se importan los 4 componentes de contenido que forman la vista de catalogo
import SeccionGeneros from "./SeccionGeneros.jsx";
import SeccionArtistas from "./SeccionArtista.jsx";
import SeccionAlbumes from "./SeccionAlbumes.jsx";
import ListaCanciones from "./ListaCanciones.jsx";
// se importan los componentes reutilizables de estados (carga, vacio, error y 404)
import EstadoCarga from "./EstadoCarga.jsx";
import EstadoError from "./EstadoError.jsx";
import EstadoVacio from "./EstadoVacio.jsx";
import NoEncontrado from "./NoEncontrado.jsx";

import "./CatalogoMusical.css";

// declaramos y exportamos el componente principal de la vista
export default function CatalogoMusical({
    textosCatalogo,
    textosEstados,
    textosErrores,
    idioma = "es",
    onNavegar
}){
    // extraemos los estados granulares y funciones del hook useCatalogo
    const {
        generos, // arreglo con los 12 generos musicales de la API
        generoId, // identificador del genero activo en la URL
        detalleGenero, // objeto con todo lo del genero activo
        albumesDestacados, // arreglo de albumes cuando no hay genero seleccionado
        cargandoGeneros, // indicador de carga exclusivo de la grilla de generos
        errorGeneros, // error exclusivo de la grilla de generos
        cargandoContenido, // indicador de carga del bloque inferior (genero o destacados)
        errorContenido, // error del bloque inferior (genero o destacados)
        seleccionarGenero, // funcion para seleccionar o deseleccionar un genero actualizando la URL
        recargar, // reintenta toda la vista
        recargarGeneros, // reintenta solo GET /generos
        recargarContenido // reintenta solo el bloque inferior
    } = useCatalogo();

    // detectamos si la URL apunta a un genero inexistente (404 no_encontrado)
    const esGeneroNoEncontrado = Boolean(
        generoId &&
        (errorContenido?.status === 404 || errorContenido?.codigo === "no_encontrado")
    );

    // si el genero de la URL no existe en la API mostramos la vista dedicada 404
    if (esGeneroNoEncontrado) {
        return (
            <NoEncontrado
                titulo={textosEstados?.noEncontrado?.titulo}
                descripcion={textosEstados?.noEncontrado?.descripcion}
                textoBoton={textosEstados?.noEncontrado?.botones?.irAlInicio}
                destinoBoton="/"
                onNavegar={onNavegar}
            />
        );
    }

    // buscamos el genero en la lista general como respaldo inmediato mientras carga el detalle
    const generoEnLista = generos.find((item) => item.id === generoId);
    // determinamos el nombre del genero activo desde el detalle o desde la lista general
    const nombreGeneroActivo = detalleGenero?.nombre ?? generoEnLista?.nombre ?? "";
    // determinamos la descripcion del genero activo desde el detalle o desde la lista general
    const descripcionGeneroActivo = detalleGenero?.descripcion ?? generoEnLista?.descripcion ?? "";

    // definimos el titulo principal h1: si hay genero activo y ya conocemos su nombre lo usamos, si no el titulo general
    const tituloEncabezado =
        generoId && nombreGeneroActivo
            ? nombreGeneroActivo
            : textosCatalogo?.encabezado?.titulo;

    // definimos el subtitulo del encabezado con respaldo seguro mientras carga
    const subtituloEncabezado =
        generoId && descripcionGeneroActivo
            ? descripcionGeneroActivo
            : textosCatalogo?.encabezado?.subtitulo;

    // construimos el titulo dinamico de albumes del genero reemplazando {genero} en la plantilla de la API
    const tituloAlbumesGenero = textosCatalogo?.genero?.albumes?.titulo?.replace(
        "{genero}",
        nombreGeneroActivo
    );

    // detectamos fallo total simultaneo (generos + contenido) para mostrar una sola tarjeta de error unificada
    const hayErrorTotal = Boolean(
        !cargandoGeneros &&
        !cargandoContenido &&
        errorGeneros &&
        generos.length === 0 &&
        errorContenido &&
        !detalleGenero &&
        albumesDestacados.length === 0
    );

    // extraemos de forma segura las listas del genero activo para evaluar contenido o estado vacio
    const artistasGenero = Array.isArray(detalleGenero?.artistas)
        ? detalleGenero.artistas
        : [];
    const albumesGenero = Array.isArray(detalleGenero?.albumes)
        ? detalleGenero.albumes
        : [];
    const cancionesGenero = Array.isArray(detalleGenero?.pistas)
        ? detalleGenero.pistas
        : Array.isArray(detalleGenero?.canciones)
            ? detalleGenero.canciones
            : [];
    // verificamos si el genero respondio completamente vacio (sin artistas, albumes ni canciones)
    const esGeneroCompletamenteVacio = Boolean(
        generoId &&
        detalleGenero &&
        artistasGenero.length === 0 &&
        albumesGenero.length === 0 &&
        cancionesGenero.length === 0
    );

    // retornamos la estructura semantica de la vista de catalogo
    return (
        // contenedor principal con el id="catalogo" para activar las reglas responsivas de generos
        <section id="catalogo" className="seccion catalogo-musical" aria-labelledby="catalogo-titulo-principal">

            {/* encabezado superior de la vista con titulo dinamico y subtitulo */}
            <header className="catalogo-encabezado">

                {/* titulo principal con id vinculado a aria-labelledby */}
                <h1 id="catalogo-titulo-principal" className="catalogo-titulo titular-h1">
                    {tituloEncabezado}
                </h1>

                {/* parrafo descriptivo debajo del titulo */}
                <p className="catalogo-subtitulo cuerpo-m">
                    {subtituloEncabezado}
                </p>
            </header>

            {/* si fallaron a la vez los generos y el contenido mostramos un solo error con reintento general */}
            {hayErrorTotal ? (
                <EstadoError
                    error={errorGeneros}
                    textosEstados={textosEstados}
                    textosErrores={textosErrores}
                    onReintentar={recargar}
                />
            ) : (
                <>
                    {/* seccion de generos musicales siempre visible con sus propios estados */}
                    <SeccionGeneros
                        idSeccion="catalogo-generos"
                        titulo={textosCatalogo?.generos?.titulo}
                        generos={generos} // lista completa de generos musicales
                        generoActivo={generoId}
                        cargando={cargandoGeneros}
                        error={errorGeneros}
                        textosEstados={textosEstados}
                        textosErrores={textosErrores}
                        cantidadEsqueletos={12}
                        onRecargar={recargarGeneros}
                        onNavegar={onNavegar} // callback de navegacion general
                        // al hacer clic en una tarjeta de genero filtramos o quitamos el filtro en la URL
                        onGeneroClick={(genero) => seleccionarGenero(genero.id)}
                    />

                    {/* renderizado condicional: si hay un genero seleccionado mostramos su detalle con estados */}
                    {generoId ? (
                        cargandoContenido && !detalleGenero ? (
                            // esqueleto unificado del detalle de genero mientras responde GET /generos/:id
                            <EstadoCarga
                                variante="detalleGenero"
                                textoAria={textosEstados?.cargando?.aria}
                                textoTitulo={textosEstados?.cargando?.titulo}
                            />
                        ) : errorContenido && !detalleGenero ? (
                            // tarjeta de error aislada al bloque de detalle del genero (conserva la grilla de generos arriba)
                            <EstadoError
                                error={errorContenido}
                                textosEstados={textosEstados}
                                textosErrores={textosErrores}
                                onReintentar={recargarContenido}
                            />
                        ) : esGeneroCompletamenteVacio ? (
                            // estado vacio traducido desde textos.paginas.catalogo.vacio cuando el genero no tiene lanzamientos
                            <EstadoVacio
                                titulo={textosCatalogo?.vacio?.titulo ?? textosEstados?.vacio?.generico}
                                descripcion={textosCatalogo?.vacio?.texto}
                            />
                        ) : detalleGenero ? (
                            // fragmento que agrupa las 3 secciones del genero seleccionado
                            <>
                                {/* seccion de artistas pertenecientes al genero seleccionado */}
                                <SeccionArtistas
                                    textos={textosCatalogo?.genero?.artistas}
                                    artistas={artistasGenero}
                                    onArtistaClick={(artista) => onNavegar?.(`/artista/${artista.id}`)}
                                />

                                {/* seccion de albumes propios del genero seleccionado (muestra EstadoVacio si albumes viene []) */}
                                <SeccionAlbumes
                                    idSeccion="catalogo-albumes-genero"
                                    titulo={tituloAlbumesGenero}
                                    albumes={albumesGenero}
                                    cargando={false}
                                    error={null}
                                    textosEstados={textosEstados}
                                    textosErrores={textosErrores}
                                    textoVacioTitulo={textosCatalogo?.vacio?.titulo}
                                    textoVacioDescripcion={textosCatalogo?.vacio?.texto}
                                    onRecargar={recargarContenido}
                                    onNavegar={onNavegar}
                                    onAlbumClick={(album) => onNavegar?.(`/albumes/${encodeURIComponent(album.id)}`)}
                                />

                                {/* seccion con el ranking de las canciones mas escuchadas del genero */}
                                <ListaCanciones
                                    textos={textosCatalogo?.genero?.canciones}
                                    canciones={cancionesGenero}
                                    idioma={idioma}
                                    onCancionClick={(cancion) => {
                                        if (cancion.album?.id) {
                                            onNavegar?.(`/albumes/${encodeURIComponent(cancion.album.id)}`);
                                        }
                                    }}
                                />
                            </>
                        ) : null
                    ) : (
                        // si no hay genero seleccionado mostramos la seccion de albumes destacados con sus estados
                        <SeccionAlbumes
                            idSeccion="catalogo-albumes-destacados"
                            titulo={textosCatalogo?.destacados?.titulo}
                            enlaceTexto={textosCatalogo?.destacados?.enlaces?.descubrirMas}
                            enlaceHref="/catalogo"
                            albumes={albumesDestacados}
                            cargando={cargandoContenido}
                            error={errorContenido}
                            textosEstados={textosEstados}
                            textosErrores={textosErrores}
                            onRecargar={recargarContenido}
                            onNavegar={onNavegar}
                            onAlbumClick={(album) => onNavegar?.(`/albumes/${encodeURIComponent(album.id)}`)}
                        />
                    )}
                </>
            )}
        </section>
    );
}