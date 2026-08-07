# Cutover — replacing the live CRA site with the Next.js app

Takes the new site from "builds locally" to "serving bangicode.ma", on Namecheap
shared hosting, with a rollback at every stage.

Read [DEPLOYMENT.md](DEPLOYMENT.md) first — it covers the cPanel app, env vars
and the GitHub Actions pipeline. This document is only about the switch.

---

## What is actually changing

The live site (`bangicode-website/`) is a **single-page CRA app**. It has no
router: every "page" is an anchor on one document.

| Old URL                   | Reaches the server as | Notes                                      |
| ------------------------- | --------------------- | ------------------------------------------ |
| `bangicode.ma/`           | `/`                   | The only server-visible URL                |
| `bangicode.ma/#services`  | `/`                   | **Fragments are never sent to the server** |
| `bangicode.ma/#portfolio` | `/`                   | Same                                       |
| `bangicode.ma/#process`   | `/`                   | Same                                       |
| `bangicode.ma/#contact`   | `/`                   | Same                                       |

**Consequence: there are no server-side redirects to write.** One URL moves, and
the new app's middleware already sends `/` → `/en`. The old anchors are handled
in the browser by `LegacyHashRedirect`, which maps `#services` → `/services`,
`#work` and `#portfolio` → `/portfolio`, `#process` → `/process`, `#contact` →
`/contact`, `#about` → `/about` after the page loads.

So the SEO exposure is one URL, and it keeps working. Inbound links to anchors
keep working. This is about as low-risk as a cutover gets.

What changes technically is bigger: static files served by LiteSpeed become a
**Node process managed by Passenger**.

---

## Phase 1 — Back up what is live ✅ DONE 2026-08-06

`public_html-backup-2026-08-06.tar.gz` — 15 MB, 39 files, gzip integrity
verified. It exists in **two** places:

- on the server at `/home/bangspbp/public_html-backup-2026-08-06.tar.gz`
- locally at `~/Desktop/bangicode-cutover-backup/`

Both copies were verified to contain `public_html/index.html`, `public_html/.htaccess`
and `public_html/static/`. A backup that only exists on the machine you are about
to change is not a backup, which is why there are two.

To repeat it later:

```bash
ssh -p 21098 bangspbp@premium173.web-hosting.com   "cd ~ && tar -czf public_html-backup-\$(date +%F).tar.gz public_html"
scp -P 21098 bangspbp@premium173.web-hosting.com:~/public_html-backup-*.tar.gz .
```

Also take a cPanel **full backup** (cPanel → _Backup_ → _Download a Full Account
Backup_) if you have the disk quota. It captures email and databases too.

---

## Phase 2 — Prove it works on a staging subdomain

Do **not** deploy straight over the live site. Stand it up beside it first.

### 2.1 Create the subdomain

cPanel → **Domains** → _Create A New Domain_:

- Domain: `new.bangicode.ma`
- Document root: `staging_html` (uncheck "share document root")

DNS is automatic — the subdomain resolves to the same server.

### 2.2 Wait for SSL

`new.bangicode.ma` must show a valid certificate before you test sign-in.
Without HTTPS the admin session cookie is `Secure` and gets silently dropped —
sign-in looks broken for a reason that has nothing to do with the code.

⚠️ **AutoSSL cannot be run on this account, from the UI or over SSH.** Verified
2026-08-07: both the `autossl` and `market` cPanel features are disabled by the
host, there is no Let's Encrypt plugin, and no ACME client is installed.
`uapi SSL start_autossl_check` answers `You do not have the feature "autossl"`.

Certificates here come from **Namecheap's own PositiveSSL provisioning**, not
cPanel. Every existing domain carries a Sectigo DV certificate valid about a
year, with a start date matching when that domain was created — `garage`
2026-06-17, `test` 2025-11-24, the apex 2025-11-17. They are issued
automatically at creation, not renewed on cPanel's 90-day AutoSSL cycle.

So: wait for it to appear, and if it has not within a day, issue it from the
**Namecheap dashboard** or raise a support ticket. Do not go looking for a
_Run AutoSSL_ button — there isn't one on this plan.

