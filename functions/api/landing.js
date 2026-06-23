/**
 * functions/api/landing.js
 * GET público · PUT requiere sesión
 */

const ALLOWED = ["hero","about","services","congreg","contact","footer","social","seo"];

const CORS = {
  "Access-Control-Allow-Origin":      "*",
  "Access-Control-Allow-Methods":     "GET, PUT, OPTIONS",
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

async function requireAuth(db, request) {
  const token = getToken(request);
  if (!token) throw errRes("No autorizado", 401);
  const row = await db.prepare(`
    SELECT u.id, u.role_id, s.expires_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND u.active = 1
  `).bind(token).first();
  if (!row) throw errRes("No autorizado", 401);
  if (new Date(row.expires_at) < new Date()) {
    await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    throw errRes("Sesión expirada", 401);
  }
  return row;
}

export async function onRequest({ request, env }) {
  const db = env.DB;

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    if (request.method === "GET") {
      const { results } = await db.prepare("SELECT section, data FROM landing_content").all();
      const combined = {};
      for (const row of results) {
        try { combined[row.section] = JSON.parse(row.data); } catch {}
      }
      return jsonRes({ ok: true, data: combined });
    }

    if (request.method === "PUT") {
      await requireAuth(db, request);

      let body;
      try { body = await request.json(); } catch { return errRes("JSON inválido"); }

      const { section, data } = body;
      if (!section || !ALLOWED.includes(section))
        return errRes(`Sección inválida. Valores: ${ALLOWED.join(", ")}`);
      if (!data || typeof data !== "object")
        return errRes("El campo data debe ser un objeto");

      await db
        .prepare("INSERT OR REPLACE INTO landing_content (section, data, updated_at) VALUES (?, ?, datetime('now'))")
        .bind(section, JSON.stringify(data))
        .run();

      return jsonRes({ ok: true, section, data });
    }

    return errRes("Método no permitido", 405);

  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return errRes("Error interno del servidor", 500);
  }
}