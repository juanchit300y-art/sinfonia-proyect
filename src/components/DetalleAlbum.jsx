import { useEffect } from "react";
// Importamos nuestro hook generico unificado para consultar GET /albumes/:id
import { useConsulta } from "../hooks/useConsulta.js";
// Importamos las funciones puras de formato (sin new Date para evitar desfases de zona horaria)
import {
  // Extrae el anio "YYYY" directo del string "YYYY-MM-DD"
  extraerAnio,
  // Convierte segundos (ej. 70) en formato "m:ss" (ej. "1:10")
  formatearDuracion,
  // Formatea la duracion total del album con la plantilla de la API (ej. "6 min")
  formatearDuracionTotal,
  // Convierte "2025-10-06" en "6 de octubre de 2025" o "October 6, 2025" sin usar new Date()
  formatearFechaLarga,
  // Formatea numeros de reproducciones con separador de miles segun el idioma
  formatearReproducciones,
  // Traduce "album", "ep" o "sencillo" desde los textos de la API
  obtenerEtiquetaTipo,
} from "../utils/formatos.js";
import Portada from "./Portada.jsx";
// Importamos el componente reutilizable de pastillas/etiquetas (6 variantes de Figma)
import Etiqueta from "./Etiqueta.jsx";
import Icono from "./Icono.jsx";
// Importamos la vista reutilizable 404 para cuando la API devuelve 404 no_encontrado
import NoEncontrado from "./NoEncontrado.jsx";
// Importamos los componentes reutilizables de estados (esqueleto de carga, error recuperable y vacio)
import EstadoCarga from "./EstadoCarga.jsx";
import EstadoError from "./EstadoError.jsx";
import EstadoVacio from "./EstadoVacio.jsx";
// Importamos la hoja de estilos concisa de esta vista
import "./DetalleAlbum.css";

// Funcion auxiliar que actualiza (o crea si no existe) la etiqueta <meta name="description"> del documento
function actualizarMetaDescripcion(contenido) {
  // Si no hay contenido todavia, salimos sin modificar el DOM
  if (!contenido) return;
  // Buscamos si ya existe una etiqueta meta description en el <head>
  let etiquetaMeta = document.querySelector('meta[name="description"]');
  // Si no existia previamente en index.html, la creamos e insertamos en el <head>
  if (!etiquetaMeta) {
    // Creamos el elemento <meta>
    etiquetaMeta = document.createElement("meta");
    // Le asignamos el atributo name="description"
    etiquetaMeta.setAttribute("name", "description");
    // Lo agregamos al final del <head>
    document.head.appendChild(etiquetaMeta);
  }
  // Actualizamos su contenido con el titulo y artista del album actual
  etiquetaMeta.setAttribute("content", contenido);
}

