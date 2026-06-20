/**
 * POST /api/auth/logout
 * Header: Authorization: Bearer <token>
 */

import { extractToken, json, err, CORS } from "../../_auth.js";

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== "POST") {
    return err("Método no permitido", 405);
  }

  const token = extractToken(request);
  if (!token) return json({ ok: true }); // ya no hay sesión, no es error

  await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();

  return json({ ok: true, message: "Sesión cerrada" });
}