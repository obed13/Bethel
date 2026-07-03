/**
 * Helpers de autenticación compartidos por los endpoints de la API.
 * No es una ruta — es un módulo importado por los demás archivos en functions/api/.
 */

// ─── Hash de contraseñas (PBKDF2 vía Web Crypto, disponible en Cloudflare Workers) ──

const PBKDF2_ITERATIONS = 100_000;
const HASH_LENGTH_BITS  = 256;

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function generateSaltHex() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bufToHex(bytes);
}

export async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBuf(saltHex),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    HASH_LENGTH_BITS
  );

  return bufToHex(derived);
}

export async function verifyPassword(password, saltHex, expectedHashHex) {
  const computed = await hashPassword(password, saltHex);
  return timingSafeEqual(computed, expectedHashHex);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── Tokens de sesión ──────────────────────────────────────────────────────────

export function generateToken() {
  return crypto.randomUUID();
}

const SESSION_DURATION_HOURS = 24 * 7; // 7 días

export function sessionExpiry() {
  const d = new Date();
  d.setHours(d.getHours() + SESSION_DURATION_HOURS);
  return d.toISOString();
}

/**
 * Extrae el token "Bearer xxx" del header Authorization,
 * o lo busca como cookie "session" si no viene en el header.
 */
export function extractToken(request) {
  const auth = request.headers.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  const cookie = request.headers.get("Cookie");
  if (cookie) {
    const match = cookie.match(/session=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Verifica el token contra la tabla sessions y devuelve el usuario asociado.
 * Lanza un objeto { status, message } si no es válido — captúralo con try/catch.
 */
export async function requireAuth(request, db) {
  const token = extractToken(request);
  if (!token) throw { status: 401, message: "No autenticado: falta token" };

  const session = await db
    .prepare("SELECT * FROM sessions WHERE token = ?")
    .bind(token)
    .first();

  if (!session) throw { status: 401, message: "Sesión inválida" };

  if (new Date(session.expires_at) < new Date()) {
    await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    throw { status: 401, message: "Sesión expirada" };
  }

  const user = await db
    .prepare("SELECT u.id, u.name, u.email, u.role_id, r.key AS role_name, u.active FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?")
    .bind(session.user_id)
    .first();

  if (!user || user.active !== 1) {
    throw { status: 401, message: "Usuario inactivo o eliminado" };
  }

  return user;
}

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

export function err(message, status = 400) {
  return json({ ok: false, error: message }, status);
}