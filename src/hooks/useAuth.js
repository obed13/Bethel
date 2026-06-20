/**
 * Hook de React para login, logout y sesión activa del dashboard.
 *
 * Uso:
 *   const { user, login, logout, loading, error } = useAuth();
 *
 *   await login(email, password);   // guarda token y user
 *   logout();                        // cierra sesión
 */

import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "bethel_session_token";

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  // ── Verificar sesión activa al cargar ──────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setUser(json.user);
        else         localStorage.removeItem(TOKEN_KEY);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!json.ok) {
        setError(json.error ?? "Error al iniciar sesión");
        return false;
      }

      localStorage.setItem(TOKEN_KEY, json.token);
      setUser(json.user);
      return true;
    } catch (e) {
      setError("Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const token = getToken();
    try {
      await fetch("/api/auth/logout", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return { user, login, logout, loading, error, isAuthenticated: !!user };
}

/** Helper para incluir el token en cualquier fetch protegido (POST/PUT/DELETE) */
export function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}