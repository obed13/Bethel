/**
 * Gestión de usuarios administradores del dashboard.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth, authHeaders } from "../../hooks/useAuth";

// ─── Iconos ───────────────────────────────────────────────────────────────────
const IcoPlus   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoEdit   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoTrash  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IcoX      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoEye    = ({ open }) => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{open ? <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="2" y1="2" x2="22" y2="22"/></>}</svg>;
const IcoSearch = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoShield = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

const ROLE_BADGE = {
  admin:  "bg-slate-950 text-[#FCD34D]",
  editor: "bg-blue-50 text-blue-700",
  viewer: "bg-slate-100 text-slate-500",
};

const ROLE_LABEL = { admin: "Admin", editor: "Editor", viewer: "Viewer" };

// ─── Campo de formulario ──────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", placeholder = "", required, disabled }) {
  const [showPass, setShowPass] = useState(false);
  const isPass = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPass && showPass ? "text" : type}
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-slate-950 focus:bg-white transition-colors disabled:opacity-50 pr-10"
        />
        {isPass && (
          <button type="button" onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
            <IcoEye open={showPass} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Modal usuario ────────────────────────────────────────────────────────────

const EMPTY = { name: "", email: "", password: "", role_id: 2, active: true };

function UserModal({ initial, roles, onClose, onSaved, currentUserId }) {
  const isEdit = !!initial?.id;
  const isSelf = isEdit && initial.id === currentUserId;
  const [form,   setForm]   = useState(initial ? { ...initial, password: "" } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const s = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim())  { setError("El nombre es obligatorio"); return; }
    if (!form.email.trim()) { setError("El correo es obligatorio"); return; }
    if (!isEdit && (!form.password || form.password.length < 8)) {
      setError("La contraseña debe tener al menos 8 caracteres"); return;
    }
    if (form.password && form.password.length < 8 && form.password.length > 0) {
      setError("La contraseña debe tener al menos 8 caracteres"); return;
    }
    setError(""); setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role_id: form.role_id, active: form.active };
      if (form.password) payload.password = form.password;
      const url    = isEdit ? `/api/usuarios?id=${initial.id}` : "/api/usuarios";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) { setError(json.error ?? "Error al guardar"); return; }
      onSaved(json.data);
    } catch { setError("Error de conexión"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md border border-slate-100 shadow-xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[15px] font-semibold text-slate-900">{isEdit ? "Editar usuario" : "Nuevo usuario"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors"><IcoX /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

          <Field label="Nombre completo" value={form.name}  onChange={s("name")}  placeholder="María García" required />
          <Field label="Correo electrónico" value={form.email} onChange={s("email")} type="email" placeholder="maria@bethel.church" required disabled={isEdit} />
          <Field label={isEdit ? "Nueva contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
            value={form.password} onChange={s("password")} type="password"
            placeholder={isEdit ? "••••••••" : "Mínimo 8 caracteres"} required={!isEdit} />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Rol</label>
            <select value={form.role_id} onChange={e => s("role_id")(Number(e.target.value))}
              disabled={isSelf}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 transition-colors disabled:opacity-50">
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name === "admin" ? "Admin — Acceso total" : r.name === "editor" ? "Editor — Sin gestión de usuarios" : "Viewer — Solo lectura"}</option>
              ))}
            </select>
            {isSelf && <p className="text-[11px] text-slate-400">No puedes cambiar tu propio rol</p>}
          </div>

          {isEdit && !isSelf && (
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <p className="text-sm text-slate-700">Usuario activo</p>
                <p className="text-[11px] text-slate-400">Los usuarios inactivos no pueden iniciar sesión</p>
              </div>
              <button type="button" onClick={() => s("active")(!form.active)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${form.active ? "bg-slate-950" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${form.active ? "translate-x-0.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer transition-colors disabled:opacity-60">
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fila de usuario ──────────────────────────────────────────────────────────

function UserRow({ user, onEdit, onToggle, onDelete, currentUserId, isAdmin }) {
  const isSelf = user.id === currentUserId;
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group">
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 ${user.active ? "bg-slate-950 text-[#FCD34D]" : "bg-slate-100 text-slate-400"}`}>
        {initials(user.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-medium text-slate-900 truncate">{user.name}</span>
          {isSelf && <span className="text-[10px] bg-[#FCD34D]/20 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Tú</span>}
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${ROLE_BADGE[user.role_name] ?? "bg-slate-100 text-slate-500"}`}>
            <IcoShield /> {ROLE_LABEL[user.role_name] ?? user.role_name}
          </span>
          {!user.active && (
            <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-medium">Inactivo</span>
          )}
        </div>
        <p className="text-[11px] text-slate-400">{user.email} · Desde {fmtDate(user.created_at)}</p>
      </div>

      {/* Acciones */}
      {confirmDel ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-slate-500">¿Desactivar?</span>
          <button onClick={() => { onDelete(user.id); setConfirmDel(false); }}
            className="h-7 px-2.5 rounded-lg bg-red-600 text-white text-[11px] font-medium hover:bg-red-700 transition-colors cursor-pointer">Sí</button>
          <button onClick={() => setConfirmDel(false)}
            className="h-7 px-2.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] hover:bg-slate-50 transition-colors cursor-pointer">No</button>
        </div>
      ) : (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isAdmin && (
            <button onClick={() => onEdit(user)} aria-label="Editar usuario"
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
              <IcoEdit />
            </button>
          )}
          {isAdmin && !isSelf && (
            <button onClick={() => setConfirmDel(true)} aria-label="Desactivar usuario"
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer transition-colors">
              <IcoTrash />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role_name === "admin";
  const [users,   setUsers]   = useState([]);
  const [roles,   setRoles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [modal,   setModal]   = useState(null);   // null | "new" | user obj
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("todos"); // "todos"|"activos"|"inactivos"

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch("/api/usuarios", { headers: authHeaders() }),
        fetch("/api/roles",    { headers: authHeaders() }),
      ]);
      const [uJson, rJson] = await Promise.all([uRes.json(), rRes.json()]);
      if (!uJson.ok) throw new Error(uJson.error);
      setUsers(uJson.data);
      if (rJson.ok) setRoles(rJson.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSaved = useCallback((data) => {
    setUsers(prev => {
      const idx = prev.findIndex(u => u.id === data.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = data; return next; }
      return [data, ...prev];
    });
    setModal(null);
  }, []);

  const handleDelete = useCallback(async (id) => {
    await fetch(`/api/usuarios?id=${id}`, { method: "DELETE", headers: authHeaders() });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchFilter = filter === "todos" || (filter === "activos" && u.active) || (filter === "inactivos" && !u.active);
      return matchSearch && matchFilter;
    });
  }, [users, search, filter]);

  const stats = useMemo(() => ({
    total:    users.length,
    activos:  users.filter(u => u.active).length,
    admins:   users.filter(u => u.role_name === "admin").length,
  }), [users]);

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-0.5">Usuarios</h1>
          <p className="text-sm text-slate-400">Administradores del panel de Bethel</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal("new")}
            className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 cursor-pointer transition-colors">
            <IcoPlus /> Nuevo usuario
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total usuarios", value: stats.total,   accent: "#FCD34D" },
          { label: "Activos",        value: stats.activos, accent: "#10b981" },
          { label: "Admins",         value: stats.admins,  accent: "#6366f1" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: accent }} />
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mb-2">{label}</p>
            <p className="text-2xl font-semibold text-slate-900">{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 min-w-45">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><IcoSearch /></span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="w-full pl-9 pr-3 h-9 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"><IcoX /></button>
            )}
          </div>
          <div className="flex gap-1">
            {[{ k:"todos",    l:"Todos" }, { k:"activos", l:"Activos" }, { k:"inactivos", l:"Inactivos" }].map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)}
                className={`px-3 h-9 rounded-xl text-sm transition-colors cursor-pointer ${filter === f.k ? "bg-slate-950 text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-center px-4">
            <i className="ti ti-users text-[36px] text-slate-200" aria-hidden="true" />
            <p className="text-slate-400 text-sm">Sin usuarios que coincidan</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(u => (
              <UserRow
                key={u.id}
                user={u}
                onEdit={u => setModal(u)}
                onDelete={handleDelete}
                currentUserId={currentUser?.id}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <UserModal
          initial={modal === "new" ? null : modal}
          roles={roles}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          currentUserId={currentUser?.id}
        />
      )}
    </div>
  );
}