"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronDown, Phone } from "lucide-react";
import { plural } from "./sk-format";
import "./skytec.css";

type Item = {
  id: number | string; kind: "nedovrseno" | "odbijeno"; reason: string | null; product: string | null;
  at: string; ime: string | null; telefon: string | null; phone: string | null;
  adresa: string | null; grad: string | null; postanski: string | null; page: string | null;
};

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `prije ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `prije ${h} h`;
  return new Date(iso).toLocaleDateString("bs-BA", { day: "numeric", month: "numeric", timeZone: "Europe/Sarajevo" });
};

/**
 * Customers who typed their details but did not finish (or were refused):
 * call them back. Hidden once the same phone places an order or you tick it.
 */
export default function DraftsPanel() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/drafts?days=7");
    if (r.ok) setItems((await r.json()).items);
  }, []);
  useEffect(() => { load(); }, [load]);

  const done = async (id: Item["id"]) => {
    setItems((xs) => xs?.filter((x) => x.id !== id) ?? null);
    await fetch("/api/admin/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  if (!items?.length) return null;
  const shown = open ? items : items.slice(0, 3);

  return (
    <div className="skx" style={{ maxWidth: "none", margin: "0 0 16px", gap: 8 }}>
      <section className="skx-section">
        <header className="skx-section-head">
          <div>
            <h2>Nedovršene narudžbe · {items.length}</h2>
            <p>Upisali su podatke, ali narudžba nije stigla. Nazovi ih.</p>
          </div>
        </header>
        <div className="skx-group">
          {shown.map((x) => (
            <div key={x.id} className="skx-row static">
              <div className="skx-row-main">
                <span className="skx-row-title">{x.ime || "Bez imena"}</span>
                <span className="skx-row-sub">
                  {[x.product, [x.adresa, x.postanski, x.grad].filter(Boolean).join(", ")].filter(Boolean).join(" · ") || x.page}
                </span>
                {x.kind === "odbijeno" && <span className="skx-row-warn">Odbijeno: {x.reason}</span>}
              </div>
              <div className="skx-row-end">
                <span className="skx-row-meta">{ago(x.at)}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {x.phone && (
                    <a className="skx-btn primary sm" href={`tel:${x.phone}`} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <Phone size={13} /> {x.telefon}
                    </a>
                  )}
                  <button className="skx-btn sm" onClick={() => done(x.id)} aria-label="Riješeno" title="Riješeno"><Check size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {items.length > 3 && (
            <button className="skx-row" onClick={() => setOpen((v) => !v)} style={{ minHeight: 44, justifyContent: "center", color: "var(--skx-blue)" }}>
              {open ? "Prikaži manje" : `Prikaži sve (${items.length} ${plural(items.length, "osoba", "osobe", "osoba")})`}
              <ChevronDown size={15} style={{ transform: open ? "rotate(180deg)" : undefined }} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
