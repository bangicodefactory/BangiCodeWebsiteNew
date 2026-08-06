# Deploying to Namecheap shared hosting (cPanel + Passenger)

The site is a Next.js 16 server, not static files, so it runs under cPanel's
**Setup Node.js App** (Phusion Passenger). GitHub Actions builds; the server
only runs.

Related: [ADR 0002 — git-backed CMS](adr/0002-git-backed-cms.md).

---

## Check this first — it can be a hard blocker

**Node 20.9 or newer is required.** Next.js 16 will not start on anything older.

✅ **Verified on this account** (`bangspbp` @ `premium173.web-hosting.com`,
2026-08-06): Node **20, 22 and 24** are installed. Pick 22 in the dropdown.

If you ever move hosts, re-check: cPanel → *Setup Node.js App* → **Node.js
version**. If the newest option is 18.x or lower the app cannot run there at
all.

Two other things to confirm while you are in cPanel:

| Thing | Why it matters | Where |
|---|---|---|
| **SSH access** | The deploy uploads over SSH/rsync. Namecheap uses port **21098**, not 22. | ✅ Already enabled and working with the `gha-deploy-dac` key. |
| **AutoSSL / HTTPS** | The admin session cookie is `Secure` in production. Over plain HTTP the browser silently discards it and **sign-in appears to do nothing**. | cPanel → *SSL/TLS Status* |

---

## One-time server setup

### 1. Create the Node.js application

cPanel → **Setup Node.js App** → *Create Application*:

| Field | Value |
|---|---|
| Node.js version | 20.x or newer |
| Application mode | Production |
| Application root | e.g. `bangicode-app` (this is `DEPLOY_PATH`) |
| Application URL | your domain |
| Application startup file | `server.js` |

Leave the app stopped for now — there is nothing in the directory yet.

> Do **not** run *Run NPM Install*. The deploy ships a standalone bundle that
> already contains the exact dependencies Next traced. Installing on top of it
> would be slower and could pull different versions than the build used.

### 2. Set the environment variables

Still in *Setup Node.js App*, add these under **Environment variables**. Setting
them here rather than in a `.env` file keeps secrets out of the deployed tree,
which `rsync --delete` would otherwise overwrite.

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `SITE_URL` | `https://bangicode.ma` — must be the real public origin, no trailing slash |
| `GITHUB_CLIENT_ID` | from the GitHub OAuth app |
| `GITHUB_CLIENT_SECRET` | from the GitHub OAuth app |
| `GITHUB_REPO` | `owner/name` of this repository |
| `ADMIN_SESSION_SECRET` | `openssl rand -base64 48` |
| `GITHUB_ORG` | `bangicodefactory` (optional, this is the default) |
| `GITHUB_BRANCH` | `main` (optional, this is the default) |

`SITE_URL` must match the OAuth app's callback host exactly — see below.

### 3. Create the GitHub OAuth app

`github.com/organizations/bangicodefactory/settings/applications` →
**New OAuth App**. Org-owned, so it survives any one person leaving.

- **Homepage URL:** `https://bangicode.ma`
- **Authorization callback URL:** `https://bangicode.ma/admin/auth/callback`

The callback host must equal `SITE_URL` exactly — `www` vs apex and `http` vs
`https` both count as a mismatch, and GitHub rejects the sign-in with
`redirect_uri_mismatch`.

Local development needs a **separate** OAuth app pointing at
`http://localhost:3000/admin/auth/callback`, because one app allows one host.

### 4. Add the GitHub Actions secrets

Repository → *Settings* → *Secrets and variables* → *Actions*:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | `premium173.web-hosting.com` |
| `DEPLOY_USER` | `bangspbp` |
| `DEPLOY_SSH_PORT` | `21098` |
| `DEPLOY_SSH_KEY` | contents of `~/.ssh/gha-deploy-dac` — already authorised on this account |
| `DEPLOY_PATH` | `/home/bangspbp/bangicode-app` |
| `SITE_URL` | `https://bangicode.ma` |

⚠️ **`DEPLOY_PATH` must be exactly `/home/bangspbp/bangicode-app`.** This one
cPanel account also hosts `garage/` (DirectAutoCare), `classkom.ma`,
`rentcar.bangicode.ma`, `riha.bangicode.ma` and others. The deploy runs
`rsync --delete`, so a wrong path here deletes another live site. The preflight
rejects a relative path but cannot know you typed the wrong absolute one.

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
4. touches `tmp/restart.txt`, which is how Passenger is told to respawn;
5. polls `SITE_URL/en` until it returns 200, and fails the job if it never does.

Roughly 55 MB is uploaded, and rsync only sends what changed.

## How publishing works

The CMS commits content to the repository. That push triggers the same pipeline,
so **published content goes live on the next successful deploy** — a few minutes,
not instantly. The admin says so on every save; do not promise editors otherwise.

A consequence worth knowing: because the deploy is gated on CI, content that
would break the build cannot reach production. The trade is that a red CI run on
unrelated code also blocks content from going live.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Site renders as unstyled HTML | `public/` or `.next/static` missing from the standalone directory — step 2 of the deploy |
| 503 from Passenger | App failed to boot. cPanel → *Setup Node.js App* → open the log. Usually a missing env var or too-old Node. |
| Sign-in bounces back to the login page with no error | No HTTPS, so the `Secure` session cookie is discarded. Check AutoSSL. |
| `redirect_uri_mismatch` from GitHub | `SITE_URL` and the OAuth callback host disagree — check `www` vs apex |
| `/admin` redirects to login with `error=not_configured` | One of the four required env vars is unset. The login page lists which. |
| Publishing succeeds but the site is unchanged | Expected until the deploy finishes. Check the Actions run. |
| "The branch moved while you were editing" | Someone else published between load and save. Reload and reapply. |

## Known constraints of this host

- **Passenger idles the app out.** The first request after a quiet period is
  slow. Sessions are stateless (an encrypted cookie, no server-side store), so a
  respawn does not sign anyone out — that was a deliberate design choice.
- **No on-server builds.** Never run `next build` on the box; memory caps make it
  unreliable and a failed build takes the site down.
- **Outbound HTTPS must be permitted** for the CMS to reach `api.github.com`. If
  the admin lists load but publishing fails with a network error, ask Namecheap
  whether outbound 443 is restricted.
