"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { event } from "@/lib/fbpixel";

const BLUE  = "#1a5fff";
const BLUE2 = "#1448d4";
const BLK   = "#0a0a1a";
const GR    = "#64748b";
const F     = "var(--font-manrope),-apple-system,sans-serif";

type BID = 1 | 2 | 3 | 4;
const BUNDLES: { id: BID; qty: string; qty_n: number; price: number; total: number; savings: number | null; badge: string | null; badgeColor: string }[] = [
  { id: 1, qty: "1 komad",  qty_n: 1, price: 13.90, total: 23.90, savings: null,  badge: null,               badgeColor: "" },
  { id: 2, qty: "2 komada", qty_n: 2, price: 21.90, total: 31.90, savings: 5.90,  badge: "TOP PONUDA",       badgeColor: "#f59e0b" },
  { id: 3, qty: "3 komada", qty_n: 3, price: 28.90, total: 38.90, savings: 12.90, badge: "NAJPOPULARNIJE",   badgeColor: "#e11d48" },
  { id: 4, qty: "4 komada", qty_n: 4, price: 34.90, total: 44.90, savings: 20.70, badge: "PORODIČNO",        badgeColor: BLUE2 },
];

function fmt(n: number) { return n.toFixed(2).replace(".", ",") + " KM"; }

type Fields = { ime: string; telefon: string; adresa: string; grad: string };
type Errs   = Partial<Record<keyof Fields, string>>;

