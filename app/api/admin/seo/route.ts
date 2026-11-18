import { createSign } from "crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { SITE_URL } from "@/lib/seo";

/*
 * Google Search Console through a service account (no extra packages).
 *   GET  /api/admin/seo   → sitemap status + top searches from the last 28 days
 *   POST /api/admin/seo   → (re)submit sitemap.xml to Google
 *
 * Needs, in Vercel env:
 *   GSC_CLIENT_EMAIL   service account e-mail (…@….iam.gserviceaccount.com)
 *   GSC_PRIVATE_KEY    its private key (the "-----BEGIN PRIVATE KEY-----" text, \n allowed)
 *   GSC_SITE_URL       property as shown in Search Console, e.g. "sc-domain:cartly.ba"
 * and the service account added as a user of that property in Search Console.
 */

export const dynamic = "force-dynamic";

const SCOPE = "https://www.googleapis.com/auth/webmasters";
const API = "https://www.googleapis.com/webmasters/v3";

function config() {
  const email = process.env.GSC_CLIENT_EMAIL;
  const key = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const site = process.env.GSC_SITE_URL;
  return email && key && site ? { email, key, site } : null;
}

const b64url = (v: string | Buffer) => Buffer.from(v).toString("base64url");

async function accessToken(email: string, key: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({ iss: email, scope: SCOPE, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${head}.${claim}`);
  const jwt = `${head}.${claim}.${b64url(signer.sign(key))}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) throw new Error(json.error_description || json.error || "Google prijava nije uspjela");
  return json.access_token as string;
}

const notConfigured = () =>
  NextResponse.json(
    { configured: false, error: "Search Console nije povezan. Dodajte GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY i GSC_SITE_URL u Vercel." },
    { status: 200 },
  );

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cfg = config();
  if (!cfg) return notConfigured();
  try {
    const token = await accessToken(cfg.email, cfg.key);
    const site = encodeURIComponent(cfg.site);
    const auth = { Authorization: `Bearer ${token}` };
    const end = new Date();
    const start = new Date(end.getTime() - 28 * 86_400_000);
    const day = (d: Date) => d.toISOString().slice(0, 10);

    const [sitemaps, queries, pages] = await Promise.all([
      fetch(`${API}/sites/${site}/sitemaps`, { headers: auth }).then(r => r.json()),
      fetch(`${API}/sites/${site}/searchAnalytics/query`, {
        method: "POST", headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: day(start), endDate: day(end), dimensions: ["query"], rowLimit: 25 }),
      }).then(r => r.json()),
      fetch(`${API}/sites/${site}/searchAnalytics/query`, {
        method: "POST", headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: day(start), endDate: day(end), dimensions: ["page"], rowLimit: 25 }),
      }).then(r => r.json()),
    ]);
    return NextResponse.json({ configured: true, site: cfg.site, sitemaps: sitemaps.sitemap ?? [], queries: queries.rows ?? [], pages: pages.rows ?? [], error: sitemaps.error?.message ?? queries.error?.message });
  } catch (err) {
    return NextResponse.json({ configured: true, error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
}

export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cfg = config();
  if (!cfg) return notConfigured();
  try {
    const token = await accessToken(cfg.email, cfg.key);
    const feed = `${SITE_URL}/sitemap.xml`;
    const res = await fetch(`${API}/sites/${encodeURIComponent(cfg.site)}/sitemaps/${encodeURIComponent(feed)}`, {
      method: "PUT", headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return NextResponse.json({ ok: false, error: json.error?.message || `Google je vratio ${res.status}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sitemap: feed });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
}
