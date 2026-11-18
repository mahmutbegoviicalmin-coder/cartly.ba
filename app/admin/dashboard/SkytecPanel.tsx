"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, ChevronDown, Check, Loader2, Send, Printer, Phone,
  RefreshCw, Link2, AlertCircle, X, Package,
} from "lucide-react";
import { PRODUCTS } from "@/lib/export-products";
import "./skytec.css";

// ── Types ────────────────────────────────────────────────────────────────────

type DayOrder = {
  order_number: string; ime: string; grad: string; telefon: string; ukupno: number;
  opis: string; ptt: string | null; sent: boolean; sky_sifra: string | null; state: string | null;
};

type Ship = {
  order_number: string; order_date: string | null; product_prefix: string | null;
  ime: string | null; telefon: string | null; grad: string | null; sky_sifra: string | null;
  cod_amount: number; state: string; state_label: string | null; state_note: string | null;
  state_at: string | null; tracking_url: string | null; cod_paid_at: string | null; created_at: string;
};

type Overview = {
  kpi: {
    onFieldCount: number; onFieldAmount: number;
    deliveredUnpaidCount: number; deliveredUnpaidAmount: number;
    overdueCount: number; overdueAmount: number;
    paid30: number; returnRate: number | null; returnedCount: number; finishedCount: number;
  };
  byState: Record<string, number>;
  byProduct: { prefix: string; sent: number; delivered: number; returned: number; open: number }[];
  alerts: Ship[];
  shipments: Ship[];
};

type SendResult = { order_number: string; ime: string; ok: boolean; sifra?: string; error?: string };

type Setup = {
  env: { apiKey: boolean; webhookSecret: boolean; cronSecret: boolean; server: "test" | "prod" };
  webhook: { callbackUrl?: string } | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATES: { key: string; label: string; tone: "gray" | "blue" | "orange" | "green" | "red" }[] = [
  { key: "najava", label: "U najavi", tone: "gray" },
  { key: "preuzeto", label: "Preuzeto", tone: "blue" },
  { key: "u_dostavi", label: "U dostavi", tone: "blue" },
  { key: "odgodjena", label: "Odgođena", tone: "orange" },
  { key: "sporna", label: "Sporna", tone: "orange" },
  { key: "dostavljena", label: "Dostavljena", tone: "green" },
  { key: "vracena", label: "Vraćena", tone: "red" },
  { key: "povrat_dostavljen", label: "Povrat stigao", tone: "red" },
  { key: "otkazana", label: "Otkazana", tone: "gray" },
];
const STATE_BY_KEY = Object.fromEntries(STATES.map((s) => [s.key, s]));

const PREFIX_LABEL: Record<string, string> = {};
for (const p of PRODUCTS) for (const pre of p.prefixes ?? []) PREFIX_LABEL[pre] = p.label;
const productOf = (prefix: string | null) => (prefix ? PREFIX_LABEL[prefix] ?? prefix : "Bez narudžbe");

/** 1234.5 → "1.234,50 KM" (written by hand: browsers lack a bs-BA locale). */
function km(n: number) {
  const [int, dec] = (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec} KM`;
}

const DAYS = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];
const MONTHS = ["januar", "februar", "mart", "april", "maj", "juni", "juli", "august", "septembar", "oktobar", "novembar", "decembar"];

function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10, h = n % 100;
  if (d === 1 && h !== 11) return `${n} ${one}`;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}
const paket = (n: number) => plural(n, "paket", "paketa", "paketa");
const narudzba = (n: number) => plural(n, "narudžba", "narudžbe", "narudžbi");

function when(iso: string | null) {
  if (!iso) return "—";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Sarajevo",
    }).formatToParts(new Date(iso)).map((x) => [x.type, x.value])
  );
  return `${p.day}.${p.month}. u ${p.hour}:${p.minute}`;
}

const todayStr = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });

function shiftDay(d: string, by: number) {
  const t = new Date(`${d}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() + by);
  return t.toISOString().slice(0, 10);
}

function prettyDay(d: string) {
  if (d === todayStr()) return "Danas";
  if (d === shiftDay(todayStr(), -1)) return "Jučer";
  const t = new Date(`${d}T12:00:00Z`);
  return `${DAYS[t.getUTCDay()]}, ${t.getUTCDate()}. ${MONTHS[t.getUTCMonth()]}`;
}

