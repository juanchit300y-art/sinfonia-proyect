import { useState } from "react";
import Icono from "./Icono.jsx";
import Portada from "./Portada.jsx";
import "./IniciarSesion.css";

// Definicion de las 8 portadas decorativas del panel derecho (4x2) usando solo tokens de diseno de Figma
const PORTADAS_GALERIA = [
  { id: "gal-1", patron: 2, colores: ["portada/3", "fijo/negro", "fijo/blanco"] },
  { id: "gal-2", patron: 0, colores: ["portada/5", "portada/1"] },
  { id: "gal-3", patron: 1, colores: ["portada/2", "portada/4"] },
  { id: "gal-4", patron: 1, colores: ["portada/6", "portada/3"] },
  { id: "gal-5", patron: 3, colores: ["portada/4", "portada/2", "fijo/blanco"] },
  { id: "gal-6", patron: 3, colores: ["fijo/negro", "portada/5", "fijo/blanco"] },
  { id: "gal-7", patron: 0, colores: ["portada/3", "portada/4"] },
  { id: "gal-8", patron: 2, colores: ["portada/6", "portada/5", "fijo/blanco"] },
];

// Definicion de las 3 portadas del collage superior exclusivo de movil (390px) segun Figma
const PORTADAS_MOVIL = [
  { id: "mov-centro", clase: "ingresar-collage-centro", patron: 2, colores: ["portada/3", "fijo/negro", "fijo/blanco"] },
  { id: "mov-izq", clase: "ingresar-collage-izq", patron: 0, colores: ["portada/5", "portada/1"] },
  { id: "mov-der", clase: "ingresar-collage-der", patron: 1, colores: ["portada/2", "portada/4"] },
];