interface Props { open: boolean; onClose: () => void; initialBundle: BID; }

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
        onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(26,95,255,0.1)`; }}
        onBlur={e  => { e.target.style.borderColor = error ? "#ef4444" : "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none"; }}
      />
      {error && <p style={{ margin: "5px 0 0", fontSize: 11, color: "#ef4444", fontFamily: F }}>{error}</p>}
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

  useEffect(() => { if (open) setBundle(initialBundle); }, [open, initialBundle]);

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

  const sel = BUNDLES.find(b => b.id === bundle)!;

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
            @keyframes op-spin { to { transform: rotate(360deg); } }
            .op-spin { animation: op-spin 0.85s linear infinite; }

            /* ── Overlay ── */
            .op-overlay {
              position: fixed; inset: 0; z-index: 9999;
              background: rgba(10,10,26,0.6);
              backdrop-filter: blur(4px);
              -webkit-backdrop-filter: blur(4px);
              display: flex; align-items: flex-end; justify-content: center;
            }
            @media (min-width: 641px) {
              .op-overlay { align-items: center; }
            }

            /* ── Modal shell ── */
            .op-modal {
              position: relative;
              width: 100%;
              max-width: 100%;
              max-height: 92dvh;
              background: #ffffff;
              border-radius: 24px 24px 0 0;
              display: flex; flex-direction: column;
              box-shadow: 0 -8px 60px rgba(10,10,26,0.2);
              overflow: hidden;
              touch-action: pan-y;
              overscroll-behavior: contain;
            }
            @media (min-width: 641px) {
              .op-modal {
                max-width: 500px;
                border-radius: 24px;
                box-shadow: 0 24px 80px rgba(10,10,26,0.22), 0 0 0 1px rgba(26,95,255,0.08);
                max-height: 90vh;
              }
            }

            /* ── Scrollable body ── */
            .op-body {
              overflow-y: auto;
              overscroll-behavior: contain;
              -webkit-overflow-scrolling: touch;
              flex: 1;
              padding: 20px 20px 32px;
            }

            /* ── Bundle grid ── */
            .op-bundles {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 9px;
              margin-bottom: 10px;
            }

            /* ── Form grid ── */
            .op-form-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            @media (max-width: 400px) {
              .op-form-row { grid-template-columns: 1fr; }
            }
          `}</style>

          {/* Overlay / backdrop */}
          <motion.div
            className="op-overlay"
            key="op-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          >
            {/* Modal — stop propagation so clicks inside don't close */}
            <motion.div
              className="op-modal"
              key="op-modal"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag handle (mobile only via CSS) */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.1)" }} />
              </div>

              {/* Header */}
              <div style={{
                background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`,
                padding: "14px 20px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                    Naruči odmah · Plaćanje pouzećem
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: F, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                    Usmjerivač Zraka Klime
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
              <div className="op-body">
                {done ? (
                  /* ── Success state ── */
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 8px 28px rgba(26,95,255,0.35)" }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: BLK, fontFamily: F, letterSpacing: "-0.03em", marginBottom: 10 }}>
                      Narudžba primljena!
                    </div>
                    <p style={{ fontSize: 14, color: GR, fontFamily: F, lineHeight: 1.7, maxWidth: 280, margin: "0 auto 28px" }}>
                      Kontaktiraćemo vas radi potvrde i dogovora oko dostave.
                    </p>
                    <button
                      onClick={handleClose}
                      style={{ padding: "12px 32px", background: BLUE, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: F, cursor: "pointer", boxShadow: "0 4px 16px rgba(26,95,255,0.3)" }}
                    >
                      Zatvori
                    </button>
                  </div>
                ) : (
                  <>
                    {/* ── Bundle picker ── */}
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                        Odaberite paket
                      </p>
                      <div className="op-bundles">
                        {BUNDLES.map(b => {
                          const active = bundle === b.id;
                          return (
                            <div
                              key={b.id}
                              onClick={() => setBundle(b.id)}
                              style={{
                                borderRadius: 14, cursor: "pointer",
                                padding: "12px 13px",
                                border: `2px solid ${active ? BLUE : "rgba(0,0,0,0.09)"}`,
                                background: active ? "#eef4ff" : "#fafafa",
                                boxShadow: active ? `0 0 0 3px rgba(26,95,255,0.1), 0 2px 12px rgba(26,95,255,0.1)` : "none",
                                transition: "all 0.15s",
                                position: "relative",
                              }}
                            >
                              {b.badge && (
                                <div style={{
                                  position: "absolute", top: -1, right: -1,
                                  background: b.badgeColor, color: "#fff",
                                  fontSize: 8, fontWeight: 800,
                                  padding: "2px 7px",
                                  borderRadius: "0 12px 0 8px",
                                  fontFamily: F, textTransform: "uppercase", letterSpacing: "0.05em",
                                }}>
                                  {b.badge}
                                </div>
                              )}
                              {/* Dots */}
                              <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                                {Array.from({ length: b.qty_n }).map((_, i) => (
                                  <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: active ? BLUE : "#cbd5e1" }} />
                                ))}
                              </div>
                              <div style={{ fontSize: 10, fontWeight: 600, color: GR, fontFamily: F, marginBottom: 3 }}>{b.qty}</div>
                              <div style={{ fontSize: 20, fontWeight: 900, color: active ? BLUE : BLK, fontFamily: F, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 3, transition: "color 0.15s" }}>
                                {fmt(b.price)}
                              </div>
                              {b.savings != null
                                ? <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", fontFamily: F }}>✓ Ušteda {fmt(b.savings)}</div>
                                : <div style={{ fontSize: 10, color: GR, fontFamily: F }}>+ 10 KM dostava</div>
                              }
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary strip */}
                      <div style={{
                        background: "#f0f6ff", border: `1.5px solid rgba(26,95,255,0.12)`,
                        borderRadius: 10, padding: "9px 14px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <div>
                          <div style={{ fontSize: 10, color: GR, fontFamily: F }}>{sel.qty} · dostava uključena</div>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: BLUE, fontFamily: F, letterSpacing: "-0.04em" }}>
                          {fmt(sel.total)}
                        </div>
                      </div>
                    </div>

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="op-form-row">
                        <Field label="Ime i prezime" placeholder="Amira Kovačević" value={fields.ime} error={errors.ime}
                          onChange={v => { setFields(f => ({ ...f, ime: v })); setErrors(e => ({ ...e, ime: undefined })); }} />
                        <Field label="Telefon" type="tel" placeholder="061 234 567" value={fields.telefon} error={errors.telefon}
                          onChange={v => { setFields(f => ({ ...f, telefon: v })); setErrors(e => ({ ...e, telefon: undefined })); }} />
                      </div>
                      <div className="op-form-row">
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

                      {/* ── CTA block ── */}
                      <div style={{
                        background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`,
                        borderRadius: 16, padding: "16px 18px",
                        boxShadow: "0 8px 28px rgba(26,95,255,0.3)",
                        marginTop: 4,
                      }}>
                        {/* Price row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 2 }}>
                              Ukupno za plaćanje
                            </div>
                            <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", fontFamily: F, letterSpacing: "-0.05em", lineHeight: 1 }}>
                              {fmt(sel.total)}
                            </div>
                          </div>
                          <div style={{ background: "rgba(74,222,128,0.18)", border: "1px solid rgba(74,222,128,0.32)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dostava</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#4ade80", fontFamily: F }}>uključena ✓</div>
                          </div>
                        </div>

                        {/* Submit button */}
                        <button
                          type="submit"
                          disabled={loading}
                          style={{
                            width: "100%", padding: "14px 20px",
                            background: loading ? "rgba(255,255,255,0.55)" : "#fff",
                            color: BLUE, border: "none", borderRadius: 12,
                            fontSize: 16, fontWeight: 900, fontFamily: F,
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            boxShadow: "0 4px 18px rgba(0,0,0,0.14)",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {loading ? (
                            <>
                              <svg className="op-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                              </svg>
                              Šalje se...
                            </>
                          ) : (
                            <>
                              Naruči — Plaćanje pouzećem
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"/>
                              </svg>
                            </>
                          )}
                        </button>

                        {/* Trust badges */}
                        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                          {["Dostava 48h", "Bez predujma", "Povrat 14 dana"].map((t, i) => (
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
