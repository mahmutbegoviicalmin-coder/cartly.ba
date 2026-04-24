"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ZoomIn, Users, TrendingUp } from "lucide-react";

const ACCENT = "#FF6B00";

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function HeroImage() {
  const [lightbox,  setLightbox]  = useState(false);
  const [loaded,    setLoaded]    = useState(false);
  const [hovered,   setHovered]   = useState(false);
  const [viewers,   setViewers]   = useState(0);
  const [stockPct,  setStockPct]  = useState(0);
  const [stockLeft, setStockLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Randomise on mount — different every page load
  useEffect(() => {
    setViewers(randomBetween(9, 28));
    const pct  = randomBetween(12, 43);   // always below 50 %
    const left = randomBetween(3, 11);    // komada na stanju
    setStockPct(pct);
    setStockLeft(left);
  }, []);

  // Slowly drift viewers up/down every 8-14 s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setViewers(v => {
        const delta = Math.random() < 0.5 ? -1 : 1;
        return Math.max(6, Math.min(35, v + delta));
      });
    }, randomBetween(8_000, 14_000));
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightbox) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(false); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [lightbox]);

  // Progress bar colour: red when very low, orange when moderate
  const barColor = stockPct < 20 ? "#EF4444" : ACCENT;

  return (
    <>
      {/* ── Image card ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 480 }}>

        {/* Image container */}
        <div
          className="relative w-full rounded-3xl overflow-hidden cursor-zoom-in"
          style={{
            background:  "#EEEAE4",
            aspectRatio: "1 / 1",
            boxShadow:   hovered ? "0 12px 40px rgba(0,0,0,0.12)" : "0 4px 20px rgba(0,0,0,0.07)",
            transition:  "box-shadow 300ms ease",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setLightbox(true)}
        >
          {/* Placeholder shimmer */}
          {!loaded && (
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "linear-gradient(90deg, #EEEAE4 25%, #E5E0DA 50%, #EEEAE4 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          )}

          <style>{`
            @keyframes shimmer {
              0%   { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>

          <Image
            src="/images/brusilica.webp"
            alt="Profesionalna Akumulatorska Brusilica"
            fill
            className="object-contain p-10 transition-transform duration-500"
            style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
            sizes="(max-width: 1024px) 90vw, 45vw"
            priority
            onLoad={() => setLoaded(true)}
          />

          {/* Zoom hint badge */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-opacity duration-200"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              color: "#555",
              opacity: hovered ? 1 : 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            <ZoomIn size={13} strokeWidth={2} />
            Uvećaj
          </div>
        </div>

        {/* ── Live viewers + stock bar ────────────────────────── */}
        <div
          className="rounded-2xl px-4 py-3.5 flex flex-col gap-2.5"
          style={{ background: "#fff", border: "1px solid #E5E2DC" }}
        >
          {/* Viewers row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "#555" }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "#22c55e" }}
                />
                <Users size={12} strokeWidth={2.5} style={{ color: "#22c55e" }} />
                <span>
                  Ovaj proizvod trenutno gleda{" "}
                  <span className="font-bold text-[#1a1a1a]">{viewers}</span>{" "}
                  {viewers === 1 ? "osoba" : viewers < 5 ? "osobe" : "osoba"}
                </span>
              </span>
            </div>
            <TrendingUp size={14} strokeWidth={2} style={{ color: ACCENT }} />
          </div>

          {/* Stock row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: barColor }}>
                {stockPct < 20 ? "Kritično malo na stanju!" : "Skoro nestalo!"}
              </span>
              <span className="text-[11px] font-bold" style={{ color: barColor }}>
                Samo još {stockLeft} {stockLeft === 1 ? "komad" : "komada"}
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 6, background: "#F0EDE8" }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width:      `${stockPct}%`,
                  background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                }}
              />
            </div>

            <p className="text-[10px] text-[#bbb] font-medium mt-1">
              Dostupnost se ažurira u realnom vremenu
            </p>
          </div>
        </div>
      </div>

      {/* ── Lightbox ────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animation: "fadeIn 200ms ease",
          }}
          onClick={() => setLightbox(false)}
        >
          <style>{`
            @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
            @keyframes scaleIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
          `}</style>

          {/* Close button */}
          <button
            className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-colors"
            onClick={() => setLightbox(false)}
            aria-label="Zatvori"
          >
            <X size={22} strokeWidth={2} />
          </button>

          {/* Image panel */}
          <div
            className="relative"
            style={{
              width:     "min(90vw, 720px)",
              height:    "min(90vw, 720px)",
              animation: "scaleIn 220ms ease",
            }}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src="/images/brusilica.webp"
              alt="Profesionalna Akumulatorska Brusilica"
              fill
              className="object-contain"
              sizes="720px"
              priority
            />
          </div>

          <p className="absolute bottom-5 text-white/40 text-xs font-medium">
            Klikni bilo gdje za zatvaranje
          </p>
        </div>
      )}
    </>
  );
}
