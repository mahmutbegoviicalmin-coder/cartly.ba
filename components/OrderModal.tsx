"use client";

import { useState, useEffect, FormEvent } from "react";
import { createPortal } from "react-dom";
import { event } from "@/lib/fbpixel";
import { track } from "@vercel/analytics";

const SIZES = [39, 40, 41, 42, 43, 44, 45, 46, 47];
const OUT_OF_STOCK = new Set<number>([]);
const PRICE = 59.9;
const DELIVERY = 10.0;

interface Props {
  open: boolean;
  onClose: () => void;
  initialSize?: number;
}

export default function OrderModal({ open, onClose, initialSize }: Props) {
  const [mounted, setMounted]     = useState(false);
  const [qtys, setQtys]           = useState<Record<number, number>>({});
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [address, setAddress]     = useState("");
  const [city, setCity]           = useState("");
  const [zip, setZip]             = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setQty = (s: number, delta: number) => {
    setQtys(prev => {
      const next = Math.max(0, (prev[s] ?? 0) + delta);
      const updated = { ...prev, [s]: next };
      if (next === 0) delete updated[s];
      return updated;
    });
    setErrors(er => ({ ...er, sizes: "" }));
  };

  const totalPairs = Object.values(qtys).reduce((a, b) => a + b, 0);
  const freeDelivery = totalPairs >= 2;
  const totalPrice = PRICE * totalPairs + (freeDelivery ? 0 : totalPairs > 0 ? DELIVERY : 0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      const init: Record<number, number> = {};
      if (initialSize && !OUT_OF_STOCK.has(initialSize)) init[initialSize] = 1;
      setQtys(init);
      setName(""); setPhone(""); setAddress(""); setCity(""); setZip("");
      setErrors({}); setServerError(null); setDone(false);
    }
  }, [open, initialSize]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (totalPairs === 0) e.sizes   = "Odaberite barem jednu veličinu";
    if (!name.trim())     e.name    = "Unesite ime i prezime";
    if (!phone.trim())    e.phone   = "Unesite broj telefona";
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(phone)) e.phone = "Neispravan broj";
    if (!address.trim())  e.address = "Unesite adresu";
    if (!city.trim())     e.city    = "Unesite grad";
    if (!zip.trim())      e.zip     = "Unesite poštanski broj";
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setServerError(null);
    const externalId = (() => { try { return localStorage.getItem("_crt_eid") || ""; } catch { return ""; } })();
    const velicine = Object.entries(qtys).map(([s, k]) => ({ velicina: Number(s), kolicina: k }));
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime: name, telefon: phone, adresa: `${address}, ${zip} ${city}`, grad: city, velicine, externalId }),
      });
      const data = await res.json();
      if (data.success) {
        track("order_submitted", { pairs: totalPairs, total: totalPrice, source: "modal" });
        event("Purchase", { value: totalPrice, currency: "BAM", content_name: "Radne Patike S3 Tactical Black", content_ids: ["radne-patike-s3"], content_type: "product", num_items: totalPairs }, data.orderNumber);
        setDone(true);
      } else {
        setServerError(data.error ?? "Greška. Pokušajte ponovo.");
      }
    } catch {
      setServerError("Greška. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !open) return null;

  const modal = (
    <div className="om-ov" onClick={onClose}>
      <div className="om-sh" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 0" }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#B33000", fontFamily: "var(--font-manrope), sans-serif" }}>
              Radne Patike S3 Tactical Black
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 19, fontWeight: 800, color: "#0A0A0A", fontFamily: "var(--font-manrope), sans-serif", letterSpacing: "-0.02em" }}>
              {done ? "Narudžba primljena!" : "Naruči odmah"}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "#F5F5F5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: "16px 20px 28px", overflowY: "auto" }}>

          {done ? (
            /* ── SUCCESS ── */
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 20, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 8 }}>Hvala, {name.split(" ")[0]}!</h3>
              <p style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 20 }}>
                Kontaktiramo vas na <strong>{phone}</strong> u roku od 24h radi potvrde.
              </p>
              <button onClick={onClose} style={{ background: "#0A0A0A", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Zatvori</button>
            </div>
          ) : (
            /* ── FORM ── */
            <form onSubmit={handleSubmit} noValidate>

              {/* 1. Contact fields FIRST */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {([
                  { k: "name",    l: "Ime i prezime *",   p: "Npr. Amir Begović",  t: "text", a: "name",           v: name,    s: setName },
                  { k: "phone",   l: "Broj telefona *",   p: "Npr. 061 234 567",   t: "tel",  a: "tel",            v: phone,   s: setPhone },
                  { k: "address", l: "Adresa dostave *",  p: "Npr. Ferhadija 1",   t: "text", a: "street-address", v: address, s: setAddress },
                  { k: "city",    l: "Grad *",            p: "Npr. Sarajevo",      t: "text", a: "address-level2", v: city,    s: setCity },
                  { k: "zip",     l: "Poštanski broj *",  p: "Npr. 71000",         t: "text", a: "postal-code",    v: zip,     s: setZip },
                ] as const).map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#555", fontFamily: "var(--font-manrope), sans-serif", display: "block", marginBottom: 4 }}>{f.l}</label>
                    <input type={f.t} value={f.v} autoComplete={f.a} placeholder={f.p}
                      onChange={e => { (f.s as (v: string) => void)(e.target.value); setErrors(er => ({ ...er, [f.k]: "" })); }}
                      className={`om-in${errors[f.k] ? " er" : ""}`}
                    />
                    {errors[f.k] && <p className="om-er">{errors[f.k]}</p>}
                  </div>
                ))}
              </div>

              {/* 2. Size + qty list BELOW */}
              <div style={{ background: "#F8F8F8", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #EEEEEE", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 13, color: "#0A0A0A" }}>Odaberi veličine i količine</span>
                  {freeDelivery && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "3px 8px", fontFamily: "var(--font-manrope), sans-serif" }}>
                      🎉 Besplatna dostava
                    </span>
                  )}
                </div>
                <div style={{ padding: "4px 14px 8px" }}>
                  {SIZES.map(s => {
                    const oos = OUT_OF_STOCK.has(s);
                    const qty = qtys[s] ?? 0;
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F2F2F2", opacity: oos ? 0.4 : 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 15, color: qty > 0 ? "#B33000" : "#0A0A0A", minWidth: 26 }}>EU {s}</span>
                          {qty > 0 && (
                            <span style={{ fontSize: 11, color: "#B33000", fontFamily: "var(--font-manrope), sans-serif" }}>
                              {qty}× 59,90 = {(qty * PRICE).toFixed(2).replace(".", ",")} KM
                            </span>
                          )}
                          {oos && <span style={{ fontSize: 11, color: "#BBB", fontFamily: "var(--font-manrope), sans-serif" }}>rasprodano</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <button type="button" disabled={oos || qty === 0} onClick={() => setQty(s, -1)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #E0E0E0", background: "#fff", cursor: qty === 0 || oos ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "#444", opacity: qty === 0 ? 0.3 : 1, transition: "all 120ms", padding: 0 }}>−</button>
                          <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 16, color: qty > 0 ? "#B33000" : "#CCCCCC", minWidth: 18, textAlign: "center" }}>{qty}</span>
                          <button type="button" disabled={oos} onClick={() => setQty(s, +1)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #E0E0E0", background: "#fff", cursor: oos ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "#444", transition: "all 120ms", padding: 0 }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.sizes && <p style={{ fontSize: 11, color: "#ef4444", margin: "0 14px 10px", fontFamily: "var(--font-manrope), sans-serif" }}>{errors.sizes}</p>}
              </div>

              {/* Free delivery nudge */}
              {!freeDelivery && totalPairs === 1 && (
                <div style={{ background: "#FFF9F5", border: "1px solid rgba(179,48,0,0.15)", borderRadius: 10, padding: "9px 12px", marginBottom: 12, fontSize: 12, fontFamily: "var(--font-manrope), sans-serif", color: "#666" }}>
                  🚚 Dodaj još 1 par → <strong style={{ color: "#B33000" }}>dostava besplatna</strong>
                </div>
              )}

              {serverError && <p style={{ fontSize: 13, color: "#ef4444", background: "#fef2f2", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontFamily: "var(--font-manrope), sans-serif" }}>{serverError}</p>}

              {/* Total */}
              <div style={{ borderTop: "1px solid #EBEBEB", paddingTop: 12, marginBottom: 14 }}>
                {/* Price breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                  {totalPairs > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#888" }}>
                      <span>{totalPairs} × 59,90 KM</span>
                      <span>{(totalPairs * PRICE).toFixed(2).replace(".", ",")} KM</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-manrope), sans-serif", fontSize: 13 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, color: freeDelivery ? "#22c55e" : "#888" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      {freeDelivery ? "Dostava gratis (2+ para)" : "Dostava Euro Express"}
                    </span>
                    <span style={{ color: freeDelivery ? "#22c55e" : "#888", fontWeight: freeDelivery ? 700 : 400 }}>
                      {freeDelivery ? "0,00 KM" : "10,00 KM"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>Ukupno</span>
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: 24, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
                    {totalPairs > 0 ? `${totalPrice.toFixed(2).replace(".", ",")} KM` : "—"}
                  </span>
                </div>
              </div>

              <button type="submit" className="om-bt" disabled={loading}>{loading ? "Slanje..." : "Pošalji narudžbu"}</button>
              <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", margin: "8px 0 0", fontFamily: "var(--font-manrope), sans-serif" }}>Plaćanje pouzećem · Bez kartice · Povrat 14 dana</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
