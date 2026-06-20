/**
 * src/layouts/DashboardLayout.jsx
 * Sidebar fija + topbar + área de contenido.
 * Pensado para crecer: cada módulo futuro es solo una ruta nueva.
 */

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";

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
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar ── */}
      <Sidebar sideOpen={sideOpen} initials={initials} user={user} />
      

      {/* ── Contenido principal ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Topbar */}
        <Header handleLogout={handleLogout} setSideOpen={setSideOpen} />

        {/* Outlet → aquí van los módulos */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}