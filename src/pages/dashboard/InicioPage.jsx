/**
 * src/pages/dashboard/InicioPage.jsx — Bethel Dashboard
 *
 * Página de inicio del panel administrativo.
 * Muestra KPIs generales, próximos eventos, mensajes recientes
 * y actividad de congregaciones.
 */

import { useState, useEffect, useMemo } from "react";
import { useAuth, authHeaders } from "../../hooks/useAuth";
import { fmtEventDate, daysUntil, timeAgo } from "./Helpers/helpers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const CATEGORY_COLOR = {
  culto:     "#FCD34D",
  jovenes:   "#60a5fa",
  damas:   "#f472b6",
  liderazgo: "#34d399",
  panderistas:       "#a78bfa",
  oracion:   "#4ade80",
};

const CATEGORY_LABEL = {
  culto: "Culto", jovenes: "Jóvenes", damas: "Damas",
  liderazgo: "Liderazgo", panderistas: "Panderistas", oracion: "Oración",
};

// ─── Iconos ───────────────────────────────────────────────────────────────────
const IcoCalendar  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoMail      = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IcoUsers     = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoChurch    = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L8 6H4v2h2v14h12V8h2V6h-4L12 2z"/><rect x="9" y="12" width="6" height="8"/></svg>;
const IcoArrow     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoClock     = () => <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoPin       = () => <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoRefresh   = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IcoStar      = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent, icon: Icon, loading, linkTo, onNavigate }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 relative overflow-hidden flex flex-col gap-3">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accent + "20" }}>
          <span style={{ color: accent }}><Icon /></span>
        </div>
        {linkTo && (
          <button onClick={() => onNavigate(linkTo)}
            className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors">
            Ver todo <IcoArrow />
          </button>
        )}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-semibold text-slate-900 leading-none mb-1">
          {loading ? <span className="inline-block w-12 h-7 bg-slate-100 rounded animate-pulse" /> : value}
        </p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Próximos eventos ─────────────────────────────────────────────────────────

