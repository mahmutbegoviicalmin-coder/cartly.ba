import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  WEBHOOK_HEADER, STATE_LABEL, applyState, ensureShipmentFromOrder, isCodShipment, notifyOwner,
  parseSkyDate, stateFromWebhook, type SkyNotification,
} from "@/lib/skytec";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.SKYTEC_WEBHOOK_SECRET;
  const got = req.headers.get(WEBHOOK_HEADER) ?? "";
  if (!secret) return false;
  const a = Buffer.from(got), b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Skytec → us: shipment status notification. Always answer 200 once authenticated. */
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const n = (await req.json().catch(() => null)) as SkyNotification | null;
  if (!n) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const sb = getSupabaseAdmin();
  const state = stateFromWebhook(n.statusCode);
  const ref = n.referenceNumber?.trim() || null;
  const sifra = n.shipmentNumber?.trim() || null;
  const at = parseSkyDate(n.statusDate);

  // Otkupnina (cash on its way to the depot): log it and, once delivered (= picked
  // up by us), mark the parcel's money as picked up. Never apply it to the parcel.
  if (isCodShipment(sifra)) {
    await sb.from("skytec_events").insert({
      callback_uid: n.callbackUID ?? null, source: "webhook", order_number: ref, sky_sifra: sifra,
      status_code: n.statusCode ?? null, state: state ?? null, label: n.statusDescription ?? null,
      note: n.note ?? null, status_at: at, raw: n,
    });
    if (state === "dostavljena" && sifra) {
      const when = at ?? new Date().toISOString();
      await sb.from("skytec_cod_payments").update({ status: 10, datum_dostave: when }).eq("sifra_otkupnine", sifra);
      await sb.from("skytec_shipments")
        .update({ cod_paid_at: when, updated_at: new Date().toISOString() })
        .eq("sky_sifra", sifra.slice(1)).is("cod_paid_at", null);
    }
    return NextResponse.json({ ok: true, cod: true });
  }

  // Unknown code or Skytec's registration test → just keep the raw event.
  if (!state || sifra === "TEST") {
    await sb.from("skytec_events").insert({
      callback_uid: n.callbackUID ?? null, source: "webhook", order_number: ref, sky_sifra: sifra,
      status_code: n.statusCode ?? null, label: n.statusDescription ?? null, note: n.note ?? null,
      status_at: at, raw: n,
    });
    return NextResponse.json({ ok: true });
  }

  const ev = {
    state, at, code: n.statusCode, source: "webhook" as const,
    label: STATE_LABEL[state], note: n.note ?? null,
    callbackUid: n.callbackUID, trackingUrl: n.trackingUrl, raw: n,
  };

  let r = await applyState(sb, { sky_sifra: sifra, order_number: ref }, ev);
  if (r.duplicate) return NextResponse.json({ ok: true, duplicate: true });

  // Parcel sent via the Excel upload: create the row from the order, then apply
  // the state (without the callback UID — the event is already logged).
  if (!r.matched && ref && (await ensureShipmentFromOrder(sb, ref, sifra))) {
    r = await applyState(sb, { sky_sifra: sifra, order_number: ref }, { ...ev, callbackUid: undefined });
  }

  if (r.matched && (state === "odgodjena" || state === "sporna" || state === "vracena")) {
    const { data } = await sb.from("skytec_shipments")
      .select("order_number, ime, telefon, grad, cod_amount")
      .eq("order_number", r.orderNumber ?? ref ?? "").limit(1);
    const s = data?.[0] as { order_number: string; ime: string; telefon: string; grad: string; cod_amount: number } | undefined;
    await notifyOwner(
      `Skytec: ${STATE_LABEL[state].toUpperCase()} — ${s?.ime ?? ref ?? sifra} (${s?.grad ?? ""})`,
      [
        `Status: ${STATE_LABEL[state]}`,
        n.note ? `Razlog: ${n.note}` : "Razlog nije naveden",
        `Narudžba: ${ref ?? "—"} · Pošiljka: ${sifra ?? "—"}`,
        s ? `Kupac: ${s.ime}, ${s.grad}, tel. ${s.telefon}` : "",
        s ? `Otkupnina: ${Number(s.cod_amount).toFixed(2)} KM` : "",
        state === "odgodjena" ? "Nazovi kupca da se dostava ne vrati." : "",
      ].filter(Boolean)
    );
  }

  return NextResponse.json({ ok: true, matched: r.matched });
}
