"use client";

import { LifeBuoy } from "lucide-react";

export default function Header({ onOrder }: { onOrder: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#061B38]">
            <LifeBuoy className="h-5 w-5 text-[#FFC107]" strokeWidth={2.2} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[#061B38]">
            AquaSafe
          </span>
        </div>

        <button
          onClick={onOrder}
          className="rounded-full bg-[#061B38] px-5 py-2.5 text-[13px] font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        >
          Naruči odmah
        </button>
      </div>
    </header>
  );
}
