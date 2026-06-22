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

function Field({ label, value, onChange, type = "text", placeholder = "", hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900
            outline-none focus:border-slate-950 focus:bg-white transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900
            outline-none focus:border-slate-950 focus:bg-white transition-colors"
        />
      )}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-t border-slate-100">
      <span className="text-sm text-slate-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer",
          checked ? "bg-slate-950" : "bg-slate-200",
        ].join(" ")}
      >
        <span className={[
          "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200",
          checked ? "translate-x-4.5" : "translate-x-0.5",
        ].join(" ")} />
      </button>
    </div>
  );
}

function ImgUpload({ label, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</label>
      <div className="flex items-center gap-3 px-3 py-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-slate-950 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
          <i className="ti ti-photo text-[18px] text-slate-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Haz clic para subir</p>
          <p className="text-[11px] text-slate-400">{hint}</p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold text-slate-900">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddBtn({ onClick, label = "Añadir" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-[12px] text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <i className="ti ti-plus text-[13px]" aria-hidden="true" /> {label}
    </button>
  );
}

function DelBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Eliminar"
      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
    >
      <i className="ti ti-trash text-[14px]" aria-hidden="true" />
    </button>
  );
}

function SectionHeader({ title, sub, onSave, saving, saved }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-400">{sub}</p>
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={[
          "flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-medium transition-colors cursor-pointer",
          saved
            ? "bg-emerald-600 text-white"
            : "bg-slate-950 text-white hover:bg-slate-800",
          saving ? "opacity-60" : "",
        ].join(" ")}
      >
        <i className={`ti ${saving ? "ti-loader animate-spin" : saved ? "ti-check" : "ti-device-floppy"} text-[15px]`} aria-hidden="true" />
        {saving ? "Guardando…" : saved ? "Guardado" : "Guardar cambios"}
      </button>
    </div>
  );
}

// ─── Secciones ────────────────────────────────────────────────────────────────

function HeroSection({ data, onChange }) {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="flex flex-col gap-4">
      <ImgUpload label="Imagen de fondo" hint="JPG/PNG · Recomendado 1920×1080px" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Badge superior"   value={data.badge}       onChange={s("badge")}       placeholder="Bienvenidos a casa" />
        <Field label="Título principal" value={data.title}       onChange={s("title")}       placeholder="SOMOS UNA IGLESIA..." />
        <Field label="Subtítulo"        value={data.subtitle}    onChange={s("subtitle")}    placeholder="22 AÑOS..." />
        <Field label="Botón primario"   value={data.ctaPrimary}  onChange={s("ctaPrimary")}  placeholder="Más Información" />
        <Field label="Botón secundario" value={data.ctaSecondary} onChange={s("ctaSecondary")} placeholder="Contáctanos" />
      </div>
      <Card title="Versículo bíblico">
        <div className="flex flex-col gap-3">
          <Field label="Texto del versículo" value={data.verse}    onChange={s("verse")}    type="textarea" />
          <Field label="Referencia"          value={data.verseRef} onChange={s("verseRef")} placeholder="Marcos 16:15" />
          <Toggle label="Mostrar versículo"  checked={data.showVerse} onChange={s("showVerse")} />
        </div>
      </Card>
      <Toggle label="Mostrar badge de bienvenida" checked={data.showBadge} onChange={s("showBadge")} />
    </div>
  );
}

