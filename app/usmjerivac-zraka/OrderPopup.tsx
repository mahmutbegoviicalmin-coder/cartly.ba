"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { event } from "@/lib/fbpixel";

const BLUE  = "#1a5fff";
const BLUE2 = "#1448d4";
const BLK   = "#0a0a1a";
const GR    = "#64748B";
const BRDR2 = "rgba(10,10,26,0.08)";
const F     = "var(--font-manrope),-apple-system,sans-serif";

type BID = 1 | 2 | 3;
const BUNDLES = [
  { id: 1 as BID, qty: "1 komad",  price: 14.90, delivery: 10.00, total: 24.90, savings: null, badge: null,         badgeColor: "" },
  { id: 2 as BID, qty: "2 komada", price: 24.90, delivery: 10.00, total: 34.90, savings: 4.90, badge: "TOP PONUDA", badgeColor: "#f59e0b" },
  { id: 3 as BID, qty: "3 komada", price: 34.90, delivery: 10.00, total: 44.90, savings: 9.80, badge: "BESTSELLER", badgeColor: BLUE2 },
];

function fmt(n: number) { return n.toFixed(2).replace(".", ",") + " KM"; }

type Fields = { ime: string; telefon: string; adresa: string; grad: string };
type Errs   = Partial<Record<keyof Fields, string>>;

interface Props {
  open:          boolean;
  onClose:       () => void;
  initialBundle: BID;
}

function Field({ label, type = "text", placeholder = "", value, onChange, error }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: BLK, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${error ? "#EF4444" : BRDR2}`, borderRadius: 9, fontSize: 14, fontFamily: F, color: BLK, background: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" }}
        onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(26,95,255,0.1)`; }}
        onBlur={e  => { e.target.style.borderColor = error ? "#EF4444" : BRDR2; e.target.style.boxShadow = "none"; }}
      />
      {error && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4, fontFamily: F }}>{error}</p>}
    </div>
  );
}

