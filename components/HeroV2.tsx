"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const IMAGES = [
  { src: "/images/product-1.webp", alt: "Radne Patike S3 · sprijeda" },
  { src: "/images/product-2.webp", alt: "Radne Patike S3 · BOA sistem" },
  { src: "/images/product-3.webp", alt: "Radne Patike S3 · đon" },
  { src: "/images/product-4.webp", alt: "Radne Patike S3 · bočni pogled" },
];

const BENEFITS = [
  "Čelična kapica — zaštita do 200 J",
  "Anti-klizajući SRC đon",
  "EN ISO 20345 S3 certifikat",
  "BOA® Fit System — podešavanje za 3 sekunde",
  "Svega 650g — udobne cijeli dan",
  "Vodootporna membrana",
];

const TRUST = [
  {
    label: "Plaćanje pouzećem",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Povrat 14 dana",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
      </svg>
    ),
  },
  {
    label: "Dostava 1–3 dana",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
];

export default function HeroV2({ onOrder }: { onOrder: () => void }) {
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setImgIndex((i) => (i === 0 ? IMAGES.length - 1 : i - 1));
  const next = () => setImgIndex((i) => (i === IMAGES.length - 1 ? 0 : i + 1));

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) next(); else prev(); }
    touchStartX.current = null;
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        .hero2-grid { display: flex; gap: 64px; align-items: flex-start; }
        .hero2-img-col { flex: 0 0 500px; }
        .hero2-info-col { flex: 1; padding-top: 8px; }
        .hero2-thumb { border: 2px solid transparent; border-radius: 8px; overflow: hidden; cursor: pointer; transition: border-color 150ms, transform 150ms; aspect-ratio: 1/1; position: relative; background: #F5F5F5; }
        .hero2-thumb:hover { transform: scale(1.04); }
        .hero2-thumb.active { border-color: #F97316; }
        .hero2-cta { background: #F97316; color: #fff; border: none; border-radius: 12px; padding: 18px 32px; font-family: var(--font-manrope), sans-serif; font-weight: 800; font-size: 17px; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 180ms, transform 150ms; }
        .hero2-cta:hover { background: #ea6c0f; transform: translateY(-1px); }
        .hero2-cta:active { transform: scale(0.98); }
        .hero2-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); opacity: 0; transition: opacity 180ms; }
        .hero2-slider:hover .hero2-arrow { opacity: 1; }

        @media (max-width: 900px) {
          .hero2-grid { flex-direction: column; gap: 0; }
          .hero2-img-col { flex: none; width: 100%; }
          .hero2-info-col { width: 100%; padding: 24px 0 0; }
          .hero2-slider { border-radius: 0 !important; }
        }
      `}</style>

      <section style={{ background: "#fff", padding: "48px 0 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div className="hero2-grid">

            {/* IMAGE COLUMN */}
            <div className="hero2-img-col">
              {/* Main image */}
              <div
                className="hero2-slider"
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "linear-gradient(145deg, #F7F4EF 0%, #EEEBE4 100%)",
                  boxShadow: "0 2px 24px rgba(0,0,0,0.07)",
                }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {IMAGES.map((img, i) => (
                  <div key={i} style={{
                    position: "absolute", inset: 0,
                    opacity: i === imgIndex ? 1 : 0,
                    transition: "opacity 300ms ease",
                    zIndex: i === imgIndex ? 1 : 0,
                  }}>
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} priority={i === 0} />
                  </div>
                ))}

                <button className="hero2-arrow" onClick={prev} style={{ left: 12 }} aria-label="Prethodna slika">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button className="hero2-arrow" onClick={next} style={{ right: 12 }} aria-label="Sljedeća slika">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>

                <div style={{
                  position: "absolute", bottom: 12, right: 12, zIndex: 10,
                  background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
                  borderRadius: 6, padding: "3px 9px",
                  fontSize: 11, fontWeight: 700, color: "#fff",
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  {imgIndex + 1} / {IMAGES.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                {IMAGES.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`hero2-thumb${i === imgIndex ? " active" : ""}`}
                    aria-label={`Slika ${i + 1}`}
                    style={{ flex: 1 }}
                  >
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO COLUMN */}
            <div className="hero2-info-col">

              {/* Category tag */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#F97316",
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  Zaštitna obuća S3
                </span>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#ddd", display: "inline-block" }} />
                <span style={{
                  fontSize: 11, fontWeight: 600, color: "#16A34A",
                  fontFamily: "var(--font-manrope), sans-serif",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
                  Na stanju
                </span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: "clamp(30px, 4vw, 44px)",
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "#111111",
                fontFamily: "var(--font-manrope), sans-serif",
                marginBottom: 16,
              }}>
                Tactical Black S3<br />
                <span style={{ color: "#aaa", fontWeight: 600, fontSize: "0.75em" }}>Radne Patike</span>
              </h1>

              {/* Stars */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="#F97316" stroke="#F97316" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111", fontFamily: "var(--font-manrope), sans-serif" }}>4.8</span>
                <span style={{ fontSize: 13, color: "#999", fontFamily: "var(--font-manrope), sans-serif" }}>1.200+ kupaca</span>
              </div>

              {/* Price */}
              <div style={{
                display: "flex", alignItems: "baseline", gap: 12,
                marginBottom: 28, flexWrap: "wrap",
              }}>
                <span style={{
                  fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 900,
                  color: "#111111", letterSpacing: "-0.04em", lineHeight: 1,
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  59,90 KM
                </span>
                <span style={{
                  fontSize: 16, color: "#bbb", textDecoration: "line-through",
                  fontWeight: 500, fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  139,90 KM
                </span>
                <span style={{
                  background: "#16A34A", color: "#fff",
                  fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  −57%
                </span>
              </div>

              {/* Benefits list */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                {BENEFITS.map((b) => (
                  <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "var(--font-manrope), sans-serif" }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "rgba(249,115,22,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span style={{ fontSize: 14, color: "#333", lineHeight: 1.5, fontWeight: 500 }}>{b}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button onClick={onOrder} className="hero2-cta" style={{ marginBottom: 16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Odaberi veličinu i naruči
              </button>

              {/* Trust row */}
              <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
                {TRUST.map(({ label, icon }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontFamily: "var(--font-manrope), sans-serif",
                    fontSize: 12, color: "#666", fontWeight: 500,
                  }}>
                    <span style={{ color: "#999" }}>{icon}</span>
                    {label}
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
