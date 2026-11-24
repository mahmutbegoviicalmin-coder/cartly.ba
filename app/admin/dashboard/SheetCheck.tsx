"use client";

import { useRef, useState } from "react";
import { AlertCircle, Camera, Check, ChevronDown, Loader2, X } from "lucide-react";
import { km, plural, todayStr } from "./sk-format";

type Row = {
  code: string; otkupnina: string; eksterni: string; posiljalac: string; iznos: number;
  status: "ok" | "drugi_iznos" | "vec_preuzeto" | "nepoznato";
  order_number: string | null; ime: string | null; expected: number | null; picked_at: string | null;
};
type Result = {
  photos: string[];
  dates: string[];
  rows: Row[];
  notOnSheet: { code: string; otkupnina: string; ime: string | null; order_number: string; iznos: number }[];
  totals: { printedCount: number | null; printedAmount: number | null; readCount: number; readAmount: number; complete: boolean; toMark: number };
};

const otk = (n: number) => plural(n, "otkupnina", "otkupnine", "otkupnina");
const dmy = (d: string) => `${Number(d.slice(8, 10))}.${Number(d.slice(5, 7))}.`;

/** Phone photos are large (and often HEIC): redraw as a JPEG of at most 1800 px. */
async function toJpeg(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Slika se ne može obraditi."))), "image/jpeg", 0.82));
}

const LABEL: Record<Row["status"], { text: string; tone: string }> = {
  ok: { text: "slaže se", tone: "ok" },
  drugi_iznos: { text: "drugi iznos", tone: "warn" },
  vec_preuzeto: { text: "već preuzeto", tone: "muted" },
  nepoznato: { text: "nema u sistemu", tone: "bad" },
};

