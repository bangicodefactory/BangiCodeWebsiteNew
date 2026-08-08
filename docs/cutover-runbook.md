# Hosting decision, DNS cutover plan & rollback runbook

**Decision date:** 2026-05-24  
**BAN-166** · Updated 2026-05-24 (hosting revised from Vercel to shared hosting)

---

## 1. Hosting decision

**Chosen host: Shared hosting (cPanel/Node.js)**

The site runs as a **Node.js server** (`next start` after `next build`). It requires a host that supports Node.js process management — not static-file-only hosting.

### Minimum host requirements

| Requirement                              | Notes                                       |
| ---------------------------------------- | ------------------------------------------- |
| Node.js 20+                              | App Router RSC + Server Actions             |
| Persistent process (PM2 / systemd)       | `next start` must stay running              |
| Reverse proxy (Apache mod_proxy / Nginx) | Forward port 3000 → 80/443                  |
| TLS cert                                 | Let's Encrypt via Certbot or cPanel AutoSSL |
| 512 MB RAM minimum                       | Next.js runtime + Node.js modules           |
| SSH access                               | For deployment + process restart            |

### Environment variables to set on the server

Create `/var/www/bangicode/.env.production` (or set via cPanel → Environment Variables):

| Variable                     | Value                                       |
| ---------------------------- | ------------------------------------------- |
| `SITE_URL`                   | `https://bangicode.ma`                      |
| `NEXT_PUBLIC_GA_ID`          | `G-XXXXXXXXXX` (from GA4 property)          |
| `NEXT_PUBLIC_WA_NUMBER`      | `212664571370`                              |
| `NEXT_PUBLIC_CAL_EVENT_SLUG` | `bangicode/30min-discovery`                 |
| `RESEND_API_KEY`             | (set when email delivery is wired, BAN-146) |
| `NODE_ENV`                   | `production`                                |

### Build + start commands

```bash
# On the server, from the next-app/ directory:
npm ci --omit=dev
npm run build
pm2 start npm --name bangicode-next -- start
pm2 save
pm2 startup  # requires sudo — on managed cPanel use "Startup Scripts" or @reboot cron as fallback
```

### Apache vhost (reverse proxy example)

```apacheconf
<VirtualHost *:80>
  ServerName bangicode.ma
  ServerAlias www.bangicode.ma
  Redirect permanent / https://bangicode.ma/
</VirtualHost>

<VirtualHost *:443>
  ServerName bangicode.ma
  SSLEngine on
  SSLCertificateFile    /etc/letsencrypt/live/bangicode.ma/fullchain.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/bangicode.ma/privkey.pem

  # Requires: a2enmod proxy proxy_http (or LoadModule proxy_module / proxy_http_module)
  ProxyPreserveHost On
  ProxyPass        / http://localhost:3000/
  ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

---

## 2. Pre-cutover checklist

Complete **at least 48 hours before** the DNS swap:

- [ ] Node.js 20+ installed on host (`node -v`)
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] `next-app/` deployed to server, dependencies installed, `npm run build` succeeds
- [ ] All env vars set in `.env.production`
- [ ] `pm2 start` running and `curl http://localhost:3000` returns 200
- [ ] Apache/Nginx reverse proxy configured and tested via IP or staging domain
- [ ] TLS cert provisioned for `bangicode.ma` and `www.bangicode.ma`
- [ ] `staging.bangicode.ma` A record → host IP confirmed working
- [ ] Staging smoke test at `staging.bangicode.ma` passes (see §6)
- [ ] TTL on `bangicode.ma` A/AAAA records reduced to **300s** (5 min) — do this 48h before cutover
- [ ] Old CRA app frozen (no deploys during cutover window)
- [ ] Notify team of cutover window

---

## 3. DNS cutover procedure

### Current state (CRA app)

```
bangicode.ma     A      <current-host-IP>
www.bangicode.ma CNAME  bangicode.ma  (or A record)
```

### Target state (shared hosting)

```
bangicode.ma     A      <new-host-IP>
www.bangicode.ma A      <new-host-IP>   ; or CNAME bangicode.ma
```

Get `<new-host-IP>` from the hosting control panel.

### Step-by-step

1. **T-48h**: Reduce TTL on `bangicode.ma` A record to 300s at DNS registrar
2. **T-0 (cutover window — off-peak, e.g. 02:00 UTC Sunday)**:
   a. In DNS registrar panel, update `bangicode.ma` A record to the new host IP
   b. Update `www.bangicode.ma` A record (or CNAME) to point to new host
   c. Wait ~5 min (TTL)
   d. Verify: `dig bangicode.ma A +short` returns the new host IP
   e. Verify: `curl -I https://bangicode.ma` returns `HTTP/2 200`
   f. Run smoke test checklist (§6)