Everything except admin sign-in can be tested over plain HTTP in the meantime.

### 2.3 Create the staging Node app ✅ DONE 2026-08-07

Created over SSH. `new.bangicode.ma` → `~/staging_html`, application root
`~/bangicode-app`, Node **22.23.0**, startup `server.js`, production mode,
currently **stopped** for the first deploy.

The app root is `bangicode-app`, not `bangicode-staging`, on purpose: it matches
the `DEPLOY_PATH` secret, so the same directory can be re-pointed from
`new.bangicode.ma` to the apex at cutover without redeploying a byte.

Two notes for anyone repeating this elsewhere:

- cPanel's `uapi PassengerApps register_application` silently ignores
  `nodejs_version` and registers an app with **no Node interpreter** — the
  record comes back listing only Ruby and Python, and Passenger cannot start
  it. Use CloudLinux's `cloudlinux-selector create --interpreter nodejs`
  instead; it builds the `nodevenv` and writes the Passenger directives.
- Registering at a domain's root rewrites how that domain is served. Never
  point one at `bangicode.ma` while the old site is still live there.

### 2.3b Environment variables for staging

Set these in cPanel → _Setup Node.js App_ → `bangicode` → **Environment
variables**. Everything matches DEPLOYMENT.md §3 except `SITE_URL`:

| Variable               | Staging value                  |
| ---------------------- | ------------------------------ |
| `NODE_ENV`             | `production`                   |
| `SITE_URL`             | **`https://new.bangicode.ma`** |
| `DB_HOST`              | `localhost`                    |
| `DB_PORT`              | `3306`                         |
| `DB_NAME`              | `bangspbp_bangicode`           |
| `DB_USER`              | `bangspbp_bangicode`           |
| `DB_PASSWORD`          | the database password          |
| `ADMIN_SESSION_SECRET` | the generated 48-byte value    |

`NODE_ENV` stays `production` — it is what makes the session cookie `Secure`,
and there is no "staging" mode.

⚠️ **HTTPS must be working before sign-in will.** The cookie is `Secure`, so
over plain HTTP the browser discards it and signing in appears to do nothing —
no error, just a bounce back to the login page. `new.bangicode.ma` served HTTP
immediately but had no certificate; this account has no `autossl` user feature,
so issue it from cPanel → **SSL/TLS Status** → _Run AutoSSL_.

⚠️ **Staging shares the production database.** There is only one. Before
cutover that is useful — content entered on staging is already there when the
apex takes over. After cutover it stops being useful, because staging edits
would change the live site. Create a second database at that point, not now.

⚠️ **Flip the GitHub `SITE_URL` secret too**, not just the cPanel variable. The
standalone build bakes it into every statically-rendered page's canonical, and
the deploy's live check polls it. Set to `https://new.bangicode.ma` on
2026-08-07; **set it back to `https://bangicode.ma` before the real cutover.**

### 2.4 Create the first admin account

Superseded by ADR 0003 — there is no OAuth app any more, for staging or
production. Sign-in is an email and password in the database, and accounts are
created from the command line:

```sh
cd /home/bangspbp/bangicode-app
DB_HOST=localhost DB_NAME=bangspbp_bangicode DB_USER=bangspbp_bangicode \
DB_PASSWORD='…' node scripts/create-admin.mjs
```

This only works **after** the first deploy has put `scripts/` on the server.

Staging and production share one database, so this account is the same account
either side of the cutover. Create it once.

(To skip the CMS on staging entirely, leave `ADMIN_SESSION_SECRET` unset.
`/admin` then denies every request and the login page says what is missing —
it fails closed, and the public site is unaffected.)

### 2.5 Deploy to staging

Use the pipeline rather than a hand-rolled rsync — the point of staging is to
rehearse the real thing, and a manual copy rehearses nothing. `DEPLOY_PATH`
already points at `~/bangicode-app`, and the `SITE_URL` secret is pointed at
`https://new.bangicode.ma`.

Actions → **CI** → _Run workflow_ on `main`, with **`skip_live_check: true`**.

That input exists for exactly this run: the app is deliberately stopped, so the
upload succeeds while nothing is listening, and the live check would fail an
otherwise good deploy.

