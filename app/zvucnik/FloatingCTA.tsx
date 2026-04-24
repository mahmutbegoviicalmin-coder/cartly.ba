"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { event } from "@/lib/fbpixel";

const ACCENT = "#FF6B00";

export default function FloatingCTA() {
  const [visible,   setVisible]   = useState(false);
  const [hideByObs, setHideByObs] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Slide up after 2.5s
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2_500);
    return () => clearTimeout(t);
  }, []);

  // Hide when order form section is in viewport
  useEffect(() => {
    const section = document.getElementById("naruci");
    if (!section) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => setHideByObs(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observerRef.current.observe(section);
    return () => observerRef.current?.disconnect();
  }, []);

  function scrollToForm() {
    event("AddToCart", {
      content_name: "ZQS-6239 Bluetooth Zvučnik",
      value:        59.90,
      currency:     "BAM",
    });
    const el = document.getElementById("naruci");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  const show = visible && !hideByObs;

  return (
    <>
      {/* ── Desktop pill (bottom-right) ─────────────────────────── */}
      <div
        className="hidden md:flex fixed bottom-6 right-6 z-50 transition-all duration-400"
        style={{
          transform: show ? "translateY(0)" : "translateY(120px)",
          opacity:   show ? 1 : 0,
          transitionTimingFunction: "ease",
          pointerEvents: show ? "auto" : "none",
        }}
      >
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-gray-200 pl-3 pr-3 py-3">
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
            <Image
              src="/images/zvucnik/zvucnik1.webp"
              alt="ZQS-6239"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col min-w-0">
            <span className="text-gray-900 font-semibold text-[13px] leading-tight truncate max-w-[160px]">
              Bluetooth Zvučnik ZQS-6239
            </span>
            <span className="font-bold text-base leading-tight" style={{ color: ACCENT }}>
              59,90 KM
            </span>
          </div>

          {/* Button */}
          <button
            onClick={scrollToForm}
            className="text-white font-bold text-[13px] rounded-xl px-4 py-2.5 flex-shrink-0 hover:opacity-90 transition-opacity"
            style={{ background: ACCENT }}
          >
            Naruči odmah
          </button>
        </div>
      </div>

      {/* ── Mobile bar (full-width bottom) ─────────────────────── */}
      <div
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          transform: show ? "translateY(0)" : "translateY(100%)",
          opacity:   show ? 1 : 0,
          transitionTimingFunction: "ease",
          pointerEvents: show ? "auto" : "none",
        }}
      >
        <div
          className="w-full flex items-center gap-3 bg-white border-t border-gray-200 shadow-2xl px-4 py-3"
          style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
        >
          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
            <Image
              src="/images/zvucnik/zvucnik1.webp"
              alt="ZQS-6239"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-gray-900 font-semibold text-xs leading-tight truncate">
              Bluetooth Zvučnik ZQS-6239
            </span>
            <span className="font-bold text-sm leading-tight" style={{ color: ACCENT }}>
              59,90 KM
            </span>
          </div>

          {/* Button */}
          <button
            onClick={scrollToForm}
            className="text-white font-bold text-sm rounded-xl px-5 py-2.5 flex-shrink-0 hover:opacity-90 transition-opacity"
            style={{ background: ACCENT }}
          >
            Naruči odmah
          </button>
        </div>
      </div>
    </>
  );
}
