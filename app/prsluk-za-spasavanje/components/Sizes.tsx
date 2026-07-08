"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SIZES = [
  { size: "S", price: 42, desc: "Djeca do 9 godina" },
  { size: "M", price: 45, desc: "Djeca do 15 godina" },
  { size: "3XL", price: 49, desc: "Odrasli" },
];

interface Props {
  onOrder: (size: string) => void;
}

export default function Sizes({ onOrder }: Props) {
  return (
    <section id="velicine" className="bg-[#F8FAFC] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#FFC107]">
            Veličine
          </span>
          <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-[#061B38] sm:text-[38px]">
            Dostupne veličine
          </h2>
          <p className="mt-3 text-[15px] text-[#061B38]/55">
            Odaberite veličinu koja odgovara uzrastu ili tjelesnoj konstituciji.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {SIZES.map(({ size, price, desc }, i) => (
            <motion.button
              key={size}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              onClick={() => onOrder(size)}
              className="group relative rounded-[24px] border-2 border-transparent bg-white p-8 text-left shadow-[0_2px_20px_-8px_rgba(6,27,56,0.08)] transition-all duration-300 hover:border-[#FFC107] hover:shadow-[0_20px_40px_-16px_rgba(255,193,7,0.3)]"
            >
              <span className="text-[34px] font-extrabold tracking-[-0.02em] text-[#061B38]">
                {size}
              </span>
              <div className="mt-3 text-[24px] font-bold text-[#061B38]">
                {price},00 KM
              </div>
              <p className="mt-2 text-[14px] text-[#061B38]/55">{desc}</p>

              <div className="mt-5 flex items-center gap-1.5 text-[13px] font-bold text-[#061B38]/40 transition-colors group-hover:text-[#061B38]">
                Naruči ovu veličinu
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
