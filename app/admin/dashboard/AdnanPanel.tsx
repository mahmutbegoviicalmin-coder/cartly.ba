"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Download, Gift, Loader2, Megaphone, Plus, RefreshCw, Trash2 } from "lucide-react";
import { km, paket, plural, when, todayStr, downloadBlob, syncSkytec, lastSyncAt, agoText } from "./sk-format";
import "./skytec.css";

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
  open: { count: number; amount: number; adnan: number; postage: number };
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
  from?: string;
  today?: string;
  account?: { name: string; statusLabel: string; ok: boolean; due: number; currency: string };
  days?: { date: string; spend: number; purchases: number }[];
  total?: { spend: number; purchases: number };
  campaigns?: { id: string; name: string; spend: number; purchases: number }[];
  rate?: number;
};

const usd = (n: number) => `$${n.toFixed(2).replace(".", ",")}`;
const ADS_EVERY = 5 * 60_000;

type Period = "month" | "all" | "custom";
const FROM_KEY = "adn-from";
const monthStart = () => `${todayStr().slice(0, 7)}-01`;
const dmy = (d: string) => `${Number(d.slice(8, 10))}.${Number(d.slice(5, 7))}.${d.slice(0, 4)}.`;
const csvCell = (v: unknown) => { const s = String(v ?? ""); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const num = (n: number) => n.toFixed(2).replace(".", ",");

export default function AdnanPanel() {
  const [period, setPeriod] = useState<Period>("all");
  const [custom, setCustom] = useState(monthStart);
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [pay, setPay] = useState({ amount: "", paid_on: todayStr(), note: "" });
  const [saving, setSaving] = useState(false);
  const [payErr, setPayErr] = useState<string | null>(null);
  const [ads, setAds] = useState<Ads | null>(null);
  const [adsAt, setAdsAt] = useState<number | null>(null);

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

  // Meta ad spend for the same period, refreshed every few minutes.
  const adsFrom = data?.from;
  const loadAds = useCallback(async () => {
    if (!adsFrom) return;
    const r = await fetch(`/api/admin/ads?from=${adsFrom}`);
    const j = (await r.json().catch(() => ({ connected: true, error: "Greška pri učitavanju." }))) as Ads;
    setAds(j);
    setAdsAt(Date.now());
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
    } finally { setSyncing(false); }
  }, [load]);
  useEffect(() => { refresh(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const t = data?.total;
  const adsKm = ads?.total && ads.rate ? Math.round(ads.total.spend * ads.rate * 100) / 100 : null;
  const todayAds = ads?.days?.find((d) => d.date === ads.today);
  const parcels = data ? (showAll ? data.parcels : data.parcels.slice(0, 25)) : [];
  const periodText = !data ? "" : data.from === data.start ? `od ${dmy(data.start)} (od kad radi Skytec API)` : `od ${dmy(data.from)}`;

  return (
    <div className="skx">
      {/* ── Header + summary ─────────────────────────────────── */}
      <section className="skx-section">
        <header className="skx-section-head adn-head">
          <div>
            <h2>Obračun s Adnanom</h2>
            <p>Na osnovu preuzetih paketa · {periodText} · {syncing ? "osvježavam sa Skytecom…" : agoText(syncedAt)}</p>
          </div>
          <div className="cod-tools">
            <div className="cod-seg" role="tablist" aria-label="Period">
              <button className={period === "month" ? "on" : ""} onClick={() => choose("month")}>Ovaj mjesec</button>
              <button className={period === "all" ? "on" : ""} onClick={() => choose("all")}>Sve</button>
              <button className={period === "custom" ? "on" : ""} onClick={() => choose("custom")}>Od datuma</button>
            </div>
            <button className="skx-icon" onClick={() => refresh(true)} disabled={syncing} aria-label="Osvježi iz Skyteca">
              {syncing ? <Loader2 size={16} className="ad-spin" /> : <RefreshCw size={16} />}
            </button>
            <button className="skx-icon" onClick={exportCsv} disabled={!data} aria-label="Preuzmi CSV">
              <Download size={16} />
            </button>
          </div>
        </header>
        {period === "custom" && (
          <label className="adn-from">
            Obračun od
            <input type="date" value={custom} min={data?.start} max={todayStr()} onChange={(e) => e.target.value && chooseDate(e.target.value)} />
          </label>
        )}

        {err && <div className="skx-banner"><AlertCircle size={16} /> {err}</div>}

        {!data || !t ? (
          <div className="skx-group"><div className="skx-empty"><Loader2 size={20} className="ad-spin" /></div></div>
        ) : (
          <div className="skx-group">
            <div className="cod-hero">
              <div className="cod-hero-main">
                <span>Trebaš dati Adnanu</span>
                <b className={data.owedAdnan < 0 ? "cod-plus" : ""}>{km(data.owedAdnan)}</b>
                <small>
                  {km(t.adnan)} za {paket(t.delivered)} preuzetih{data.paidAdnan ? ` − ${km(data.paidAdnan)} već plaćeno` : ""}
                  {data.owedAdnan < 0 ? " · platio si više nego što duguješ" : ""}
                </small>
              </div>
              <div className="cod-hero-side">
                <div><span>Tvoj profit</span><b className={t.profit >= 0 ? "cod-plus" : "cod-neg"}>{km(t.profit)}</b></div>
                <div><span>Plaćeno Adnanu</span><b>{km(data.paidAdnan)}</b></div>
              </div>
            </div>

            <div className="adn-calc">
              <div><span>Naplaćeno od kupaca ({paket(t.delivered)})</span><b>{km(t.revenue)}</b></div>
              <div className="sub"><span>od toga alat</span><b>{km(t.revenue - t.shipping - t.gifts * data.settings.giftPrice)}</b></div>
              {t.gifts > 0 && (
                <div className="sub"><span>od toga pokloni ({t.gifts} × {km(data.settings.giftPrice)})</span><b>{km(t.gifts * data.settings.giftPrice)}</b></div>
              )}
              <div className="sub"><span>od toga dostava (kupci platili)</span><b>{km(t.shipping)}</b></div>
              <div><span>Adnanu za alat</span><b className="cod-neg">−{km(t.adnan)}</b></div>
              <div>
                <span>
                  Pokloni, nabavka brusnih ploča ({t.gifts} × {km(data.settings.giftCost)})
                  {t.gifts > 0 && <small className="adn-gain"> · zarada na poklonima +{km(t.gifts * data.settings.giftPrice - t.giftCost)}</small>}
                </span>
                <b className="cod-neg">−{km(t.giftCost)}</b>
              </div>
              {t.paidDelivery > 0 && (() => {
                const net = Math.round((t.shipping - t.paidDeliveryPostage) * 100) / 100;
                return (
                  <div>
                    <span>Dostava koju plaća kupac ({paket(t.paidDelivery)}): kupci platili {km(t.shipping)}, Skytecu {km(t.paidDeliveryPostage)}</span>
                    <b className={net < 0 ? "cod-neg" : "cod-plus"}>{net < 0 ? "−" : "+"}{km(Math.abs(net))}</b>
                  </div>
                );
              })()}
              {t.freeDelivery > 0 && (
                <div>
                  <span>Besplatna dostava, plaćaš ti ({paket(t.freeDelivery)}, Makita)</span>
                  <b className="cod-neg">−{km(t.freeDeliveryPostage)}</b>
                </div>
              )}
              <div><span>Povrati, izgubljena poštarina ({paket(t.returned)})</span><b className="cod-neg">−{km(t.returnLoss)}</b></div>
              <div className="sum">
                <span>Tvoj profit{t.delivered ? <small> · {km(t.profit / t.delivered)} po paketu</small> : null}</span>
                <b className={t.profit >= 0 ? "cod-plus" : "cod-neg"}>{km(t.profit)}</b>
              </div>
              {adsKm != null && ads?.total && (
                <>
                  <div>
                    <span>Reklame na Meti ({usd(ads.total.spend)} × {String(ads.rate).replace(".", ",")})</span>
                    <b className="cod-neg">−{km(adsKm)}</b>
                  </div>
                  <div className="sum">
                    <span>Zarada nakon reklama<small> · reklame plaćaju i pakete koji su još u dostavi</small></span>
                    <b className={t.profit - adsKm >= 0 ? "cod-plus" : "cod-neg"}>{km(t.profit - adsKm)}</b>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {data && t && (
        <>
          {/* ── Meta ads ─────────────────────────────────────── */}
          <section className="skx-section">
            <header className="skx-section-head">
              <div>
                <h2><Megaphone size={18} className="adn-ico" /> Reklame</h2>
                <p>
                  Meta račun {ads?.account?.name || "Almin"} · {periodText}
                  {adsAt ? ` · ${agoText(adsAt)}, osvježava se svakih 5 min` : ""}
                </p>
              </div>
              <button className="skx-icon" onClick={loadAds} aria-label="Osvježi reklame"><RefreshCw size={16} /></button>
            </header>
            {!ads ? (
              <div className="skx-group"><div className="skx-empty"><Loader2 size={20} className="ad-spin" /></div></div>
            ) : !ads.connected ? (
              <div className="skx-banner"><AlertCircle size={16} /> Meta nije povezana: dodaj META_ADS_TOKEN u Vercel i ponovo objavi.</div>
            ) : ads.error ? (
              <div className="skx-banner"><AlertCircle size={16} /> Meta: {ads.error}</div>
            ) : (
              <>
                {ads.account && (!ads.account.ok || ads.account.due > 0) && (
                  <div className="skx-banner">
                    <AlertCircle size={16} />
                    {ads.account.ok ? "Račun radi" : `Račun: ${ads.account.statusLabel}, reklame ne idu`}
                    {ads.account.due > 0 ? ` · neplaćeno ${usd(ads.account.due)} (~${km(ads.account.due * (ads.rate ?? 1))})` : ""}
                  </div>
                )}
                <div className="skx-group skx-metrics">
                  <div className="skx-metric">
                    <span>Danas potrošeno</span>
                    <b>{usd(todayAds?.spend ?? 0)}</b>
                    <small>{plural(todayAds?.purchases ?? 0, "kupovina", "kupovine", "kupovina")}</small>
                  </div>
                  <div className="skx-metric">
                    <span>Ukupno u periodu</span>
                    <b>{usd(ads.total?.spend ?? 0)}</b>
                    <small>~{km(adsKm ?? 0)}</small>
                  </div>
                  <div className="skx-metric">
                    <span>Kupovine (Meta)</span>
                    <b>{ads.total?.purchases ?? 0}</b>
                    <small>{ads.total?.purchases ? `${usd(ads.total.spend / ads.total.purchases)} po kupovini` : "—"}</small>
                  </div>
                  <div className="skx-metric">
                    <span>Reklame po preuzetom paketu</span>
                    <b>{t.delivered && adsKm != null ? km(adsKm / t.delivered) : "—"}</b>
                    <small>profit po paketu {t.delivered ? km(t.profit / t.delivered) : "—"}</small>
                  </div>
                </div>
                {(ads.days?.length ?? 0) > 0 && (
                  <div className="skx-group">
                    {[...(ads.days ?? [])].reverse().map((d) => (
                      <div key={d.date} className="skx-row static">
                        <span className="skx-row-main">
                          <span className="skx-row-title">{d.date === ads.today ? "Danas" : dmy(d.date)}</span>
                          <span className="skx-row-sub">{plural(d.purchases, "kupovina", "kupovine", "kupovina")}{d.purchases ? ` · ${usd(d.spend / d.purchases)} po kupovini` : ""}</span>
                        </span>
                        <span className="skx-row-end">
                          <span className="skx-row-amt">{usd(d.spend)}</span>
                          <span className="skx-row-meta">~{km(d.spend * (ads.rate ?? 1))}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {(ads.campaigns?.length ?? 0) > 0 && (
                  <div className="skx-group">
                    {ads.campaigns!.map((c) => (
                      <div key={c.id} className="skx-row static">
                        <span className="skx-row-main">
                          <span className="skx-row-title">{c.name}</span>
                          <span className="skx-row-sub">{plural(c.purchases, "kupovina", "kupovine", "kupovina")}{c.purchases ? ` · ${usd(c.spend / c.purchases)} po kupovini` : ""}</span>
                        </span>
                        <span className="skx-row-amt">{usd(c.spend)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="cod-foot">Iznosi u KM su po kursu 1 USD = {String(ads.rate).replace(".", ",")} KM; tačan iznos je na izvodu kartice. Meta brojke kasne oko 15 minuta.</p>
              </>
            )}
          </section>

          {/* ── Still in transit ─────────────────────────────── */}
          <div className="skx-group skx-metrics">
            <div className="skx-metric">
              <span>Još u dostavi</span>
              <b>{paket(data.open.count)}</b>
              <small>kad se preuzmu, Adnanu još {km(data.open.adnan)}</small>
            </div>
            <div className="skx-metric">
              <span>Čeka u Živinicama</span>
              <b>{km(data.skytecOwes)}</b>
              <small>kupci platili, otkupnina još nije podignuta</small>
            </div>
            <div className="skx-metric">
              <span>Poštarina plaćena unaprijed</span>
              <b>{km(data.open.postage)}</b>
              <small>za {paket(data.open.count)} u dostavi, vrati se kroz otkupninu</small>
            </div>
            <div className="skx-metric">
              <span>Vraćeno</span>
              <b>{t.delivered + t.returned ? `${((t.returned / (t.delivered + t.returned)) * 100).toFixed(1).replace(".", ",")} %` : "—"}</b>
              <small>{t.returned} od {paket(t.delivered + t.returned)}</small>
            </div>
          </div>

          {/* ── Per product ──────────────────────────────────── */}
          <section className="skx-section">
            <header className="skx-section-head">
              <div><h2>Po proizvodu</h2><p>Nabavna cijena ide Adnanu, ostatak je tvoj nakon poštarine i poklona</p></div>
            </header>
            <div className="skx-group">
              {data.byProduct.length === 0 ? (
                <div className="skx-empty"><b>Nema paketa u ovom periodu</b></div>
              ) : data.byProduct.map((p) => (
                <div key={p.prefix} className="skx-row static">
                  <span className="skx-row-main">
                    <span className="skx-row-title">{p.label}</span>
                    <span className="skx-row-sub">
                      Nabavna {km(p.cost)} · {p.delivered} preuzeto{p.returned ? ` · ${p.returned} vraćeno` : ""}{p.open ? ` · ${p.open} u dostavi` : ""}{p.gifts ? ` · ${p.gifts} s poklonom` : ""}
                    </span>
                  </span>
                  <span className="skx-row-end">
                    <span className={`skx-row-amt ${p.profit >= 0 ? "cod-plus" : "cod-neg"}`}>{km(p.profit)}</span>
                    <span className="skx-row-meta">Adnanu {km(p.adnan)}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Payments to Adnan ────────────────────────────── */}
          <section className="skx-section">
            <header className="skx-section-head">
              <div><h2>Uplate Adnanu</h2><p>Upiši svaki put kad mu daš novac, pa se oduzme od duga</p></div>
            </header>
            {data.needsMigration ? (
              <div className="skx-banner">
                <AlertCircle size={16} />
                <span>Za upisivanje uplata treba jednom pokrenuti SQL iz <code>app/admin/dashboard/supabase-adnan-migration.sql</code> u Supabase SQL Editoru.</span>
              </div>
            ) : (
              <div className="skx-group">
                <div className="adn-pay">
                  <input
                    inputMode="decimal" placeholder="Iznos (KM)" value={pay.amount}
                    onChange={(e) => setPay({ ...pay, amount: e.target.value })} aria-label="Iznos"
                  />
                  <input type="date" value={pay.paid_on} max={todayStr()} onChange={(e) => setPay({ ...pay, paid_on: e.target.value })} aria-label="Datum" />
                  <input placeholder="Napomena (npr. gotovina)" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} aria-label="Napomena" />
                  <button className="skx-btn primary sm" onClick={addPayment} disabled={saving || !pay.amount}>
                    {saving ? <Loader2 size={14} className="ad-spin" /> : <Plus size={14} />} Dodaj
                  </button>
                </div>
                {payErr && <div className="adn-err">{payErr}</div>}
                {data.payments.length === 0 ? (
                  <div className="skx-empty"><span>Još nema upisanih uplata.</span></div>
                ) : data.payments.map((x) => (
                  <div key={x.id} className="skx-row static">
                    <span className="skx-row-main">
                      <span className="skx-row-title">{dmy(x.paid_on)}</span>
                      {x.note && <span className="skx-row-sub">{x.note}</span>}
                    </span>
                    <span className="skx-row-amt">{km(Number(x.amount))}</span>
                    <button className="skx-icon" onClick={() => removePayment(x.id, Number(x.amount))} aria-label="Obriši uplatu">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Parcels ──────────────────────────────────────── */}
          <section className="skx-section">
            <header className="skx-section-head">
              <div><h2>Paketi</h2><p>Svaki preuzet i vraćen paket i šta je od njega ostalo tebi</p></div>
            </header>
            <div className="skx-group">
              {parcels.length === 0 ? (
                <div className="skx-empty"><b>Nema preuzetih ni vraćenih paketa</b></div>
              ) : parcels.map((p) => (
                <div key={p.order_number} className="skx-row static">
                  <span className="skx-row-main">
                    <span className="skx-row-title">
                      {p.ime ?? "—"}
                      {p.gift && <span className="skx-pill orange adn-gift"><Gift size={11} /> poklon</span>}
                    </span>
                    <span className="skx-row-sub">
                      {data.settings.products[p.prefix]?.label ?? p.prefix} · {p.date ? when(p.date) : "—"}
                      {p.state === "dostavljena"
                        ? ` · naplaćeno ${km(p.cod)}, Adnanu ${km(p.adnan)}`
                        : ` · vraćen, izgubljena poštarina`}
                    </span>
                  </span>
                  <span className="skx-row-end">
                    <span className={`skx-row-amt ${p.profit >= 0 ? "cod-plus" : "cod-neg"}`}>{p.profit >= 0 ? "+" : "−"}{km(Math.abs(p.profit))}</span>
                    <span className="skx-row-meta">{p.state === "dostavljena" ? (p.skytecPaid ? "uplaćeno" : "čeka uplatu") : "povrat"}</span>
                  </span>
                </div>
              ))}
              {!showAll && data.parcels.length > 25 && (
                <button className="skx-row skx-more" onClick={() => setShowAll(true)}>
                  Prikaži sve ({plural(data.parcels.length, "paket", "paketa", "paketa")})
                </button>
              )}
            </div>
            <p className="cod-foot">
              Nabavne cijene: {Object.values(data.settings.products).map((p) => `${p.label} ${km(p.cost)}`).join(" · ")}.
              Poklon: kupac plaća {km(data.settings.giftPrice)}, tebe košta {km(data.settings.giftCost)}.
              Poštarina se uzima iz Skyteca (inače {km(data.settings.postage)}).
              Dostavu koju plati kupac uzimamo iz narudžbe (Milwaukee i DeWalt 10 KM, Makita besplatna). Jedna pošiljka = jedna poštarina, i kad ima više artikala.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
