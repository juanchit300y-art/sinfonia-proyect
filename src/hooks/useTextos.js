import { useConsulta } from "./useConsulta.js";

const CLAVES_MENU = ["inicio", "catalogo"];

function validarTextos(datos) {
  const textos = datos?.textos;
  const nav = textos?.navbar;
  const etiquetas = [
    nav?.logo?.texto,
    nav?.logo?.aria,
    ...CLAVES_MENU.map((clave) => nav?.enlaces?.[clave]),
    nav?.buscador?.placeholder,
    nav?.buscador?.borrar,
    nav?.botones?.invitado?.ingresar,
    nav?.botones?.invitado?.crearCuenta,
    nav?.usuario?.menu,
    nav?.usuario?.tuResumen,
    nav?.usuario?.ajustes,
    nav?.usuario?.estudio,
    nav?.usuario?.cerrarSesion,
    nav?.aria?.navegacion,
    nav?.aria?.idioma,
    nav?.aria?.accesibilidad,
    textos?.menuMovil?.abrir,
    textos?.menuMovil?.cerrar,
  ];

  if (!etiquetas.every((valor) => typeof valor === "string" && valor.trim())) {
    throw new Error("La respuesta no contiene los textos requeridos del navbar.");
  }
  return textos;
}

export function useTextos(idioma) {
  const { datos: textos, cargando, error, recargar } = useConsulta(
    `/textos?idioma=${encodeURIComponent(idioma)}`,
    {
      // Mantiene los textos actuales mientras llega el nuevo idioma para no desmontar Navbar ni Accesibilidad
      conservarDatosPrevios: true,
      transformar: validarTextos,
    }
  );

  return { textos, cargando, error, recargar };
}
