"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

const VARIANTS = [
  { name: "Fluorescentno zelena", img: "/prsluk/prsluk1png.png", swatch: "#D6F01A" },
  { name: "Narandžasta", img: "/prsluk/prsluk2png.png", swatch: "#FF7A1A" },
];

export default function Hero({ onOrder }: { onOrder: () => void }) {
  const [active, setActive] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC]">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[500px] w-[500px] rounded-full bg-[#FFC107]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-[400px] w-[400px] rounded-full bg-[#061B38]/5 blur-3xl" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16 lg:grid-cols-2 lg:gap-16 lg:pb-28 lg:pt-20">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="order-2 lg:order-1"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#061B38]/5 px-4 py-1.5">
            <Star className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" />
            <span className="text-[12px] font-semibold text-[#061B38]">
              Certificirana sigurnosna oprema
            </span>
          </div>

          <h1 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#061B38] sm:text-[52px] lg:text-[58px]">
            Uživajte u vodi
            <br />
            bez brige.
          </h1>

          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[#061B38]/60 sm:text-[17px]">
            Sigurnosni prsluk za spašavanje na vodi — pouzdana zaštita za
            djecu i odrasle. Lagan, plutajući i udoban za svaku avanturu na
            vodi.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onOrder}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#061B38] px-8 py-4 text-[15px] font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#0a2a56] active:scale-95"
            >
              Naruči odmah
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <a
              href="#velicine"
              className="inline-flex items-center justify-center rounded-2xl border border-[#061B38]/15 bg-white px-8 py-4 text-[15px] font-semibold text-[#061B38] transition-all duration-200 hover:border-[#061B38]/30 hover:scale-[1.02] active:scale-95"
            >
              Pogledaj veličine
            </a>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="order-1 lg:order-2"
        >
          <div className="relative mx-auto aspect-square max-w-[480px] rounded-[24px] bg-gradient-to-br from-white to-[#F0F4F8] p-8 shadow-[0_30px_80px_-20px_rgba(6,27,56,0.18)] sm:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={VARIANTS[active].img}
                  alt={`Sigurnosni prsluk za spašavanje na vodi — ${VARIANTS[active].name}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-contain p-6"
                />
              </motion.div>
            </AnimatePresence>

            {/* Color switcher */}
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 p-1.5 shadow-[0_4px_20px_rgba(6,27,56,0.12)] backdrop-blur-sm">
              {VARIANTS.map((v, i) => (
                <button
                  key={v.name}
                  onClick={() => setActive(i)}
                  aria-label={`Prikaži boju ${v.name}`}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    active === i ? "scale-110 border-[#061B38]" : "border-transparent hover:scale-105"
                  }`}
                  style={{ background: v.swatch }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
