/**
 * Meta Conversions API (CAPI) — server-side event sending
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */
import crypto from "crypto";
import { NextRequest } from "next/server";

// ─── Hashing ─────────────────────────────────────────────────────────────────

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Normalize a Bosnian phone number and hash it.
 * Rules: strip non-digits → prefix 387 → SHA-256
 */
function hashPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let normalized: string;
  if (digits.startsWith("387")) {
    normalized = digits;
  } else if (digits.startsWith("0")) {
    normalized = "387" + digits.slice(1);
  } else {
    normalized = "387" + digits;
  }
  return sha256(normalized);
}

function hashEmail(raw: string): string {
  return sha256(raw.toLowerCase());
}

// ─── Request helpers ──────────────────────────────────────────────────────────

export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    ""
  );
}

export function getClientUA(req: NextRequest): string {
  return req.headers.get("user-agent") ?? "";
}

export function getFbc(req: NextRequest): string {
  return req.cookies.get("_fbc")?.value ?? "";
}

export function getFbp(req: NextRequest): string {
  return req.cookies.get("_fbp")?.value ?? "";
}

// ─── CAPI payload ─────────────────────────────────────────────────────────────

export interface CAPIOptions {
  /** Unique ID — use orderNumber so browser & server events deduplicate */
  eventId:     string;
  eventName:   string;
  value:       number;
  currency:    string;
  contentName: string;
  phone?:      string;
  email?:      string;
  ip?:         string;
  userAgent?:  string;
  fbc?:        string;
  fbp?:        string;
  testCode?:   string; // META_TEST_EVENT_CODE — only for Test Events tool
}

export async function sendCAPIEvent(opts: CAPIOptions): Promise<void> {
  const pixelId     = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn("[CAPI] Missing META_PIXEL_ID or META_ACCESS_TOKEN — skipping.");
    return;
  }

  // Build user_data — only include hashed fields that exist
  const userData: Record<string, string> = {};
  if (opts.phone)     userData.ph                  = hashPhone(opts.phone);
  if (opts.email)     userData.em                  = hashEmail(opts.email);
  if (opts.ip)        userData.client_ip_address   = opts.ip;
  if (opts.userAgent) userData.client_user_agent   = opts.userAgent;
  if (opts.fbc)       userData.fbc                 = opts.fbc;
  if (opts.fbp)       userData.fbp                 = opts.fbp;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name:    opts.eventName,
        event_time:    Math.floor(Date.now() / 1000),
        event_id:      opts.eventId,        // deduplication key
        action_source: "website",
        user_data:     userData,
        custom_data: {
          value:        opts.value,
          currency:     opts.currency,
          content_name: opts.contentName,
          order_id:     opts.eventId,
        },
      },
    ],
  };

  // Only add test_event_code when explicitly set (for Meta Test Events tool)
  if (opts.testCode) {
    payload.test_event_code = opts.testCode;
  }

  const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("[CAPI] Error response:", JSON.stringify(json));
    } else {
      console.log(`[CAPI] ${opts.eventName} sent — event_id: ${opts.eventId} | fbe_count: ${json.events_received}`);
    }
  } catch (err) {
    // Never throw — CAPI failure must not break the order flow
    console.error("[CAPI] Fetch failed:", err);
  }
}
