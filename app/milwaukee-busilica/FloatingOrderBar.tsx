"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { event } from "@/lib/fbpixel";

const ACCENT = "#E8460A";
const BEBAS: React.CSSProperties = { fontFamily: "var(--font-manrope, sans-serif)" };

export default function FloatingOrderBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  function scrollToForm() {
    event("AddToCart", {
      content_name: "Milwaukee M18 Bušilica",
      value:        69.90,
      currency:     "BAM",
    });
    const el = document.getElementById("narudzba");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      style={{
        transition: "transform 0.4s ease, opacity 0.4s ease",
        transform: visible ? "translateY(0)" : "translateY(120px)",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* -61% badge */}
      <div
        className="absolute -top-2.5 -right-1 z-10 text-white font-bold rounded-full"
        style={{ background: ACCENT, fontSize: 11, padding: "2px 8px" }}
      >
        -61%
      </div>

      {/* Dark card */}
      <div
        className="flex items-center gap-3 rounded-2xl shadow-2xl"
        style={{ background: "#1a1a1a", padding: "12px 16px", minWidth: 260 }}
      >
        {/* Product image */}
        <div
          className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
          style={{ background: "#2a2a2a" }}
        >
          <Image
            src="/images/milw2.webp"
            alt="Milwaukee M18"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold leading-tight" style={{ fontSize: 13 }}>
            Milwaukee M18 Bušilica
          </p>
          <p style={{ ...BEBAS, fontSize: 16, color: ACCENT, lineHeight: 1.2 }}>
            69,90 KM
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={scrollToForm}
          className="text-white font-bold rounded-xl flex-shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: ACCENT, padding: "8px 14px", fontSize: 13 }}
        >
          Naruči →
        </button>
      </div>
    </div>
  );
}
