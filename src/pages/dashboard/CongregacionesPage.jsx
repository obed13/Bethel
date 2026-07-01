/**
 *
 * Vista:
 *  - Lista de congregaciones (tarjetas) con contador de miembros
 *  - Al seleccionar una → panel lateral con datos + lista de miembros
 *  - CRUD de congregaciones y miembros
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { authHeaders } from "../../hooks/useAuth";
import { fmtDate, calcAge, initials } from "./Helpers/helpers";
import Field from "./components/Field";
import Toggle from "./components/Toggle";
import SaveBtn from "./components/SaveBtn";
import DelConfirmBtn from "./components/DelConfirmBtn";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Iconos ───────────────────────────────────────────────────────────────────

const IcoPlus    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoEdit    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoX       = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoSearch  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoChurch  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 22V12h6v10"/><path d="M2 22V10l10-8 10 8v12"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="10" y1="4" x2="14" y2="4"/></svg>;
const IcoUser    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoChevron = ({ dir }) => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{dir === "left" ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}</svg>;
const IcoBack    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;

// ─── Primitivos UI ────────────────────────────────────────────────────────────
// ─── Modal Congregación ───────────────────────────────────────────────────────

const EMPTY_CONGREG = { ciudad: "", pastores: "", direccion: "", telefono: "", horarios: "", image: "" };

function CongregModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id;
  const [form, setForm]     = useState(initial ?? EMPTY_CONGREG);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const s = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.ciudad?.trim()) { setError("La ciudad es obligatoria"); return; }
    setSaving(true);
    
    try {
      
      const url = isEdit ? `/api/congregaciones?id=${initial.id}` : "/api/congregaciones";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      console.log("Saving congregación:", isEdit ? "PUT" : "POST", form, json);
      if (!json.ok) { setError(json.error ?? "Error al guardar"); return; }
      onSaved(json.data);
    } catch { setError("Error de conexión"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-slate-900">{isEdit ? "Editar congregación" : "Nueva congregación"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"><IcoX /></button>
        </div>
        {error && <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}
        <div className="flex flex-col gap-4">
          <Field label="Ciudad / Sede" value={form.ciudad}     onChange={s("ciudad")}     required placeholder="Ciudad" />
          <Field label="Pastores"      value={form.pastores}   onChange={s("pastores")}   placeholder="Nombre del pastor/a" />
          <Field label="Dirección"     value={form.direccion}  onChange={s("direccion")}  placeholder="C/ Ejemplo, 1 — Ciudad" />
          <Field label="Teléfono"      value={form.telefono}    onChange={s("telefono")}    type="tel" placeholder="+34 000 000 000" />
          <Field label="Horarios"      value={form.horarios} onChange={s("horarios")} placeholder="Miércoles 20:00h | Domingos 11:30h" />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer">
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear congregación"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Miembro ────────────────────────────────────────────────────────────

const EMPTY_MEMBER = {
  nombre: "", 
  apellido_paterno: "", 
  apellido_materno: "",
  fecha_cumpleanos: "", 
  fecha_bautizo_es: "",
  viene_otra_iglesia: false, 
  iglesia_anterior: "",
  direccion: "", 
  telefono: "", 
  notes: "",
};

function MemberModal({ initial, congregacionId, onClose, onSaved }) {
  const isEdit = !!initial?.id;
  const [form, setForm]     = useState(initial ? {
    nombre:              initial.nombre,
    apellido_paterno:    initial.apellido_paterno,
    apellido_materno:    initial.apellido_materno,
    fecha_cumpleanos:    initial.fecha_cumpleanos ?? "",
    fecha_bautizo_es:    initial.fecha_bautizo_es ?? "",
    viene_otra_iglesia:  initial.viene_otra_iglesia,
    iglesia_anterior:    initial.iglesia_anterior,
    direccion:           initial.direccion,
    telefono:            initial.telefono,
    notes:               initial.notes,
  } : EMPTY_MEMBER);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const s = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.nombre?.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true);
    console.log("Saving miembro:", isEdit ? "PUT" : "POST", form);
    try {
      const url = isEdit ? `/api/members?id=${initial.id}` : "/api/members";
      const body = isEdit ? form : { ...form, congregacion_id: congregacionId };
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) { setError(json.error ?? "Error al guardar"); return; }
      onSaved(json.data);
    } catch { setError("Error de conexión"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-slate-900">{isEdit ? "Editar miembro" : "Nuevo miembro"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"><IcoX /></button>
        </div>
        {error && <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}

        <div className="flex flex-col gap-4">
          {/* Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Nombre"           value={form.nombre}        onChange={s("nombre")}        required placeholder="María" />
            <Field label="Apellido paterno"  value={form.apellido_paterno} onChange={s("apellido_paterno")} placeholder="García" />
            <Field label="Apellido materno"  value={form.apellido_materno} onChange={s("apellido_materno")} placeholder="López" />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Fecha de cumpleaños"        value={form.fecha_cumpleanos}           onChange={s("fecha_cumpleanos")}           type="date" hint="Opcional" />
            <Field label="Fecha bautizo Espíritu Santo" value={form.fecha_bautizo_es} onChange={s("fecha_bautizo_es")} type="date" hint="Opcional" />
          </div>

          {/* Procedencia */}
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3 border border-slate-100">
            <Toggle
              label="Viene de otra iglesia"
              checked={form.viene_otra_iglesia}
              onChange={s("viene_otra_iglesia")}
            />
            {form.viene_otra_iglesia && (
              <Field label="Nombre de la iglesia anterior" value={form.iglesia_anterior} onChange={s("iglesia_anterior")} placeholder="Iglesia anterior" />
            )}
          </div>

          {/* Contacto */}
          <Field label="Dirección" value={form.direccion} onChange={s("direccion")} placeholder="C/ Ejemplo, 1 — Ciudad" />
          <Field label="Teléfono"  value={form.telefono}   onChange={s("telefono")}   type="tel" placeholder="+34 000 000 000" />
          <Field label="Notas"     value={form.notes}   onChange={s("notes")}   type="textarea" placeholder="Observaciones adicionales…" />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer">
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Agregar miembro"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de Congregación ──────────────────────────────────────────────────

