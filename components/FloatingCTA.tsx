"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { event } from "@/lib/fbpixel";

export default function FloatingCTA() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const orderEl = document.getElementById("order");
    if (!orderEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.2 }
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
      <button
        onClick={handleClick}
        aria-label="Naruči sada — popust 57%"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999,
          background: "#FF6B00",
          border: "none",
          borderRadius: 50,
          padding: "14px 24px",
          boxShadow: "0 4px 20px rgba(255, 107, 0, 0.4)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          transform: hidden ? "translateY(80px) scale(0.95)" : "translateY(0) scale(1)",
          opacity: hidden ? 0 : 1,
          pointerEvents: hidden ? "none" : "auto",
          transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, background 0.15s",
          animation: !hidden ? "floatingPulse 2s ease-in-out infinite" : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#E85E00";
          if (!hidden) e.currentTarget.style.transform = "translateY(0) scale(1.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#FF6B00";
          if (!hidden) e.currentTarget.style.transform = "translateY(0) scale(1)";
        }}
        className="floating-cta"
      >
        <ShoppingBag size={18} color="#fff" strokeWidth={2.2} style={{ flexShrink: 0 }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span
            className="fcta-label"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            Ograničena ponuda
          </span>
          <span
            className="fcta-main"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.2,
              textTransform: "uppercase",
            }}
          >
            Danas -57% Naruči sada
          </span>
        </div>
      </button>

    </>
  );
}
