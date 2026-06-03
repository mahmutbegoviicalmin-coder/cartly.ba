"use client";

import React, { useEffect, useState } from "react";

const BLUE = "#1a5fff";
const F    = "var(--font-manrope),-apple-system,sans-serif";

interface Props { onOrder?: () => void; }

export default function UsmjerivacFloatingCTA({ onOrder }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 500);
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
        .u-fcta-wrap {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 9998;
          background: #fff;
          border-top: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 -2px 16px rgba(0,0,0,0.07);
          display: flex; align-items: center;
          padding: 10px 24px; gap: 16px;
        }
        .u-fcta-img   { width:40px; height:40px; border-radius:8px; object-fit:cover; flex-shrink:0; border:1px solid rgba(0,0,0,0.07); }
        .u-fcta-badge { background:#fee2e2; color:#dc2626; font-size:11px; font-weight:800; font-family:${F}; padding:4px 9px; border-radius:6px; flex-shrink:0; white-space:nowrap; }
        .u-fcta-btn   { background:${BLUE}; color:#fff; border:none; border-radius:10px; padding:11px 22px; font-size:14px; font-weight:700; font-family:${F}; cursor:pointer; flex-shrink:0; white-space:nowrap; transition:background 0.15s; }
        .u-fcta-btn:hover { background:#1448d4; }
        @media (max-width:520px) {
          .u-fcta-wrap  { padding:10px 14px; gap:10px; }
          .u-fcta-img   { display:none; }
          .u-fcta-badge { display:none; }
          .u-fcta-btn   { padding:10px 16px; font-size:13px; border-radius:9px; }
        }
      `}</style>

      <div
        className="u-fcta-wrap"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.3s ease" }}
      >
        {/* Image */}
        <img src="/usmjerivac/hero.png" alt="" className="u-fcta-img" />

        {/* Name + price */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0a0a1a", fontFamily: F, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Usmjerivač Zraka Klime
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 1 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: BLUE, fontFamily: F, letterSpacing: "-0.03em" }}>19,90 KM</span>
            <span style={{ fontSize: 12, color: "#94a3b8", textDecoration: "line-through", fontFamily: F }}>39,90 KM</span>
          </div>
        </div>

        {/* Badge */}
        <span className="u-fcta-badge">−50%</span>

        {/* Button */}
        <button onClick={handle} className="u-fcta-btn">
          Naruči odmah
        </button>
      </div>
    </>
  );
}
