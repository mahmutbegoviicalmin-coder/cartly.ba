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
  const [busy, setBusy] = useState<"send" | "labels" | "sync" | "webhook" | null>(null);
  const [data, setData] = useState<Overview | null>(null);
  const [loadErr, setLoadErr] = useState<{ msg: string; migration?: boolean } | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [sendRes, setSendRes] = useState<{ sent: number; failed: number; skipped: number; results: SendResult[] } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

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

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 5000); };

  const send = async () => {
    if (!confirm(`Poslati narudžbe od ${date} u Skytec?`)) return;
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

  const sync = async () => {
    setBusy("sync");
    try {
      const r = await fetch("/api/admin/skytec/sync", { method: "POST" });
      const j = await r.json();
      if (!r.ok) flash(j.error ?? "Greška.");
      else {
        flash(`Otkupnine: ${j.cod.remittances} uplata (${j.cod.matched} upareno). Statusi: ${j.status.changed} promjena od ${j.status.checked}.${j.cod.errors.length ? " Greške: " + j.cod.errors[0] : ""}`);
        await load();
      }
    } finally { setBusy(null); }
  };

  const registerWebhook = async () => {
    setBusy("webhook");
    try {
      const r = await fetch("/api/admin/skytec/webhook", { method: "POST" });
      const j = await r.json();
      flash(r.ok ? `Webhook registrovan: ${j.callbackUrl}` : j.error ?? "Greška.");
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
            {setup && !setup.env.webhookSecret && <p>Dodaj <code>SKYTEC_WEBHOOK_SECRET</code> (bilo koji dugi nasumični tekst).</p>}
            {setup && !setup.env.cronSecret && <p>Dodaj <code>CRON_SECRET</code> za dnevnu sinhronizaciju otkupnina.</p>}
          </div>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="ad-toolbar">
        <div className="sk-head">
          <h2>Slanje pošiljki</h2>
          {setup && (
            <span className={`sk-env ${setup.env.server}`}>
              {setup.env.server === "test" ? "TEST server" : "Produkcija"}
            </span>
          )}
        </div>
        <div className="ad-exports">
          <select value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="svi">Svi proizvodi</option>
            {PRODUCTS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="ad-export-btn sk" onClick={send} disabled={busy !== null}>
            {busy === "send" ? <Loader2 className="ad-spin" size={14} /> : <Send size={14} />}
            Pošalji u Skytec
          </button>
          <div className="sk-labels">
            <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} aria-label="Format naljepnica">
              <option value="A4">A4 · 4/str</option>
              <option value="A410">A4 · 10/str</option>
              <option value="60MM">Termalni 60mm</option>
            </select>
            <button className="ad-export-btn" onClick={labels} disabled={busy !== null}>
              {busy === "labels" ? <Loader2 className="ad-spin" size={14} /> : <Printer size={14} />}
              Naljepnice
            </button>
          </div>
          <button className="ad-export-btn csv span-2" onClick={sync} disabled={busy !== null}>
            {busy === "sync" ? <Loader2 className="ad-spin" size={14} /> : <RefreshCw size={14} />}
            Sinhronizuj statuse i otkupnine
          </button>
        </div>

        {sendRes && (
          <div className="sk-send">
            <p>
              <CheckCircle2 size={15} /> Poslano <b>{sendRes.sent}</b>
              {sendRes.skipped ? <> · već poslano ranije <b>{sendRes.skipped}</b></> : null}
              {sendRes.failed ? <> · <span className="bad">greška {sendRes.failed}</span></> : null}
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

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="sk-kpis">
        <div className="ad-stat">
          <div className="ad-stat-top"><p className="ad-stat-label">Na terenu</p><span className="ad-stat-ico sk-i-blue"><Truck size={15} /></span></div>
          <p className="ad-stat-value">{k ? km(k.onFieldAmount) : "—"}</p>
          <p className="ad-stat-sub">{k ? `${k.onFieldCount} pošiljki u putu` : ""}</p>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-top"><p className="ad-stat-label">Dostavljeno, čeka uplatu</p><span className="ad-stat-ico sk-i-orange"><Clock size={15} /></span></div>
          <p className="ad-stat-value">{k ? km(k.deliveredUnpaidAmount) : "—"}</p>
          <p className={`ad-stat-sub${k && k.overdueCount ? " sk-warn" : ""}`}>
            {k ? (k.overdueCount ? `${k.overdueCount} kasni > 7 dana (${km(k.overdueAmount)})` : `${k.deliveredUnpaidCount} pošiljki`) : ""}
          </p>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-top"><p className="ad-stat-label">Isplaćeno (30 dana)</p><span className="ad-stat-ico sk-i-green"><Banknote size={15} /></span></div>
          <p className="ad-stat-value">{k ? km(k.paid30) : "—"}</p>
          <p className="ad-stat-sub">otkupnine na račun</p>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-top"><p className="ad-stat-label">Stopa povrata</p><span className="ad-stat-ico sk-i-red"><Undo2 size={15} /></span></div>
          <p className="ad-stat-value">{k?.returnRate != null ? `${(k.returnRate * 100).toFixed(1)}%` : "—"}</p>
          <p className="ad-stat-sub">{k ? `${k.returnedCount} od ${k.finishedCount} završenih` : ""}</p>
        </div>
      </div>

      {/* ── Needs a call ─────────────────────────────────────── */}
      {data && data.alerts.length > 0 && (
        <div className="sk-card sk-alerts">
          <div className="sk-head"><h2><Phone size={15} /> Nazovi kupca</h2><span>{data.alerts.length}</span></div>
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
          <div className="sk-head"><h2>Povrati po proizvodu</h2><span>60 dana</span></div>
          <div className="sk-prod-head"><span>Proizvod</span><span>Poslano</span><span>Dostavljeno</span><span>Vraćeno</span><span>Povrat</span></div>
          {data.byProduct.map((p) => {
            const fin = p.delivered + p.returned;
            const rate = fin ? p.returned / fin : null;
            return (
              <div key={p.prefix} className="sk-prod">
                <b>{PREFIX_LABEL[p.prefix] ?? p.prefix}</b>
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
      <div className="ad-filters">
        <button className={`ad-chip${filter === "all" ? " is-on" : ""}`} onClick={() => setFilter("all")}>
          Sve {data ? `(${data.shipments.length})` : ""}
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
          <div className="ad-empty">Nema pošiljki. Pošalji narudžbe u Skytec gore ili sačekaj prve statuse.</div>
        ) : (
          list.map((s) => <ShipRow key={s.order_number} s={s} onCancel={cancel} />)
        )}
      </div>

      {/* ── Webhook ──────────────────────────────────────────── */}
      {setup?.env.apiKey && (
        <div className="sk-card sk-hook">
          <Webhook size={16} />
          <div>
            <b>Automatski statusi (webhook)</b>
            <p>
              {setup.webhook?.callbackUrl
                ? <>Aktivan → <code>{setup.webhook.callbackUrl}</code></>
                : "Nije registrovan. Skytec neće sam javljati promjene dok ga ne registruješ."}
            </p>
          </div>
          <button className="ad-export-btn" onClick={registerWebhook} disabled={busy !== null}>
            {busy === "webhook" ? <Loader2 className="ad-spin" size={14} /> : null}
            {setup.webhook?.callbackUrl ? "Registruj ponovo" : "Registruj"}
          </button>
        </div>
      )}
    </div>
  );
}
