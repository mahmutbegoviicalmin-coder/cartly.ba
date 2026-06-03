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
    <div style={{
      position:   "fixed",
      bottom:     0, left: 0, right: 0,
      zIndex:     9998,
      background: "#fff",
      borderTop:  "1px solid rgba(0,0,0,0.08)",
      boxShadow:  "0 -2px 16px rgba(0,0,0,0.07)",
      transform:  visible ? "translateY(0)" : "translateY(100%)",
      transition: "transform 0.3s ease",
      display:    "flex",
      alignItems: "center",
      padding:    "10px 24px",
      gap:        16,
    }}>

      {/* Image */}
      <img
        src="/usmjerivac/hero.png"
        alt=""
        style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(0,0,0,0.07)" }}
      />

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
      <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 800, fontFamily: F, padding: "4px 9px", borderRadius: 6, flexShrink: 0, whiteSpace: "nowrap" }}>
        −50%
      </span>

      {/* Button */}
      <button
        onClick={handle}
        style={{
          background:   BLUE,
          color:        "#fff",
          border:       "none",
          borderRadius: 10,
          padding:      "11px 22px",
          fontSize:     14,
          fontWeight:   700,
          fontFamily:   F,
          cursor:       "pointer",
          flexShrink:   0,
          whiteSpace:   "nowrap",
          transition:   "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#1448d4")}
        onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
      >
        Naruči odmah
      </button>
    </div>
  );
}