export default function OrderPopup({ open, onClose, initialBundle }: Props) {
  const [bundle,    setBundle]    = useState<BID>(initialBundle);
  const [fields,    setFields]    = useState<Fields>({ ime: "", telefon: "", adresa: "", grad: "" });
  const [errors,    setErrors]    = useState<Errs>({});
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  // Sync bundle when popup opens with a different initial bundle
  useEffect(() => {
    if (open) setBundle(initialBundle);
  }, [open, initialBundle]);

  // Lock body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sel = BUNDLES.find(b => b.id === bundle)!;

  function validate(): Errs {
    const e: Errs = {};
    if (!fields.ime.trim()     || fields.ime.trim().length < 2)                e.ime     = "Unesite ime i prezime";
    if (!fields.telefon.trim() || fields.telefon.replace(/\D/g,"").length < 8) e.telefon = "Unesite ispravan broj";
    if (!fields.adresa.trim()) e.adresa = "Unesite adresu";
    if (!fields.grad.trim())   e.grad   = "Unesite grad";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerErr(null);
    try {
      event("InitiateCheckout", { content_name: "Usmjerivač Zraka Klime", content_ids: ["usmjerivac-zraka"], content_type: "product", value: sel.total, currency: "BAM", num_items: sel.id });
      const externalId = typeof localStorage !== "undefined" ? localStorage.getItem("_crt_eid") || "" : "";
      const res  = await fetch("/api/usmjerivac-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, bundle, externalId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      event("Purchase", { content_name: "Usmjerivač Zraka Klime", content_ids: ["usmjerivac-zraka"], content_type: "product", value: sel.total, currency: "BAM", num_items: sel.id }, data.orderNumber);
      setDone(true);
    } catch {
      setServerErr("Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset after animation
    setTimeout(() => { setDone(false); setFields({ ime: "", telefon: "", adresa: "", grad: "" }); setErrors({}); setServerErr(null); }, 350);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleClose}
            style={{ position: "fixed", inset: 0, background: "rgba(10,10,26,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 10000 }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            style={{
              position: "fixed", inset: 0, zIndex: 10001,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "16px", pointerEvents: "none",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents: "auto",
                background: "#f8faff",
                borderRadius: 22,
                width: "100%",
                maxWidth: 520,
                maxHeight: "92dvh",
                overflowY: "auto",
                boxShadow: "0 32px 80px rgba(10,10,26,0.28), 0 0 0 1px rgba(26,95,255,0.1)",
                position: "relative",
              }}
            >
              {/* Header */}
              <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, borderRadius: "22px 22px 0 0", padding: "20px 24px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 3 }}>Naruči odmah</div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: "#fff", fontFamily: F, letterSpacing: "-0.03em" }}>Usmjerivač Zraka Klime</div>
                </div>
                <button onClick={handleClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div style={{ padding: "22px 24px 28px" }}>
                {done ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 8px 24px rgba(26,95,255,0.35)" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: BLK, fontFamily: F, letterSpacing: "-0.03em", marginBottom: 8 }}>Narudžba primljena!</div>
                    <p style={{ fontSize: 14, color: GR, fontFamily: F, lineHeight: 1.7, maxWidth: 320, margin: "0 auto 24px" }}>Kontaktiraćemo vas radi potvrde i dogovora oko dostave.</p>
                    <button onClick={handleClose} style={{ padding: "11px 28px", background: BLUE, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F, cursor: "pointer" }}>Zatvori</button>
                  </div>
                ) : (
                  <>
                    {/* Bundle selector — compact */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Odaberite paket</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {BUNDLES.map(b => (
                          <div key={b.id} onClick={() => setBundle(b.id)}
                            style={{
                              borderRadius: 12, cursor: "pointer", overflow: "hidden",
                              border: `2px solid ${bundle === b.id ? BLUE : "rgba(0,0,0,0.08)"}`,
                              background: bundle === b.id ? "#f0f6ff" : "#fff",
                              boxShadow: bundle === b.id ? `0 0 0 3px rgba(26,95,255,0.08)` : "0 1px 4px rgba(0,0,0,0.05)",
                              transition: "all 0.15s",
                            }}
                          >
                            <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${bundle === b.id ? "rgba(26,95,255,0.1)" : "rgba(0,0,0,0.05)"}` }}>
                              <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: `2.5px solid ${bundle === b.id ? BLUE : "#cbd5e1"}`, background: bundle === b.id ? BLUE : "transparent", transition: "all 0.15s" }} />
                              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: BLK, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.04em" }}>{b.qty}</span>
                              {b.badge && (
                                <span style={{ background: b.badgeColor, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F }}>{b.badge}</span>
                              )}
                            </div>
                            <div style={{ padding: "8px 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                                <span style={{ fontSize: 11, color: GR, fontFamily: F }}>{fmt(b.price)} + {b.delivery === 0 ? <span style={{ color: "#16a34a", fontWeight: 700 }}>Besplatna dostava</span> : fmt(b.delivery) + " dostava"}</span>
                              </div>
                              <div style={{ fontSize: 18, fontWeight: 900, color: bundle === b.id ? BLUE : BLK, fontFamily: F, letterSpacing: "-0.04em", transition: "color 0.15s" }}>{fmt(b.total)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                        <Field label="Ime i prezime" placeholder="Amira Kovačević" value={fields.ime} error={errors.ime} onChange={v => { setFields(f => ({ ...f, ime: v })); setErrors(e => ({ ...e, ime: undefined })); }} />
                        <Field label="Telefon" type="tel" placeholder="061 234 567" value={fields.telefon} error={errors.telefon} onChange={v => { setFields(f => ({ ...f, telefon: v })); setErrors(e => ({ ...e, telefon: undefined })); }} />
                      </div>
                      <Field label="Adresa" placeholder="Ulica i broj" value={fields.adresa} error={errors.adresa} onChange={v => { setFields(f => ({ ...f, adresa: v })); setErrors(e => ({ ...e, adresa: undefined })); }} />
                      <Field label="Grad" placeholder="Sarajevo" value={fields.grad} error={errors.grad} onChange={v => { setFields(f => ({ ...f, grad: v })); setErrors(e => ({ ...e, grad: undefined })); }} />

                      {serverErr && <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 12, color: "#EF4444", fontFamily: F }}>{serverErr}</div>}

                      {/* Submit */}
                      <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, borderRadius: 14, padding: "16px 18px 14px", marginTop: 4, boxShadow: "0 6px 28px rgba(26,95,255,0.30)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Ukupno za plaćanje</div>
                            <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", fontFamily: F, letterSpacing: "-0.05em", lineHeight: 1 }}>{fmt(sel.total)}</div>
                          </div>
                          {sel.delivery === 0 ? (
                            <div style={{ background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, padding: "5px 11px", textAlign: "center" }}>
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontFamily: F, textTransform: "uppercase" }}>Dostava</div>
                              <div style={{ fontSize: 12, fontWeight: 800, color: "#4ade80", fontFamily: F }}>BESPLATNO</div>
                            </div>
                          ) : (
                            <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "5px 11px", textAlign: "center" }}>
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontFamily: F, textTransform: "uppercase" }}>Uključuje</div>
                              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: F }}>dostavu ✓</div>
                            </div>
                          )}
                        </div>
                        <button type="submit" disabled={loading}
                          style={{ width: "100%", padding: "13px 20px", background: loading ? "rgba(255,255,255,0.55)" : "#fff", color: BLUE, border: "none", borderRadius: 10, fontSize: 16, fontWeight: 900, fontFamily: F, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 18px rgba(0,0,0,0.14)", transition: "transform 0.12s, box-shadow 0.12s", letterSpacing: "-0.01em" }}
                          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 22px rgba(0,0,0,0.2)"; } }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(0,0,0,0.14)"; }}
                        >
                          {loading ? (
                            <><svg style={{ animation: "u-spin 0.9s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Šalje se...</>
                          ) : (
                            <>Naruči odmah — Plaćanje pouzećem<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></>
                          )}
                        </button>
                        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 11, flexWrap: "wrap" }}>
                          {([
                            { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, label: "Dostava 48h" },
                            { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: "Bez predujma" },
                            { icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>, label: "Povrat 14 dana" },
                          ] as { icon: React.ReactNode; label: string }[]).map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: F }}>{item.icon}<span>{item.label}</span></div>
                          ))}
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
