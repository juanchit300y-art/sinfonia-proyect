import React from "react";
import {useCatalogo} from "../hooks/useCatalogo.js"; //importacion del hook para el catalogo
// se importan los 4 componentes que forman la vista de catalogo
import SeccionGeneros from "./SeccionGeneros.jsx";
import SeccionArtistas from "./SeccionArtista.jsx";
import SeccionAlbumes from "./SeccionAlbumes.jsx";
import ListaCanciones from "./ListaCanciones.jsx";

import "./CatalogoMusical.css";

// declaramos y exportamos el componente principal de la visa
export default function CatalogoMusical({
    textosCatalogo,
    textosEstados,
    idioma = "es",
    onNavegar
}){
    // textos de estado traducidos desde la API
    const textoCargando = textosEstados?.cargando?.titulo;
    const textoReintentar = textosEstados?.error?.botones?.reintentar;
    // extraemos los estados y funciones del hook useCatalogo
    const{
        generos, //arreglo con los 12 generos musicales de la API
        generoId, // identificador del genero activo en la URL
        detalleGenero, // objeto con todo lo del genero activo
        albumesDestacados, //arreglo de albumes cuando no hay genero seleccionado
        cargando,
        error,
        seleccionarGenero, //funcion para seleccionar o deseleccionar un genero actualizando la URL
        recargar
    // invocamos el hook useCatalogo
    } = useCatalogo();

    // buscamos el genero en la lista general como respaldo inmediato mientras carga el detalle
    const generoEnLista = generos.find((item) => item.id === generoId);
    // determinamos el nombre del genero activo desde el detalle o desde la lista general
    const nombreGeneroActivo = detalleGenero?.nombre ?? generoEnLista?.nombre ?? "";
    // determinamos la descripción del género activo desde el detalle o desde la lista general
    const descripcionGeneroActivo = detalleGenero?.descripcion ?? generoEnLista?.descripcion ?? "";

    // definimos el título principal h1 - si hay género activo usa su nombre, si no el título general del catálogo
    const tituloEncabezado = generoId
        // nombre del género seleccionado en la API
        ? nombreGeneroActivo
        // título general del catálogo desde los textos de la API
        : textosCatalogo?.encabezado?.titulo;

    // definimos el subtítulo del encabezado - si hay género activo usa su descripción, si no el subtítulo general
    const subtituloEncabezado = generoId
        // descripción del género seleccionado en la API
        ? descripcionGeneroActivo
        // subtítulo general del catálogo desde los textos de la API
        : textosCatalogo?.encabezado?.subtitulo;

    // construimos el título dinámico de álbumes del género reemplazando {genero} en la plantilla de la API
    const tituloAlbumesGenero = textosCatalogo?.genero?.albumes?.titulo?.replace(
        // marcador dinámico definido en la API
        "{genero}",
        // nombre real del género activo
        nombreGeneroActivo
    );

    // retornamos la estructura sematica de la vista de catalogo
    return(
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

            {/* seccion de generos musicales siempre visible */}
            <SeccionGeneros
                idSeccion="catalogo-generos"
                titulo={textosCatalogo?.generos?.titulo}
                generos={generos} // lista completa de géneros musicales
                generoActivo={generoId}
                cargando={cargando}
                error={error}
                textoCargando={textoCargando}
                textoReintentar={textoReintentar}
                onRecargar={recargar}
                onNavegar={onNavegar} // callback de navegación general
                // al hacer clic en una tarjeta de género filtramos o quitamos el filtro en la URL
                onGeneroClick={(genero) => seleccionarGenero(genero.id)}
            />

            {/* renderizado condicional - si hay un genero seleccionado mostramos su detalle completo */}
            {generoId ? (
                // fragmento que agrupa las 3 secciones del genero seleccionado
                <>

                    {/* sección de artistas pertenecientes al género seleccionado */}
                    <SeccionArtistas
                        textos={textosCatalogo?.genero?.artistas}
                        // arreglo de artistas del género desde la API
                        artistas={detalleGenero?.artistas}
                        // navega a la ruta de detalle del artista
                        onArtistaClick={(artista) => onNavegar?.(`/artista/${artista.id}`)}
                    />

                    {/* sección de álbumes propios del género seleccionado */}
                    <SeccionAlbumes
                        idSeccion="catalogo-albumes-genero"
                        titulo={tituloAlbumesGenero}
                        albumes={detalleGenero?.albumes}
                        cargando={cargando}
                        error={error}
                        textoCargando={textoCargando}
                        textoReintentar={textoReintentar}
                        onRecargar={recargar}
                        onNavegar={onNavegar}
                        // navega a la ruta de detalle del álbum
                        onAlbumClick={(album) => onNavegar?.(`/album/${album.id}`)}
                    />

                    {/* sección con el ranking de las 5 canciones más escuchadas del género */}
                    <ListaCanciones
                        textos={textosCatalogo?.genero?.canciones}
                        canciones={detalleGenero?.pistas || detalleGenero?.canciones}
                        idioma={idioma}
                        // navega a la ruta de detalle del álbum de la canción
                        onCancionClick={(cancion) => onNavegar?.(cancion.album?.id ? `/album/${cancion.album.id}` : `/album/${cancion.id}`)}
                    />
                </>
            ) :(
                // si no hay género seleccionado mostramos la sección de álbumes destacados

                <SeccionAlbumes
                    idSeccion="catalogo-albumes-destacados"
                    titulo={textosCatalogo?.destacados?.titulo}
                    // aqui irian los enlaces, pero en catalogo la secion de albumes no tiene descubrir mas
                    enlaceTexto={textosCatalogo?.destacados?.enlaces?.descubrirMas}
                    enlaceHref="/catalogo"
                    albumes={albumesDestacados}
                    cargando={cargando}
                    error={error}
                    textoCargando={textoCargando}
                    textoReintentar={textoReintentar}
                    onRecargar={recargar}
                    // función de navegación SPA
                    onNavegar={onNavegar}
                    // navega a la ruta de detalle del álbum destacado
                    onAlbumClick={(album) => onNavegar?.(`/album/${album.id}`)}
                />
            )}
        </section>
    );
}