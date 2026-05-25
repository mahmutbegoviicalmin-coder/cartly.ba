"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const MAN = "var(--font-manrope), sans-serif";
const ACC = "#FF6B00";

// ─── SVG trust icons ───────────────────────────────────────────────────────────
const T = {
  truck: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  card: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  ref: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
    </svg>
  ),
  shield: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

const TRUST = [
  { icon: T.truck,  text: "Dostava 24–48h"     },
  { icon: T.card,   text: "Pouzećem"            },
  { icon: T.ref,    text: "Povrat 14 dana"      },
  { icon: T.shield, text: "Provjeren kvalitet"  },
] as { icon: JSX.Element; text: string }[];

// ─── Product card data ─────────────────────────────────────────────────────────
interface CardData {
  src:        string;
  name:       string;
  sub:        string;
  price:      string;
  old:        string;
  href:       string;
  discount:   number;
  posStyle:   React.CSSProperties;
  rotate:     string;
  imgH:       number;
  sizes:      string;
  large:      boolean;
}

const CARDS: CardData[] = [
  {
    src:      "/images/product-1.webp",
    name:     "Radne Patike S3",
    sub:      "Zaštitna obuća · EN ISO 20345",
    price:    "59,90 KM",
    old:      "139,90 KM",
    href:     "/radne-patike",
    discount: 57,
    posStyle: { left: 0, top: 0, width: "53%", height: "100%", zIndex: 2 },
    rotate:   "-2.5deg",
    imgH:     196,
    sizes:    "280px",
    large:    true,
  },
  {
    src:      "/images/milwaukee.png",
    name:     "Milwaukee M18",
    sub:      "Profesionalni alat",
    price:    "69,90 KM",
    old:      "299,90 KM",
    href:     "/milwaukee-busilica",
    discount: 77,
    posStyle: { right: 0, top: 0, width: "44%", height: "48%", zIndex: 1 },
    rotate:   "2deg",
    imgH:     112,
    sizes:    "200px",
    large:    false,
  },
  {
    src:      "/images/kamere.png",
    name:     "Sigurnosna Kamera",
    sub:      "Video nadzor 12MP",
    price:    "89,90 KM",
    old:      "149,90 KM",
    href:     "/kamera",
    discount: 40,
    posStyle: { right: 0, bottom: 0, width: "44%", height: "50%", zIndex: 1 },
    rotate:   "-1.5deg",
    imgH:     112,
    sizes:    "200px",
    large:    false,
  },
];

