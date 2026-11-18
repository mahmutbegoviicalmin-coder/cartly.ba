import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getWebhook, registerWebhook, SKYTEC_BASE, SkytecError } from "@/lib/skytec";

export const dynamic = "force-dynamic";

/** GET → current Skytec webhook config (+ whether env is ready). */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const env = {
    apiKey: Boolean(process.env.SKYTEC_API_KEY),
    webhookSecret: Boolean(process.env.SKYTEC_WEBHOOK_SECRET),
    cronSecret: Boolean(process.env.CRON_SECRET),
    server: SKYTEC_BASE.includes("/test/") ? "test" : "prod",
  };
  if (!env.apiKey) return NextResponse.json({ env, webhook: null });
  try {
    const w = await getWebhook();
    return NextResponse.json({ env, webhook: { callbackUrl: w.callbackUrl, authType: w.authType } });
  } catch (e) {
    if (e instanceof SkytecError && e.status === 404) return NextResponse.json({ env, webhook: null });
    return NextResponse.json({ env, webhook: null, error: e instanceof Error ? e.message : "Greška" });
  }
}

/** POST → register https://<this host>/api/skytec/webhook with Skytec (they send a test call). */
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const secret = process.env.SKYTEC_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "SKYTEC_WEBHOOK_SECRET nije postavljen." }, { status: 400 });

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  if (!host || host.startsWith("localhost") || host.startsWith("127.")) {
    return NextResponse.json({ error: "Webhook se registruje sa produkcijske adrese (cartly.ba), ne s localhosta." }, { status: 400 });
  }
  const callbackUrl = `https://${host}/api/skytec/webhook`;
  try {
    const r = await registerWebhook(callbackUrl, secret);
    return NextResponse.json({ ok: true, callbackUrl, message: r.message });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Greška" }, { status: 502 });
  }
}
