"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const COLORS = [
  {
    name: "Narandžasta",
    swatch: "#FF7A1A",
    img: "/prsluk/prsluk2png.png",
  },
  {
    name: "Fluorescentno zelena",
    swatch: "#D6F01A",
    img: "/prsluk/prsluk1png.png",
  },
];

interface Props {
  selected: string;
  onSelect: (color: string) => void;
}

export default function Colors({ selected, onSelect }: Props) {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#FFC107]">
            Boje
          </span>
          <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-[#061B38] sm:text-[38px]">
            Odaberite svoju boju
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {COLORS.map(({ name, swatch, img }, i) => {
            const isSelected = selected === name;
            return (
              <motion.button
                key={name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                onClick={() => onSelect(name)}
                className={`relative overflow-hidden rounded-[24px] border-2 bg-[#F8FAFC] p-8 text-left shadow-[0_2px_20px_-8px_rgba(6,27,56,0.08)] transition-all duration-300 ${
                  isSelected
                    ? "border-[#FFC107] shadow-[0_20px_40px_-16px_rgba(255,193,7,0.35)]"
                    : "border-transparent hover:border-[#061B38]/10"
                }`}
              >
                {isSelected && (
                  <div className="absolute right-6 top-6 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC107]">
                    <Check className="h-4 w-4 text-[#061B38]" strokeWidth={3} />
                  </div>
                )}

                <div className="relative mx-auto aspect-[4/3] w-full">
                  <Image
                    src={img}
                    alt={`Prsluk boja ${name}`}
                    fill
                    sizes="(max-width: 640px) 90vw, 45vw"
                    className="object-contain p-4"
                  />
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border border-black/10"
                    style={{ background: swatch }}
                  />
                  <span className="text-[16px] font-bold text-[#061B38]">
                    {name}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
