import React from "react";
import "./BannerCta.css";
export default function BannerCta({
    textos, //objeto con los textos del CTA
    onNavegar,
}){
    const titulo = textos?.titulo //titulo principal del banner
    const descripcion = textos?.texto  //descripcion secundaria
    const textoBoton = textos?.botones?.crearCuentaGratis //boton para crear cuenta

    return(
        // seccion semantica
        <section className="banner-cta" aria-labelledby="titulo-banner-cta">
            {/* contenedor interior con el diseño visual de la targeta */}
            <div className="banner-cta-caja">
                {/* columna de texto a la izquierda */}
                <div className="banner-cta-textos">

                    {/* titulo de la targeta */}
                    <h2 id="titulo-banner-cta" className="banner-cta-titulo">
                        {titulo}
                    </h2>

                    {/* parrafo explicativo debajo del titulo */}
                    <p className="banner-cta-descripcion">
                        {descripcion}
                    </p>
                </div>

                {/* boton interactivo de llamado a la accion */}
                <button 
                    className="banner-cta-boton"
                    type="button"
                    onClick={(evento) => onNavegar?.("/crear-cuenta", evento)}
                >
                    {textoBoton}
                </button>
            </div>
        </section>
    );
}