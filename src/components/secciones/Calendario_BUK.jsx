import { useState, useMemo } from "react";

// ─── Datos ────────────────────────────────────────────────────────────────────

const EVENTS = [
  { id: 1,  title: "Culto Dominical",          date: "2026-05-03", time: "11:30h", location: "Todas las congregaciones", category: "culto",     desc: "Reunión central de adoración y Palabra para toda la familia.",            featured: true  },
  { id: 2,  title: "Culto Dominical (tarde)",  date: "2026-05-03", time: "18:00h", location: "Getafe, Madrid",           category: "culto",     desc: "Segunda reunión dominical. Bienvenida especial a nuevos visitantes.",     featured: false },
  { id: 3,  title: "Escuela de Líderes",       date: "2026-05-06", time: "20:00h", location: "Getafe, Madrid",           category: "liderazgo", desc: "Formación integral para el desarrollo de dones y liderazgo ministerial.", featured: false },
  { id: 4,  title: "PGM – Grupos Pequeños",    date: "2026-05-07", time: "20:00h", location: "Lucero / Barcelona",       category: "pgm",       desc: "Grupos en casas para compartir, orar y crecer juntos en hermandad.",     featured: false },
  { id: 5,  title: "Culto de Oración",         date: "2026-05-08", time: "19:00h", location: "Lucero, Madrid",           category: "oracion",   desc: "Tiempo dedicado a la intercesión y la búsqueda de Dios.",               featured: false },
  { id: 6,  title: "Culto Dominical",          date: "2026-05-10", time: "11:30h", location: "Todas las congregaciones", category: "culto",     desc: "Reunión central de adoración y Palabra.",                                featured: true  },
  { id: 7,  title: "Escuela de Líderes",       date: "2026-05-13", time: "20:00h", location: "Getafe, Madrid",           category: "liderazgo", desc: "Formación integral para el desarrollo de dones y liderazgo ministerial.", featured: false },
  { id: 8,  title: "PGM – Grupos Pequeños",    date: "2026-05-14", time: "20:00h", location: "Valencia / Málaga",        category: "pgm",       desc: "Grupos en casas para orar y crecer juntos.",                             featured: false },
  { id: 9,  title: "Culto de Jóvenes",         date: "2026-05-16", time: "18:00h", location: "Getafe, Madrid",           category: "jovenes",   desc: "Un tiempo dinámico de adoración y palabra para la nueva generación.",    featured: false },
  { id: 10, title: "Culto Dominical",          date: "2026-05-17", time: "11:30h", location: "Todas las congregaciones", category: "culto",     desc: "Reunión central de adoración y Palabra.",                                featured: true  },
  { id: 11, title: "Escuela de Líderes",       date: "2026-05-20", time: "20:00h", location: "Getafe, Madrid",           category: "liderazgo", desc: "Formación integral de liderazgo ministerial.",                           featured: false },
  { id: 12, title: "PGM – Grupos Pequeños",    date: "2026-05-21", time: "20:00h", location: "Lepe, Huelva",             category: "pgm",       desc: "Grupos en casas para orar y crecer juntos.",                             featured: false },
  { id: 13, title: "Culto de Mujeres",         date: "2026-05-23", time: "18:00h", location: "Getafe, Madrid",           category: "mujeres",   desc: "Espacio de comunión y empoderamiento para mujeres de fe.",               featured: false },
  { id: 14, title: "Culto Dominical",          date: "2026-05-24", time: "11:30h", location: "Todas las congregaciones", category: "culto",     desc: "Reunión central de adoración y Palabra.",                                featured: true  },
  { id: 15, title: "Escuela de Líderes",       date: "2026-05-27", time: "20:00h", location: "Getafe, Madrid",           category: "liderazgo", desc: "Formación integral de liderazgo ministerial.",                           featured: false },
  { id: 16, title: "PGM – Grupos Pequeños",    date: "2026-05-28", time: "20:00h", location: "Barcelona / Valencia",     category: "pgm",       desc: "Grupos en casas para orar y crecer juntos.",                             featured: false },
  { id: 17, title: "Culto Dominical",          date: "2026-05-31", time: "11:30h", location: "Todas las congregaciones", category: "culto",     desc: "Reunión central de adoración y Palabra.",                                featured: true  },
  { id: 18, title: "Culto de Jóvenes",         date: "2026-06-06", time: "18:00h", location: "Getafe, Madrid",           category: "jovenes",   desc: "Adoración y palabra para la nueva generación.",                          featured: false },
  { id: 19, title: "Culto Dominical",          date: "2026-06-07", time: "11:30h", location: "Todas las congregaciones", category: "culto",     desc: "Reunión central de adoración.",                                          featured: true  },
];

