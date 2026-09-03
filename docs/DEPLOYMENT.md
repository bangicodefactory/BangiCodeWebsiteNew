# Deploying to Namecheap shared hosting (cPanel + Passenger)

The site is a Next.js 16 server, not static files, so it runs under cPanel's
**Setup Node.js App** (Phusion Passenger). GitHub Actions builds; the server
only runs.

Related: [ADR 0003 — MySQL-backed CMS](adr/0003-mysql-backed-cms.md).

---

## Check this first — it can be a hard blocker

**Node 20.9 or newer is required.** Next.js 16 will not start on anything older.

✅ **Verified on this account** (`bangspbp` @ `premium173.web-hosting.com`,
2026-08-06): Node **20, 22 and 24** are installed. Pick 22 in the dropdown.

If you ever move hosts, re-check: cPanel → _Setup Node.js App_ → **Node.js
version**. If the newest option is 18.x or lower the app cannot run there at
all.

Two other things to confirm while you are in cPanel:

| Thing          | Why it matters                                                                                                                                                                                                                                                                                     | Where                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **SSH access** | The deploy uploads over SSH/rsync. Namecheap uses port **21098**, not 22.                                                                                                                                                                                                                          | ✅ Already enabled and working with the `gha-deploy-dac` key.       |
| **HTTPS**      | The admin session cookie is `Secure` in production. Over plain HTTP the browser silently discards it and **sign-in appears to do nothing**. ⚠️ AutoSSL is **disabled on this account** — certs come from Namecheap's PositiveSSL provisioning, issued per domain at creation. See CUTOVER.md §2.2. | cPanel → _SSL/TLS Status_ (view only), then the Namecheap dashboard |

---

## One-time server setup

### 1. Create the Node.js application

cPanel → **Setup Node.js App** → _Create Application_:

| Field                    | Value                                        |
| ------------------------ | -------------------------------------------- |
| Node.js version          | 20.x or newer                                |
| Application mode         | Production                                   |
| Application root         | e.g. `bangicode-app` (this is `DEPLOY_PATH`) |
| Application URL          | your domain                                  |
| Application startup file | `server.js`                                  |

Leave the app stopped for now — there is nothing in the directory yet.

> Do **not** run _Run NPM Install_. The deploy ships a standalone bundle that
> already contains the exact dependencies Next traced. Installing on top of it
> would be slower and could pull different versions than the build used.

### 2. Create the database

✅ **Already done on this account** (2026-08-07). Database and user are both
`bangspbp_bangicode`, with ALL PRIVILEGES granted, the schema applied, and
`001_init.sql` recorded in `schema_migrations`. The password is in the GitHub
Actions secret `DB_PASSWORD` — skip to step 3 and paste the same value into
cPanel.

To do it again elsewhere: cPanel → **MySQL® Databases**. Create a database and a
user, then grant that user **ALL PRIVILEGES** on it. cPanel prefixes both with
the account name, so `bangicode` becomes `bangspbp_bangicode`. This account
already hosts ten other databases, so a name that says which site it belongs to
is worth more than a generic `cms`.

⚠️ **cPanel creates databases as `latin1`.** One third of this site's content is
Arabic. The tables in `001_init.sql` declare `utf8mb4` explicitly so they are
safe either way, but the database default should be fixed too, or the first
migration that forgets an explicit charset will mangle Arabic silently:

```sql
ALTER DATABASE bangspbp_bangicode
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The database holds the blog posts, the portfolio projects and the admin
accounts. It lives outside `DEPLOY_PATH`, which is deliberate: the deploy runs
`rsync --delete` over that directory, so anything stored inside it would be
destroyed on every release. It is also covered by cPanel's own backups, which a
file in the app directory would not be.

**Test a restore before you rely on it.** Version history moved from git to this
database when the CMS did (ADR 0003), and a backup nobody has restored is a
belief, not a safety net.

### 3. Set the environment variables

Still in _Setup Node.js App_, add these under **Environment variables**. Setting
them here rather than in a `.env` file keeps secrets out of the deployed tree,
which `rsync --delete` would otherwise overwrite.

| Variable               | Value                                                                      |
| ---------------------- | -------------------------------------------------------------------------- |
| `NODE_ENV`             | `production`                                                               |
| `SITE_URL`             | `https://bangicode.ma` — must be the real public origin, no trailing slash |
| `DB_HOST`              | `localhost`                                                                |
| `DB_PORT`              | `3306`                                                                     |
| `DB_NAME`              | `bangspbp_bangicode` — the prefixed name from step 2                       |
| `DB_USER`              | `bangspbp_bangicode`                                                       |
| `DB_PASSWORD`          | the password you set in step 2                                             |
| `ADMIN_SESSION_SECRET` | `openssl rand -base64 48`                                                  |

