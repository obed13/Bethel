/**
 * src/layouts/DashboardLayout.jsx
 * Sidebar fija + topbar + área de contenido.
 * Pensado para crecer: cada módulo futuro es solo una ruta nueva.
 */

import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";

// Detecta si la pantalla es desktop (≥1024px)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();

  const [sideOpen, setSideOpen] = useState(true);

  // Desktop: true = sidebar expandida (220px), false = colapsada (60px solo iconos)
  const [desktopOpen, setDesktopOpen] = useState(true);
  // Mobile: true = drawer visible
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "A";

  // Cierra el drawer móvil cuando cambia la ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
 
  // Cierra drawer móvil si se pasa a desktop
  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);
 
  const handleBurger = useCallback(() => {
    if (isDesktop) setSideOpen((v) => !v);
    else           setMobileOpen((v)  => !v);
  }, [isDesktop]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // En desktop la sidebar siempre está en el flujo del documento.
  // En mobile es un drawer que vuela sobre el contenido.
  const sideExpanded = isDesktop ? sideOpen : true; // drawer siempre expandido

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar desktop (en flujo del documento) ── */}
      {isDesktop && <Sidebar sideOpen={sideOpen} initials={initials} user={user} sideExpanded={sideExpanded} isDesktop={isDesktop} />}
      {/* ── Sidebar ── */}
      {/* ── Drawer móvil (overlay) ── */}
      {!isDesktop && (
        <>
          {/* Overlay oscuro */}
          <div
            className={[
              "fixed inset-0 bg-slate-950/60 z-40 transition-opacity duration-300",
              mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
            ].join(" ")}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div
            className={[
              "fixed inset-y-0 left-0 z-50 transition-transform duration-300",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <Sidebar sideOpen={sideOpen} initials={initials} user={user} sideExpanded={sideExpanded} isDesktop={isDesktop} />
          </div>
        </>
      )}

      {/* ── Contenido principal ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Topbar */}
        <Header handleLogout={handleLogout} setSideOpen={setSideOpen} handleBurger={handleBurger} />

        {/* Outlet → aquí van los módulos */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}