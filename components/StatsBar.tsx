"use client";

import { useEffect, useRef, useState } from "react";

const ACCENT = "#B33000";

const stats = [
  {
    target:  1200,
    format:  (n: number) => Math.round(n) >= 1000 ? "1.200+" : Math.round(n) + "+",
    label:   "Zadovoljnih kupaca",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    target:  48,
    format:  (n: number) => (n / 10).toFixed(1),
    label:   "Prosječna ocjena",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    target:  14,
    format:  (n: number) => Math.round(n) + " dana",
    label:   "Garancija povrata",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [active, target, duration]);
  return value;
}

function StatItem({ stat, active, isLast }: { stat: typeof stats[number]; active: boolean; isLast: boolean }) {
  const raw = useCountUp(stat.target, 1400, active);

  return (
    <div style={{
      flex:           1,
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      gap:            10,
      padding:        "24px 12px",
      borderRight:    isLast ? "none" : "1px solid #EDEDE8",
      textAlign:      "center",
    }}>
      {/* Icon circle */}
      <div style={{
        width:           52,
        height:          52,
        borderRadius:    "50%",
        background:      "rgba(255,107,0,0.09)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        color:           ACCENT,
        flexShrink:      0,
      }}>
        {stat.icon}
      </div>

      {/* Number */}
      <div style={{ lineHeight: 1 }}>
        <span style={{
          fontSize:      "clamp(22px, 5vw, 32px)",
          fontWeight:    900,
          color:         "#0A0A0A",
          letterSpacing: "-0.03em",
          fontFamily:    "var(--font-manrope), sans-serif",
        }}>
          {stat.format(raw)}
        </span>
      </div>

      {/* Label */}
      <span style={{
        fontSize:   12,
        fontWeight: 600,
        color:      "#999",
        fontFamily: "var(--font-manrope), sans-serif",
        letterSpacing: "0.04em",
        lineHeight: 1.3,
      }}>
        {stat.label}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background:   "#FFFFFF",
        borderTop:    "1px solid #EDEDE8",
        borderBottom: "1px solid #EDEDE8",
      }}
    >
      <div style={{
        maxWidth: 1200,
        margin:   "0 auto",
        display:  "flex",
        alignItems: "stretch",
      }}>
        {stats.map((stat, i) => (
          <StatItem
            key={stat.label}
            stat={stat}
            active={active}
            isLast={i === stats.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
