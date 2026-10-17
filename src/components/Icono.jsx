const TRAZOS = {
  buscar: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  cerrar: <path d="m6 6 12 12M6 18 18 6" />,
  favoritos: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  idioma: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z" /></>,
  accesibilidad: <><circle cx="12" cy="4" r="2" /><path d="M4 8h16M12 6v8m0 0-4 7m4-7 4 7" /></>,
  chevronAbajo: <path d="m6 9 6 6 6-6" />,
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
