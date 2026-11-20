"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, Loader2, Phone, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { km, paket, plural, prettyDay, productOf, downloadBlob, syncSkytec, lastSyncAt, agoText } from "./sk-format";
import "./skytec.css";

type Stage = "na_terenu" | "naplaceno" | "u_isplati" | "uplaceno" | "izgubljeno";

type CodData = {
  days: number;
  totalExpected: number;
  pipeline: Record<Stage, { count: number; amount: number }>;
  stats: {
    avgDaysToPayout: number | null; medianDaysToPayout: number | null; longestWait: number;
    overdueCount: number; overdueAmount: number; unmatchedCount: number; unmatchedAmount: number;
  };
  waiting: {
    order_number: string; ime: string | null; telefon: string | null; grad: string | null; product_prefix: string | null;
    amount: number; stage: Stage; delivered_at: string | null; days: number; sky_sifra: string | null;
  }[];
  payouts: {
    date: string; count: number; total: number;
    items: { sifra: string | null; amount: number; ime: string | null; order_number: string | null; product_prefix: string | null }[];
  }[];
  series: { date: string; amount: number }[];
  mismatches: { order_number: string; ime: string | null; expected: number; paid: number; sky_sifra: string | null }[];
  byProduct: { prefix: string; collected: number; outstanding: number; lost: number; parcels: number }[];
};

const STAGES: { key: Stage; label: string; hint: string; tone: string }[] = [
  { key: "na_terenu", label: "Još u dostavi", hint: "Paket je kod kurira, kupac još nije platio", tone: "blue" },
  { key: "naplaceno", label: "Dostavljeno, Skytec još nije obračunao", hint: "Kupac je platio kuriru, uplata još nije pokrenuta", tone: "orange" },
  { key: "u_isplati", label: "Dostavljeno, uplata u toku", hint: "Skytec je obračunao, novac stiže na račun za 1–2 dana", tone: "purple" },
  { key: "uplaceno", label: "Uplaćeno na tvoj račun", hint: "Novac je stigao", tone: "green" },
  { key: "izgubljeno", label: "Vraćeno", hint: "Kupac nije preuzeo paket, nema novca", tone: "red" },
];

const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);
const fmtPct = (n: number) => `${n.toFixed(n >= 10 || n === 0 ? 0 : 1).replace(".", ",")} %`;
const dana = (n: number) => plural(n, "dan", "dana", "dana");
const fmtDays = (n: number | null) => (n == null ? "—" : `${n.toFixed(1).replace(".", ",")} ${n === 1 ? "dan" : "dana"}`);
const shortDay = (d: string) => `${Number(d.slice(8, 10))}.${Number(d.slice(5, 7))}.`;

