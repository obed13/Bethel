/**
 * src/layouts/DashboardLayout.jsx
 * Sidebar fija + topbar + área de contenido.
 * Pensado para crecer: cada módulo futuro es solo una ruta nueva.
 */

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NAV = [
  {
    section: "General",
    items: [{ to: "/dashboard", icon: "ti-home", label: "Inicio", end: true }],
  },
  {
    section: "Contenido",
    items: [
      { to: "/dashboard/eventos",         icon: "ti-calendar",         label: "Eventos"        },
      { to: "/dashboard/congregaciones",  icon: "ti-building-church",  label: "Congregaciones" },
      { to: "/dashboard/ministerios",     icon: "ti-users",            label: "Ministerios"    },
    ],
  },
  {
    section: "Sitio web",
    items: [
      { to: "/dashboard/landing",  icon: "ti-layout",  label: "Landing page" },
      { to: "/dashboard/galeria",  icon: "ti-photo",   label: "Galería"      },
      { to: "/dashboard/mensajes", icon: "ti-message", label: "Mensajes"     },
    ],
  },
  {
    section: "Sistema",
    items: [
      { to: "/dashboard/usuarios",      icon: "ti-users-group", label: "Usuarios"       },
      { to: "/dashboard/configuracion", icon: "ti-settings",    label: "Configuración"  },
    ],
  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(true);

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "A";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar ── */}
      <aside
        className={[
          "flex flex-col bg-slate-950 transition-all duration-300 flex-shrink-0",
          sideOpen ? "w-[220px]" : "w-[60px]",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8 min-h-[60px]">
          <span className="text-lg font-semibold text-white tracking-tight whitespace-nowrap">
            {sideOpen ? <>BETHEL<span className="text-[#FCD34D]">.</span></> : <span className="text-[#FCD34D]">B</span>}
          </span>
          {sideOpen && (
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">Panel admin</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map((group) => (
            <div key={group.section}>
              {sideOpen && (
                <p className="text-[10px] text-slate-600 uppercase tracking-widest px-3 py-2 mt-1 font-medium">
                  {group.section}
                </p>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors duration-150",
                      isActive
                        ? "bg-[#FCD34D]/12 text-[#FCD34D]"
                        : "text-slate-400 hover:bg-white/6 hover:text-slate-200",
                    ].join(" ")
                  }
                  title={!sideOpen ? item.label : undefined}
                >
                  <i className={`ti ${item.icon} text-[17px]`} aria-hidden="true" />
                  {sideOpen && item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer usuario */}
        <div className="border-t border-white/8 p-3">
          <div className={`flex items-center gap-2.5 ${sideOpen ? "px-1" : "justify-center"}`}>
            <div className="w-8 h-8 rounded-full bg-[#FCD34D] flex items-center justify-center text-xs font-medium text-slate-900 shrink-0">
              {initials}
            </div>
            {sideOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-slate-200 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSideOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle sidebar"
            >
              <i className="ti ti-menu-2 text-[18px]" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
              <i className="ti ti-bell text-[17px]" aria-hidden="true" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <i className="ti ti-logout text-[15px]" aria-hidden="true" />
              Salir
            </button>
          </div>
        </header>

        {/* Outlet → aquí van los módulos */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}