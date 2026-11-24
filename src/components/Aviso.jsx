import Icono from "./Icono.jsx";
import "./Aviso.css";

// Mapa que asocia cada variante oficial de Figma con el nombre de su icono vectorial
const ICONO_POR_VARIANTE = {
  // Circulo con signo de exclamacion para errores
  error: "alerta",
  // Circulo con palomita para confirmaciones de exito
  exito: "exito",
  // Circulo con letra i para mensajes informativos
  info: "info",
};

// Declaramos y exportamos el componente reutilizable Aviso (3 variantes oficiales de Figma: error, exito, info)
export default function Aviso({
  // Variante visual del sistema de diseno ("error" | "exito" | "info")
  variante = "info",
  // Titulo principal del aviso proveniente de la API (nunca texto quemado)
  titulo = "",
  // Descripcion secundaria que explica que paso y que hacer (desde la API)
  texto = "",
  // Rol ARIA opcional para sobreescribir el valor por defecto (ej. "status" en cuentas regresivas)
  rol,
  // Clase CSS opcional adicional enviada por el componente padre
  className = "",
}) {
  // Si no llego ni titulo ni texto desde la API, evitamos pintar una caja vacia
  if (!titulo && !texto) {
    // No renderizamos nada
    return null;
  }

  // Seleccionamos el icono correspondiente a la variante (respaldo seguro a "info")
  const nombreIcono = ICONO_POR_VARIANTE[variante] ?? "info";
  // Los avisos de error usan role="alert" por defecto; exito e info usan role="status"
  const rolAccesible = rol ?? (variante === "error" ? "alert" : "status");
  // Combinamos clase base, modificador de variante y clase adicional
  const clases = `aviso aviso--${variante} ${className}`.trim();

  // Retornamos la caja semantica y accesible del componente Aviso
  return (
    // Contenedor del aviso con rol ARIA acorde a su urgencia
    <div className={clases} role={rolAccesible}>
      {/* Icono lateral izquierdo alineado a la primera linea de texto */}
      <span className="aviso-icono" aria-hidden="true">
        {/* Renderizamos el icono SVG del sistema de diseno */}
        <Icono nombre={nombreIcono} className="aviso-icono-svg" />
      </span>

      {/* Columna derecha con el titulo en negrita y el texto explicativo */}
      <div className="aviso-contenido">
        {/* Titulo del aviso usando la clase tipografica predefinida detalle-nota-fuerte */}
        {titulo && <p className="aviso-titulo detalle-nota-fuerte">{titulo}</p>}
        {/* Descripcion del aviso usando la clase tipografica predefinida detalle-nota */}
        {texto && <p className="aviso-texto detalle-nota">{texto}</p>}
      </div>
    </div>
  );
}