// Declaramos y exportamos la Vista 4 · Iniciar sesion (/ingresar) - Paso 2: Ver/ocultar contrasena
export default function IniciarSesion({
  // Objeto completo de textos traducidos descargado desde GET /api/v1/textos
  textos,
  // Funcion de navegacion SPA recibida desde App.jsx para cambiar de ruta sin recargar
  onNavegar,
}) {
  // Estado booleano que controla si la contrasena se ve en texto plano (true) o con puntos (false)
  const [mostrarClave, setMostrarClave] = useState(false);
  // Extraemos el subobjeto de textos propios de la pagina de inicio de sesion
  const textosIngresar = textos?.paginas?.ingresar;
  // Extraemos el subobjeto del formulario (titulo, subtitulo, etiquetas, botones y enlaces)
  const formulario = textosIngresar?.formulario;
  // Extraemos el subobjeto de presentacion del panel derecho (titulo y bajada)
  const presentacion = textosIngresar?.presentacion;
  // Obtenemos el nombre de la marca en minusculas igual que en Navbar y Footer
  const nombreMarca = (textos?.navbar?.logo?.texto ?? textos?.sitio?.nombre)?.toLowerCase();
  // Calculamos el anio actual para rellenar la plantilla oficial de derechos de autor
  const anioActual = new Date().getFullYear();
  // Construimos la linea legal inferior reemplazando {anio} desde textos.footer.legal.derechos
  const textoDerechos = textos?.footer?.legal?.derechos?.replace("{anio}", String(anioActual));

  // Funcion auxiliar para navegar dentro de la SPA evitando recargas completas del navegador
  function manejarNavegacion(evento, ruta) {
    // Verificamos que App.jsx haya entregado el callback onNavegar
    if (typeof onNavegar === "function") {
      // Cancelamos la navegacion clasica del enlace HTML
      evento.preventDefault();
      // Cambiamos la ruta con window.history.pushState desde App.jsx
      onNavegar(ruta);
    }
  }

  // prevenimos la recarga nativa al pulsar el boton
  function manejarEnvioVisual(evento) {
    evento.preventDefault();
  }

  // Retornamos el layout dividido de pantalla completa (columna izquierda formulario + columna derecha visual)
  return (
    // Seccion principal de la vista vinculada por accesibilidad al titulo h1
    <section id="ingresar" className="ingresar" aria-labelledby="ingresar-titulo">
      {/* Columna izquierda: collage movil, logo, formulario y pie de derechos en escritorio */}
      <div className="ingresar-columna-formulario">
        {/* Collage superior de 3 portadas visible unicamente en movil*/}
        <div className="ingresar-collage-movil" aria-hidden="true">
          {/* Recorremos las 3 portadas superpuestas definidas con tokens oficiales */}
          {PORTADAS_MOVIL.map((item) => (
            // Caja posicionada de cada portada del collage movil
            <div key={item.id} className={`ingresar-collage-item ${item.clase}`}>
              <Portada
                // Llena toda su caja sin saltos hover decorativos
                className="ingresar-galeria-portada"
                // Numero de patron oficial (0, 1 o 2)
                patron={item.patron}
                // Tokens de color oficiales
                colores={item.colores}
              />
            </div>
          ))}
        </div>

        {/* Cabecera minimalista con el logotipo clickeable para volver al inicio */}
        <header className="ingresar-cabecera">
          {/* Enlace semantico hacia la pagina de inicio */}
          <a
            // Ruta real de destino para accesibilidad
            href="/"
            className="ingresar-marca"
            // Etiqueta accesible del logo proveniente de la API
            aria-label={textos?.navbar?.logo?.aria}
            // Intercepta el clic para navegar por la SPA
            onClick={(evento) => manejarNavegacion(evento, "/")}
          >
            {/* Isotipo oficial verde con barras de sonido */}
            <Icono nombre="logo" />
            {/* Nombre de la marca reutilizando la clase predefinida titular-h3 */}
            <span className="titular-h3 ingresar-marca-texto">{nombreMarca}</span>
          </a>
        </header>

        {/* Contenedor central que aloja el encabezado y los campos del formulario */}
        <div className="ingresar-cuerpo">
          {/* Titulo principal usando la clase tipografica predefinida titular-h1 */}
          <h1 id="ingresar-titulo" className="ingresar-titulo titular-h1">
            {formulario?.titulo} {/* texto titulo */}
          </h1>

          {/* Subtitulo explicativo usando la clase predefinida cuerpo-p */}
          <p className="ingresar-subtitulo cuerpo-p">
            {formulario?.subtitulo} {/* texto subtitulo */}
          </p>

          {/* Formulario semantico con noValidate para controlar la validacion personalizada en el Paso 3 */}
          <form className="ingresar-formulario" onSubmit={manejarEnvioVisual} noValidate>
            {/* Grupo 1: campo de correo electronico */}
            <div className="ingresar-grupo">
              {/* Etiqueta asociada por htmlFor al input de correo usando detalle-nota-fuerte */}
              <label htmlFor="ingresar-correo" className="ingresar-etiqueta detalle-nota-fuerte">
                {/* Texto "Correo electronico" desde la API */}
                {formulario?.etiquetas?.correo}
              </label>
              {/* Campo de entrada para el correo usando la clase tipografica cuerpo-p */}
              <input
                // Identificador unico enlazado a la etiqueta label
                id="ingresar-correo"
                // Nombre semantico del campo
                name="correo"
                // Tipo email para teclado adaptado en moviles
                type="email"
                // Sugerencia de autocompletado estandar del navegador
                autoComplete="email"
                // Texto guia proveniente de textos.paginas.ingresar.formulario.placeholders.correo
                placeholder={formulario?.placeholders?.correo}
                className="ingresar-campo cuerpo-p"
              />
            </div>

            {/* Grupo 2: campo de contrasena */}
            <div className="ingresar-grupo">
              {/* Etiqueta asociada por htmlFor al input de contrasena */}
              <label htmlFor="ingresar-clave" className="ingresar-etiqueta detalle-nota-fuerte">
                {/* Texto "Contrasena" desde la API */}
                {formulario?.etiquetas?.clave}
              </label>
              {/* Contenedor relativo que aloja el input de contrasena y el boton de ojo */}
              <div className="ingresar-campo-clave">
                {/* Campo de entrada: alterna entre "text" (visible) y "password" (puntos) segun mostrarClave */}
                <input
                  // Identificador unico enlazado a la etiqueta label
                  id="ingresar-clave"
                  // Nombre semantico del campo
                  name="clave"
                  // Si mostrarClave es true muestra texto plano; si es false el navegador pinta puntos
                  type={mostrarClave ? "text" : "password"}
                  // Sugerencia de autocompletado de contrasena actual
                  autoComplete="current-password"
                  // Estilos del campo con espacio derecho reservado para el icono del ojo
                  className="ingresar-campo ingresar-campo--clave cuerpo-p"
                />
                {/* Boton interactivo para mostrar u ocultar la contrasena sin enviar el formulario */}
                <button
                  // Tipo button explicito para que al pulsarlo NO dispare el submit del formulario
                  type="button"
                  // Clase que posiciona el icono dentro del borde derecho del campo
                  className="ingresar-boton-clave"
                  // Etiqueta accesible traducida desde la API ("Ocultar contrasena" o "Mostrar contrasena")
                  aria-label={
                    mostrarClave
                      ? formulario?.botones?.ocultarClave
                      : formulario?.botones?.mostrarClave
                  }
                  // Informa a lectores de pantalla si la visibilidad esta activada o no
                  aria-pressed={mostrarClave}
                  // Invierte el estado booleano actual (false -> true -> false)
                  onClick={() => setMostrarClave((visible) => !visible)}
                >
                  {/* Dibuja ojo tachado cuando la clave se ve, u ojo abierto cuando esta oculta */}
                  <Icono
                    nombre={mostrarClave ? "ojoTachado" : "ojo"}
                    className="ingresar-boton-clave-icono"
                  />
                </button>
              </div>
            </div>

            {/* Fila intermedia: casilla "Mantener la sesion iniciada" y enlace "Olvidaste tu contrasena?" */}
            <div className="ingresar-opciones">
              {/* Etiqueta interactiva que envuelve la casilla para ampliar el area de clic */}
              <label className="ingresar-recordar detalle-nota">
                {/* Casilla de verificacion nativa estilizada al tono verde de Figma */}
                <input
                  // Tipo casilla de verificacion
                  type="checkbox"
                  // Nombre del campo
                  name="mantenerSesion"
                  // Marcada inicialmente igual que en la pantalla de Figma
                  defaultChecked
                  // Clase que personaliza el cuadro verde y la palomita oscura
                  className="ingresar-checkbox"
                />
                {/* Texto "Mantener la sesion iniciada" desde la API */}
                <span>{formulario?.etiquetas?.mantenerSesion}</span>
              </label>

              {/* Enlace subrayado para recuperacion de contrasena */}
              <a
                // Destino de recuperacion
                href="/recuperar"
                // Estilo de enlace subrayado con tipografia detalle-nota-fuerte
                className="ingresar-enlace detalle-nota-fuerte"
                // Navegacion SPA sin recarga
                onClick={(evento) => manejarNavegacion(evento, "/recuperar")}
              >
                {/* Texto "Olvidaste tu contrasena?" desde la API */}
                {formulario?.enlaces?.olvidasteClave}
              </a>
            </div>

            {/* Boton primario de envio en forma de pildora verde lima */}
            <button type="submit" className="ingresar-boton cuerpo-p-fuerte">
              {/* Texto "Ingresar" desde la API */}
              {formulario?.botones?.ingresar}
            </button>
          </form>

          {/* Pie del formulario con enlace para quienes aun no tienen cuenta */}
          <p className="ingresar-registro detalle-nota">
            {/* Texto "No tienes cuenta?" desde la API */}
            <span>{formulario?.mensajes?.sinCuenta}</span>{" "}
            {/* Enlace hacia la vista de registro (/crear-cuenta) */}
            <a
              // Ruta real hacia crear cuenta
              href="/crear-cuenta"
              // Estilo de enlace subrayado con tipografia detalle-nota-fuerte
              className="ingresar-enlace detalle-nota-fuerte"
              // Navegacion SPA sin recarga
              onClick={(evento) => manejarNavegacion(evento, "/crear-cuenta")}
            >
              {/* Texto "Crea una cuenta" desde la API */}
              {formulario?.enlaces?.crearCuenta}
            </a>
          </p>
        </div>

        {/* Linea legal inferior anclada al pie de la columna izquierda */}
        <footer className="ingresar-pie">
          {/* Derechos de autor con el anio actual usando la clase detalle-nota */}
          <p className="ingresar-derechos detalle-nota">{textoDerechos}</p>
        </footer>
      </div>
      
      {/* --------------------------------------------------- apartado derecho */}
      {/* Columna derecha decorativa: cuadricula 4x2 de portadas y mensaje de bienvenida (visible en escritorio) */}
      <aside className="ingresar-columna-visual" aria-labelledby="ingresar-presentacion-titulo">
        {/* Bloque interno centrado vertical y horizontalmente */}
        <div className="ingresar-visual-contenido">
          {/* Cuadricula decorativa de 8 portadas SVG (oculta a lectores de pantalla) */}
          <div className="ingresar-galeria" aria-hidden="true">
            {/* Recorremos las 8 portadas definidas con tokens oficiales */}
            {PORTADAS_GALERIA.map((item) => (
              // Caja cuadrada redondeada para cada portada
              <div key={item.id} className="ingresar-galeria-item">
                {/* Componente vectorial oficial Portada con patron y colores de Figma */}
                <Portada
                  className="ingresar-galeria-portada"
                  // Numero de patron oficial (0: anillos, 1: rayas, 2: colina, 3: puntos)
                  patron={item.patron}
                  // Paleta de tokens oficiales del sistema de diseno
                  colores={item.colores}
                />
              </div>
            ))}
          </div>

          {/* Titulo promocional derecho enlazado por id al aria-labelledby del aside */}
          <h2 id="ingresar-presentacion-titulo" className="ingresar-presentacion-titulo titular-h2">
            {/* Texto "Tu musica, siempre a mano" desde la API */}
            {presentacion?.titulo}
          </h2>

          {/* Subtitulo descriptivo derecho usando la clase predefinida cuerpo-m */}
          <p className="ingresar-presentacion-texto cuerpo-m">
            {/* Texto "Explora albumes y artistas de todos los generos." desde la API */}
            {presentacion?.texto}
          </p>
        </div>
      </aside>
    </section>
  );
}