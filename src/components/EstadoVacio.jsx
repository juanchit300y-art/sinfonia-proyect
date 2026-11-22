// Importamos el componente de iconos vectoriales del sistema de diseno
import Icono from "./Icono.jsx";
// Importamos la hoja de estilos concisa del estado vacio
import "./EstadoVacio.css";

// Declaramos y exportamos el componente reutilizable EstadoVacio para listas o generos sin elementos
export default function EstadoVacio({
  // Titulo principal traducido proveniente de la API (ej. textos.paginas.catalogo.vacio.titulo)
  titulo = "",
  // Texto secundario opcional proveniente de la API (ej. textos.paginas.catalogo.vacio.texto)
  descripcion = "",
  // Texto opcional de un boton de accion secundaria proveniente de la API
  textoAccion = "",
  // Callback opcional ejecutado al pulsar el boton de accion
  onAccion,
  // Nivel semantico del encabezado ("h2" | "h3") segun la jerarquia de la vista padre
  nivelTitulo = "h3",
  // Clase CSS adicional opcional
  className = "",
}) {
  // Seleccionamos la etiqueta de encabezado valida para conservar jerarquia semantica correcta
  const EtiquetaTitulo = nivelTitulo === "h2" ? "h2" : "h3";
  // Combinamos la clase base con cualquier clase extra enviada por el padre
  const clases = `estado-vacio ${className}`.trim();

  // Retornamos la tarjeta accesible centrada para el estado vacio
  return (
    // Region informativa con role="status" para anunciar contenido vacio sin interrumpir
    <div className={clases} role="status" aria-live="polite">
      {/* Circulo decorativo con icono vectorial de disco musical */}
      <div className="estado-vacio-icono" aria-hidden="true">
        {/* Icono minimalista de disco del sistema de iconos */}
        <Icono nombre="disco" />
      </div>

      {/* Renderizamos el titulo solo cuando llego traducido desde la API */}
      {titulo && (
        // Encabezado reutilizando la clase tipografica predefinida titular-h3
        <EtiquetaTitulo className="estado-vacio-titulo titular-h3">
          {/* Mensaje principal del estado vacio */}
          {titulo}
        </EtiquetaTitulo>
      )}

      {/* Renderizamos la descripcion complementaria solo si existe */}
      {descripcion && (
        // Parrafo reutilizando la clase tipografica predefinida cuerpo-p
        <p className="estado-vacio-descripcion cuerpo-p">
          {/* Sugerencia o detalle del estado vacio */}
          {descripcion}
        </p>
      )}

      {/* Renderizamos el boton de accion solo si se enviaron texto y manejador */}
      {textoAccion && typeof onAccion === "function" && (
        // Boton secundario accesible reutilizando la clase predefinida cuerpo-p-fuerte
        <button
          // Tipo button explicito para no enviar formularios
          type="button"
          // Estilos del boton secundario mas tipografia predefinida
          className="estado-vacio-boton cuerpo-p-fuerte"
          // Dispara la accion definida por el componente padre
          onClick={onAccion}
        >
          {/* Etiqueta traducida del boton */}
          {textoAccion}
        </button>
      )}
    </div>
  );
}
