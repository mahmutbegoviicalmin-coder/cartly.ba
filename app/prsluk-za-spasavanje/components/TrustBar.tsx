"use client";

import { motion } from "framer-motion";
import { Truck, ShieldCheck, RotateCcw, Wallet } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Brza dostava" },
  { icon: Wallet, label: "Plaćanje pouzećem" },
  { icon: ShieldCheck, label: "Sigurna kupovina" },
  { icon: RotateCcw, label: "Zamjena veličine" },
];

export default function TrustBar() {
  return (
    <section className="border-y border-black/5 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-10 sm:px-8 md:grid-cols-4 md:gap-y-0 md:py-8">
        {ITEMS.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="flex flex-col items-center gap-2.5 text-center sm:flex-row sm:justify-center sm:gap-3 sm:text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFC107]/12">
              <Icon className="h-5 w-5 text-[#061B38]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-semibold text-[#061B38] sm:text-[14px]">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
