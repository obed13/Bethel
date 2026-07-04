import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";


import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import EventosPage    from "./pages/dashboard/EventosPage";
import LandingPage  from "./pages/dashboard/LandingPage";
import MensajesPage  from "./pages/dashboard/MensajesPage";
import CongregacionesPage from "./pages/dashboard/CongregacionesPage";
import UsuariosPage  from "./pages/dashboard/UsuariosPage";
import InicioPage    from "./pages/dashboard/InicioPage";
import MinisteriosPage from "./pages/dashboard/MinisteriosPage";
import GaleriaPage from "./pages/dashboard/GaleriaPage";
import ConfiguracionPage from "./pages/dashboard/ConfiguracionPage";

/** Ruta protegida: redirige a /login si no hay sesión */
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Cargando…</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}


export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Dashboard (protegido) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* Ruta index → redirige a eventos por ahora */}
          <Route index element={<InicioPage />} />
 
          {/* Módulo de Eventos ✅ */}
          <Route path="eventos" element={<EventosPage />} />
 
          {/* Módulos futuros — descomenta cuando los construyas: */}
          <Route path="congregaciones" element={<CongregacionesPage />} />
          <Route path="ministerios"    element={<MinisteriosPage />} />
          <Route path="landing"        element={<LandingPage />} />
          <Route path="galeria"        element={<GaleriaPage />} />     
          <Route path="mensajes"       element={<MensajesPage />} />
          <Route path="usuarios"       element={<UsuariosPage />} />
          <Route path="configuracion"  element={<ConfiguracionPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
