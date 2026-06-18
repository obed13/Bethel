import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
          <Route index element={<Navigate to="eventos" replace />} />
 
          {/* Módulo de Eventos ✅ */}
          <Route path="eventos" element={<EventosPage />} />
 
          {/* Módulos futuros — descomenta cuando los construyas: */}
          {/* <Route path="congregaciones" element={<CongregacionesPage />} /> */}
          {/* <Route path="ministerios"    element={<MinisteriosPage />} />    */}
          {/* <Route path="landing"        element={<LandingPage />} />        */}
          {/* <Route path="galeria"        element={<GaleriaPage />} />        */}
          {/* <Route path="mensajes"       element={<MensajesPage />} />       */}
          {/* <Route path="usuarios"       element={<UsuariosPage />} />       */}
          {/* <Route path="configuracion"  element={<ConfiguracionPage />} />  */}
        </Route>
 
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
