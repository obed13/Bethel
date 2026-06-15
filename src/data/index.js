// ── Navigation ────────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Inicio", href: "#" },
  { label: "Acerca de", href: "#welcome" },
  { label: "Congregaciones", href: "#congregations" },
  { label: "Ministerios", href: "#services" },
  { label: "Calendario", href: "#calendario" },
];

// ── Services / Ministerios ────────────────────────────────────────────────────
export const SERVICES = [
  {
    icon: "globe",
    title: "Oracion",
    schedule: "Lunes 07:00 p.m.",
    scheduleIcon: "clock",
    desc: "Formación integral para el desarrollo de dones y liderazgo ministerial.",
  },
  {
    icon: "church",
    title: "Servicio de Enseñanza",
    schedule: "Miércoles 07:00 p.m.",
    scheduleIcon: "clock",
    desc: "Un tiempo dinámico de adoración y palabra relevante para la nueva generación.",
  },
  {
    icon: "heart",
    title: "Culto de Mujeres",
    schedule: "3er Viernes 07:00 p.m.",
    scheduleIcon: "clock",
    desc: "Espacio de comunión y empoderamiento para mujeres de fe.",
  },
  {
    icon: "users",
    title: "Culto de Varones",
    schedule: "3er Viernes 07:00 p.m.",
    scheduleIcon: "clock",
    desc: "Grupos en casas para compartir, orar y crecer juntos en hermandad.",
  },
];

// ── Congregaciones ────────────────────────────────────────────────────────────
export const CONGREGATIONS = [
  {
    name: "Getafe, Madrid",
    region: "Comunidad de Madrid",
    pastors: "Vilmar Francisco Natal y Claudineia Padilha Natal",
    address: "C/ Huerto, 4 — Getafe, Madrid",
    phone: "+34 690 71 79 91",
    schedule: ["Miércoles: 20:00h (Escuela)", "Domingos: 11:30h y 18:00h"],
    img: "https://images.unsplash.com/photo-1508558936510-0af1e3cccbab?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Lucero, Madrid",
    region: "Comunidad de Madrid",
    pastors: "Alberto A. B. Tejada y Denisse L. N. Pérez de B.",
    address: "C/ Huerta de Castañeda, 5 — Barrio Lucero, Madrid",
    phone: "+34 660 50 93 63",
    schedule: ["Jueves: 19:00h (Oración)", "Domingos: 12:00h"],
    img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Málaga",
    region: "Andalucía",
    pastors: "Maicon Moreira y Pamela Moreira",
    address: "C/ Camino de San Rafael, 91C — Málaga",
    phone: "+34 744 65 47 05",
    schedule: ["Jueves: 20:00h", "Domingos: 11:30h"],
    img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Lepe, Huelva",
    region: "Andalucía",
    pastors: "Nuno y Equipo",
    address: "C/ Salamanca, 67, 21440 Lepe, Huelva",
    phone: "+34 600 39 77 20",
    schedule: ["Viernes: 20:00h (Alabanza)", "Domingos: 11:30h"],
    img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Barcelona",
    region: "Cataluña",
    pastors: "Jesús Chacín y Alika Almarza",
    address: "C/ Carrer d'Isidre Nonell, 13 — 08911 Badalona",
    phone: "+34 627 309 094",
    schedule: ["Miércoles: 20:00h", "Domingos: 11:30h"],
    img: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Valencia",
    region: "Comunidad Valenciana",
    pastors: "Manoel y Naiara",
    address: "C/ Alcañiz, 59 — Valencia",
    phone: "+34 654 41 57 19",
    schedule: ["Miércoles: 20:00h", "Domingos: 11:30h"],
    img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80",
  },
];

// ── Horarios ──────────────────────────────────────────────────────────────────
export const SCHEDULES = [
  { city: "Oracion", times: "Lunes 07:00 p.m" },
  { city: "Clase de Enseñanza", times: "Miércoles 07:00 p.m." },
  { city: "Servicio General", times: "Domingos 10:30 a.m." },
];

// ── Regiones ──────────────────────────────────────────────────────────────────
export const REGIONS = [
  "Todas",
  "Comunidad de Madrid",
  "Andalucía",
  "Cataluña",
  "Comunidad Valenciana",
];

// ── Redes sociales ────────────────────────────────────────────────────────────
export const SOCIALS = [
  { icon: "instagram", label: "Instagram", handle: "@CFCBethel", href: "https://www.instagram.com/cfcbethel"},
  { icon: "facebook", label: "Facebook", handle: "CFC Bethel Oficial", href: "https://www.facebook.com/CFCBethelMexicali"},
  { icon: "youtube", label: "YouTube", handle: "Mensajes y Adoración", href: "https://www.youtube.com/@CentroFamiliarCristianoBethel"},
];