async function downloadBlob(res: Response, name: string) {
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Pill({ state }: { state: string }) {
  const s = STATE_BY_KEY[state] ?? { label: state, tone: "gray" };
  return <span className={`skx-pill ${s.tone}`}>{s.label}</span>;
}

function Tick({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <span className={`skx-tick${on ? " on" : ""}${disabled ? " off" : ""}`} aria-hidden>
      {on && <Check size={13} strokeWidth={3} />}
    </span>
  );
}

// ── Shipment row (history list) ──────────────────────────────────────────────

function ShipRow({ s, onCancel }: { s: Ship; onCancel: (o: string) => void }) {
  const [open, setOpen] = useState(false);
  const [track, setTrack] = useState<{ datum?: string; naziv?: string; centar?: string }[] | null>(null);

  const toggle = async () => {
    setOpen((v) => !v);
    if (!track) {
      const r = await fetch(`/api/admin/skytec/track?order=${encodeURIComponent(s.order_number)}`);
      setTrack(r.ok ? (await r.json()).track ?? [] : []);
    }
  };

  return (
    <div className={`skx-ship${open ? " open" : ""}`}>
      <button className="skx-row" onClick={toggle}>
        <span className="skx-row-main">
          <span className="skx-row-title">{s.ime ?? "—"}</span>
          <span className="skx-row-sub">{s.grad ?? ""} · {productOf(s.product_prefix)}</span>
        </span>
        <span className="skx-row-end">
          <Pill state={s.state} />
          <span className="skx-row-amt">
            {km(s.cod_amount)}
            {s.cod_paid_at && <em>uplaćeno</em>}
          </span>
        </span>
        <ChevronDown size={16} className="skx-chev" />
      </button>
      {open && (
        <div className="skx-ship-body">
          <dl className="skx-dl">
            <dt>Narudžba</dt><dd>{s.order_number.startsWith("SKY-") ? "—" : s.order_number}</dd>
            <dt>Pošiljka</dt><dd>{s.sky_sifra ?? "—"}</dd>
            <dt>Zadnja promjena</dt><dd>{when(s.state_at)}</dd>
            {s.state_note && (<><dt>Razlog</dt><dd>{s.state_note}</dd></>)}
            <dt>Telefon</dt>
            <dd>{s.telefon ? <a href={`tel:${s.telefon.replace(/\s/g, "")}`}>{s.telefon}</a> : "—"}</dd>
          </dl>
          {track === null ? (
            <p className="skx-muted"><Loader2 size={14} className="ad-spin" /> Učitavam historiju</p>
          ) : track.length > 0 ? (
            <ol className="skx-track">
              {track.map((t, i) => (
                <li key={i}>
                  <span>{t.naziv}</span>
                  <small>{t.datum ? when(t.datum.replace(/([+-]\d{2})(\d{2})$/, "$1:$2")) : ""}{t.centar ? ` · ${t.centar}` : ""}</small>
                </li>
              ))}
            </ol>
          ) : (
            <p className="skx-muted">Skytec još nema događaja za ovaj paket.</p>
          )}
          {s.state === "najava" && s.sky_sifra && (
            <button className="skx-btn danger sm" onClick={() => onCancel(s.order_number)}>
              <X size={14} /> Otkaži pošiljku
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────

export default function SkytecPanel() {
  const [date, setDate] = useState(todayStr);
  const [day, setDay] = useState<DayOrder[] | null>(null);
  const [dayErr, setDayErr] = useState<string | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<"A4" | "A410" | "60MM">("A4");
  const [busy, setBusy] = useState<"send" | "labels" | "sync" | "webhook" | null>(null);
  const [result, setResult] = useState<{ sent: number; failed: number; results: SendResult[] } | null>(null);
  const [data, setData] = useState<Overview | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 6000); };

  const loadDay = useCallback(async (d: string) => {
    setDay(null); setDayErr(null);
    const r = await fetch(`/api/admin/skytec/day?date=${d}`);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setDayErr(j.error ?? "Greška pri učitavanju."); setDay([]); return; }
    const list = (j.orders ?? []) as DayOrder[];
    setDay(list);
    // Pre-select only for today / yesterday — older unsent orders may have gone with another courier.
    const recent = d >= shiftDay(todayStr(), -1);
    setSel(recent ? new Set(list.filter((o) => !o.sent && o.ptt).map((o) => o.order_number)) : new Set());
  }, []);

  const loadOverview = useCallback(async () => {
    const [o, w] = await Promise.all([
      fetch("/api/admin/skytec/overview").then(async (r) => ({ ok: r.ok, j: await r.json().catch(() => ({})) })),
      fetch("/api/admin/skytec/webhook").then((r) => r.json()).catch(() => null),
    ]);
    if (o.ok) { setData(o.j); setLoadErr(null); } else setLoadErr(o.j.error ?? "Greška");
    setSetup(w);
  }, []);

  useEffect(() => { setResult(null); loadDay(date); }, [date, loadDay]);
  useEffect(() => { loadOverview(); }, [loadOverview]);

  const unsent = useMemo(() => (day ?? []).filter((o) => !o.sent), [day]);
  const sentToday = useMemo(() => (day ?? []).filter((o) => o.sent), [day]);
  const selectable = useMemo(() => unsent.filter((o) => o.ptt), [unsent]);
  const chosen = useMemo(() => unsent.filter((o) => sel.has(o.order_number)), [unsent, sel]);
  const chosenSum = chosen.reduce((a, o) => a + Number(o.ukupno || 0), 0);
  const allOn = selectable.length > 0 && chosen.length === selectable.length;

  const toggle = (o: DayOrder) => {
    if (o.sent || !o.ptt) return;
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(o.order_number)) n.delete(o.order_number); else n.add(o.order_number);
      return n;
    });
  };
  const toggleAll = () => setSel(allOn ? new Set() : new Set(selectable.map((o) => o.order_number)));

  const send = async () => {
    if (chosen.length === 0) return;
    if (!confirm(`Ubaciti ${narudzba(chosen.length)} (${km(chosenSum)}) u Skytec web klijent?\n\nPošiljke se samo ubacuju. Najavu kuriru radiš ručno u web klijentu, kao i do sada.`)) return;
    setBusy("send"); setResult(null);
    try {
      const r = await fetch("/api/admin/skytec/announce", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "svi", date, orderNumbers: chosen.map((o) => o.order_number) }),
      });
      const j = await r.json();
      if (!r.ok) { flash(j.error ?? "Slanje nije uspjelo."); return; }
      await Promise.all([loadDay(date), loadOverview()]);
      setResult(j);
    } catch {
      flash("Nema veze sa serverom. Pokušaj ponovo.");
    } finally { setBusy(null); }
  };

  const printLabels = async () => {
    const orders = sentToday.map((o) => o.order_number);
    if (orders.length === 0) { flash("Za ovaj dan još nema poslanih paketa."); return; }
    setBusy("labels");
    try {
      const r = await fetch(`/api/admin/skytec/labels?date=${date}&format=${format}&orders=${encodeURIComponent(orders.join(","))}`);
      if (!r.ok) flash((await r.json().catch(() => ({}))).error ?? "Naljepnice nisu dostupne.");
      else await downloadBlob(r, `Skytec_naljepnice_${date}.pdf`);
    } finally { setBusy(null); }
  };

  const sync = async () => {
    setBusy("sync");
    try {
      const r = await fetch("/api/admin/skytec/sync", { method: "POST" });
      const j = await r.json();
      if (!r.ok) flash(j.error ?? "Greška.");
      else {
        const n = j.imported?.imported ?? 0;
        flash(n ? `Povučeno ${paket(n)} iz Skyteca.` : "Sve je ažurno.");
      }
      await Promise.all([loadDay(date), loadOverview()]);
    } finally { setBusy(null); }
  };

  const registerWebhook = async () => {
    setBusy("webhook");
    try {
      const r = await fetch("/api/admin/skytec/webhook", { method: "POST" });
      const j = await r.json();
      flash(r.ok ? "Povezano. Skytec će sam javljati statuse." : j.error ?? "Greška.");
      await loadOverview();
    } finally { setBusy(null); }
  };

  const cancel = async (order: string) => {
    if (!confirm(`Otkazati Skytec pošiljku ${order}?`)) return;
    const r = await fetch("/api/admin/skytec/cancel", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order }),
    });
    const j = await r.json();
    flash(r.ok ? "Pošiljka je otkazana." : j.error ?? "Greška.");
    await Promise.all([loadDay(date), loadOverview()]);
  };

  const ships = useMemo(() => {
    const all = data?.shipments ?? [];
    const f = filter === "all" ? all : all.filter((s) => s.state === filter);
    return showAll ? f : f.slice(0, 25);
  }, [data, filter, showAll]);
  const shipsTotal = filter === "all" ? data?.shipments.length ?? 0 : data?.byState[filter] ?? 0;

  const k = data?.kpi;
  const connected = Boolean(setup?.webhook?.callbackUrl);

  return (
    <div className="skx">
      {toast && <div className="skx-toast" role="status" onClick={() => setToast(null)}>{toast}</div>}

      {setup && !setup.env.apiKey && (
        <div className="skx-banner"><AlertCircle size={16} /> Skytec API ključ nije postavljen na serveru.</div>
      )}
      {loadErr && <div className="skx-banner"><AlertCircle size={16} /> {loadErr}</div>}

      {/* ── Send ─────────────────────────────────────────────── */}
      <section className="skx-section">
        <header className="skx-section-head">
          <div>
            <h2>Slanje u Skytec</h2>
            <p>Ubacuje pošiljke u Skytec web klijent. Najavu kuriru radiš ručno, kao i do sada.</p>
          </div>
          {setup?.env.apiKey && (
            <span className={`skx-status${connected ? " ok" : ""}`}>
              <i /> {connected ? "Povezano" : "Statusi nisu povezani"}
            </span>
          )}
        </header>

        <div className="skx-group">
          <div className="skx-daybar">
            <button className="skx-icon" onClick={() => setDate(shiftDay(date, -1))} aria-label="Prethodni dan">
              <ChevronLeft size={18} />
            </button>
            <label className="skx-daypick">
              <span>{prettyDay(date)}</span>
              <small>{date.split("-").reverse().map(Number).join(".")}.</small>
              <input type="date" value={date} max={todayStr()} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Izaberi datum" />
            </label>
            <button
              className="skx-icon"
              onClick={() => setDate(shiftDay(date, 1))}
              disabled={date >= todayStr()}
              aria-label="Sljedeći dan"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {day === null ? (
            <div className="skx-empty"><Loader2 size={20} className="ad-spin" /></div>
          ) : dayErr ? (
            <div className="skx-empty"><AlertCircle size={22} /><b>{dayErr}</b></div>
          ) : day.length === 0 ? (
            <div className="skx-empty">
              <Package size={24} strokeWidth={1.6} />
              <b>Nema narudžbi za ovaj dan</b>
              <span>Izaberi drugi datum strelicama iznad.</span>
            </div>
          ) : (
            <>
              {unsent.length > 0 && date < shiftDay(todayStr(), -1) && (
                <div className="skx-note">
                  <AlertCircle size={15} />
                  Stariji dan. Prije slanja provjeri da ove narudžbe nisu već otišle drugim kurirom.
                </div>
              )}
              {unsent.length > 0 && (
                <button className="skx-row skx-selectall" onClick={toggleAll} disabled={selectable.length === 0}>
                  <Tick on={allOn} disabled={selectable.length === 0} />
                  <span className="skx-row-main"><span className="skx-row-title">
                    {allOn ? "Odznači sve" : "Označi sve"}
                  </span></span>
                  <span className="skx-row-meta">{narudzba(unsent.length)} za slanje</span>
                </button>
              )}
              {day.map((o) => {
                const on = sel.has(o.order_number);
                const blocked = !o.sent && !o.ptt;
                return (
                  <button
                    key={o.order_number}
                    className={`skx-row skx-order${o.sent ? " is-sent" : ""}${blocked ? " is-blocked" : ""}`}
                    onClick={() => toggle(o)}
                    disabled={o.sent || blocked}
                  >
                    {o.sent ? (
                      <span className="skx-done" aria-hidden><Check size={13} strokeWidth={3} /></span>
                    ) : (
                      <Tick on={on} disabled={blocked} />
                    )}
                    <span className="skx-row-main">
                      <span className="skx-row-title">{o.ime}</span>
                      <span className="skx-row-sub">{o.grad} · {o.opis}</span>
                      {blocked && <span className="skx-row-warn">Nepoznat poštanski broj za „{o.grad}“. Popravi grad u narudžbi.</span>}
                    </span>
                    <span className="skx-row-end">
                      <span className="skx-row-amt">{km(o.ukupno)}</span>
                      {o.sent
                        ? <span className="skx-row-meta ok">{o.state && o.state !== "najava" ? STATE_BY_KEY[o.state]?.label : "Poslano"}</span>
                        : <span className="skx-row-meta">Nije poslano</span>}
                    </span>
                  </button>
                );
              })}
            </>
          )}

          {result && (
            <div className={`skx-result${result.failed ? " warn" : ""}`}>
              <b>{result.sent ? `Ubačeno: ${paket(result.sent)}. Otvori Skytec web klijent i najavi ih kad budeš spreman.` : "Ništa nije ubačeno."}</b>
              {result.results.filter((r) => !r.ok).map((r) => (
                <span key={r.order_number}>{r.ime}: {r.error}</span>
              ))}
            </div>
          )}

          {(day?.length ?? 0) > 0 && (
            <div className="skx-actionbar">
              <div className="skx-actionbar-info">
                {chosen.length ? (
                  <><b>{narudzba(chosen.length)}</b><span>{km(chosenSum)} otkupnine</span></>
                ) : (
                  <>
                    <b>{sentToday.length && !unsent.length ? "Sve je poslano" : "Ništa nije označeno"}</b>
                    <span>{sentToday.length ? `${paket(sentToday.length)} u Skytecu za ovaj dan` : "Označi narudžbe iznad"}</span>
                  </>
                )}
              </div>
              <div className="skx-actionbar-btns">
                <div className="skx-print">
                  <button className="skx-btn" onClick={printLabels} disabled={busy !== null || sentToday.length === 0}>
                    {busy === "labels" ? <Loader2 size={16} className="ad-spin" /> : <Printer size={16} />}
                    Naljepnice
                  </button>
                  <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} aria-label="Format naljepnica">
                    <option value="A4">A4 · 4</option>
                    <option value="A410">A4 · 10</option>
                    <option value="60MM">60 mm</option>
                  </select>
                </div>
                <button className="skx-btn primary" onClick={send} disabled={busy !== null || chosen.length === 0}>
                  {busy === "send" ? <Loader2 size={16} className="ad-spin" /> : <Send size={16} />}
                  Ubaci u Skytec{chosen.length ? ` (${chosen.length})` : ""}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Money ────────────────────────────────────────────── */}
      <section className="skx-section">
        <header className="skx-section-head"><div><h2>Otkupnine</h2><p>Zadnjih 60 dana</p></div></header>
        <div className="skx-group skx-metrics">
          <div className="skx-metric">
            <span>Kod kupaca</span>
            <b>{k ? km(k.onFieldAmount) : "—"}</b>
            <small>{k ? `${paket(k.onFieldCount)} u putu` : ""}</small>
          </div>
          <div className="skx-metric">
            <span>Kod Skyteca</span>
            <b>{k ? km(k.deliveredUnpaidAmount) : "—"}</b>
            <small className={k?.overdueCount ? "warn" : ""}>
              {k ? (k.overdueCount ? `${paket(k.overdueCount)} kasni više od 7 dana` : "dostavljeno, čeka uplatu") : ""}
            </small>
          </div>
          <div className="skx-metric">
            <span>Uplaćeno tebi</span>
            <b>{k ? km(k.paid30) : "—"}</b>
            <small>zadnjih 30 dana</small>
          </div>
          <div className="skx-metric">
            <span>Odbijeno</span>
            <b>{k?.returnRate != null ? `${(k.returnRate * 100).toFixed(1).replace(".", ",")} %` : "—"}</b>
            <small>{k ? `${k.returnedCount} od ${k.finishedCount} paketa` : ""}</small>
          </div>
        </div>
      </section>

      {/* ── Call list ────────────────────────────────────────── */}
      {data && data.alerts.length > 0 && (
        <section className="skx-section">
          <header className="skx-section-head">
            <div><h2>Nazovi kupca</h2><p>Dostava je odgođena. Poziv često spasi paket od povrata.</p></div>
          </header>
          <div className="skx-group">
            {data.alerts.map((s) => (
              <div key={s.order_number} className="skx-row static">
                <span className="skx-row-main">
                  <span className="skx-row-title">{s.ime}</span>
                  <span className="skx-row-sub">{s.state_note || STATE_BY_KEY[s.state]?.label} · {s.grad} · {km(s.cod_amount)}</span>
                </span>
                {s.telefon && (
                  <a className="skx-btn sm" href={`tel:${s.telefon.replace(/\s/g, "")}`}><Phone size={14} /> Nazovi</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Returns by product ───────────────────────────────── */}
      {data && data.byProduct.length > 0 && (
        <section className="skx-section">
          <header className="skx-section-head"><div><h2>Povrati po proizvodu</h2><p>Udio paketa koje kupac nije preuzeo</p></div></header>
          <div className="skx-group">
            {data.byProduct.map((p) => {
              const fin = p.delivered + p.returned;
              const rate = fin ? p.returned / fin : 0;
              return (
                <div key={p.prefix} className="skx-row static skx-prod">
                  <span className="skx-row-main">
                    <span className="skx-row-title">{productOf(p.prefix === "?" ? null : p.prefix)}</span>
                    <span className="skx-row-sub">{paket(p.sent)} · {p.returned} vraćeno</span>
                  </span>
                  <span className="skx-bar"><i style={{ width: `${Math.min(100, rate * 100)}%` }} className={rate > 0.2 ? "hi" : ""} /></span>
                  <span className={`skx-rate${rate > 0.2 ? " hi" : ""}`}>{fin ? `${Math.round(rate * 100)} %` : "—"}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Parcels ──────────────────────────────────────────── */}
      <section className="skx-section">
        <header className="skx-section-head"><div><h2>Paketi</h2><p>Dodirni paket za historiju dostave</p></div></header>
        <div className="skx-seg" role="tablist">
          <button className={filter === "all" ? "on" : ""} onClick={() => { setFilter("all"); setShowAll(false); }}>Svi</button>
          {STATES.filter((s) => data?.byState[s.key]).map((s) => (
            <button key={s.key} className={filter === s.key ? "on" : ""} onClick={() => { setFilter(s.key); setShowAll(false); }}>
              {s.label} <em>{data!.byState[s.key]}</em>
            </button>
          ))}
        </div>
        <div className="skx-group">
          {!data ? (
            <div className="skx-empty"><Loader2 size={20} className="ad-spin" /></div>
          ) : ships.length === 0 ? (
            <div className="skx-empty"><Package size={24} strokeWidth={1.6} /><b>Nema paketa</b></div>
          ) : (
            ships.map((s) => <ShipRow key={s.order_number} s={s} onCancel={cancel} />)
          )}
          {!showAll && shipsTotal > 25 && (
            <button className="skx-row skx-more" onClick={() => setShowAll(true)}>Prikaži sve ({shipsTotal})</button>
          )}
        </div>
      </section>

      {/* ── Maintenance ──────────────────────────────────────── */}
      <section className="skx-section">
        <div className="skx-group">
          <div className="skx-row static">
            <span className="skx-row-main">
              <span className="skx-row-title">Osvježi iz Skyteca</span>
              <span className="skx-row-sub">Radi se samo svako jutro. Povuče i pakete poslane preko web klijenta.</span>
            </span>
            <button className="skx-btn sm" onClick={sync} disabled={busy !== null}>
              {busy === "sync" ? <Loader2 size={14} className="ad-spin" /> : <RefreshCw size={14} />} Osvježi
            </button>
          </div>
          {setup?.env.apiKey && (
            <div className="skx-row static">
              <span className="skx-row-main">
                <span className="skx-row-title">Automatski statusi</span>
                <span className="skx-row-sub">{connected ? "Skytec javlja svaku promjenu statusa." : "Nije povezano."}</span>
              </span>
              <button className="skx-btn sm" onClick={registerWebhook} disabled={busy !== null}>
                {busy === "webhook" ? <Loader2 size={14} className="ad-spin" /> : <Link2 size={14} />}
                {connected ? "Poveži ponovo" : "Poveži"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
