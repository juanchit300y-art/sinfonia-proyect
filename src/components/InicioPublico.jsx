import React from "react";

import HeroSintonia  from "./HeroSintonia";
import SeccionAlbumes from "./SeccionAlbumes";
import SeccionGeneros from "./SeccionGeneros";
import BannerCta from "./BannerCta";

// definimos y exportamos el componente de la pagina de inicio principal
export default function InicioPublico({
    textosInicio,
    textosEstados,
    albumes = [],
    generos = [],
    cargando = false,
    error = false,
    onRecargar,
    onNavegar
}) {
    // tomo los primeros 8 generos para mostrarlos en el inicio
    const generosInicio = generos.slice(0, 8);
    // textos de estado traducidos desde la API
    const textoCargando = textosEstados?.cargando?.titulo;
    const textoReintentar = textosEstados?.error?.botones?.reintentar;
    
    return(
        // seccion principal contenedora
        <section id="inicio" className="seccion inicio-publico">

            {/* hero con titulo, botones de accion, cifras y collage */}
            <HeroSintonia
                textosInicio={textosInicio}
                totalGeneros={generos.length}
                onNavegar={onNavegar}
            />

            {/* suena esta semana */}
            <SeccionAlbumes
                titulo={textosInicio?.destacados?.titulo}
                enlaceTexto={textosInicio?.destacados?.enlaces?.descubrirMas}
                enlaceHref="/catalogo"
                albumes={albumes}
                cargando={cargando}
                error={error}
                textoCargando={textoCargando}
                textoReintentar={textoReintentar}
                onRecargar={onRecargar}
                onNavegar={onNavegar}
            />

            {/* explora por genero */}
            <SeccionGeneros
                titulo={textosInicio?.generos?.titulo}
                enlaceTexto={textosInicio?.generos?.enlaces?.verCatalogo}
                enlaceHref="/catalogo"
                generos={generosInicio}
                cargando={cargando}
                error={error}
                textoCargando={textoCargando}
                textoReintentar={textoReintentar}
                onRecargar={onRecargar}
                onNavegar={onNavegar}
            />

            {/* banner cta para registrarse */}
            <BannerCta
                textos={textosInicio?.cta}
                onNavegar={onNavegar}
            />
        </section>
    )
}