Then cPanel → _Setup Node.js App_ → **Start** the app, and run 2.4 to create
the admin account.

If it fails, note that the rollback step only fires when the upload itself
succeeded, and there is no previous release to restore on a first deploy — it
will say so rather than pretending.

### 2.6 Test staging properly

Do not skip this. Walk the list:

- [ ] `new.bangicode.ma` loads and is **styled** (unstyled = `public/` or
      `.next/static` missing from the bundle)
- [ ] `/fr` and `/ar` load; Arabic reads right-to-left
- [ ] `/portfolio`, a case study, `/solutions`, `/blog`, `/contact`, `/services`
- [ ] `new.bangicode.ma/#services` lands on the services page
- [ ] `/robots.txt` and `/sitemap.xml` return content
- [ ] the WhatsApp button works
- [ ] on a phone, not just a narrow browser window
- [ ] if CMS configured: sign in, publish a test post, confirm the commit lands
      in GitHub, then delete it

Fix anything here. This is the cheap place to find problems.

---

## Phase 3 — Wire up automated deploys

Only after staging is good.

1. Add the six GitHub secrets from DEPLOYMENT.md, with `DEPLOY_PATH` pointing at
   the **production** app root (`/home/USER/bangicode-app`) and `SITE_URL` at
   `https://bangicode.ma`.
2. Create the production Node.js app in cPanel exactly as in DEPLOYMENT.md —
   application root `bangicode-app`, Application URL `bangicode.ma`.
   **Leave it stopped.**
3. Add the production env vars — same as the staging table in 2.3b, but with
   `SITE_URL=https://bangicode.ma`. Flip the GitHub `SITE_URL` secret back to
   the apex at the same time, or the build will bake staging canonicals into
   the production release.

Nothing is live yet: the production app is stopped and `public_html` still holds
the old site.

---

## Phase 4 — The switch

This is the part that affects visitors. Pick a quiet hour. Budget 20 minutes.

### 4.1 Deploy the current code to production

Push to `main` (or re-run the CI workflow). The deploy job builds, uploads to
`bangicode-app`, and touches `tmp/restart.txt`. It will report the site is not
serving — expected, the app is still stopped.

Alternatively deploy by hand exactly as in 2.5, pointing at `bangicode-app`.

### 4.2 Clear the old site out of the document root

⚠️ **This is the irreversible-feeling step. Do not run it without the Phase 1
backup downloaded.**

cPanel's Node.js app writes a `.htaccess` into `public_html` that hands requests
to Passenger. Leftover static files can still be served in preference to the app
— a stale `public_html/index.html` will shadow the new homepage and you will see
the old site with no obvious reason why.

> **On this account, the `.htaccess` already in `public_html` is NOT one to
> keep.** As of the last check it is an orphaned **Laravel** front controller —
> `RewriteRule ^ index.php [L]` plus a PHP 8.4 handler — and there is no
> `index.php` in the directory. It postdates the CRA build, so something was
> half-configured there and abandoned. `/` still works today only because
> Apache's DirectoryIndex finds `index.html` before the rewrite applies; every
> other path already 404s.
>
> Keeping it would send every route on the new site to a PHP file that does not
> exist. It must be replaced by the Passenger one cPanel generates.

Order matters here — create the app **first** so cPanel writes its directives,
then clean up:

```bash
ssh -p 21098 bangspbp@premium173.web-hosting.com
cd ~/public_html

# 1. Confirm the backup exists and is not empty before deleting anything.
ls -lh ~/public_html-backup-*.tar.gz

# 2. Look at what cPanel wrote when you created the Node app.
cat .htaccess
```

`.htaccess` must contain `PassengerAppRoot` / `PassengerBaseURI`. Two cases:

- **It contains Passenger directives AND the old Laravel block** — cPanel
  appended rather than replaced. Delete the Laravel `<IfModule mod_rewrite.c>`
  section and the `<FilesMatch>` PHP handler, leaving only the Passenger lines.
- **No Passenger directives at all** — the Node app was not registered against
  this document root. Go back to _Setup Node.js App_ and check the Application
  URL is `bangicode.ma`.

