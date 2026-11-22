// Importamos la hoja de estilos concisa de los esqueletos de carga
import "./EstadoCarga.css";

// Funcion auxiliar que crea un arreglo numerado del tamano solicitado para iterar esqueletos
function crearIndices(cantidad) {
  // Generamos un arreglo de indices [0, 1, ..., cantidad - 1]
  return Array.from({ length: cantidad }, (_, indice) => indice);
}

// Declaramos y exportamos el componente reutilizable de estado de carga con esqueletos visuales
export default function EstadoCarga({
  // Variante visual del esqueleto ("albumes" | "generos" | "detalleGenero" | "detalleAlbum")
  variante = "albumes",
  // Cantidad opcional de tarjetas o filas de esqueleto a dibujar
  cantidad,
  // Texto accesible para lectores de pantalla proveniente de textos.estados.cargando.aria
  textoAria = "",
  // Texto de respaldo proveniente de textos.estados.cargando.titulo
  textoTitulo = "",
  // Clase CSS opcional adicional enviada por el componente padre
  className = "",
}) {
  // Seleccionamos el mensaje accesible traducido desde la API (nunca texto quemado)
  const mensajeAccesible = textoAria || textoTitulo || "";

  // Determinamos cuantas tarjetas o filas renderizar segun la variante si no se paso cantidad
  const totalElementos =
    // Si el padre envio un numero valido positivo lo usamos
    typeof cantidad === "number" && cantidad > 0
      ? cantidad
      : // Para generos dibujamos 8 por defecto, para albumes y pistas 6
        variante === "generos"
          ? 8
          : 6;

  // Combinamos la clase base, la variante activa y cualquier clase adicional
  const clasesContenedor = `estado-carga estado-carga--${variante} ${className}`.trim();

  // Retornamos la region accesible con esqueletos que imitan la geometria real de cada vista
  return (
    // Region de estado en vivo que informa carga activa a tecnologias de asistencia
    <div
      // Clases de contenedor y variante
      className={clasesContenedor}
      // Rol semantico de estado para cambios no intrusivos
      role="status"
      // Indica a lectores de pantalla que esta region esta cargando datos
      aria-busy="true"
      // Anuncia el cambio de forma educada sin interrumpir al usuario
      aria-live="polite"
      // Etiqueta accesible solo cuando ya llegaron los textos de la API
      aria-label={mensajeAccesible || undefined}
    >
      {/* Texto oculto visualmente pero legible por lectores de pantalla */}
      {mensajeAccesible && (
        // Span con tecnica sr-only para accesibilidad real
        <span className="estado-carga-lector">{mensajeAccesible}</span>
      )}

      {/* Variante 1: cuadricula de esqueletos de tarjetas de generos */}
      {variante === "generos" && (
        // Rejilla decorativa oculta para lectores de pantalla
        <div className="estado-carga-generos" aria-hidden="true">
          {/* Iteramos la cantidad configurada de tarjetas de genero */}
          {crearIndices(totalElementos).map((indice) => (
            // Tarjeta esqueleto con la misma altura y bordes que .seccion-genero-tarjeta
            <div key={indice} className="estado-carga-genero estado-carga-pulso">
              {/* Barra superior que simula el nombre del genero */}
              <span className="estado-carga-linea estado-carga-linea--genero" />
            </div>
          ))}
        </div>
      )}

      {/* Variante 2: fila/cuadricula de esqueletos de tarjetas de albumes */}
      {variante === "albumes" && (
        // Contenedor de tarjetas de album oculto para lectores de pantalla
        <div className="estado-carga-albumes" aria-hidden="true">
          {/* Iteramos la cantidad configurada de tarjetas de album */}
          {crearIndices(totalElementos).map((indice) => (
            // Tarjeta individual de album con caja cuadrada + dos lineas de texto
            <div key={indice} className="estado-carga-album">
              {/* Cuadro 1:1 que representa la portada del album */}
              <div className="estado-carga-portada estado-carga-pulso" />
              {/* Linea principal que simula el titulo del album */}
              <span className="estado-carga-linea estado-carga-linea--titulo estado-carga-pulso" />
              {/* Linea secundaria mas corta que simula el nombre del artista */}
              <span className="estado-carga-linea estado-carga-linea--subtitulo estado-carga-pulso" />
            </div>
          ))}
        </div>
      )}

      {/* Variante 3: esqueleto completo del detalle de un genero en CatalogoMusical */}
      {variante === "detalleGenero" && (
        // Bloque decorativo con secciones de artistas, albumes y canciones
        <div className="estado-carga-detalle-genero" aria-hidden="true">
          {/* Subbloque de artistas del genero */}
          <div className="estado-carga-grupo">
            {/* Barra que simula el encabezado h2 "Artistas" */}
            <span className="estado-carga-linea estado-carga-linea--seccion estado-carga-pulso" />
            {/* Fila horizontal de avatares circulares */}
            <div className="estado-carga-artistas">
              {/* Dibujamos 3 avatares de ejemplo */}
              {crearIndices(3).map((indice) => (
                // Columna individual con circulo y dos lineas centradas
                <div key={indice} className="estado-carga-artista">
                  {/* Circulo de avatar de artista */}
                  <div className="estado-carga-avatar estado-carga-pulso" />
                  {/* Linea de nombre del artista */}
                  <span className="estado-carga-linea estado-carga-linea--titulo estado-carga-pulso" />
                  {/* Linea de rol "Artista" */}
                  <span className="estado-carga-linea estado-carga-linea--corta estado-carga-pulso" />
                </div>
              ))}
            </div>
          </div>

          {/* Subbloque de albumes del genero */}
          <div className="estado-carga-grupo">
            {/* Barra que simula el encabezado h2 "Albumes de ..." */}
            <span className="estado-carga-linea estado-carga-linea--seccion estado-carga-pulso" />
            {/* Fila de 3 tarjetas de album */}
            <div className="estado-carga-albumes">
              {/* Dibujamos 3 tarjetas cuadradas */}
              {crearIndices(3).map((indice) => (
                // Tarjeta de album individual
                <div key={indice} className="estado-carga-album">
                  {/* Portada cuadrada 1:1 */}
                  <div className="estado-carga-portada estado-carga-pulso" />
                  {/* Linea de titulo */}
                  <span className="estado-carga-linea estado-carga-linea--titulo estado-carga-pulso" />
                  {/* Linea de artista */}
                  <span className="estado-carga-linea estado-carga-linea--subtitulo estado-carga-pulso" />
                </div>
              ))}
            </div>
          </div>

          {/* Subbloque de canciones mas escuchadas del genero */}
          <div className="estado-carga-grupo">
            {/* Barra que simula el encabezado h2 "Canciones mas escuchadas" */}
            <span className="estado-carga-linea estado-carga-linea--seccion estado-carga-pulso" />
            {/* Lista de 5 filas de canciones */}
            <div className="estado-carga-pistas">
              {/* Dibujamos 5 filas para el ranking */}
              {crearIndices(5).map((indice) => (
                // Fila horizontal con numero, textos y duracion
                <div key={indice} className="estado-carga-pista-simple">
                  {/* Espacio del numero ordinal */}
                  <span className="estado-carga-linea estado-carga-linea--num estado-carga-pulso" />
                  {/* Columna de titulo y artista */}
                  <div className="estado-carga-pista-textos">
                    {/* Titulo de cancion */}
                    <span className="estado-carga-linea estado-carga-linea--titulo estado-carga-pulso" />
                    {/* Nombre de artista */}
                    <span className="estado-carga-linea estado-carga-linea--subtitulo estado-carga-pulso" />
                  </div>
                  {/* Tiempo de duracion a la derecha */}
                  <span className="estado-carga-linea estado-carga-linea--duracion estado-carga-pulso" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Variante 4: esqueleto completo de Vista 3 (DetalleAlbum) fiel a movil y escritorio */}
      {variante === "detalleAlbum" && (
        // Contenedor decorativo oculto para lectores de pantalla
        <div className="estado-carga-detalle-album" aria-hidden="true">
          {/* Circulo superior izquierdo que reserva la flecha "<" en movil */}
          <div className="estado-carga-volver estado-carga-pulso" />

          {/* Encabezado de album: portada 220x220 + pastillas + titulo + resumen */}
          <div className="estado-carga-album-cabecera">
            {/* Caja cuadrada 220x220 identica a .detalle-album-portada-caja */}
            <div className="estado-carga-album-portada estado-carga-pulso" />

            {/* Columna de metadatos del encabezado */}
            <div className="estado-carga-album-meta">
              {/* Fila de dos pastillas (tipo y genero) */}
              <div className="estado-carga-pastillas">
                {/* Primera pastilla */}
                <span className="estado-carga-pastilla estado-carga-pulso" />
                {/* Segunda pastilla */}
                <span className="estado-carga-pastilla estado-carga-pulso" />
              </div>
              {/* Barra grande del titulo del album */}
              <span className="estado-carga-linea estado-carga-linea--display estado-carga-pulso" />
              {/* Barra de resumen (artista · anio · canciones · duracion) */}
              <span className="estado-carga-linea estado-carga-linea--resumen estado-carga-pulso" />
            </div>
          </div>

          {/* Lista de filas de canciones del album */}
          <div className="estado-carga-pistas">
            {/* Iteramos la cantidad configurada de pistas */}
            {crearIndices(totalElementos).map((indice) => (
              // Fila individual con miniatura, titulo/artista, reproducciones y duracion
              <div key={indice} className="estado-carga-pista-album">
                {/* Numero de pista visible en escritorio */}
                <span className="estado-carga-linea estado-carga-linea--num estado-carga-solo-web estado-carga-pulso" />
                {/* Bloque de miniatura de portada + textos de la pista */}
                <div className="estado-carga-pista-principal">
                  {/* Mini portada cuadrada */}
                  <div className="estado-carga-pista-mini estado-carga-pulso" />
                  {/* Columna de titulo y artista */}
                  <div className="estado-carga-pista-textos">
                    {/* Titulo de la pista */}
                    <span className="estado-carga-linea estado-carga-linea--titulo estado-carga-pulso" />
                    {/* Artista de la pista */}
                    <span className="estado-carga-linea estado-carga-linea--subtitulo estado-carga-pulso" />
                  </div>
                </div>
                {/* Columna de reproducciones visible solo en escritorio */}
                <span className="estado-carga-linea estado-carga-linea--repros estado-carga-solo-web estado-carga-pulso" />
                {/* Columna de duracion alineada a la derecha */}
                <span className="estado-carga-linea estado-carga-linea--duracion estado-carga-pulso" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
