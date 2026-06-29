/**
 *
 * Módulo de mensajes del formulario de contacto.
 * Lee de GET /api/contact (protegido).
 * Marca como leído: PUT /api/contact?id=N
 * Elimina: DELETE /api/contact?id=N
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { authHeaders } from "../../hooks/useAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Ahora mismo";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `Hace ${d}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleString("es-ES", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

// ─── Iconos ───────────────────────────────────────────────────────────────────

const IcoMail      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IcoMailOpen  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>;
const IcoTrash     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IcoX         = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoSearch    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoRefresh   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IcoChevron   = ({ dir }) => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{dir === "left" ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}</svg>;
const IcoMailCheck = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m9 12 2 2 4-4"/></svg>;

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, accent, iconClass, iconBg, iconColor, loading }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: accent }} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <i className={`ti ${iconClass} text-[17px]`} style={{ color: iconColor }} aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900 leading-none mb-1">
        {loading ? "—" : value}
      </p>
    </div>
  );
}

// ─── Modal detalle de mensaje ─────────────────────────────────────────────────

function MessageModal({ message, onClose, onDelete, onMarkRead }) {
  const [confirmDel, setConfirmDel] = useState(false);

  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-100 shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-950 text-[#FCD34D] flex items-center justify-center text-[12px] font-semibold shrink-0">
              {initials(message.name)}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-[14px]">{message.name}</p>
              <a href={`mailto:${message.email}`}
                className="text-[12px] text-slate-400 hover:text-slate-700 transition-colors">
                {message.email}
              </a>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
            <IcoX />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {message.subject && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Asunto</p>
              <p className="text-sm font-medium text-slate-900">{message.subject}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Mensaje</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{message.message}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Recibido</p>
            <p className="text-sm text-slate-500">{fmtDate(message.created_at)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">

          {/* Responder */}
          <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || "Mensaje de Bethel")}`}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
            <IcoMail /> Responder
          </a>

          {/* Marcar leído */}
          {!message.read && (
            <button onClick={() => onMarkRead(message.id)}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap">
              <IcoMailCheck /> Marcar leído
            </button>
          )}

          {/* Eliminar con confirmación */}
          {confirmDel ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-slate-500">¿Eliminar?</span>
              <button onClick={() => { onDelete(message.id); setConfirmDel(false); }}
                className="h-9 px-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer">
                Sí
              </button>
              <button onClick={() => setConfirmDel(false)}
                className="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                No
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer">
              <IcoTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Fila de mensaje en la lista ──────────────────────────────────────────────

function MessageRow({ message, onClick }) {
  const unread = !message.read;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 cursor-pointer",
        unread ? "bg-[#FCD34D]/5" : "",
      ].join(" ")}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 ${unread ? "bg-slate-950 text-[#FCD34D]" : "bg-slate-100 text-slate-500"}`}>
        {initials(message.name)}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-sm truncate ${unread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
            {message.name}
          </span>
          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
            {timeAgo(message.created_at)}
          </span>
        </div>
        {message.subject && (
          <p className={`text-[12px] truncate mb-0.5 ${unread ? "text-slate-700 font-medium" : "text-slate-500"}`}>
            {message.subject}
          </p>
        )}
        <p className="text-[12px] text-slate-400 truncate">{message.message}</p>
      </div>

      {/* Punto no leído */}
      {unread && (
        <div className="w-2 h-2 rounded-full bg-[#FCD34D] mt-1.5 shrink-0" />
      )}
    </button>
  );
}

