/**
 *
 * Módulo de edición de la landing page pública.
 * Cada sección (Hero, Nosotros, Servicios…) se guarda en Cloudflare D1
 * a través de /api/landing   GET / PUT
 *
 * Estructura de la API esperada:
 *   GET  /api/landing          → { ok, data: { hero:{}, about:{}, ... } }
 *   PUT  /api/landing          → body { section, data: {} } → { ok, data }
 */

import { useState, useEffect, useCallback } from "react";
import { authHeaders } from "../../hooks/useAuth";
import HeroSection from "./secciones/HeroSection";
import AboutSection from "./secciones/AboutSection";
import ServicesSection from "./secciones/ServicesSection";
import CongregSection from "./secciones/CongregSection";
import ContactSection from "./secciones/ContactSection";
import FooterSection from "./secciones/FooterSection";
import SocialSection from "./secciones/SocialSection";
import SEOSection from "./secciones/SEOSection";
import SectionHeader from "./components/SectionHeader";

// ─── Secciones del módulo ─────────────────────────────────────────────────────

const SECTIONS = [
  { id: "hero",     label: "Hero",            icon: "ti-home"             },
  { id: "about",    label: "Nosotros",         icon: "ti-users"            },
  { id: "services", label: "Servicios",        icon: "ti-grid-dots"        },
  { id: "congreg",  label: "Congregaciones",   icon: "ti-building-church"  },
  { id: "contact",  label: "Contacto",         icon: "ti-mail"             },
  { id: "footer",   label: "Footer",           icon: "ti-layout-bottombar" },
  { id: "social",   label: "Redes sociales",   icon: "ti-brand-instagram"  },
  { id: "seo",      label: "SEO",              icon: "ti-search"           },
];

// ─── Estado inicial (coincide con el HTML real de la landing) ─────────────────

