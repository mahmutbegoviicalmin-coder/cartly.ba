// One-off repair (24.11.2026): otkupnina webhooks had overwritten parcel rows
// (sky_sifra = "O…", state = "u_dostavi") and the import then created a
// duplicate "SKY-<parcel>" row. Merge each duplicate back into the order row.
// Run: npx tsx --env-file=.env.local scripts/merge-cod-duplicates.mts [--dry]
import { getSupabaseAdmin } from "../lib/supabase-server";
import { syncOrderStatus, type ShipState } from "../lib/skytec";

const DRY = process.argv.includes("--dry");
// Matched to a different, older order of the same customer: check by hand.
const SKIP = new Set(["DWL-20261119-9875"]);

type Row = {
  id: string; order_number: string; sky_sifra: string | null; state: string; state_label: string | null;
  state_at: string | null; postarina: number | null; cod_presjek_at: string | null;
  cod_paid_at: string | null; cod_paid_amount: number | null;
};
const COLS = "id, order_number, sky_sifra, state, state_label, state_at, postarina, cod_presjek_at, cod_paid_at, cod_paid_amount";

const sb = getSupabaseAdmin();
const { data: bad, error } = await sb.from("skytec_shipments").select(COLS).like("sky_sifra", "O%");
if (error) throw error;

let merged = 0, fixedOnly = 0, skipped = 0;
for (const o of (bad ?? []) as Row[]) {
  if (SKIP.has(o.order_number)) { console.log("SKIP", o.order_number); skipped++; continue; }
  const real = o.sky_sifra!.slice(1);
  const { data: dups } = await sb.from("skytec_shipments").select(COLS).eq("sky_sifra", real);
  const dup = ((dups ?? []) as Row[]).find((d) => d.order_number === `SKY-${real}`);

  const patch = {
    sky_sifra: real,
    state: dup?.state ?? o.state,
    state_label: dup?.state_label ?? o.state_label,
    state_at: dup?.state_at ?? o.state_at,
    postarina: o.postarina ?? dup?.postarina ?? null,
    cod_presjek_at: o.cod_presjek_at ?? dup?.cod_presjek_at ?? null,
    // A pickup marked by hand in admin wins over Skytec's date.
    cod_paid_at: o.cod_paid_at ?? dup?.cod_paid_at ?? null,
    cod_paid_amount: o.cod_paid_amount ?? dup?.cod_paid_amount ?? null,
    updated_at: new Date().toISOString(),
  };
  console.log(`${o.order_number}: ${o.sky_sifra} → ${real}, ${o.state} → ${patch.state}${dup ? `, merge ${dup.order_number}` : ", no duplicate"}`);
  if (DRY) continue;

  if (dup) {
    // Free the parcel number first, then move it onto the order row.
    const { error: delErr } = await sb.from("skytec_shipments").delete().eq("id", dup.id);
    if (delErr) { console.log("  delete failed:", delErr.message); continue; }
    await sb.from("skytec_events").update({ order_number: o.order_number }).eq("order_number", dup.order_number);
  }
  const { error: upErr } = await sb.from("skytec_shipments").update(patch).eq("id", o.id);
  if (upErr) { console.log("  update failed:", upErr.message); continue; }
  await syncOrderStatus(sb, o.order_number, patch.state as ShipState);
  if (dup) merged++; else fixedOnly++;
}
console.log({ merged, fixedOnly, skipped, dry: DRY });