// ─── Paginación ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <button onClick={onPrev} disabled={page <= 1}
        className="flex items-center gap-1 px-3 h-8 rounded-lg border border-slate-200 text-sm text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors cursor-pointer">
        <IcoChevron dir="left" /> Anterior
      </button>
      <span className="text-[12px] text-slate-400">Página {page} de {totalPages}</span>
      <button onClick={onNext} disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 h-8 rounded-lg border border-slate-200 text-sm text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors cursor-pointer">
        Siguiente <IcoChevron dir="right" />
      </button>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function MensajesPage() {
  const [messages,  setMessages]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [page,      setPage]      = useState(1);
  const [filter,    setFilter]    = useState("todos");   // "todos" | "unread" | "read"
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);     // mensaje abierto en el modal

  // ── Fetch mensajes ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit:  PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      if (filter === "unread") params.set("unread", "1");

      const res  = await fetch(`/api/contact?${params}`, { headers: authHeaders() });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setMessages(json.data);
      setTotal(json.total);
    } catch (e) {
      setError(e.message ?? "Error al cargar los mensajes");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── Acciones ────────────────────────────────────────────────────────────────
  const handleMarkRead = useCallback(async (id) => {
    await fetch(`/api/contact?id=${id}`, { method: "PUT", headers: authHeaders() });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: 1 } : m));
    setSelected(prev => prev?.id === id ? { ...prev, read: 1 } : prev);
  }, []);

  const handleDelete = useCallback(async (id) => {
    await fetch(`/api/contact?id=${id}`, { method: "DELETE", headers: authHeaders() });
    setMessages(prev => prev.filter(m => m.id !== id));
    setTotal(t => t - 1);
    setSelected(null);
  }, []);

  const handleOpen = useCallback(async (message) => {
    setSelected(message);
    // Marca como leído automáticamente al abrir
    if (!message.read) handleMarkRead(message.id);
  }, [handleMarkRead]);

  // ── Filtrado local por búsqueda ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(m =>
      m.name.toLowerCase().includes(q)    ||
      m.email.toLowerCase().includes(q)   ||
      m.subject?.toLowerCase().includes(q)||
      m.message.toLowerCase().includes(q)
    );
  }, [messages, search]);

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const unreadCount = useMemo(() => messages.filter(m => !m.read).length, [messages]);
  const totalPages  = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-0.5">Mensajes</h1>
          <p className="text-sm text-slate-400">Mensajes recibidos desde el formulario de contacto</p>
        </div>
        <button onClick={fetchMessages}
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
          <IcoRefresh /> Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total mensajes"  value={total}        accent="#FCD34D" iconClass="ti-messages"      iconBg="bg-amber-50"   iconColor="#d97706" loading={loading} />
        <KpiCard label="Sin leer"        value={unreadCount}  accent="#6366f1" iconClass="ti-mail"          iconBg="bg-indigo-50"  iconColor="#4f46e5" loading={loading} />
        <KpiCard label="Leídos"          value={total - unreadCount} accent="#10b981" iconClass="ti-mail-opened" iconBg="bg-emerald-50" iconColor="#059669" loading={loading} />
        <KpiCard label="Esta página"     value={filtered.length} accent="#f43f5e" iconClass="ti-list"       iconBg="bg-rose-50"    iconColor="#e11d48" loading={loading} />
      </div>

      {/* Panel principal */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100">

          {/* Buscador */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <IcoSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o asunto…"
              className="w-full pl-9 pr-3 h-9 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-950 focus:bg-white transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <IcoX />
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-1">
            {[
              { key: "todos",  label: "Todos"     },
              { key: "unread", label: "Sin leer"  },
              { key: "read",   label: "Leídos"    },
            ].map(f => (
              <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
                className={[
                  "px-3 h-9 rounded-xl text-sm transition-colors cursor-pointer",
                  filter === f.key
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 text-slate-500 hover:bg-slate-50",
                ].join(" ")}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de mensajes */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-4">
            <i className="ti ti-alert-circle text-[32px] text-red-300" aria-hidden="true" />
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={fetchMessages}
              className="text-sm text-slate-500 hover:text-slate-900 underline cursor-pointer">
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <i className="ti ti-mail-off text-[36px] text-slate-200" aria-hidden="true" />
            <p className="text-slate-400 text-sm font-medium">
              {search ? "Sin resultados para tu búsqueda" : "No hay mensajes"}
            </p>
            {search && (
              <button onClick={() => setSearch("")}
                className="text-sm text-slate-500 hover:text-slate-900 underline cursor-pointer">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(m => (
              <MessageRow key={m.id} message={m} onClick={() => handleOpen(m)} />
            ))}
          </div>
        )}

        {/* Paginación */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage(p => p - 1)}
          onNext={() => setPage(p => p + 1)}
        />
      </div>

      {/* Modal detalle */}
      {selected && (
        <MessageModal
          message={selected}
          onClose={() => setSelected(null)}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}