const INITIAL_STATE = {
  hero: {
    badge: "Bienvenidos a casa",
    title: "SOMOS UNA IGLESIA CRISTIANA EVANGÉLICA CON",
    subtitle: "19 AÑOS SEMBRANDO BUENAS NUEVAS",
    verse: '"Id por todo el mundo y predicad el evangelio a toda criatura."',
    verseRef: "Marcos 16:15",
    ctaPrimary: "Más Información",
    ctaSecondary: "Contáctanos",
    bgImage: "",
    showBadge: true,
    showVerse: true,
  },
  about: {
    sectionTag: "Nuestra Identidad",
    title: "Una familia de fe comprometida con la Gran Comisión",
    description: "En CFC Bethel, llevamos más de una década sirviendo a nuestra comunidad y expandiendo el mensaje de esperanza en la nación.",
    description2: "Nuestra visión es formar discípulos que impacten su entorno, viviendo los principios del Reino de Dios con autenticidad y amor.",
    years: "19+",
    yearsLabel: "Años de Ministerio",
    image: "",
    values: [
      { icon: "ti-users-group", title: "Comunidad", desc: "Unidos en propósito." },
      { icon: "ti-globe",       title: "Misión",    desc: "Alcance global."      },
    ],
  },
  services: {
    sectionTitle: "Nuestros Servicios",
    sectionSub: "Espacios diseñados para tu crecimiento espiritual y conexión comunitaria.",
    items: [
      { title: "Escuela de Líderes",    time: "Miércoles 20:00h",        desc: "Formación integral para el desarrollo de dones y liderazgo ministerial.",          featured: false },
      { title: "Culto de Jóvenes",      time: "1er Sábado 18:00h",       desc: "Un tiempo dinámico de adoración y palabra relevante para la nueva generación.",    featured: false },
      { title: "Culto de Mujeres",      time: "3er Sábado 18:00h",       desc: "Espacio de comunión y empoderamiento para mujeres de fe.",                         featured: false },
      { title: "Cultos Dominicales",    time: "Domingo 11:30h y 18:00h", desc: "Nuestra reunión central. Un tiempo glorioso de alabanza, adoración y Palabra.",    featured: true  },
      { title: "PGM (Grupos Pequeños)", time: "Jueves y Viernes 20:00h", desc: "Grupos en casas para compartir, orar y crecer juntos en hermandad.",               featured: false },
    ],
  },
  congreg: {
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2376.665339197989!2d-115.38085319502014!3d32.603189079734186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d776aa18d4582b%3A0x9d49d2ae9c7c3c3f!2sCentro%20Familiar%20Cristiano%20Bethel!5e0!3m2!1ses-419!2smx!4v1777755895194!5m2!1ses-419!2smx",
    items: [
      { city: "Getafe, Madrid",  pastor: "Vilmar Francisco Natal y Claudineia Padilha Natal", address: "C/ Huerto, 4 — Getafe, Madrid",                      phone: "+34 690 71 79 91", schedule: "Miércoles 20:00h | Domingos 11:30h y 18:00h" },
      { city: "Lucero, Madrid",  pastor: "Alberto A. B. Tejada y Denisse L. N. Pérez de B.", address: "C/ Huerta de Castañeda, 5 — Barrio Lucero, Madrid", phone: "+34 660 50 93 63", schedule: "Jueves 19:00h | Domingos 12:00h" },
      { city: "Málaga",          pastor: "Maicon Moreira y Pamela Moreira",                  address: "C/ Camino de San Rafael, 91C — Málaga",               phone: "+34 744 65 47 05", schedule: "Jueves 20:00h | Domingos 11:30h" },
      { city: "Lepe, Huelva",    pastor: "Nuno y Equipo",                                    address: "C/ Salamanca, 67 — Lepe, Huelva",                     phone: "+34 600 39 77 20", schedule: "Viernes 20:00h | Domingos 11:30h" },
      { city: "Barcelona",       pastor: "Jesús Chacín y Alika Almarza",                     address: "C/ Carrer d'Isidre Nonell, 13 — Badalona",            phone: "+34 627 309 094",  schedule: "Miércoles 20:00h | Domingos 11:30h" },
      { city: "Valencia",        pastor: "Manoel y Naiara",                                  address: "C/ Alcañiz, 59 — Valencia",                           phone: "+34 654 41 57 19", schedule: "Miércoles 20:00h | Domingos 11:30h" },
    ],
  },
  contact: {
    phone: "+52 686 562 2298",
    address: "Rio Sta Cruz 3223, Villa Verde, 21395 B.C.",
    waNumber: "526865622298",
    ctaTitle: "¿Necesitas más información?",
    ctaSub: "Estamos aquí para ayudarte a encontrar la congregación más cercana.",
    ctaBtn: "Contáctanos",
    showWA: true,
  },
  footer: {
    tagline: "Una iglesia cristiana evangélica comprometida con la predicación del evangelio y el servicio a la comunidad.",
    copyright: "© 2026 CFCBethel. Todos los derechos reservados.",
    links: [
      { label: "Inicio",      url: "#"        },
      { label: "Nosotros",    url: "#welcome" },
      { label: "Congregaciones", url: "#congregations" },
      { label: "Ministerios", url: "#services"},
      { label: "Calendario", url: "#calendario"},
      { label: "Contacto",    url: "#contact" },
    ],
  },
  social: {
    instagram:    "@CFCBethel",
    facebook:     "CFC Bethel Oficial",
    youtube:      "Mensajes y Adoración",
    instagramUrl: "https://www.instagram.com/cfcbethel",
    facebookUrl:  "https://www.facebook.com/CFCBethelMexicali",
    youtubeUrl:   "https://www.youtube.com/@CentroFamiliarCristianoBethel",
  },
  seo: {
    title:       "CFCBethel | Iglesia Cristiana Evangélica",
    description: "Iglesia cristiana evangélica con 19 años sembrando buenas nuevas. Identidad, crecimiento y visión misionera.",
    pageUrl:     "bethel-ano.pages.dev",
    keywords:    "iglesia cristiana, evangélica, Mexico, CFCB, Bethel",
  },
};

