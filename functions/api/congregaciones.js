/**
 *
 * GET    /api/congregaciones              → lista congregaciones
 * GET    /api/congregaciones?id=N         → una congregación + miembros
 * POST   /api/congregaciones              → crear  (auth)
 * PUT    /api/congregaciones?id=N         → editar (auth)
 * DELETE /api/congregaciones?id=N         → borrado lógico (auth)
 *
 * GET    /api/congregaciones?miembros=1&cong_id=N  → miembros de una cong
 * POST   /api/congregaciones?miembros=1            → crear miembro (auth)
 * PUT    /api/congregaciones?miembros=1&id=N       → editar miembro (auth)
 * DELETE /api/congregaciones?miembros=1&id=N       → borrar miembro (auth)
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

function normCong(r) {
  return {
    id: r.id, ciudad: r.ciudad, pastores: r.pastores,
    direccion: r.direccion, telefono: r.telefono,
    horarios: r.horarios, imagen: r.imagen || "",
    activa: r.activa === 1,
    total_miembros: r.total_miembros ?? 0,
    created_at: r.created_at, updated_at: r.updated_at,
  };
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
  };
}

// ─── Congregaciones ───────────────────────────────────────────────────────────

async function getCongs(db, url) {
  const id = url.searchParams.get("id");

  if (id) {
    const cong = await db.prepare("SELECT * FROM congregaciones WHERE id=? AND activa=1").bind(id).first();
    if (!cong) return errRes("Congregación no encontrada", 404);
    const { results: miembros } = await db.prepare(
      "SELECT * FROM miembros WHERE congregacion_id=? AND activo=1 ORDER BY apellido_paterno, nombre"
    ).bind(id).all();
    return jsonRes({ ok: true, data: { ...normCong(cong), miembros: miembros.map(normMiembro) } });
  }

  const { results } = await db.prepare(
    `SELECT c.*,
       (SELECT COUNT(*) FROM miembros m WHERE m.congregacion_id=c.id AND m.activo=1) AS total_miembros
     FROM congregaciones c WHERE c.activa=1 ORDER BY c.ciudad ASC`
  ).all();
  return jsonRes({ ok: true, data: results.map(normCong) });
}

async function createCong(db, req) {
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const { ciudad, pastores="", direccion="", telefono="", horarios="", imagen="" } = b;
  if (!ciudad?.trim()) return errRes("El campo ciudad es obligatorio");
  const r = await db.prepare(
    "INSERT INTO congregaciones (ciudad,pastores,direccion,telefono,horarios,imagen) VALUES (?,?,?,?,?,?)"
  ).bind(ciudad.trim(), pastores, direccion, telefono, horarios, imagen).run();
  const created = await db.prepare("SELECT * FROM congregaciones WHERE id=?").bind(r.meta.last_row_id).first();
  return jsonRes({ ok: true, data: normCong(created) }, 201);
}

async function updateCong(db, req, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const allowed = ["ciudad","pastores","direccion","telefono","horarios","imagen","activa"];
  const fields = [], values = [];
  for (const [k, v] of Object.entries(b)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k}=?`);
    values.push(k === "activa" ? (v ? 1 : 0) : v);
  }
  if (!fields.length) return errRes("Sin campos válidos");
  fields.push("updated_at=datetime('now')");
  values.push(id);
  await db.prepare(`UPDATE congregaciones SET ${fields.join(",")} WHERE id=?`).bind(...values).run();
  const updated = await db.prepare("SELECT * FROM congregaciones WHERE id=?").bind(id).first();
  return jsonRes({ ok: true, data: normCong(updated) });
}

async function deleteCong(db, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  await db.prepare("UPDATE congregaciones SET activa=0, updated_at=datetime('now') WHERE id=?").bind(id).run();
  return jsonRes({ ok: true });
}

// ─── Miembros ─────────────────────────────────────────────────────────────────

async function getMiembros(db, url) {
  const congId = url.searchParams.get("cong_id");
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
  const isMiembros = url.searchParams.has("miembros");

  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  try {
    if (isMiembros) {
      switch (request.method) {
        case "GET":    return await getMiembros(db, url);
        case "POST":   await requireAuth(db, request); return await createMiembro(db, request);
        case "PUT":    await requireAuth(db, request); return await updateMiembro(db, request, url);
        case "DELETE": await requireAuth(db, request); return await deleteMiembro(db, url);
        default:       return errRes("Método no permitido", 405);
      }
    } else {
      switch (request.method) {
        case "GET":    return await getCongs(db, url);
        case "POST":   await requireAuth(db, request); return await createCong(db, request);
        case "PUT":    await requireAuth(db, request); return await updateCong(db, request, url);
        case "DELETE": await requireAuth(db, request); return await deleteCong(db, url);
        default:       return errRes("Método no permitido", 405);
      }
    }
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return errRes("Error interno del servidor", 500);
  }
}