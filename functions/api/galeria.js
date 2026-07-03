/**
 *
 * ── Álbumes ───────────────────────────────────────────────────────────────────
 * GET    /api/galeria                    → lista álbumes con total de fotos
 * GET    /api/galeria?id=N               → álbum + sus fotos
 * POST   /api/galeria                    → crear álbum           (auth)
 * PUT    /api/galeria?id=N               → editar álbum          (auth)
 * DELETE /api/galeria?id=N               → borrar álbum y fotos  (auth)
 *
 * ── Fotos ─────────────────────────────────────────────────────────────────────
 * GET    /api/galeria?fotos=1&album_id=N → fotos de un álbum (público)
 * POST   /api/galeria?fotos=1            → añadir foto(s)        (auth)
 * PUT    /api/galeria?fotos=1&id=N       → editar título/desc    (auth)
 * DELETE /api/galeria?fotos=1&id=N       → borrar foto           (auth)
 * PUT    /api/galeria?orden=1            → reordenar fotos       (auth) body: [{id,orden}]
 *
 * Nota: La subida del archivo a R2 la hace /api/upload (ya existente).
 *       Esta API solo registra la URL resultante en D1.
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

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normAlbum(r) {
  return {
    id: r.id, titulo: r.titulo, descripcion: r.descripcion,
    portada_url: r.portada_url || "",
    total_fotos: r.total_fotos ?? 0,
    activo: r.activo === 1,
    created_at: r.created_at, updated_at: r.updated_at,
  };
}

function normFoto(r) {
  return {
    id: r.id, album_id: r.album_id,
    url: r.url, key: r.key || "",
    titulo: r.titulo || "", descripcion: r.descripcion || "",
    orden: r.orden, activo: r.activo === 1,
    created_at: r.created_at,
  };
}

// ─── Álbumes ──────────────────────────────────────────────────────────────────

async function getAlbumes(db, url) {
  const id = url.searchParams.get("id");

  if (id) {
    const album = await db.prepare("SELECT * FROM galeria_albumes WHERE id=? AND activo=1").bind(id).first();
    if (!album) return errRes("Álbum no encontrado", 404);
    const { results: fotos } = await db.prepare(
      "SELECT * FROM galeria_fotos WHERE album_id=? AND activo=1 ORDER BY orden ASC, id ASC"
    ).bind(id).all();
    return jsonRes({ ok: true, data: { ...normAlbum(album), fotos: fotos.map(normFoto) } });
  }

  const { results } = await db.prepare(`
    SELECT a.*,
      (SELECT COUNT(*) FROM galeria_fotos f WHERE f.album_id=a.id AND f.activo=1) AS total_fotos,
      (SELECT f2.url FROM galeria_fotos f2 WHERE f2.album_id=a.id AND f2.activo=1 ORDER BY f2.orden ASC, f2.id ASC LIMIT 1) AS primera_foto
    FROM galeria_albumes a
    WHERE a.activo=1
    ORDER BY a.created_at DESC
  `).all();

  return jsonRes({
    ok: true,
    data: results.map(r => ({
      ...normAlbum(r),
      portada_url: r.portada_url || r.primera_foto || "",
    })),
  });
}

async function createAlbum(db, req) {
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const { titulo, descripcion = "", portada_url = "" } = b;
  if (!titulo?.trim()) return errRes("El título es obligatorio");
  const r = await db.prepare(
    "INSERT INTO galeria_albumes (titulo, descripcion, portada_url) VALUES (?,?,?)"
  ).bind(titulo.trim(), descripcion, portada_url).run();
  const created = await db.prepare("SELECT * FROM galeria_albumes WHERE id=?").bind(r.meta.last_row_id).first();
  return jsonRes({ ok: true, data: normAlbum(created) }, 201);
}

async function updateAlbum(db, req, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const allowed = ["titulo","descripcion","portada_url","activo"];
  const fields = [], values = [];
  for (const [k, v] of Object.entries(b)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k}=?`);
    values.push(k === "activo" ? (v ? 1 : 0) : v);
  }
  if (!fields.length) return errRes("Sin campos válidos");
  fields.push("updated_at=datetime('now')");
  values.push(id);
  await db.prepare(`UPDATE galeria_albumes SET ${fields.join(",")} WHERE id=?`).bind(...values).run();
  const updated = await db.prepare("SELECT * FROM galeria_albumes WHERE id=?").bind(id).first();
  return jsonRes({ ok: true, data: normAlbum(updated) });
}

async function deleteAlbum(db, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  // Borrado lógico (mantiene las fotos en R2 para no perderlas)
  await db.prepare("UPDATE galeria_albumes SET activo=0, updated_at=datetime('now') WHERE id=?").bind(id).run();
  return jsonRes({ ok: true });
}

// ─── Fotos ────────────────────────────────────────────────────────────────────

async function getFotos(db, url) {
  const albumId = url.searchParams.get("album_id");
  if (!albumId) return errRes("Falta album_id");
  const { results } = await db.prepare(
    "SELECT * FROM galeria_fotos WHERE album_id=? AND activo=1 ORDER BY orden ASC, id ASC"
  ).bind(albumId).all();
  return jsonRes({ ok: true, data: results.map(normFoto), total: results.length });
}

async function createFotos(db, req) {
  // Acepta un array de fotos para subida múltiple: [{ url, key, titulo, descripcion, album_id }]
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const items = Array.isArray(b) ? b : [b];
  if (!items.length) return errRes("No hay fotos para agregar");

  const created = [];
  for (const item of items) {
    const { album_id, url, key = "", titulo = "", descripcion = "", orden = 0 } = item;
    if (!album_id) { return errRes("Falta album_id"); }
    if (!url)      { return errRes("Falta url");      }
    const r = await db.prepare(
      "INSERT INTO galeria_fotos (album_id, url, key, titulo, descripcion, orden) VALUES (?,?,?,?,?,?)"
    ).bind(album_id, url, key, titulo, descripcion, orden).run();
    const foto = await db.prepare("SELECT * FROM galeria_fotos WHERE id=?").bind(r.meta.last_row_id).first();
    created.push(normFoto(foto));
  }

  return jsonRes({ ok: true, data: created }, 201);
}

async function updateFoto(db, req, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  const allowed = ["titulo","descripcion","orden","activo"];
  const fields = [], values = [];
  for (const [k, v] of Object.entries(b)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k}=?`);
    values.push(k === "activo" ? (v ? 1 : 0) : v);
  }
  if (!fields.length) return errRes("Sin campos válidos");
  values.push(id);
  await db.prepare(`UPDATE galeria_fotos SET ${fields.join(",")} WHERE id=?`).bind(...values).run();
  const updated = await db.prepare("SELECT * FROM galeria_fotos WHERE id=?").bind(id).first();
  return jsonRes({ ok: true, data: normFoto(updated) });
}

async function deleteFoto(db, url) {
  const id = url.searchParams.get("id");
  if (!id) return errRes("Falta id");
  await db.prepare("UPDATE galeria_fotos SET activo=0 WHERE id=?").bind(id).run();
  return jsonRes({ ok: true });
}

async function reorderFotos(db, req) {
  let b; try { b = await req.json(); } catch { return errRes("JSON inválido"); }
  if (!Array.isArray(b)) return errRes("Se esperaba un array [{id, orden}]");
  for (const { id, orden } of b) {
    await db.prepare("UPDATE galeria_fotos SET orden=? WHERE id=?").bind(orden, id).run();
  }
  return jsonRes({ ok: true });
}

// ─── Router ───────────────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  const db  = env.DB;
  const url = new URL(request.url);
  const isFotos  = url.searchParams.has("fotos");
  const isOrden  = url.searchParams.has("orden");

  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  try {
    if (isOrden) {
      await requireAuth(db, request);
      return await reorderFotos(db, request);
    }

    if (isFotos) {
      switch (request.method) {
        case "GET":    return await getFotos(db, url);
        case "POST":   await requireAuth(db, request); return await createFotos(db, request);
        case "PUT":    await requireAuth(db, request); return await updateFoto(db, request, url);
        case "DELETE": await requireAuth(db, request); return await deleteFoto(db, url);
        default:       return errRes("Método no permitido", 405);
      }
    }

    switch (request.method) {
      case "GET":    return await getAlbumes(db, url);
      case "POST":   await requireAuth(db, request); return await createAlbum(db, request);
      case "PUT":    await requireAuth(db, request); return await updateAlbum(db, request, url);
      case "DELETE": await requireAuth(db, request); return await deleteAlbum(db, url);
      default:       return errRes("Método no permitido", 405);
    }
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return errRes("Error interno del servidor", 500);
  }
}