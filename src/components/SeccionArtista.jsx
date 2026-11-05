import React from "react";
import "./SeccionArtista.css";

const COLORES_AVATAR = [ //paleta de colores para los avatares de artistas
    // color verde azulado turquesa
    "var(--portada-3)",
    // color fucsia o rosa intenso
    "var(--portada-5)",
    // color violeta suave
    "var(--portada-1)",
    // color amarillo dorado
    "var(--portada-4)",
    // color azul celeste
    "var(--portada-6)",
    // color coral o naranja rojizo
    "var(--portada-2)"
];

// declaramos y exportamos el componente SeccionArtistas
export default function SeccionArtistas({
    textos, //subobjeto con las traducciones de la api
    artistas = [],
    onArtistaClick
}) {
    const titulo = textos?.titulo;
    const etiqueta = textos?.etiqueta;

    // si no hy lista de artistas retorno null para no pintar nada en pantalla
    if (!artistas || artistas.length === 0){
        return null;
    }

    return(
        // elemento section para agrupar los artistas
        <section className="seccion-artistas" aria-labelledby="titulo-seccion-artistas">
            
            {/* titulo de la seccion para agrupar los artistas*/}
            <h2 id="titulo-seccion-artistas" className="seccion-artistas-titulo titular-h2">
                {titulo}
            </h2>

            {/* contenedor con las targetas circulares de artistas */}
            <div className="seccion-artistas-lista">
                {/* iteramos cada artista del arreglo de la API */}
                {artistas.map((artista, indice) =>{
                    // asignamos un token de color ciclico segun al posicion
                    const colorFondo = COLORES_AVATAR[indice % COLORES_AVATAR.length];
                    // retornamos la targeta de cada artista
                    return(
                        <article 
                            className="seccion-artista-tarjeta"
                            key={artista.id || indice}
                            role="button"
                            tabIndex={0}
                            onClick={() => onArtistaClick?.(artista)}
                            onKeyDown={(e) => {
                                // activamos tambien con Enter o Espacio para accesibilidad de teclado
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onArtistaClick?.(artista);
                                }
                            }}
                        >
                            {/* avatar circular con color del token asignado */}
                            <div 
                                className="seccion-artista-avatar"
                                style={{backgroundColor:colorFondo}} //estilo en linea con color correspondiente
                                aria-hidden="true"
                            >
                            </div>

                            {/* nombre del artista en negrita */}
                            <h3 className="seccion-artista-nombre cuerpo-m-fuerte">
                                {artista.nombre}
                            </h3>

                            {/* etiqueta de rol del artista*/}
                            <span className="seccion-artista-rol cuerpo-p">
                                {etiqueta}
                            </span>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
