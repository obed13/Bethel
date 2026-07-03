/**
 *
 * Vistas:
 *   1. Grid de ministerios con KPIs
 *   2. Detalle del ministerio → lider, secretario, tesorero e integrantes
 *   3. Modal crear/editar ministerio
 *   4. Modal crear/editar integrante
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { authHeaders } from "../../hooks/useAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

// Roles con cargo destacado (aparecen primero con badge especial)
const ROLE_BADGE = {
  "Líder":      { bg: "bg-slate-950", text: "text-[#FCD34D]" },
  "Secretario": { bg: "bg-blue-50",   text: "text-blue-700"  },
  "Tesorero":   { bg: "bg-emerald-50",text: "text-emerald-700"},
  "Co-Líder":   { bg: "bg-amber-50",  text: "text-amber-700" },
  "Miembro":    { bg: "bg-slate-100", text: "text-slate-500" },
};

const ROL_ORDER = ["Líder","Co-Líder","Secretario","Tesorero","Miembro"];

// ─── Iconos ───────────────────────────────────────────────────────────────────
const IcoPlus   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoEdit   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoTrash  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IcoX      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoBack   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoSearch = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoPhone  = () => <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoMail   = () => <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IcoUsers  = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

// ─── Componentes base ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, type="text", placeholder="", required, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-colors" />
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function ModalWrapper({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg border border-slate-100 shadow-xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
            <IcoX />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

function DelConfirm({ label, onConfirm, onCancel }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-[11px] text-slate-500">¿Eliminar {label}?</span>
      <button onClick={onConfirm}
        className="h-7 px-2.5 rounded-lg bg-red-600 text-white text-[11px] font-medium hover:bg-red-700 cursor-pointer">Sí</button>
      <button onClick={onCancel}
        className="h-7 px-2.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] hover:bg-slate-50 cursor-pointer">No</button>
    </div>
  );
}

// ─── Modal Ministerio ─────────────────────────────────────────────────────────

const ICONOS = [
  { icon:"ti-music",       label:"Música"      },
  { icon:"ti-microphone",  label:"Alabanza"    },
  { icon:"ti-heart",       label:"Damas"       },
  { icon:"ti-shield",      label:"Varones"     },
  { icon:"ti-world",       label:"Evangelismo" },
  { icon:"ti-compass",     label:"Exploración" },
  { icon:"ti-star",        label:"Misioneros"  },
  { icon:"ti-users",       label:"General"     },
  { icon:"ti-book",        label:"Enseñanza"   },
  { icon:"ti-pray",        label:"Oración"     },
  { icon:"ti-hand-stop",   label:"Apoyo"       },
  { icon:"ti-certificate", label:"Formación"   },
];

const COLORES = [
  "#FCD34D","#60a5fa","#f472b6","#34d399",
  "#fb923c","#a78bfa","#f43f5e","#14b8a6",
  "#e879f9","#84cc16","#0ea5e9","#f97316",
];

const EMPTY_MIN = { nombre:"", descripcion:"", icono:"ti-users", color:"#FCD34D" };

function MinisterioModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id;
  const [form,   setForm]   = useState(initial ?? EMPTY_MIN);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const s = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setError(""); setSaving(true);
    try {
      const url    = isEdit ? `/api/ministerios?id=${initial.id}` : "/api/ministerios";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) { setError(json.error ?? "Error al guardar"); return; }
      onSaved(json.data);
    } catch { setError("Error de conexión"); }
    finally { setSaving(false); }
  };

  return (
    <ModalWrapper
      title={isEdit ? "Editar ministerio" : "Nuevo ministerio"}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer transition-colors disabled:opacity-60">
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear ministerio"}
          </button>
        </>
      }
    >
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: form.color + "25" }}>
          <i className={`ti ${form.icono} text-[24px]`} style={{ color: form.color }} aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-[14px]">{form.nombre || "Nombre del ministerio"}</p>
          <p className="text-[11px] text-slate-400">{form.descripcion || "Descripción…"}</p>
        </div>
      </div>

      <Field label="Nombre" value={form.nombre} onChange={s("nombre")} placeholder="Ej: Alabanza" required />
      <Field label="Descripción" value={form.descripcion} onChange={s("descripcion")} placeholder="Breve descripción del ministerio" />

      {/* Selector de ícono */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Ícono</label>
        <div className="grid grid-cols-6 gap-1.5">
          {ICONOS.map(({ icon, label }) => (
            <button key={icon} type="button" onClick={() => s("icono")(icon)}
              title={label}
              className={`h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer
                ${form.icono === icon ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 hover:border-slate-400 text-slate-600"}`}>
              <i className={`ti ${icon} text-[18px]`} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="text" value={form.icono} onChange={e => s("icono")(e.target.value)}
            placeholder="ti-music"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 transition-colors" />
          <a href="https://tabler.io/icons" target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-slate-700 underline whitespace-nowrap">
            Ver íconos
          </a>
        </div>
      </div>

      {/* Selector de color */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORES.map(c => (
            <button key={c} type="button" onClick={() => s("color")(c)}
              className={`w-7 h-7 rounded-full transition-all cursor-pointer ${form.color === c ? "ring-2 ring-offset-2 ring-slate-950 scale-110" : "hover:scale-110"}`}
              style={{ background: c }}
              title={c}
            />
          ))}
          <input type="color" value={form.color} onChange={e => s("color")(e.target.value)}
            className="w-7 h-7 rounded-full border border-slate-200 cursor-pointer bg-transparent"
            title="Color personalizado" />
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Modal Integrante ─────────────────────────────────────────────────────────

const EMPTY_INTEG = { nombre:"", telefono:"", email:"", rol_id:1, notas:"" };

function IntegranteModal({ initial, ministerio_id, roles, onClose, onSaved }) {
  const isEdit = !!initial?.id;
  const [form,   setForm]   = useState(initial ?? EMPTY_INTEG);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const s = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (!form.rol_id)        { setError("El rol es obligatorio"); return; }
    setError(""); setSaving(true);
    try {
      const url    = isEdit ? `/api/ministerios?integrantes=1&id=${initial.id}` : "/api/ministerios?integrantes=1";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ ...form, ministerio_id, rol_id: Number(form.rol_id) }),
      });
      const json = await res.json();
      if (!json.ok) { setError(json.error ?? "Error al guardar"); return; }
      onSaved(json.data);
    } catch { setError("Error de conexión"); }
    finally { setSaving(false); }
  };

  return (
    <ModalWrapper
      title={isEdit ? "Editar integrante" : "Agregar integrante"}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer transition-colors disabled:opacity-60">
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Agregar"}
          </button>
        </>
      }
    >
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

      <Field label="Nombre completo" value={form.nombre} onChange={s("nombre")} placeholder="María García López" required />

      {/* Rol */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Cargo / Rol <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {roles.map(r => (
            <button key={r.id} type="button" onClick={() => s("rol_id")(r.id)}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer text-left
                ${Number(form.rol_id) === r.id
                  ? "bg-slate-950 text-white border-slate-950"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
              {r.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Teléfono" value={form.telefono} onChange={s("telefono")} type="tel" placeholder="+34 600 000 000" />
        <Field label="Correo"   value={form.email}    onChange={s("email")}    type="email" placeholder="correo@ejemplo.com" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Notas</label>
        <textarea value={form.notas} onChange={e => s("notas")(e.target.value)}
          rows={2} placeholder="Observaciones adicionales…"
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-colors resize-none" />
      </div>
    </ModalWrapper>
  );
}

// ─── Card de ministerio ───────────────────────────────────────────────────────

function MinisterioCard({ ministerio, onEdit, onDelete, onClick }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const { color, icono } = ministerio;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header coloreado */}
      <div
        className="h-20 flex items-center justify-center cursor-pointer relative"
        style={{ background: color + "18" }}
        onClick={onClick}
      >
        <i className={`ti ${icono} text-[40px]`} style={{ color }} aria-hidden="true" />
        {/* Badge integrantes */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 text-[11px] font-medium backdrop-blur-sm border border-slate-200"
          style={{ color }}>
          <IcoUsers /> {ministerio.total_integrantes}
        </div>
      </div>

      <div className="p-4">
        {/* Título + acciones */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <button onClick={onClick} className="flex-1 min-w-0 text-left cursor-pointer">
            <h3 className="font-semibold text-slate-900 text-[15px] leading-tight">{ministerio.nombre}</h3>
            {ministerio.lider && (
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <i className="ti ti-crown text-[11px]" aria-hidden="true" /> {ministerio.lider}
              </p>
            )}
          </button>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(ministerio)} aria-label="Editar"
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
              <IcoEdit />
            </button>
            <button onClick={() => setConfirmDel(true)} aria-label="Eliminar"
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer transition-colors">
              <IcoTrash />
            </button>
          </div>
        </div>

        {ministerio.descripcion && (
          <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">{ministerio.descripcion}</p>
        )}

        {/* Línea de color */}
        <div className="h-0.5 w-full rounded-full" style={{ background: color + "40" }} />

        {/* Confirmación borrado */}
        {confirmDel && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <DelConfirm
              label="este ministerio"
              onConfirm={() => { onDelete(ministerio.id); setConfirmDel(false); }}
              onCancel={() => setConfirmDel(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Fila de integrante ───────────────────────────────────────────────────────

function IntegranteRow({ integrante, color, onEdit, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const badge = ROLE_BADGE[integrante.rol_nombre] ?? ROLE_BADGE["Miembro"];

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0"
        style={{ background: color + "20", color }}>
        {initials(integrante.nombre)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-medium text-slate-900 truncate">{integrante.nombre}</span>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
            {integrante.rol_nombre}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {integrante.telefono && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <IcoPhone /> {integrante.telefono}
            </span>
          )}
          {integrante.email && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <IcoMail /> {integrante.email}
            </span>
          )}
          {integrante.notas && (
            <span className="text-[11px] text-slate-400 italic truncate max-w-30">{integrante.notas}</span>
          )}
        </div>
      </div>

      {confirmDel ? (
        <DelConfirm
          label="este integrante"
          onConfirm={() => { onDelete(integrante.id); setConfirmDel(false); }}
          onCancel={() => setConfirmDel(false)}
        />
      ) : (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(integrante)} aria-label="Editar"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
            <IcoEdit />
          </button>
          <button onClick={() => setConfirmDel(true)} aria-label="Eliminar"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer transition-colors">
            <IcoTrash />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Vista detalle ministerio ─────────────────────────────────────────────────

function MinisterioDetail({ ministerio, integrantes, loadingI, roles, onBack, onEditMin, onAddInteg, onEditInteg, onDeleteInteg }) {
  const [search,  setSearch]  = useState("");
  const [rolFilt, setRolFilt] = useState("todos");

  const { color, icono } = ministerio;

  // Agrupar por rol en el orden correcto
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = integrantes.filter(i =>
      (!q || i.nombre.toLowerCase().includes(q) || i.email?.toLowerCase().includes(q)) &&
      (rolFilt === "todos" || i.rol_nombre === rolFilt)
    );
    const order = ROL_ORDER;
    const map = {};
    list.forEach(i => {
      const key = i.rol_nombre;
      if (!map[key]) map[key] = [];
      map[key].push(i);
    });
    return order.filter(r => map[r]).map(r => ({ rol: r, items: map[r] }));
  }, [integrantes, search, rolFilt]);

  const rolesPresentes = useMemo(() => [...new Set(integrantes.map(i => i.rol_nombre))], [integrantes]);

  // Integrantes destacados (Líder, Secretario, Tesorero)
  const destacados = useMemo(() => {
    const find = (nombre) => integrantes.find(i => i.rol_nombre === nombre);
    return [
      { rol: "Líder",      data: find("Líder")      },
      { rol: "Secretario", data: find("Secretario") },
      { rol: "Tesorero",   data: find("Tesorero")   },
    ].filter(d => d.data);
  }, [integrantes]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors">
            <IcoBack />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color + "20" }}>
              <i className={`ti ${icono} text-[20px]`} style={{ color }} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{ministerio.nombre}</h1>
              {ministerio.descripcion && <p className="text-sm text-slate-400">{ministerio.descripcion}</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => onEditMin(ministerio)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
            <IcoEdit /> Editar
          </button>
          <button onClick={onAddInteg}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 cursor-pointer transition-colors">
            <IcoPlus /> Agregar integrante
          </button>
        </div>
      </div>

      {/* Tarjetas de Líder, Secretario, Tesorero */}
      {destacados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {destacados.map(({ rol, data }) => {
            const badge = ROLE_BADGE[rol] ?? ROLE_BADGE["Miembro"];
            return (
              <div key={rol} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
                  style={{ background: color + "20", color }}>
                  {initials(data.nombre)}
                </div>
                <div className="min-w-0">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1 ${badge.bg} ${badge.text}`}>{rol}</span>
                  <p className="text-sm font-semibold text-slate-900 truncate">{data.nombre}</p>
                  {data.telefono && <p className="text-[11px] text-slate-400">{data.telefono}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista de integrantes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-45">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><IcoSearch /></span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar integrante…"
              className="w-full pl-9 pr-3 h-9 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"><IcoX /></button>
            )}
          </div>

          {/* Filtro por rol */}
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setRolFilt("todos")}
              className={`px-3 h-8 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${rolFilt === "todos" ? "bg-slate-950 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              Todos ({integrantes.length})
            </button>
            {rolesPresentes.map(r => (
              <button key={r} onClick={() => setRolFilt(r)}
                className={`px-3 h-8 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${rolFilt === r ? "bg-slate-950 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        {loadingI ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-4">
            <i className="ti ti-users text-[36px] text-slate-200" aria-hidden="true" />
            <p className="text-slate-400 text-sm">
              {search ? "Sin resultados para tu búsqueda" : "Este ministerio no tiene integrantes aún"}
            </p>
            {!search && (
              <button onClick={onAddInteg}
                className="text-sm text-slate-950 underline underline-offset-2 cursor-pointer hover:text-slate-600 transition-colors">
                Agregar el primer integrante
              </button>
            )}
          </div>
        ) : (
          <div>
            {grouped.map(({ rol, items }) => (
              <div key={rol}>
                {/* Separador de grupo */}
                <div className="px-4 py-2 bg-slate-50 border-y border-slate-100 flex items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${ROLE_BADGE[rol]?.bg ?? "bg-slate-100"} ${ROLE_BADGE[rol]?.text ?? "text-slate-500"}`}>
                    {rol}
                  </span>
                  <span className="text-[11px] text-slate-400">{items.length} integrante{items.length !== 1 ? "s" : ""}</span>
                </div>
                {items.map(i => (
                  <IntegranteRow
                    key={i.id}
                    integrante={i}
                    color={color}
                    onEdit={onEditInteg}
                    onDelete={onDeleteInteg}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MinisteriosPage() {
  const [ministerios,   setMinisterios]   = useState([]);
  const [roles,         setRoles]         = useState([]);
  const [integrantes,   setIntegrantes]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [loadingI,      setLoadingI]      = useState(false);
  const [error,         setError]         = useState(null);
  const [activeMin,     setActiveMin]     = useState(null);
  const [minModal,      setMinModal]      = useState(null);   // null | "new" | min obj
  const [integModal,    setIntegModal]    = useState(null);   // null | "new" | integ obj
  const [search,        setSearch]        = useState("");

  // ── Fetch ministerios + roles ───────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [mRes, rRes] = await Promise.all([
        fetch("/api/ministerios"),
        fetch("/api/ministerios?roles=1"),
      ]);
      const [mJson, rJson] = await Promise.all([mRes.json(), rRes.json()]);
      if (!mJson.ok) throw new Error(mJson.error);
      setMinisterios(mJson.data);
      if (rJson.ok) setRoles(rJson.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Fetch integrantes ───────────────────────────────────────────────────────
  const fetchIntegrantes = useCallback(async (minId) => {
    setLoadingI(true);
    try {
      const res  = await fetch(`/api/ministerios?integrantes=1&min_id=${minId}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setIntegrantes(json.data);
    } catch {}
    finally { setLoadingI(false); }
  }, []);

  const openMin = useCallback((min) => {
    setActiveMin(min);
    fetchIntegrantes(min.id);
  }, [fetchIntegrantes]);

  // ── Handlers ministerio ─────────────────────────────────────────────────────
  const handleMinSaved = useCallback((data) => {
    setMinisterios(prev => {
      const idx = prev.findIndex(m => m.id === data.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = { ...next[idx], ...data }; return next; }
      return [...prev, { ...data, total_integrantes: 0 }];
    });
    if (activeMin?.id === data.id) setActiveMin(a => ({ ...a, ...data }));
    setMinModal(null);
  }, [activeMin]);

  const handleDeleteMin = useCallback(async (id) => {
    await fetch(`/api/ministerios?id=${id}`, { method: "DELETE", headers: authHeaders() });
    setMinisterios(prev => prev.filter(m => m.id !== id));
    if (activeMin?.id === id) setActiveMin(null);
  }, [activeMin]);

  // ── Handlers integrante ─────────────────────────────────────────────────────
  const handleIntegSaved = useCallback((data) => {
    setIntegrantes(prev => {
      const idx = prev.findIndex(i => i.id === data.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = data; return next; }
      setMinisterios(ms => ms.map(m => m.id === data.ministerio_id
        ? { ...m, total_integrantes: (m.total_integrantes ?? 0) + 1 } : m));
      setActiveMin(a => a ? { ...a, total_integrantes: (a.total_integrantes ?? 0) + 1 } : a);
      return [...prev, data];
    });
    setIntegModal(null);
  }, []);

  const handleDeleteInteg = useCallback(async (id) => {
    await fetch(`/api/ministerios?integrantes=1&id=${id}`, { method: "DELETE", headers: authHeaders() });
    setIntegrantes(prev => {
      const i = prev.find(x => x.id === id);
      if (i) {
        setMinisterios(ms => ms.map(m => m.id === i.ministerio_id
          ? { ...m, total_integrantes: Math.max(0, (m.total_integrantes ?? 1) - 1) } : m));
        setActiveMin(a => a ? { ...a, total_integrantes: Math.max(0, (a.total_integrantes ?? 1) - 1) } : a);
      }
      return prev.filter(x => x.id !== id);
    });
  }, []);

  // ── Filtrado ────────────────────────────────────────────────────────────────
  const filteredMin = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ministerios;
    return ministerios.filter(m => m.nombre.toLowerCase().includes(q) || m.descripcion?.toLowerCase().includes(q));
  }, [ministerios, search]);

  const totalIntegrantes = useMemo(() => ministerios.reduce((s, m) => s + (m.total_integrantes ?? 0), 0), [ministerios]);

  // ── Vista detalle ───────────────────────────────────────────────────────────
  if (activeMin) {
    return (
      <div className="p-4 sm:p-6">
        <MinisterioDetail
          ministerio={activeMin}
          integrantes={integrantes}
          loadingI={loadingI}
          roles={roles}
          onBack={() => { setActiveMin(null); setIntegrantes([]); }}
          onEditMin={m => setMinModal(m)}
          onAddInteg={() => setIntegModal("new")}
          onEditInteg={i => setIntegModal(i)}
          onDeleteInteg={handleDeleteInteg}
        />
        {minModal && minModal !== "new" && (
          <MinisterioModal initial={minModal} onClose={() => setMinModal(null)} onSaved={handleMinSaved} />
        )}
        {integModal && (
          <IntegranteModal
            initial={integModal === "new" ? null : integModal}
            ministerio_id={activeMin.id}
            roles={roles}
            onClose={() => setIntegModal(null)}
            onSaved={handleIntegSaved}
          />
        )}
      </div>
    );
  }

  // ── Vista lista ─────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-0.5">Ministerios</h1>
          <p className="text-sm text-slate-400">Equipos y ministerios de Bethel</p>
        </div>
        <button onClick={() => setMinModal("new")}
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 cursor-pointer transition-colors">
          <IcoPlus /> Nuevo ministerio
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label:"Ministerios activos",   value: ministerios.length,  accent:"#FCD34D" },
          { label:"Total integrantes",     value: totalIntegrantes,    accent:"#60a5fa" },
          { label:"Promedio por ministerio", value: ministerios.length
              ? Math.round(totalIntegrantes / ministerios.length) : 0, accent:"#34d399" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: accent }} />
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mb-2">{label}</p>
            <p className="text-2xl font-semibold text-slate-900">{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><IcoSearch /></span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar ministerio…"
          className="w-full pl-10 pr-4 h-10 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-950 transition-colors shadow-sm" />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"><IcoX /></button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <i className="ti ti-alert-circle text-[32px] text-red-300" aria-hidden="true" />
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={fetchAll} className="text-sm text-slate-500 underline cursor-pointer">Reintentar</button>
        </div>
      ) : filteredMin.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <i className="ti ti-users-group text-[40px] text-slate-200" aria-hidden="true" />
          <p className="text-slate-400 text-sm">
            {search ? "Sin resultados para tu búsqueda" : "No hay ministerios registrados"}
          </p>
          {!search && (
            <button onClick={() => setMinModal("new")}
              className="text-sm text-slate-950 underline underline-offset-2 cursor-pointer">
              Crear el primer ministerio
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMin.map(m => (
            <MinisterioCard
              key={m.id}
              ministerio={m}
              onEdit={x => setMinModal(x)}
              onDelete={handleDeleteMin}
              onClick={() => openMin(m)}
            />
          ))}
        </div>
      )}

      {minModal && (
        <MinisterioModal
          initial={minModal === "new" ? null : minModal}
          onClose={() => setMinModal(null)}
          onSaved={handleMinSaved}
        />
      )}
    </div>
  );
}
