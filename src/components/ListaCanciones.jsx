import React from "react";
import "./ListaCanciones.css";

// funcion para formatear la duracion en segundos a formato minutos:segundos
function formatearDuracion(valor) {
    // si el valor ya viene en formato de texto con dos puntos lo retornamos directamente
    if (typeof valor === "string" && valor.includes(":")) {
        return valor;
    }
    // si no es un número válido retornamos un valor seguro de cero
    if (typeof valor !== "number" || isNaN(valor)) {
        return "0:00";
    }
    // calculamos la cantidad de minutos enteros dividiendo por 60
    const minutos = Math.floor(valor / 60);
    // calculamos los segundos restantes usando el operador módulo
    const segundos = Math.floor(valor % 60);
    // formateamos los segundos con cero inicial si son menores a 10
    const segundosFormateados = segundos < 10 ? `0${segundos}` : segundos;

    return `${minutos}:${segundosFormateados}`;
}

// declaramos y exportamos el componente ListaCanciones
export default function ListaCanciones({
    textos,
    canciones = [],
    idioma = "es",
    onCancionClick
}){
    // titulo de la seccion
    const titulo = textos?.titulo;
    
    // si no hay canciones o el arreglo está vacío no renderizamos la sección
    if (!canciones || canciones.length === 0) {
        // retornamos null para no pintar nada
        return null;
    }

    // retorno de la estructura semantica
    return(
        // seccion principal 
        <section className="seccion-canciones" aria-labelledby="titulo-seccion-canciones">
            {/* titulo principal de la seccion */}
            <h2 id="titulo-seccion-canciones" className="seccion-canciones-titulo titular-h2">
                {titulo}
            </h2>

            {/* lista ordenada semanticamente para representar el ranking enumerado */}
            <ol className="seccion-canciones-lista">
                {/* iteramos sobre cada cancion del arreglo */}
                {canciones.map((cancion, indice) =>{
                    const numero = indice+1; // numero ordinal
                    const nombreArtista = cancion.artista?.nombre;
                    const duracionCruda = cancion.duracionSeg;
                    const duracionFormateada = formatearDuracion(duracionCruda);
                    // construimos la etiqueta accesible segun el idioma activo
                    const etiquetaAccesible = idioma === "en"
                        ? `Track ${numero}: ${cancion.titulo}, by ${nombreArtista}, duration ${duracionFormateada}`
                        : `Canción ${numero}: ${cancion.titulo}, de ${nombreArtista}, duración ${duracionFormateada}`;

                    // retornamos el elemento de la lista de cada fila
                    return(
                        // elemento de fila con foco accesible
                        <li 
                            className="cancion-fila"
                            key={cancion.id}
                            tabIndex={0}
                            aria-label={etiquetaAccesible}
                            onClick={() => onCancionClick?.(cancion)}
                            onKeyDown={(e) => {
                                // activamos con Enter o Espacio para accesibilidad de teclado
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onCancionClick?.(cancion);
                                }
                            }}
                        >
                            {/* contenedor con el numero ordinal de la cancion */}
                            <span className="cancion-fila-numero cuerpo-m" aria-hidden="true">
                                {numero}
                            </span>

                            {/* contenedor flexible con el titulo de la pista y el artista */}
                            <div className="cancion-fila-info">
                                {/* titulo de la cancion */}
                                <span className="cancion-fila-titulo cuerpo-m-fuerte">
                                    {cancion.titulo}
                                </span>

                                {/* nombre del artista */}
                                <span className="cancion-fila-artista cuerpo-p">
                                    {nombreArtista}
                                </span>
                            </div>

                            {/* tiempo de duracion de la pista a la derecha */}
                            <span className="cancion-fila-duracion cuerpo-p">
                                {duracionFormateada}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}