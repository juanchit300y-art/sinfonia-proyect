import React from "react";
// importamos el componente reutilizable Portada que dibuja los patrones SVG
import Portada from "./Portada.jsx";
import "./CollagePortadas.css";

// exportamos el componente decorativo de la columna derecha del hero
export default function CollagePortadas(){
    return(
        // contenedor principal del collage que agrupa las 3 caratulas superpuestas
        <div className="collage-portadas" aria-hidden="true">

            {/* caratula principal grande ubicada en el centro del collage */}
            <div className="collage-item collage-item--principal">
                {/* renderizo el patron 2 (colina) */}
                <Portada 
                    className="collage-portada-svg"
                    patron={2}
                    colores={["portada/3", "fijo/negro", "fijo/blanco"]}
                >
                </Portada>
            </div>

            {/* caratula pequeña inclinada en la esquina superior derecha */}
            <div className="collage-item collage-item--superior">
                {/* renderizo el patron 1 (rayas) */}
                <Portada 
                    className="collage-portada-svg"
                    patron={1}
                    colores={["portada/2", "portada/4"]}
                >
                </Portada>
            </div>

            {/* caratula mediana inclinada en la esquina inferior izquierda */}
            <div className="collage-item collage-item--inferior">
                {/* renderizo el patron 0 (anillos) */}
                <Portada
                className="collage-portada-svg"
                patron={0}
                colores={["portada/5", "portada/1"]}
                />
            </div>

            {/* tarjeta decorativa verde lima inclinada en la esquina inferior derecha */}
            <div className="collage-item collage-item--letra">
                {/* frase principal en dos renglones con fuente Syne en negrita */}
                <p className="collage-letra-principal">
                    {/* primer renglon */}
                    Sube la niebla
                    {/* salto de línea para bajar al segundo renglón */}
                    <br />
                    {/* segundo renglon */}
                    por la montaña
                </p>
                {/* remate inferior más pequeño en fuente Inter regular */}
                <span className="collage-letra-secundaria">
                    {/* tercer renglón del verso */}
                    y el camino canta
                </span>
            </div>
        </div>
    );
}