// ─── Componentes de campo ─────────────────────────────────────────────────────

// ─── Secciones ────────────────────────────────────────────────────────────────


// ─── Mapa sección → componente ────────────────────────────────────────────────

const SECTION_COMPONENTS = {
  hero:     HeroSection,
  about:    AboutSection,
  services: ServicesSection,
  congreg:  CongregSection,
  contact:  ContactSection,
  footer:   FooterSection,
  social:   SocialSection,
  seo:      SEOSection,
};

const SECTION_META = {
  hero:     { title: "Sección Hero",       sub: "Banner principal que ve el visitante al entrar"         },
  about:    { title: "Nosotros",           sub: "Identidad, misión y valores de la iglesia"               },
  services: { title: "Nuestros Servicios", sub: "Cultos y reuniones regulares"                           },
  congreg:  { title: "Congregaciones",     sub: "Mapa e información de cada sede"                        },
  contact:  { title: "Contacto",           sub: "Datos de contacto y configuración del formulario"        },
  footer:   { title: "Footer",             sub: "Pie de página y enlaces rápidos"                        },
  social:   { title: "Redes Sociales",     sub: "Perfiles y URLs de cada red"                            },
  seo:      { title: "SEO & Metadatos",    sub: "Cómo aparece la web en Google y redes sociales"         },
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("hero");
  const [data,    setData]    = useState(INITIAL_STATE);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Carga desde API ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/landing")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.data) {
          setData((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {}) // Si la API no existe aún, usa el estado inicial
      .finally(() => setLoading(false));
  }, []);

  // ── Guarda sección activa ────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    
    try {
      await fetch("/api/landing", {
        method:  "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body:    JSON.stringify({ section: activeSection, data: data[activeSection] }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  }, [activeSection, data]);

  const handleChange = useCallback((section) => (newData) => {
    setData((prev) => ({ ...prev, [section]: newData }));
  }, []);

  const SectionComponent = SECTION_COMPONENTS[activeSection];
  const meta = SECTION_META[activeSection];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-0.5">Landing page</h1>
          <p className="text-sm text-slate-400">Edita el contenido de cada sección de la web pública</p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <i className="ti ti-external-link text-[15px]" aria-hidden="true" />
          <span className="hidden sm:inline">Ver web</span>
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Tabs — desktop: columna lateral | mobile: dropdown ── */}

        {/* Mobile selector */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900"
          >
            <span className="flex items-center gap-2">
              <i className={`ti ${SECTIONS.find(s => s.id === activeSection)?.icon} text-[17px]`} aria-hidden="true" />
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </span>
            <i className={`ti ti-chevron-${mobileMenuOpen ? "up" : "down"} text-[15px] text-slate-400`} aria-hidden="true" />
          </button>
          {mobileMenuOpen && (
            <div className="mt-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setActiveSection(s.id); setMobileMenuOpen(false); }}
                  className={[
                    "w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors",
                    activeSection === s.id
                      ? "bg-slate-950 text-[#FCD34D]"
                      : "text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <i className={`ti ${s.icon} text-[16px]`} aria-hidden="true" />
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop sidebar tabs */}
        <nav className="hidden lg:flex flex-col gap-0.5 w-50 shrink-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={[
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors cursor-pointer",
                activeSection === s.id
                  ? "bg-slate-950 text-[#FCD34D]"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              <i className={`ti ${s.icon} text-[16px] shrink-0`} aria-hidden="true" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* ── Panel de edición ── */}
        <div className="flex-1 min-w-0">
          <SectionHeader
            title={meta.title}
            sub={meta.sub}
            onSave={handleSave}
            saving={saving}
            saved={saved}
          />
          <SectionComponent
            data={data[activeSection]}
            onChange={handleChange(activeSection)}
          />
        </div>
      </div>
    </div>
  );
}