// ─── Product card component ────────────────────────────────────────────────────
function ProductCard({ card }: { card: CardData }) {
  const [hov, setHov] = useState(false);

  return (
    <Link
      href={card.href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:       "absolute",
        ...card.posStyle,
        display:        "flex",
        flexDirection:  "column",
        background:     "#FFFFFF",
        borderRadius:   24,
        overflow:       "hidden",
        textDecoration: "none",
        transform:      hov
          ? "rotate(0deg) scale(1.045) translateY(-10px)"
          : `rotate(${card.rotate})`,
        boxShadow:      hov
          ? "0 32px 80px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.07)"
          : "0 8px 36px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.04)",
        transition:     "transform 360ms cubic-bezier(0.22,1,0.36,1), box-shadow 360ms ease",
      }}
    >
      {/* Discount badge */}
      <div style={{
        position:      "absolute",
        top:           12,
        right:         12,
        background:    "#111",
        color:         "#fff",
        fontSize:      10,
        fontWeight:    800,
        letterSpacing: "0.04em",
        padding:       "3px 9px",
        borderRadius:  8,
        zIndex:        3,
        fontFamily:    MAN,
      }}>
        -{card.discount}%
      </div>

      {/* Image */}
      <div style={{
        flex:           "1 1 auto",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        card.large ? "32px 24px 18px" : "18px 16px 12px",
        position:       "relative",
      }}>
        <div aria-hidden style={{
          position:      "absolute",
          inset:         0,
          background:    "radial-gradient(ellipse at 50% 85%, rgba(255,107,0,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", width: "100%", height: card.imgH, zIndex: 1 }}>
          <Image
            src={card.src}
            alt={card.name}
            fill
            style={{ objectFit: "contain", mixBlendMode: "multiply" }}
            sizes={card.sizes}
          />
        </div>
      </div>

      {/* Info strip */}
      <div style={{
        padding:   card.large ? "14px 20px 20px" : "10px 15px 15px",
        borderTop: "1px solid #F0F0EE",
      }}>
        <p style={{
          fontSize:      9,
          fontWeight:    700,
          color:         "rgba(0,0,0,0.36)",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontFamily:    MAN,
          margin:        "0 0 3px",
        }}>
          {card.sub}
        </p>
        <p style={{
          fontSize:   card.large ? 14 : 12,
          fontWeight: 800,
          color:      "#0A0A0A",
          fontFamily: MAN,
          margin:     "0 0 6px",
          lineHeight: 1.2,
        }}>
          {card.name}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <span style={{
            fontSize:      card.large ? 18 : 14,
            fontWeight:    900,
            color:         ACC,
            fontFamily:    MAN,
            letterSpacing: "-0.03em",
          }}>
            {card.price}
          </span>
          <span style={{
            fontSize:       11,
            color:          "rgba(0,0,0,0.26)",
            textDecoration: "line-through",
            fontFamily:     MAN,
          }}>
            {card.old}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
export default function HomeHero() {
  const [viewers, setViewers] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const r = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setViewers(r(54, 91));
    const id = setInterval(
      () => setViewers(v => Math.min(138, Math.max(36, v + r(-4, 6)))),
      r(18_000, 32_000),
    );
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes hh-dot  { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes hh-in   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hh-shine {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes hh-bar-in { from{transform:scaleX(0)} to{transform:scaleX(1)} }

        .hh-dot      { animation: hh-dot 2.2s ease-in-out infinite; }
        .hh-left-in  { animation: hh-in 0.65s cubic-bezier(0.22,1,0.36,1) 0.06s both; }
        .hh-right-in { animation: hh-in 0.65s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
        .hh-bar      {
          animation: hh-bar-in 0.55s cubic-bezier(0.22,1,0.36,1) 0.50s both;
          transform-origin: left center;
        }

        /* "Odmah." gradient sweep */
        .hh-odmah {
          background: linear-gradient(100deg, ${ACC} 18%, #FFAC55 50%, ${ACC} 82%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: hh-shine 3.5s ease-in-out 1.4s infinite;
        }

        /* CTA hover */
        .hh-cta {
          transition: transform 240ms cubic-bezier(0.22,1,0.36,1),
                      box-shadow 240ms ease, filter 180ms ease;
        }
        .hh-cta:hover {
          transform: translateY(-4px) scale(1.04) !important;
          box-shadow: 0 20px 52px rgba(255,72,0,0.40) !important;
          filter: brightness(1.07);
        }
        .hh-cta:active { transform: scale(0.95) !important; }

        /* Responsive */
        @media (max-width: 960px) {
          .hh-wrap   { flex-direction: column !important; gap: 44px !important; padding: 52px 22px 60px !important; }
          .hh-left   { max-width: 100% !important; flex: none !important; }
          .hh-right  { flex: none !important; width: 100% !important; height: 400px !important; }
          .hh-h1a    { font-size: clamp(36px, 9vw, 58px) !important; }
          .hh-odmah  { font-size: clamp(56px,14vw, 88px) !important; }
        }
        @media (max-width: 520px) {
          .hh-right  { height: 340px !important; }
          .hh-trust  { gap: 6px 10px !important; }
        }
      `}</style>

      <section
        style={{
          backgroundColor: "#FAFAF7",
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.042) 1px, transparent 1px)",
          backgroundSize:  "32px 32px",
          borderBottom:    "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="hh-wrap"
          style={{
            maxWidth:   1280,
            margin:     "0 auto",
            padding:    "72px 56px 80px 60px",
            display:    "flex",
            gap:        72,
            alignItems: "center",
          }}
        >
          {/* ── LEFT ─────────────────────────────────────────────────── */}
          <div
            className="hh-left-in hh-left"
            style={{ flex: "0 0 42%", maxWidth: "42%", display: "flex", flexDirection: "column" }}
          >
            {/* Live pill */}
            <div style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            8,
              background:     "rgba(255,255,255,0.9)",
              border:         "1px solid rgba(0,0,0,0.08)",
              borderRadius:   999,
              padding:        "6px 14px",
              width:          "fit-content",
              marginBottom:   22,
              boxShadow:      "0 1px 6px rgba(0,0,0,0.06)",
              backdropFilter: "blur(8px)",
            }}>
              <span className="hh-dot" style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#22C55E", flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#555", fontFamily: MAN }}>
                {mounted && viewers > 0
                  ? <><strong style={{ color: "#111" }}>{viewers}</strong> osoba na sajtu</>
                  : "Brza dostava · Plaćanje pouzećem"
                }
              </span>
            </div>

            {/* Brand accent bar */}
            <div
              className="hh-bar"
              style={{
                width:        52,
                height:       3,
                background:   `linear-gradient(90deg, ${ACC}, #FFA04A)`,
                borderRadius: 99,
                marginBottom: 20,
              }}
            />

            {/* Headline */}
            <h1 style={{ margin: "0 0 28px", lineHeight: 1 }}>
              <span
                className="hh-h1a"
                style={{
                  display:       "block",
                  fontSize:      "clamp(40px, 4.8vw, 68px)",
                  fontWeight:    900,
                  color:         "#0A0A0A",
                  letterSpacing: "-0.04em",
                  fontFamily:    MAN,
                  lineHeight:    1.05,
                  marginBottom:  6,
                }}
              >
                Sve što ti treba.
              </span>
              <span
                className="hh-odmah"
                style={{
                  display:       "block",
                  fontSize:      "clamp(62px, 7.4vw, 104px)",
                  fontWeight:    900,
                  letterSpacing: "-0.055em",
                  fontFamily:    MAN,
                  lineHeight:    0.9,
                }}
              >
                Odmah.
              </span>
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize:     15,
              color:        "#888",
              lineHeight:   1.75,
              fontFamily:   MAN,
              maxWidth:     380,
              margin:       "0 0 36px",
            }}>
              Radna obuća, alati, video nadzor —<br />
              naruči online, plati tek kad paket stigne.
            </p>

            {/* CTA */}
            <Link
              href="/proizvodi"
              className="hh-cta"
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            10,
                background:     "linear-gradient(135deg, #FF7A20 0%, #FF4800 100%)",
                color:          "#fff",
                fontFamily:     MAN,
                fontWeight:     800,
                fontSize:       15,
                textDecoration: "none",
                borderRadius:   14,
                padding:        "16px 32px",
                width:          "fit-content",
                marginBottom:   32,
                boxShadow:      "0 8px 28px rgba(255,72,0,0.28)",
                letterSpacing:  "0.01em",
              }}
            >
              Pogledaj ponudu
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>

            {/* Trust row */}
            <div
              className="hh-trust"
              style={{
                display:    "flex",
                flexWrap:   "wrap",
                gap:        "8px 20px",
                borderTop:  "1px solid rgba(0,0,0,0.07)",
                paddingTop: 24,
              }}
            >
              {TRUST.map(({ icon, text }) => (
                <span
                  key={text}
                  style={{
                    display:    "inline-flex",
                    alignItems: "center",
                    gap:        6,
                    fontSize:   12,
                    fontWeight: 600,
                    color:      "#888",
                    fontFamily: MAN,
                  }}
                >
                  <span style={{ color: ACC }}>{icon}</span>
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT · staggered product cards ──────────────────────── */}
          <div
            className="hh-right-in hh-right"
            style={{ flex: 1, position: "relative", height: 520 }}
          >
            {CARDS.map(card => (
              <ProductCard key={card.name} card={card} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
