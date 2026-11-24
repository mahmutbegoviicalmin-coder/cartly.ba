"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ChevronDown, Download, Gift, Loader2, Minus, Plus, RefreshCw, Trash2 } from "lucide-react";
import { km, paket, plural, when, todayStr, downloadBlob, syncSkytec, lastSyncAt, agoText } from "./sk-format";
import { DayBars } from "./AdsCharts";
import "./skytec.css";
import "./kalk.css";

type Totals = {
  delivered: number; returned: number; open: number; revenue: number; shipping: number; adnan: number;
  paidDelivery: number; paidDeliveryPostage: number; freeDelivery: number; freeDeliveryPostage: number;
  gifts: number; giftCost: number; postage: number; returnLoss: number; profit: number;
};
type Data = {
  from: string;
  start: string;
  firstDate: string | null;
  total: Totals;
  owedAdnan: number;
  paidAdnan: number;
  open: { count: number; amount: number; adnan: number; postage: number; profit: number };
  skytecOwes: number;
  byProduct: (Totals & { prefix: string; label: string; cost: number })[];
  parcels: {
    order_number: string; prefix: string; ime: string | null; grad: string | null; state: "dostavljena" | "vracena";
    date: string | null; cod: number; adnan: number; gift: boolean; postage: number; profit: number; skytecPaid: boolean;
  }[];
  payments: { id: string; paid_on: string; amount: number; note: string | null }[];
  needsMigration: boolean;
  settings: { products: Record<string, { label: string; cost: number }>; giftPrice: number; giftCost: number; postage: number };
};
type Ads = {
  connected: boolean;
  error?: string;
  today?: string;
  account?: { name: string; statusLabel: string; ok: boolean; due: number; currency: string };
  days?: { date: string; spend: number; purchases: number }[];
  total?: { spend: number; purchases: number };
  campaigns?: { id: string; name: string; spend: number; purchases: number }[];
  rate?: number;
};
type Period = "month" | "all" | "custom";

