/**
 *
 * POST /api/members  → público, guarda el mensaje en D1 (sin auth)
 * GET  /api/members  → protegido, lista mensajes para el dashboard
 * PUT  /api/members?id=N  → protegido, marca mensaje como leído
 * DELETE /api/members?id=N → protegido, elimina mensaje
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

function normMiembro(r) {
  return {
    id: r.id, congregacion_id: r.congregacion_id,
    nombre: r.nombre, apellido_paterno: r.apellido_paterno,
    apellido_materno: r.apellido_materno,
    fecha_cumpleanos: r.fecha_cumpleanos || "",
    fecha_bautizo_es: r.fecha_bautizo_es || "",
    viene_otra_iglesia: r.viene_otra_iglesia === 1,
    iglesia_anterior: r.iglesia_anterior || "",
    direccion: r.direccion || "", telefono: r.telefono || "",
    activo: r.activo === 1,
    created_at: r.created_at, updated_at: r.updated_at,
    notes: r.notes || "",
    full_name: `${r.nombre} ${r.apellido_paterno} ${r.apellido_materno}`.trim()
  };
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

// ─── Miembros ─────────────────────────────────────────────────────────────────

async function getMiembros(db, url) {
  const congId = url.searchParams.get("congregacion_id");
  const id     = url.searchParams.get("id");
  const search = url.searchParams.get("q");

  if (id) {
    const row = await db.prepare("SELECT * FROM miembros WHERE id=? AND activo=1").bind(id).first();
    if (!row) return errRes("Miembro no encontrado", 404);
    return jsonRes({ ok: true, data: normMiembro(row) });
  }

  if (!congId) return errRes("Falta cong_id");
  let sql = "SELECT * FROM miembros WHERE congregacion_id=? AND activo=1";
  const bind = [congId];
  if (search) {
    sql += " AND (nombre LIKE ? OR apellido_paterno LIKE ? OR apellido_materno LIKE ?)";
    const q = `%${search}%`;
    bind.push(q, q, q);
  }
  sql += " ORDER BY apellido_paterno ASC, nombre ASC";
  const { results } = await db.prepare(sql).bind(...bind).all();

  return jsonRes({ ok: true, data: results.map(normMiembro), total: results.length });
}

async function createMiembro(db, req) {
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const {
    congregacion_id, nombre, apellido_paterno="", apellido_materno="",
    fecha_cumpleanos="", fecha_bautizo_es="",
    viene_otra_iglesia=false, iglesia_anterior="",
    direccion="", telefono=""
  } = b;
  if (!congregacion_id) return errRes("Falta congregacion_id");
  if (!nombre?.trim())  return errRes("El nombre es obligatorio");
  const r = await db.prepare(
    `INSERT INTO miembros
       (congregacion_id,nombre,apellido_paterno,apellido_materno,
        fecha_cumpleanos,fecha_bautizo_es,viene_otra_iglesia,iglesia_anterior,
        direccion,telefono)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    congregacion_id, nombre.trim(), apellido_paterno, apellido_materno,
    fecha_cumpleanos, fecha_bautizo_es,
    viene_otra_iglesia ? 1 : 0, iglesia_anterior,
    direccion, telefono
  ).run();
  const created = await db.prepare("SELECT * FROM miembros WHERE id=?").bind(r.meta.last_row_id).first();
  return jsonRes({ ok: true, data: normMiembro(created) }, 201);
}

async function updateMiembro(db, req, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const allowed = ["nombre","apellido_paterno","apellido_materno","fecha_cumpleanos",
    "fecha_bautizo_es","viene_otra_iglesia","iglesia_anterior","direccion","telefono","activo"];
  const fields = [], values = [];
  for (const [k, v] of Object.entries(b)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k}=?`);
    values.push(k === "viene_otra_iglesia" || k === "activo" ? (v ? 1 : 0) : v);
  }
  if (!fields.length) return errRes("Sin campos válidos");
  fields.push("updated_at=datetime('now')");
  values.push(id);
  await db.prepare(`UPDATE miembros SET ${fields.join(",")} WHERE id=?`).bind(...values).run();
  const updated = await db.prepare("SELECT * FROM miembros WHERE id=?").bind(id).first();
  return jsonRes({ ok: true, data: normMiembro(updated) });
}

async function deleteMiembro(db, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  await db.prepare("UPDATE miembros SET activo=0, updated_at=datetime('now') WHERE id=?").bind(id).run();
  return jsonRes({ ok: true });
}

// ─── Router ───────────────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  const db  = env.DB;
  const url = new URL(request.url);
  const isMiembros = url.searchParams.has("members");

  console.log("onRequest", isMiembros );

  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  try {
      switch (request.method) {
        case "GET":    return await getMiembros(db, url);
        case "POST":   await requireAuth(db, request); return await createMiembro(db, request);
        case "PUT":    await requireAuth(db, request); return await updateMiembro(db, request, url);
        case "DELETE": await requireAuth(db, request); return await deleteMiembro(db, url);
        default:       return errRes("Método no permitido", 405);
      }
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return errRes("Error interno del servidor", 500);
  }
}