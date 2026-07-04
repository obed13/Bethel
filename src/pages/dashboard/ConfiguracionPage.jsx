/**
 *
 * Módulo de configuración general dividido en grupos:
 *   - Iglesia        → nombre, subtítulo, descripción, año, logo
 *   - Contacto       → email, teléfono, dirección, WhatsApp
 *   - Redes sociales → Instagram, Facebook, YouTube
 *   - Apariencia     → colores primario y de acento
 *   - Notificaciones → email de alertas de mensajes
 *   - Mantenimiento  → modo mantenimiento y mensaje
 *   - Cuenta         → cambiar contraseña del usuario actual
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth, authHeaders } from "../../hooks/useAuth";

// ─── Grupos y sus metadatos ───────────────────────────────────────────────────

const GRUPOS = [
  { id: "iglesia",        label: "Información de la iglesia", icon: "ti-building-church" },
  { id: "contacto",       label: "Contacto",                  icon: "ti-phone"           },
  { id: "social",         label: "Redes sociales",            icon: "ti-brand-instagram" },
  { id: "apariencia",     label: "Apariencia",                icon: "ti-palette"         },
  { id: "notificaciones", label: "Notificaciones",            icon: "ti-bell"            },
  { id: "mantenimiento",  label: "Mantenimiento",             icon: "ti-tools"           },
  { id: "cuenta",         label: "Mi cuenta",                 icon: "ti-user-circle"     },
];

// ─── Iconos ───────────────────────────────────────────────────────────────────
const IcoCheck  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoSave   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoEye    = ({ open }) => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{open ? <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="2" y1="2" x2="22" y2="22"/></>}</svg>;
const IcoAlert  = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoWarn   = () => <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

// ─── Componentes de campo ─────────────────────────────────────────────────────

function Field({ label, clave, value, tipo, onChange, hint }) {
  const [showPass, setShowPass] = useState(false);
  const isPass = tipo === "password";

  const baseClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-colors";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</label>

      {tipo === "textarea" ? (
        <textarea value={value ?? ""} onChange={e => onChange(clave, e.target.value)}
          rows={3} className={`${baseClass} resize-none`} />

      ) : tipo === "color" ? (
        <div className="flex items-center gap-3">
          <input type="color" value={value || "#000000"} onChange={e => onChange(clave, e.target.value)}
            className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer bg-transparent p-0.5" />
          <input type="text" value={value ?? ""} onChange={e => onChange(clave, e.target.value)}
            placeholder="#000000" className={`flex-1 ${baseClass}`} />
          <div className="w-10 h-10 rounded-xl border border-slate-200 shrink-0"
            style={{ background: value || "#000000" }} />
        </div>

      ) : isPass ? (
        <div className="relative">
          <input type={showPass ? "text" : "password"} value={value ?? ""}
            onChange={e => onChange(clave, e.target.value)}
            className={`${baseClass} pr-10`} placeholder="••••••••" />
          <button type="button" onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
            <IcoEye open={showPass} />
          </button>
        </div>

      ) : (
        <input
          type={tipo === "toggle" ? "text" : tipo}
          value={value ?? ""}
          onChange={e => onChange(clave, e.target.value)}
          className={baseClass}
          placeholder={tipo === "email" ? "correo@ejemplo.com" : tipo === "url" ? "https://..." : tipo === "tel" ? "+34 600 000 000" : ""}
        />
      )}

      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function Toggle({ label, sub, clave, value, onChange }) {
  const checked = value === "1" || value === true;
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <button type="button" role="switch" aria-checked={checked}
        onClick={() => onChange(clave, checked ? "0" : "1")}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${checked ? "bg-slate-950" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function SaveBtn({ onClick, saving, saved }) {
  return (
    <button type="button" onClick={onClick} disabled={saving}
      className={[
        "flex items-center gap-1.5 px-5 h-9 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-60",
        saved ? "bg-emerald-600 text-white" : "bg-slate-950 text-white hover:bg-slate-800",
      ].join(" ")}>
      {saving ? (
        <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando…</>
      ) : saved ? (
        <><IcoCheck /> Guardado</>
      ) : (
        <><IcoSave /> Guardar cambios</>
      )}
    </button>
  );
}

function SectionCard({ title, sub, children, onSave, saving, saved, alert }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900 text-[14px]">{title}</h3>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {onSave && <SaveBtn onClick={onSave} saving={saving} saved={saved} />}
      </div>
      {alert && (
        <div className="flex items-start gap-2 mx-5 mt-4 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
          <IcoWarn /> {alert}
        </div>
      )}
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </div>
  );
}

// ─── Sección: Mi cuenta (cambiar contraseña) ──────────────────────────────────

function CuentaSection() {
  const { user } = useAuth();
  const [form,   setForm]   = useState({ passwordActual: "", passwordNuevo: "", passwordConfirm: "" });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");
  const s = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.passwordActual)         { setError("Ingresa tu contraseña actual"); return; }
    if (form.passwordNuevo.length < 8){ setError("La nueva contraseña debe tener al menos 8 caracteres"); return; }
    if (form.passwordNuevo !== form.passwordConfirm) { setError("Las contraseñas no coinciden"); return; }

    setSaving(true);
    try {
      const res  = await fetch(`/api/usuarios?id=${user.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body:    JSON.stringify({ password: form.passwordNuevo }),
      });
      const json = await res.json();
      if (!json.ok) { setError(json.error ?? "Error al guardar"); return; }
      setSaved(true);
      setForm({ passwordActual: "", passwordNuevo: "", passwordConfirm: "" });
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Error de conexión"); }
    finally { setSaving(false); }
  };

  return (
    <SectionCard
      title="Mi cuenta"
      sub="Información de tu usuario y cambio de contraseña"
      onSave={handleSave}
      saving={saving}
      saved={saved}
    >
      {/* Info usuario (solo lectura) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Nombre</label>
          <p className="text-sm text-slate-900 font-medium">{user?.name}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Correo</label>
          <p className="text-sm text-slate-900 font-medium">{user?.email}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Rol</label>
          <span className="inline-block w-fit px-2 py-0.5 rounded-full bg-slate-950 text-[#FCD34D] text-[11px] font-medium capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Cambiar contraseña</p>
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <IcoAlert /> {error}
        </div>
      )}
      <Field label="Contraseña actual"    clave="passwordActual"  value={form.passwordActual}  tipo="password" onChange={(_, v) => s("passwordActual")(v)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nueva contraseña"   clave="passwordNuevo"   value={form.passwordNuevo}   tipo="password" onChange={(_, v) => s("passwordNuevo")(v)}   hint="Mínimo 8 caracteres" />
        <Field label="Confirmar contraseña" clave="passwordConfirm" value={form.passwordConfirm} tipo="password" onChange={(_, v) => s("passwordConfirm")(v)} />
      </div>
    </SectionCard>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const [activeGroup, setActiveGroup]   = useState("iglesia");
  const [config,      setConfig]        = useState({});    // { grupo: { clave: { valor, tipo, label } } }
  const [localVals,   setLocalVals]     = useState({});    // { clave: valor } — edición local
  const [loading,     setLoading]       = useState(true);
  const [saving,      setSaving]        = useState(false);
  const [saved,       setSaved]         = useState(false);
  const [error,       setError]         = useState("");
  const [mobileOpen,  setMobileOpen]    = useState(false);

  // ── Fetch configuración ─────────────────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/configuracion", { headers: authHeaders() });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setConfig(json.data);
      // Inicializa los valores locales con los de la BD
      const flat = {};
      for (const grupo of Object.values(json.data)) {
        for (const [clave, meta] of Object.entries(grupo)) {
          flat[clave] = meta.valor;
        }
      }
      setLocalVals(flat);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // ── Cambio local ────────────────────────────────────────────────────────────
  const handleChange = useCallback((clave, valor) => {
    setLocalVals(prev => ({ ...prev, [clave]: valor }));
  }, []);

  // ── Guardar grupo activo ────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const grupoMeta = config[activeGroup];
    if (!grupoMeta) return;

    // Solo envía las claves del grupo activo
    const payload = {};
    for (const clave of Object.keys(grupoMeta)) {
      if (localVals[clave] !== undefined) payload[clave] = localVals[clave];
    }

    setError(""); setSaving(true);
    try {
      const res  = await fetch("/api/configuracion", {
        method:  "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Error al guardar");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }, [config, activeGroup, localVals]);

  // ── Renderizar campos del grupo activo ──────────────────────────────────────
  const renderGroup = () => {
    if (activeGroup === "cuenta") return <CuentaSection />;

    const grupoMeta = config[activeGroup];
    if (!grupoMeta) return null;

    // Separar toggles de campos normales
    const toggles = Object.entries(grupoMeta).filter(([, m]) => m.tipo === "toggle");
    const campos  = Object.entries(grupoMeta).filter(([, m]) => m.tipo !== "toggle");

    const HINTS = {
      "contacto_whatsapp":    "Solo dígitos con código de país. Ej: 34690717991",
      "apariencia_color_primario": "Color principal de fondos oscuros del sitio",
      "apariencia_color_acento":   "Color de botones y elementos destacados",
      "mantenimiento_activo": "",
      "notif_mensajes_email": "",
    };

    const SUBS = {
      iglesia:        "Datos básicos que aparecen en la web pública y el footer",
      contacto:       "Información de contacto visible en el sitio web",
      social:         "URLs completas de los perfiles oficiales de Bethel",
      apariencia:     "Colores del tema visual del sitio público",
      notificaciones: "Configuración de alertas automáticas",
      mantenimiento:  "Activa el modo mantenimiento para ocultar temporalmente el sitio",
    };

    return (
      <div className="flex flex-col gap-4">
        {/* Campos de texto / email / url / color / textarea */}
        {campos.length > 0 && (
          <SectionCard
            title={GRUPOS.find(g => g.id === activeGroup)?.label ?? activeGroup}
            sub={SUBS[activeGroup]}
            onSave={handleSave}
            saving={saving}
            saved={saved}
          >
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <IcoAlert /> {error}
              </div>
            )}
            <div className={`grid gap-4 ${campos.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              {campos.map(([clave, meta]) => (
                <div key={clave} className={meta.tipo === "textarea" || meta.tipo === "color" ? "col-span-full" : ""}>
                  <Field
                    label={meta.label}
                    clave={clave}
                    value={localVals[clave] ?? meta.valor}
                    tipo={meta.tipo}
                    onChange={handleChange}
                    hint={HINTS[clave]}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Toggles */}
        {toggles.length > 0 && (
          <SectionCard
            title="Opciones"
            onSave={handleSave}
            saving={saving}
            saved={saved}
            alert={
              activeGroup === "mantenimiento" &&
              (localVals["mantenimiento_activo"] === "1")
                ? "El sitio público estará oculto mientras el modo mantenimiento esté activo."
                : undefined
            }
          >
            {toggles.map(([clave, meta]) => (
              <Toggle
                key={clave}
                label={meta.label}
                clave={clave}
                value={localVals[clave] ?? meta.valor}
                onChange={handleChange}
              />
            ))}
          </SectionCard>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-0.5">Configuración</h1>
        <p className="text-sm text-slate-400">Ajustes generales del panel y del sitio web de Bethel</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Sidebar desktop ── */}
        <nav className="hidden lg:flex flex-col gap-0.5 w-55 shrink-0">
          {GRUPOS.map(g => (
            <button key={g.id} type="button" onClick={() => setActiveGroup(g.id)}
              className={[
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors cursor-pointer",
                activeGroup === g.id
                  ? "bg-slate-950 text-[#FCD34D]"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}>
              <i className={`ti ${g.icon} text-[16px] shrink-0`} aria-hidden="true" />
              {g.label}
            </button>
          ))}
        </nav>

        {/* ── Dropdown móvil ── */}
        <div className="lg:hidden">
          <button type="button" onClick={() => setMobileOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900">
            <span className="flex items-center gap-2">
              <i className={`ti ${GRUPOS.find(g => g.id === activeGroup)?.icon} text-[17px]`} aria-hidden="true" />
              {GRUPOS.find(g => g.id === activeGroup)?.label}
            </span>
            <i className={`ti ti-chevron-${mobileOpen ? "up" : "down"} text-[15px] text-slate-400`} aria-hidden="true" />
          </button>
          {mobileOpen && (
            <div className="mt-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg z-10 relative">
              {GRUPOS.map(g => (
                <button key={g.id} type="button"
                  onClick={() => { setActiveGroup(g.id); setMobileOpen(false); }}
                  className={[
                    "w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors",
                    activeGroup === g.id ? "bg-slate-950 text-[#FCD34D]" : "text-slate-600 hover:bg-slate-50",
                  ].join(" ")}>
                  <i className={`ti ${g.icon} text-[16px]`} aria-hidden="true" />
                  {g.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Panel de contenido ── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col gap-4 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            renderGroup()
          )}
        </div>
      </div>
    </div>
  );
}