function CongregCard({ congreg, onSelect, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Imagen o placeholder */}
      <div className="h-28 bg-slate-100 flex items-center justify-center relative overflow-hidden">
        {congreg.image ? (
          <img src={congreg.image} alt={congreg.ciudad} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <IcoChurch />
            <span className="text-[10px] uppercase tracking-widest">Sin imagen</span>
          </div>
        )}
        {/* Acciones hover */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onEdit(congreg); }}
            className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white cursor-pointer shadow-sm">
            <IcoEdit />
          </button>
          <DelConfirmBtn onConfirm={() => onDelete(congreg.id)} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-[14px] mb-1 truncate">{congreg.ciudad}</h3>
        {congreg.pastores && <p className="text-[12px] text-slate-500 truncate mb-2">{congreg.pastores}</p>}

        <div className="space-y-1 mb-3">
          {congreg.telefono && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <i className="ti ti-phone text-[12px]" aria-hidden="true" /> {congreg.telefono}
            </p>
          )}
          {congreg.horarios && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <i className="ti ti-clock text-[12px]" aria-hidden="true" /> {congreg.horarios}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1 text-[12px] text-slate-500">
            <IcoUser /> {congreg.total_miembros ?? 0} miembros
          </span>
          <button onClick={() => onSelect(congreg)}
            className="flex items-center gap-1 px-3 h-7 rounded-lg bg-slate-950 text-white text-[12px] font-medium hover:bg-slate-800 transition-colors cursor-pointer">
            Ver miembros <IcoChevron dir="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vista Miembros de una Congregación ──────────────────────────────────────

function MembersView({ congreg, onBack }) {
  const [members,  setMembers]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [selected, setSelected] = useState(null);
  const PAGE_SIZE = 20;

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        congregacion_id: congreg.id,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      if (search.trim()) params.set("q", search.trim());
      const res  = await fetch(`/api/members?${params}`, { headers: authHeaders() });
      const json = await res.json();
      if (json.ok) { setMembers(json.data); setTotal(json.total); }
    } finally { setLoading(false); }
  }, [congreg.id, page, search]);

  // Debounce search
  const searchTimer = useRef(null);
  const handleSearch = v => {
    setSearch(v); setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchMembers, 400);
  };

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleDelete = async (id) => {
    await fetch(`/api/members?id=${id}`, { method: "DELETE", headers: authHeaders() });
    setMembers(prev => prev.filter(m => m.id !== id));
    setTotal(t => t - 1);
    if (selected?.id === id) setSelected(null);
  };

  const handleSaved = (member) => {
    setMembers(prev => {
      const idx = prev.findIndex(m => m.id === member.id);
      if (idx > -1) { const next = [...prev]; next[idx] = member; return next; }
      return [member, ...prev];
    });
    if (!editing) setTotal(t => t + 1);
    setModal(false); setEditing(null);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
          <IcoBack /> Congregaciones
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 truncate">{congreg.ciudad}</h2>
          <p className="text-[12px] text-slate-400">{total} miembro{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setEditing(null); setModal(true); }}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer">
          <IcoPlus /> Agregar miembro
        </button>
      </div>

      {/* Info de la congregación */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "ti-users",    label: "Pastores",  value: congreg.pastores   },
          { icon: "ti-map-pin",  label: "Dirección", value: congreg.direccion  },
          { icon: "ti-phone",    label: "Teléfono",  value: congreg.telefono    },
          { icon: "ti-clock",    label: "Horarios",  value: congreg.horarios },
        ].filter(f => f.value).map(f => (
          <div key={f.label} className="flex items-start gap-2">
            <i className={`ti ${f.icon} text-[15px] text-slate-400 mt-0.5 shrink-0`} aria-hidden="true" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">{f.label}</p>
              <p className="text-sm text-slate-700">{f.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Panel: lista + detalle */}
      <div className="flex gap-4 min-h-100">

        {/* Lista de miembros */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Buscador */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><IcoSearch /></span>
              <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
                placeholder="Buscar miembro…"
                className="w-full pl-9 pr-3 h-9 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors" />
              {search && <button onClick={() => handleSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"><IcoX /></button>}
            </div>
          </div>

          {/* Filas */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                <i className="ti ti-users text-[36px] text-slate-200" aria-hidden="true" />
                <p className="text-slate-400 text-sm">{search ? "Sin resultados" : "Sin miembros registrados"}</p>
                {!search && (
                  <button onClick={() => setModal(true)}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 cursor-pointer">
                    <IcoPlus /> Agregar el primero
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {members.map(m => (
                  <button key={m.id} type="button" onClick={() => setSelected(m)}
                    className={[
                      "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer",
                      selected?.id === m.id ? "bg-[#FCD34D]/8" : "",
                    ].join(" ")}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${selected?.id === m.id ? "bg-slate-950 text-[#FCD34D]" : "bg-slate-100 text-slate-600"}`}>
                      {initials(m.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{m.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{m.telefono || m.direccion || "Sin contacto"}</p>
                    </div>
                    {m.viene_otra_iglesia && (
                      <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium shrink-0">Trans.</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                className="flex items-center gap-1 px-3 h-8 rounded-lg border border-slate-200 text-sm text-slate-500 disabled:opacity-30 hover:bg-slate-50 cursor-pointer">
                <IcoChevron dir="left" /> Ant.
              </button>
              <span className="text-[11px] text-slate-400">{page}/{totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 h-8 rounded-lg border border-slate-200 text-sm text-slate-500 disabled:opacity-30 hover:bg-slate-50 cursor-pointer">
                Sig. <IcoChevron dir="right" />
              </button>
            </div>
          )}
        </div>

        {/* Panel detalle del miembro */}
        {selected && (
          <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-slate-950 text-[#FCD34D] flex items-center justify-center font-semibold text-[14px]">
                  {initials(selected.full_name)}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(selected); setModal(true); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer"><IcoEdit /></button>
                  <DelConfirmBtn onConfirm={() => handleDelete(selected.id)} />
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 text-[14px]">{selected.full_name}</h3>
              {selected.from_other_church && (
                <span className="inline-block mt-1 text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                  Viene de {selected.previous_church || "otra iglesia"}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {[
                {
                  icon: "ti-cake",
                  label: "Cumpleaños",
                  value: selected.birthday
                    ? `${fmtDate(selected.birthday)}${calcAge(selected.birthday) !== null ? ` · ${calcAge(selected.birthday)} años` : ""}`
                    : null,
                },
                {
                  icon: "ti-droplet",
                  label: "Bautizo Espíritu Santo",
                  value: fmtDate(selected.baptism_holy_spirit) !== "—" ? fmtDate(selected.baptism_holy_spirit) : null,
                },
                { icon: "ti-phone",   label: "Teléfono",  value: selected.phone   },
                { icon: "ti-map-pin", label: "Dirección", value: selected.address  },
                { icon: "ti-notes",   label: "Notas",     value: selected.notes    },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="flex items-start gap-2.5">
                  <i className={`ti ${f.icon} text-[14px] text-slate-400 mt-0.5 shrink-0`} aria-hidden="true" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">{f.label}</p>
                    <p className="text-sm text-slate-700">{f.value}</p>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">Registrado</p>
                <p className="text-[11px] text-slate-500">{fmtDate(selected.created_at?.split("T")[0])}</p>
              </div>
            </div>

            {selected.phone && (
              <div className="p-4 border-t border-slate-100">
                <a href={`tel:${selected.phone}`}
                  className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                  <i className="ti ti-phone text-[14px]" aria-hidden="true" /> Llamar
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal miembro */}
      {modal && (
        <MemberModal
          initial={editing}
          congregacionId={congreg.id}
          onClose={() => { setModal(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CongregacionesPage() {
  const [congregaciones, setCongregaciones] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [view,           setView]           = useState("list");   // "list" | "members"
  const [activeCong,     setActiveCong]     = useState(null);
  const [congregModal,   setCongregModal]   = useState(false);
  const [editingCong,    setEditingCong]    = useState(null);
  const [search,         setSearch]         = useState("");

  const fetchCongregaciones = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/congregaciones", { headers: authHeaders() });
      const json = await res.json();
      if (json.ok) setCongregaciones(json.data);
      else setError(json.error);
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCongregaciones(); }, [fetchCongregaciones]);

  const handleDelete = async (id) => {
    await fetch(`/api/congregaciones?id=${id}`, { method: "DELETE", headers: authHeaders() });
    setCongregaciones(prev => prev.filter(c => c.id !== id));
  };

  const handleSaved = (congreg) => {
    setCongregaciones(prev => {
      const idx = prev.findIndex(c => c.id === congreg.id);
      if (idx > -1) { const next = [...prev]; next[idx] = congreg; return next; }
      return [...prev, congreg];
    });
    setCongregModal(false); setEditingCong(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return congregaciones;
    return congregaciones.filter(c =>
      c.ciudad.toLowerCase().includes(q) || c.pastores.toLowerCase().includes(q)
    );
  }, [congregaciones, search]);

  // ── Vista detalle de miembros ──────────────────────────────────────────────
  if (view === "members" && activeCong) {
    return (
      <div className="p-4 sm:p-6">
        <MembersView
          congreg={activeCong}
          onBack={() => { setView("list"); setActiveCong(null); }}
        />
      </div>
    );
  }

  // ── Vista lista de congregaciones ──────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-0.5">Congregaciones</h1>
          <p className="text-sm text-slate-400">Gestiona las sedes y sus miembros</p>
        </div>
        <button onClick={() => { setEditingCong(null); setCongregModal(true); }}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer">
          <IcoPlus /> Nueva congregación
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Congregaciones",  value: congregaciones.length,                                         accent: "#FCD34D", icon: "ti-building-church", bg: "bg-amber-50",   color: "#d97706" },
          { label: "Total miembros",  value: congregaciones.reduce((a, c) => a + (c.total_miembros ?? 0), 0), accent: "#6366f1", icon: "ti-users",           bg: "bg-indigo-50",  color: "#4f46e5" },
          { label: "Más grande",      value: congregaciones.length ? Math.max(...congregaciones.map(c => c.total_miembros ?? 0)) : 0, accent: "#10b981", icon: "ti-star", bg: "bg-emerald-50", color: "#059669" },
          { label: "Ciudades",        value: new Set(congregaciones.map(c => (c.ciudad || '').split(",")[1]?.trim() || c.ciudad || '')).size, accent: "#f43f5e", icon: "ti-map-pin", bg: "bg-rose-50", color: "#e11d48" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-100 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: k.accent }} />
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{k.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg}`}>
                <i className={`ti ${k.icon} text-[17px]`} style={{ color: k.color }} aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{loading ? "—" : k.value}</p>
          </div>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative mb-5 max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><IcoSearch /></span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por ciudad o pastor…"
          className="w-full pl-9 pr-3 h-9 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-950 transition-colors" />
        {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"><IcoX /></button>}
      </div>

      {/* Grid de tarjetas */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <i className="ti ti-building-church text-[40px] text-slate-200" aria-hidden="true" />
          <p className="text-slate-400 text-sm">{search ? "Sin resultados" : "Sin congregaciones. Crea la primera."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CongregCard
              key={c.id}
              congreg={c}
              onSelect={cong => { setActiveCong(cong); setView("members"); }}
              onEdit={cong => { setEditingCong(cong); setCongregModal(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal congregación */}
      {congregModal && (
        <CongregModal
          initial={editingCong}
          onClose={() => { setCongregModal(false); setEditingCong(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}