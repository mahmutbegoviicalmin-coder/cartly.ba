"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight:  ["500", "600", "700", "800"],
  display: "swap",
});

interface Props {
  ctaHref?: string;
}

export default function ProductPageHeader({ ctaHref = "#order" }: Props) {
  const [scrolled,   setScrolled]   = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [ctaPressed, setCtaPressed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`${manrope.className} sticky top-0 z-50 w-full`}
      style={{
        background:           "#FFFFFF",
        borderBottom:         scrolled ? "1px solid rgba(0,0,0,0.07)" : "1px solid #F0EDE8",
        boxShadow:            scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
        backdropFilter:       scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        transition:           "box-shadow 300ms ease, border-color 300ms ease",
      }}
    >
      <div
        style={{
          maxWidth:            1280,
          margin:              "0 auto",
          padding:             "0 28px",
          height:              68,
          display:             "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          alignItems:          "center",
        }}
      >
        {/* ── Left: back link ──────────────────────────────────────── */}
        <div>
          <Link
            href="/"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            8,
              textDecoration: "none",
              color:          "#555555",
              fontSize:       14,
              fontWeight:     500,
              transition:     "color 200ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0F0F0F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#555555")}
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Nazad na početnu
          </Link>
        </div>

        {/* ── Center: empty ────────────────────────────────────────── */}
        <div />

        {/* ── Right: CTA ───────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <a
            href={ctaHref}
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => { setCtaHovered(false); setCtaPressed(false); }}
            onMouseDown={() => setCtaPressed(true)}
            onMouseUp={() => setCtaPressed(false)}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            9,
              background:     "linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)",
              color:          "#FFFFFF",
              fontWeight:     700,
              fontSize:       14,
              letterSpacing:  "0.01em",
              borderRadius:   14,
              padding:        "12px 24px",
              textDecoration: "none",
              whiteSpace:     "nowrap",
              userSelect:     "none",
              transform:      ctaPressed
                ? "scale(0.96)"
                : ctaHovered
                  ? "scale(1.04)"
                  : "scale(1)",
              boxShadow:      ctaHovered
                ? "0 8px 28px rgba(255,80,0,0.42), 0 2px 6px rgba(255,80,0,0.22)"
                : "0 4px 16px rgba(255,80,0,0.28)",
              filter:         ctaHovered ? "brightness(1.06)" : "brightness(1)",
              transition:     "transform 230ms ease-out, box-shadow 230ms ease-out, filter 200ms ease",
            }}
          >
            Naruči odmah
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              style={{
                transform:  ctaHovered ? "translateX(2px)" : "translateX(0)",
                transition: "transform 230ms ease-out",
              }}
            />
          </a>
        </div>
      </div>
    </header>
  );
}
