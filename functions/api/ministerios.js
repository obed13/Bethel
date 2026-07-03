/**
 *
 * GET    /api/ministerios              → lista ministerios activos
 * GET    /api/ministerios?id=N         → ministerio + integrantes
 * POST   /api/ministerios              → crear ministerio (auth)
 * PUT    /api/ministerios?id=N         → editar ministerio (auth)
 * DELETE /api/ministerios?id=N         → borrado lógico (auth)
 *
 * GET    /api/ministerios?integrantes=1&min_id=N  → integrantes del ministerio
 * POST   /api/ministerios?integrantes=1           → agregar integrante (auth)
 * PUT    /api/ministerios?integrantes=1&id=N      → editar integrante (auth)
 * DELETE /api/ministerios?integrantes=1&id=N      → borrar integrante (auth)
 *
 * GET    /api/ministerios?roles=1      → lista de roles disponibles
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

// ─── Normalizers ─────────────────────────────────────────────────────────────

function normMin(r) {
  return {
    id: r.id, nombre: r.nombre, descripcion: r.descripcion,
    icono: r.icono, color: r.color,
    activo: r.activo === 1,
    total_integrantes: r.total_integrantes ?? 0,
    lider: r.lider_nombre ?? null,
    created_at: r.created_at, updated_at: r.updated_at,
  };
}

function normIntegrante(r) {
  return {
    id: r.id, ministerio_id: r.ministerio_id,
    miembro_id: r.miembro_id,
    rol_id: r.rol_id, rol_nombre: r.rol_nombre ?? "",
    nombre: r.nombre, telefono: r.telefono,
    email: r.email, notas: r.notas,
    activo: r.activo === 1,
    created_at: r.created_at, updated_at: r.updated_at,
  };
}

// ─── Ministerios handlers ─────────────────────────────────────────────────────

async function getMinisterios(db, url) {
  const id = url.searchParams.get("id");

  if (id) {
    const min = await db.prepare("SELECT * FROM ministerios WHERE id=? AND activo=1").bind(id).first();
    if (!min) return errRes("Ministerio no encontrado", 404);
    const { results: integrantes } = await db.prepare(`
      SELECT mi.*, mr.nombre as rol_nombre
      FROM ministerio_integrantes mi
      JOIN ministerio_roles mr ON mr.id = mi.rol_id
      WHERE mi.ministerio_id=? AND mi.activo=1
      ORDER BY mr.id ASC, mi.nombre ASC
    `).bind(id).all();
    return jsonRes({ ok: true, data: { ...normMin(min), integrantes: integrantes.map(normIntegrante) } });
  }

  const { results } = await db.prepare(`
    SELECT m.*,
      (SELECT COUNT(*) FROM ministerio_integrantes i WHERE i.ministerio_id=m.id AND i.activo=1) AS total_integrantes,
      (SELECT i2.nombre FROM ministerio_integrantes i2
       JOIN ministerio_roles r2 ON r2.id=i2.rol_id
       WHERE i2.ministerio_id=m.id AND r2.nombre='Líder' AND i2.activo=1 LIMIT 1) AS lider_nombre
    FROM ministerios m
    WHERE m.activo=1
    ORDER BY m.nombre ASC
  `).all();

  return jsonRes({ ok: true, data: results.map(normMin) });
}

async function createMinisterio(db, req) {
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const { nombre, descripcion="", icono="ti-users", color="#FCD34D" } = b;
  if (!nombre?.trim()) return errRes("El nombre es obligatorio");
  const r = await db.prepare(
    "INSERT INTO ministerios (nombre,descripcion,icono,color) VALUES (?,?,?,?)"
  ).bind(nombre.trim(), descripcion, icono, color).run();
  const created = await db.prepare("SELECT * FROM ministerios WHERE id=?").bind(r.meta.last_row_id).first();
  return jsonRes({ ok: true, data: normMin(created) }, 201);
}

async function updateMinisterio(db, req, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const allowed = ["nombre","descripcion","icono","color","activo"];
  const fields = [], values = [];
  for (const [k, v] of Object.entries(b)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k}=?`);
    values.push(k === "activo" ? (v ? 1 : 0) : v);
  }
  if (!fields.length) return errRes("Sin campos válidos");
  fields.push("updated_at=datetime('now')");
  values.push(id);
  await db.prepare(`UPDATE ministerios SET ${fields.join(",")} WHERE id=?`).bind(...values).run();
  const updated = await db.prepare("SELECT * FROM ministerios WHERE id=?").bind(id).first();
  return jsonRes({ ok: true, data: normMin(updated) });
}

async function deleteMinisterio(db, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  await db.prepare("UPDATE ministerios SET activo=0, updated_at=datetime('now') WHERE id=?").bind(id).run();
  return jsonRes({ ok: true });
}

// ─── Integrantes handlers ─────────────────────────────────────────────────────

async function getIntegrantes(db, url) {
  const minId = url.searchParams.get("min_id");
  const id    = url.searchParams.get("id");
  if (id) {
    const row = await db.prepare(`
      SELECT mi.*, mr.nombre as rol_nombre FROM ministerio_integrantes mi
      JOIN ministerio_roles mr ON mr.id=mi.rol_id WHERE mi.id=? AND mi.activo=1
    `).bind(id).first();
    if (!row) return errRes("Integrante no encontrado", 404);
    return jsonRes({ ok: true, data: normIntegrante(row) });
  }
  if (!minId) return errRes("Falta min_id");
  const { results } = await db.prepare(`
    SELECT mi.*, mr.nombre as rol_nombre FROM ministerio_integrantes mi
    JOIN ministerio_roles mr ON mr.id=mi.rol_id
    WHERE mi.ministerio_id=? AND mi.activo=1
    ORDER BY mr.id ASC, mi.nombre ASC
  `).bind(minId).all();
  return jsonRes({ ok: true, data: results.map(normIntegrante), total: results.length });
}

async function createIntegrante(db, req) {
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const { ministerio_id, rol_id, nombre, telefono="", email="", notas="", miembro_id=null } = b;
  if (!ministerio_id) return errRes("Falta ministerio_id");
  if (!rol_id)        return errRes("Falta rol_id");
  if (!nombre?.trim()) return errRes("El nombre es obligatorio");
  const r = await db.prepare(`
    INSERT INTO ministerio_integrantes
      (ministerio_id, miembro_id, rol_id, nombre, telefono, email, notas)
    VALUES (?,?,?,?,?,?,?)
  `).bind(ministerio_id, miembro_id, rol_id, nombre.trim(), telefono, email, notas).run();
  const created = await db.prepare(`
    SELECT mi.*, mr.nombre as rol_nombre FROM ministerio_integrantes mi
    JOIN ministerio_roles mr ON mr.id=mi.rol_id WHERE mi.id=?
  `).bind(r.meta.last_row_id).first();
  return jsonRes({ ok: true, data: normIntegrante(created) }, 201);
}

async function updateIntegrante(db, req, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const allowed = ["rol_id","nombre","telefono","email","notas","activo","miembro_id"];
  const fields = [], values = [];
  for (const [k, v] of Object.entries(b)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k}=?`);
    values.push(k === "activo" ? (v ? 1 : 0) : v);
  }
  if (!fields.length) return errRes("Sin campos válidos");
  fields.push("updated_at=datetime('now')");
  values.push(id);
  await db.prepare(`UPDATE ministerio_integrantes SET ${fields.join(",")} WHERE id=?`).bind(...values).run();
  const updated = await db.prepare(`
    SELECT mi.*, mr.nombre as rol_nombre FROM ministerio_integrantes mi
    JOIN ministerio_roles mr ON mr.id=mi.rol_id WHERE mi.id=?
  `).bind(id).first();
  return jsonRes({ ok: true, data: normIntegrante(updated) });
}

async function deleteIntegrante(db, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  await db.prepare("UPDATE ministerio_integrantes SET activo=0, updated_at=datetime('now') WHERE id=?").bind(id).run();
  return jsonRes({ ok: true });
}

async function getRoles(db) {
  const { results } = await db.prepare("SELECT * FROM ministerio_roles ORDER BY id ASC").all();
  return jsonRes({ ok: true, data: results });
}

// ─── Router ───────────────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  const db  = env.DB;
  const url = new URL(request.url);
  const isIntegrantes = url.searchParams.has("integrantes");
  const isRoles       = url.searchParams.has("roles");

  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  try {
    if (isRoles) return await getRoles(db);

    if (isIntegrantes) {
      switch (request.method) {
        case "GET":    return await getIntegrantes(db, url);
        case "POST":   await requireAuth(db, request); return await createIntegrante(db, request);
        case "PUT":    await requireAuth(db, request); return await updateIntegrante(db, request, url);
        case "DELETE": await requireAuth(db, request); return await deleteIntegrante(db, url);
        default:       return errRes("Método no permitido", 405);
      }
    }

    switch (request.method) {
      case "GET":    return await getMinisterios(db, url);
      case "POST":   await requireAuth(db, request); return await createMinisterio(db, request);
      case "PUT":    await requireAuth(db, request); return await updateMinisterio(db, request, url);
      case "DELETE": await requireAuth(db, request); return await deleteMinisterio(db, url);
      default:       return errRes("Método no permitido", 405);
    }
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return errRes("Error interno del servidor", 500);
  }
}
