/**
 * POST /api/auth/login
 * Body: { email, password }
 * Devuelve: { ok: true, token, user } o error 401
 */

import { verifyPassword, generateToken, sessionExpiry, json, err, CORS } from "../../_auth.js";

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== "POST") {
    return err("Método no permitido", 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return err("JSON inválido");
  }

  const { email, password } = body;
  if (!email || !password) {
    return err("Email y contraseña son obligatorios");
  }

  const db = env.DB;

  const user = await db
    .prepare("SELECT * FROM users WHERE email = ? AND active = 1")
    .bind(email.toLowerCase().trim())
    .first();

  // Mensaje genérico a propósito: no revelar si el email existe o no
  if (!user) {
    return err("Credenciales incorrectas", 401);
  }

  const valid = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!valid) {
    return err("Credenciales incorrectas", 401);
  }

  const token  = generateToken();
  const expiry = sessionExpiry();

  await db
    .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(token, user.id, expiry)
    .run();

  return json({
    ok: true,
    token,
    expires_at: expiry,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}