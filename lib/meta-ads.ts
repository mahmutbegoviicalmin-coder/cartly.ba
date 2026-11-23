/**
 * Read-only Meta Marketing API: ad spend, purchases and account state for the
 * admin. Needs META_ADS_TOKEN (system user token with ads_read). Server only.
 */

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}`;
export const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "403297569247564";
/** USD → KM for display; the bank's real rate shows on the card statement. */
export const USD_TO_KM = Number(process.env.META_USD_KM) || 1.7;

const ACCOUNT_STATUS: Record<number, string> = {
  1: "Aktivan", 2: "Onemogućen", 3: "Neplaćen dug", 7: "Na provjeri", 8: "Čeka naplatu",
  9: "Period odgode plaćanja", 100: "Zatvara se", 101: "Zatvoren",
};
const PURCHASE_TYPES = ["omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase"];

type Action = { action_type: string; value: string };
type InsightRow = { date_start: string; spend?: string; actions?: Action[]; campaign_name?: string; campaign_id?: string };

function purchases(actions?: Action[]): number {
  for (const t of PURCHASE_TYPES) {
    const a = actions?.find((x) => x.action_type === t);
    if (a) return Number(a.value) || 0;
  }
  return 0;
}

async function graph<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = process.env.META_ADS_TOKEN;
  if (!token) throw new Error("META_ADS_TOKEN nije postavljen");
  const qs = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(`${GRAPH}/${path}?${qs}`, { cache: "no-store" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error) throw new Error(j.error?.message || `Meta API ${res.status}`);
  return j as T;
}

async function allRows(path: string, params: Record<string, string>): Promise<InsightRow[]> {
  const out: InsightRow[] = [];
  let p: Record<string, string> = params;
  for (let i = 0; i < 10; i++) {
    const r = await graph<{ data: InsightRow[]; paging?: { cursors?: { after?: string }; next?: string } }>(path, p);
    out.push(...(r.data ?? []));
    const after = r.paging?.next ? r.paging.cursors?.after : undefined;
    if (!after) break;
    p = { ...params, after };
  }
  return out;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Spend per day and per campaign between `since` and `until` (YYYY-MM-DD, account time zone). */
export async function getAdsReport(since: string, until: string) {
  const act = `act_${AD_ACCOUNT_ID}`;
  const range = JSON.stringify({ since, until });
  const [account, daily, campaigns] = await Promise.all([
    graph<{ name?: string; account_status?: number; balance?: string; currency?: string; timezone_name?: string }>(
      act, { fields: "name,account_status,balance,currency,timezone_name" },
    ),
    allRows(`${act}/insights`, { fields: "spend,actions", time_range: range, time_increment: "1", limit: "100" }),
    allRows(`${act}/insights`, { fields: "campaign_id,campaign_name,spend,actions", time_range: range, level: "campaign", limit: "100" }),
  ]);

  const days = daily
    .map((d) => ({ date: d.date_start, spend: r2(Number(d.spend) || 0), purchases: purchases(d.actions) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const total = {
    spend: r2(days.reduce((a, d) => a + d.spend, 0)),
    purchases: days.reduce((a, d) => a + d.purchases, 0),
  };
  const status = account.account_status ?? 0;
  return {
    account: {
      id: AD_ACCOUNT_ID,
      name: account.name ?? "",
      status,
      statusLabel: ACCOUNT_STATUS[status] ?? `Status ${status}`,
      ok: status === 1,
      // `balance` = amount due right now, in cents of the account currency.
      due: r2((Number(account.balance) || 0) / 100),
      currency: account.currency ?? "USD",
      timezone: account.timezone_name ?? null,
    },
    days,
    total,
    campaigns: campaigns
      .map((c) => ({ id: c.campaign_id ?? "", name: c.campaign_name ?? "", spend: r2(Number(c.spend) || 0), purchases: purchases(c.actions) }))
      .filter((c) => c.spend > 0)
      .sort((a, b) => b.spend - a.spend),
    rate: USD_TO_KM,
  };
}
