"use client";

import React, { useEffect, useState } from "react";
import { Manrope } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });

const ACC  = "#0284C7";
const ACC2 = "#075985";
const BLK  = "#0a0a1a";
const F    = manrope.style.fontFamily + ",-apple-system,sans-serif";

interface Props { onOrder?: () => void; }

export default function ZirafaFloatingCTA({ onOrder }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOrder) {
      onOrder();
    } else {
      document.getElementById("narudzba")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        .z-fcta-wrap {
          position: fixed; right: 20px; bottom: 20px; z-index: 9998;
          width: 272px;
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(10,10,26,0.08);
          box-shadow: 0 16px 44px rgba(10,10,26,0.18), 0 0 0 1px rgba(0,0,0,0.03);
          overflow: hidden;
          transition: transform 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.32s ease;
        }
        .z-fcta-fire-row {
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #DC2626 0%, #EA580C 100%);
          padding: 7px 14px;
        }
        @keyframes z-fire-flicker {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25%      { transform: scale(1.12) rotate(-4deg); opacity: 0.88; }
          50%      { transform: scale(0.96) rotate(3deg); opacity: 1; }
          75%      { transform: scale(1.08) rotate(-2deg); opacity: 0.92; }
        }
        .z-fire-icon { animation: z-fire-flicker 1.1s ease-in-out infinite; display: inline-flex; flex-shrink: 0; }
        @keyframes z-text-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
        .z-fire-text { animation: z-text-blink 1.4s ease-in-out infinite; }
        .z-fcta-btn {
          width: 100%; background: linear-gradient(135deg, ${ACC} 0%, ${ACC2} 100%);
          color: #fff; border: none; padding: 12px 14px;
          font-size: 14px; font-weight: 800; font-family: ${F}; letter-spacing: -0.01em;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: filter 0.15s;
        }
        .z-fcta-btn:hover { filter: brightness(1.06); }
        .z-fcta-close {
          position: absolute; top: 6px; right: 6px; width: 22px; height: 22px;
          border-radius: 50%; background: rgba(255,255,255,0.25); border: none;
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        @media (max-width: 520px) {
          .z-fcta-wrap { right: 12px; bottom: 12px; width: 224px; border-radius: 16px; }
          .z-fcta-body { padding: 10px 12px !important; }
          .z-fcta-price { font-size: 19px !important; }
        }
      `}</style>

      <div
        className="z-fcta-wrap"
        style={{
          transform: visible ? "translateY(0) scale(1)" : "translateY(140%) scale(0.94)",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        {/* Fire urgency strip */}
        <div className="z-fcta-fire-row">
          <span className="z-fire-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none">
              <path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c2 2 2 5 0 7.5A7 7 0 0 1 5 12c0-3 2-5 3-6-.3 1.5 0 2.5 1 3 .3-3 1.5-5 3-7z"/>
            </svg>
          </span>
          <span className="z-fire-text" style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: F, letterSpacing: "0.01em" }}>
            Ponuda ističe uskoro
          </span>
        </div>

        {/* Body */}
        <div className="z-fcta-body" style={{ padding: "12px 14px 14px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: BLK, fontFamily: F, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Žirafa Brusilica za Zidove
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span className="z-fcta-price" style={{ fontSize: 22, fontWeight: 900, color: ACC, fontFamily: F, letterSpacing: "-0.03em" }}>169,90 KM</span>
            <span style={{ fontSize: 12.5, color: "#94a3b8", fontFamily: F, textDecoration: "line-through" }}>269,90 KM</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "2px 8px", marginBottom: 10 }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "#dc2626", fontFamily: F }}>USTEDA 37%</span>
          </div>

          {/* Stock indicator - subtle */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ACC2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M20.91 8.84 8.56 21.19a1.93 1.93 0 0 1-2.73 0L2.81 18.2a1.93 1.93 0 0 1 0-2.73L15.16 3.11a1.93 1.93 0 0 1 2.73 0L20.91 6.1a1.93 1.93 0 0 1 0 2.73z"/>
              <path d="m9.5 6.5 4 4"/>
            </svg>
            <span style={{ fontSize: 11, color: "#78716c", fontFamily: F }}>Zadnjih <strong style={{ color: BLK }}>30 kom</strong> na stanju</span>
          </div>

          <button onClick={handle} className="z-fcta-btn">
            Naruči odmah
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}
