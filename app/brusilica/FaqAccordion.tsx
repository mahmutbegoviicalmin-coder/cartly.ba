"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const ACCENT = "#FF6B00";

const FAQ_ITEMS = [
  {
    q: "Kako se vrši dostava?",
    a: "Dostava se vrši putem Euro Express kurirske službe. Isporuka u roku 1–3 radna dana na cijeloj teritoriji Bosne i Hercegovine.",
  },
  {
    q: "Kako plaćam?",
    a: "Plaćanje se vrši pouzećem pri preuzimanju paketa od kurira. Ne trebate plaćati unaprijed — platite samo kada dobijete paket.",
  },
  {
    q: "Da li mogu vratiti proizvod?",
    a: "Da, povrat je moguć u roku od 14 dana od dana prijema pošiljke. Proizvod mora biti nekorišten i u originalnoj ambalaži.",
  },
  {
    q: "Koliko traje baterija?",
    a: "Baterija M18 B5 kapaciteta 5Ah omogućava dugotrajan rad. Uz intenzivnu profesionalnu upotrebu, jedna baterija traje do 2 sata. U kompletu dolaze 2 baterije.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="rounded-2xl overflow-hidden transition-all duration-200"
            style={{
              background:  "#fff",
              borderTop:   "1px solid #E5E2DC",
              borderRight: "1px solid #E5E2DC",
              borderBottom:"1px solid #E5E2DC",
              borderLeft:  isOpen ? `3px solid ${ACCENT}` : "1px solid #E5E2DC",
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#fafaf8] transition-colors duration-150"
            >
              <span className="text-[#1a1a1a] font-semibold text-base pr-6 leading-snug">
                {item.q}
              </span>
              <span
                className="flex-shrink-0 transition-transform duration-200"
                style={{
                  color:     ACCENT,
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              >
                <Plus size={20} strokeWidth={2.5} />
              </span>
            </button>

            <div
              style={{
                maxHeight:  isOpen ? 240 : 0,
                overflow:   "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <div className="px-6 pb-6 pt-1 text-[#666] text-sm leading-relaxed border-t border-[#f0ede8]">
                {item.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