3. **T+30min**: Confirm HTTPS works and no mixed-content warnings
4. **T+24h**: Restore TTL to 3600s once confident cutover is stable

---

## 4. Rollback runbook

If the new site breaks post-cutover and the decision is to revert within the 30-day window:

### Immediate rollback (< 5 min)

1. In DNS registrar, revert `bangicode.ma` A record to the old host IP (keep a note of this before cutover)
2. Wait one TTL cycle (300s if TTL was left reduced, otherwise up to 3600s)
3. Verify: `curl -I https://bangicode.ma` returns the old CRA app
4. Post in team chat: "Rollback to CRA initiated at HH:MM UTC"

### Rollback conditions

Roll back immediately if **any** of the following:

- Homepage returns non-200 in more than 1 locale
- Contact form returns 5xx
- Cal.com booking widget fails to load
- Lighthouse performance score < 80 on mobile (30-min grace period after cutover)

### CRA app preservation

The old CRA app (`bangicode-website/`) must remain **deployable for 30 days post-launch**:

- Do not shut down the old hosting until T+30 days
- Keep the old host's A record noted below:

```
# OLD HOST RECORD — fill in before cutover
OLD_A_RECORD=<fill-before-cutover>
OLD_CNAME=<fill-before-cutover>
```

---

## 5. 301 redirects

The old site uses a single-page CRA app with anchor (`#`) navigation. Bookmarks and external links may use hash URLs. Since hash fragments are client-side only, server-side 301s cannot catch them. The strategy is two-pronged:

### Server-side redirects (in `next.config.ts`)

These catch any path-based URLs that may have been shared:

| From          | To  | Status |
| ------------- | --- | ------ |
| `/index.html` | `/` | 301    |

### Client-side hash redirect (homepage)

A `LegacyHashRedirect` component on the homepage detects legacy `#section` anchors and pushes to the correct new route. Implemented in `next-app/src/components/LegacyHashRedirect.tsx`.

| Old hash      | New route   |
| ------------- | ----------- |
| `/#about`     | `/about`    |
| `/#services`  | `/services` |
| `/#work`      | `/work`     |
| `/#process`   | `/process`  |
| `/#contact`   | `/contact`  |
| `/#portfolio` | `/work`     |

Any hash not in the map: no redirect (stays on homepage).

---

## 6. Smoke test checklist (post-cutover)

Run these within 30 minutes of DNS swap:

**Every locale (en / fr / ar):**

- [ ] `https://bangicode.ma/en` — homepage loads, all sections visible
- [ ] `https://bangicode.ma/fr` — homepage loads in French
- [ ] `https://bangicode.ma/ar` — homepage loads RTL in Arabic
- [ ] `/en/services` — all 4 service cards
- [ ] `/en/services/software` — service detail page
- [ ] `/en/work` — 12 project cards
- [ ] `/en/work/rentcar` — case study detail
- [ ] `/en/about` — founder section visible
- [ ] `/en/process` — 4 steps visible
- [ ] `/en/contact` — form renders, submits successfully (use test email)
- [ ] `/en/book` — Cal.com inline embed loads
- [ ] `/en/careers` — empty state renders
- [ ] `/en/legal/privacy` — MDX content renders

**Functional:**

- [ ] Cookie banner appears on first visit → accepting enables GA4 network requests
- [ ] WhatsApp button visible and links to correct number
- [ ] Locale switcher EN→FR→AR works
- [ ] `bangicode.ma` (no path) → redirects to `/en`
- [ ] `www.bangicode.ma` → redirects to `bangicode.ma`
- [ ] TLS cert valid (green padlock, no mixed content)
- [ ] `curl -I https://bangicode.ma/index.html` → 301 to `/`
- [ ] Legacy hash: `bangicode.ma/#services` → client redirects to `/en/services`

**Performance (30 min post-cutover):**

- [ ] Lighthouse mobile score ≥ 80 on `bangicode.ma/en`
- [ ] No console errors on homepage
- [ ] `pm2 list` on server shows `bangicode-next` as **online**

---

## 7. Contacts & escalation

| Role                   | Name         | Contact               |
| ---------------------- | ------------ | --------------------- |
| DNS registrar access   | Ahmed CHIOUA | ahmedchioua@gmail.com |
| Server / hosting admin | Ahmed CHIOUA | ahmedchioua@gmail.com |
| Old host admin         | Ahmed CHIOUA | —                     |
