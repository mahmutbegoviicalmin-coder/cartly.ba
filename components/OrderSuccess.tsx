"use client";

import Link from "next/link";
import { Check, Package, Truck, Banknote, ArrowRight } from "lucide-react";
import { useState } from "react";

const ACCENT = "#FF6B00";

const TRUST_ITEMS = [
  {
    Icon:  Package,
    label: "Brza obrada narudžbe",
    color: ACCENT,
    bg:    "rgba(255,107,0,0.08)",
  },
  {
    Icon:  Truck,
    label: "Dostava 1–3 dana",
    color: "#3B82F6",
    bg:    "rgba(59,130,246,0.08)",
  },
  {
    Icon:  Banknote,
    label: "Plaćanje pouzećem",
    color: "#16A34A",
    bg:    "rgba(22,163,74,0.08)",
  },
];

export default function OrderSuccess() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        padding:    "56px 24px 48px",
        fontFamily: "var(--font-manrope), sans-serif",
      }}
    >
      {/* ── Check icon ── */}
      <div
        style={{
          width:          68,
          height:         68,
          borderRadius:   20,
          background:     ACCENT,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          boxShadow:      "0 8px 28px rgba(255,107,0,0.32)",
          marginBottom:   28,
          flexShrink:     0,
        }}
      >
        <Check size={30} strokeWidth={2.8} color="#fff" />
      </div>

      {/* ── Headline ── */}
      <h2
        style={{
          fontSize:      "clamp(22px, 5vw, 32px)",
          fontWeight:    800,
          color:         "#0F0F0F",
          letterSpacing: "-0.025em",
          lineHeight:    1.15,
          marginBottom:  14,
        }}
      >
        Narudžba uspješno zaprimljena!
      </h2>

      {/* ── Description ── */}
      <p
        style={{
          fontSize:     15,
          color:        "#6B6B6B",
          lineHeight:   1.7,
          maxWidth:     420,
          marginBottom: 36,
          fontWeight:   400,
        }}
      >
        Vaša narudžba je evidentirana i u procesu obrade.
        <br />
        Dostava 1–3 radna dana. Plaćanje pouzećem prilikom preuzimanja.
      </p>

      {/* ── Trust features ── */}
      <div
        className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full"
        style={{ marginBottom: 36, maxWidth: 560 }}
      >
        {TRUST_ITEMS.map(({ Icon, label, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 w-full sm:w-auto flex-1"
            style={{
              background:   "#F8F7F5",
              border:       "1px solid rgba(0,0,0,0.07)",
              borderRadius: 14,
              padding:      "13px 18px",
            }}
          >
            <div
              style={{
                width:          36,
                height:         36,
                borderRadius:   10,
                background:     bg,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                flexShrink:     0,
              }}
            >
              <Icon size={17} color={color} strokeWidth={2} />
            </div>
            <span
              style={{
                fontSize:   13,
                fontWeight: 600,
                color:      "#2A2A2A",
                lineHeight: 1.35,
                textAlign:  "left",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <CTAButton />
    </div>
  );
}

function CTAButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/proizvodi"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="inline-flex items-center gap-2 font-bold text-white rounded-xl"
      style={{
        background:     "linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)",
        padding:        "14px 28px",
        fontSize:       14.5,
        letterSpacing:  "0.01em",
        textDecoration: "none",
        fontFamily:     "inherit",
        boxShadow:      hovered
          ? "0 8px 28px rgba(255,80,0,0.40)"
          : "0 4px 16px rgba(255,80,0,0.28)",
        transform:      hovered ? "scale(1.04)" : "scale(1)",
        transition:     "transform 220ms ease, box-shadow 220ms ease",
      }}
    >
      Nastavi kupovinu
      <ArrowRight
        size={15}
        strokeWidth={2.5}
        style={{
          transform:  hovered ? "translateX(3px)" : "translateX(0)",
          transition: "transform 200ms ease",
        }}
      />
    </Link>
  );
}
