"use client";

import { useState } from "react";

const PITANJA = [
  {
    q: "Da li bušilica dolazi s baterijom?",
    a: "Da, u setu se nalazi baterija i punjač. Bušilica je odmah spremna za upotrebu.",
  },
  {
    q: "Koliko dugo traje baterija?",
    a: "Pri normalnoj upotrebi baterija traje 2–3 sata rada. Punjenje traje oko 60 minuta.",
  },
  {
    q: "Je li pogodna za kućnu upotrebu?",
    a: "Da, idealna je za sve DIY projekte u domaćinstvu — montaža namještaja, bušenje zidova, vijčanje i sl.",
  },
  {
    q: "Koliko iznosi dostava?",
    a: "Dostava iznosi 10,00 KM na cijeloj teritoriji BiH. Isporuka u roku 24–48 sati radnim danom.",
  },
  {
    q: "Mogu li vratiti proizvod?",
    a: "Da, povrat je moguć u roku od 14 dana od prijema. Proizvod mora biti nekorišten i u originalnoj ambalaži.",
  },
];

const ACCENT = "#E8460A";

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {PITANJA.map((pitanje, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden transition-all duration-200"
            style={{
              border: "1px solid #E5E2DC",
              borderLeft: isOpen ? `3px solid ${ACCENT}` : "1px solid #E5E2DC",
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-150 hover:bg-[#faf9f7]"
            >
              <span className="text-[#1a1a1a] font-semibold text-base pr-6 leading-snug">
                {pitanje.q}
              </span>
              <span
                className="text-2xl font-light flex-shrink-0 leading-none transition-transform duration-200"
                style={{
                  color: ACCENT,
                  width: 24,
                  textAlign: "center",
                  display: "inline-block",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              >
                +
              </span>
            </button>

            <div
              style={{
                maxHeight: isOpen ? 200 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <div className="px-6 pb-6 pt-1 text-[#666] text-sm leading-relaxed border-t border-[#f0ede8]">
                {pitanje.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
