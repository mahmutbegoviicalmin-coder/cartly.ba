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

function StatItem({ stat, active, index }: { stat: Stat; active: boolean; index: number }) {
  const raw = useCountUp(stat.target, 1500, active);
  const display = stat.format(raw);

  return (
    <div className={`stats-item stats-item-${index}`}>
      {/* Number + optional star */}
      <div className="stats-number-row">
        <span className="stats-number">{display}</span>
        {stat.isStar && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stats-star"
            viewBox="0 0 24 24"
            fill="white"
            aria-hidden="true"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        )}
      </div>

      {/* Label */}
      <span className="stats-label">{stat.label}</span>

      <style>{`
        .stats-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 24px;
          position: relative;
        }
        /* Desktop dividers — right border on all except last */
        .stats-item-0::after,
        .stats-item-1::after,
        .stats-item-2::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.25);
        }
        .stats-number-row {
          display: flex;
          align-items: center;
          gap: 4px;
          line-height: 1.1;
        }
        .stats-number {
          font-family: var(--font-inter), sans-serif;
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: -0.02em;
        }
        .stats-star {
          width: 40px;
          height: 40px;
          display: inline-block;
          vertical-align: middle;
          flex-shrink: 0;
        }
        .stats-label {
          font-family: var(--font-inter), sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: rgba(255,255,255,0.75);
          margin-top: 6px;
          line-height: 1.4;
        }

        @media (max-width: 767px) {
          .stats-item {
            width: 50%;
            flex: none;
            padding: 20px 16px;
          }
          /* Remove all desktop dividers on mobile */
          .stats-item-0::after,
          .stats-item-1::after,
          .stats-item-2::after {
            display: none;
          }
          /* Mobile dividers: right border only for left-column items (0, 2) */
          .stats-item-0,
          .stats-item-2 {
            border-right: 1px solid rgba(255,255,255,0.25);
          }
          /* Bottom border for top row items (0, 1) */
          .stats-item-0,
          .stats-item-1 {
            border-bottom: 1px solid rgba(255,255,255,0.25);
          }
          .stats-number {
            font-size: 32px !important;
          }
          .stats-star {
            width: 28px !important;
            height: 28px !important;
          }
          .stats-label {
            font-size: 12px !important;
          }
        }
      `}</style>
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
        style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap" }}
      >
        {stats.map((stat, i) => (
          <StatItem
            key={stat.label}
            stat={stat}
            active={active}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
