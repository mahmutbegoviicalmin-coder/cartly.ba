import type { getSupabaseAdmin } from "@/lib/supabase-server";
import { pollOpenShipments, syncCodDay } from "@/lib/skytec";

type Sb = ReturnType<typeof getSupabaseAdmin>;

/** COD remittances for the last `days` days (Sarajevo calendar days) + status poll of open parcels. */
export async function runSkytecSync(sb: Sb, days: number) {
  const cod = { days: 0, remittances: 0, matched: 0, errors: [] as string[] };
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400_000).toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });
    try {
      const r = await syncCodDay(sb, d);
      cod.days++;
      cod.remittances += r.count;
      cod.matched += r.matched;
    } catch (e) {
      cod.errors.push(`${d}: ${e instanceof Error ? e.message : "greška"}`);
    }
  }
  const status = await pollOpenShipments(sb);
  return { cod, status };
}
