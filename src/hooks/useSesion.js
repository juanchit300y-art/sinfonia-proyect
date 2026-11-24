// Importamos useCallback (funciones estables), useEffect (carga inicial y eventos), useRef y useState de React
import { useCallback, useEffect, useRef, useState } from "react";
// Importamos el cliente HTTP centralizado que ya envia credentials: "include" para la cookie httpOnly "sesion"
import { peticionApi } from "../services/api.js";

// Nombre del evento global del navegador que dispara api.js cuando una ruta privada responde 401 no_autenticado
export const EVENTO_NO_AUTENTICADO = "sintonia-no-autenticado";

// Funcion auxiliar que normaliza la forma del usuario devuelto por GET /sesion o POST /sesion
function extraerUsuario(respuesta) {
  // Si no llego objeto de respuesta devolvemos null (sin sesion)
  if (!respuesta || typeof respuesta !== "object") {
    // No hay datos de usuario validos
    return null;
  }
  // GET /sesion devuelve el usuario directo en raiz; POST /sesion lo envuelve en { usuario, token }
  const candidato = respuesta.usuario ?? respuesta;
  // Validamos que al menos traiga un identificador real de usuario antes de aceptarlo
  return candidato?.id ? candidato : null;
}

// Hook global de sesion persistente: la unica fuente de verdad es la cookie httpOnly "sesion" via GET /sesion
export function useSesion({ onNoAutenticado } = {}) {
  // Estado en memoria con los datos del usuario autenticado (null si es invitado; NUNCA se usa localStorage)
  const [usuario, setUsuario] = useState(null);
  // Bandera que indica si estamos consultando GET /sesion al arrancar o recargar la aplicacion
  const [cargandoSesion, setCargandoSesion] = useState(true);
  // Bandera que evita dobles clics mientras se ejecuta DELETE /sesion para cerrar sesion
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  // Guardamos onNoAutenticado en un ref para poder recibir una funcion inline desde App.jsx sin reiniciar efectos
  const onNoAutenticadoRef = useRef(onNoAutenticado);
  // Mantenemos el ref siempre actualizado con la ultima funcion entregada por App.jsx
  onNoAutenticadoRef.current = onNoAutenticado;
  // Guardamos el AbortController de la verificacion inicial para cancelarla si el usuario inicia sesion antes de que termine
  const controladorInicialRef = useRef(null);

  // Funcion reutilizable que consulta GET /api/v1/sesion para saber si el navegador tiene cookie de sesion valida
  const verificarSesion = useCallback(async (signal) => {
    // Indicamos que la verificacion esta en curso
    setCargandoSesion(true);
    // Ejecutamos la peticion GET /sesion con la cookie httpOnly enviada automaticamente por el navegador
    try {
      // peticionApi incluye credentials: "include" para adjuntar la cookie "sesion"
      const respuesta = await peticionApi("/sesion", {
        // Metodo GET porque solo estamos consultando quien inicio sesion
        metodo: "GET",
        // Senal opcional de AbortController para cancelar si el componente se desmonta
        signal,
      });
      // Guardamos al usuario devuelto en memoria de React si la respuesta es valida
      setUsuario(extraerUsuario(respuesta));
    } catch (error) {
      // Si la consulta fue cancelada por desmontaje (ej. StrictMode en desarrollo), salimos sin tocar estado
      if (error?.name === "AbortError") {
        // Detenemos el manejo del error abortado
        return;
      }
      // Un 401 no_autenticado significa simplemente que no hay sesion iniciada: dejamos usuario en null
      setUsuario(null);
    } finally {
      // Solo apagamos cargandoSesion si esta peticion no fue abortada antes de terminar
      if (!signal?.aborted) {
        // Ya sabemos si hay usuario autenticado o si es invitado
        setCargandoSesion(false);
      }
    }
  }, []);

  // Efecto inicial: al montar App.jsx (abrir o recargar con F5) preguntamos a GET /sesion si hay sesion activa
  useEffect(() => {
    // Creamos un controlador para cancelar la peticion si el componente se desmonta antes de responder
    const controlador = new AbortController();
    // Guardamos la referencia para poder abortar si inicia sesion manualmente antes de que termine este GET
    controladorInicialRef.current = controlador;
    // Disparamos la consulta inicial contra GET /api/v1/sesion
    verificarSesion(controlador.signal);
    // Funcion de limpieza que aborta la peticion si React desmonta el componente
    return () => {
      // Cancelamos la peticion en vuelo si aun seguia abierta
      controlador.abort();
      // Soltamos la referencia si seguia apuntando a este controlador
      if (controladorInicialRef.current === controlador) {
        controladorInicialRef.current = null;
      }
    };
  }, [verificarSesion]);

  // Efecto de seguridad: escucha el evento global si una peticion privada recibe 401 no_autenticado
  useEffect(() => {
    // Manejador que limpia la sesion local vencida y redirige a /ingresar via App.jsx
    function alExpirarSesion() {
      // Borramos al usuario de memoria porque la cookie ya no es valida en el servidor
      setUsuario(null);
      // Apagamos cualquier bandera de carga pendiente
      setCargandoSesion(false);
      // Avisamos a App.jsx para que redirija a /ingresar
      onNoAutenticadoRef.current?.();
    }

    // Registramos el listener global en window
    window.addEventListener(EVENTO_NO_AUTENTICADO, alExpirarSesion);
    // Eliminamos el listener al desmontar para no dejar fugas de memoria
    return () => window.removeEventListener(EVENTO_NO_AUTENTICADO, alExpirarSesion);
  }, []);

  // Actualiza la sesion en memoria justo despues de un POST /sesion exitoso (sin hacer otro GET inmediato)
  const iniciarSesionLocal = useCallback((usuarioNuevo) => {
    // Cancelamos cualquier GET /sesion inicial rezagado para que un 401 tardio no borre la sesion recien abierta
    controladorInicialRef.current?.abort();
    // Guardamos al usuario autenticado en el estado global
    setUsuario(extraerUsuario(usuarioNuevo));
    // Confirmamos que la sesion ya no esta cargando
    setCargandoSesion(false);
  }, []);

  // Cierra la sesion en el servidor enviando DELETE /api/v1/sesion (204 No Content) y limpia el estado local
  const cerrarSesion = useCallback(async () => {
    // Si ya hay un cierre en proceso, evitamos disparar una segunda peticion DELETE
    if (cerrandoSesion) {
      // Informamos que no se inicio un nuevo cierre
      return false;
    }

    // Activamos la bandera de cierre en curso para deshabilitar el boton "Cerrar sesion"
    setCerrandoSesion(true);
    // Ejecutamos DELETE /api/v1/sesion para que el backend invalide la sesion y borre la cookie httpOnly
    try {
      // Enviamos DELETE con credentials: "include" para que el servidor identifique y elimine la cookie "sesion"
      await peticionApi("/sesion", {
        // Metodo HTTP DELETE segun el contrato oficial (responde 204 No Content)
        metodo: "DELETE",
      });
      // Limpiamos el usuario en memoria al confirmarse el cierre en el servidor
      setUsuario(null);
      // Devolvemos true para que App.jsx sepa que el cierre fue exitoso y navegue al inicio
      return true;
    } catch (error) {
      // Si el servidor respondio 401, la sesion ya estaba cerrada o vencida, asi que limpiamos igual
      if (error?.status === 401 || error?.codigo === "no_autenticado") {
        // Quitamos el usuario local vencido
        setUsuario(null);
        // Confirmamos que ya no hay sesion activa
        return true;
      }
      // Si fallo por red u otro error inesperado, devolvemos false sin romper la interfaz
      return false;
    } finally {
      // Siempre restauramos la bandera cerrandoSesion al terminar la peticion
      setCerrandoSesion(false);
    }
  }, [cerrandoSesion]);

  // Limpia manualmente la sesion y dispara la redireccion a /ingresar cuando una vista detecta 401
  const manejarNoAutenticado = useCallback(() => {
    // Limpiamos el usuario en memoria
    setUsuario(null);
    // Ejecutamos la redireccion configurada por App.jsx
    onNoAutenticadoRef.current?.();
  }, []);

  // Exponemos el estado actual de la sesion y todas las acciones seguras para App.jsx, Navbar y Footer
  return {
    // Objeto del usuario autenticado (id, nombre, correo, iniciales, color, plan...) o null si es invitado
    usuario,
    // True mientras GET /sesion verifica la cookie al cargar la pagina
    cargandoSesion,
    // True mientras DELETE /sesion esta en curso
    cerrandoSesion,
    // Funcion para guardar el usuario recien autenticado tras POST /sesion
    iniciarSesionLocal,
    // Funcion asincrona para cerrar sesion con DELETE /sesion
    cerrarSesion,
    // Funcion para volver a consultar GET /sesion manualmente si hiciera falta
    verificarSesion,
    // Funcion para limpiar sesion y redirigir a /ingresar ante un 401 no_autenticado
    manejarNoAutenticado,
  };
}