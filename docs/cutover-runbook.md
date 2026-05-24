# Hosting decision, DNS cutover plan & rollback runbook

**Decision date:** 2026-05-24  
**BAN-166**

---

## 1. Hosting decision

**Chosen host: Vercel**

| Criteria | Vercel | Cloudflare Pages | Hetzner/Scaleway |
|---|---|---|---|
| Next.js SSR/ISR support | Native (same company) | Via adapter, partial | Manual Docker |
| Preview deployments | Automatic per PR | Automatic per PR | Manual |
| Edge CDN (MENA PoP) | Yes (Amsterdam + Frankfurt nearest) | Yes (closer Marseille) | No |
| TLS auto-renew | Yes | Yes | Manual / Caddy |
| `next/image` optimisation | Full | Partial (no formats param) | Manual sharp |
| Zero-config deploy | Yes | Mostly | No |

**Rationale:** Vercel gives the cleanest Next.js 16 integration with no adapter shims. Preview URLs per PR are already in the CI pipeline. Upgrade to Vercel Pro only if traffic requires it; Hobby tier is sufficient for launch.

### Environment variables to set on Vercel

| Variable | Value |
|---|---|
| `SITE_URL` | `https://bangicode.ma` |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` (from GA4 property) |
| `NEXT_PUBLIC_WA_NUMBER` | `212664571370` |
| `NEXT_PUBLIC_CAL_EVENT_SLUG` | `bangicode/30min-discovery` |
| `RESEND_API_KEY` | (set when email delivery is wired, BAN-146) |

Set both **Production** and **Preview** scopes. Preview can use stub values for GA and Resend.

---

## 2. Pre-cutover checklist

Complete **at least 48 hours before** the DNS swap:

- [ ] Vercel project created, repo connected, `next-app/` configured as root directory
- [ ] All env vars set on Vercel (production scope)
- [ ] Custom domain `bangicode.ma` added to Vercel project (Vercel verifies ownership via TXT record — do this early)
- [ ] Staging smoke test at `*.vercel.app` preview URL passes (see §6)
- [ ] `staging.bangicode.ma` CNAME → `cname.vercel-dns.com` configured and verified
- [ ] TTL on `bangicode.ma` A/AAAA records reduced to **300s** (5 min) — do this 48h before cutover
- [ ] Old CRA app (`bangicode-website/`) frozen (no deploys during cutover window)
- [ ] Notify team of cutover window

---

## 3. DNS cutover procedure

### Current state (CRA app)

```
bangicode.ma    A      <current-host-IP>
www.bangicode.ma CNAME  bangicode.ma  (or A record)
```

### Target state (Vercel)

Vercel provides these records — get exact values from **Vercel Dashboard → Project → Domains**:

```
bangicode.ma      A        76.76.21.21       ; Vercel Anycast IP
bangicode.ma      AAAA     2606:4700::6810:…  ; Vercel IPv6 (if available)
www.bangicode.ma  CNAME    cname.vercel-dns.com
```

### Step-by-step

1. **T-48h**: Reduce TTL on `bangicode.ma` A record to 300s at DNS registrar
2. **T-0 (cutover window — off-peak, e.g. 02:00 UTC Sunday)**:
   a. In DNS registrar panel, update `bangicode.ma` A record to Vercel Anycast IP `76.76.21.21`
   b. Update `www.bangicode.ma` CNAME to `cname.vercel-dns.com`
   c. Wait ~5 min (TTL)
   d. Verify: `dig bangicode.ma A +short` returns `76.76.21.21`
   e. Verify: `curl -I https://bangicode.ma` returns `HTTP/2 200`
   f. Run smoke test checklist (§6)
3. **T+30min**: Confirm Vercel Dashboard shows `bangicode.ma` as **Valid Configuration**
4. **T+24h**: Restore TTL to 3600s once confident cutover is stable

---

## 4. Rollback runbook

If the new site breaks post-cutover and the decision is to revert within the 30-day window:

### Immediate rollback (< 5 min)

1. In DNS registrar, revert `bangicode.ma` A record to the old host IP (keep a note of this before cutover)
2. Wait one TTL cycle (300s if TTL was left reduced, otherwise up to 3600s)
3. Verify: `curl -I https://bangicode.ma` returns the old CRA app
4. Post in Slack/#deploy: "Rollback to CRA initiated at HH:MM UTC"

### Rollback conditions

Roll back immediately if **any** of the following:
- Homepage returns non-200 in more than 1 locale
- Contact form returns 5xx
- Cal.com booking widget fails to load
- Lighthouse performance score < 80 on mobile (30-min grace period after cutover)

### CRA app preservation

The old CRA app (`bangicode-website/`) must remain **deployable for 30 days post-launch**:
- Do not delete the Fly.io / old hosting deployment until T+30 days
- Keep the old host's A record noted in `docs/cutover-runbook.md` (fill in below):

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

| From | To | Status |
|---|---|---|
| `/index.html` | `/` | 301 |

### Client-side hash redirect (homepage)

A `LegacyHashRedirect` component on the homepage detects legacy `#section` anchors and pushes to the correct new route. Implemented in `next-app/src/components/LegacyHashRedirect.tsx`.

| Old hash | New route |
|---|---|
| `/#about` | `/about` |
| `/#services` | `/services` |
| `/#work` | `/work` |
| `/#process` | `/process` |
| `/#contact` | `/contact` |
| `/#portfolio` | `/work` |

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

---

## 7. Contacts & escalation

| Role | Name | Contact |
|---|---|---|
| DNS registrar access | Ahmed CHIOUA | ahmedchioua@gmail.com |
| Vercel project owner | Ahmed CHIOUA | ahmedchioua@gmail.com |
| Old host admin | Ahmed CHIOUA | — |
