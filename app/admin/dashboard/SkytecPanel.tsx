"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Send, Printer, RefreshCw, Loader2, Phone, AlertTriangle, Truck, Banknote,
  Clock, Undo2, ChevronDown, X, Webhook, CheckCircle2,
} from "lucide-react";
import { PRODUCTS } from "@/lib/export-products";
import "./skytec.css";

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
  overdue: Ship[];
  shipments: Ship[];
};

type SendResult = { order_number: string; ime: string; ok: boolean; sifra?: string; error?: string };

type Setup = {
  env: { apiKey: boolean; webhookSecret: boolean; cronSecret: boolean; server: "test" | "prod" };
  webhook: { callbackUrl?: string } | null;
  error?: string;
};

const STATES: { key: string; label: string; color: string }[] = [
  { key: "najava", label: "U najavi", color: "#a1a1a6" },
  { key: "preuzeto", label: "Preuzeto", color: "#64d2ff" },
  { key: "u_dostavi", label: "U dostavi", color: "#0a84ff" },
  { key: "odgodjena", label: "Odgođena", color: "#ff9f0a" },
  { key: "sporna", label: "Sporna", color: "#ff9f0a" },
  { key: "dostavljena", label: "Dostavljena", color: "#30d158" },
  { key: "vracena", label: "Vraćena", color: "#ff453a" },
  { key: "povrat_dostavljen", label: "Povrat stigao", color: "#ff453a" },
  { key: "otkazana", label: "Otkazana", color: "#6e6e73" },
];
const STATE_BY_KEY = Object.fromEntries(STATES.map((s) => [s.key, s]));

const PREFIX_LABEL: Record<string, string> = {};
for (const p of PRODUCTS) for (const pre of p.prefixes ?? []) PREFIX_LABEL[pre] = p.label;

function km(n: number) {
  return `${(Number(n) || 0).toLocaleString("bs-BA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`;
}
/** Bosnian plural: 1 paket, 2–4 paketa, 5+ paketa (11–14 → paketa). */
function paketa(n: number) {
  const d = n % 10, h = n % 100;
  return `${n} ${d === 1 && h !== 11 ? "paket" : "paketa"}`;
}

function when(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("bs-BA", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Sarajevo",
  });
}