const CATEGORIES = [
  { key: "todos",     label: "Todos"     },
  { key: "culto",     label: "Cultos"    },
  { key: "jovenes",   label: "Jóvenes"  },
  { key: "mujeres",   label: "Mujeres"  },
  { key: "liderazgo", label: "Liderazgo" },
  { key: "pgm",       label: "PGM"      },
  { key: "oracion",   label: "Oración"  },
];

// Tailwind classes por categoría (badge)
const CATEGORY_BADGE = {
  culto:     "bg-amber-100   text-amber-800",
  jovenes:   "bg-blue-100    text-blue-800",
  mujeres:   "bg-pink-100    text-pink-800",
  liderazgo: "bg-emerald-100 text-emerald-800",
  pgm:       "bg-violet-100  text-violet-800",
  oracion:   "bg-green-100   text-green-800",
};

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAYS_SHORT = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  let startDow = first.getDay(); // 0=sun
  startDow = startDow === 0 ? 6 : startDow - 1; // Mon=0

  const days = [];
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), current: false });
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push({ date: new Date(year, month, d), current: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), current: false });
  }
  return days;
}

// ─── Iconos inline (sin dependencia extra) ───────────────────────────────────

const IconCalendar = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconClock = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconPin = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconChevron = ({ dir = "right" }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
  </svg>
);
const IconArrow = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function CategoryBadge({ category }) {
  const cls = CATEGORY_BADGE[category] ?? "bg-slate-100 text-slate-700";
  const label = CATEGORIES.find((c) => c.key === category)?.label ?? category;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

function EventCard({ event }) {
  if (event.featured) {
    return (
      <div className="bg-brand-DEFAULT rounded-2xl p-5 shadow-lg flex flex-col gap-3 border border-slate-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-400/20 text-amber-300 tracking-wide">
            {CATEGORIES.find((c) => c.key === event.category)?.label}
          </span>
          <span className="text-xs text-slate-300 whitespace-nowrap">{event.time}</span>
        </div>
        <div>
          <p className="font-semibold text-white text-[15px] leading-snug mb-1">{event.title}</p>
          <p className="text-sm text-slate-300 font-light leading-relaxed">{event.desc}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-auto">
          <IconPin />
          {event.location}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between gap-2">
        <CategoryBadge category={event.category} />
        <span className="text-xs text-slate-400 whitespace-nowrap">{event.time}</span>
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-[15px] leading-snug mb-1">{event.title}</p>
        <p className="text-sm text-slate-500 font-light leading-relaxed">{event.desc}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-auto">
        <IconPin />
        {event.location}
      </div>
    </div>
  );
}

const Calendario = () => {

    const today    = new Date();
    const todayStr = fmtDate(today);

    const [viewYear,  setViewYear]  = useState(2026);
    const [viewMonth, setViewMonth] = useState(4); // Mayo = 4
    const [selected,  setSelected]  = useState(todayStr);
    const [filter,    setFilter]    = useState("todos");

    // Días del calendario
    const calDays = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

    // Set de fechas con eventos
    const eventDates = useMemo(() => {
    const s = new Set();
    EVENTS.forEach((e) => s.add(e.date));
    return s;
    }, []);

    // Navegación de mes
    const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    };
    const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    };

    // Eventos del día seleccionado
    const dayEvents = useMemo(() =>
    EVENTS
        .filter((e) => e.date === selected && (filter === "todos" || e.category === filter))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [selected, filter]
    );

    // Todos los eventos del mes visible
    const monthEvents = useMemo(() => {
    const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    return EVENTS
        .filter((e) => e.date.startsWith(monthStr) && (filter === "todos" || e.category === filter))
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    }, [viewMonth, viewYear, filter]);

    // Label del día seleccionado
    const selDate  = selected ? new Date(selected + "T00:00:00") : null;
    const selLabel = selDate
    ? `${selDate.getDate()} de ${MONTHS[selDate.getMonth()]} ${selDate.getFullYear()}`
    : "";

  return (
    <section id="calendario" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Encabezado ── */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-950 block mb-3">
            Agenda CFC Bethel
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
            Calendario de Actividades
          </h2>
          <div className="h-1 w-10 bg-[#FCD34D] rounded-full mx-auto mb-4" />
          <p className="text-slate-500 font-light text-sm leading-relaxed">
            Mantente al día con todos los cultos, reuniones y eventos de nuestras congregacion.
          </p>
        </div>

        {/* ── Filtros por categoría ── */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer
                ${filter === c.key
                  ? "bg-brand-DEFAULT text-white border-brand-DEFAULT shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-brand-DEFAULT hover:text-slate-950"
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Layout principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

          {/* ── Calendario ── */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-20">

            {/* Navegación de mes */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <IconChevron dir="left" />
              </button>
              <span className="font-semibold text-slate-900 text-[15px]">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <IconChevron dir="right" />
              </button>
            </div>

            {/* Nombres de días */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Celdas de días */}
            <div className="grid grid-cols-7 gap-0.5">
              {calDays.map((cell, i) => {
                const ds      = fmtDate(cell.date);
                const isToday = ds === todayStr;
                const isSel   = ds === selected;
                const hasEv   = eventDates.has(ds) && cell.current;

                return (
                  <button
                    key={i}
                    onClick={() => cell.current && setSelected(ds)}
                    disabled={!cell.current}
                    className={`
                      relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl
                      min-h-11 transition-all duration-150 cursor-pointer
                      ${!cell.current ? "opacity-20 cursor-default" : "hover:bg-slate-50"}
                      ${isSel ? "bg-[#FCD34D]/20" : ""}
                    `}
                  >
                    {/* Número */}
                    <span className={`
                      text-[13px] w-7 h-7 flex items-center justify-center rounded-full font-medium
                      ${isSel   ? "bg-[#FCD34D] text-slate-900 font-semibold" : ""}
                      ${isToday && !isSel ? "bg-brand-DEFAULT text-white" : ""}
                      ${!isSel && !isToday ? "text-slate-700" : ""}
                    `}>
                      {cell.date.getDate()}
                    </span>
                    {/* Punto de evento */}
                    {hasEv && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSel ? "bg-brand-DEFAULT" : "bg-[#FCD34D]"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Leyenda */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-[#FCD34D] inline-block" />
                Con evento
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-brand-DEFAULT inline-block" />
                Hoy
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-[#FCD34D]/40 border border-[#FCD34D] inline-block" />
                Seleccionado
              </div>
            </div>
          </div>

          {/* ── Panel derecho ── */}
          <div className="flex flex-col gap-5">

            {/* Panel: eventos del día seleccionado */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <IconCalendar />
                <h3 className="font-semibold text-slate-900 text-[15px]">{selLabel}</h3>
                {dayEvents.length > 0 && (
                  <span className="ml-auto bg-brand-DEFAULT text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {dayEvents.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <IconCalendar />
                  </div>
                  <p className="text-slate-400 text-sm">Sin actividades este día</p>
                  <p className="text-slate-300 text-xs mt-1">Selecciona otro día del calendario</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dayEvents.map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              )}
            </div>

            {/* Panel: todos los eventos del mes */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-900 text-[15px] mb-5">
                Agenda completa — {MONTHS[viewMonth]} {viewYear}
              </h3>

              {monthEvents.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Sin eventos en este mes para este filtro.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {monthEvents.map((e) => {
                    const d   = new Date(e.date + "T00:00:00");
                    const isSel = e.date === selected;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setSelected(e.date)}
                        className={`w-full flex items-start gap-4 py-3.5 px-3 rounded-xl text-left transition-all duration-150 cursor-pointer
                          ${isSel ? "bg-[#FCD34D]/10" : "hover:bg-slate-50"}`}
                      >
                        {/* Fecha */}
                        <div className="min-w-10 text-center shrink-0">
                          <p className="text-xl font-semibold text-slate-900 leading-none">{d.getDate()}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                            {DAYS_SHORT[(d.getDay() + 6) % 7]}
                          </p>
                        </div>

                        {/* Separador */}
                        <div className={`w-0.5 self-stretch rounded-full shrink-0 ${isSel ? "bg-[#FCD34D]" : "bg-slate-100"}`} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-sm text-slate-900 truncate">{e.title}</span>
                            <CategoryBadge category={e.category} />
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><IconClock />{e.time}</span>
                            <span className="flex items-center gap-1 truncate"><IconPin />{e.location}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-brand-DEFAULT rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <p className="font-semibold text-white text-lg mb-1">¿Preguntas sobre nuestras actividades?</p>
                <p className="text-slate-400 text-sm font-light">Contáctanos y te informamos sobre cualquier evento.</p>
              </div>
              <a
                href="#contact"
                className="flex items-center gap-2 px-6 py-3 bg-[#FCD34D] text-slate-900 text-sm font-semibold rounded-full hover:bg-[#FBBF24] transition-colors shadow-md whitespace-nowrap shrink-0"
              >
                Contáctanos <IconArrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Calendario