export default function SheetCheck({ onMarked, toast }: { onMarked: () => Promise<void>; toast: (t: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<Result | null>(null);
  const [received, setReceived] = useState("");
  const [date, setDate] = useState(todayStr());
  const [showOk, setShowOk] = useState(false);
  const [saving, setSaving] = useState(false);

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setErr(null); setRes(null);
    try {
      const fd = new FormData();
      for (const f of Array.from(files).slice(0, 4)) fd.append("photos", await toJpeg(f), `${f.name || "sheet"}.jpg`);
      const r = await fetch("/api/admin/skytec/cod/sheet", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error ?? "Greška pri čitanju slike."); return; }
      setRes(j);
      setReceived(String((j as Result).totals.printedAmount ?? (j as Result).totals.readAmount).replace(".", ","));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Greška.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const markable = res?.rows.filter((r) => (r.status === "ok" || r.status === "drugi_iznos") && r.order_number) ?? [];
  const markSum = markable.reduce((a, r) => a + (r.expected ?? r.iznos), 0);
  const receivedNum = received.trim() ? Number(received.replace(/\./g, "").replace(",", ".")) : null;

  const mark = async () => {
    if (!res || !markable.length) return;
    setSaving(true);
    try {
      const r = await fetch("/api/admin/skytec/cod", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: markable.map((x) => x.order_number), date, photos: res.photos,
          ...(receivedNum != null && Number.isFinite(receivedNum) ? { received: receivedNum } : {}),
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { toast(j.error ?? "Greška pri spremanju."); return; }
      toast(`Označeno kao preuzeto: ${otk(j.updated)} · ${km(j.expected ?? markSum)}`);
      setRes(null);
      await onMarked();
    } finally { setSaving(false); }
  };

  const groups = res ? {
    ok: res.rows.filter((r) => r.status === "ok"),
    problems: res.rows.filter((r) => r.status === "drugi_iznos" || r.status === "nepoznato"),
    done: res.rows.filter((r) => r.status === "vec_preuzeto"),
  } : null;

  return (
    <section className="skx-section">
      <div className="skx-group sc-box">
        <div className="sc-head">
          <div>
            <b>Uporedi sa specifikacijom iz magacina</b>
            <span>Slikaj papir „Specifikacija otkupnina“ (sve strane), pa vidiš šta se slaže, a šta fali.</span>
          </div>
          <button className="skx-btn primary sm" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <Loader2 size={14} className="ad-spin" /> : <Camera size={14} />} {busy ? "Čitam…" : "Slikaj / dodaj slike"}
          </button>
          <input ref={input} type="file" accept="image/*" multiple capture="environment" hidden onChange={(e) => pick(e.target.files)} />
        </div>

        {busy && <p className="sc-note">Čitam sliku, obično 20–40 sekundi…</p>}
        {err && <div className="skx-banner"><AlertCircle size={16} /> {err}</div>}

        {res && groups && (
          <div className="sc-result">
            <div className="sc-totals">
              <div><span>Na papiru</span><b>{res.totals.printedCount != null ? otk(res.totals.printedCount) : "—"} · {res.totals.printedAmount != null ? km(res.totals.printedAmount) : "—"}</b></div>
              <div><span>Pročitano</span><b>{otk(res.totals.readCount)} · {km(res.totals.readAmount)}</b></div>
              {res.dates.length > 0 && <div><span>Datum</span><b>{res.dates.map(dmy).join(", ")}</b></div>}
              <button className="skx-icon" onClick={() => setRes(null)} aria-label="Zatvori"><X size={15} /></button>
            </div>
            {!res.totals.complete && (
              <div className="skx-banner"><AlertCircle size={16} /> Zbir pročitanih redova se ne slaže sa iznosom na papiru: možda fali strana ili je neki red nejasan na slici.</div>
            )}

            {groups.problems.length > 0 && (
              <div className="sc-list">
                <h4 className="bad">Ne slaže se ({groups.problems.length})</h4>
                {groups.problems.map((r) => <RowLine key={r.code} r={r} />)}
              </div>
            )}

            <div className="sc-list">
              <button className="sc-toggle" onClick={() => setShowOk((v) => !v)}>
                <h4 className="ok"><Check size={14} /> Slaže se ({groups.ok.length}) · {km(groups.ok.reduce((a, r) => a + r.iznos, 0))}</h4>
                <ChevronDown size={16} className={showOk ? "open" : ""} />
              </button>
              {showOk && groups.ok.map((r) => <RowLine key={r.code} r={r} />)}
            </div>

            {groups.done.length > 0 && (
              <div className="sc-list">
                <h4 className="muted">Već ranije preuzeto ({groups.done.length})</h4>
                {groups.done.map((r) => <RowLine key={r.code} r={r} />)}
              </div>
            )}

            {res.notOnSheet.length > 0 && (
              <div className="sc-list">
                <h4 className="warn">Čeka u Skytecu, nije na ovom papiru ({res.notOnSheet.length}) · {km(res.notOnSheet.reduce((a, r) => a + r.iznos, 0))}</h4>
                {res.notOnSheet.map((r) => (
                  <div key={r.code} className="sc-row">
                    <span><b>{r.ime ?? "—"}</b><small>{r.otkupnina} · {r.order_number}</small></span>
                    <em>{km(r.iznos)}</em>
                  </div>
                ))}
              </div>
            )}

            {markable.length > 0 && (
              <div className="sc-mark">
                <label><span>Dobio sam</span><input inputMode="decimal" value={received} onChange={(e) => setReceived(e.target.value)} /></label>
                <label><span>Datum</span><input type="date" value={date} max={todayStr()} onChange={(e) => e.target.value && setDate(e.target.value)} /></label>
                <button className="skx-btn primary" onClick={mark} disabled={saving}>
                  {saving ? <Loader2 size={16} className="ad-spin" /> : <Check size={16} />} Označi {otk(markable.length)} kao preuzeto
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function RowLine({ r }: { r: Row }) {
  const l = LABEL[r.status];
  return (
    <div className="sc-row">
      <span>
        <b>{r.ime ?? r.posiljalac}</b>
        <small>{r.otkupnina}{r.order_number ? ` · ${r.order_number}` : r.eksterni ? ` · ${r.eksterni}` : ""}{r.picked_at ? ` · preuzeto ${dmy(r.picked_at)}` : ""}</small>
      </span>
      <span className={`sc-tag ${l.tone}`}>{l.text}{r.status === "drugi_iznos" && r.expected != null ? `: u sistemu ${km(r.expected)}` : ""}</span>
      <em>{km(r.iznos)}</em>
    </div>
  );
}
