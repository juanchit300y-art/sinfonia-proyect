import "./Portada.css"

// funcion que traduce los nombres de color de la API a variables CSS
export function resolverColor(colorApi, fallback = "transparent"){
    // si no se proporciona color, devuelve color de respaldo
    if(!colorApi) return fallback;
    // si viene en formato oficial de la API (portada/1..6, fijo/negro, fijo/blanco o fondo/sutil)
    if (
        typeof colorApi === "string" &&
        (colorApi.startsWith("portada/") || colorApi.startsWith("fijo/") || colorApi.startsWith("fondo/"))
    ){
        // reemplaza la barra inclinada por un guion para formar la variable css del token
        return `var(--${colorApi.replace("/", "-")})`;
    }
    // si ya es un color hexadecimal o variable directa lo devuelve tal cual
    return colorApi
}

// componente principal portada, dibuja la caratula mediante SVG siguiendo la Guia de portadas del contrato
export default function Portada({
    // puede recibir un objeto completo "portada" de la API o las propiedades sueltas
    portada,
    // numero del 0 al 3 que define la figura geometrica (0: anillos, 1: rayas, 2: colina, 3: puntos)
    patron,
    // arreglo de colores de tokens para fondo, figura y detalle
    colores,
    // clases css opcionales para personalizar tamaño o bordes desde el componente padre
    className = "",
    // texto alternativo accesible para lectores de pantalla
    alt = ""
}) {
    // extrae el patron desde el objeto o la propiedad directa (por defecto 0)
    const numPatron = portada?.patron ?? patron ?? 0;
    // extrae la lista de nombres de colores de tokens si fue provista
    const listaColores = portada?.colores ?? colores ?? [];
    
    // color 1 (FONDO): prioriza el token en colores[0] o el hexadecimal portada.fondo
    const colorFondo = resolverColor(listaColores[0] ?? portada?.fondo, "var(--portada-1)");
    // color 2 (FIGURA): prioriza el token en colores[1] o el hexadecimal portada.figura
    const colorFigura1 = resolverColor(listaColores[1] ?? portada?.figura, "var(--portada-4)");
    // color 3 (DETALLE): prioriza el token en colores[2] o portada.detalle (siempre blanco por defecto)
    const colorFigura2 = resolverColor(listaColores[2] ?? portada?.detalle, "var(--fijo-blanco)");

    // funcion que genera los trazados SVG vectoriales segun el numero del patron oficial (0 a 3)
    function renderizarTrazos(){
        switch(numPatron){
            // patron 0 · anillos: tres circulos que salen de la esquina inferior derecha (figura, fondo, figura)
            case 0:
                return (
                    <g>
                        {/* circulo exterior con el color de la figura */}
                        <circle cx="100" cy="100" r="85" fill={colorFigura1} />
                        {/* circulo intermedio con el color del fondo */}
                        <circle cx="100" cy="100" r="62.5" fill={colorFondo} />
                        {/* circulo interior con el color de la figura */}
                        <circle cx="100" cy="100" r="40" fill={colorFigura1} />
                    </g>
                );
            
            // patron 1 · rayas: cuatro rayas diagonales del color de la figura
            case 1:
                return(
                    <g fill={colorFigura1}>
                        <rect x="-34" y="40" width="182" height="11.4" transform="rotate(-35 -34 40)" />
                        <rect x="-30.7" y="66" width="182" height="11.4" transform="rotate(-35 -30.7 66)" />
                        <rect x="-27.3" y="92" width="182" height="11.4" transform="rotate(-35 -27.3 92)" />
                        <rect x="-23.9" y="118.2" width="182" height="11.4" transform="rotate(-35 -23.9 118.2)" />
                    </g>
                );
            
            // patron 2 · colina: un circulo grande abajo (la colina) y uno pequeño arriba a la derecha (el sol blanco)
            case 2:
                return (
                    <g>
                        {/* colina en la base con el color de la figura */}
                        <circle cx="50" cy="86.4" r="34.1" fill={colorFigura1} />
                        {/* sol en la esquina superior derecha con el detalle (blanco) */}
                        <circle cx="76.7" cy="23.3" r="10.8" fill={colorFigura2} />
                    </g>
                );

            // patron 3 · puntos: nueve puntos en tres filas; las esquinas y el centro con el detalle (blanco), los demas con la figura
            case 3:
            default:
                return (
                    <g>
                        {/* cinco puntos (esquinas y centro) con el color de detalle */}
                        <g fill={colorFigura2}>
                            <circle cx="22.7" cy="22.7" r="9.1" />
                            <circle cx="77.3" cy="22.7" r="9.1" />
                            <circle cx="50" cy="50" r="9.1" />
                            <circle cx="22.7" cy="77.3" r="9.1" />
                            <circle cx="77.3" cy="77.3" r="9.1" />
                        </g>
                        {/* cuatro puntos intermedios con el color de la figura */}
                        <g fill={colorFigura1}>
                            <circle cx="50" cy="22.7" r="9.1" />
                            <circle cx="22.7" cy="50" r="9.1" />
                            <circle cx="77.3" cy="50" r="9.1" />
                            <circle cx="50" cy="77.3" r="9.1" />
                        </g>
                    </g>
                );
        }
    }

    return(
        // contenedor cuadrado con fondo dinamico y bordes redondeados
        <div
            className={`portada ${className}`}
            style={{background: colorFondo}}
            role="img"
            aria-label={alt}
        >
            {/* lienzo vectorial SVG con viewBox cuadrado de 100x100 unidades relativas */}
            <svg
                viewBox="0 0 100 100"
                className="portada-svg"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
            >
                {/* rectangulo de fondo del lienzo SVG */}
                <rect width="100" height="100" fill={colorFondo} />
                {/* dibuja la figura correspondiente */}
                {renderizarTrazos()}
            </svg>
        </div>
    );
}