function UpcomingEvents({ events, loading, onNavigate }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-slate-400"><IcoCalendar /></span>
          <h3 className="font-semibold text-slate-900 text-[14px]">Próximos eventos</h3>
        </div>
        <button onClick={() => onNavigate("/dashboard/eventos")}
          className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors">
          Ver todos <IcoArrow />
        </button>
      </div>

      {loading ? (
        <div className="p-4 flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-3/4" /><div className="h-3 bg-slate-100 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
          <i className="ti ti-calendar-off text-[32px] text-slate-200" aria-hidden="true" />
          <p className="text-slate-400 text-sm">Sin eventos próximos</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {events.map(e => {
            const color = CATEGORY_COLOR[e.category] ?? "#94a3b8";
            const until = daysUntil(e.date);
            return (
              <div key={e.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                {/* Dot de categoría */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: color + "20" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {e.title}
                      {e.featured && <span className="ml-1 text-amber-500"><IcoStar /></span>}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${until === "Hoy" ? "bg-slate-950 text-[#FCD34D]" : until === "Mañana" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                      {until}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <IcoClock /> {fmtEventDate(e.date)} · {e.time}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <IcoPin /> {e.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mensajes recientes ───────────────────────────────────────────────────────

function RecentMessages({ messages, loading, onNavigate }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-slate-400"><IcoMail /></span>
          <h3 className="font-semibold text-slate-900 text-[14px]">Mensajes recientes</h3>
        </div>
        <button onClick={() => onNavigate("/dashboard/mensajes")}
          className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors">
          Ver todos <IcoArrow />
        </button>
      </div>

      {loading ? (
        <div className="p-4 flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 bg-slate-100 rounded-full shrink-0" />
              <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-2/3" /><div className="h-3 bg-slate-100 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
          <i className="ti ti-mail-off text-[32px] text-slate-200" aria-hidden="true" />
          <p className="text-slate-400 text-sm">Sin mensajes recientes</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {messages.map(m => (
            <button key={m.id} onClick={() => onNavigate("/dashboard/mensajes")}
              className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 ${!m.read ? "bg-slate-950 text-[#FCD34D]" : "bg-slate-100 text-slate-500"}`}>
                {initials(m.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={`text-sm truncate ${!m.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                    {m.name}
                  </span>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{timeAgo(m.created_at)}</span>
                </div>
                {m.subject && <p className="text-[12px] text-slate-500 truncate mb-0.5">{m.subject}</p>}
                <p className="text-[11px] text-slate-400 truncate">{m.message}</p>
              </div>
              {!m.read && <div className="w-2 h-2 rounded-full bg-[#FCD34D] mt-2 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Congregaciones resumen ───────────────────────────────────────────────────

function CongResumen({ congs, loading, onNavigate }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-slate-400"><IcoChurch /></span>
          <h3 className="font-semibold text-slate-900 text-[14px]">Sedes</h3>
        </div>
        <button onClick={() => onNavigate("/dashboard/congregaciones")}
          className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors">
          Gestionar <IcoArrow />
        </button>
      </div>

      {loading ? (
        <div className="p-4 flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex justify-between animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : congs.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">Sin sedes registradas</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {congs.map(c => {
            const pct = congs.length ? (c.total_miembros / Math.max(...congs.map(x => x.total_miembros), 1)) * 100 : 0;
            return (
              <div key={c.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-900 truncate">{c.ciudad}</span>
                  <span className="text-[11px] text-slate-500 shrink-0 ml-2 flex items-center gap-1">
                    <IcoUsers /> {c.total_miembros}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-950 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { icon: "ti-calendar-plus", label: "Nuevo evento",      color: "#FCD34D", path: "/dashboard/eventos"        },
  { icon: "ti-message-plus",  label: "Ver mensajes",      color: "#60a5fa", path: "/dashboard/mensajes"       },
  { icon: "ti-building-plus", label: "Nueva sede",        color: "#34d399", path: "/dashboard/congregaciones" },
  { icon: "ti-layout-grid",   label: "Editar landing",    color: "#a78bfa", path: "/dashboard/landing"        },
  { icon: "ti-user-plus",     label: "Nuevo usuario",     color: "#f472b6", path: "/dashboard/usuarios"       },
];

// ─── Página principal ─────────────────────────────────────────────────────────

export default function InicioPage() {
  const { user } = useAuth();

  const [kpis,     setKpis]     = useState({ eventos:0, mensajes:0, sinLeer:0, miembros:0, sedes:0 });
  const [eventos,  setEventos]  = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [congs,    setCongs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [hora,     setHora]     = useState(new Date());

  // Actualiza el reloj cada minuto
  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Saludo según hora
  const greeting = useMemo(() => {
    const h = hora.getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, [hora]);

  const today = useMemo(() => hora.toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }), [hora]);

  // Fetch de todos los datos necesarios
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const now   = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
        const nextM = new Date(now.getFullYear(), now.getMonth()+1, 1);
        const next  = `${nextM.getFullYear()}-${String(nextM.getMonth()+1).padStart(2,"0")}`;

        const [evRes, msgRes, congRes] = await Promise.all([
          fetch(`/api/events?month=${month}`),
          fetch("/api/contact?limit=5",       { headers: authHeaders() }),
          fetch("/api/congregaciones"),
        ]);

        const [evJson, msgJson, congJson] = await Promise.all([
          evRes.json(), msgRes.json(), congRes.json(),
        ]);

        // Eventos del mes actual
        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
        const proximos = (evJson.data ?? [])
          .filter(e => e.date >= todayStr)
          .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
          .slice(0, 5);

        const totalEventos = (evJson.data ?? []).length;
        const msgs         = msgJson.data ?? [];
        const sinLeer      = msgs.filter(m => !m.read).length;
        const congsData    = congJson.data ?? [];
        const totalMiembs  = congsData.reduce((s,c) => s + (c.total_miembros ?? 0), 0);

        setEventos(proximos);
        setMensajes(msgs.slice(0, 5));
        setCongs(congsData);
        setKpis({
          eventos:  totalEventos,
          mensajes: msgJson.total ?? msgs.length,
          sinLeer,
          miembros: totalMiembs,
          sedes:    congsData.length,
        });
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // Navegación simple: actualiza la URL y deja que el router lo maneje
  const navigate = (path) => { window.location.href = path; };

  return (
    <div className="p-4 sm:p-6">

      {/* Bienvenida */}
      <div className="bg-slate-950 rounded-2xl px-6 py-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[#FCD34D] text-[11px] font-semibold uppercase tracking-widest mb-1">{today}</p>
          <h1 className="text-white text-xl font-semibold tracking-tight">
            {greeting}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Bienvenido al panel de administración de Bethel</p>
        </div>
        <button onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors cursor-pointer shrink-0">
          <IcoRefresh /> Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Eventos este mes" value={kpis.eventos}
          sub={`${eventos.length} próximos`}
          accent="#FCD34D" icon={IcoCalendar}
          loading={loading} linkTo="/dashboard/eventos" onNavigate={navigate}
        />
        <KpiCard
          label="Mensajes" value={kpis.mensajes}
          sub={kpis.sinLeer > 0 ? `${kpis.sinLeer} sin leer` : "Todos leídos"}
          accent="#60a5fa" icon={IcoMail}
          loading={loading} linkTo="/dashboard/mensajes" onNavigate={navigate}
        />
        <KpiCard
          label="Miembros" value={kpis.miembros}
          sub={`En ${kpis.sedes} sede${kpis.sedes !== 1 ? "s" : ""}`}
          accent="#34d399" icon={IcoUsers}
          loading={loading} linkTo="/dashboard/congregaciones" onNavigate={navigate}
        />
        <KpiCard
          label="Sedes activas" value={kpis.sedes}
          sub="Congregaciones Bethel"
          accent="#a78bfa" icon={IcoChurch}
          loading={loading} linkTo="/dashboard/congregaciones" onNavigate={navigate}
        />
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Accesos rápidos</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map(({ icon, label, color, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className="flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
              <i className={`ti ${icon} text-[16px]`} style={{ color }} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: eventos + mensajes + sedes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Próximos eventos — ocupa 2 columnas en lg */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <UpcomingEvents events={eventos} loading={loading} onNavigate={navigate} />

          {/* Mensajes en mobile aparece aquí; en desktop en la columna derecha */}
          <div className="lg:hidden">
            <RecentMessages messages={mensajes} loading={loading} onNavigate={navigate} />
          </div>
        </div>

        {/* Columna derecha en desktop */}
        <div className="flex flex-col gap-5">
          <div className="hidden lg:block">
            <RecentMessages messages={mensajes} loading={loading} onNavigate={navigate} />
          </div>
          <CongResumen congs={congs} loading={loading} onNavigate={navigate} />
        </div>
      </div>
    </div>
  );
}