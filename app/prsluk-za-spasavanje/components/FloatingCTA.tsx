"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function FloatingCTA({ onOrder }: { onOrder: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[150] flex items-center gap-3 border-t border-black/5 bg-white px-4 py-2.5 shadow-[0_-4px_24px_rgba(6,27,56,0.08)] transition-all duration-300 [padding-bottom:calc(10px+env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-w-[340px] sm:rounded-2xl sm:border sm:border-black/5 sm:px-4 sm:py-3 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 sm:translate-y-4"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-green-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-green-600">
            Na stanju
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[17px] font-extrabold tracking-[-0.02em] text-[#061B38]">
            42–49 KM
          </span>
          <span className="text-[11px] text-[#061B38]/40">+ dostava</span>
        </div>
      </div>

      <button
        onClick={onOrder}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#061B38] px-4 py-3 text-[13px] font-bold text-white transition-transform active:scale-95 sm:hover:scale-[1.03]"
      >
        Naruči
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
