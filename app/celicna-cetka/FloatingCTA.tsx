"use client";

import { useState, useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(window.scrollY > 280);
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes fab-pulse {
          0%,100% { box-shadow: 0 6px 22px rgba(255,80,0,0.38); }
          50%      { box-shadow: 0 10px 34px rgba(255,80,0,0.60); }
        }
        .fab-link {
          animation: fab-pulse 2.4s ease-in-out infinite;
        }
        .fab-link:hover {
          filter: brightness(1.08);
          transform: translateY(-2px) !important;
        }
        .fab-link:active {
          transform: scale(0.96) !important;
        }
      `}</style>

      <a
        href="#narudzba"
        className="fab-link"
        onClick={() =>
          event("AddToCart", {
            content_name: "Čelična Četka za Trimer",
            value: 19.90,
            currency: "BAM",
          })
        }
        style={{
          /* layout */
          position:       "fixed",
          bottom:         20,
          right:          "clamp(12px,3vw,20px)",
          zIndex:         9997,
          display:        "flex",
          alignItems:     "center",
          gap:            9,
          /* visuals */
          background:     "linear-gradient(135deg,#FF7A20 0%,#FF5000 100%)",
          color:          "#fff",
          fontWeight:     800,
          fontSize:       "clamp(13px,2vw,15px)",
          borderRadius:   16,
          padding:        "13px clamp(16px,3vw,22px)",
          textDecoration: "none",
          whiteSpace:     "nowrap",
          fontFamily:     "var(--font-manrope),sans-serif",
          letterSpacing:  "-0.01em",
          /* scroll show/hide — only transition, no competing animation */
          opacity:        visible ? 1 : 0,
          transform:      visible ? "translateY(0)" : "translateY(24px)",
          transition:     "opacity 0.28s ease, transform 0.28s ease",
          pointerEvents:  visible ? "auto" : "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Naruči 1+1 GRATIS — 19,90 KM
      </a>
    </>
  );
}
