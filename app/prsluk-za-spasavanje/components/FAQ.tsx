"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Koje su dostupne veličine?",
    a: "Prsluk je dostupan u tri veličine: S (djeca do 9 godina), M (djeca do 15 godina) i 3XL (odrasli). Ako niste sigurni koja veličina odgovara, kontaktirajte nas prije narudžbe.",
  },
  {
    q: "Koje su boje dostupne?",
    a: "Prsluk dolazi u dvije boje: narandžasta i fluorescentno zelena. Obje boje pružaju odličnu vidljivost na vodi.",
  },
  {
    q: "Kako se plaća narudžba?",
    a: "Plaćanje se vrši pouzećem — plaćate gotovinom direktno dostavljaču prilikom preuzimanja paketa.",
  },
  {
    q: "Koliko traje dostava?",
    a: "Dostava se realizuje u roku od 1 do 3 radna dana na teritoriji cijele Bosne i Hercegovine.",
  },
  {
    q: "Mogu li zamijeniti veličinu ako ne odgovara?",
    a: "Da, ukoliko veličina ne odgovara, omogućena je jednostavna zamjena u zakonskom roku.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#FFC107]">
            FAQ
          </span>
          <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-[#061B38] sm:text-[38px]">
            Česta pitanja
          </h2>
        </motion.div>

        <div className="mt-12 space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                className="overflow-hidden rounded-[20px] border border-black/5 bg-[#F8FAFC]"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-semibold text-[#061B38]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#061B38]/50 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <p className="px-6 pb-5 text-[14px] leading-relaxed text-[#061B38]/60">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
