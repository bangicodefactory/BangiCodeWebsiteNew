-- 001_init — users, portfolio projects, blog posts, and content revisions.
-- See docs/adr/0003-mysql-backed-cms.md
--
-- Deliberately conservative SQL. Production is cPanel's MariaDB, local dev is
-- MariaDB 10.4, and CI runs a container: no JSON functions, no generated
-- columns, no CHECK constraints, nothing that behaves differently across those
-- three. `tags` is TEXT holding a JSON array, parsed in the application, which
-- is where it is validated by Zod anyway.
--
-- utf8mb4 throughout — the site is trilingual and one third of the content is
-- Arabic. utf8 (3-byte) would silently mangle anything outside the BMP.

CREATE TABLE IF NOT EXISTS users (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email          VARCHAR(255) NOT NULL,
  name           VARCHAR(120) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  -- Lockout state. GitHub used to rate-limit sign-in for us; now we do.
  failed_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  locked_until   DATETIME NULL DEFAULT NULL,
  last_login_at  DATETIME NULL DEFAULT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(80) NOT NULL,
  -- UNIQUE on purpose. src/lib/portfolio.ts throws when two projects share an
  -- order, so a colliding publish used to commit cleanly and then break the
  -- next build. The database makes that impossible rather than hand-checked.
  sort_order    INT UNSIGNED NOT NULL,
  category      VARCHAR(32) NOT NULL,
  date          VARCHAR(32) NOT NULL,
  tags          TEXT NOT NULL,
  hero_placeholder TINYINT(1) NOT NULL DEFAULT 1,
  hero_webp     VARCHAR(255) NOT NULL,
  hero_alt      VARCHAR(255) NOT NULL,
  hero_width    INT UNSIGNED NOT NULL,
  hero_height   INT UNSIGNED NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY projects_slug (slug),
  UNIQUE KEY projects_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_translations (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id INT UNSIGNED NOT NULL,
  locale     VARCHAR(8) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  summary    TEXT NOT NULL,
  outcome    TEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY project_translations_locale (project_id, locale),
  CONSTRAINT project_translations_project
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug       VARCHAR(80) NOT NULL,
  -- A calendar day in Africa/Casablanca, not an instant. Stored as CHAR(10) so
  -- no driver or timezone can shift it — the UTC version of this landed posts
  -- on the previous day for an hour every evening.
  date       CHAR(10) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY posts_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_translations (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id     INT UNSIGNED NOT NULL,
  locale      VARCHAR(8) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  body        LONGTEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY post_translations_locale (post_id, locale),
  CONSTRAINT post_translations_post
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buys back what git was giving away for free: history, and a way to recover
-- from an accidental overwrite. Every write snapshots the WHOLE entity, so a
-- restore needs no replay. Deliberately not foreign-keyed to the entity — a row
-- must survive the delete it is the record of.
CREATE TABLE IF NOT EXISTS content_revisions (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  entity_type VARCHAR(16) NOT NULL,
  entity_slug VARCHAR(80) NOT NULL,
  action      VARCHAR(16) NOT NULL,
  snapshot    LONGTEXT NULL,
  author_id   INT UNSIGNED NULL,
  author_name VARCHAR(120) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY content_revisions_entity (entity_type, entity_slug, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
