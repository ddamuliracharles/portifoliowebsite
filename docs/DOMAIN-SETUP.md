# Activate ddamuliracharles.dev on Vercel

The site is live at **https://ddamuliracharles.vercel.app**. The domain is already added on Vercel; you only need **DNS** at your registrar.

**Current status:** Vercel reports nameservers are not set. Global DNS still returns NXDOMAIN until you complete step 2 below.

## 1. Add the domain in Vercel (already done)

1. Open [Vercel Dashboard](https://vercel.com) → project **ddamuliracharles**
2. **Settings** → **Domains**
3. Add `ddamuliracharles.dev` and `www.ddamuliracharles.dev`
4. Copy the DNS records Vercel shows

## 3. Configure DNS at your registrar

**Option A — A record (apex domain)**

| Type | Name | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |

**Option B — CNAME for www**

| Type | Name | Value |
|------|------|--------|
| CNAME | `www` | `cname.vercel-dns.com` |

**Option C — Vercel nameservers (easiest)**

Point the domain to:

- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

## 4. Wait for propagation

DNS can take from a few minutes up to 48 hours. Vercel will show **Valid** when ready.

## 5. First contact form email (FormSubmit)

After the site is live, submit the contact form once. FormSubmit sends a **confirmation email** to `ddamulira44@gmail.com` — click the link to activate delivery. Until then, the form may show **Message was not sent**.
