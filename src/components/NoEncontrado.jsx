// Importamos la hoja de estilos de la vista 404
import "./NoEncontrado.css";

// Exportamos el componente reutilizable NoEncontrado para albumes 404 o rutas desconocidas
export default function NoEncontrado({
  // Titulo principal traducido que viene desde la API (ej. "No encontramos este album")
  titulo,
  // Texto explicativo traducido que viene desde la API
  descripcion,
  // Texto del boton de retorno traducido desde la API (ej. "Volver al catalogo")
  textoBoton,
  // Ruta interna a la que lleva el boton al hacer clic (por defecto /catalogo)
  destinoBoton = "/catalogo",
  // Funcion de navegacion SPA recibida desde App.jsx
  onNavegar,
}) {
  // Intercepta el clic en el enlace para navegar dentro de la SPA sin recargar toda la web
  function manejarClick(evento) {
    // Verificamos que el padre haya pasado la funcion de navegacion SPA
    if (onNavegar) {
      // Detenemos la recarga completa por defecto del navegador
      evento.preventDefault();
      // Cambiamos de ruta usando window.history.pushState en App.jsx
      onNavegar(destinoBoton);
    }
  }

  // Retornamos la estructura semantica de la pantalla 404
  return (
    // Seccion principal asociada por accesibilidad al id de su titulo
    <section className="no-encontrado" aria-labelledby="no-encontrado-titulo">
      {/* Tarjeta interior centrada con fondo de superficie */}
      <div className="no-encontrado-caja">
        {/* Numero decorativo 404 usando la clase tipografica predefinida dato-cifra */}
        <span className="no-encontrado-codigo dato-cifra" aria-hidden="true">
          404
        </span>
        {/* Titulo principal usando la clase predefinida titular-h2 */}
        <h1 id="no-encontrado-titulo" className="no-encontrado-titulo titular-h2">
          {titulo}
        </h1>
        {/* Renderizamos la descripcion solo si llego desde la API */}
        {descripcion && (
          // Parrafo descriptivo usando la clase predefinida cuerpo-m
          <p className="no-encontrado-descripcion cuerpo-m">
            {descripcion}
          </p>
        )}
        {/* Renderizamos el enlace de retorno solo si llego su texto desde la API */}
        {textoBoton && (
          // Enlace real con href para accesibilidad y clic derecho, con tipografia cuerpo-p-fuerte
          <a
            // Direccion de destino real
            href={destinoBoton}
            className="no-encontrado-boton cuerpo-p-fuerte"
            onClick={manejarClick}
          >
            {/* Etiqueta visible del boton */}
            {textoBoton}
          </a>
        )}
      </div>
    </section>
  );
}
