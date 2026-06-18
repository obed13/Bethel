/**
 * Módulo de Eventos: KPIs + calendario visual + panel de día con CRUD.
 */

import { useState, useMemo, useCallback } from "react";
import { useEvents, createEvent, updateEvent, deleteEvent } from "../../hooks/useEvents";

// ─── Constantes ───────────────────────────────────────────────────────────────

const MONTHS     = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_SHORT = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

const CATEGORIES = [
  { key: "culto",     label: "Culto"     },
  { key: "jovenes",   label: "Jóvenes"   },
  { key: "mujeres",   label: "Mujeres"   },
  { key: "liderazgo", label: "Liderazgo" },
  { key: "pgm",       label: "PGM"       },
  { key: "oracion",   label: "Oración"   },
];

const BADGE = {
  culto:     "bg-amber-100 text-amber-800",
  jovenes:   "bg-blue-100 text-blue-800",
  mujeres:   "bg-pink-100 text-pink-800",
  liderazgo: "bg-emerald-100 text-emerald-800",
  pgm:       "bg-violet-100 text-violet-800",
  oracion:   "bg-green-100 text-green-800",
};

const EMPTY_FORM = {
  title: "", date: "", time: "", location: "", category: "culto", desc: "", featured: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function buildCalDays(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month+1, 0);
  let sd = first.getDay(); sd = sd===0?6:sd-1;
  const days = [];
  for (let i=sd-1; i>=0; i--) days.push({date: new Date(year, month, -i),  current: false});
  for (let d=1; d<=last.getDate(); d++) days.push({date: new Date(year, month, d), current: true});
  const rem = 42 - days.length;
  for (let i=1; i<=rem; i++) days.push({date: new Date(year, month+1, i),   current: false});
  return days;
}

// ─── Iconos ───────────────────────────────────────────────────────────────────

const IcoChevron = ({ dir }) => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
  </svg>
);
const IcoX = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcoEdit = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoTrash = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const IcoPlus = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accentColor, iconClass, iconBg, iconColor, loading }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: accentColor }} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <i className={`ti ${iconClass} text-[17px]`} style={{ color: iconColor }} aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900 leading-none mb-1.5">
        {loading ? "—" : value}
      </p>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

// ─── EventFormModal ───────────────────────────────────────────────────────────

