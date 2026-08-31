"use client";

import { useState, useEffect } from "react";
import { PRODUCT } from "./types";
import ProductViewer from "./ProductViewer";

const TRUST = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    text: "Brza dostava",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    text: "Plaćanje pouzećem",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    text: "500+ zadovoljnih kupaca",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    text: "Garancija povrata",
  },
];

interface LezaljkaHeroProps {
  onOrder: () => void;
}

export default function LezaljkaHero({ onOrder }: LezaljkaHeroProps) {
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    const r = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setViewers(r(28, 67));
    const id = setInterval(
      () => setViewers((v) => Math.min(90, Math.max(18, v + r(-2, 3)))),
      r(20000, 35000)
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FFFBEB]" style={{ paddingTop: 56 }}>

      <div className="pointer-events-none absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #F59E0B 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(160deg, #FFFBEB 0%, #FEF9F0 50%, #FFFBEB 100%)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(#92400E 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

      <div className="relative z-10 mx-auto max-w-[1160px] px-6">

        {viewers > 0 && (
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-[13px] font-semibold text-gray-600">
              <strong className="text-gray-900">{viewers}</strong> osoba trenutno gleda
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center pb-0">

          <div className="flex flex-col gap-6 order-2 lg:order-1 pb-16 lg:pb-24">

            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ background: PRODUCT.bg, color: PRODUCT.hex }}
              >
                Ljetna kolekcija 2025
              </span>
            </div>

            <h1 className="text-[clamp(36px,5vw,60px)] font-black leading-[1.04] tracking-[-0.035em] text-gray-950">
              Opusti se u<br />
              <span style={{ color: PRODUCT.hex }}>
                pravom stilu
              </span>
            </h1>

            <p className="max-w-md text-[16px] leading-[1.7] text-gray-500">
              Premium lezaljka s UV otpornom tkaninom, čeličnim okvirom i{" "}
              <strong className="text-gray-800">5 pozicija naslona</strong>. Savršena za baštu,
              terasu ili bazen.
            </p>

            <div
              className="flex items-baseline gap-4 rounded-2xl border px-5 py-4"
              style={{
                background: `${PRODUCT.bg}66`,
                borderColor: `${PRODUCT.hex}22`,
              }}
            >
              <span className="text-[clamp(38px,5vw,52px)] font-black leading-none tracking-[-0.04em] text-gray-950">
                59,90 KM
              </span>
              <span className="text-lg text-gray-400 line-through">129,90 KM</span>
              <span className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[12px] font-black text-white">
                −54%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TRUST.map((t, i) => (
                <div key={i}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white/80 px-3.5 py-2.5 backdrop-blur-sm">
                  <span className="flex-shrink-0" style={{ color: PRODUCT.hex }}>
                    {t.icon}
                  </span>
                  <span className="text-[12px] font-semibold text-gray-700">{t.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={onOrder}
                className="group relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-8 py-5 text-[16px] font-black text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${PRODUCT.hex} 0%, ${PRODUCT.hex}CC 100%)`,
                  boxShadow: `0 12px 32px ${PRODUCT.hex}50`,
                }}
              >
                <span className="absolute inset-0 -translate-x-full bg-white/10 skew-x-[-20deg] transition-transform duration-700 group-hover:translate-x-full" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Naruči odmah
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>

              <div className="text-center text-[11px] text-gray-400 sm:text-left">
                Pouzećem · Bez kartice<br />
                Dostava 10 KM
              </div>
            </div>

          </div>

          <div className="relative order-1 lg:order-2 pb-6 lg:pb-0">
            <ProductViewer />
          </div>

        </div>
      </div>

      <div className="pointer-events-none mt-6 leading-[0]" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: 56 }}>
          <path d="M0,28 C360,56 1080,0 1440,28 L1440,56 L0,56 Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
