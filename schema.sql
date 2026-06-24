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

-- ─── 1. ROLES ─────────────────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,   -- 'admin' | 'editor' | 'viewer'
  description TEXT    NOT NULL DEFAULT '',
  -- Permisos booleanos por módulo
  can_manage_events   INTEGER NOT NULL DEFAULT 0,
  can_manage_landing  INTEGER NOT NULL DEFAULT 0,
  can_manage_users    INTEGER NOT NULL DEFAULT 0,
  can_manage_congreg  INTEGER NOT NULL DEFAULT 0,
  can_view_dashboard  INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Roles iniciales
INSERT OR IGNORE INTO roles
  (id, name, description, can_manage_events, can_manage_landing, can_manage_users, can_manage_congreg, can_view_dashboard)
VALUES
  (1, 'admin',  'Acceso total al sistema',                          1, 1, 1, 1, 1),
  (2, 'editor', 'Puede editar eventos y landing, sin gestión de usuarios', 1, 1, 0, 1, 1),
  (3, 'viewer', 'Solo puede ver el dashboard, sin editar',          0, 0, 0, 0, 1);

-- ─── 2. CATEGORÍAS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  key   TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

INSERT OR IGNORE INTO categories (key, label) VALUES
  ('culto',     'Cultos'),
  ('jovenes',   'Jóvenes'),
  ('damas',   'Damas'),
  ('liderazgo', 'Liderazgo'),
  ('panderistas', 'Panderistas'),
  ('oracion',   'Oración');

-- ─── 3. EVENTOS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL,
  date         TEXT    NOT NULL,          -- formato ISO: YYYY-MM-DD
  time         TEXT    NOT NULL,          -- formato: HH:MMh
  location     TEXT    NOT NULL,
  category     TEXT    NOT NULL REFERENCES categories(key),
  description  TEXT    NOT NULL DEFAULT '',
  featured     INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true
  active       INTEGER NOT NULL DEFAULT 1, -- 0 = eliminado lógico
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Índices para las consultas más comunes
CREATE INDEX IF NOT EXISTS idx_events_date     ON events (date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events (category);
CREATE INDEX IF NOT EXISTS idx_events_active   ON events (active);

-- ─── Seed: eventos iniciales ──────────────────────────────────────────────────
INSERT OR IGNORE INTO events (id, title, date, time, location, category, description, featured) VALUES
  (1,  'Culto Dominical',         '2026-05-03', '11:30h', 'Todas las congregaciones', 'culto',     'Reunión central de adoración y Palabra para toda la familia.',            1),
  (2,  'Culto Dominical (tarde)', '2026-05-03', '18:00h', 'Getafe, Madrid',           'culto',     'Segunda reunión dominical. Bienvenida especial a nuevos visitantes.',     0),
  (3,  'Escuela de Líderes',      '2026-05-06', '20:00h', 'Getafe, Madrid',           'liderazgo', 'Formación integral para el desarrollo de dones y liderazgo ministerial.', 0),
  (4,  'PGM – Grupos Pequeños',   '2026-05-07', '20:00h', 'Lucero / Barcelona',       'panderistas',       'Grupos en casas para compartir, orar y crecer juntos en hermandad.',     0),
  (5,  'Culto de Oración',        '2026-05-08', '19:00h', 'Lucero, Madrid',           'oracion',   'Tiempo dedicado a la intercesión y la búsqueda de Dios.',               0),
  (6,  'Culto Dominical',         '2026-05-10', '11:30h', 'Todas las congregaciones', 'culto',     'Reunión central de adoración y Palabra.',                                1),
  (7,  'Escuela de Líderes',      '2026-05-13', '20:00h', 'Getafe, Madrid',           'liderazgo', 'Formación integral para el desarrollo de dones y liderazgo ministerial.', 0),
  (8,  'PGM – Grupos Pequeños',   '2026-05-14', '20:00h', 'Valencia / Málaga',        'panderistas',       'Grupos en casas para orar y crecer juntos.',                             0),
  (9,  'Culto de Jóvenes',        '2026-05-16', '18:00h', 'Getafe, Madrid',           'jovenes',   'Un tiempo dinámico de adoración y palabra para la nueva generación.',    0),
  (10, 'Culto Dominical',         '2026-05-17', '11:30h', 'Todas las congregaciones', 'culto',     'Reunión central de adoración y Palabra.',                                1),
  (11, 'Escuela de Líderes',      '2026-05-20', '20:00h', 'Getafe, Madrid',           'liderazgo', 'Formación integral de liderazgo ministerial.',                           0),
  (12, 'PGM – Grupos Pequeños',   '2026-05-21', '20:00h', 'Lepe, Huelva',             'panderistas',       'Grupos en casas para orar y crecer juntos.',                             0),
  (13, 'Culto de Mujeres',        '2026-05-23', '18:00h', 'Getafe, Madrid',           'damas',   'Espacio de comunión y empoderamiento para mujeres de fe.',               0),
  (14, 'Culto Dominical',         '2026-05-24', '11:30h', 'Todas las congregaciones', 'culto',     'Reunión central de adoración y Palabra.',                                1),
  (15, 'Escuela de Líderes',      '2026-05-27', '20:00h', 'Getafe, Madrid',           'liderazgo', 'Formación integral de liderazgo ministerial.',                           0),
  (16, 'PGM – Grupos Pequeños',   '2026-05-28', '20:00h', 'Barcelona / Valencia',     'panderistas',       'Grupos en casas para orar y crecer juntos.',                             0),
  (17, 'Culto Dominical',         '2026-05-31', '11:30h', 'Todas las congregaciones', 'culto',     'Reunión central de adoración y Palabra.',                                1),
  (18, 'Culto de Jóvenes',        '2026-06-06', '18:00h', 'Getafe, Madrid',           'jovenes',   'Adoración y palabra para la nueva generación.',                          0),
  (19, 'Culto Dominical',         '2026-06-07', '11:30h', 'Todas las congregaciones', 'culto',     'Reunión central de adoración.',                                          1);

  -- ─── 4. USUARIOS ─────────────────────────────────────────────────────────────

  CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role_id       INTEGER NOT NULL DEFAULT 3 REFERENCES roles(id),  -- default: viewer
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
 
CREATE INDEX IF NOT EXISTS idx_users_email   ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id);
 
-- ⚠️  Genera el hash antes de insertar:
--   node generate-admin-hash.js TuContraseñaSegura
-- Luego reemplaza __HASH__ por el valor obtenido.

INSERT OR IGNORE INTO users (id, name, email, password_hash, role_id) VALUES
  (1, 'Administrador', 'admin@bethel.church', '_HASH__', 1);

-- ─── 5. SESIONES ─────────────────────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT    PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  expires_at  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
 
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- ─── 6. CONTENIDO LANDING PAGE ───────────────────────────────────────────────
 
CREATE TABLE IF NOT EXISTS landing_content (
  section     TEXT PRIMARY KEY,
  data        TEXT NOT NULL DEFAULT '{}',
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
 
INSERT OR IGNORE INTO landing_content (section, data) VALUES
  ('hero',     '{}'),
  ('about',    '{}'),
  ('services', '{}'),
  ('congreg',  '{}'),
  ('contact',  '{}'),
  ('footer',   '{}'),
  ('social',   '{}'),
  ('seo',      '{}');