/*
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Devuelve los datos del usuario autenticado, o 401 si la sesión no es válida.
 * Útil para que el frontend verifique la sesión al cargar el dashboard.
 */

import { requireAuth, json, err, CORS } from "../../_auth.js";

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== "GET") {
    return err("Método no permitido", 405);
  }

  try {
    const user = await requireAuth(request, env.DB);
    return json({ ok: true, user });
  } catch (e) {
    console.log('Error: '+e.message);
    return err(e.message ?? "No autenticado", e.status ?? 401);
  }
}