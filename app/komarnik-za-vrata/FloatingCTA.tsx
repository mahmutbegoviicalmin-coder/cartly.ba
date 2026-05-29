"use client";

import { useState, useEffect } from "react";
import { event } from "@/lib/fbpixel";

const ACCENT = "#5C8B5A";

export default function KomarnikFloatingCTA() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = document.getElementById("narudzba");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    event("AddToCart", { content_name: "Magnetni Komarnik za Vrata", value: 29.90, currency: "BAM" });
    document.getElementById("narudzba")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes kml-fab-up {
          from { opacity:0; transform:translateY(110%); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes kml-fab-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.3; transform:scale(0.6); }
        }
        @keyframes kml-fab-glow {
          0%,100% { box-shadow:0 4px 20px rgba(92,139,90,0.40); }
          50%     { box-shadow:0 8px 32px rgba(92,139,90,0.65); }
        }
        .kml-fab {
          position:fixed; bottom:0; left:0; right:0; z-index:9998;
          background:rgba(8,8,8,0.95);
          backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          border-top:1px solid rgba(255,255,255,0.07);
          padding:12px 16px calc(12px + env(safe-area-inset-bottom));
          display:flex; align-items:center; gap:12px;
          animation:kml-fab-up 0.52s cubic-bezier(0.22,1,0.36,1) 1.2s both;
          transition:opacity 0.28s ease, transform 0.28s ease;
        }
        .kml-fab.hidden { opacity:0; transform:translateY(100%); pointer-events:none; }
        .kml-fab-dot { animation:kml-fab-dot 2s ease-in-out infinite; }
        .kml-fab-btn {
          flex-shrink:0; display:flex; align-items:center; gap:7px;
          background:${ACCENT};
          color:#fff; border:none; border-radius:14px; padding:13px 20px;
          font-size:15px; font-weight:800; letter-spacing:-0.01em;
          font-family:var(--font-manrope),sans-serif; cursor:pointer; white-space:nowrap;
          animation:kml-fab-glow 2.6s ease-in-out 2s infinite;
          transition:transform 160ms ease;
        }
        .kml-fab-btn:hover  { transform:scale(1.04); }
        .kml-fab-btn:active { transform:scale(0.95); }
        @media (min-width:641px) {
          .kml-fab {
            bottom:22px; left:auto; right:22px; border-radius:20px;
            border:1px solid rgba(255,255,255,0.09);
            padding:16px 16px 16px 20px; width:auto; max-width:400px;
            box-shadow:0 24px 64px rgba(0,0,0,0.42),0 4px 16px rgba(0,0,0,0.24),inset 0 1px 0 rgba(255,255,255,0.06);
          }
        }
      `}</style>

      <div className={`kml-fab${!visible ? " hidden" : ""}`}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <span className="kml-fab-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-manrope),sans-serif" }}>
              Dostupno odmah
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-manrope),sans-serif" }}>od</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "var(--font-manrope),sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>
              16,90 KM
            </span>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-manrope),sans-serif" }}>
            Plaćanje pouzećem · Dostava 10 KM
          </div>
        </div>

        <button onClick={handleClick} className="kml-fab-btn">
          Naruči odmah
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </>
  );
}