function StateBadge({ state }: { state: string }) {
  const s = STATE_BY_KEY[state] ?? { label: state, color: "#a1a1a6" };
  return (
    <span className="sk-badge" style={{ color: s.color, background: `${s.color}22` }}>
      <span className="dot" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

async function downloadBlob(res: Response, name: string) {
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ShipRow({ s, onCancel }: { s: Ship; onCancel: (o: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hist, setHist] = useState<{ track: { datum?: string; naziv?: string; centar?: string }[] } | null>(null);

  const toggle = async () => {
    setOpen((v) => !v);
    if (!hist) {
      const r = await fetch(`/api/admin/skytec/track?order=${encodeURIComponent(s.order_number)}`);
      setHist(r.ok ? await r.json() : { track: [] });
    }
  };

  return (
    <div className={`sk-row${open ? " is-open" : ""}`}>
      <button className="sk-row-main" onClick={toggle}>
        <div className="sk-row-who">
          <b>{s.ime ?? "—"}</b>
          <span>
            {s.grad ?? ""} · {PREFIX_LABEL[s.product_prefix ?? ""] ?? s.product_prefix} · {s.order_number}
          </span>
        </div>
        <div className="sk-row-right">
          <StateBadge state={s.state} />
          <span className="sk-row-sum">
            {km(s.cod_amount)}
            {s.cod_paid_at ? <em className="paid">isplaćeno</em> : null}
          </span>
        </div>
        <ChevronDown size={16} className="sk-chev" />
      </button>
      {open && (
        <div className="sk-row-body">
          <div className="sk-kv">
            <span>Pošiljka</span><b>{s.sky_sifra ?? "—"}</b>
            <span>Zadnja promjena</span><b>{when(s.state_at)}</b>
            {s.state_note ? (<><span>Razlog</span><b>{s.state_note}</b></>) : null}
            <span>Telefon</span>
            <b>{s.telefon ? <a href={`tel:${s.telefon.replace(/\s/g, "")}`}>{s.telefon}</a> : "—"}</b>
          </div>
          {hist === null ? (
            <div className="sk-muted"><Loader2 size={14} className="ad-spin" /> Učitavam historiju…</div>
          ) : hist.track.length === 0 ? (
            <div className="sk-muted">Skytec još nema događaja za ovu pošiljku.</div>
          ) : (
            <ol className="sk-track">
              {hist.track.map((t, i) => (
                <li key={i}>
                  <b>{t.naziv}</b>
                  <span>{t.datum ? when(t.datum.replace(/([+-]\d{2})(\d{2})$/, "$1:$2")) : ""}{t.centar ? ` · ${t.centar}` : ""}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="sk-row-actions">
            {s.tracking_url && <a className="sk-link" href={s.tracking_url} target="_blank" rel="noreferrer">Skytec tracking</a>}
            {s.state === "najava" && s.sky_sifra && (
              <button className="sk-cancel" onClick={() => onCancel(s.order_number)}>
                <X size={14} /> Otkaži pošiljku
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkytecPanel() {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });
  const [product, setProduct] = useState("svi");
  const [date, setDate] = useState(today);
  const [format, setFormat] = useState<"A4" | "A410" | "60MM">("A4");
  const [busy, setBusy] = useState<"send" | "labels" | "sync" | "webhook" | "import" | null>(null);
  const [data, setData] = useState<Overview | null>(null);
  const [loadErr, setLoadErr] = useState<{ msg: string; migration?: boolean } | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [sendRes, setSendRes] = useState<{ sent: number; failed: number; skipped: number; results: SendResult[] } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    try { if (localStorage.getItem("sk-help-hidden") === "1") setShowHelp(false); } catch { /* ignore */ }
  }, []);
  const hideHelp = () => {
    setShowHelp(false);
    try { localStorage.setItem("sk-help-hidden", "1"); } catch { /* ignore */ }
  };

  const load = useCallback(async () => {
    const [o, w] = await Promise.all([
      fetch("/api/admin/skytec/overview").then(async (r) => ({ ok: r.ok, j: await r.json().catch(() => ({})) })),
      fetch("/api/admin/skytec/webhook").then((r) => r.json()).catch(() => null),
    ]);
    if (o.ok) { setData(o.j); setLoadErr(null); }
    else setLoadErr({ msg: o.j.error ?? "Greška", migration: o.j.needsMigration });
    setSetup(w);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 7000); };

  const send = async () => {
    const label = product === "svi" ? "sve proizvode" : PRODUCTS.find((p) => p.key === product)?.label;
    if (!confirm(`Poslati narudžbe od ${date} (${label}) u Skytec?\n\nKurir će doći po ove pakete. Ne šalji iste narudžbe i Excelom.`)) return;
    setBusy("send"); setSendRes(null);
    try {
      const r = await fetch("/api/admin/skytec/announce", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, date }),
      });
      const j = await r.json();
      if (!r.ok) flash(j.error ?? "Greška pri slanju.");
      else { setSendRes(j); await load(); }
    } finally { setBusy(null); }
  };

  const labels = async () => {
    setBusy("labels");
    try {
      const r = await fetch(`/api/admin/skytec/labels?date=${date}&product=${encodeURIComponent(product)}&format=${format}`);
      if (!r.ok) flash((await r.json().catch(() => ({}))).error ?? "Greška pri naljepnicama.");
      else await downloadBlob(r, `Skytec_naljepnice_${date}.pdf`);
    } finally { setBusy(null); }
  };

  const describeImport = (j: { imported?: { imported: number; matched: number; unmatched: number; remittances: number } | null; importError?: string | null }) => {
    if (j.importError) return `Greška pri uvozu: ${j.importError}`;
    const i = j.imported;
    if (!i) return "Gotovo.";
    if (i.imported === 0) return "Sve je već ažurno — nema novih pošiljki.";
    return `Uvezeno ${i.imported} pošiljki (${i.matched} povezano s narudžbom${i.unmatched ? `, ${i.unmatched} bez narudžbe` : ""}).`;
  };

  const sync = async () => {
    setBusy("sync");
    try {
      const r = await fetch("/api/admin/skytec/sync", { method: "POST" });
      const j = await r.json();
      flash(r.ok ? `${describeImport(j)} Statusi: ${j.status.changed} promjena.` : j.error ?? "Greška.");
      await load();
    } finally { setBusy(null); }
  };

  const importOld = async () => {
    setBusy("import");
    try {
      const r = await fetch("/api/admin/skytec/import", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days: 60 }),
      });
      const j = await r.json();
      flash(r.ok ? describeImport({ imported: j }) : j.error ?? "Greška.");
      await load();
    } finally { setBusy(null); }
  };

  const registerWebhook = async () => {
    setBusy("webhook");
    try {
      const r = await fetch("/api/admin/skytec/webhook", { method: "POST" });
      const j = await r.json();
      flash(r.ok ? "Spojeno — Skytec će sam javljati statuse." : j.error ?? "Greška.");
      await load();
    } finally { setBusy(null); }
  };

  const cancel = async (order: string) => {
    if (!confirm(`Otkazati Skytec pošiljku ${order}?`)) return;
    const r = await fetch("/api/admin/skytec/cancel", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order }),
    });
    const j = await r.json();
    flash(r.ok ? "Pošiljka otkazana." : j.error ?? "Greška.");
    await load();
  };

  const list = useMemo(() => {
    const all = data?.shipments ?? [];
    return filter === "all" ? all : all.filter((s) => s.state === filter);
  }, [data, filter]);

  const k = data?.kpi;
  const envMissing = setup && (!setup.env.apiKey || !setup.env.webhookSecret || !setup.env.cronSecret);
  const connected = Boolean(setup?.webhook?.callbackUrl);

  return (
    <div className="ad-panel sk">
      {toast && <div className="sk-toast" onClick={() => setToast(null)}>{toast}</div>}

      {(envMissing || loadErr) && (
        <div className="sk-setup">
          <AlertTriangle size={18} />
          <div>
            <b>Skytec još nije potpuno podešen</b>
            {loadErr?.migration && <p>Pokreni <code>supabase-skytec-migration.sql</code> u Supabase SQL Editoru.</p>}
            {loadErr && !loadErr.migration && <p>{loadErr.msg}</p>}
            {setup && !setup.env.apiKey && <p>Dodaj <code>SKYTEC_API_KEY</code> u Vercel env varijable.</p>}
            {setup && !setup.env.webhookSecret && <p>Dodaj <code>SKYTEC_WEBHOOK_SECRET</code>.</p>}
            {setup && !setup.env.cronSecret && <p>Dodaj <code>CRON_SECRET</code>.</p>}
          </div>
        </div>
      )}

      {/* ── How it works ─────────────────────────────────────── */}
      {showHelp && (
        <div className="sk-card sk-help">
          <div className="sk-head">
            <h2>Kako ovo radi</h2>
            <button className="sk-x" onClick={hideHelp} aria-label="Sakrij uputstvo"><X size={16} /></button>
          </div>
          <ol className="sk-steps">
            <li><b>Izaberi dan</b><span>Datum narudžbi koje danas pakuješ.</span></li>
            <li><b>Pošalji u Skytec</b><span>Zamjena za Excel. Skytec dobije pakete i kurir dolazi po njih.</span></li>
            <li><b>Printaj naljepnice</b><span>Zalijepi ih na pakete prije nego kurir dođe.</span></li>
          </ol>
          <p className="sk-help-foot">
            Sve ostalo ide samo: statusi paketa i uplate otkupnina ažuriraju se automatski. Pakete poslane preko
            Skytec web klijenta ili Excela sistem svako jutro sam povuče i poveže s narudžbom.
          </p>
        </div>
      )}

      {/* ── Daily send ───────────────────────────────────────── */}
      <div className="ad-toolbar">
        <div className="sk-head">
          <h2>Današnje slanje</h2>
          {setup?.env.apiKey && (
            <span className={`sk-conn${connected ? " ok" : ""}`}>
              <span className="dot" />
              {connected ? "Spojeno sa Skytecom" : "Statusi nisu spojeni"}
            </span>
          )}
        </div>
        <div className="sk-send-grid">
          <label className="sk-field">
            <span>Proizvod</span>
            <select value={product} onChange={(e) => setProduct(e.target.value)}>
              <option value="svi">Svi proizvodi</option>
              {PRODUCTS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </label>
          <label className="sk-field">
            <span>Datum narudžbi</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <button className="sk-primary" onClick={send} disabled={busy !== null}>
            {busy === "send" ? <Loader2 className="ad-spin" size={16} /> : <Send size={16} />}
            Pošalji u Skytec
          </button>
          <button className="sk-secondary" onClick={labels} disabled={busy !== null}>
            {busy === "labels" ? <Loader2 className="ad-spin" size={16} /> : <Printer size={16} />}
            Printaj naljepnice
          </button>
        </div>
        <label className="sk-paper">
          Papir za naljepnice:
          <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
            <option value="A4">A4, 4 po strani</option>
            <option value="A410">A4, 10 po strani</option>
            <option value="60MM">Termalni printer 60mm</option>
          </select>
        </label>

        {sendRes && (
          <div className="sk-send">
            <p>
              <CheckCircle2 size={15} />
              {sendRes.sent ? <>Poslano: <b>{paketa(sendRes.sent)}</b>.</> : <>Ništa novo za poslati.</>}
              {sendRes.skipped ? <> {sendRes.skipped} je već ranije poslano.</> : null}
              {sendRes.failed ? <> <span className="bad">{sendRes.failed} nije prošlo — popravi adresu i pošalji ponovo:</span></> : null}
            </p>
            {sendRes.results.filter((r) => !r.ok).map((r) => (
              <div key={r.order_number} className="sk-send-err">
                <b>{r.ime}</b> <span>{r.order_number}</span>
                <em>{r.error}</em>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Money ────────────────────────────────────────────── */}
      <div className="sk-section-title">Novac od otkupnina <span>zadnjih 60 dana</span></div>
      <div className="sk-kpis">
        <div className="ad-stat">
          <div className="ad-stat-top"><p className="ad-stat-label">Kod kupaca</p><span className="ad-stat-ico sk-i-blue"><Truck size={15} /></span></div>
          <p className="ad-stat-value">{k ? km(k.onFieldAmount) : "—"}</p>
          <p className="ad-stat-sub">{k ? `${paketa(k.onFieldCount)} u putu — još nije naplaćeno` : ""}</p>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-top"><p className="ad-stat-label">Kod Skyteca</p><span className="ad-stat-ico sk-i-orange"><Clock size={15} /></span></div>
          <p className="ad-stat-value">{k ? km(k.deliveredUnpaidAmount) : "—"}</p>
          <p className={`ad-stat-sub${k && k.overdueCount ? " sk-warn" : ""}`}>
            {k ? (k.overdueCount
              ? `${paketa(k.overdueCount)} čeka uplatu duže od 7 dana`
              : `${paketa(k.deliveredUnpaidCount)} dostavljeno, čeka se uplata`) : ""}
          </p>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-top"><p className="ad-stat-label">Uplaćeno tebi</p><span className="ad-stat-ico sk-i-green"><Banknote size={15} /></span></div>
          <p className="ad-stat-value">{k ? km(k.paid30) : "—"}</p>
          <p className="ad-stat-sub">zadnjih 30 dana, na račun</p>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-top"><p className="ad-stat-label">Odbijeni paketi</p><span className="ad-stat-ico sk-i-red"><Undo2 size={15} /></span></div>
          <p className="ad-stat-value">{k?.returnRate != null ? `${(k.returnRate * 100).toFixed(1)}%` : "—"}</p>
          <p className="ad-stat-sub">{k ? (k.finishedCount ? `${k.returnedCount} od ${k.finishedCount} kupac nije preuzeo` : "još nema završenih paketa") : ""}</p>
        </div>
      </div>

      {/* ── Needs a call ─────────────────────────────────────── */}
      {data && data.alerts.length > 0 && (
        <div className="sk-card sk-alerts">
          <div className="sk-head">
            <h2><Phone size={15} /> Nazovi ove kupce</h2>
            <span>{data.alerts.length}</span>
          </div>
          <p className="sk-hint">Kurir ih nije zatekao ili je dostava odgođena. Jedan poziv često spasi paket od povrata.</p>
          {data.alerts.map((s) => (
            <div key={s.order_number} className="sk-alert">
              <div>
                <b>{s.ime}</b> <StateBadge state={s.state} />
                <p>{s.state_note || "Razlog nije naveden"} · {s.grad} · {km(s.cod_amount)}</p>
              </div>
              {s.telefon && <a className="sk-call" href={`tel:${s.telefon.replace(/\s/g, "")}`}><Phone size={14} /> {s.telefon}</a>}
            </div>
          ))}
        </div>
      )}

      {/* ── Per product ──────────────────────────────────────── */}
      {data && data.byProduct.length > 0 && (
        <div className="sk-card">
          <div className="sk-head"><h2>Koliko se paketa vraća, po proizvodu</h2><span>60 dana</span></div>
          <div className="sk-prod-head"><span>Proizvod</span><span>Poslano</span><span>Preuzeto</span><span>Vraćeno</span><span>% povrata</span></div>
          {data.byProduct.map((p) => {
            const fin = p.delivered + p.returned;
            const rate = fin ? p.returned / fin : null;
            return (
              <div key={p.prefix} className="sk-prod">
                <b>{p.prefix === "?" ? "Bez narudžbe" : PREFIX_LABEL[p.prefix] ?? p.prefix}</b>
                <span>{p.sent}</span>
                <span>{p.delivered}</span>
                <span>{p.returned}</span>
                <span className={rate != null && rate > 0.2 ? "bad" : ""}>{rate != null ? `${(rate * 100).toFixed(0)}%` : "—"}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Shipments ────────────────────────────────────────── */}
      <div className="sk-section-title">Paketi <span>klikni na paket za detalje</span></div>
      <div className="ad-filters">
        <button className={`ad-chip${filter === "all" ? " is-on" : ""}`} onClick={() => setFilter("all")}>
          Svi {data ? `(${data.shipments.length})` : ""}
        </button>
        {STATES.filter((s) => data?.byState[s.key]).map((s) => (
          <button key={s.key} className={`ad-chip${filter === s.key ? " is-on" : ""}`} onClick={() => setFilter(s.key)}>
            <span className="dot" style={{ background: s.color }} />
            {s.label} ({data!.byState[s.key]})
          </button>
        ))}
      </div>

      <div className="sk-list">
        {!data && !loadErr ? (
          <div className="ad-empty">Učitavanje…</div>
        ) : list.length === 0 ? (
          <div className="sk-empty">
            <b>Još nema paketa ovdje</b>
            <p>Povuci pakete koje si već poslao Skytecu (zadnjih 60 dana) — sistem ih poveže s narudžbama po broju telefona.</p>
            <button className="sk-primary" onClick={importOld} disabled={busy !== null}>
              {busy === "import" ? <Loader2 className="ad-spin" size={16} /> : <RefreshCw size={16} />}
              Povuci dosadašnje pakete
            </button>
          </div>
        ) : (
          list.map((s) => <ShipRow key={s.order_number} s={s} onCancel={cancel} />)
        )}
      </div>

      {/* ── Advanced ─────────────────────────────────────────── */}
      <details className="sk-adv">
        <summary>Napredno</summary>
        <div className="sk-adv-body">
          <div className="sk-adv-row">
            <div><b>Osvježi odmah</b><p>Inače se radi samo svako jutro. Povuče nove pakete, statuse i uplate.</p></div>
            <button className="sk-secondary" onClick={sync} disabled={busy !== null}>
              {busy === "sync" ? <Loader2 className="ad-spin" size={16} /> : <RefreshCw size={16} />} Osvježi
            </button>
          </div>
          <div className="sk-adv-row">
            <div><b>Povuci pakete za zadnjih 60 dana</b><p>Za pakete poslane preko Skytec web klijenta ili Excela.</p></div>
            <button className="sk-secondary" onClick={importOld} disabled={busy !== null}>
              {busy === "import" ? <Loader2 className="ad-spin" size={16} /> : <RefreshCw size={16} />} Povuci
            </button>
          </div>
          {setup?.env.apiKey && (
            <div className="sk-adv-row">
              <div>
                <b>Automatski statusi</b>
                <p>{connected ? <>Skytec javlja promjene na <code>{setup.webhook!.callbackUrl}</code></> : "Nije spojeno — Skytec neće sam javljati promjene."}</p>
              </div>
              <button className="sk-secondary" onClick={registerWebhook} disabled={busy !== null}>
                {busy === "webhook" ? <Loader2 className="ad-spin" size={16} /> : <Webhook size={16} />}
                {connected ? "Spoji ponovo" : "Spoji"}
              </button>
            </div>
          )}
          {!showHelp && (
            <button className="sk-link-btn" onClick={() => { setShowHelp(true); try { localStorage.removeItem("sk-help-hidden"); } catch { /* ignore */ } }}>
              Prikaži uputstvo „Kako ovo radi“
            </button>
          )}
        </div>
      </details>
    </div>
  );
}
