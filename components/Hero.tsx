"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { event } from "@/lib/fbpixel";

const ACCENT  = "#FF6B00";
const ACCENT2 = "#E85E00";

const IMAGES = [
  { src: "/images/product-1.webp", alt: "Radne Patike S3 · pogled sprijeda" },
  { src: "/images/product-2.webp", alt: "Radne Patike S3 · BOA sistem detalj" },
  { src: "/images/product-3.webp", alt: "Radne Patike S3 · đon detalj" },
  { src: "/images/product-4.webp", alt: "Radne Patike S3 · bočni pogled" },
];

const TRUST = [
  {
    label: "Plaćanje pouzećem",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Dostava 10 KM",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    label: "Povrat 14 dana",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
      </svg>
    ),
  },
  {
    label: "S3 Certifikat",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

export default function Hero() {
  const [imgIndex, setImgIndex]  = useState(0);
  const [viewers, setViewers]    = useState(0);
  const [secs, setSecs]          = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Countdown · random 12–48 min, resets to new random when expired
  useEffect(() => {
    const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setSecs(rand(12, 48) * 60);
    const id = setInterval(() => {
      setSecs(prev => {
        if (prev === null) return null;
        if (prev <= 1) return rand(15, 44) * 60; // reset, never expires
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const prev = () => setImgIndex((i) => (i === 0 ? IMAGES.length - 1 : i - 1));
  const next = () => setImgIndex((i) => (i === IMAGES.length - 1 ? 0 : i + 1));

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) next(); else prev(); }
    touchStartX.current = null;
  };

  const handleCTA = () => {
    event("AddToCart", { content_name: "Radne Patike S3 Tactical Black", value: 59.90, currency: "BAM" });
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  };

  // Live viewer count
  useEffect(() => {
    const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setViewers(rand(54, 89));
    const id = setInterval(() => {
      setViewers(v => Math.min(110, Math.max(38, v + rand(-3, 4))));
    }, rand(18_000, 32_000));
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes hero-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .hero-live-dot { animation: hero-pulse 2s ease-in-out infinite; }

        @keyframes hero-badge-in {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .hero-badge { animation: hero-badge-in 0.5s ease both; }

        .hero-thumb {
          border: 2px solid transparent;
          transition: border-color 150ms, transform 150ms;
          cursor: pointer;
        }
        .hero-thumb:hover { transform: scale(1.05); }
        .hero-thumb.active { border-color: ${ACCENT}; }

        .hero-cta {
          background: ${ACCENT};
          transition: background 200ms, transform 180ms, box-shadow 200ms;
        }
        .hero-cta:hover {
          background: ${ACCENT2};
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255,107,0,0.38);
        }
        .hero-cta:active { transform: scale(0.97); }

        .hero-arrow {
          opacity: 0;
          transition: opacity 200ms, background 150ms;
        }
        .hero-slider-wrap:hover .hero-arrow { opacity: 1; }

        @media (max-width: 1023px) {
          .hero-grid        { flex-direction: column !important; gap: 0 !important; }
          .hero-img-col     { width: 100% !important; max-width: 100% !important; align-self: unset !important; gap: 0 !important; }
          .hero-inner       { padding: 0 0 40px !important; }
          .hero-badge-row   { display: none !important; }
          .hero-slider-wrap { border-radius: 0 !important; box-shadow: none !important; aspect-ratio: 4/3 !important; }
          .hero-thumbs      { padding: 10px 16px 0 !important; gap: 8px !important; }
          .hero-scarcity    { margin: 12px 16px 0 !important; }
          .hero-info-inner  { padding: 20px 16px 0 !important; }
          .hero-info-col    { width: 100% !important; padding-top: 0 !important; }
        }
        @media (max-width: 640px) {
          .hero-trust-grid  { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <section style={{ background: "#fff", paddingTop: 60 }}>
        <div className="hero-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 56px" }}>

          {/* ── Top badge row (desktop only · hidden on mobile) ─── */}
          <div className="hero-badge hero-badge-row" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            <span style={{
              background: "#0A0A0A", color: "#fff",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", padding: "5px 13px", borderRadius: 4,
              fontFamily: "var(--font-manrope), sans-serif",
            }}>
              EN ISO 20345 S3
            </span>
            <span style={{
              background: "rgba(255,107,0,0.1)", color: ACCENT,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", padding: "5px 13px", borderRadius: 4,
              fontFamily: "var(--font-manrope), sans-serif",
              border: `1px solid rgba(255,107,0,0.25)`,
            }}>
              BOA Fit System™
            </span>
            <span style={{
              background: "rgba(22,163,74,0.08)", color: "#16A34A",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", padding: "5px 13px", borderRadius: 4,
              fontFamily: "var(--font-manrope), sans-serif",
              border: "1px solid rgba(22,163,74,0.2)",
            }}>
              ✓ Na stanju
            </span>

            {viewers > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(0,0,0,0.04)", borderRadius: 4,
                padding: "5px 12px", marginLeft: "auto",
                fontFamily: "var(--font-manrope), sans-serif",
              }}>
                <span className="hero-live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#444" }}>
                  <strong style={{ color: "#0A0A0A" }}>{viewers}</strong> osoba trenutno gleda
                </span>
              </span>
            )}
          </div>

          {/* ── Main grid ─── */}
          <div className="hero-grid" style={{ display: "flex", gap: 52, alignItems: "flex-start" }}>

            {/* IMAGE COLUMN */}
            <div className="hero-img-col" style={{ flex: "0 0 480px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Main image */}
              <div
                className="hero-slider-wrap"
                style={{
                  position:     "relative",
                  aspectRatio:  "1 / 1",
                  borderRadius: 20,
                  overflow:     "hidden",
                  background:   "linear-gradient(145deg, #F7F4EF 0%, #EEEBE4 100%)",
                  boxShadow:    "0 4px 32px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.06)",
                  userSelect:   "none",
                }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {/* Orange glow behind shoe */}
                <div aria-hidden="true" style={{
                  position: "absolute", bottom: "-10%", left: "50%",
                  transform: "translateX(-50%)",
                  width: "70%", height: "40%",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(255,107,0,0.18) 0%, transparent 70%)",
                  zIndex: 0, pointerEvents: "none",
                }} />

                {IMAGES.map((img, i) => (
                  <div key={i} style={{
                    position: "absolute", inset: 0, zIndex: i === imgIndex ? 1 : 0,
                    opacity: i === imgIndex ? 1 : 0,
                    transition: "opacity 350ms ease",
                  }}>
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} priority={i === 0} />
                  </div>
                ))}

                {/* Arrows */}
                <button
                  className="hero-arrow"
                  onClick={prev}
                  aria-label="Prethodna slika"
                  style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    zIndex: 10, width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <button
                  className="hero-arrow"
                  onClick={next}
                  aria-label="Sljedeća slika"
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    zIndex: 10, width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>

                {/* Image counter */}
                <div style={{
                  position: "absolute", bottom: 14, right: 14, zIndex: 10,
                  background: "rgba(0,0,0,0.48)", backdropFilter: "blur(4px)",
                  borderRadius: 6, padding: "4px 10px",
                  fontSize: 11, fontWeight: 700, color: "#fff",
                  fontFamily: "var(--font-manrope), sans-serif",
                  letterSpacing: "0.05em",
                }}>
                  {imgIndex + 1} / {IMAGES.length}
                </div>

                {/* ── Mobile-only overlays ── */}
                <style suppressHydrationWarning>{`
                  .hero-mob-badges { display: none; }
                  .hero-mob-viewers { display: none; }
                  @media (max-width: 1023px) {
                    .hero-mob-badges  { display: flex !important; }
                    .hero-mob-viewers { display: flex !important; }
                  }
                `}</style>

                {/* Badges overlay · top left */}
                <div className="hero-mob-badges" style={{
                  position: "absolute", top: 12, left: 12, zIndex: 10,
                  flexDirection: "column", gap: 6,
                }}>
                  <span style={{
                    background: "rgba(10,10,10,0.72)", backdropFilter: "blur(8px)",
                    color: "#fff", fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    padding: "5px 10px", borderRadius: 6,
                    fontFamily: "var(--font-manrope), sans-serif",
                    width: "fit-content",
                  }}>EN ISO 20345 S3</span>
                  <span style={{
                    background: "rgba(255,107,0,0.85)", backdropFilter: "blur(8px)",
                    color: "#fff", fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "5px 10px", borderRadius: 6,
                    fontFamily: "var(--font-manrope), sans-serif",
                    width: "fit-content",
                  }}>BOA Fit System™</span>
                </div>

                {/* Viewer count overlay · top right */}
                {viewers > 0 && (
                  <div className="hero-mob-viewers" style={{
                    position: "absolute", top: 12, right: 12, zIndex: 10,
                    alignItems: "center", gap: 5,
                    background: "rgba(0,0,0,0.58)", backdropFilter: "blur(8px)",
                    borderRadius: 8, padding: "6px 10px",
                  }}>
                    <span className="hero-live-dot" style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#ef4444", display: "inline-block", flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#fff",
                      fontFamily: "var(--font-manrope), sans-serif",
                    }}>
                      {viewers} gleda
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="hero-thumbs" style={{ display: "flex", gap: 10 }}>
                {IMAGES.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`hero-thumb${i === imgIndex ? " active" : ""}`}
                    aria-label={`Slika ${i + 1}`}
                    style={{
                      flex: 1, aspectRatio: "1/1", borderRadius: 10, overflow: "hidden",
                      background: "#F5F5F5", position: "relative",
                    }}
                  >
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} />
                    {i === imgIndex && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(255,107,0,0.12)" }} />
                    )}
                  </button>
                ))}
              </div>

              {/* Scarcity bar */}
              <div className="hero-scarcity" style={{
                background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.18)",
                borderRadius: 10, padding: "12px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0A0A0A", fontFamily: "var(--font-manrope), sans-serif" }}>
                    Prodato ovog tjedna
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT, fontFamily: "var(--font-manrope), sans-serif" }}>
                    89%
                  </span>
                </div>
                <div style={{ height: 6, background: "rgba(0,0,0,0.08)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: "89%", borderRadius: 999,
                    background: `linear-gradient(90deg, ${ACCENT}, #FF9A3C)`,
                    transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
                  }} />
                </div>
                <p style={{ fontSize: 11, color: "#888", marginTop: 6, fontFamily: "var(--font-manrope), sans-serif" }}>
                  Preostalo: ograničena zaliha · naruči odmah
                </p>
              </div>
            </div>

            {/* INFO COLUMN */}
            <div className="hero-info-col hero-info-inner" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0, paddingTop: 4 }}>

              {/* Category */}
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: ACCENT, display: "block", marginBottom: 12,
                fontFamily: "var(--font-manrope), sans-serif",
              }}>
                Zaštitna obuća S3 · Serija Tactical
              </span>

              {/* H1 */}
              <h1 style={{
                fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 900, lineHeight: 1.06,
                letterSpacing: "-0.03em", color: "#0A0A0A", marginBottom: 16,
                fontFamily: "var(--font-manrope), sans-serif",
              }}>
                Radne Patike S3<br />
                <span style={{ color: "rgba(10,10,10,0.3)", fontWeight: 700 }}>Tactical Black</span>
              </h1>

              {/* Stars + review count */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24"
                      fill={i < 5 ? ACCENT : "none"} stroke={ACCENT} strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A", fontFamily: "var(--font-manrope), sans-serif" }}>4,8</span>
                <span style={{ fontSize: 13, color: "#999", fontFamily: "var(--font-manrope), sans-serif" }}>/ 1.200+ zadovoljnih kupaca</span>
              </div>

              {/* Price block */}
              <div style={{
                background: "linear-gradient(135deg, #FFF8F4 0%, #FFF3EB 100%)",
                border: "1px solid rgba(255,107,0,0.15)",
                borderRadius: 16, padding: "20px 22px", marginBottom: 24,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 900, color: "#0A0A0A",
                    letterSpacing: "-0.04em", lineHeight: 1,
                    fontFamily: "var(--font-manrope), sans-serif",
                  }}>
                    59,90 KM
                  </span>
                  <span style={{
                    fontSize: 16, color: "rgba(0,0,0,0.35)", textDecoration: "line-through",
                    fontWeight: 500, fontFamily: "var(--font-manrope), sans-serif",
                  }}>
                    139,90 KM
                  </span>
                  <span style={{
                    background: "#16A34A", color: "#fff",
                    fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 6,
                    fontFamily: "var(--font-manrope), sans-serif",
                    letterSpacing: "0.02em",
                  }}>
                    −57%
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", margin: "0 0 14px", fontFamily: "var(--font-manrope), sans-serif" }}>
                  +10,00 KM dostava · Plaćanje pouzećem · Nema skrivenih troškova
                </p>

                {/* Countdown timer */}
                {secs !== null && (
                  <div style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          10,
                    background:   "rgba(255,255,255,0.7)",
                    border:       "1px solid rgba(255,107,0,0.2)",
                    borderRadius: 10,
                    padding:      "10px 14px",
                  }}>
                    {/* Clock icon */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>

                    <span style={{
                      fontSize:   12,
                      fontWeight: 500,
                      color:      "rgba(0,0,0,0.55)",
                      fontFamily: "var(--font-manrope), sans-serif",
                      flexShrink: 0,
                    }}>
                      Akcijska cijena ističe za:
                    </span>

                    {/* Timer digits */}
                    <span style={{
                      fontSize:      14,
                      fontWeight:    900,
                      color:         "#FF6B00",
                      letterSpacing: "0.06em",
                      fontFamily:    "var(--font-manrope), sans-serif",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {String(Math.floor(secs / 3600)).padStart(2, "0")}:
                      {String(Math.floor((secs % 3600) / 60)).padStart(2, "0")}:
                      {String(secs % 60).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p style={{
                fontSize: 15, lineHeight: 1.7, color: "rgba(10,10,10,0.6)", marginBottom: 28,
                fontFamily: "var(--font-manrope), sans-serif",
              }}>
                Profesionalna zaštitna obuća s <strong style={{ color: "#0A0A0A" }}>čeličnom kapicom</strong> i{" "}
                <strong style={{ color: "#0A0A0A" }}>BOA® Fit sistemom</strong> zatvaranja. Certificirana po{" "}
                <strong style={{ color: "#0A0A0A" }}>EN ISO 20345 S3</strong> standardu —
                za maksimalnu zaštitu i udobnost na svakom radnom mjestu.
              </p>


              {/* CTA Button */}
              <button
                onClick={handleCTA}
                className="hero-cta"
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  color: "#fff", borderRadius: 14, padding: "18px 32px",
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 800, fontSize: 17, border: "none", cursor: "pointer",
                  letterSpacing: "0.01em", marginBottom: 12,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Odaberi veličinu i naruči
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>

              <p style={{
                textAlign: "center", fontSize: 12, color: "#bbb", marginBottom: 24,
                fontFamily: "var(--font-manrope), sans-serif",
              }}>
                Naruči bez plaćanja · platite pri preuzimanju paketa
              </p>

              {/* Trust grid */}
              <div className="hero-trust-grid" style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
                borderTop: "1px solid #F0F0F0", paddingTop: 20,
              }}>
                {TRUST.map(({ label, svg }) => (
                  <div key={label} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    padding: "14px 8px", borderRadius: 12, background: "#FAFAFA",
                    border: "1px solid #F0F0F0", textAlign: "center",
                  }}>
                    <div style={{ color: ACCENT }}>{svg}</div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: "#555", lineHeight: 1.35,
                      fontFamily: "var(--font-manrope), sans-serif",
                    }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
