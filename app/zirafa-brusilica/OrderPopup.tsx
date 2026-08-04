"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Manrope } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@vercel/analytics";
import { event } from "@/lib/fbpixel";

const manrope = Manrope({ subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });

const ACC  = "#0284C7";
const ACC2 = "#075985";
const BLK  = "#0a0a1a";
const GR   = "#64748b";
const F    = manrope.style.fontFamily + ",-apple-system,sans-serif";

const UNIT_PRICE = 169.90;
const OLD_PRICE  = 269.90;
const DELIVERY   = 10.00;
const TOTAL      = UNIT_PRICE + DELIVERY;

function fmt(n: number) { return n.toFixed(2).replace(".", ",") + " KM"; }

function shippingDayText(): string {
  const day = new Date().getDay(); // 0=Ned, 5=Pet, 6=Sub
  return (day === 5 || day === 6 || day === 0) ? "šalje se u ponedjeljak" : "šalje se sutra";
}

type Fields = { ime: string; telefon: string; adresa: string; grad: string };
type Errs   = Partial<Record<keyof Fields, string>>;

interface Props { open: boolean; onClose: () => void; }

function Field({ label, type = "text", placeholder = "", value, onChange, error }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "13px 14px", border: `1.5px solid ${error ? "#ef4444" : "rgba(0,0,0,0.1)"}`, borderRadius: 10, fontSize: 15, fontFamily: F, color: BLK, background: "#fff", outline: "none", boxSizing: "border-box", WebkitAppearance: "none" }}
        onFocus={e => { e.target.style.borderColor = ACC; e.target.style.boxShadow = `0 0 0 3px rgba(2,132,199,0.12)`; }}
        onBlur={e  => { e.target.style.borderColor = error ? "#ef4444" : "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none"; }}
      />
      {error && <p style={{ margin: "5px 0 0", fontSize: 11, color: "#ef4444", fontFamily: F }}>{error}</p>}
    </div>
  );
}

