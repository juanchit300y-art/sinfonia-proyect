const TRAZOS = {
  inicio: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4.5v-6h3v6H18a1 1 0 0 0 1-1V9.5" /></>,
  buscar: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  salir: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  cerrar: <path d="m6 6 12 12M6 18 18 6" />,
  favoritos: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  idioma: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z" /></>,
  accesibilidad: <><circle cx="12" cy="4" r="2" /><path d="M4 8h16M12 6v8m0 0-4 7m4-7 4 7" /></>,
  chevronAbajo: <path d="m6 9 6 6 6-6" />,
  chevronIzquierda: <path d="m15 18-6-6 6-6" />,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  alerta: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></>,
  exito: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.2 2.4 2.4 4.8-4.8" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  sinConexion: <><path d="M2 2 22 22" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M5 13a10 10 0 0 1 5.2-2.6" /><path d="M15.8 10.6A10 10 0 0 1 19 13" /><path d="M12 20h.01" /></>,
  reintentar: <><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" /><path d="M21 3v5h-5" /></>,
  disco: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" /></>,
  ojo: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  ojoTachado: <><path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" /><path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-3.1 4.2" /><path d="M6.6 6.6A18.3 18.3 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5.4-1.5" /></>,
  logo: (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="16" fill="var(--marca-primario, #C6F24E)" />
      <rect x="5.5" y="12" width="3" height="8" rx="1.5" fill="var(--texto-sobre-marca, #10130A)" />
      <rect x="11.5" y="8" width="3" height="16" rx="1.5" fill="var(--texto-sobre-marca, #10130A)" />
      <rect x="17.5" y="10.5" width="3" height="11" rx="1.5" fill="var(--texto-sobre-marca, #10130A)" />
      <rect x="23.5" y="13.5" width="3" height="5" rx="1.5" fill="var(--texto-sobre-marca, #10130A)" />
    </svg>
  ),
};

export default function Icono({ nombre, className = "" }) {
  if (nombre === "logo") {
    return TRAZOS.logo;
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
