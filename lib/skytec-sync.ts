import type { getSupabaseAdmin } from "@/lib/supabase-server";
import { pollCodPickups, pollOpenShipments } from "@/lib/skytec";
import { importHistory } from "@/lib/skytec-import";

type Sb = ReturnType<typeof getSupabaseAdmin>;

/**
 * Daily / manual sync:
 *  1. pull parcels sent via the Skytec web client / Excel in the last `days`
 *     days and match them to orders (also refreshes COD remittances),
 *  2. poll the status of every still-open parcel,
 *  3. check each otkupnina waiting at the depot for a pickup (status 10).
 */
export async function runSkytecSync(sb: Sb, days: number) {
  // Vercel stops the function at 60 s; leave room to answer.
  const deadline = Date.now() + 50_000;
  let imported: Awaited<ReturnType<typeof importHistory>> | null = null;
  let importError: string | null = null;
  try {
    imported = await importHistory(sb, days);
  } catch (e) {
    importError = e instanceof Error ? e.message : "greška";
  }
  const [status, cod] = await Promise.all([
    pollOpenShipments(sb, 120, deadline),
    pollCodPickups(sb, 150, deadline).catch(() => null),
  ]);
  return { imported, importError, status, cod };
}
