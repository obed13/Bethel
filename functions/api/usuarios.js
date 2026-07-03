/**
 *
 * GET    /api/usuarios          → lista usuarios (auth)
 * GET    /api/usuarios?id=N     → un usuario     (auth)
 * POST   /api/usuarios          → crear          (auth admin)
 * PUT    /api/usuarios?id=N     → actualizar     (auth admin)
 * DELETE /api/usuarios?id=N     → desactivar     (auth admin)
 */

const SALT = "CFCBethel-2026";

const CORS = {
  "Access-Control-Allow-Origin":      "*",
  "Access-Control-Allow-Methods":     "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":     "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
};

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}
function errRes(msg, status = 400) { return jsonRes({ ok: false, error: msg }, status); }

function getToken(request) {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = request.headers.get("Cookie");
  if (cookie) { const m = cookie.match(/session_token=([^;]+)/); if (m) return m[1]; }
  return null;
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password + SALT);
  const buf  = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

async function getSessionUser(db, request) {
  const token = getToken(request);
  if (!token) throw errRes("No autorizado", 401);
  const row = await db.prepare(`
    SELECT u.id, u.role_id, r.key as role_name, s.expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    JOIN roles r ON r.id = u.role_id
    WHERE s.token = ? AND u.active = 1
  `).bind(token).first();
  if (!row) throw errRes("No autorizado", 401);
  if (new Date(row.expires_at) < new Date()) {
    await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    throw errRes("Sesión expirada", 401);
  }
  return row;
}

function normUser(r) {
  return {
    id: r.id, name: r.name, email: r.email,
    role_id: r.role_id, role_name: r.role_name,
    active: r.active === 1,
    created_at: r.created_at, updated_at: r.updated_at,
  };
}

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

// ── Handlers ──────────────────────────────────────────────────────────────────

async function getUsuarios(db, url) {
  const id = url.searchParams.get("id");
  if (id) {
    const row = await db.prepare(`
      SELECT u.*, r.key as role_name FROM users u
      JOIN roles r ON r.id = u.role_id WHERE u.id = ?
    `).bind(id).first();
    if (!row) return errRes("Usuario no encontrado", 404);
    return jsonRes({ ok: true, data: normUser(row) });
  }
  const { results } = await db.prepare(`
    SELECT u.*, r.key as role_name FROM users u
    JOIN roles r ON r.id = u.role_id ORDER BY u.created_at DESC
  `).all();
  return jsonRes({ ok: true, data: results.map(normUser) });
}

async function createUsuario(db, req, caller) {
  if (caller.role_name !== "admin") return errRes("Sin permisos para crear usuarios", 403);
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const { name, email, password, role_id = 2 } = b;
  if (!name?.trim())     return errRes("El nombre es obligatorio");
  if (!email?.trim())    return errRes("El correo es obligatorio");
  if (!isValidEmail(email)) return errRes("El correo no es válido");
  if (!password || password.length < 8) return errRes("La contraseña debe tener al menos 8 caracteres");

  const exists = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase().trim()).first();
  if (exists) return errRes("Ya existe un usuario con ese correo");

  const hash = await hashPassword(password);
  const r = await db.prepare(
    "INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)"
  ).bind(name.trim(), email.toLowerCase().trim(), hash, role_id).run();

  const created = await db.prepare(`
    SELECT u.*, r.key as role_name FROM users u
    JOIN roles r ON r.id = u.role_id WHERE u.id = ?
  `).bind(r.meta.last_row_id).first();
  return jsonRes({ ok: true, data: normUser(created) }, 201);
}

async function updateUsuario(db, req, url, caller) {
  if (caller.role_name !== "admin") return errRes("Sin permisos para editar usuarios", 403);
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  // No puede editarse a sí mismo el rol
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }

  const fields = [], values = [];
  if (b.name)    { fields.push("name = ?");     values.push(b.name.trim()); }
  if (b.email) {
    if (!isValidEmail(b.email)) return errRes("El correo no es válido");
    fields.push("email = ?"); values.push(b.email.toLowerCase().trim());
  }
  if (b.role_id) { fields.push("role_id = ?");  values.push(b.role_id); }
  if (typeof b.active !== "undefined") { fields.push("active = ?"); values.push(b.active ? 1 : 0); }
  if (b.password) {
    if (b.password.length < 8) return errRes("La contraseña debe tener al menos 8 caracteres");
    fields.push("password_hash = ?");
    values.push(await hashPassword(b.password));
  }

  if (!fields.length) return errRes("Sin campos válidos");
  fields.push("updated_at = datetime('now')");
  values.push(id);

  await db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  const updated = await db.prepare(`
    SELECT u.*, r.name as role_name FROM users u
    JOIN roles r ON r.id = u.role_id WHERE u.id = ?
  `).bind(id).first();
  return jsonRes({ ok: true, data: normUser(updated) });
}

async function deleteUsuario(db, url, caller) {
  if (caller.role_name !== "admin") return errRes("Sin permisos para eliminar usuarios", 403);
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  if (String(id) === String(caller.id)) return errRes("No puedes desactivar tu propio usuario");
  await db.prepare("UPDATE users SET active = 0, updated_at = datetime('now') WHERE id = ?").bind(id).run();
  return jsonRes({ ok: true });
}

export async function onRequest({ request, env }) {
  const db  = env.DB;
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const caller = await getSessionUser(db, request);
    switch (request.method) {
      case "GET":    return await getUsuarios(db, url);
      case "POST":   return await createUsuario(db, request, caller);
      case "PUT":    return await updateUsuario(db, request, url, caller);
      case "DELETE": return await deleteUsuario(db, url, caller);
      default:       return errRes("Método no permitido", 405);
    }
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return errRes("Error interno", 500);
  }
}