export default function OrderPopup({ open, onClose }: Props) {
  const [fields,    setFields]    = useState<Fields>({ ime: "", telefon: "", adresa: "", grad: "" });
  const [errors,    setErrors]    = useState<Errs>({});
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [orderNum,  setOrderNum]  = useState("");
  const [serverErr, setServerErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [open]);

  function validate(): Errs {
    const e: Errs = {};
    if (!fields.ime.trim() || fields.ime.trim().length < 2) e.ime = "Unesite ime i prezime";
    if (!fields.telefon.trim() || fields.telefon.replace(/\D/g, "").length < 8) e.telefon = "Unesite ispravan broj";
    if (!fields.adresa.trim()) e.adresa = "Unesite adresu";
    if (!fields.grad.trim()) e.grad = "Unesite grad";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerErr(null);
    try {
      event("InitiateCheckout", { content_name: "Žirafa Brusilica za Zidove", content_ids: ["zirafa-brusilica"], content_type: "product", value: TOTAL, currency: "BAM", num_items: 1 });
      const externalId = typeof localStorage !== "undefined" ? localStorage.getItem("_crt_eid") || "" : "";
      const res  = await fetch("/api/zirafa-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, externalId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      event("Purchase", { content_name: "Žirafa Brusilica za Zidove", content_ids: ["zirafa-brusilica"], content_type: "product", value: TOTAL, currency: "BAM", num_items: 1 }, data.orderNumber);
      track("order_submitted", { total: TOTAL, source: "zirafa-popup" });
      setOrderNum(data.orderNumber);
      setDone(true);
    } catch {
      setServerErr("Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setDone(false);
      setFields({ ime: "", telefon: "", adresa: "", grad: "" });
      setErrors({});
      setServerErr(null);
    }, 350);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <style suppressHydrationWarning>{`
            @keyframes zop-spin { to { transform: rotate(360deg); } }
            .zop-spin { animation: zop-spin 0.85s linear infinite; }

            .zop-overlay {
              position: fixed; inset: 0; z-index: 9999;
              background: rgba(10,10,26,0.6);
              backdrop-filter: blur(4px);
              -webkit-backdrop-filter: blur(4px);
              display: flex; align-items: flex-end; justify-content: center;
            }
            @media (min-width: 641px) { .zop-overlay { align-items: center; } }

            .zop-modal {
              position: relative;
              width: 100%; max-width: 100%; max-height: 92dvh;
              background: #ffffff;
              border-radius: 24px 24px 0 0;
              display: flex; flex-direction: column;
              box-shadow: 0 -8px 60px rgba(10,10,26,0.2);
              overflow: hidden;
              touch-action: pan-y;
              overscroll-behavior: contain;
            }
            @media (min-width: 641px) {
              .zop-modal { max-width: 460px; border-radius: 24px; box-shadow: 0 24px 80px rgba(10,10,26,0.22), 0 0 0 1px rgba(2,132,199,0.08); max-height: 90vh; }
            }

            .zop-body { overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; flex: 1; padding: 20px 20px 32px; }

            .zop-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            @media (max-width: 400px) { .zop-form-row { grid-template-columns: 1fr; } }
          `}</style>

          <motion.div
            className="zop-overlay" key="zop-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          >
            <motion.div
              className="zop-modal" key="zop-modal"
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.1)" }} />
              </div>

              {/* Header */}
              <div style={{
                background: `linear-gradient(135deg, ${ACC} 0%, ${ACC2} 100%)`,
                padding: "14px 20px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                    Naruči odmah · Plaćanje pouzećem
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: F, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                    Žirafa Brusilica za Zidove
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="zop-body">
                {done ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ width: 68, height: 68, borderRadius: "50%", background: ACC, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 8px 28px rgba(2,132,199,0.35)" }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: BLK, fontFamily: F, letterSpacing: "-0.03em", marginBottom: 6 }}>
                      Narudžba primljena!
                    </div>
                    <div style={{ fontSize: 13, color: GR, fontFamily: F, marginBottom: 18 }}>
                      Broj narudžbe: <strong style={{ color: BLK }}>{orderNum}</strong>
                    </div>
                    <p style={{ fontSize: 14, color: GR, fontFamily: F, lineHeight: 1.7, maxWidth: 280, margin: "0 auto 28px" }}>
                      Narudžba je zaprimljena, paket {shippingDayText()} putem Euro Express-a.
                    </p>
                    <button
                      onClick={handleClose}
                      style={{ padding: "12px 32px", background: ACC, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: F, cursor: "pointer", boxShadow: "0 4px 16px rgba(2,132,199,0.3)" }}
                    >
                      Zatvori
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Order summary */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{
                        display: "flex", gap: 12, alignItems: "center",
                        background: "#f0f9ff", border: `1.5px solid rgba(2,132,199,0.16)`,
                        borderRadius: 14, padding: "12px 14px", marginBottom: 10,
                      }}>
                        <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#fff", border: "1px solid rgba(0,0,0,0.06)" }}>
                          <img src="/zirafa/heroslika.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: BLK, fontFamily: F, marginBottom: 2 }}>Žirafa Brusilica za Zidove</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: ACC, fontFamily: F }}>{fmt(UNIT_PRICE)}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: F, textDecoration: "line-through" }}>{fmt(OLD_PRICE)}</span>
                          </div>
                        </div>
                        <div style={{ background: "#dc2626", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 6, padding: "3px 7px", fontFamily: F, flexShrink: 0 }}>-37%</div>
                      </div>

                      {/* Summary breakdown */}
                      <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: F, color: GR }}>
                          <span>Proizvod</span><span style={{ color: BLK, fontWeight: 600 }}>{fmt(UNIT_PRICE)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: 12.5, fontFamily: F, color: GR, gap: 10 }}>
                          <span>Dostava · Euro Express · 1-2 dana</span><span style={{ color: BLK, fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(DELIVERY)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontFamily: F, color: BLK, fontWeight: 800, borderTop: "1px dashed rgba(0,0,0,0.12)", paddingTop: 8, marginTop: 2 }}>
                          <span>Ukupno</span><span style={{ color: ACC }}>{fmt(TOTAL)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="zop-form-row">
                        <Field label="Ime i prezime" placeholder="Amar Hodžić" value={fields.ime} error={errors.ime}
                          onChange={v => { setFields(f => ({ ...f, ime: v })); setErrors(e => ({ ...e, ime: undefined })); }} />
                        <Field label="Telefon" type="tel" placeholder="061 234 567" value={fields.telefon} error={errors.telefon}
                          onChange={v => { setFields(f => ({ ...f, telefon: v })); setErrors(e => ({ ...e, telefon: undefined })); }} />
                      </div>
                      <div className="zop-form-row">
                        <Field label="Adresa" placeholder="Ulica i broj" value={fields.adresa} error={errors.adresa}
                          onChange={v => { setFields(f => ({ ...f, adresa: v })); setErrors(e => ({ ...e, adresa: undefined })); }} />
                        <Field label="Grad" placeholder="Sarajevo" value={fields.grad} error={errors.grad}
                          onChange={v => { setFields(f => ({ ...f, grad: v })); setErrors(e => ({ ...e, grad: undefined })); }} />
                      </div>

                      {serverErr && (
                        <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#ef4444", fontFamily: F }}>
                          {serverErr}
                        </div>
                      )}

                      <div style={{
                        background: `linear-gradient(135deg, ${ACC} 0%, ${ACC2} 100%)`,
                        borderRadius: 16, padding: "16px 18px",
                        boxShadow: "0 8px 28px rgba(2,132,199,0.3)",
                        marginTop: 4,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 2 }}>
                              Ukupno za plaćanje
                            </div>
                            <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", fontFamily: F, letterSpacing: "-0.05em", lineHeight: 1 }}>
                              {fmt(TOTAL)}
                            </div>
                          </div>
                          <div style={{ background: "rgba(74,222,128,0.18)", border: "1px solid rgba(74,222,128,0.32)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dostava</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#4ade80", fontFamily: F }}>uključena ✓</div>
                          </div>
                        </div>

                        <button
                          type="submit" disabled={loading}
                          style={{
                            width: "100%", padding: "14px 20px",
                            background: loading ? "rgba(255,255,255,0.55)" : "#fff",
                            color: ACC, border: "none", borderRadius: 12,
                            fontSize: 16, fontWeight: 900, fontFamily: F,
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            boxShadow: "0 4px 18px rgba(0,0,0,0.14)",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {loading ? (
                            <>
                              <svg className="zop-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="2.5" strokeLinecap="round">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                              </svg>
                              Šalje se...
                            </>
                          ) : (
                            <>
                              Naruči · Plaćanje pouzećem
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"/>
                              </svg>
                            </>
                          )}
                        </button>

                        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                          {["Euro Express 1-2 dana", "Bez predujma", "Povrat 14 dana"].map((t, i) => (
                            <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: F }}>✓ {t}</span>
                          ))}
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
