-- ═════════════════════════════════════════════════════════════════════════════
-- BETHEL / CFCB — Schema para Cloudflare D1 (SQLite)
-- ═════════════════════════════════════════════════════════════════════════════
--
-- ─────────────────────────────────────────────────────────────────────────────
-- CFCBethel — Cloudflare D1 Database Schema
-- Ejecutar con: wrangler d1 execute cfcb-db --file=schema.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Cómo aplicar:
--   wrangler d1 execute cfcb-db --file=schema_cloudflare_d1.sql           ← producción
--   wrangler d1 execute cfcb-db --local --file=schema_cloudflare_d1.sql   ← local
-- ═════════════════════════════════════════════════════════════════════════════
-- Bethel Church / CFCBethel - Cloudflare D1 schema
-- Apply locally:
--   wrangler d1 execute cfcb-db --local --file=schema.sql
-- Apply to production:
--   wrangler d1 execute cfcb-db --file=schema.sql

PRAGMA foreign_keys = ON;

-- Roles used by /api/roles, /api/usuarios and auth helpers.
CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  key         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  label       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  active      INTEGER NOT NULL DEFAULT 1,
  can_manage_events   INTEGER NOT NULL DEFAULT 0,
  can_manage_landing  INTEGER NOT NULL DEFAULT 0,
  can_manage_users    INTEGER NOT NULL DEFAULT 0,
  can_manage_congreg  INTEGER NOT NULL DEFAULT 0,
  can_view_dashboard  INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO roles
  (id, key, name, label, description, can_manage_events, can_manage_landing, can_manage_users, can_manage_congreg, can_view_dashboard)
VALUES
  (1, 'admin',  'admin',  'Admin',  'Acceso total al sistema', 1, 1, 1, 1, 1),
  (2, 'editor', 'editor', 'Editor', 'Puede editar contenido sin gestionar usuarios', 1, 1, 0, 1, 1),
  (3, 'viewer', 'viewer', 'Viewer', 'Solo puede ver el dashboard', 0, 0, 0, 0, 1);