Then remove the old site's files, keeping the (now Passenger-only) `.htaccess`:

```bash
find . -mindepth 1 -maxdepth 1 ! -name '.htaccess' -exec rm -rf {} +
ls -la
```

`public_html` should now contain `.htaccess` and nothing else.

### 4.2b Clear the stale Node app registration

`~/nodevenv/` on this account contains an entry for `public_html/server`, but
no such directory exists — a Node app was registered there once and removed
without cleaning up. Check _Setup Node.js App_ for an application whose root no
longer exists and delete it, so it cannot fight the new one for the same
document root.

### 4.3 Start the app

cPanel → _Setup Node.js App_ → **Start** (or **Restart**) the production app.

### 4.4 Verify immediately

```bash
curl -I https://bangicode.ma/
curl -s https://bangicode.ma/en | head -20
```

Then in a browser, with a hard refresh (`Ctrl+Shift+R` — your browser is
holding the old site in cache):

- [ ] `bangicode.ma` redirects to `/en` and is styled
- [ ] all three locales
- [ ] a case study page
- [ ] `bangicode.ma/#contact` reaches the contact page
- [ ] `/admin/login` loads and sign-in works
- [ ] `/robots.txt` shows the generated version, with the `Sitemap:` line

---

## Canonical host

`bangicode.ma` (apex) is canonical, and `SITE_URL` must name it — in the cPanel
environment AND in the GitHub secret, which the build bakes into every
statically-rendered page.

The `www` → apex 301 is handled **in the app** (`next.config.ts`,
`canonicalHostRedirects`), derived from `SITE_URL`, path-preserving, and verified
by test. Do **not** also add a redirect in cPanel → _Domains_ → _Redirects_: that
writes to the same `.htaccess` the Node app manages, and the two overwrite each
other.

The old site sent `og:url = https://www.bangicode.ma`, so this is a small
canonical change. Both hosts are on the certificate, so nothing breaks during
the switch.

---

## Phase 5 — After the switch

- **Google Search Console**: submit `https://bangicode.ma/sitemap.xml`. The site
  is now trilingual with hreflang; the sitemap declares all three.
- **Watch for 404s** for a week. The old site had one URL, so there should be
  none, but check Search Console → _Pages_.
- **Keep the backup** for at least a month.
- Only once you are confident: retire `bangicode-website/` from the repo
  (CLAUDE.md currently forbids deleting it — update that line when you do).
- Delete the staging subdomain and its Node app, or keep it as a preview
  environment. If you keep it, leave `noindex` on: cPanel → _Domains_ →
  `new.bangicode.ma` and add a `robots.txt` that disallows everything, so
  staging never competes with production in search.

---

## Rollback

If something is wrong and you cannot fix it in a few minutes, go back. There is
no prize for debugging in production.

```bash
# 1. Stop the Node app: cPanel → Setup Node.js App → Stop

# 2. Restore the old site
ssh -p 21098 USER@SERVER
cd ~
cp public_html/.htaccess /tmp/passenger-htaccess.bak   # keep it for round two
tar -xzf public_html-backup-YYYY-MM-DD.tar.gz
```

`.htaccess` from the backup replaces the Passenger one, so LiteSpeed serves the
static CRA build again. Hard-refresh and confirm.

Nothing about a rollback loses CMS content — it lives in the GitHub repository,
not on the server.

---

## Things that commonly go wrong here

| Symptom                            | Cause                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| Old site still showing             | Browser cache (hard refresh), or `public_html` still has `index.html`                              |
| Site loads but completely unstyled | `public/` or `.next/static` not copied into the standalone directory                               |
| 503 from Passenger                 | App failed to boot — read the log in _Setup Node.js App_. Usually a missing env var or Node < 20.9 |
| Redirect loop                      | `SITE_URL` disagrees with the real host — e.g. set to apex while the site serves `www`             |
| Sign-in does nothing               | No HTTPS on that hostname, so the `Secure` cookie is dropped                                       |
| `www` does not redirect to apex    | `SITE_URL` was not set, or was set to the `www` host — the redirect is derived from it             |
