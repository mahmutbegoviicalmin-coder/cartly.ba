"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  target: number;
  label: string;
  format: (n: number) => string;
  isStar?: boolean;
}

const stats: Stat[] = [
  {
    target: 1200,
    label: "zadovoljnih kupaca",
    format: (n) => {
      const rounded = Math.round(n);
      return rounded >= 1000
        ? Math.floor(rounded / 100) / 10 + ".000+"
        : rounded + "+";
    },
  },
  {
    target: 48,
    label: "prosječna ocjena",
    isStar: true,
    format: (n) => (n / 10).toFixed(1),
  },
  {
    target: 14,
    label: "garancija povrata",
    format: (n) => Math.round(n) + " dana",
  },
  {
    target: 200,
    label: "zaštita čeličnog vrha",
    format: (n) => Math.round(n) + "J",
  },
];

function StarIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="white"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      aria-hidden="true"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [active, target, duration]);

  return value;
}

function StatItem({ stat, active, isLast }: { stat: Stat; active: boolean; isLast: boolean }) {
  const raw = useCountUp(stat.target, 1500, active);
  const display = stat.format(raw);

  const fontSize = "clamp(28px, 4vw, 48px)";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        position: "relative",
      }}
    >
      {/* Divider */}
      {!isLast && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "1px",
            height: "40px",
            backgroundColor: "rgba(255,255,255,0.25)",
          }}
        />
      )}

      {/* Number + optional star */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          lineHeight: 1.1,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}
        >
          {display}
        </span>
        {stat.isStar && <StarIcon size={36} />}
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: "14px",
          fontWeight: 400,
          color: "rgba(255,255,255,0.75)",
          marginTop: "6px",
          lineHeight: 1.4,
        }}
      >
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ backgroundColor: "#FF6B00", width: "100%", paddingTop: "40px", paddingBottom: "40px" }}
    >
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6"
        style={{ display: "flex", alignItems: "stretch" }}
      >
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
