"use client";

import { useState, FormEvent } from "react";

const KOLICINE = [
  "10 – 20 pari",
  "21 – 50 pari",
  "51 – 100 pari",
  "100+ pari",
];

type Fields = { firma: string; kontakt: string; grad: string; adresa: string; kolicina: string };
type Errors = Partial<Record<keyof Fields, string>>;

export default function B2BSection() {
  const [fields,    setFields]    = useState<Fields>({ firma: "", kontakt: "", grad: "", adresa: "", kolicina: "" });
  const [errors,    setErrors]    = useState<Errors>({});
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  function set(key: keyof Fields, val: string) {
    setFields(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e: Errors = {};
    if (!fields.firma.trim())   e.firma   = "Unesite naziv firme";
    if (!fields.kontakt.trim()) e.kontakt = "Unesite kontakt telefon";
    if (!fields.grad.trim())    e.grad    = "Unesite grad";
    if (!fields.adresa.trim())  e.adresa  = "Unesite adresu";
    if (!fields.kolicina)       e.kolicina = "Odaberite količinu";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerErr(null);
    try {
      const res = await fetch("/api/b2b-inquiry", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Greška");
      setSubmitted(true);
    } catch {
      setServerErr("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ background: "#0A0A0A", position: "relative", overflow: "hidden" }}>

      {/* Subtle radial glow top-left */}
      <div aria-hidden style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: "50%", height: "80%",
        background: "radial-gradient(ellipse, rgba(255,107,0,0.08) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <style suppressHydrationWarning>{`
        @media (max-width: 768px) { .b2b-grid { grid-template-columns: 1fr !important; } }
        .b2b-input::placeholder { color: #9CA3AF !important; }
        .b2b-input:focus { outline: none; border-color: #B33000 !important; box-shadow: 0 0 0 3px rgba(255,107,0,0.12) !important; }
        .b2b-qty-btn:hover { background: #FFF7F0 !important; border-color: #B33000 !important; color: #B33000 !important; }
        .b2b-submit-btn { transition: background 150ms, transform 150ms, box-shadow 150ms; }
        .b2b-submit-btn:hover:not(:disabled) { background: #B33000 !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,107,0,0.35) !important; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(56px,8vw,96px) clamp(16px,4vw,48px)", position: "relative", zIndex: 1 }}>
        <div className="b2b-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,64px)", alignItems: "start" }}>

          {/* ── Left: headline + benefits ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* B2B pill */}
            <div>
              <span style={{
                display: "inline-block",
                background: "rgba(255,107,0,0.15)", color: "#B33000",
                fontSize: 11, fontWeight: 800, letterSpacing: "0.14em",
                textTransform: "uppercase", padding: "5px 14px", borderRadius: 999,
                fontFamily: "var(--font-manrope), sans-serif",
                border: "1px solid rgba(255,107,0,0.3)",
                marginBottom: 16,
              }}>
                B2B
              </span>

              <h2 style={{
                fontSize: "clamp(28px,4vw,48px)", fontWeight: 900,
                color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1,
                margin: "0 0 16px", fontFamily: "var(--font-manrope), sans-serif",
              }}>
                Naručujete<br />
                <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>za firmu?</span>
              </h2>

              <p style={{
                fontSize: 15, color: "rgba(255,255,255,0.55)",
                lineHeight: 1.7, margin: 0,
                fontFamily: "var(--font-manrope), sans-serif",
                maxWidth: 380,
              }}>
                Posebne cijene za veće narudžbe, dostava na adresu firme i PDV račun — sve u jednoj narudžbi.
              </p>
            </div>

            {/* Benefit items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                  ),
                  title: "Zaštita vaših zaposlenika",
                  desc:  "EN ISO 20345 S3 certifikat · ispunjavate zakonsku obavezu zaštite na radu.",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="1"/>
                      <path d="M16 8h4l3 5v3h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  ),
                  title: "Dostava na adresu firme",
                  desc:  "Organizujemo dostavu direktno na vaše radno mjesto.",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  ),
                  title: "Faktura i PDV račun",
                  desc:  "Izdajemo sve potrebne dokumente za vaše računovodstvo.",
                },
              ].map(item => (
                <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: "rgba(255,107,0,0.12)",
                    border: "1px solid rgba(255,107,0,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#B33000",
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: "#fff",
                      marginBottom: 4, fontFamily: "var(--font-manrope), sans-serif",
                    }}>{item.title}</div>
                    <div style={{
                      fontSize: 13, color: "rgba(255,255,255,0.45)",
                      lineHeight: 1.6, fontFamily: "var(--font-manrope), sans-serif",
                    }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Response time note */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{
                fontSize: 12, color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-manrope), sans-serif", fontWeight: 500,
              }}>
                Odgovaramo u roku od 24h · Bez obaveze kupovine
              </span>
            </div>
          </div>

          {/* ── Right: white form card ── */}
          {submitted ? (
            <div style={{
              background: "#fff",
              borderRadius: 20, padding: "48px 36px", textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "rgba(22,163,74,0.10)",
                border: "2px solid rgba(22,163,74,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 10px",
                fontFamily: "var(--font-manrope), sans-serif", letterSpacing: "-0.02em",
              }}>Upit primljen!</h3>
              <p style={{
                fontSize: 14, color: "#6B7280",
                margin: 0, lineHeight: 1.65,
                fontFamily: "var(--font-manrope), sans-serif",
              }}>
                Kontaktiramo vas u roku od 24h sa personalnom ponudom za vašu firmu.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: "#fff",
              borderRadius: 20, padding: "clamp(24px,3vw,36px)",
              display: "flex", flexDirection: "column", gap: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}>

              {([
                { key: "firma",   label: "Naziv firme",      placeholder: "Npr. Građevina d.o.o.", type: "text" },
                { key: "kontakt", label: "Kontakt telefon",  placeholder: "Npr. 061 234 567",      type: "tel"  },
                { key: "grad",    label: "Grad",             placeholder: "Npr. Sarajevo",         type: "text" },
                { key: "adresa",  label: "Adresa firme",     placeholder: "Npr. Titova 12",        type: "text" },
              ] as { key: keyof Fields; label: string; placeholder: string; type: string }[]).map(f => (
                <div key={f.key}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 700,
                    color: "#374151", marginBottom: 6,
                    fontFamily: "var(--font-manrope), sans-serif",
                    textTransform: "uppercase", letterSpacing: "0.07em",
                  }}>{f.label}</label>
                  <input
                    className="b2b-input"
                    type={f.type}
                    placeholder={f.placeholder}
                    value={fields[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "#F9FAFB",
                      border: `1.5px solid ${errors[f.key] ? "#EF4444" : "#E5E7EB"}`,
                      borderRadius: 10, padding: "13px 16px",
                      fontSize: 14, color: "#111",
                      fontFamily: "var(--font-manrope), sans-serif",
                      outline: "none",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                  />
                  {errors[f.key] && (
                    <p style={{ fontSize: 11, color: "#EF4444", margin: "5px 0 0", fontFamily: "var(--font-manrope), sans-serif" }}>{errors[f.key]}</p>
                  )}
                </div>
              ))}

              {/* Količina */}
              <div>
                <label style={{
                  display: "block", fontSize: 11, fontWeight: 700,
                  color: "#374151", marginBottom: 8,
                  fontFamily: "var(--font-manrope), sans-serif",
                  textTransform: "uppercase", letterSpacing: "0.07em",
                }}>Količina pari</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {KOLICINE.map(k => (
                    <button
                      key={k} type="button"
                      className="b2b-qty-btn"
                      onClick={() => set("kolicina", k)}
                      style={{
                        padding: "12px 8px",
                        background: fields.kolicina === k ? "#FFF0E6" : "#F9FAFB",
                        border: `1.5px solid ${fields.kolicina === k ? "#B33000" : "#E5E7EB"}`,
                        borderRadius: 10, cursor: "pointer",
                        fontSize: 13, fontWeight: 700,
                        color: fields.kolicina === k ? "#B33000" : "#6B7280",
                        fontFamily: "var(--font-manrope), sans-serif",
                        transition: "all 0.15s ease",
                      }}
                    >{k}</button>
                  ))}
                </div>
                {errors.kolicina && (
                  <p style={{ fontSize: 11, color: "#EF4444", margin: "5px 0 0", fontFamily: "var(--font-manrope), sans-serif" }}>{errors.kolicina}</p>
                )}
              </div>

              {serverErr && (
                <p style={{
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  borderRadius: 8, padding: "10px 14px",
                  fontSize: 13, color: "#DC2626", margin: 0,
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>{serverErr}</p>
              )}

              <button
                type="submit" disabled={loading}
                className="b2b-submit-btn"
                style={{
                  background: loading ? "rgba(255,107,0,0.5)" : "#B33000",
                  color: "#fff", fontWeight: 800, fontSize: 15,
                  border: "none", borderRadius: 12, padding: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-manrope), sans-serif",
                  letterSpacing: "-0.01em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading ? "Slanje..." : (
                  <>
                    Pošalji upit
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </>
                )}
              </button>

              <p style={{
                fontSize: 11, color: "#9CA3AF",
                textAlign: "center", margin: 0, lineHeight: 1.5,
                fontFamily: "var(--font-manrope), sans-serif",
              }}>
                Odgovaramo u roku od 24h radnim danima
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
