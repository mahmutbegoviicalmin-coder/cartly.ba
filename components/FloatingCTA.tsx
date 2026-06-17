"use client";

import { useState, useEffect } from "react";
import { event } from "@/lib/fbpixel";

interface FloatingCTAProps {
  onOrder?: () => void;
}

export default function FloatingCTA({ onOrder }: FloatingCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    event("AddToCart", { content_name: "Radne Patike S3 Tactical Black", value: 59.90, currency: "BAM" });
    if (onOrder) { onOrder(); return; }
    document.getElementById("naruci")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes fcta-glow {
          0%,100% { box-shadow: 0 4px 20px rgba(179,48,0,0.25); }
          50%      { box-shadow: 0 6px 28px rgba(179,48,0,0.45); }
        }
        @keyframes fcta-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.3; transform: scale(0.5); }
        }

        .fcta-wrap {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 9998;
          background: #fff;
          border-top: 1px solid #EBEBEB;
          padding: 10px 16px;
          padding-bottom: calc(10px + env(safe-area-inset-bottom));
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.07);
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease;
        }
        .fcta-wrap.hidden {
          opacity: 0;
          transform: translateY(100%);
          pointer-events: none;
        }
        @media (min-width: 640px) {
          .fcta-wrap {
            bottom: 20px; left: auto; right: 20px;
            border-radius: 16px; border: 1px solid #E8E8E8;
            padding: 12px 16px;
            max-width: 340px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          }
        }

        .fcta-cta {
          flex-shrink: 0;
          background: #B33000; color: #fff;
          border: none; border-radius: 11px;
          padding: 12px 18px;
          font-size: 14px; font-weight: 800;
          font-family: var(--font-manrope), sans-serif;
          letter-spacing: -0.01em;
          cursor: pointer; white-space: nowrap;
          animation: fcta-glow 3s ease-in-out 2s infinite;
          transition: background 150ms, transform 150ms;
          display: flex; align-items: center; gap: 5px;
        }
        .fcta-cta:hover  { background: #961f00; transform: scale(1.02); }
        .fcta-cta:active { transform: scale(0.97); }

        .fcta-pulse {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e; flex-shrink: 0;
          animation: fcta-dot 2s ease-in-out infinite;
        }
      `}</style>

      <div className={`fcta-wrap${!visible ? " hidden" : ""}`}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <span className="fcta-pulse" />
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#22c55e",
              fontFamily: "var(--font-manrope), sans-serif",
            }}>Na stanju</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 19, fontWeight: 900, color: "#0A0A0A",
              fontFamily: "var(--font-manrope), sans-serif",
              letterSpacing: "-0.03em", lineHeight: 1,
            }}>59,90 KM</span>
            <span style={{
              fontSize: 12, color: "#BBBBBB",
              textDecoration: "line-through",
              fontFamily: "var(--font-manrope), sans-serif",
            }}>139,90</span>
            <span style={{
              fontSize: 10, fontWeight: 800, color: "#B33000",
              background: "#FFF0EB",
              border: "1px solid rgba(179,48,0,0.2)",
              borderRadius: 5, padding: "2px 6px",
              fontFamily: "var(--font-manrope), sans-serif",
            }}>−57%</span>
          </div>
          <div style={{
            fontSize: 10, color: "#AAAAAA",
            fontFamily: "var(--font-manrope), sans-serif", marginTop: 1,
          }}>Pouzećem · Dostava 10 KM</div>
        </div>

        <button onClick={handleClick} className="fcta-cta">
          Naruči
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </>
  );
}
