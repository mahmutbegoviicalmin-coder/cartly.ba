"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Download, Loader2, AlertCircle, RefreshCw, Search, Undo2, Warehouse, Printer } from "lucide-react";
import { km, plural, prettyDay, productOf, downloadBlob, syncSkytec, lastSyncAt, agoText, todayStr, PREFIX_LABEL } from "./sk-format";
import SheetCheck from "./SheetCheck";
import "./skytec.css";

type Stage = "kod_kurira" | "ceka_obracun" | "za_podizanje" | "preuzeto" | "vraceno";

type Parcel = {
  order_number: string; linked: boolean; order_date: string;
  ime: string | null; telefon: string | null; grad: string | null; product_prefix: string | null;
  sky_sifra: string | null; cod_sifra: string | null;
  amount: number; paid: number | null; stage: Stage;
  delivered_at: string | null; picked_at: string | null; picked_by_skytec: boolean; waiting_days: number | null;
};

type CodData = {
  days: number;
  totalExpected: number;
  pipeline: Record<Stage, { count: number; amount: number }>;
  parcels: Parcel[];
  pickups: { date: string; count: number; total: number; received: number | null; photos: string[] }[];
  alerts: { noOtkupnina: string[]; longAtDepot: string[] };
  mismatches: { order_number: string; ime: string | null; expected: number; paid: number }[];
};

const STAGES: { key: Stage; label: string; short: string; hint: string; tone: string }[] = [
  { key: "za_podizanje", label: "Za podizanje", short: "Za podizanje", hint: "Kupac je platio, novac čeka u Skytecu (Živinice)", tone: "purple" },
  { key: "ceka_obracun", label: "Čeka obračun", short: "Čeka obračun", hint: "Dostavljeno, Skytec još nije napravio otkupninu", tone: "orange" },
  { key: "kod_kurira", label: "Kod kurira", short: "Kod kurira", hint: "Paket još nije dostavljen", tone: "blue" },
  { key: "preuzeto", label: "Preuzeto", short: "Preuzeto", hint: "Novac si podigao", tone: "green" },
  { key: "vraceno", label: "Vraćeno", short: "Vraćeno", hint: "Kupac nije preuzeo paket, nema novca", tone: "red" },
];
const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s) => [s.key, s])) as Record<Stage, (typeof STAGES)[number]>;

const otkupnina = (n: number) => plural(n, "otkupnina", "otkupnine", "otkupnina");
const dana = (n: number) => plural(n, "dan", "dana", "dana");
const dmy = (d: string | null) => (d ? `${Number(d.slice(8, 10))}.${Number(d.slice(5, 7))}.${d.slice(0, 4)}.` : "");
const product = (p: Parcel) => (p.product_prefix ? productOf(p.product_prefix) : p.linked ? "—" : "Napravljeno u Skytecu");

