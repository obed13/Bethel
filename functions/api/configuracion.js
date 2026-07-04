/**
 *
 * GET  /api/configuracion             → todas las claves (auth)
 * GET  /api/configuracion?grupo=X     → claves de un grupo (auth)
 * PUT  /api/configuracion             → guardar múltiples claves (auth)
 *      body: { clave: valor, clave2: valor2, ... }
 */

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

function getToken(req) {
  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const c = req.headers.get("Cookie");
  if (c) { const m = c.match(/session_token=([^;]+)/); if (m) return m[1]; }
  return null;
}

async function requireAuth(db, req) {
  const token = getToken(req);
  if (!token) throw errRes("No autorizado", 401);
  const row = await db.prepare(
    "SELECT u.id, s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND u.active=1"
  ).bind(token).first();
  if (!row) throw errRes("No autorizado", 401);
  if (new Date(row.expires_at) < new Date()) {
    await db.prepare("DELETE FROM sessions WHERE token=?").bind(token).run();
    throw errRes("Sesión expirada", 401);
  }
  return row;
}

export async function onRequest({ request, env }) {
  const db  = env.DB;
  const url = new URL(request.url);

  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  try {
    await requireAuth(db, request);

    if (request.method === "GET") {
      const grupo = url.searchParams.get("grupo");
      const sql   = grupo
        ? "SELECT * FROM configuracion WHERE grupo=? ORDER BY clave ASC"
        : "SELECT * FROM configuracion ORDER BY grupo ASC, clave ASC";
      const { results } = grupo
        ? await db.prepare(sql).bind(grupo).all()
        : await db.prepare(sql).all();

      // Agrupa por grupo para fácil consumo en el frontend
      const grouped = {};
      for (const row of results) {
        if (!grouped[row.grupo]) grouped[row.grupo] = {};
        grouped[row.grupo][row.clave] = {
          valor: row.valor, tipo: row.tipo,
          label: row.label, updated_at: row.updated_at,
        };
      }
      return jsonRes({ ok: true, data: grouped, raw: results });
    }

    if (request.method === "PUT") {
      let body; try { body = await request.json(); } catch { return errRes("JSON inválido"); }

      for (const [clave, valor] of Object.entries(body)) {
        const val = typeof valor === "boolean" ? (valor ? "1" : "0") : String(valor ?? "");
        await db.prepare(
          "UPDATE configuracion SET valor=?, updated_at=datetime('now') WHERE clave=?"
        ).bind(val, clave).run();
      }
      return jsonRes({ ok: true, updated: Object.keys(body).length });
    }

    return errRes("Método no permitido", 405);

  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return errRes("Error interno del servidor", 500);
  }
}