"use client";

import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Premium čelični okvir",
    desc: "Robusna konstrukcija nosivosti do 150 kg.",
    delay: 0,
    accent: "#1B4332",
    bg: "linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)",
    border: "rgba(27,67,50,0.13)",
    glow: "rgba(27,67,50,0.08)",
    iconBg: "rgba(27,67,50,0.1)",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
    title: "UV otporna tkanina",
    desc: "Ne blijedi na suncu i zadržava boju godinama.",
    delay: 80,
    accent: "#B45309",
    bg: "linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)",
    border: "rgba(180,83,9,0.15)",
    glow: "rgba(180,83,9,0.08)",
    iconBg: "rgba(180,83,9,0.1)",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "5 pozicija naslona",
    desc: "Od sjedećeg položaja do potpunog odmora.",
    delay: 160,
    accent: "#0369A1",
    bg: "linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)",
    border: "rgba(3,105,161,0.13)",
    glow: "rgba(3,105,161,0.07)",
    iconBg: "rgba(3,105,161,0.1)",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: "Ergonomski dizajn",
    desc: "Podrška za leđa i vrat tokom višesatnog korištenja.",
    delay: 240,
    accent: "#059669",
    bg: "linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)",
    border: "rgba(5,150,105,0.13)",
    glow: "rgba(5,150,105,0.08)",
    iconBg: "rgba(5,150,105,0.1)",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
        <line x1="10" y1="12" x2="14" y2="12"/>
      </svg>
    ),
    title: "Lako sklapanje",
    desc: "Sklapanje i transport za svega nekoliko sekundi.",
    delay: 320,
    accent: "#6D28D9",
    bg: "linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)",
    border: "rgba(109,40,217,0.13)",
    glow: "rgba(109,40,217,0.07)",
    iconBg: "rgba(109,40,217,0.1)",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "14 dana garancije",
    desc: "Kupovina bez rizika uz mogućnost povrata.",
    delay: 400,
    accent: "#BE185D",
    bg: "linear-gradient(145deg, #FFF1F2 0%, #FFE4E6 100%)",
    border: "rgba(190,24,93,0.13)",
    glow: "rgba(190,24,93,0.07)",
    iconBg: "rgba(190,24,93,0.1)",
  },
];

function FeatureCard({
  f,
  visible,
  reduced,
}: {
  f: (typeof FEATURES)[0];
  visible: boolean;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: f.bg,
        border: `1.5px solid ${hovered ? f.accent + "40" : f.border}`,
        borderRadius: 24,
        padding: "36px 28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        cursor: "default",
        overflow: "hidden",
        boxShadow: hovered
          ? `0 20px 48px ${f.glow}, 0 4px 16px rgba(0,0,0,0.05)`
          : "0 2px 10px rgba(0,0,0,0.04)",
        transform: visible
          ? hovered
            ? "translateY(-8px) scale(1.02)"
            : "translateY(0) scale(1)"
          : "translateY(24px) scale(0.96)",
        opacity: visible ? 1 : 0,
        transition: reduced
          ? "none"
          : `transform 0.55s cubic-bezier(0.22,1,0.36,1) ${f.delay}ms,
             opacity 0.45s ease ${f.delay}ms,
             box-shadow 0.3s ease,
             border-color 0.3s ease`,
      }}
    >
      {/* Corner glow */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${f.accent}22 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      }} />

      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: f.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20, flexShrink: 0, color: f.accent,
        transform: hovered ? "scale(1.1) translateY(-2px)" : "scale(1) translateY(0)",
        transition: reduced ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: hovered ? `0 6px 20px ${f.glow}` : "none",
      }}>
        {f.icon}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 800, fontSize: 17, color: "#0A0A0A",
        margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.25,
      }}>
        {f.title}
      </h3>

      {/* Accent line */}
      <div style={{
        width: hovered ? 36 : 24, height: 2.5, borderRadius: 4,
        background: f.accent, marginBottom: 12,
        transition: reduced ? "none" : "width 0.35s ease",
        opacity: 0.6,
      }} />

      {/* Description */}
      <p style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 14, color: "#6B7280", lineHeight: 1.6, margin: 0,
      }}>
        {f.desc}
      </p>
    </article>
  );
}

export default function FeatureCards() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      background: "linear-gradient(180deg, #FFFBEB 0%, #fff 60%, #F9F9F7 100%)",
      padding: "88px 24px",
    }}>
      <style suppressHydrationWarning>{`
        .fc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1023px) { .fc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 599px)  { .fc-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: 60,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: reduced ? "none" : "opacity 0.55s ease, transform 0.55s ease",
        }}>
          <p style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "#D97706", margin: "0 0 14px",
          }}>
            Zašto kupci biraju našu ležaljku
          </p>
          <h2 style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 900, fontSize: "clamp(26px,4vw,42px)",
            color: "#0A0A0A", letterSpacing: "-0.035em", margin: "0 0 16px", lineHeight: 1.1,
          }}>
            Udobnost koja traje{" "}
            <span style={{
              background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              cijelo ljeto
            </span>
          </h2>
          <p style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 16, color: "#6B7280", lineHeight: 1.65,
            margin: "0 auto", maxWidth: 540,
          }}>
            Premium materijali, maksimalna udobnost i jednostavno korištenje za svaki dan na terasi, u vrtu ili pored bazena.
          </p>
        </div>

        <div className="fc-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} f={f} visible={visible} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}