`SITE_URL` **must** be `https://`. The admin session cookie is `Secure`, so over
plain HTTP the browser silently discards it and sign-in appears to do nothing.

Without `ADMIN_SESSION_SECRET` the admin **denies every request** — it fails
closed by design, and `/admin/login` names what is missing rather than crashing.

### 4. Create the first admin account

There is no sign-up form. Over SSH, once the app directory exists:

```sh
cd /home/bangspbp/bangicode-app
DB_HOST=localhost DB_NAME=bangspbp_bangicode DB_USER=bangspbp_bangicode \
DB_PASSWORD='…' node scripts/migrate.mjs      # creates the tables
DB_HOST=localhost DB_NAME=bangspbp_bangicode DB_USER=bangspbp_bangicode \
DB_PASSWORD='…' node scripts/create-admin.mjs # prompts for email and password
```

Use a **generated** password from a password manager. There is no 2FA and no
email-based reset: this password and the lockout after five failed attempts are
the whole of what protects the publish button. `create-admin.mjs --reset` is the
only way to recover a forgotten one, and it needs shell access.

Deploys run `scripts/migrate.mjs` automatically from then on.

### 5. Add the GitHub Actions secrets

Repository → _Settings_ → _Secrets and variables_ → _Actions_:

| Secret                | Value                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| `DEPLOY_HOST`         | `premium173.web-hosting.com`                                             |
| `DEPLOY_USER`         | `bangspbp`                                                               |
| `DEPLOY_SSH_PORT`     | `21098`                                                                  |
| `DEPLOY_SSH_KEY`      | contents of `~/.ssh/gha-deploy-dac` — already authorised on this account |
| `DEPLOY_PATH`         | `/home/bangspbp/bangicode-app`                                           |
| `SITE_URL`            | `https://bangicode.ma`                                                   |
| `DB_HOST`             | `localhost`                                                              |
| `DB_PORT`             | `3306`                                                                   |
| `DB_NAME`             | `bangspbp_bangicode`                                                     |
| `DB_USER`             | `bangspbp_bangicode`                                                     |
| `DB_PASSWORD`         | the database password                                                    |
| `DEPLOY_SSH_HOST_KEY` | optional — `ssh-keyscan -p 21098 HOST`, to pin the server                |

**`ADMIN_SESSION_SECRET` is deliberately NOT in this table.** The deploy never
sends it to the server — the app reads it from the cPanel environment, which is
the only copy that signs cookies. Keeping it here as a GitHub secret would
check that _a_ value exists in a place nothing reads, which is worse than not
checking: it reads like assurance the server is configured when it is not.

⚠️ **`SITE_URL` is used at BUILD time, not just for the live check.** The
standalone build bakes it into the canonical and hreflang tags of every
statically-rendered page. Point it at staging while testing on staging, and
back at the apex before the real cutover, or the staging site will advertise
production as its canonical.

⚠️ **`DEPLOY_PATH` must be exactly `/home/bangspbp/bangicode-app`.** This one
cPanel account also hosts `garage/` (DirectAutoCare), `classkom.ma`,
`riha.bangicode.ma`, `tamago.bangicode.ma`, `art.bangicode.ma` and others. The
deploy runs `rsync --delete`, so a wrong path here deletes another live site.
The preflight rejects a relative path but cannot know you typed the wrong
absolute one.

`rentcar.bangicode.ma` is no longer in that list: its docroot is empty and the
app it once served is now DriveDesk on its own domain. **Removing the subdomain
needs the cPanel web UI** — Namecheap ships only `uapi` on this account, whose
`SubDomain` module exposes `addsubdomain` and `changedocroot` and no delete, and
the vhost definitions under `/var/cpanel/userdata/bangspbp/` are root-owned. So
it cannot be scripted over SSH with the deploy key. cPanel → _Domains_ →
Remove.

`new.bangicode.ma` is likewise spent — the Passenger app is registered to the
apex now, so staging returns 404. See `CUTOVER.md` Phase 5.

