/**
 * Cloudflare Pages Function — /api/categories
 *
 * GET /api/categories → lista todas las categorías
 */

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS });

  const { results } = await env.DB
    .prepare("SELECT * FROM categories ORDER BY key ASC")
    .all();

  return new Response(JSON.stringify({ ok: true, data: results }), {
    status: 200,
    headers: CORS,
  });
}