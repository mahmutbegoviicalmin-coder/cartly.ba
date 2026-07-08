"use client";

import { motion } from "framer-motion";
import { ArrowRight, LifeBuoy } from "lucide-react";

export default function FinalCTA({ onOrder }: { onOrder: () => void }) {
  return (
    <section className="relative overflow-hidden bg-[#061B38] py-20 sm:py-28">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#FFC107]/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC107]"
        >
          <LifeBuoy className="h-8 w-8 text-[#061B38]" strokeWidth={2} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-8 text-[32px] font-extrabold tracking-[-0.02em] text-white sm:text-[42px]"
        >
          Osigurajte sigurnost na vodi već danas
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-white/55"
        >
          Naručite sigurnosni prsluk za spašavanje uz plaćanje pouzećem i
          brzu dostavu širom Bosne i Hercegovine.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          onClick={onOrder}
          className="group mt-9 inline-flex items-center gap-2 rounded-2xl bg-[#FFC107] px-10 py-5 text-[16px] font-bold text-[#061B38] transition-transform duration-200 hover:scale-[1.03] active:scale-95"
        >
          Naruči odmah
          <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
        </motion.button>
      </div>
    </section>
  );
}
