"use client";

import { useState, useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const orderEl = document.getElementById("order");
    if (!orderEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(orderEl);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    event("AddToCart", { content_name: "Radne Patike S3 Tactical Black", value: 59.90, currency: "BAM" });
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes fab-slide-up {
          from { opacity: 0; transform: translateY(110%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fab-pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.3; transform:scale(0.65); }
        }
        @keyframes fab-btn-glow {
          0%,100% { box-shadow: 0 4px 20px rgba(255,80,0,0.40); }
          50%     { box-shadow: 0 8px 32px rgba(255,80,0,0.65); }
        }

        .fab-root {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 9998;
          /* glass dark bar */
          background: rgba(8, 8, 8, 0.94);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
          display: flex;
          align-items: center;
          gap: 12px;
          animation: fab-slide-up 0.52s cubic-bezier(0.22,1,0.36,1) 1.2s both;
          transition: opacity 0.28s ease, transform 0.28s ease;
        }
        .fab-root.fab-hidden {
          opacity: 0;
          transform: translateY(100%);
          pointer-events: none;
        }

        .fab-live-dot {
          animation: fab-pulse-dot 1.9s ease-in-out infinite;
        }

        .fab-order-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          background: linear-gradient(135deg, #FF7A20 0%, #FF4300 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 13px 18px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.01em;
          font-family: var(--font-manrope), sans-serif;
          cursor: pointer;
          white-space: nowrap;
          animation: fab-btn-glow 2.6s ease-in-out 2s infinite;
          transition: transform 160ms ease;
        }
        .fab-order-btn:hover  { transform: scale(1.04); }
        .fab-order-btn:active { transform: scale(0.95); }

        /* Desktop · floating card bottom-right */
        @media (min-width: 641px) {
          .fab-root {
            bottom: 22px;
            left: auto;
            right: 22px;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.09);
            padding: 16px 16px 16px 20px;
            width: auto;
            max-width: 420px;
            box-shadow:
              0 24px 64px rgba(0,0,0,0.42),
              0 4px 16px rgba(0,0,0,0.24),
              inset 0 1px 0 rgba(255,255,255,0.06);
          }
        }
      `}</style>

      <div className={`fab-root${!visible ? " fab-hidden" : ""}`}>

        {/* ── Left: product info ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* live status */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5, marginBottom: 5,
          }}>
            <span className="fab-live-dot" style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#FF6B00", display: "inline-block", flexShrink: 0,
            }} />
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              fontFamily: "var(--font-manrope), sans-serif",
            }}>
              Ograničena zaliha
            </span>
          </div>

          {/* price row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 22, fontWeight: 900, color: "#fff",
              fontFamily: "var(--font-manrope), sans-serif",
              letterSpacing: "-0.03em", lineHeight: 1,
            }}>
              59,90 KM
            </span>

            <span style={{
              fontSize: 13, fontWeight: 500,
              color: "rgba(255,255,255,0.30)",
              textDecoration: "line-through",
              fontFamily: "var(--font-manrope), sans-serif",
            }}>
              139,90
            </span>

            <span style={{
              fontSize: 11, fontWeight: 800,
              color: "#FF6B00",
              background: "rgba(255,107,0,0.14)",
              border: "1px solid rgba(255,107,0,0.25)",
              borderRadius: 6,
              padding: "2px 7px",
              fontFamily: "var(--font-manrope), sans-serif",
              letterSpacing: "0.02em",
            }}>
              −57%
            </span>
          </div>

          {/* sub-line */}
          <div style={{
            marginTop: 4,
            fontSize: 11,
            color: "rgba(255,255,255,0.28)",
            fontFamily: "var(--font-manrope), sans-serif",
            letterSpacing: "0.01em",
          }}>
            Plaćanje pouzećem · Dostava 10 KM
          </div>
        </div>

        {/* ── Right: CTA button ── */}
        <button onClick={handleClick} className="fab-order-btn">
          Naruči odmah
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

      </div>
    </>
  );
}
