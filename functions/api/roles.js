const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

async function getSessionUser(db, request) {
  const token = getToken(request);
  if (!token) throw errRes("No autorizado", 401);
  const row = await db.prepare(`
    SELECT u.id, u.role_id, r.key as role_name, s.expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    JOIN roles r ON r.id = u.role_id
    WHERE s.token = ? AND u.active = 1 AND r.active = 1
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
    await getSessionUser(db, request);

    const { results } = await db.prepare(
      "SELECT id, key AS name, label, description, active FROM roles ORDER BY id"
    ).all();

    return jsonRes({ ok: true, data: results });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return errRes("Error interno", 500);
  }
}
