// Importamos el componente vectorial oficial que dibuja la portada SVG de cada album
import Portada from "./Portada.jsx";
// Importamos la hoja de estilos propia de la tarjeta reutilizable de album
import "./TarjetaAlbum.css";

// Declaramos y exportamos el componente reutilizable de tarjeta de album
export default function TarjetaAlbum({
  // Objeto album devuelto por la API (contiene id, titulo, portada y artista)
  album,
  // Texto secundario opcional debajo del titulo (si no se envia usa el nombre del artista)
  subtitulo,
  // Variante visual: "tarjeta" con fondo de superficie o "plana" sin fondo sobre cajas grises
  variante = "tarjeta",
  // Callback opcional si el componente padre quiere interceptar el clic en el album
  onClick,
  // Funcion de navegacion SPA recibida desde App.jsx para cambiar de ruta sin recargar
  onNavegar,
  // Clases CSS adicionales opcionales para ajustar layout desde el contenedor padre
  className = "",
}) {
  // Guarda de seguridad: si no llega un objeto album valido no renderizamos nada
  if (!album) {
    // Evitamos errores de acceso a propiedades indefinidas
    return null;
  }

  // Construimos la ruta SPA segura hacia el detalle del album codificando su identificador
  const destino = `/albumes/${encodeURIComponent(album.id)}`;
  // Definimos el subtitulo visible: priorizamos la prop recibida o caemos al nombre del artista
  const textoSubtitulo = subtitulo ?? album.artista?.nombre ?? "";

  // Construimos las clases CSS finales combinando base, variante plana (si aplica) y clases externas
  const clasesTarjeta = [
    // Clase base de la tarjeta reutilizable
    "tarjeta-album",
    // Modificador visual sin fondo ni relleno cuando se solicita variante plana
    variante === "plana" ? "tarjeta-album--plana" : "",
    // Cualquier clase adicional que envie el componente padre
    className,
  ]
    // Quitamos cadenas vacias
    .filter(Boolean)
    // Unimos con espacios para el atributo className
    .join(" ");

  // Manejador del clic sobre el enlace para navegar dentro de la SPA respetando teclas modificadoras
  function manejarClick(evento) {
    // Si el usuario usa Ctrl, Cmd, Shift, Alt o boton central dejamos el comportamiento nativo del navegador
    if (
      evento.metaKey ||
      evento.ctrlKey ||
      evento.shiftKey ||
      evento.altKey ||
      evento.button !== 0
    ) {
      // Permitimos abrir en pestana nueva sin interferir
      return;
    }

    // Evitamos la recarga completa del documento para navegar dentro de la SPA
    evento.preventDefault();

    // Si el padre definio un callback personalizado lo ejecutamos pasandole el album
    if (typeof onClick === "function") {
      // Delegamos la accion al componente padre
      onClick(album);
    } else if (typeof onNavegar === "function") {
      // Por defecto navegamos directamente al detalle del album en la SPA
      onNavegar(destino);
    }
  }

  // Retornamos la tarjeta como enlace semantico <a> accesible por teclado y lector de pantalla
  return (
    <a
      // URL real del detalle del album para accesibilidad y apertura en nueva pestana
      href={destino}
      // Clases calculadas de la tarjeta
      className={clasesTarjeta}
      // Interceptamos el clic principal para usar navegacion SPA
      onClick={manejarClick}
    >
      {/* Contenedor cuadrado con relacion 1:1 para enmarcar la portada */}
      <div className="tarjeta-album-portada-caja">
        {/* Componente vectorial oficial que dibuja el patron y colores de la API */}
        <Portada
          // Clase que fuerza al SVG a cubrir el 100% de la caja cuadrada
          className="tarjeta-album-portada-svg"
          // Objeto portada completo de la API
          portada={album.portada}
          // Respaldo de patron si el objeto portada llega incompleto
          patron={album.portada?.patron ?? 0}
          // Respaldo de paleta si el objeto portada llega sin colores
          colores={album.portada?.colores ?? ["portada/1", "portada/2"]}
          // Texto alternativo descriptivo con el titulo del album
          alt={album.titulo}
        />
      </div>

      {/* Contenedor vertical con los textos descriptivos de la tarjeta */}
      <div className="tarjeta-album-info">
        {/* Titulo del album usando la clase tipografica oficial de tokens.css */}
        <h3 className="tarjeta-album-titulo cuerpo-m-fuerte">
          {album.titulo}
        </h3>

        {/* Subtitulo debajo del titulo (artista en catalogo o anio y tipo en detalle) */}
        {textoSubtitulo && (
          <p className="tarjeta-album-subtitulo cuerpo-p">
            {textoSubtitulo}
          </p>
        )}
      </div>
    </a>
  );
}