function csvEscape(v: unknown) {
  const s = String(v ?? "");
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function esc(v: unknown) {
  return String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

/** Printable checklist to take to the Živinice depot. */
function printList(rows: Parcel[]) {
  const sorted = [...rows].sort((a, b) => (a.cod_sifra ?? "~").localeCompare(b.cod_sifra ?? "~"));
  const total = sorted.reduce((a, p) => a + p.amount, 0);
  const body = sorted.map((p, i) => `<tr>
    <td class="n">${i + 1}</td><td class="box"></td>
    <td><b>${esc(p.cod_sifra ?? "—")}</b><br><small>pošiljka ${esc(p.sky_sifra ?? "")}</small></td>
    <td>${esc(p.ime ?? "—")}<br><small>${esc(p.grad ?? "")}</small></td>
    <td>${esc(product(p))}<br><small>${esc(p.linked ? p.order_number : "")}</small></td>
    <td class="r">${esc(km(p.amount))}</td></tr>`).join("");
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Otkupnine za podizanje ${todayStr()}</title>
  <style>
    body{font:13px -apple-system,system-ui,sans-serif;margin:24px;color:#111}
    h1{font-size:18px;margin:0 0 4px} p{margin:0 0 16px;color:#555}
    table{width:100%;border-collapse:collapse} th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}
    th{font-size:11px;text-transform:uppercase;color:#666} small{color:#777} .r{text-align:right;white-space:nowrap} .n{color:#999;width:18px}
    .box{width:14px} .box::before{content:"";display:inline-block;width:12px;height:12px;border:1.5px solid #333;border-radius:2px}
    tfoot td{font-weight:700;font-size:15px;border:none;padding-top:12px}
    .sign{margin-top:40px;display:flex;gap:48px} .sign div{flex:1;border-top:1px solid #333;padding-top:4px;color:#555}
  </style></head><body>
  <h1>Otkupnine za podizanje — Skytec Živinice</h1>
  <p>${esc(dmy(todayStr()))} · ${esc(otkupnina(sorted.length))}</p>
  <table><thead><tr><th></th><th></th><th>Otkupnina</th><th>Kupac</th><th>Proizvod</th><th class="r">Iznos</th></tr></thead>
  <tbody>${body}</tbody>
  <tfoot><tr><td colspan="5">Ukupno</td><td class="r">${esc(km(total))}</td></tr>
  <tr><td colspan="5" style="font-weight:400;font-size:13px">Stvarno dobijeno</td><td class="r" style="font-weight:400">__________ KM</td></tr></tfoot></table>
  <div class="sign"><div>Datum</div><div>Potpis</div></div>
  <script>window.onload=()=>{window.print()}</script></body></html>`);
  w.document.close();
}

function Tick({ on }: { on: boolean }) {
  return <span className={`skx-tick${on ? " on" : ""}`} aria-hidden>{on && <Check size={13} strokeWidth={3} />}</span>;
}

export default function CodPanel() {
  const [days, setDays] = useState(60);
  const [data, setData] = useState<CodData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [, tick] = useState(0);

  // Filters
  const [stage, setStage] = useState<Stage | "sve">("za_podizanje");
  const [q, setQ] = useState("");
  const [prod, setProd] = useState("");
  const [pickDay, setPickDay] = useState<string | null>(null);

  // Selection + pickup date
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [date, setDate] = useState(todayStr());
  const [received, setReceived] = useState("");
  const [onlyOrders, setOnlyOrders] = useState<Set<string> | null>(null);

  const load = useCallback(async (d: number) => {
    setErr(null);
    const r = await fetch(`/api/admin/skytec/cod?days=${d}`);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error ?? "Greška pri učitavanju."); return; }
    setData(j);
  }, []);

  useEffect(() => { setData(null); load(days); }, [days, load]);

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
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { setSel(new Set()); }, [stage, q, prod, pickDay, days, onlyOrders]);
  useEffect(() => { setReceived(""); }, [sel]);

  const products = useMemo(() => {
    const set = new Set<string>();
    for (const p of data?.parcels ?? []) set.add(p.product_prefix ?? "");
    return Array.from(set).sort((a, b) => (PREFIX_LABEL[a] ?? a).localeCompare(PREFIX_LABEL[b] ?? b));
  }, [data]);

  const list = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    const rows = data.parcels.filter((p) =>
      (stage === "sve" || p.stage === stage) &&
      (!prod || (p.product_prefix ?? "") === (prod === "-" ? "" : prod)) &&
      (!pickDay || p.picked_at === pickDay) &&
      (!onlyOrders || onlyOrders.has(p.order_number)) &&
      (!needle || [p.ime, p.order_number, p.telefon, p.grad, p.sky_sifra, p.cod_sifra].some((v) => v?.toLowerCase().includes(needle))));
    // Oldest waiting first; picked up: newest pickup first.
    return rows.sort((a, b) =>
      a.stage === "preuzeto" && b.stage === "preuzeto"
        ? (b.picked_at ?? "").localeCompare(a.picked_at ?? "") || (a.ime ?? "").localeCompare(b.ime ?? "")
        : (b.waiting_days ?? -1) - (a.waiting_days ?? -1) || b.order_date.localeCompare(a.order_date));
  }, [data, stage, q, prod, pickDay, onlyOrders]);

  const listSum = list.reduce((a, p) => a + p.amount, 0);
  // Only rows with money at Skytec can be marked; only our own marks can be undone.
  const canMark = (p: Parcel) => p.stage === "za_podizanje" || p.stage === "ceka_obracun";
  const canUndo = (p: Parcel) => p.stage === "preuzeto" && !p.picked_by_skytec;
  const selectable = list.filter((p) => canMark(p) || canUndo(p));
  const chosen = list.filter((p) => sel.has(p.order_number));
  const chosenSum = chosen.reduce((a, p) => a + p.amount, 0);
  const undoMode = chosen.length > 0 && chosen.every(canUndo);
  const markSum = chosen.filter(canMark).reduce((a, p) => a + p.amount, 0);
  const receivedNum = received.trim() === "" ? null : Number(received.replace(/\./g, "").replace(",", "."));
  const receivedOk = receivedNum == null || (Number.isFinite(receivedNum) && receivedNum >= 0);
  const diff = receivedNum != null && receivedOk ? Math.round((receivedNum - markSum) * 100) / 100 : 0;

  const toggle = (o: string) => setSel((s) => { const n = new Set(s); if (n.has(o)) n.delete(o); else n.add(o); return n; });
  const toggleAll = () => setSel((s) => (s.size === selectable.length ? new Set() : new Set(selectable.map((p) => p.order_number))));

  const save = async (undo: boolean) => {
    const orders = chosen.filter(undo ? canUndo : canMark).map((p) => p.order_number);
    if (!orders.length) return;
    setSaving(true);
    try {
      const r = await fetch("/api/admin/skytec/cod", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(undo ? { orders, undo: true } : { orders, date, ...(receivedNum != null ? { received: receivedNum } : {}) }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setToast(j.error ?? "Greška pri spremanju."); return; }
      setToast(undo
        ? `Poništeno: ${otkupnina(j.updated)}`
        : `Označeno kao preuzeto: ${otkupnina(j.updated)} · ${km(j.expected ?? markSum)}${diff ? ` · razlika ${diff > 0 ? "+" : "−"}${km(Math.abs(diff))}` : ""}`);
      setSel(new Set());
      await load(days);
    } finally { setSaving(false); }
  };

  const exportCsv = () => {
    if (!data) return;
    const rows: unknown[][] = [["Status", "Kupac", "Telefon", "Grad", "Narudžba", "Proizvod", "Pošiljka", "Otkupnina", "Dostavljeno", "Preuzeto", "Iznos (KM)"]];
    for (const p of list) {
      rows.push([STAGE_BY_KEY[p.stage].label, p.ime, p.telefon, p.grad, p.linked ? p.order_number : "", product(p),
        p.sky_sifra ?? "", p.cod_sifra ?? "", p.delivered_at?.slice(0, 10) ?? "", p.picked_at ?? "", p.amount.toFixed(2).replace(".", ",")]);
    }
    const csv = "﻿" + rows.map((r) => r.map(csvEscape).join(";")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `otkupnine_${stage}_${todayStr()}.csv`);
  };

  const pick = (s: Stage | "sve") => { setStage(s); setPickDay(null); setOnlyOrders(null); };
  const showAlert = (s: Stage, orders: string[]) => { setStage(s); setPickDay(null); setQ(""); setProd(""); setOnlyOrders(new Set(orders)); };

  return (
    <div className={`skx${chosen.length ? " cod-has-bar" : ""}`}>
      {toast && <div className="skx-toast" role="status" onClick={() => setToast(null)}>{toast}</div>}

      <section className="skx-section">
        <header className="skx-section-head">
          <div>
            <h2>Otkupnine</h2>
            <p>Novac od pouzeća podižeš u Skytec magacinu u Živinicama · {busy ? "osvježavam sa Skytecom…" : agoText(syncedAt)}</p>
          </div>
          <div className="cod-tools">
            <div className="cod-seg" role="tablist" aria-label="Period">
              {[30, 60, 90, 180].map((d) => (
                <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{d} d</button>
              ))}
            </div>
            <button className="skx-icon" onClick={() => refresh(true)} disabled={busy} aria-label="Osvježi iz Skyteca">
              {busy ? <Loader2 size={16} className="ad-spin" /> : <RefreshCw size={16} />}
            </button>
            <button className="skx-icon" onClick={exportCsv} disabled={!data} aria-label="Preuzmi CSV prikazane liste">
              <Download size={16} />
            </button>
          </div>
        </header>

        {err && <div className="skx-banner"><AlertCircle size={16} /> {err}</div>}

        {!data ? (
          <div className="skx-group"><div className="skx-empty"><Loader2 size={20} className="ad-spin" /></div></div>
        ) : (
          <div className="skx-group">
            <button className="cod-hero cod-hero-btn" onClick={() => pick("za_podizanje")}>
              <div className="cod-hero-main">
                <span><Warehouse size={14} /> Čeka te u Živinicama</span>
                <b>{km(data.pipeline.za_podizanje.amount)}</b>
                <small>
                  {data.pipeline.za_podizanje.count
                    ? `${otkupnina(data.pipeline.za_podizanje.count)} spremno za podizanje`
                    : "Nema nepodignutih otkupnina"}
                </small>
              </div>
              <div className="cod-hero-side">
                <div><span>Preuzeto ({data.days} d)</span><b className="cod-plus">{km(data.pipeline.preuzeto.amount)}</b></div>
                <div><span>Kod kurira</span><b>{km(data.pipeline.kod_kurira.amount)}</b></div>
              </div>
            </button>
          </div>
        )}
      </section>

      {data && (
        <>
          {(data.alerts.noOtkupnina.length > 0 || data.alerts.longAtDepot.length > 0) && (
            <div className="cod-alerts">
              {data.alerts.noOtkupnina.length > 0 && (
                <button className="skx-note" onClick={() => showAlert("ceka_obracun", data.alerts.noOtkupnina)}>
                  <AlertCircle size={15} />
                  <span><b>{plural(data.alerts.noOtkupnina.length, "paket", "paketa", "paketa")} dostavljeno prije više od 3 dana</b>, a Skytec još nije napravio otkupninu. Provjeri sa Skytecom.</span>
                </button>
              )}
              {data.alerts.longAtDepot.length > 0 && (
                <button className="skx-note" onClick={() => showAlert("za_podizanje", data.alerts.longAtDepot)}>
                  <AlertCircle size={15} />
                  <span><b>{otkupnina(data.alerts.longAtDepot.length)} čeka u magacinu duže od 7 dana.</b> Podigni ih pri sljedećem odlasku.</span>
                </button>
              )}
            </div>
          )}

          <SheetCheck onMarked={() => load(days)} toast={setToast} />

          {/* ── Filters ─────────────────────────────────────────── */}
          <section className="skx-section">
            <div className="cod-chips" role="tablist" aria-label="Status otkupnine">
              {STAGES.map((s) => (
                <button key={s.key} className={`cod-chip ${s.tone}${stage === s.key ? " on" : ""}`} onClick={() => pick(s.key)}>
                  <span className="cod-dot" />
                  {s.short}
                  <em>{data.pipeline[s.key].count}</em>
                </button>
              ))}
              <button className={`cod-chip${stage === "sve" ? " on" : ""}`} onClick={() => pick("sve")}>
                Sve <em>{data.parcels.length}</em>
              </button>
            </div>
            <div className="cod-filters">
              <label className="cod-search">
                <Search size={15} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kupac, telefon, narudžba, šifra…" />
              </label>
              <select value={prod} onChange={(e) => setProd(e.target.value)} aria-label="Proizvod">
                <option value="">Svi proizvodi</option>
                {products.map((p) => <option key={p || "-"} value={p || "-"}>{p ? productOf(p) : "Napravljeno u Skytecu"}</option>)}
              </select>
            </div>
            {onlyOrders && (
              <div className="cod-dayfilter warn">
                Prikazano samo ono iz upozorenja ({onlyOrders.size})
                <button onClick={() => setOnlyOrders(null)}>Ukloni</button>
              </div>
            )}
            {pickDay && (
              <div className="cod-dayfilter">
                Preuzeto {prettyDay(pickDay).toLowerCase()} ({dmy(pickDay)})
                <button onClick={() => setPickDay(null)}>Ukloni</button>
              </div>
            )}

            {/* ── List ──────────────────────────────────────────── */}
            <div className="skx-group">
              <div className="cod-listhead">
                <span>{stage === "sve" ? "Sve otkupnine" : STAGE_BY_KEY[stage].hint}</span>
                <span className="cod-listhead-end">
                  <b>{otkupnina(list.length)} · {km(listSum)}</b>
                  {stage === "za_podizanje" && list.length > 0 && (
                    <button className="skx-btn sm" onClick={() => printList(chosen.length ? chosen : list)}>
                      <Printer size={14} /> {chosen.length ? `Spisak (${chosen.length})` : "Spisak za podizanje"}
                    </button>
                  )}
                </span>
              </div>

              {list.length === 0 ? (
                <div className="skx-empty"><b>Nema otkupnina</b><span>Promijeni filter ili period.</span></div>
              ) : (
                <>
                  {selectable.length > 0 && (
                    <button className="skx-row skx-selectall" onClick={toggleAll}>
                      <Tick on={sel.size > 0 && sel.size === selectable.length} />
                      <span className="skx-row-main"><span className="skx-row-title">
                        {sel.size === selectable.length ? "Poništi odabir" : `Označi sve (${selectable.length})`}
                      </span></span>
                    </button>
                  )}
                  {list.map((p) => {
                    const selectableRow = canMark(p) || canUndo(p);
                    const s = STAGE_BY_KEY[p.stage];
                    const Row = selectableRow ? "button" : "div";
                    return (
                      <Row
                        key={p.order_number}
                        className={`skx-row${selectableRow ? "" : " static"}`}
                        {...(selectableRow ? { onClick: () => toggle(p.order_number) } : {})}
                      >
                        {selectableRow ? <Tick on={sel.has(p.order_number)} /> : <span className={`cod-dot ${s.tone}`} />}
                        <span className="skx-row-main">
                          <span className="skx-row-title">{p.ime ?? "—"}</span>
                          <span className="skx-row-sub">
                            {product(p)} · {p.linked ? p.order_number : `Skytec ${p.sky_sifra ?? ""}`}{p.grad ? ` · ${p.grad}` : ""}
                          </span>
                          {(p.stage === "za_podizanje" || p.stage === "ceka_obracun" || p.stage === "preuzeto") && <span className="skx-row-meta">
                            {p.cod_sifra ? `Otkupnina ${p.cod_sifra}` : "Otkupnina još nije napravljena"}
                            {p.delivered_at ? ` · dostavljeno ${dmy(p.delivered_at.slice(0, 10))}` : ""}
                          </span>}
                        </span>
                        <span className="skx-row-end">
                          <span className="skx-row-amt">{km(p.amount)}</span>
                          {p.stage === "preuzeto" ? (
                            <span className="skx-row-meta ok">preuzeto {dmy(p.picked_at)}{p.picked_by_skytec ? " · Skytec" : ""}</span>
                          ) : p.waiting_days != null ? (
                            <span className={`cod-age${p.waiting_days > 14 ? " red" : p.waiting_days > 7 ? " orange" : ""}`}>čeka {dana(p.waiting_days)}</span>
                          ) : stage === "sve" ? (
                            <span className="skx-row-meta">{s.label}</span>
                          ) : null}
                        </span>
                      </Row>
                    );
                  })}
                </>
              )}

              {chosen.length > 0 && (
                <div className="skx-actionbar cod-actionbar">
                  <div className="skx-actionbar-info">
                    <b>{otkupnina(chosen.length)} · {km(chosenSum)}</b>
                    <span>
                      {undoMode ? "Vrati u „Za podizanje“ ako si pogrešno označio"
                        : !receivedOk ? "Neispravan iznos"
                        : receivedNum == null ? "Upiši koliko si dobio, pa uporedimo"
                        : diff === 0 ? "Iznos se slaže"
                        : `Razlika ${diff > 0 ? "+" : "−"}${km(Math.abs(diff))} (${diff > 0 ? "dobio si više" : "fali"})`}
                    </span>
                  </div>
                  <div className="skx-actionbar-btns">
                    {undoMode ? (
                      <button className="skx-btn danger" onClick={() => save(true)} disabled={saving}>
                        {saving ? <Loader2 size={16} className="ad-spin" /> : <Undo2 size={16} />} Poništi preuzimanje
                      </button>
                    ) : (
                      <>
                        <label className={`cod-date${receivedNum != null && diff !== 0 ? " bad" : receivedNum != null && receivedOk ? " good" : ""}`}>
                          <span>Dobio sam</span>
                          <input inputMode="decimal" placeholder={markSum.toFixed(2).replace(".", ",")} value={received}
                            onChange={(e) => setReceived(e.target.value)} aria-label="Stvarno dobijeni iznos u KM" />
                        </label>
                        <label className="cod-date">
                          <span>Datum</span>
                          <input type="date" value={date} max={todayStr()} onChange={(e) => e.target.value && setDate(e.target.value)} />
                        </label>
                        <button className="skx-btn primary" onClick={() => save(false)} disabled={saving || !chosen.some(canMark) || !receivedOk}>
                          {saving ? <Loader2 size={16} className="ad-spin" /> : <Check size={16} />} Preuzeo sam
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Pickups by day ───────────────────────────────── */}
          <section className="skx-section">
            <header className="skx-section-head">
              <div><h2>Preuzimanja po danima</h2><p>Uporedi sa potpisanim spiskom iz magacina</p></div>
            </header>
            <div className="skx-group">
              {data.pickups.length === 0 ? (
                <div className="skx-empty"><b>Još ništa nije označeno kao preuzeto</b><span>Odaberi otkupnine u „Za podizanje“ i klikni „Preuzeo sam“.</span></div>
              ) : data.pickups.map((g) => (
                <div key={g.date} className="sc-pick">
                <button className="skx-row" onClick={() => { setStage("preuzeto"); setPickDay(g.date); }}>
                  <span className="skx-row-main">
                    <span className="skx-row-title">{prettyDay(g.date)}</span>
                    <span className="skx-row-sub">{dmy(g.date)} · {otkupnina(g.count)}</span>
                  </span>
                  <span className="skx-row-end">
                    <span className="skx-row-amt cod-plus">{km(g.total)}</span>
                    {g.received != null && (Math.abs(g.received - g.total) < 0.01
                      ? <span className="skx-row-meta ok">dobijeno, slaže se</span>
                      : <span className="skx-row-meta cod-neg">dobijeno {km(g.received)} ({g.received > g.total ? "+" : "−"}{km(Math.abs(g.received - g.total))})</span>)}
                  </span>
                </button>
                {g.photos?.length > 0 && (
                  <div className="sc-photos">
                    {g.photos.map((u, i) => (
                      <a key={u} href={u} target="_blank" rel="noreferrer" title={`Specifikacija, strana ${i + 1}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt={`Specifikacija ${i + 1}`} />
                      </a>
                    ))}
                  </div>
                )}
                </div>
              ))}
            </div>
          </section>

          {data.mismatches.length > 0 && (
            <section className="skx-section">
              <header className="skx-section-head">
                <div><h2>Neslaganja</h2><p>Preuzeti iznos se razlikuje od otkupnine na paketu</p></div>
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
        </>
      )}
    </div>
  );
}