function EventFormModal({ initialData, onClose, onSaved }) {
  const isEdit = !!initialData?.id;
  const [form, setForm]     = useState(initialData ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    if (!form.title || !form.date || !form.time || !form.location || !form.category) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title, date: form.date, time: form.time,
      location: form.location, category: form.category,
      description: form.desc, featured: !!form.featured,
    };
    const res = isEdit ? await updateEvent(form.id, payload) : await createEvent(payload);
    setSaving(false);
    if (!res.ok) { setError(res.error ?? "Error al guardar"); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-slate-900">
            {isEdit ? "Editar evento" : "Nuevo evento"}
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
            <IcoX />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-600 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Título *</label>
            <input value={form.title} onChange={set("title")} placeholder="Culto Dominical"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Fecha *</label>
              <input type="date" value={form.date} onChange={set("date")}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Hora *</label>
              <input value={form.time} onChange={set("time")} placeholder="11:30h"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Ubicación *</label>
            <input value={form.location} onChange={set("location")} placeholder="Getafe, Madrid"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Categoría *</label>
            <select value={form.category} onChange={set("category")}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors">
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Descripción</label>
            <textarea value={form.desc} onChange={set("desc")} rows={3}
              placeholder="Reunión central de adoración y Palabra…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors resize-none" />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={!!form.featured} onChange={set("featured")} className="w-4 h-4 accent-slate-950" />
            <span className="text-sm text-slate-600">Marcar como evento destacado</span>
          </label>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer">
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Módulo principal ─────────────────────────────────────────────────────────

export default function EventosPage() {
  const today    = new Date();
  const todayStr = fmtDate(today);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(todayStr);
  const [showAll,   setShowAll]   = useState(false);
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const monthStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}`;

  const { events: monthEvents, loading, refetch } = useEvents({ month: monthStr });
  const { events: dayEventsRaw }                   = useEvents({ date: selected });

  const calDays = useMemo(() => buildCalDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const eventDates = useMemo(() => new Set(monthEvents.map((e) => e.date)), [monthEvents]);

  const dayEvents = useMemo(() =>
    [...dayEventsRaw].sort((a, b) => a.time.localeCompare(b.time)),
    [dayEventsRaw]
  );

  const allSorted = useMemo(() =>
    [...monthEvents].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [monthEvents]
  );

  const prevMonth = () => {
    if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}
    else setViewMonth(m=>m-1);
  };
  const nextMonth = () => {
    if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}
    else setViewMonth(m=>m+1);
  };

  const selDate  = new Date(selected+"T00:00:00");
  const selLabel = `${DAYS_SHORT[(selDate.getDay()+6)%7]}, ${selDate.getDate()} de ${MONTHS[selDate.getMonth()]}`;

  const now7 = useMemo(() => {
    const in7 = new Date(today.getTime()+7*86400000);
    return monthEvents.filter((e)=>{const d=new Date(e.date+"T00:00:00");return d>=today&&d<=in7;}).length;
  }, [monthEvents]);

  const handleSaved = useCallback(() => {
    setModal(false); setEditing(null); refetch();
  }, [refetch]);

  const handleDelete = async (id) => {
    await deleteEvent(id);
    setConfirmDel(null);
    refetch();
  };

  const panelEvents = showAll ? allSorted : dayEvents;
  const panelTitle  = showAll
    ? `Todos — ${MONTHS[viewMonth]} ${viewYear}`
    : selLabel;

  return (
    <div className="p-6">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-0.5">Eventos</h1>
          <p className="text-sm text-slate-400">Gestiona el calendario de todas las congregaciones</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModal(true); }}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <IcoPlus /> Nuevo evento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Eventos este mes" value={monthEvents.length} sub={`${MONTHS[viewMonth]} ${viewYear}`}
          accentColor="#FCD34D" iconClass="ti-calendar-event" iconBg="bg-amber-50" iconColor="#d97706" loading={loading} />
        <KpiCard label="Próximos 7 días" value={now7} sub="Eventos próximos"
          accentColor="#10b981" iconClass="ti-clock" iconBg="bg-emerald-50" iconColor="#059669" loading={loading} />
        <KpiCard label="Destacados" value={monthEvents.filter(e=>e.featured).length} sub="Cultos dominicales"
          accentColor="#6366f1" iconClass="ti-star" iconBg="bg-indigo-50" iconColor="#4f46e5" loading={loading} />
        <KpiCard label="Categorías" value={6} sub="Tipos de evento"
          accentColor="#f43f5e" iconClass="ti-tag" iconBg="bg-rose-50" iconColor="#e11d48" loading={false} />
      </div>

      {/* Calendario + Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

        {/* Calendario */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <span className="font-semibold text-slate-900 text-[15px]">{MONTHS[viewMonth]} {viewYear}</span>
            <div className="flex items-center gap-1.5">
              <button onClick={prevMonth} aria-label="Mes anterior"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                <IcoChevron dir="left" />
              </button>
              <button onClick={nextMonth} aria-label="Mes siguiente"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                <IcoChevron dir="right" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="text-center text-[10px] text-slate-400 uppercase tracking-widest py-1.5 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calDays.map((cell, i) => {
                const ds      = fmtDate(cell.date);
                const isToday = ds === todayStr;
                const isSel   = ds === selected;
                const hasEv   = eventDates.has(ds) && cell.current;
                return (
                  <button
                    key={i}
                    onClick={() => { if(cell.current){setSelected(ds); setShowAll(false);} }}
                    disabled={!cell.current}
                    aria-label={`${cell.date.getDate()} de ${MONTHS[cell.date.getMonth()]}`}
                    className={[
                      "relative flex flex-col items-center pt-1.5 pb-1 rounded-xl min-h-[46px] transition-all duration-150",
                      !cell.current ? "opacity-20 pointer-events-none" : "cursor-pointer hover:bg-slate-50",
                      isSel ? "bg-[#FCD34D]/15" : "",
                    ].join(" ")}
                  >
                    <span className={[
                      "text-[13px] w-7 h-7 flex items-center justify-center rounded-full font-medium",
                      isSel              ? "bg-[#FCD34D] text-slate-900 font-semibold" : "",
                      isToday && !isSel  ? "bg-slate-950 text-white"                   : "",
                      !isSel && !isToday ? "text-slate-700"                             : "",
                    ].join(" ")}>
                      {cell.date.getDate()}
                    </span>
                    {hasEv && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSel ? "bg-slate-900" : "bg-[#FCD34D]"}`} />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 flex-wrap">
              {[
                { color: "bg-[#FCD34D]", label: "Con evento" },
                { color: "bg-slate-950", label: "Hoy" },
                { color: "bg-[#FCD34D]/40 border border-[#FCD34D]", label: "Seleccionado" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className={`w-2 h-2 rounded-full inline-block ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel del día */}
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 flex-shrink-0">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                {showAll ? "Mes completo" : "Eventos del día"}
              </p>
              <p className="font-semibold text-slate-900 text-[14px] capitalize">{panelTitle}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {panelEvents.length > 0 && (
                <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-[11px] font-semibold flex items-center justify-center">
                  {panelEvents.length}
                </span>
              )}
              <button
                onClick={() => setShowAll(v => !v)}
                className="flex items-center gap-1 px-2.5 h-7 rounded-lg border border-slate-200 text-[11px] text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <i className={`ti ${showAll ? "ti-calendar" : "ti-list"} text-[13px]`} aria-hidden="true" />
                {showAll ? "Ver día" : "Ver mes"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
              </div>
            ) : panelEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
                <i className="ti ti-calendar-off text-[28px] text-slate-300" aria-hidden="true" />
                <p className="text-slate-400 text-sm">Sin actividades {showAll ? "este mes" : "este día"}</p>
                <p className="text-slate-300 text-xs">
                  {showAll ? "Crea el primer evento" : "Elige un día con punto amarillo"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {panelEvents.map((e) => {
                  const d  = new Date(e.date+"T00:00:00");
                  const wd = DAYS_SHORT[(d.getDay()+6)%7];
                  return (
                    <div key={e.id} className="group flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="min-w-[36px] text-center shrink-0">
                        <p className="text-base font-semibold text-slate-900 leading-none">{d.getDate()}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{wd}</p>
                      </div>
                      <div className="w-px bg-slate-100 self-stretch shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-[13px] font-medium text-slate-900 truncate">{e.title}</span>
                          {e.featured && <span className="text-[10px] text-amber-600">★</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 mb-1.5">{e.time} · {e.location}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[e.category] ?? "bg-slate-100 text-slate-700"}`}>
                          {CATEGORIES.find(c=>c.key===e.category)?.label ?? e.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => { setEditing(e); setModal(true); }}
                          aria-label="Editar"
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        ><IcoEdit /></button>
                        <button
                          onClick={() => setConfirmDel(e)}
                          aria-label="Eliminar"
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        ><IcoTrash /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <EventFormModal
          initialData={editing}
          onClose={() => { setModal(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Confirmación borrado */}
      {confirmDel && (
        <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center border border-slate-100">
            <p className="font-semibold text-slate-900 mb-2">¿Eliminar este evento?</p>
            <p className="text-sm text-slate-500 mb-6">"{confirmDel.title}" se eliminará del calendario.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDel.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}