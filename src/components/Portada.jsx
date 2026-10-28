import "./Portada.css"

// funcion que traduce los nombres de color de la API a variables CSS
function resolverColor(colorApi, fallback = "transparent"){
    // si no se proporciona color, devuelve color de respaldo
    if(!colorApi) return fallback;
    // si viene en formato oficial de la API
    if (typeof colorApi === "string" && colorApi.startsWith("portada/")){
        // reemplaza la barra inclinada por un guion para formar la variable css del token
        return `var(--${colorApi.replace("/", "-")})`;
    }
    // si ya es un color hexadecimal o variable directa lo devuelve tal cual
    return colorApi
}

// componente principal portada, dibuja la caratula mediante SVG
export default function Portada({
    // puede recibir un objeto completo "portada" de la API o de las propiedades sueltas
    Portada,
    // numero del 0 al 5 qeu define la figura geometrica
    patron,
    // arreglo de 2 o 3 colores para fondo y figuras
    colores,
    // clases css opcionales para personalizar tamaño o bordes desde el componente padre
    className = "",
    // texto alternativo accesible para lectores de pantalla
    alt = "Portada musical"
}) {
    // extrae el patron desde el objeto o la propiedad directa (por defecto 0)
    const numPatron = portada?.patron ?? patron ?? 0;
    // extrae la lista de colores
    const listaColores = portada.colores ?? colores ?? [];
    
    // color 1: fondo base de la caratula
    const colorFondo = resolverColor(listaColores[0], "var(--portada-1)")
    // colo 2: primera figura geometrica destacada
    const colorFigura1 = resolverColor(listaColores[1], "var(--portada-4)")
    // color 3: segunda figura o detalles contrastantes - blanco por defecto
    const colorFigura2 = resolverColor(listaColores[2], "#ffffff")

    // funcion que genera los trazados SVG vectoriales segun el numero del patron
    function renderizarTrazos(){
        switch(numPatron){
            // patron 0 - matris de 9 puntos ordenados en cuadricula 3x3
            case 0:
                return (
                    <g>
                        {/* Fila superior de 3 puntos */}
                        <circle cx="25" cy="25" r="8" fill={colorFigura2} />
                        <circle cx="50" cy="25" r="8" fill={colorFigura1} />
                        <circle cx="75" cy="25" r="8" fill={colorFigura2} />
                        {/* Fila central de 3 puntos */}
                        <circle cx="25" cy="50" r="8" fill={colorFigura1} />
                        <circle cx="50" cy="50" r="8" fill={colorFigura2} />
                        <circle cx="75" cy="50" r="8" fill={colorFigura1} />
                        {/* Fila inferior de 3 puntos */}
                        <circle cx="25" cy="75" r="8" fill={colorFigura2} />
                        <circle cx="50" cy="75" r="8" fill={colorFigura1} />
                        <circle cx="75" cy="75" r="8" fill={colorFigura2} />
                    </g>
                );
            
            // patron 1 - rayas diagonales paralelas a 45 grados
            case 1:
                return(
                    <g stroke={colorFigura1} strokeWidth="12" strokeLinecap="square">
                        <line x1="-20" y1="20" x2="20" y2="-20" />
                        <line x1="-10" y1="50" x2="50" y2="-10" />
                        <line x1="0" y1="80" x2="80" y2="0" />
                        <line x1="20" y1="110" x2="110" y2="20" />
                        <line x1="50" y1="130" x2="130" y2="50" />
                        <line x1="80" y1="140" x2="140" y2="80" />
                    </g>
                );
            
            // patron 2 - arcos concentricos tipo arcoiris / ondas desde la esquina inferior izquierda
            case 2:
                return(
                    <g fill="none">
                        {/* Arco exterior más amplio */}
                        <circle cx="0" cy="100" r="80" stroke={colorFigura1} strokeWidth="16" />
                        {/* Arco medio con el segundo color */}
                        <circle cx="0" cy="100" r="50" stroke={colorFigura2} strokeWidth="16" />
                        {/* Arco interior pequeño */}
                        <circle cx="0" cy="100" r="20" stroke={colorFigura1} strokeWidth="16" />
                    </g>
                );
            
            // patron 3 - arco / tunel en la base con luna / citculo en la parte superior derecha
            case 3:
                return (
                <g>
                    {/* Arco / túnel centrado en la parte inferior */}
                    <path
                    d="M 18 100 A 32 32 0 0 1 82 100 Z"
                    fill={colorFigura1}
                    />
                    {/* Círculo flotante en la esquina superior derecha */}
                    <circle cx="75" cy="28" r="9" fill={colorFigura2} />
                </g>
                );
            
            // patron 4 - rayas diagonales gruesas alternadas con dos colores
            case 4:
                return (
                <g strokeWidth="13" strokeLinecap="square">
                    <line x1="-15" y1="30" x2="30" y2="-15" stroke={colorFigura1} />
                    <line x1="5" y1="65" x2="65" y2="5" stroke={colorFigura2} />
                    <line x1="25" y1="100" x2="100" y2="25" stroke={colorFigura1} />
                    <line x1="45" y1="125" x2="125" y2="45" stroke={colorFigura2} />
                    <line x1="70" y1="145" x2="145" y2="70" stroke={colorFigura1} />
                </g>
                );
            
            // patron 5 - arcos concentricos desde la esquina derecha con circulo de acento a la izquierda
                  case 5:
                    default:
                        return (
                        <g fill="none">
                            {/* Arco amplio desde la esquina inferior derecha */}
                            <circle cx="100" cy="100" r="75" stroke={colorFigura1} strokeWidth="16" />
                            {/* Arco interior */}
                            <circle cx="100" cy="100" r="45" stroke={colorFigura2} strokeWidth="16" />
                            {/* Círculo sólido de acento en la esquina superior izquierda */}
                            <circle cx="28" cy="28" r="9" fill={colorFigura2} />
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
                {/* dibuja la figura correspondiente */}
                {renderizarTrazos()}
            </svg>
        </div>
    );
}