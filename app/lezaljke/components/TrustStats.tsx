"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    target: 500,
    suffix: "+",
    label: "Zadovoljnih kupaca",
    decimals: 0,
    accent: "#1B4332",
    gradient: "linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)",
    border: "rgba(27,67,50,0.12)",
    glow: "rgba(27,67,50,0.06)",
    iconBg: "rgba(27,67,50,0.1)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    target: 4.9,
    suffix: "/5",
    label: "Prosječna ocjena",
    decimals: 1,
    accent: "#B45309",
    gradient: "linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)",
    border: "rgba(180,83,9,0.15)",
    glow: "rgba(180,83,9,0.06)",
    iconBg: "rgba(180,83,9,0.1)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        <path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    target: 5,
    suffix: " pozicija",
    label: "Podesivi naslon",
    decimals: 0,
    accent: "#4E5445",
    gradient: "linear-gradient(145deg, #EEF0E8 0%, #E2E5D8 100%)",
    border: "rgba(78,84,69,0.12)",
    glow: "rgba(78,84,69,0.06)",
    iconBg: "rgba(78,84,69,0.1)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    target: 14,
    suffix: " dana",
    label: "Garancija povrata",
    decimals: 0,
    accent: "#BE185D",
    gradient: "linear-gradient(145deg, #FFF1F2 0%, #FFE4E6 100%)",
    border: "rgba(190,24,93,0.12)",
    glow: "rgba(190,24,93,0.06)",
    iconBg: "rgba(190,24,93,0.1)",
  },
];

function useCountUp(target: number, decimals: number, active: boolean, reduced: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reduced) { setValue(target); return; }
    const duration = 1600;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, decimals, reduced]);
  return value;
}

function StatCard({ stat, index, active, reduced }: {
  stat: (typeof STATS)[0]; index: number; active: boolean; reduced: boolean;
}) {
  const count = useCountUp(stat.target, stat.decimals, active, reduced);
  const [hovered, setHovered] = useState(false);

  const displayCount =
    stat.decimals > 0
      ? count.toFixed(stat.decimals).replace(".", ",")
      : Math.round(count).toLocaleString("de-DE");

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: stat.gradient,
        border: `1.5px solid ${hovered ? stat.accent + "40" : stat.border}`,
        borderRadius: 24,
        padding: "36px 28px 32px",
        textAlign: "center",
        cursor: "default",
        flex: "1 1 220px",
        minWidth: 0,
        overflow: "hidden",
        boxShadow: hovered
          ? `0 20px 48px ${stat.glow}, 0 4px 16px rgba(0,0,0,0.06)`
          : "0 2px 12px rgba(0,0,0,0.04)",
        transform: hovered
          ? "translateY(-6px) scale(1.02)"
          : active ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
        opacity: active ? 1 : 0,
        transition: reduced
          ? "none"
          : `transform 0.55s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms,
             opacity 0.45s ease ${index * 80}ms,
             box-shadow 0.25s ease,
             border-color 0.3s ease`,
      }}
    >
      {/* Corner glow */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${stat.accent}22 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      }} />

      {/* Icon */}
      <div style={{
        width: 60, height: 60, borderRadius: 18,
        background: stat.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
        color: stat.accent,
        transform: hovered ? "scale(1.12) translateY(-3px)" : "scale(1) translateY(0)",
        transition: reduced ? "none" : "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: hovered ? `0 8px 24px ${stat.glow}` : "none",
      }}>
        {stat.icon}
      </div>

      {/* Number */}
      <div style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontWeight: 900,
        fontSize: "clamp(32px,4vw,44px)",
        letterSpacing: "-0.04em",
        color: "#0A0A0A",
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {displayCount}
        <span style={{ fontSize: "0.55em", fontWeight: 800, opacity: 0.65 }}>
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <div style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 13, fontWeight: 600, color: "#6B7280",
        letterSpacing: "0.01em", lineHeight: 1.4,
      }}>
        {stat.label}
      </div>
    </article>
  );
}

export default function TrustStats() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      background: "linear-gradient(180deg, #fff 0%, #FFFBEB 40%, #F9F9F7 100%)",
      padding: "80px 24px",
      overflow: "hidden",
    }}>
      <style suppressHydrationWarning>{`
        .lz-stats-scroll { display: flex; gap: 16px; }
        @media (max-width: 640px) {
          .lz-stats-scroll {
            overflow-x: auto; -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory; padding-bottom: 8px; scrollbar-width: none;
          }
          .lz-stats-scroll::-webkit-scrollbar { display: none; }
          .lz-stats-scroll > * { scroll-snap-align: start; flex: 0 0 240px !important; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .lz-stats-scroll { flex-wrap: wrap; }
          .lz-stats-scroll > * { flex: 1 1 calc(50% - 8px) !important; min-width: 0 !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Headline */}
        <div style={{
          textAlign: "center", marginBottom: 52,
          opacity: active ? 1 : 0,
          transform: active ? "translateY(0)" : "translateY(16px)",
          transition: reduced ? "none" : "opacity 0.5s ease, transform 0.5s ease",
        }}>
          <p style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "#D97706", margin: "0 0 12px",
          }}>
            Povjerenje kupaca
          </p>
          <h2 style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 900, fontSize: "clamp(22px,3.5vw,34px)",
            color: "#0A0A0A", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.25,
          }}>
            Više od{" "}
            <span style={{
              background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              500 kupaca
            </span>{" "}
            već uživa u odmoru bez kompromisa
          </h2>
        </div>

        <div className="lz-stats-scroll">
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} active={active} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}
