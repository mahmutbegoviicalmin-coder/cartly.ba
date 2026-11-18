import type { getSupabaseAdmin } from "@/lib/supabase-server";
import { pollOpenShipments } from "@/lib/skytec";
import { importHistory } from "@/lib/skytec-import";

type Sb = ReturnType<typeof getSupabaseAdmin>;

/**
 * Daily / manual sync:
 *  1. pull parcels sent via the Skytec web client / Excel in the last `days`
 *     days and match them to orders (also refreshes COD remittances),
 *  2. poll the status of every still-open parcel.
 */
export async function runSkytecSync(sb: Sb, days: number) {
  let imported: Awaited<ReturnType<typeof importHistory>> | null = null;
  let importError: string | null = null;
  try {
    imported = await importHistory(sb, days);
  } catch (e) {
    importError = e instanceof Error ? e.message : "greška";
  }
  const status = await pollOpenShipments(sb);
  return { imported, importError, status };
}
