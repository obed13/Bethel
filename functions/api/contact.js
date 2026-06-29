/**
 *
 * POST /api/contact  → público, guarda el mensaje en D1 (sin auth)
 * GET  /api/contact  → protegido, lista mensajes para el dashboard
 * PUT  /api/contact?id=N  → protegido, marca mensaje como leído
 * DELETE /api/contact?id=N → protegido, elimina mensaje
 */

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
function errRes(msg, status = 400) {
  return jsonRes({ ok: false, error: msg }, status);
}

// ─── Auth inline ──────────────────────────────────────────────────────────────

function getToken(request) {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = request.headers.get("Cookie");
  if (cookie) { const m = cookie.match(/session_token=([^;]+)/); if (m) return m[1]; }
  return null;
}

async function requireAuth(db, request) {
  const token = getToken(request);
  if (!token) throw errRes("No autorizado", 401);
  const row = await db.prepare(`
    SELECT u.id, s.expires_at FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND u.active = 1
  `).bind(token).first();
  if (!row) throw errRes("No autorizado", 401);
  if (new Date(row.expires_at) < new Date()) {
    await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    throw errRes("Sesión expirada", 401);
  }
  return row;
}

// ─── Validaciones simples ─────────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handlePOST(db, request) {
  let body;
  try { body = await request.json(); } catch { return errRes("JSON inválido"); }

  const { name, email, subject = "", message } = body;

  // Validaciones
  if (!name?.trim())           return errRes("El nombre es obligatorio");
  if (!email?.trim())          return errRes("El correo es obligatorio");
  if (!isValidEmail(email))    return errRes("El correo no es válido");
  if (!message?.trim())        return errRes("El mensaje es obligatorio");
  if (name.trim().length > 100)    return errRes("El nombre es demasiado largo");
  if (subject.trim().length > 200) return errRes("El asunto es demasiado largo");
  if (message.trim().length > 2000) return errRes("El mensaje no puede superar los 2000 caracteres");

  // Rate limit simple: max 3 mensajes del mismo email en las últimas 24h
  const count = await db
    .prepare(`SELECT COUNT(*) as c FROM messages
              WHERE email = ? AND created_at > datetime('now', '-24 hours')`)
    .bind(email.toLowerCase().trim())
    .first();
  if (count?.c >= 3) return errRes("Has enviado demasiados mensajes. Inténtalo mañana.", 429);

  const result = await db
    .prepare("INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)")
    .bind(name.trim(), email.toLowerCase().trim(), subject.trim(), message.trim())
    .run();

  return jsonRes({ ok: true, id: result.meta.last_row_id }, 201);
}

async function handleGET(db, url) {
  const unreadOnly = url.searchParams.get("unread") === "1";
  const limit      = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const offset     = parseInt(url.searchParams.get("offset") || "0");

  const where = unreadOnly ? "WHERE read = 0" : "";
  const { results } = await db
    .prepare(`SELECT * FROM messages ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(limit, offset)
    .all();

  const total = await db
    .prepare(`SELECT COUNT(*) as c FROM messages ${where}`)
    .first();

  return jsonRes({ ok: true, data: results, total: total?.c ?? 0 });
}

async function handlePUT(db, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta el parámetro id");

  await db
    .prepare("UPDATE messages SET read = 1 WHERE id = ?")
    .bind(id)
    .run();

  return jsonRes({ ok: true, message: `Mensaje ${id} marcado como leído.` });
}

async function handleDELETE(db, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta el parámetro id");

  await db.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
  return jsonRes({ ok: true, message: `Mensaje ${id} eliminado.` });
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  const db  = env.DB;
  const url = new URL(request.url);

  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  try {
    switch (request.method) {
      case "POST":
        // Público — cualquier visitante puede enviar un mensaje
        return await handlePOST(db, request);

      case "GET":
        await requireAuth(db, request);
        return await handleGET(db, url);

      case "PUT":
        await requireAuth(db, request);
        return await handlePUT(db, url);

      case "DELETE":
        await requireAuth(db, request);
        return await handleDELETE(db, url);

      default:
        return errRes("Método no permitido", 405);
    }
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return errRes("Error interno del servidor", 500);
  }
}