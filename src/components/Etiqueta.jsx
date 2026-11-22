// Importamos la hoja de estilos propia del componente Etiqueta
import "./Etiqueta.css";

// Declaramos y exportamos el componente reutilizable Etiqueta con sus props
export default function Etiqueta({
  // Contenido interno que se mostrara dentro de la pastilla (ej. "Album", "Indie", "Explicito")
  children,
  // Variante visual del sistema de diseno ("neutra" | "marca" | "exito" | "alerta" | "error" | "secundaria")
  variante = "neutra",
  // Clases CSS adicionales opcionales enviadas por el componente padre
  className = "",
  // Funcion opcional: si existe, la pastilla se vuelve clickeable como un boton real
  onClick,
  // Resto de atributos HTML/ARIA opcionales (como aria-label o title)
  ...resto
}) {
  // Combinamos la clase tipografica predefinida de tokens.css con la base y la variante elegida
  const clases = `etiqueta detalle-nota-fuerte etiqueta--${variante} ${className}`.trim();

  // Si se paso un manejador onClick, renderizamos un <button> semantico accesible por teclado
  if (typeof onClick === "function") {
    // Retornamos el boton con la clase extra de interactividad
    return (
      // Boton de tipo "button" para evitar que envie formularios por accidente
      <button
        type="button"
        // Aplicamos las clases combinadas mas el estado interactivo
        className={`${clases} etiqueta--interactiva`}
        // Conectamos el clic con la funcion recibida por props
        onClick={onClick}
        // Propagamos cualquier atributo extra recibido
        {...resto}
      >
        {/* Texto o contenido interno de la etiqueta */}
        {children}
      </button>
    );
  }

  // Si no es interactiva, retornamos un <span> informativo ligero
  return (
    // Elemento en linea con las clases de variante y tipografia
    <span className={clases} {...resto}>
      {/* Texto o contenido interno de la etiqueta */}
      {children}
    </span>
  );
}