const FROM_KEY = "adn-from";
const ADS_EVERY = 5 * 60_000;
const monthStart = () => `${todayStr().slice(0, 7)}-01`;
const dmy = (d: string) => `${Number(d.slice(8, 10))}.${Number(d.slice(5, 7))}.`;
const csvCell = (v: unknown) => { const s = String(v ?? ""); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const num = (n: number) => n.toFixed(2).replace(".", ",");
const usd = (n: number) => `$${n.toFixed(2).replace(".", ",")}`;
const r2 = (n: number) => Math.round(n * 100) / 100;
const signed = (n: number) => `${n < 0 ? "−" : "+"}${km(Math.abs(n))}`;

/** Where the collected money went; categorical slots 1–4 (validated, labels carry the values). */
const SPLIT = [
  { key: "goods", label: "Roba (Adnan + ploče)", color: "#2a78d6" },
  { key: "postage", label: "Poštarina", color: "#eb6834" },
  { key: "ads", label: "Reklame", color: "#1baf7a" },
  { key: "profit", label: "Tvoja zarada", color: "#eda100" },
] as const;

export default function AdnanPanel() {
  const [period, setPeriod] = useState<Period>("all");
  const [custom, setCustom] = useState(monthStart);
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [ads, setAds] = useState<Ads | null>(null);
  const [returns, setReturns] = useState(0);
  const [showParcels, setShowParcels] = useState(false);
  const [pay, setPay] = useState({ amount: "", paid_on: todayStr(), note: "" });
  const [saving, setSaving] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(FROM_KEY);
      if (v === "month" || v === "all") setPeriod(v);
      else if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) { setPeriod("custom"); setCustom(v); }
    } catch {}
  }, []);

  const from = period === "all" ? null : period === "month" ? monthStart() : custom;

  const load = useCallback(async () => {
    setErr(null);
    const r = await fetch(`/api/admin/adnan${from ? `?from=${from}` : ""}`);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error ?? "Greška pri učitavanju."); return; }
    setData(j);
  }, [from]);
  useEffect(() => { load(); }, [load]);

  const adsFrom = data?.from;
  const loadAds = useCallback(async () => {
    if (!adsFrom) return;
    const r = await fetch(`/api/admin/ads?from=${adsFrom}`);
    setAds((await r.json().catch(() => ({ connected: true, error: "Greška pri učitavanju." }))) as Ads);
  }, [adsFrom]);
  useEffect(() => {
    loadAds();
    const id = setInterval(loadAds, ADS_EVERY);
    return () => clearInterval(id);
  }, [loadAds]);

  const refresh = useCallback(async (force: boolean) => {
    setSyncing(true);
    try {
      const ran = await syncSkytec(force);
      setSyncedAt(lastSyncAt());
      if (ran) await load();
      await loadAds();
    } finally { setSyncing(false); }
  }, [load, loadAds]);
  useEffect(() => { refresh(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setReturns(0); }, [data?.open.count]);

  const choose = (p: Period) => {
    setPeriod(p);
    try { localStorage.setItem(FROM_KEY, p === "custom" ? custom : p); } catch {}
  };
  const chooseDate = (d: string) => {
    setCustom(d);
    try { localStorage.setItem(FROM_KEY, d); } catch {}
  };

  const addPayment = async () => {
    setSaving(true); setPayErr(null);
    try {
      const r = await fetch("/api/admin/adnan", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pay),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setPayErr(j.error ?? "Greška."); return; }
      setPay({ amount: "", paid_on: todayStr(), note: "" });
      await load();
    } finally { setSaving(false); }
  };
  const removePayment = async (id: string, amount: number) => {
    if (!confirm(`Obrisati uplatu od ${km(amount)}?`)) return;
    await fetch(`/api/admin/adnan?id=${id}`, { method: "DELETE" });
    await load();
  };

  const exportCsv = () => {
    if (!data) return;
    const rows: unknown[][] = [["Datum", "Kupac", "Grad", "Narudžba", "Proizvod", "Status", "Naplaćeno", "Adnanu", "Poklon", "Poštarina", "Profit"]];
    for (const p of data.parcels) {
      rows.push([
        p.date?.slice(0, 10) ?? "", p.ime, p.grad, p.order_number, data.settings.products[p.prefix]?.label ?? p.prefix,
        p.state === "dostavljena" ? "preuzeto" : "vraćeno", num(p.cod), num(p.adnan),
        p.gift ? num(data.settings.giftCost) : "", num(p.postage), num(p.profit),
      ]);
    }
    rows.push([]);
    rows.push(["Uplate Adnanu"]);
    for (const x of data.payments) rows.push([x.paid_on, x.note ?? "", "", "", "", "", "", num(Number(x.amount))]);
    const csv = "﻿" + rows.map((r) => r.map(csvCell).join(";")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `obracun_adnan_${from ?? "sve"}.csv`);
  };

  if (!data) {
    return (
      <div className="skx kx">
        {err ? <div className="skx-banner"><AlertCircle size={16} /> {err}</div>
          : <div className="kx-card kx-loading"><Loader2 size={20} className="ad-spin" /></div>}
      </div>
    );
  }

  const t = data.total;
  const adsOk = !!ads?.connected && !ads.error && !!ads.total;
  const rate = ads?.rate ?? 1.7;
  const adsKm = adsOk ? r2(ads!.total!.spend * rate) : 0;
  const net = r2(t.profit - adsKm);

  // Forecast: every parcel in delivery picked up, except `returns` of them.
  const o = data.open;
  const avgOpenProfit = o.count ? o.profit / o.count : 0;
  const avgOpenPostage = o.count ? o.postage / o.count : 0;
  const avgOpenAdnan = o.count ? o.adnan / o.count : 0;
  const forecastProfit = r2(t.profit + o.profit - returns * (avgOpenProfit + avgOpenPostage));
  const forecastNet = r2(forecastProfit - adsKm);
  const forecastAdnan = r2(data.owedAdnan + o.adnan - returns * avgOpenAdnan);

  const split = {
    goods: t.adnan + t.giftCost,
    postage: t.postage + t.returnLoss,
    ads: adsKm,
    profit: Math.max(0, net),
  };
  const splitTotal = split.goods + split.postage + split.ads + split.profit;

  const todayAds = ads?.days?.find((d) => d.date === ads.today);
  const maxCampaign = Math.max(1, ...(ads?.campaigns ?? []).map((c) => c.spend));
  const periodText = data.from === data.start ? `od ${dmy(data.start)}` : `od ${dmy(data.from)}`;

  return (
    <div className="skx kx">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="kx-head">
        <div>
          <h2>Kalkulator</h2>
          <p>{periodText} · {syncing ? "osvježavam…" : agoText(syncedAt)}</p>
        </div>
        <div className="cod-tools">
          <div className="cod-seg" role="tablist" aria-label="Period">
            <button className={period === "month" ? "on" : ""} onClick={() => choose("month")}>Mjesec</button>
            <button className={period === "all" ? "on" : ""} onClick={() => choose("all")}>Sve</button>
            <button className={period === "custom" ? "on" : ""} onClick={() => choose("custom")}>Od datuma</button>
          </div>
          <button className="skx-icon" onClick={() => refresh(true)} disabled={syncing} aria-label="Osvježi">
            {syncing ? <Loader2 size={16} className="ad-spin" /> : <RefreshCw size={16} />}
          </button>
          <button className="skx-icon" onClick={exportCsv} aria-label="Preuzmi CSV"><Download size={16} /></button>
        </div>
      </header>
      {period === "custom" && (
        <label className="adn-from">
          Od
          <input type="date" value={custom} min={data.start} max={todayStr()} onChange={(e) => e.target.value && chooseDate(e.target.value)} />
        </label>
      )}
      {err && <div className="skx-banner"><AlertCircle size={16} /> {err}</div>}
      {adsOk && ads!.account && !ads!.account.ok && (
        <div className="skx-banner">
          <AlertCircle size={16} /> Meta račun: {ads!.account.statusLabel.toLowerCase()}, reklame ne idu
          {ads!.account.due > 0 ? ` · duguješ ${usd(ads!.account.due)}` : ""}
        </div>
      )}

      {/* ── KPIs ─────────────────────────────────────────── */}
      <div className="kx-kpis">
        <div className="kx-card kx-kpi kx-kpi-main">
          <span>{adsOk ? "Zarada nakon reklama" : "Profit (bez reklama)"}</span>
          <b className={net >= 0 ? "pos" : "neg"}>{km(net)}</b>
          <small>{paket(t.delivered)} preuzeto{adsOk ? ` · reklame ${km(adsKm)}` : ""}</small>
        </div>
        <div className="kx-card kx-kpi">
          <span>Duguješ Adnanu</span>
          <b>{km(data.owedAdnan)}</b>
          <small>{data.paidAdnan ? `plaćeno ${km(data.paidAdnan)}` : `za ${paket(t.delivered)}`}</small>
        </div>
        <div className="kx-card kx-kpi">
          <span>Čeka u Živinicama</span>
          <b>{km(data.skytecOwes)}</b>
          <small>nepodignute otkupnine</small>
        </div>
        <div className="kx-card kx-kpi">
          <span>U dostavi</span>
          <b>{paket(o.count)}</b>
          <small>{signed(o.profit)} kad se preuzmu</small>
        </div>
      </div>

      {/* ── Where the money went + statement ─────────────── */}
      <div className="kx-grid">
        <section className="kx-card">
          <h3>Gdje ide novac</h3>
          <p className="kx-sub">Naplaćeno {km(t.revenue)} od {paket(t.delivered)}</p>
          {splitTotal > 0 && (
            <div className="kx-split" role="img" aria-label="Raspodjela naplaćenog novca">
              {SPLIT.map((s) => split[s.key] > 0 && (
                <i key={s.key} style={{ width: `${(split[s.key] / splitTotal) * 100}%`, background: s.color }} title={`${s.label}: ${km(split[s.key])}`} />
              ))}
            </div>
          )}
          <ul className="kx-legend">
            {SPLIT.filter((s) => s.key !== "ads" || adsOk).map((s) => (
              <li key={s.key}>
                <i style={{ background: s.color }} />
                <span>{s.label}</span>
                <b>{km(s.key === "profit" ? net : split[s.key])}</b>
                <em>{splitTotal ? `${Math.round((split[s.key] / splitTotal) * 100)} %` : ""}</em>
              </li>
            ))}
          </ul>
        </section>

        <section className="kx-card">
          <h3>Obračun</h3>
          <dl className="kx-ledger">
            <div><dt>Naplaćeno</dt><dd>{km(t.revenue)}</dd></div>
            <div><dt>Adnanu za alat</dt><dd className="neg">−{km(t.adnan)}</dd></div>
            <div><dt>Poštarina <small>kupci platili {km(t.shipping)} kroz cijenu (i Makita, gdje piše besplatna)</small></dt><dd className="neg">−{km(t.postage)}</dd></div>
            <div><dt>Brusne ploče <small>{t.gifts} poklona, zarada {signed(t.gifts * data.settings.giftPrice - t.giftCost)}</small></dt><dd className="neg">−{km(t.giftCost)}</dd></div>
            {t.returned > 0 && <div><dt>Povrati <small>{paket(t.returned)}</small></dt><dd className="neg">−{km(t.returnLoss)}</dd></div>}
            <div className="sub"><dt>Profit</dt><dd>{km(t.profit)}</dd></div>
            {adsOk && <div><dt>Reklame <small>{usd(ads!.total!.spend)}</small></dt><dd className="neg">−{km(adsKm)}</dd></div>}
            <div className="sum"><dt>Zarada</dt><dd className={net >= 0 ? "pos" : "neg"}>{km(net)}</dd></div>
          </dl>
        </section>
      </div>

      {/* ── Forecast ─────────────────────────────────────── */}
      {o.count > 0 && (
        <section className="kx-card kx-forecast">
          <div>
            <h3>Kad se preuzme sve iz dostave</h3>
            <p className="kx-sub">Povrat košta samo poštarinu, alat se prodaje ponovo</p>
          </div>
          <div className="kx-stepper" aria-label="Broj povrata">
            <button onClick={() => setReturns((n) => Math.max(0, n - 1))} disabled={returns === 0} aria-label="Manje povrata"><Minus size={14} /></button>
            <span>{plural(returns, "povrat", "povrata", "povrata")}</span>
            <button onClick={() => setReturns((n) => Math.min(o.count, n + 1))} disabled={returns >= o.count} aria-label="Više povrata"><Plus size={14} /></button>
          </div>
          <div className="kx-forecast-nums">
            <div><span>{adsOk ? "Zarada nakon reklama" : "Profit"}</span><b className={forecastNet >= 0 ? "pos" : "neg"}>{km(forecastNet)}</b></div>
            <div><span>Adnanu ukupno</span><b>{km(forecastAdnan)}</b></div>
          </div>
        </section>
      )}

      {/* ── Meta ads ─────────────────────────────────────── */}
      <section className="kx-card">
        <div className="kx-card-head">
          <div>
            <h3>Meta reklame</h3>
            <p className="kx-sub">Račun {ads?.account?.name || "Almin"} · osvježava se svakih 5 min</p>
          </div>
          {adsOk && ads!.account && (
            <span className={`kx-pill ${ads!.account.ok ? "ok" : "bad"}`}>{ads!.account.ok ? "Aktivan" : ads!.account.statusLabel}</span>
          )}
        </div>
        {!ads ? (
          <div className="kx-loading"><Loader2 size={18} className="ad-spin" /></div>
        ) : !ads.connected ? (
          <p className="kx-empty">Meta nije povezana. Dodaj META_ADS_TOKEN u Vercel.</p>
        ) : ads.error ? (
          <p className="kx-empty">Meta: {ads.error}</p>
        ) : (
          <>
            <div className="kx-mini">
              <div><span>Potrošeno</span><b>{usd(ads.total!.spend)}</b><small>≈ {km(adsKm)}</small></div>
              <div><span>Kupovine</span><b>{ads.total!.purchases}</b><small>prema Meti</small></div>
              <div><span>Po kupovini</span><b>{ads.total!.purchases ? usd(ads.total!.spend / ads.total!.purchases) : "—"}</b><small>{ads.total!.purchases ? `≈ ${km((ads.total!.spend / ads.total!.purchases) * rate)}` : ""}</small></div>
              <div><span>Danas</span><b>{usd(todayAds?.spend ?? 0)}</b><small>{plural(todayAds?.purchases ?? 0, "kupovina", "kupovine", "kupovina")}</small></div>
            </div>
            {(ads.days?.length ?? 0) > 0 && (
              <div className="kx-charts">
                <figure>
                  <figcaption>Potrošnja po danu</figcaption>
                  <DayBars data={ads.days!} dataKey="spend" format={usd} label="Potrošeno" />
                </figure>
                <figure>
                  <figcaption>Kupovine po danu</figcaption>
                  <DayBars data={ads.days!} dataKey="purchases" format={(n) => String(n)} label="Kupovine" />
                </figure>
              </div>
            )}
            {(ads.campaigns?.length ?? 0) > 0 && (
              <table className="kx-table">
                <thead><tr><th>Kampanja</th><th>Potrošeno</th><th>Kupovine</th><th>Po kupovini</th></tr></thead>
                <tbody>
                  {ads.campaigns!.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className="kx-cname">{c.name}</span>
                        <span className="kx-cbar"><i style={{ width: `${(c.spend / maxCampaign) * 100}%` }} /></span>
                      </td>
                      <td>{usd(c.spend)}</td>
                      <td>{c.purchases}</td>
                      <td>{c.purchases ? usd(c.spend / c.purchases) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="kx-foot">1 USD ≈ {String(rate).replace(".", ",")} KM · Meta kasni oko 15 min</p>
          </>
        )}
      </section>

      {/* ── Per product ──────────────────────────────────── */}
      {data.byProduct.length > 0 && (
        <section className="kx-card">
          <h3>Po proizvodu</h3>
          <table className="kx-table">
            <thead><tr><th>Proizvod</th><th>Preuzeto</th><th>U dostavi</th><th>Adnanu</th><th>Profit</th></tr></thead>
            <tbody>
              {data.byProduct.map((p) => (
                <tr key={p.prefix}>
                  <td><span className="kx-cname">{p.label}</span><span className="kx-muted">nabavna {km(p.cost)}</span></td>
                  <td>{p.delivered}{p.returned ? <span className="kx-muted">{p.returned} vraćeno</span> : null}</td>
                  <td>{p.open}</td>
                  <td>{km(p.adnan)}</td>
                  <td className={p.profit >= 0 ? "pos" : "neg"}>{km(p.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── Payments to Adnan ────────────────────────────── */}
      <section className="kx-card">
        <h3>Uplate Adnanu</h3>
        {data.needsMigration ? (
          <p className="kx-empty">Pokreni SQL iz <code>app/admin/dashboard/supabase-adnan-migration.sql</code> u Supabase.</p>
        ) : (
          <>
            <div className="adn-pay">
              <input inputMode="decimal" placeholder="Iznos (KM)" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} aria-label="Iznos" />
              <input type="date" value={pay.paid_on} max={todayStr()} onChange={(e) => setPay({ ...pay, paid_on: e.target.value })} aria-label="Datum" />
              <input placeholder="Napomena" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} aria-label="Napomena" />
              <button className="skx-btn primary sm" onClick={addPayment} disabled={saving || !pay.amount}>
                {saving ? <Loader2 size={14} className="ad-spin" /> : <Plus size={14} />} Dodaj
              </button>
            </div>
            {payErr && <div className="adn-err">{payErr}</div>}
            {data.payments.length > 0 && (
              <ul className="kx-list">
                {data.payments.map((x) => (
                  <li key={x.id}>
                    <span>{dmy(x.paid_on)}{x.note ? <small>{x.note}</small> : null}</span>
                    <b>{km(Number(x.amount))}</b>
                    <button className="skx-icon" onClick={() => removePayment(x.id, Number(x.amount))} aria-label="Obriši uplatu"><Trash2 size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {/* ── Parcels (collapsed) ──────────────────────────── */}
      {data.parcels.length > 0 && (
        <section className="kx-card">
          <button className="kx-toggle" onClick={() => setShowParcels((v) => !v)} aria-expanded={showParcels}>
            <h3>Paketi <span className="kx-muted">{data.parcels.length}</span></h3>
            <ChevronDown size={18} className={showParcels ? "open" : ""} />
          </button>
          {showParcels && (
            <table className="kx-table">
              <thead><tr><th>Kupac</th><th>Naplaćeno</th><th>Adnanu</th><th>Profit</th></tr></thead>
              <tbody>
                {data.parcels.map((p) => (
                  <tr key={p.order_number}>
                    <td>
                      <span className="kx-cname">{p.ime ?? "—"}{p.gift && <Gift size={12} className="kx-gift" aria-label="poklon" />}</span>
                      <span className="kx-muted">{data.settings.products[p.prefix]?.label ?? p.prefix} · {p.date ? when(p.date) : "—"}{p.state === "vracena" ? " · vraćen" : ""}</span>
                    </td>
                    <td>{p.state === "dostavljena" ? km(p.cod) : "—"}</td>
                    <td>{p.state === "dostavljena" ? km(p.adnan) : "—"}</td>
                    <td className={p.profit >= 0 ? "pos" : "neg"}>{signed(p.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
