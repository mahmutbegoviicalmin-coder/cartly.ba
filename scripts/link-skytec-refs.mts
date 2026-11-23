import { getSupabaseAdmin } from "../lib/supabase-server";
import { ORDER_TABLES, getStatus, syncOrderStatus, type ShipState } from "../lib/skytec";

const sb = getSupabaseAdmin();
const { data: sky } = await sb.from("skytec_shipments").select("order_number, sky_sifra, state").like("order_number", "SKY-%");
for (const s of sky ?? []) {
  const { data: cod } = await sb.from("skytec_cod_payments").select("sifra_ext").eq("sifra_izvorne_posiljke", s.sky_sifra).limit(1);
  let ext = cod?.[0]?.sifra_ext as string | null | undefined;
  if (!ext) { try { ext = (await getStatus(s.sky_sifra)).sifraExt; } catch { /* ignore */ } }
  ext = ext?.trim().toUpperCase();
  if (!ext) { console.log(s.order_number, "→ nema reference, ostaje"); continue; }
  let order: { order_number: string; ime: string | null; telefon: string | null; grad: string | null; created_at: string } | null = null;
  for (const t of ORDER_TABLES) {
    const { data } = await sb.from(t).select("order_number, ime, telefon, grad, created_at").eq("order_number", ext).limit(1);
    if (data?.[0]) { order = data[0]; break; }
  }
  if (!order) { console.log(s.order_number, "ref", ext, "→ narudžba ne postoji, ostaje"); continue; }
  const { data: taken } = await sb.from("skytec_shipments").select("order_number").eq("order_number", order.order_number).limit(1);
  if (taken?.length) { console.log(s.order_number, "→", order.order_number, "već ima pošiljku, preskačem"); continue; }
  const { error } = await sb.from("skytec_shipments").update({
    order_number: order.order_number,
    order_date: order.created_at.slice(0, 10),
    product_prefix: order.order_number.split("-")[0].toUpperCase(),
    ime: order.ime, telefon: order.telefon, grad: order.grad,
    updated_at: new Date().toISOString(),
  }).eq("order_number", s.order_number);
  if (error) { console.log(s.order_number, "GREŠKA", error.message); continue; }
  await sb.from("skytec_events").update({ order_number: order.order_number }).eq("order_number", s.order_number);
  await syncOrderStatus(sb, order.order_number, s.state as ShipState);
  console.log(s.order_number, "→", order.order_number, "povezano");
}
