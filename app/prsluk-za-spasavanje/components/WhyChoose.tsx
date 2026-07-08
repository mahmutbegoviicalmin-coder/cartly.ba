"use client";

import { motion } from "framer-motion";
import { ShieldCheck, LifeBuoy, Droplets, Gauge, BadgeCheck } from "lucide-react";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Certificirana sigurnost",
    desc: "Izrađen od izdržljivih materijala koji garantuju maksimalnu zaštitu u vodi.",
  },
  {
    icon: LifeBuoy,
    title: "Pouzdana plutavost",
    desc: "Optimalna raspodjela plutajućih jastučića za stabilnost na površini vode.",
  },
  {
    icon: Droplets,
    title: "Brzo sušenje",
    desc: "Vodootporni materijal koji se ne natapa i brzo se suši nakon upotrebe.",
  },
  {
    icon: Gauge,
    title: "Podesive kopče",
    desc: "Tri sigurnosne kopče omogućavaju precizno prilagođavanje svakoj veličini tijela.",
  },
  {
    icon: BadgeCheck,
    title: "Provjeren kvalitet",
    desc: "Preko 1.200 zadovoljnih kupaca širom Bosne i Hercegovine.",
  },
];

export default function WhyChoose() {
  return (
    <section className="bg-[#F8FAFC] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#FFC107]">
            Zašto ovaj prsluk
          </span>
          <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-[#061B38] sm:text-[38px]">
            Zašto odabrati ovaj prsluk
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="rounded-[24px] border border-black/5 bg-white p-8 shadow-[0_2px_20px_-8px_rgba(6,27,56,0.08)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-16px_rgba(6,27,56,0.18)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#061B38]">
                <Icon className="h-6 w-6 text-[#FFC107]" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-[17px] font-bold text-[#061B38]">
                {title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#061B38]/55">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