function csvEscape(v: unknown) {
  const s = String(v ?? "");
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function CodPanel() {
  const [days, setDays] = useState(60);
  const [data, setData] = useState<CodData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [allPayouts, setAllPayouts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [, tick] = useState(0);

  const load = useCallback(async (d: number) => {
    setErr(null);
    const r = await fetch(`/api/admin/skytec/cod?days=${d}`);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error ?? "Greška pri učitavanju."); return; }
    setData(j);
  }, []);

  useEffect(() => { setData(null); load(days); }, [days, load]);

  // Show what we have right away, then pull fresh data from Skytec and reload.
  const refresh = useCallback(async (force: boolean) => {
    setBusy(true);
    try {
      const ran = await syncSkytec(force);
      setSyncedAt(lastSyncAt());
      if (ran) await load(days);
    } finally { setBusy(false); }
  }, [days, load]);

  useEffect(() => { refresh(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30_000); return () => clearInterval(t); }, []);

  const exportCsv = () => {
    if (!data) return;
    const rows: unknown[][] = [["Datum isplate", "Kupac", "Narudžba", "Pošiljka", "Proizvod", "Iznos (KM)"]];
    for (const p of data.payouts) for (const i of p.items) {
      rows.push([p.date, i.ime, i.order_number ?? "", i.sifra ?? "", productOf(i.product_prefix), i.amount.toFixed(2).replace(".", ",")]);
    }
    rows.push([]);
    rows.push(["Čeka uplatu", "Kupac", "Narudžba", "Pošiljka", "Dana", "Iznos (KM)"]);
    for (const w of data.waiting) {
      rows.push([w.delivered_at?.slice(0, 10) ?? "", w.ime, w.order_number, w.sky_sifra ?? "", w.days, w.amount.toFixed(2).replace(".", ",")]);
    }
    const csv = "﻿" + rows.map((r) => r.map(csvEscape).join(";")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `otkupnine_${data.days}dana.csv`);
  };

  const maxBar = useMemo(() => Math.max(1, ...(data?.series ?? []).map((s) => s.amount)), [data]);
  const last30 = useMemo(() => (data?.series ?? []).reduce((a, s) => a + s.amount, 0), [data]);
  const payouts = data ? (allPayouts ? data.payouts : data.payouts.slice(0, 10)) : [];
  const owed = data ? data.pipeline.naplaceno.amount + data.pipeline.u_isplati.amount : 0;
  const hovered = hover != null && data ? data.series[hover] : null;

  return (
    <div className="skx">
      {/* ── Header ───────────────────────────────────────────── */}
      <section className="skx-section">
        <header className="skx-section-head">
          <div>
            <h2>Gdje je novac</h2>
            <p>Svaka marka od pouzeća, od kurira do tvog računa · {busy ? "osvježavam sa Skytecom…" : agoText(syncedAt)}</p>
          </div>
          <div className="cod-tools">
            <div className="cod-seg" role="tablist" aria-label="Period">
              {[30, 60, 90].map((d) => (
                <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{d} dana</button>
              ))}
            </div>
            <button className="skx-icon" onClick={() => refresh(true)} disabled={busy} aria-label="Osvježi iz Skyteca">
              {busy ? <Loader2 size={16} className="ad-spin" /> : <RefreshCw size={16} />}
            </button>
            <button className="skx-icon" onClick={exportCsv} disabled={!data} aria-label="Preuzmi CSV">
              <Download size={16} />
            </button>
          </div>
        </header>

        {err && <div className="skx-banner"><AlertCircle size={16} /> {err}</div>}

        {!data ? (
          <div className="skx-group"><div className="skx-empty"><Loader2 size={20} className="ad-spin" /></div></div>
        ) : (
          <div className="skx-group">
            <div className="cod-hero">
              <div className="cod-hero-main">
                <span>Skytec ti duguje</span>
                <b>{km(owed)}</b>
                <small>
                  {owed > 0
                    ? `${paket(data.pipeline.naplaceno.count + data.pipeline.u_isplati.count)} dostavljeno i naplaćeno, novac još nije na računu`
                    : "Sav naplaćeni novac je uplaćen"}
                </small>
              </div>
              <div className="cod-hero-side">
                <div><span>Uplaćeno ({data.days} dana)</span><b>{km(data.pipeline.uplaceno.amount)}</b></div>
                <div><span>Još u dostavi</span><b>{km(data.pipeline.na_terenu.amount)}</b></div>
              </div>
            </div>

            <div className="cod-stack" aria-hidden>
              {STAGES.map((s) => {
                const w = pct(data.pipeline[s.key].amount, data.totalExpected);
                return w > 0 ? <i key={s.key} className={s.tone} style={{ width: `${w}%` }} /> : null;
              })}
            </div>

            {STAGES.map((s) => {
              const v = data.pipeline[s.key];
              return (
                <div key={s.key} className="skx-row static cod-stage">
                  <span className={`cod-dot ${s.tone}`} />
                  <span className="skx-row-main">
                    <span className="skx-row-title">{s.label}</span>
                    <span className="skx-row-sub">{s.hint}</span>
                  </span>
                  <span className="skx-row-end">
                    <span className="skx-row-amt">{km(v.amount)}</span>
                    <span className="skx-row-meta">{paket(v.count)} · {fmtPct(pct(v.amount, data.totalExpected))}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {data && (
        <>
          {/* ── Timing ─────────────────────────────────────────── */}
          <div className="skx-group skx-metrics">
            <div className="skx-metric">
              <span>Do uplate obično</span>
              <b>{fmtDays(data.stats.medianDaysToPayout)}</b>
              <small>od dostave do tvog računa</small>
            </div>
            <div className="skx-metric">
              <span>Najduže čeka</span>
              <b>{data.waiting.length ? dana(data.stats.longestWait) : "—"}</b>
              <small>{data.waiting.length ? data.waiting[0].ime ?? "" : "ništa ne čeka"}</small>
            </div>
            <div className="skx-metric">
              <span>Kasni više od 7 dana</span>
              <b className={data.stats.overdueCount ? "cod-warn" : ""}>{km(data.stats.overdueAmount)}</b>
              <small>{paket(data.stats.overdueCount)}</small>
            </div>
            <div className="skx-metric">
              <span>Uplaćeno u 30 dana</span>
              <b>{km(last30)}</b>
              <small>{fmtPct(pct(data.pipeline.uplaceno.amount, data.pipeline.uplaceno.amount + data.pipeline.izgubljeno.amount))} naplativo</small>
            </div>
          </div>

          {/* ── Waiting for money ──────────────────────────────── */}
          <section className="skx-section">
            <header className="skx-section-head">
              <div><h2>Čeka uplatu</h2><p>Kupac je platio, novac još nije kod tebe</p></div>
            </header>
            <div className="skx-group">
              {data.waiting.length === 0 ? (
                <div className="skx-empty cod-ok">
                  <CheckCircle2 size={24} strokeWidth={1.8} />
                  <b>Sve je uplaćeno</b>
                  <span>Nema naplaćenih paketa za koje novac nije stigao.</span>
                </div>
              ) : (
                data.waiting.map((w) => (
                  <div key={w.order_number} className="skx-row static">
                    <span className="skx-row-main">
                      <span className="skx-row-title">{w.ime ?? "—"}</span>
                      <span className="skx-row-sub">
                        {productOf(w.product_prefix)} · {w.stage === "u_isplati" ? "na putu do tebe" : "Skytec još nije obračunao"}
                      </span>
                    </span>
                    <span className={`cod-age${w.days > 14 ? " red" : w.days > 7 ? " orange" : ""}`}>{dana(w.days)}</span>
                    <span className="skx-row-end">
                      <span className="skx-row-amt">{km(w.amount)}</span>
                      {w.telefon && w.days > 7 && (
                        <a className="skx-row-meta cod-call" href={`tel:${w.telefon.replace(/\s/g, "")}`}><Phone size={11} /> kupac</a>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Payouts ───────────────────────────────────────── */}
          <section className="skx-section">
            <header className="skx-section-head">
              <div><h2>Isplate</h2><p>Šta je Skytec uplatio, po danima. Uporedi s izvodom iz banke.</p></div>
            </header>
            <div className="skx-group">
              <div className="cod-chart">
                <div className="cod-chart-head">
                  <span>{hovered ? prettyDay(hovered.date) : "Zadnjih 30 dana"}</span>
                  <b>{km(hovered ? hovered.amount : last30)}</b>
                </div>
                <div className="cod-bars" onMouseLeave={() => setHover(null)}>
                  {data.series.map((s, i) => (
                    <button
                      key={s.date}
                      className={`cod-bar${hover === i ? " on" : ""}`}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      onClick={() => setHover(i)}
                      aria-label={`${s.date}: ${km(s.amount)}`}
                    >
                      <i style={{ height: `${s.amount ? Math.max(4, (s.amount / maxBar) * 100) : 2}%` }} className={s.amount ? "" : "zero"} />
                    </button>
                  ))}
                </div>
                <div className="cod-axis">
                  <span>{shortDay(data.series[0].date)}</span>
                  <span>{shortDay(data.series[14].date)}</span>
                  <span>danas</span>
                </div>
              </div>

              {payouts.length === 0 ? (
                <div className="skx-empty"><b>Nema isplata u ovom periodu</b></div>
              ) : payouts.map((p) => (
                <div key={p.date} className={`skx-ship${open === p.date ? " open" : ""}`}>
                  <button className="skx-row" onClick={() => setOpen(open === p.date ? null : p.date)}>
                    <span className="skx-row-main">
                      <span className="skx-row-title">{prettyDay(p.date)}</span>
                      <span className="skx-row-sub">{plural(p.count, "uplata", "uplate", "uplata")}</span>
                    </span>
                    <span className="skx-row-amt cod-plus">{km(p.total)}</span>
                    <ChevronDown size={16} className="skx-chev" />
                  </button>
                  {open === p.date && (
                    <div className="cod-items">
                      {p.items.map((i, n) => (
                        <div key={`${i.sifra}-${n}`} className="cod-item">
                          <span>
                            <b>{i.ime ?? "—"}</b>
                            <small>{i.order_number ?? "bez narudžbe"} · {productOf(i.product_prefix)}</small>
                          </span>
                          <em>{km(i.amount)}</em>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {!allPayouts && data.payouts.length > 10 && (
                <button className="skx-row skx-more" onClick={() => setAllPayouts(true)}>Prikaži sve isplate ({data.payouts.length})</button>
              )}
            </div>
            {data.stats.unmatchedCount > 0 && (
              <p className="cod-foot">
                {plural(data.stats.unmatchedCount, "uplata", "uplate", "uplata")} ({km(data.stats.unmatchedAmount)}) nije povezano s paketom iz sistema.
              </p>
            )}
          </section>

          {/* ── Mismatches ────────────────────────────────────── */}
          {data.mismatches.length > 0 && (
            <section className="skx-section">
              <header className="skx-section-head">
                <div><h2>Neslaganja</h2><p>Uplaćeni iznos se razlikuje od otkupnine na paketu</p></div>
              </header>
              <div className="skx-group">
                {data.mismatches.map((m) => (
                  <div key={m.order_number} className="skx-row static">
                    <span className="skx-row-main">
                      <span className="skx-row-title">{m.ime ?? "—"}</span>
                      <span className="skx-row-sub">Očekivano {km(m.expected)}</span>
                    </span>
                    <span className="skx-row-end">
                      <span className="skx-row-amt">{km(m.paid)}</span>
                      <span className={`skx-row-meta ${m.paid < m.expected ? "cod-neg" : "ok"}`}>
                        {m.paid < m.expected ? "−" : "+"}{km(Math.abs(m.paid - m.expected))}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Per product ───────────────────────────────────── */}
          {data.byProduct.length > 0 && (
            <section className="skx-section">
              <header className="skx-section-head"><div><h2>Po proizvodu</h2><p>Uplaćeno, čeka i izgubljeno</p></div></header>
              <div className="skx-group">
                {data.byProduct.map((p) => {
                  const total = p.collected + p.outstanding + p.lost;
                  return (
                    <div key={p.prefix} className="skx-row static cod-prod">
                      <span className="skx-row-main">
                        <span className="skx-row-title">{productOf(p.prefix === "?" ? null : p.prefix)}</span>
                        <span className="cod-mini" aria-hidden>
                          <i className="green" style={{ width: `${pct(p.collected, total)}%` }} />
                          <i className="orange" style={{ width: `${pct(p.outstanding, total)}%` }} />
                          <i className="red" style={{ width: `${pct(p.lost, total)}%` }} />
                        </span>
                        <span className="skx-row-sub">
                          {paket(p.parcels)}{p.outstanding ? ` · čeka ${km(p.outstanding)}` : ""}{p.lost ? ` · izgubljeno ${km(p.lost)}` : ""}
                        </span>
                      </span>
                      <span className="skx-row-end">
                        <span className="skx-row-amt">{km(p.collected)}</span>
                        <span className="skx-row-meta">uplaćeno</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
