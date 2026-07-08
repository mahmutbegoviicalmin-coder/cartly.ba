"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

const IMAGES = [
  { src: "/prsluk/prsluk1png.png", alt: "Prsluk fluorescentno zeleni — prednja i zadnja strana" },
  { src: "/prsluk/prsluk1.png", alt: "Prsluk fluorescentno zeleni — detalj" },
  { src: "/prsluk/prsluk2png.png", alt: "Prsluk narandžasti — prednja i zadnja strana" },
  { src: "/prsluk/prsluk2.png", alt: "Prsluk narandžasti — detalj" },
];

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null);

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
            Galerija
          </span>
          <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-[#061B38] sm:text-[38px]">
            Pogledajte proizvod izbliza
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {IMAGES.map((img, i) => (
            <motion.button
              key={img.src + i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              onClick={() => setActive(i)}
              className="group relative aspect-square overflow-hidden rounded-[24px] border border-black/5 bg-[#F8FAFC] shadow-[0_2px_20px_-8px_rgba(6,27,56,0.08)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-16px_rgba(6,27,56,0.2)]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[#061B38]/0 transition-colors duration-300 group-hover:bg-[#061B38]/10">
                <div className="flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-white/95 opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <ZoomIn className="h-4.5 w-4.5 text-[#061B38]" strokeWidth={2} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#061B38]/90 p-6 backdrop-blur-sm"
          >
            <button
              onClick={() => setActive(null)}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Zatvori"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative aspect-square w-full max-w-2xl rounded-[24px] bg-white p-8"
            >
              <Image
                src={IMAGES[active].src}
                alt={IMAGES[active].alt}
                fill
                sizes="90vw"
                className="object-contain p-6"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
