"use client";

import { useEffect } from "react";

const sizes = [
  { cm: "24,5 cm", eu: "EU 39" },
  { cm: "25,0 cm", eu: "EU 40" },
  { cm: "25,5 cm", eu: "EU 41" },
  { cm: "26,0 cm", eu: "EU 42" },
  { cm: "26,5 cm", eu: "EU 43" },
  { cm: "27,0 cm", eu: "EU 44" },
  { cm: "27,5 cm", eu: "EU 45" },
  { cm: "28,0 cm", eu: "EU 46" },
  { cm: "28,5 cm", eu: "EU 47" },
  { cm: "29,0 cm", eu: "EU 48" },
];

const steps = [
  {
    n: "1",
    text: "Stanite uz zid — peta uz zid, stopalo ravno na podu",
  },
  {
    n: "2",
    text: "Označite najduži prst — stavite oznaku na kraju najdužeg prsta",
  },
  {
    n: "3",
    text: "Izmjerite rastojanje — od zida do oznake u centimetrima",
  },
];

interface Props {
  onClose: () => void;
}

export default function SizeGuideModal({ onClose }: Props) {
  // Lock scroll and handle Escape key
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pronađi svoju veličinu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <h2 className="text-lg font-bold text-[#0A0A0A]">
            Pronađi svoju veličinu
          </h2>
          <button
            onClick={onClose}
            aria-label="Zatvori"
            className="w-8 h-8 flex items-center justify-center text-black/40 hover:text-black transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-7">

          {/* Instructions */}
          <p className="text-sm text-black/60 leading-relaxed">
            Izmjerite dužinu stopala u centimetrima, zatim pronađite
            odgovarajuću EU veličinu u tabeli ispod.
          </p>

          {/* Steps */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-4">
              Kako izmjeriti
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {steps.map((s) => (
                <div key={s.n} className="flex-1 flex gap-3 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FF6B00] text-white text-xs font-bold flex items-center justify-center">
                    {s.n}
                  </span>
                  <p className="text-sm text-black/65 leading-snug pt-0.5">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Size table */}
          <div>
            <div className="overflow-hidden border border-black/10">
              {/* Table header */}
              <div className="grid grid-cols-2 bg-[#FF6B00] px-4 py-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Dužina stopala
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider text-right">
                  EU veličina
                </span>
              </div>
              {/* Rows */}
              {sizes.map((row, i) => (
                <div
                  key={row.eu}
                  className={`grid grid-cols-2 px-4 py-2.5 text-sm ${
                    i < sizes.length - 1 ? "border-b border-black/8" : ""
                  } ${i % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]"}`}
                >
                  <span className="font-medium text-[#0A0A0A]">{row.cm}</span>
                  <span className="text-right font-semibold text-[#0A0A0A]">{row.eu}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-black/45 mt-3 leading-relaxed">
              Ako ste između dvije veličine, preporučujemo veću.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
