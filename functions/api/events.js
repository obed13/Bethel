/**
 * Cloudflare Pages Function — /api/events
 *
 * GET  /api/events              → todos los eventos activos
 * GET  /api/events?date=YYYY-MM-DD          → eventos de un día
 * GET  /api/events?category=culto           → eventos por categoría
 * GET  /api/events?date=...&category=...    → combinado
 * GET  /api/events?month=YYYY-MM            → eventos de un mes completo
 *
 * POST   /api/events            → crear evento  (body JSON)
 * PUT    /api/events?id=N       → actualizar evento
 * DELETE /api/events?id=N       → borrado lógico (active = 0)
 */

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

function err(msg, status = 400) {
  return json({ ok: false, error: msg }, status);
}

// ─── GET ─────────────────────────────────────────────────────────────────────

async function handleGET({ db, url }) {
  const date     = url.searchParams.get("date");      // YYYY-MM-DD
  const category = url.searchParams.get("category");
  const month    = url.searchParams.get("month");     // YYYY-MM
  const id       = url.searchParams.get("id");

  // Un solo evento por id
  if (id) {
    const row = await db
      .prepare("SELECT * FROM events WHERE id = ? AND active = 1")
      .bind(id)
      .first();
    if (!row) return err("Evento no encontrado", 404);
    return json({ ok: true, data: normalize(row) });
  }

  // Construir query dinámica
  const conditions = ["active = 1"];
  const bindings   = [];

  if (date)     { conditions.push("date = ?");          bindings.push(date);         }
  if (month)    { conditions.push("date LIKE ?");        bindings.push(`${month}-%`); }
  if (category) { conditions.push("category = ?");       bindings.push(category);     }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
  const sql   = `SELECT * FROM events ${where} ORDER BY date ASC, time ASC`;

  const { results } = await db.prepare(sql).bind(...bindings).all();
  return json({ ok: true, data: results.map(normalize) });
}

// ─── POST ────────────────────────────────────────────────────────────────────

async function handlePOST({ db, req }) {
  let body;
  try { body = await req.json(); } catch { return err("JSON inválido"); }

  const { title, date, time, location, category, description = "", featured = false } = body;

  if (!title || !date || !time || !location || !category)
    return err("Faltan campos obligatorios: title, date, time, location, category");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return err("El campo date debe tener el formato YYYY-MM-DD");

  const result = await db
    .prepare(`
      INSERT INTO events (title, date, time, location, category, description, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(title, date, time, location, category, description, featured ? 1 : 0)
    .run();

  const created = await db
    .prepare("SELECT * FROM events WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();

  return json({ ok: true, data: normalize(created) }, 201);
}

// ─── PUT ─────────────────────────────────────────────────────────────────────

async function handlePUT({ db, req, url }) {
  const id = url.searchParams.get("id");
  if (!id) return err("Falta el parámetro id");

  let body;
  try { body = await req.json(); } catch { return err("JSON inválido"); }

  const allowed = ["title", "date", "time", "location", "category", "description", "featured", "active"];
  const fields  = [];
  const values  = [];

  for (const [k, v] of Object.entries(body)) {
    if (!allowed.includes(k)) continue;
    fields.push(`${k} = ?`);
    values.push(k === "featured" || k === "active" ? (v ? 1 : 0) : v);
  }

  if (!fields.length) return err("No hay campos válidos para actualizar");

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await db
    .prepare(`UPDATE events SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  const updated = await db
    .prepare("SELECT * FROM events WHERE id = ?")
    .bind(id)
    .first();

  if (!updated) return err("Evento no encontrado", 404);
  return json({ ok: true, data: normalize(updated) });
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

async function handleDELETE({ db, url }) {
  const id = url.searchParams.get("id");
  if (!id) return err("Falta el parámetro id");

  // Borrado lógico: active = 0
  await db
    .prepare("UPDATE events SET active = 0, updated_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run();

  return json({ ok: true, message: `Evento ${id} eliminado.` });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convierte el row de SQLite al formato que espera el frontend */
function normalize(row) {
  return {
    id:          row.id,
    title:       row.title,
    date:        row.date,
    time:        row.time,
    location:    row.location,
    category:    row.category,
    desc:        row.description,   // alias para compatibilidad con CalendarioMSBN.jsx
    featured:    row.featured === 1,
    created_at:  row.created_at,
    updated_at:  row.updated_at,
  };
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function onRequest(context) {
  const { request, env } = context;
  const db  = env.DB;
  const req = request;
  const url = new URL(req.url);

  // Preflight CORS
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  try {
    switch (req.method) {
      case "GET":    return await handleGET({ db, url });
      case "POST":   return await handlePOST({ db, req });
      case "PUT":    return await handlePUT({ db, req, url });
      case "DELETE": return await handleDELETE({ db, url });
      default:       return err("Método no permitido", 405);
    }
  } catch (e) {
    console.error(e);
    return err("Error interno del servidor", 500);
  }
}