// Declaramos y exportamos la Vista 3 · Detalle de un album (/albumes/:id)
export default function DetalleAlbum({
  // Identificador dinamico del album leido desde la URL (ej. "alb_luz-de-paramo")
  albumId,
  // Objeto completo de textos traducidos descargado desde GET /textos
  textos,
  // Idioma activo ("es" o "en") para formatos de fecha y reproducciones
  idioma = "es",
  // Funcion de navegacion SPA recibida desde App.jsx
  onNavegar,
}) {
  // ------------------------------------------------- Datos de cada album
  // Consultamos el detalle completo del album usando el hook unificado (si albumId es null no dispara fetch)
  const { datos: album, cargando, error, recargar } = useConsulta(
    // Construimos la ruta segura codificando el identificador de la URL
    albumId ? `/albumes/${encodeURIComponent(albumId)}` : null
  );

  // Extraemos de forma segura el subobjeto de textos propios de la pagina de album
  const textosAlbum = textos?.paginas?.album;
  // Extraemos los textos generales de carga, vacio y error
  const textosEstados = textos?.estados;
  // Extraemos las etiquetas, formatos y acciones reutilizables de la API
  const textosGeneral = textos?.general;
  // Extraemos los textos del footer para reutilizar la nota legal de audio libre
  const textosFooter = textos?.footer;

  // Detectamos si la API respondio 404 (no_encontrado) para mostrar la vista NoEncontrado
  const esNoEncontrado =
    // Comprobamos tanto el codigo HTTP 404 como el codigo semantico de la API
    error?.status === 404 || error?.codigo === "no_encontrado";

  // Efecto que actualiza el titulo de la pestana y la meta descripcion a partir del album cargado
  useEffect(() => {
    // Separador oficial de la API (" · ")
    const separador = textosGeneral?.formatos?.separador ?? " · ";
    // Nombre de la plataforma desde la API ("Sintonia")
    const nombreSitio = textos?.sitio?.nombre;

    // Si ya tenemos el album cargado, armamos sus metadatos SEO propios
    if (album) {
      // Construimos el titulo usando la plantilla seo.titulo incluyendo titulo y artista.nombre
      const tituloBase = textosAlbum?.seo?.titulo
        ? textosAlbum.seo.titulo.replace(
            // Reemplazamos el marcador {titulo} con titulo y artista del album
            "{titulo}",
            // Incluimos artista.nombre si esta presente
            album.artista?.nombre
              ? `${album.titulo}${separador}${album.artista.nombre}`
              : album.titulo
          )
        : [album.titulo, album.artista?.nombre, nombreSitio]
            // Filtramos valores vacios antes de unir
            .filter(Boolean)
            // Unimos con el separador oficial
            .join(separador);

      // Aplicamos el nuevo titulo en la pestana del navegador
      document.title = tituloBase;

      // Construimos la descripcion SEO combinando titulo, artista y la plantilla de la API
      const descripcionSeo = [
        // Encabezado con titulo y artista del album
        album.artista?.nombre
          ? `${album.titulo}${separador}${album.artista.nombre}.`
          : album.titulo,
        // Texto descriptivo traducido desde la API
        textosAlbum?.seo?.descripcion,
      ]
        // Quitamos segmentos vacios
        .filter(Boolean)
        // Unimos con un espacio
        .join(" ");

      // Actualizamos <meta name="description"> en el <head>
      actualizarMetaDescripcion(descripcionSeo);
    } else if (esNoEncontrado && textosAlbum?.noEncontrado?.titulo) {
      // Si el album devolvio 404, actualizamos la pestana con el titulo de no encontrado
      document.title = [textosAlbum.noEncontrado.titulo, nombreSitio]
        // Quitamos valores vacios
        .filter(Boolean)
        // Unimos con el separador oficial
        .join(separador);
    }
    // Re-ejecutamos cuando cambie el album, el estado 404 o los textos al cambiar idioma
  }, [album, esNoEncontrado, textos, textosAlbum, textosGeneral]);

  // Manejador de la flecha "<" en movil: vuelve atras solo si el historial es interno de Sintonia
  function manejarVolver() {
    // Si App.jsx marco { interno: true } al navegar, retrocedemos a la vista anterior exacta
    if (window.history.state?.interno) {
      // Volvemos a la entrada previa del historial (Inicio o Catalogo con su filtro)
      window.history.back();
    } else {
      // Si el usuario abrio el enlace directo en una pestana nueva, lo llevamos al catalogo
      onNavegar?.("/catalogo");
    }
  }

  // Si la API respondio 404 no_encontrado, renderizamos la pantalla dedicada 404
  if (esNoEncontrado) {
    // Devolvemos NoEncontrado alimentado 100% con los textos traducidos de la API
    return (
      <NoEncontrado
        // Titulo especifico del 404 de album o respaldo generico de estados
        titulo={textosAlbum?.noEncontrado?.titulo ?? textosEstados?.noEncontrado?.titulo}
        // Descripcion traducida del 404 de album
        descripcion={textosAlbum?.noEncontrado?.texto ?? textosEstados?.noEncontrado?.descripcion}
        // Texto del boton "Volver al catalogo" desde la API
        textoBoton={textosAlbum?.noEncontrado?.botones?.volver ?? textosEstados?.noEncontrado?.botones?.irAlInicio}
        destinoBoton="/catalogo"
        onNavegar={onNavegar}
      />
    );
  }

  // Mientras la peticion GET /albumes/:id esta en curso, mostramos el esqueleto accesible fiel a Vista 3
  if (cargando && !album) {
    // Retornamos la seccion con la misma caja base que el album cargado para evitar saltos de layout
    return (
      <section id="detalle-album" className="seccion detalle-album">
        {/* Esqueleto de portada, metadatos y lista de pistas traducido desde la API */}
        <EstadoCarga
          variante="detalleAlbum"
          cantidad={6}
          textoAria={textosEstados?.cargando?.aria}
          textoTitulo={textosEstados?.cargando?.titulo}
        />
      </section>
    );
  }

  // Si ocurrio un error distinto de 404 (500, 503 o sin red), mostramos EstadoError con boton Reintentar
  if (error && !album) {
    // Retornamos la tarjeta reutilizable de error recuperable dentro de la caja de la vista
    return (
      <section id="detalle-album" className="seccion detalle-album">
        {/* Alerta accesible que traduce el codigo de textos.errores y ejecuta recargar() */}
        <EstadoError
          error={error}
          textosEstados={textosEstados}
          textosErrores={textos?.errores}
          nivelTitulo="h1"
          onReintentar={recargar}
        />
      </section>
    );
  }

  // Guarda de seguridad si aun no hay objeto de album
  if (!album) {
    // No pintamos nada hasta tener datos validos
    return null;
  }

  // Lista segura de canciones del album (la API entrega todas las pistas reales del disco)
  const pistas = Array.isArray(album.pistas) ? album.pistas : [];
  // Lista segura de otros lanzamientos del mismo artista (solo se muestra en escritorio)
  const masDelArtista = Array.isArray(album.masDelArtista) ? album.masDelArtista : [];
  // Separador oficial de textos (" · ")
  const separador = textosGeneral?.formatos?.separador ?? " · ";
  // Punto separador sin espacios extra para usarlo limpio dentro de contenedores flex con gap
  const puntoSeparador = separador.trim() || "·";

  // Extraemos el anio "YYYY" sin usar new Date()
  const anio = extraerAnio(album.fechaPublicacion);
  // Formateamos la fecha larga para el pie de la tabla en web sin usar new Date()
  const fechaLarga = formatearFechaLarga(album.fechaPublicacion, idioma);
  // Traducimos el tipo ("album" -> "Album", "ep" -> "EP", "sencillo" -> "Sencillo")
  const etiquetaTipo = obtenerEtiquetaTipo(album.tipo, textosAlbum, textosGeneral);

  // Numero total de canciones del disco
  const totalCanciones = album.totalPistas;
  // Elegimos singular o plural segun la cantidad real de canciones
  const plantillaCanciones =
    totalCanciones === 1
      ? textosAlbum?.encabezado?.canciones?.uno
      : textosAlbum?.encabezado?.canciones?.otro;
  // Reemplazamos el marcador {cantidad} por el numero real
  const textoCanciones = plantillaCanciones
    ? plantillaCanciones.replace("{cantidad}", String(totalCanciones))
    : "";

  // Formateamos la duracion total del album (ej. "6 min")
  const textoDuracion = formatearDuracionTotal(
    album.duracionSeg,
    textosAlbum,
    textosGeneral
  );

  // Armamos los metadatos complementarios (anio · canciones · duracion)
  const detallesResumen = [anio, textoCanciones, textoDuracion]
    // Quitamos partes vacias
    .filter(Boolean)
    // Unimos con el separador oficial de la API
    .join(separador);

  // Construimos el titulo "Mas de {artista}" con la plantilla traducida de la API
  const tituloMasDelArtista = textosAlbum?.masDelArtista?.titulo?.replace(
    "{artista}",
    album.artista?.nombre ?? ""
  );

  // Ruta destino para el enlace "Ver discografia" (filtra el catalogo por el genero del album)
  const rutaDiscografia = album.genero?.id
    ? `/catalogo?genero=${encodeURIComponent(album.genero.id)}`
    : "/catalogo";

  // ---------------------------- Retornamos la estructura completa de la Vista 3
  return (
    // Contenedor semantico principal vinculado al titulo del album
    <section
      // Identificador unico de la vista
      id="detalle-album"
      className="seccion detalle-album"
      aria-labelledby="detalle-album-titulo"
    >
      {/* Barra superior exclusiva de movil con el boton de volver "<" */}
      <div className="detalle-album-barra-movil">
        {/* Boton accesible para regresar a la pantalla anterior */}
        <button
          type="button"
          className="detalle-album-volver"
          aria-label={textosGeneral?.acciones?.volver}
          // Ejecuta la logica segura de regreso
          onClick={manejarVolver}
        >
          {/* Icono vectorial de flecha izquierda */}
          <Icono nombre="chevronIzquierda" />
        </button>
      </div>

      {/* Encabezado del album: portada grande + pastillas + titulo + fila de resumen */}
      <header className="detalle-album-encabezado">
        {/* Contenedor cuadrado 220x220 de la portada principal */}
        <div className="detalle-album-portada-caja">
          {/* Componente vectorial oficial que dibuja el patron y colores de la API */}
          <Portada
            // Pasamos el objeto completo portada recibido de la API
            portada={album.portada}
            className="detalle-album-portada-svg"
            alt={album.titulo}
          />
        </div>

        {/* Columna derecha (en web) o inferior (en movil) con los metadatos del disco */}
        <div className="detalle-album-meta">
          {/* Fila de pastillas: tipo de lanzamiento y genero musical */}
          <div className="detalle-album-etiquetas">
            {/* Pastilla de tipo ("Album" / "EP" / "Sencillo"): morada en movil y gris en web */}
            {etiquetaTipo && (
              <Etiqueta variante="neutra" className="detalle-album-etiqueta-tipo">
                {etiquetaTipo}
              </Etiqueta>
            )}
            {/* Pastilla del genero musical del album (clickeable para filtrar el catalogo) */}
            {album.genero?.nombre && (
              <Etiqueta
                // Variante gris neutra del sistema de diseno
                variante="neutra"
                // Solo se vuelve interactiva si la API incluyo el id del genero
                onClick={
                  album.genero?.id
                    ? () =>
                        onNavegar?.(
                          `/catalogo?genero=${encodeURIComponent(album.genero.id)}`
                        )
                    : undefined
                }
              >
                {/* Nombre del genero desde la API */}
                {album.genero.nombre}
              </Etiqueta>
            )}
          </div>

          {/* Titulo del album usando clase predefinida titular-h2 (escala a 64px en web) */}
          <h1 id="detalle-album-titulo" className="detalle-album-titulo titular-h2">
            {album.titulo}
          </h1>

          {/* Fila de resumen usando clase predefinida cuerpo-p */}
          <div className="detalle-album-resumen cuerpo-p">
            {/* Mini portada circular visible solo en escritorio junto al nombre del artista */}
            <span className="detalle-album-avatar-mini" aria-hidden="true">
              <Portada portada={album.portada} className="detalle-album-portada-svg" />
            </span>
            {/* Nombre del artista (blanco negrita en web, gris regular en movil) */}
            {album.artista?.nombre && (
              <span className="detalle-album-artista">
                {album.artista.nombre}
              </span>
            )}
            {/* Punto separador explicito para evitar que flex colapse el espacio entre artista y anio */}
            {album.artista?.nombre && detallesResumen && (
              <span className="detalle-album-separador" aria-hidden="true">
                {puntoSeparador}
              </span>
            )}
            {/* Anio, cantidad de canciones y duracion total */}
            {detallesResumen && (
              <span>{detallesResumen}</span>
            )}
          </div>
        </div>
      </header>

      {/* Bloque de la tabla / lista de canciones (sin reproduccion de audio segun contrato) */}
      <div className="detalle-album-pistas">
        {/* Si el album llego sin canciones mostramos el estado vacio traducido desde la API */}
        {pistas.length === 0 ? (
          <EstadoVacio titulo={textosEstados?.vacio?.generico} />
        ) : (
          <>
            {/* Cabecera de 4 columnas visible solo en escritorio usando clase predefinida detalle-etiqueta */}
            <div className="detalle-album-tabla-cabecera detalle-etiqueta" aria-hidden="true">
              {/* Encabezado de numero de pista (#) */}
              <span className="detalle-album-col-num">
                {textosAlbum?.tabla?.etiquetas?.numero}
              </span>
              {/* Encabezado de titulo de la cancion */}
              <span className="detalle-album-col-titulo">
                {textosAlbum?.tabla?.etiquetas?.titulo}
              </span>
              {/* Encabezado de reproducciones alineado a la izquierda igual que Figma */}
              <span className="detalle-album-col-reproducciones">
                {textosAlbum?.tabla?.etiquetas?.reproducciones}
              </span>
              {/* Encabezado de duracion con icono de reloj alineado a la derecha */}
              <span
                // Columna derecha de duracion
                className="detalle-album-col-duracion"
                // Tooltip accesible con el texto "Duracion" de la API
                title={textosAlbum?.tabla?.etiquetas?.duracion}
              >
                {/* Icono vectorial de reloj */}
                <Icono nombre="reloj" className="detalle-album-icono-reloj" />
              </span>
            </div>

            {/* Lista ordenada semantica con todas las pistas reales devueltas por la API */}
            <ol className="detalle-album-lista-pistas">
              {/* Recorremos cada pista del arreglo album.pistas */}
              {pistas.map((pista, indice) => {
                // Tomamos el artista propio de la pista o el del album como respaldo
                const nombreArtistaPista =
                  pista.artista?.nombre;
                // Duracion ya formateada en "m:ss" (ej. 70 -> "1:10")
                const duracionFormateada = formatearDuracion(pista.duracionSeg);

                // Retornamos la fila individual de la cancion
                return (
                  <li key={pista.id || indice} className="detalle-album-fila-pista">
                    {/* Columna 1 (solo web): numero de pista con clase predefinida cuerpo-p */}
                    <span className="detalle-album-col-num cuerpo-p">
                      {pista.numero ?? indice + 1}
                    </span>

                    {/* Columna 2: miniatura de portada + titulo y artista */}
                    <div className="detalle-album-col-titulo">
                      {/* Mini portada cuadrada (48px movil / 40px web) */}
                      <div className="detalle-album-pista-portada" aria-hidden="true">
                        {/* Reutilizamos Portada tomando la portada de la pista o la del album */}
                        <Portada
                          portada={pista.portada ?? album.portada}
                          className="detalle-album-portada-svg"
                        />
                      </div>
                      {/* Columna vertical de textos de la pista */}
                      <div className="detalle-album-pista-info">
                        {/* Fila del titulo con posible badge Explicito al lado */}
                        <div className="detalle-album-pista-titulo-fila">
                          {/* Nombre de la cancion usando clase predefinida cuerpo-p-fuerte */}
                          <span className="detalle-album-pista-titulo cuerpo-p-fuerte">
                            {pista.titulo}
                          </span>
                          {/* Si la pista es explicita, mostramos la etiqueta reutilizable desde la API */}
                          {pista.explicita && textosGeneral?.etiquetas?.explicito && (
                            <Etiqueta variante="neutra" className="detalle-album-explicito">
                              {textosGeneral.etiquetas.explicito}
                            </Etiqueta>
                          )}
                        </div>
                        {/* Nombre del artista de la pista usando clase predefinida detalle-nota */}
                        {nombreArtistaPista && (
                          <span className="detalle-album-pista-artista detalle-nota">
                            {nombreArtistaPista}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Columna 3 (solo web): reproducciones alineadas a la izquierda con clase cuerpo-p */}
                    <span className="detalle-album-col-reproducciones cuerpo-p">
                      {formatearReproducciones(pista.reproducciones, idioma)}
                    </span>

                    {/* Columna 4: duracion formateada "m:ss" alineada a la derecha con clase cuerpo-p */}
                    <span
                      // Columna derecha de duracion
                      className="detalle-album-col-duracion cuerpo-p"
                      // Lectura accesible completa para lectores de pantalla
                      aria-label={
                        textosAlbum?.tabla?.etiquetas?.duracion
                          ? `${textosAlbum.tabla.etiquetas.duracion}: ${duracionFormateada}`
                          : duracionFormateada
                      }
                    >
                      {/* Tiempo de la cancion */}
                      {duracionFormateada}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      {/* Pie con fecha larga y aviso legal: oculto en movil y visible en escritorio segun Figma */}
      {(fechaLarga || textosFooter?.legal?.nota) && (
        <div className="detalle-album-pie">
          {/* Fecha larga formateada sin new Date() usando clase detalle-nota */}
          {fechaLarga && (
            <p className="detalle-album-fecha detalle-nota">{fechaLarga}</p>
          )}
          {/* Linea de derechos y aviso de audio libre desde textos.footer */}
          {textosFooter?.legal?.nota && (
            <p className="detalle-album-legal detalle-nota">
              {[
                anio ? `© ${anio} ${album.artista?.nombre ?? ""}`.trim() : "",
                textosFooter.legal.nota,
              ]
                // Quitamos segmentos vacios
                .filter(Boolean)
                // Unimos con el separador oficial
                .join(separador)}
            </p>
          )}
        </div>
      )}

      {/* Seccion "Mas de {artista}": oculta en movil y visible en escritorio solo si hay otros albumes */}
      {masDelArtista.length > 0 && (
        <section
          // Contenedor de la seccion inferior
          className="detalle-album-mas"
          // Asocia la seccion con su titulo h2
          aria-labelledby="detalle-album-mas-titulo"
        >
          {/* Cabecera con titulo a la izquierda y "Ver discografia" a la derecha */}
          <div className="detalle-album-mas-cabecera">
            {/* Titulo "Mas de {artista}" usando clase predefinida titular-h2 */}
            <h2 id="detalle-album-mas-titulo" className="detalle-album-mas-titulo titular-h2">
              {tituloMasDelArtista}
            </h2>
            {/* Enlace derecho "Ver discografia" usando clase predefinida detalle-nota-fuerte */}
            {textosAlbum?.masDelArtista?.enlaces?.verDiscografia && (
              <a
                // Destino al catalogo filtrado por el genero del artista
                href={rutaDiscografia}
                // Estilos del enlace secundario mas tipografia predefinida
                className="detalle-album-mas-enlace detalle-nota-fuerte"
                // Navegacion SPA sin recargar pagina
                onClick={(evento) => {
                  // Evitamos recarga clasica del navegador
                  evento.preventDefault();
                  // Cambiamos de ruta con App.jsx
                  onNavegar?.(rutaDiscografia);
                }}
              >
                {/* Texto "Ver discografia" desde la API */}
                {textosAlbum.masDelArtista.enlaces.verDiscografia}
              </a>
            )}
          </div>

          {/* Grilla de tarjetas con portadas de 176x176px exactos segun Figma */}
          <div className="detalle-album-mas-cuadricula">
            {/* Recorremos cada lanzamiento adicional del mismo artista */}
            {masDelArtista.map((otro) => {
              // Extraemos el anio sin new Date()
              const anioOtro = extraerAnio(otro.fechaPublicacion);
              // Traducimos el tipo ("Album", "EP", "Sencillo")
              const tipoOtro = obtenerEtiquetaTipo(otro.tipo, textosAlbum, textosGeneral);
              // Armamos el subtitulo "{anio} · {tipo}" usando la plantilla de la API
              const subtituloOtro = textosAlbum?.masDelArtista?.etiquetas?.anioYTipo
                ? textosAlbum.masDelArtista.etiquetas.anioYTipo
                    .replace("{anio}", anioOtro)
                    .replace("{tipo}", tipoOtro)
                : [anioOtro, tipoOtro].filter(Boolean).join(separador);

              // Ruta SPA hacia el detalle del otro album
              const destino = `/albumes/${encodeURIComponent(otro.id)}`;

              // Retornamos la tarjeta como enlace <a> semantico real
              return (
                <a
                  // Clave unica de React por id de album
                  key={otro.id}
                  // URL real para accesibilidad y abrir en nueva pestana
                  href={destino}
                  // Estilos de la tarjeta de 176px de ancho
                  className="detalle-album-mas-tarjeta"
                  // Interceptamos el clic para navegar dentro de la SPA
                  onClick={(evento) => {
                    // Evitamos recarga completa
                    evento.preventDefault();
                    // Navegamos al nuevo detalle de album
                    onNavegar?.(destino);
                  }}
                >
                  {/* Caja cuadrada exacta de 176x176px para la portada */}
                  <div className="detalle-album-mas-portada">
                    {/* Portada SVG generada con los datos del otro lanzamiento */}
                    <Portada
                      portada={otro.portada}
                      className="detalle-album-portada-svg"
                      alt={otro.titulo}
                    />
                  </div>
                  {/* Titulo del otro lanzamiento con clase predefinida cuerpo-p-fuerte */}
                  <h3 className="detalle-album-mas-nombre cuerpo-p-fuerte">
                    {otro.titulo}
                  </h3>
                  {/* Subtitulo "{anio} · {tipo}" con clase predefinida detalle-nota */}
                  {subtituloOtro && (
                    <p className="detalle-album-mas-meta detalle-nota">
                      {subtituloOtro}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}