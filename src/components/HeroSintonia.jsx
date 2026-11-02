import React from "react";
import CollagePortadas from "./CollagePortadas.jsx";
import "./HeroSintonia.css"

// exportamos el componente HeroSintonia recibiendo los textos de inicioPublico y el total de generos y onNavegar
export default function HeroSintonia({
    textosInicio,
    totalGeneros=0,
    onNavegar,
}) {
    // extraemos el sub-objeto hero y cifras
    const hero = textosInicio?.hero;
    const cifras = textosInicio?.cifras;

    // no creo una funcion para ir a los enlaces porque onNavegar ya soporta enlaces


    // retorno de la estrucutra semantica del hero
    return(
        // seccion principal del hero
        <section className="hero-sintonia" aria-labelledby="titulo-hero">

            {/* columna izquierda con la etiqueta, titulo, descripcion, botones y cifras */}
            <div className="texto-hero">

                {/* pildora superior de la temporda (que se muestra solo si el texto de la API ya cargó) */}
                {hero?.etiquetas?.temporada && (
                    // etiqueta tipo pastilla verde oscura
                    <span className="etiqueta-sintonia">
                        {hero.etiquetas.temporada}
                    </span>
                )}

                {/* titulo principal de la pagina de inicio */}
                <h1 id="titulo-hero">
                    {hero?.titulo}
                </h1>

                {/* parrafo descriptivo debajo del titulo principal */}
                <p>
                    {hero?.subtitulo}
                </p>

                {/* contenedor con los dos botones de llamada a la accion */}
                <div className="grupo-botones">
                    {/* boton primario para ir a crear cuenta */}
                    <button 
                        className="boton-hero boton-hero--primario"
                        type="button"
                        onClick={(evento) => onNavegar?.("/crear-cuenta", evento)}
                    >
                        {hero?.botones?.crearCuentaGratis}
                    </button>

                    {/* enlace con apariencia de boton secundario para ir al catalogo musical */}
                    <a 
                        href="/catalogo" 
                        className="boton-hero boton-hero--secundario"
                        onClick={(evento) => onNavegar?.("/catalogo", evento)}
                    >
                        {hero?.botones?.explorarCatalogo}
                    </a>
                </div>

                {/* lista de definiciones semantica dl para las 3 cifras del hero */}
                <dl className="cifras-sintonia">
                    
                    {/* cifra 1: canciones de uso libre */}
                    <div>
                        <dt>{cifras?.canciones?.valor}</dt>
                        <dd>{cifras?.canciones?.etiqueta}</dd>
                    </div>

                    {/* cifra 2: total de generos disponibles */}
                    <div>
                        <dt>{totalGeneros}</dt>
                        {/* descripcion */}
                        <dd>{cifras?.generos?.etiqueta}</dd>
                    </div>

                    {/* cifra 3 - cortes al navegar */}
                    <div>
                        <dt>{cifras?.cortes?.valor}</dt>
                        <dd>{cifras?.cortes?.etiqueta}</dd>
                    </div>
                </dl>
            </div>

            {/* columna derecha con el collage */}
            <CollagePortadas/>
        </section>
    );
}