The existing `~/.ssh/gha-deploy-dac` key is already authorised on this cPanel
account (verified 2026-08-06), so no new key is needed — paste its contents into
`DEPLOY_SSH_KEY`. Note this puts one private key in two repositories' secrets:
compromise of either exposes deploy access to both, and rotating it breaks both
until re-keyed. Acceptable for two projects under one owner; generate a separate
key if that ever stops being true.

---

## How a deploy works

Push to `main` → CI runs tokens, i18n parity, typecheck, lint, format, build,
Playwright (both suites) and Lighthouse. Only if **all** pass does the deploy job
run. It then:

1. builds with `BUILD_STANDALONE=1`, producing `.next/standalone`;
2. copies `public/` and `.next/static` **into** that directory — Next does not
   do this, and without it the site renders unstyled with every asset 404ing;
3. rsyncs the tree to `DEPLOY_PATH`;
4. runs `scripts/migrate.mjs` against the production database over SSH;
5. touches `tmp/restart.txt`, which is how Passenger is told to respawn;
6. polls `SITE_URL/en` until it serves the new BUILD_ID, and fails the job if it
   never does — a bare 200 would also be returned by the build it replaced.

Roughly 55 MB is uploaded, and rsync only sends what changed.

## How publishing works

The CMS writes to the database and invalidates the affected cache tags, so
**published content is live within seconds** — no deploy, no rebuild. Content
and code are now on completely separate paths: a red CI run no longer blocks
publishing, and publishing no longer costs a deploy.

The trade, and it is a real one: CI no longer stands between a bad write and
production. Under the git-backed design the build validated content before it
shipped. Now the admin's Zod validation is the only gate — which is why the
public loaders skip and log a bad row rather than throwing, and why the CMS
list screens show a row that fails validation instead of hiding it.

Migrations are the exception and DO ride with a deploy: `scripts/migrate.mjs`
runs over SSH after the upload and before the Passenger restart, so a schema
change lands while the old process is still serving and the new code comes up
expecting it.

⚠️ A failed migration triggers the rollback, which restores the previous
**code** — it cannot un-apply DDL, because MySQL commits that implicitly. If a
migration fails halfway, expect to fix the schema by hand.

---

## Troubleshooting

| Symptom                                                          | Cause                                                                                                                         |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Site renders as unstyled HTML                                    | `public/` or `.next/static` missing from the standalone directory — step 2 of the deploy                                      |
| 503 from Passenger                                               | App failed to boot. cPanel → _Setup Node.js App_ → open the log. Usually a missing env var or too-old Node.                   |
| Sign-in bounces back to the login page with no error             | No HTTPS, so the `Secure` session cookie is discarded. Check AutoSSL.                                                         |
| "That email and password do not match" for a known-good password | The account may be locked after five failed attempts. Wait 15 minutes, or reset with `node scripts/create-admin.mjs --reset`. |
| `/admin` redirects to login with `error=not_configured`          | A required env var is unset — most often `ADMIN_SESSION_SECRET`. The login page lists which.                                  |
| Login shows "Could not reach the database"                       | `DB_*` are wrong, or the MySQL user lacks privileges on the database. This is a server problem, not a password problem.       |
| Publishing succeeds but the site is unchanged                    | Cache invalidation did not fire. It should be immediate — check the Passenger log for an error from `revalidateTag`.          |
| "That position is already taken"                                 | Two projects cannot share a `sort_order`; the column is UNIQUE. Reload to see the current order.                              |

## Known constraints of this host

- **Passenger idles the app out.** The first request after a quiet period is
  slow. Sessions are stateless (an encrypted cookie, no server-side store), so a
  respawn does not sign anyone out — that was a deliberate design choice.
- **No on-server builds.** Never run `next build` on the box; memory caps make it
  unreliable and a failed build takes the site down.
- **MySQL connection limits are low**, and Passenger runs several processes that
  each hold their own pool. The pool is capped at 3 connections for that reason.
  If you see "too many connections", raising that cap is the wrong fix.
- **No outbound HTTPS is required any more.** The CMS talks only to the local
  database, so a restrictive egress policy no longer affects publishing.
- **The ISR cache is on disk under `.next/cache`**, and `rsync --delete` clears
  it on every deploy. That is harmless — the first request after a release
  repopulates it — but it does mean the first hit on each content route after a
  deploy is slower than the rest.