-- Users and sessions.
-- password_salt is required by functions/_auth.js. Keep it populated for users
-- that should authenticate through /api/auth/login.
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL DEFAULT '',
  role_id       INTEGER NOT NULL DEFAULT 3 REFERENCES roles(id),
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email   ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id);
CREATE INDEX IF NOT EXISTS idx_users_active  ON users (active);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- Event categories and calendar events.
CREATE TABLE IF NOT EXISTS categories (
  key   TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

INSERT OR IGNORE INTO categories (key, label) VALUES
  ('culto', 'Cultos'),
  ('jovenes', 'Jovenes'),
  ('damas', 'Damas'),
  ('mujeres', 'Mujeres'),
  ('liderazgo', 'Liderazgo'),
  ('panderistas', 'Panderistas'),
  ('pgm', 'PGM'),
  ('oracion', 'Oracion');

CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  date         TEXT NOT NULL,
  time         TEXT NOT NULL,
  location     TEXT NOT NULL,
  category     TEXT NOT NULL REFERENCES categories(key),
  description  TEXT NOT NULL DEFAULT '',
  featured     INTEGER NOT NULL DEFAULT 0,
  active       INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_date     ON events (date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events (category);
CREATE INDEX IF NOT EXISTS idx_events_active   ON events (active);

-- Landing page content.
CREATE TABLE IF NOT EXISTS landing_content (
  section     TEXT PRIMARY KEY,
  data        TEXT NOT NULL DEFAULT '{}',
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO landing_content (section, data) VALUES
  ('hero', '{}'),
  ('about', '{}'),
  ('services', '{}'),
  ('congreg', '{}'),
  ('contact', '{}'),
  ('footer', '{}'),
  ('social', '{}'),
  ('seo', '{}');

-- Dashboard/site configuration used by /api/configuracion.
CREATE TABLE IF NOT EXISTS configuracion (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  grupo      TEXT NOT NULL,
  clave      TEXT NOT NULL UNIQUE,
  valor      TEXT NOT NULL DEFAULT '',
  tipo       TEXT NOT NULL DEFAULT 'text',
  label      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_configuracion_grupo ON configuracion (grupo);

INSERT OR IGNORE INTO configuracion (grupo, clave, valor, tipo, label) VALUES
  ('iglesia', 'iglesia_nombre', 'CFCBethel', 'text', 'Nombre de la iglesia'),
  ('iglesia', 'iglesia_subtitulo', 'Bienvenidos a Casa', 'text', 'Subtitulo'),
  ('iglesia', 'iglesia_descripcion', '', 'textarea', 'Descripcion'),
  ('iglesia', 'iglesia_anio', '2026', 'text', 'Anio'),
  ('iglesia', 'iglesia_logo', '', 'url', 'Logo'),
  ('contacto', 'contacto_email', '', 'email', 'Email'),
  ('contacto', 'contacto_telefono', '', 'tel', 'Telefono'),
  ('contacto', 'contacto_direccion', '', 'textarea', 'Direccion'),
  ('contacto', 'contacto_whatsapp', '', 'tel', 'WhatsApp'),
  ('social', 'social_instagram', '', 'url', 'Instagram'),
  ('social', 'social_facebook', '', 'url', 'Facebook'),
  ('social', 'social_youtube', '', 'url', 'YouTube'),
  ('apariencia', 'apariencia_color_primario', '#020617', 'color', 'Color primario'),
  ('apariencia', 'apariencia_color_acento', '#FCD34D', 'color', 'Color de acento'),
  ('notificaciones', 'notif_mensajes_email', '', 'email', 'Email de alertas'),
  ('mantenimiento', 'mantenimiento_activo', '0', 'toggle', 'Modo mantenimiento'),
  ('mantenimiento', 'mantenimiento_mensaje', 'Sitio en mantenimiento temporal.', 'textarea', 'Mensaje de mantenimiento');

-- Contact messages used by /api/contact.
CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  read       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_email      ON messages (email);
CREATE INDEX IF NOT EXISTS idx_messages_read       ON messages (read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);

-- Congregations and members.
CREATE TABLE IF NOT EXISTS congregaciones (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ciudad     TEXT NOT NULL,
  pastores   TEXT NOT NULL DEFAULT '',
  direccion  TEXT NOT NULL DEFAULT '',
  telefono   TEXT NOT NULL DEFAULT '',
  horarios   TEXT NOT NULL DEFAULT '',
  imagen     TEXT NOT NULL DEFAULT '',
  activa     INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_congregaciones_activa ON congregaciones (activa);
CREATE INDEX IF NOT EXISTS idx_congregaciones_ciudad ON congregaciones (ciudad);

CREATE TABLE IF NOT EXISTS miembros (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  congregacion_id     INTEGER NOT NULL REFERENCES congregaciones(id) ON DELETE CASCADE,
  nombre              TEXT NOT NULL,
  apellido_paterno    TEXT NOT NULL DEFAULT '',
  apellido_materno    TEXT NOT NULL DEFAULT '',
  fecha_cumpleanos    TEXT NOT NULL DEFAULT '',
  fecha_bautizo_es    TEXT NOT NULL DEFAULT '',
  viene_otra_iglesia  INTEGER NOT NULL DEFAULT 0,
  iglesia_anterior    TEXT NOT NULL DEFAULT '',
  direccion           TEXT NOT NULL DEFAULT '',
  telefono            TEXT NOT NULL DEFAULT '',
  notes               TEXT NOT NULL DEFAULT '',
  activo              INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_miembros_congregacion ON miembros (congregacion_id);
CREATE INDEX IF NOT EXISTS idx_miembros_activo       ON miembros (activo);
CREATE INDEX IF NOT EXISTS idx_miembros_nombre       ON miembros (apellido_paterno, nombre);

-- Ministries.
CREATE TABLE IF NOT EXISTS ministerios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  icono       TEXT NOT NULL DEFAULT 'ti-users',
  color       TEXT NOT NULL DEFAULT '#FCD34D',
  activo      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ministerios_activo ON ministerios (activo);
CREATE INDEX IF NOT EXISTS idx_ministerios_nombre ON ministerios (nombre);

CREATE TABLE IF NOT EXISTS ministerio_roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO ministerio_roles (id, nombre, descripcion) VALUES
  (1, 'Lider', 'Responsable principal del ministerio'),
  (2, 'Coordinador', 'Apoyo de coordinacion'),
  (3, 'Integrante', 'Integrante del ministerio');

CREATE TABLE IF NOT EXISTS ministerio_integrantes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ministerio_id INTEGER NOT NULL REFERENCES ministerios(id) ON DELETE CASCADE,
  miembro_id    INTEGER REFERENCES miembros(id) ON DELETE SET NULL,
  rol_id        INTEGER NOT NULL REFERENCES ministerio_roles(id),
  nombre        TEXT NOT NULL,
  telefono      TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  notas         TEXT NOT NULL DEFAULT '',
  activo        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_min_integrantes_ministerio ON ministerio_integrantes (ministerio_id);
CREATE INDEX IF NOT EXISTS idx_min_integrantes_rol        ON ministerio_integrantes (rol_id);
CREATE INDEX IF NOT EXISTS idx_min_integrantes_activo     ON ministerio_integrantes (activo);

-- Gallery.
CREATE TABLE IF NOT EXISTS galeria_albumes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo      TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  portada_url TEXT NOT NULL DEFAULT '',
  activo      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_galeria_albumes_activo     ON galeria_albumes (activo);
CREATE INDEX IF NOT EXISTS idx_galeria_albumes_created_at ON galeria_albumes (created_at);

CREATE TABLE IF NOT EXISTS galeria_fotos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id    INTEGER NOT NULL REFERENCES galeria_albumes(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  key         TEXT NOT NULL DEFAULT '',
  titulo      TEXT NOT NULL DEFAULT '',
  descripcion TEXT NOT NULL DEFAULT '',
  orden       INTEGER NOT NULL DEFAULT 0,
  activo      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_galeria_fotos_album  ON galeria_fotos (album_id);
CREATE INDEX IF NOT EXISTS idx_galeria_fotos_activo ON galeria_fotos (activo);
CREATE INDEX IF NOT EXISTS idx_galeria_fotos_orden  ON galeria_fotos (album_id, orden, id);
