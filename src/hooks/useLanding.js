/**
 *
 * Hook centralizado para leer el contenido de la landing page desde /api/landing.
 * Todos los componentes de la landing (Hero, About, Services...) lo usan.
 *
 * Uso:
 *   const { data, loading } = useLanding();
 *   const hero = data?.hero;
 */

import { useState, useEffect } from "react";

// Valores por defecto — se usan si la API no responde o no tiene datos guardados
const DEFAULTS = {
  hero: {
    badge:        "Bienvenidos a casa",
    title:        "SOMOS UNA IGLESIA CRISTIANA EVANGÉLICA CON",
    subtitle:     "19 AÑOS SEMBRANDO BUENAS NUEVAS",
    verse:        '"Id por todo el mundo y predicad el evangelio a toda criatura."',
    verseRef:     "Marcos 16:15",
    ctaPrimary:   "Más Información",
    ctaSecondary: "Contáctanos",
    bgImage:      "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80",
    showBadge:    true,
    showVerse:    true,
  },
  about: {
    sectionTag:   "Nuestra Identidad",
    title:        "Una familia de fe comprometida con la Gran Comisión",
    description:  "En MSBN España, llevamos más de dos décadas sirviendo a nuestra comunidad y expandiendo el mensaje de esperanza en la nación.",
    description2: "Nuestra visión es formar discípulos que impacten su entorno, viviendo los principios del Reino de Dios con autenticidad y amor.",
    years:        "19+",
    yearsLabel:   "Años de Ministerio",
    image:        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    values: [
      { icon: "ti-users-group", title: "Comunidad", desc: "Unidos en propósito." },
      { icon: "ti-globe",       title: "Misión",    desc: "Alcance global."      },
    ],
  },
  services: {
    sectionTitle: "Nuestros Servicios",
    sectionSub:   "Espacios diseñados para tu crecimiento espiritual y conexión comunitaria.",
    items: [
      { title: "Escuela de Líderes",    time: "Miércoles 20:00h",        desc: "Formación integral para el desarrollo de dones y liderazgo ministerial.",       featured: false },
      { title: "Culto de Jóvenes",      time: "1er Sábado 18:00h",       desc: "Un tiempo dinámico de adoración y palabra relevante para la nueva generación.", featured: false },
      { title: "Culto de Mujeres",      time: "3er Sábado 18:00h",       desc: "Espacio de comunión y empoderamiento para mujeres de fe.",                      featured: false },
      { title: "Cultos Dominicales",    time: "Domingo 11:30h y 18:00h", desc: "Nuestra reunión central. Un tiempo glorioso de alabanza, adoración y Palabra.",  featured: true  },
      { title: "PGM (Grupos Pequeños)", time: "Jueves y Viernes 20:00h", desc: "Grupos en casas para compartir, orar y crecer juntos en hermandad.",            featured: false },
    ],
  },
  congreg: {
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6288604.49969116!2d-6.344078873266518!3d39.89736809623631",
    items: [],
  },
  contact: {
    phone:    "+34 690 717 991",
    address:  "C/ Huerto, 4, Getafe - Madrid",
    waNumber: "34690717991",
    ctaTitle: "¿Necesitas más información?",
    ctaSub:   "Estamos aquí para ayudarte a encontrar la congregación más cercana.",
    ctaBtn:   "Contáctanos",
    showWA:   true,
  },
  footer: {
    tagline:   "Una iglesia cristiana evangélica comprometida con la predicación del evangelio y el servicio a la comunidad.",
    copyright: "© 2026 Bethel. Todos los derechos reservados.",
    links: [
      { label: "Inicio",      url: "#"        },
      { label: "Nosotros",    url: "#welcome" },
      { label: "Ministerios", url: "#services"},
      { label: "Contacto",    url: "#contact" },
    ],
  },
  social: {
    instagram:    "@msbnespana",
    facebook:     "MSBN España Oficial",
    youtube:      "Mensajes y Adoración",
    instagramUrl: "#",
    facebookUrl:  "#",
    youtubeUrl:   "#",
  },
  seo: {
    title:       "Bethel | Iglesia Cristiana Evangélica",
    description: "Iglesia Cristiana Evangélica con 19 años sembrando buenas nuevas.",
    keywords:    "iglesia cristiana, evangélica, Bethel",
  },
};

let _cache = null; // caché en memoria para no repetir el fetch en cada componente

export function useLanding() {
  const [data,    setData]    = useState(_cache ?? DEFAULTS);
  const [loading, setLoading] = useState(!_cache);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (_cache) return; // ya tenemos datos, no hace falta volver a pedir

    fetch("/api/landing")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.data) {
          // Mezcla los defaults con lo que viene de la BD
          // (si una sección aún no tiene datos en la BD, usa el default)
          const merged = {};
          for (const key of Object.keys(DEFAULTS)) {
            const fromDb = json.data[key];
            // Solo sustituye si la sección de la BD tiene datos reales (no '{}' vacío)
            merged[key] = (fromDb && Object.keys(fromDb).length > 0)
              ? { ...DEFAULTS[key], ...fromDb }
              : DEFAULTS[key];
          }
          _cache = merged;
          setData(merged);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

/** Acceso directo a una sección específica */
export function useLandingSection(section) {
  const { data, loading, error } = useLanding();
  return { data: data?.[section] ?? DEFAULTS[section], loading, error };
}