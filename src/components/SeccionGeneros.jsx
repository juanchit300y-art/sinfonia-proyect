import React from "react";
import Portada, { resolverColor } from "./Portada.jsx";
import "./SeccionGeneros.css";

// definimos y exportamos el componente reutilizable SeccionGeneros
export default function SeccionGeneros({
    idSeccion = "generos",
    titulo, // explora por genero(inicio), explorar por genero(catalogo)
    enlaceTexto, //enlace opcional porque en inicio hay ver catalogo, pero en catalogo no lo tiene
    enlaceHref = "/catalogo",
    generos = [],
    generoActivo = null, //id del genero actualmente seleccionado como filtro
    cargando = false,
    error = false,
    textoCargando = "Cargando...",
    textoReintentar = "Reintentar",
    onRecargar,
    onNavegar,
    onGeneroClick //funcion para manejar la seleccion de un genero especifico
}){
    // manejador para el clic en el enlace superior derecho de ver catalogo
    function manejarClickEnlace(evento){
        if(evento) evento.preventDefault(); // se previene que el navegador recargue toda la pagina
        // si tengo funcion onNavegar la uso
        if(typeof onNavegar === "function"){
            onNavegar(enlaceHref)
        }
    }

    // manejador para el clic sobre una targeta de genero
    function manejarClickGenero(evento, genero){
        if (evento) evento.preventDefault();

        // si la vista envia un manejador personalizado lo usamos
        if(typeof onGeneroClick === "function"){
            onGeneroClick(genero);
        
        // si no hay, navegamos al catalogo filtrando por el ID del genero
        } else if (typeof onNavegar === "function"){
            // redirigimos conservando el filtro de la URL
            onNavegar(`catalogo?genero=${genero.id}`)
        }
    }

    // retorno del bloque JSX semantico de la seccion
    return(
        <section 
            className="seccion-generos"
            aria-labelledby={`titulo-${idSeccion}`}   
        >

            {/* cabecera qeu agrupa el titulo a la izqueirda y el enlace opcional a la derecha */}
            <div className="seccion-generos-cabecera">

                {/* titulo de la seccion */}
                <h2 
                    className="seccion-generos-titulo titular-h2"
                    id={`titulo-${idSeccion}`}
                >
                    {/* texto dinamico recibico por atributo */}
                    {titulo}
                </h2>

                {/* renderizamos en enlace superior si se recibió enlaceTexto */}
                {enlaceTexto && (
                    <a 
                        href={enlaceHref} //atributo estandar par accesibilidad
                        className="seccion-generos-enlace"
                        onClick={manejarClickEnlace} //interceptamos el clic para la navegacion
                    >
                        {/* texto del enlace junto a una flecha hacia la derecha */}
                        {enlaceTexto} &rarr;
                    </a>
                )}
            </div>

            {/* mensaje accesible de carga cuando aun no hay generos disponibles */}
            {cargando && generos.length === 0 && (
                <div className="seccion-generos-estado cuerpo-m" aria-live="polite">
                    {textoCargando}
                </div>
            )}

            {/* bloque de erro con boton de reintento si la peticion falló */}
            {error && generos.length === 0 &&(
                <div className="seccion-generos-estado seccion-generos-error" role="alert">
                    <button 
                        className="seccion-generos-boton-reintentar"
                        type="button"
                        onClick={onRecargar}
                    >
                        {textoReintentar}
                    </button>
                </div>
            )}

            {/* cuadricula de targetas de generos cuando ya tenemos datos */}
            {generos.length>0 && (
                <div className="seccion-generos-cuadricula">
                    {/* recorremos cada genero disponible en el arreglo */}
                    {generos.map((genero) => {
                        // traducimos el token  de color de la API
                        const colorFondo = resolverColor(genero.color, "var(--portada-1)")
                        // comprobamos si este genero coincide co el genero activo seleccionado
                        const estaActivo = generoActivo === genero.id;

                        // retornamos la targeta interactiva del genero
                        return(
                            // articulo semantico que representa la targeta del genero
                            <article 
                                key={genero.id}
                                // aplicamos la clase base y añadimos la clase activo si está seleccionado
                                className={`seccion-genero-tarjeta ${estaActivo ? "seccion-genero-tarjeta--activo" : ""}`}
                                // pintamos el color de fondo dinamico propio de cada genero
                                style={{backgroundColor: colorFondo}}
                                onClick={(evento) => manejarClickGenero(evento, genero)}
                                role="button"
                                aria-pressed={estaActivo}
                                tabIndex={0} //se permite que la targeta reciba foco al navegar con tab
                                onKeyDown={(evento)=>{ //manejador accesible para activar la targeta con enter o espacio
                                    if(evento.key === "Enter" || evento.key === " "){
                                        manejarClickGenero(evento, genero);
                                    }
                                }}
                            >
                                {/* titulo con el nombre del genero en la esquina superior izquierda */}
                                <h3 className="seccion-genero-nombre titular-h3">
                                    {genero.nombre}
                                </h3>
                                
                                {/* contenedor decorativo en la esquina inferior derecha */}
                                <div className="seccion-genero-decoracion" aria-hidden="true">
                                    {/* dibujamos la miniatura de portada */}
                                    <Portada 
                                        className="seccion-genero-portada-svg"
                                        patron={genero.portada?.patron ?? 0}
                                        colores={genero.portada?.colores ?? ["portada/1", "portada/2"]}
                                    >
                                    </Portada>
                                </div>

                            </article>
                        )
                    })}
                </div>

            )}
        </section>

    )
}