function AboutSection({ data, onChange }) {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  const addValue = () => onChange({ ...data, values: [...data.values, { icon: "ti-heart", title: "Nuevo valor", desc: "Descripción" }] });
  const delValue = (i) => onChange({ ...data, values: data.values.filter((_, idx) => idx !== i) });
  const setVal   = (i, key, val) => {
    const v = [...data.values];
    v[i] = { ...v[i], [key]: val };
    onChange({ ...data, values: v });
  };
  return (
    <div className="flex flex-col gap-4">
      <ImgUpload label="Foto de comunidad" hint="JPG/PNG · Recomendado 800×500px" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Etiqueta de sección" value={data.sectionTag}  onChange={s("sectionTag")} placeholder="Nuestra Identidad" />
        <Field label="Título"              value={data.title}        onChange={s("title")} />
        <Field label="Años de ministerio"  value={data.years}        onChange={s("years")} placeholder="22+" />
        <Field label="Etiqueta del contador" value={data.yearsLabel} onChange={s("yearsLabel")} placeholder="Años de Ministerio" />
      </div>
      <Field label="Descripción principal" value={data.description}  onChange={s("description")} type="textarea" />
      <Field label="Párrafo adicional"     value={data.description2} onChange={s("description2")} type="textarea" />
      <Card title="Valores destacados" action={<AddBtn onClick={addValue} />}>
        {data.values.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Sin valores. Añade uno.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.values.map((v, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Icono (Tabler)" value={v.icon}  onChange={(val) => setVal(i, "icon",  val)} placeholder="ti-users-group" />
                  <Field label="Título"         value={v.title} onChange={(val) => setVal(i, "title", val)} />
                  <Field label="Descripción"    value={v.desc}  onChange={(val) => setVal(i, "desc",  val)} />
                </div>
                <DelBtn onClick={() => delValue(i)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ServicesSection({ data, onChange }) {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  const add = () => onChange({ ...data, items: [...data.items, { title: "Nuevo servicio", time: "Día HH:MMh", desc: "Descripción.", featured: false }] });
  const del = (i) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  const set = (i, key, val) => {
    const arr = [...data.items];
    arr[i] = { ...arr[i], [key]: key === "featured" ? val === "true" : val };
    onChange({ ...data, items: arr });
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Título de sección" value={data.sectionTitle} onChange={s("sectionTitle")} />
        <Field label="Subtítulo"         value={data.sectionSub}   onChange={s("sectionSub")} />
      </div>
      <Card title="Servicios" action={<AddBtn onClick={add} />}>
        {data.items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Sin servicios. Añade uno.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Título"       value={item.title} onChange={(v) => set(i, "title", v)} />
                  <Field label="Horario"      value={item.time}  onChange={(v) => set(i, "time",  v)} />
                  <Field label="Descripción"  value={item.desc}  onChange={(v) => set(i, "desc",  v)} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Tipo</label>
                    <select
                      value={item.featured ? "true" : "false"}
                      onChange={(e) => set(i, "featured", e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 transition-colors"
                    >
                      <option value="false">Normal</option>
                      <option value="true">Destacado</option>
                    </select>
                  </div>
                </div>
                <DelBtn onClick={() => del(i)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function CongregSection({ data, onChange }) {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  const add = () => onChange({ ...data, items: [...data.items, { city: "Nueva ciudad", pastor: "", address: "", phone: "", schedule: "" }] });
  const del = (i) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  const set = (i, key, val) => {
    const arr = [...data.items];
    arr[i] = { ...arr[i], [key]: val };
    onChange({ ...data, items: arr });
  };
  return (
    <div className="flex flex-col gap-4">
      <Field label="URL del mapa (iframe embed)" value={data.mapEmbed} onChange={s("mapEmbed")}
        placeholder="https://www.google.com/maps/embed?pb=..." hint="Copia el src del iframe que genera Google Maps → Compartir → Insertar un mapa" />
      <Card title="Sedes" action={<AddBtn onClick={add} label="Añadir sede" />}>
        {data.items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Sin sedes. Añade una.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.items.map((c, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Field label="Ciudad"    value={c.city}     onChange={(v) => set(i, "city",     v)} />
                  <Field label="Pastores"  value={c.pastor}   onChange={(v) => set(i, "pastor",   v)} />
                  <Field label="Dirección" value={c.address}  onChange={(v) => set(i, "address",  v)} />
                  <Field label="Teléfono"  value={c.phone}    onChange={(v) => set(i, "phone",    v)} />
                  <Field label="Horario"   value={c.schedule} onChange={(v) => set(i, "schedule", v)} />
                </div>
                <DelBtn onClick={() => del(i)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ContactSection({ data, onChange }) {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Teléfono principal" value={data.phone}   onChange={s("phone")}   placeholder="+34 690 717 991" />
        <Field label="Dirección"          value={data.address} onChange={s("address")} placeholder="C/ Huerto, 4, Getafe" />
      </div>
      <Field label="Número WhatsApp (sin + ni espacios)" value={data.waNumber} onChange={s("waNumber")}
        placeholder="34690717991" hint="Solo dígitos, incluye código de país. Ej: 34690717991" />
      <Card title="Banner CTA">
        <div className="flex flex-col gap-3">
          <Field label="Título"          value={data.ctaTitle} onChange={s("ctaTitle")} />
          <Field label="Subtítulo"       value={data.ctaSub}   onChange={s("ctaSub")} />
          <Field label="Texto del botón" value={data.ctaBtn}   onChange={s("ctaBtn")} placeholder="Contáctanos" />
        </div>
      </Card>
      <Toggle label="Mostrar botón flotante de WhatsApp" checked={data.showWA} onChange={s("showWA")} />
    </div>
  );
}

function FooterSection({ data, onChange }) {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  const add = () => onChange({ ...data, links: [...data.links, { label: "Nuevo enlace", url: "#" }] });
  const del = (i) => onChange({ ...data, links: data.links.filter((_, idx) => idx !== i) });
  const set = (i, key, val) => {
    const arr = [...data.links];
    arr[i] = { ...arr[i], [key]: val };
    onChange({ ...data, links: arr });
  };
  return (
    <div className="flex flex-col gap-4">
      <Field label="Descripción de la iglesia" value={data.tagline}   onChange={s("tagline")}   type="textarea" />
      <Field label="Texto de copyright"         value={data.copyright} onChange={s("copyright")} placeholder="© 2023 MSBN España." />
      <Card title="Enlaces rápidos" action={<AddBtn onClick={add} />}>
        {data.links.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Sin enlaces.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.links.map((l, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Texto" value={l.label} onChange={(v) => set(i, "label", v)} />
                  <Field label="URL o ancla" value={l.url} onChange={(v) => set(i, "url", v)} placeholder="#welcome" />
                </div>
                <DelBtn onClick={() => del(i)} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function SocialSection({ data, onChange }) {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="flex flex-col gap-4">
      {[
        { icon: "ti-brand-instagram", net: "Instagram",  keyName: "instagram",    keyUrl: "instagramUrl" },
        { icon: "ti-brand-facebook",  net: "Facebook",   keyName: "facebook",     keyUrl: "facebookUrl"  },
        { icon: "ti-brand-youtube",   net: "YouTube",    keyName: "youtube",      keyUrl: "youtubeUrl"   },
      ].map(({ icon, net, keyName, keyUrl }) => (
        <Card key={net} title={<span className="flex items-center gap-2"><i className={`ti ${icon}`} aria-hidden="true" /> {net}</span>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre / usuario" value={data[keyName]} onChange={s(keyName)} placeholder={`@${net.toLowerCase()}`} />
            <Field label="URL del perfil"   value={data[keyUrl]}  onChange={s(keyUrl)}  placeholder={`https://${net.toLowerCase()}.com/...`} />
          </div>
        </Card>
      ))}
    </div>
  );
}

function SEOSection({ data, onChange }) {
  const s = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Título de la página (title tag)" value={data.title}       onChange={s("title")}       placeholder="MSBN España | Iglesia Cristiana..." />
      <Field label="Descripción (meta description)"  value={data.description} onChange={s("description")} type="textarea"
        hint="Máximo 160 caracteres. Aparece en los resultados de Google." />
      <Field label="Palabras clave (keywords)"       value={data.keywords}    onChange={s("keywords")}    placeholder="iglesia, cristiana, españa..." />

      <Card title="Vista previa en Google">
        <div className="py-2">
          <p className="text-[13px] text-blue-700 mb-0.5 break-all">{data.title || "Título de la página"}</p>
          <p className="text-[11px] text-green-700 mb-1">{data.pageUrl || "bethel-pages.dev"}</p>
          <p className="text-[12px] text-slate-500 leading-relaxed">{data.description || "Descripción de la página…"}</p>
        </div>
      </Card>

      <ImgUpload label="Imagen para compartir (OG Image)" hint="JPG/PNG · 1200×630px recomendado. Aparece al compartir en redes sociales." />
      <ImgUpload label="Favicon" hint="ICO o PNG · 32×32px" />
    </div>
  );
}

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