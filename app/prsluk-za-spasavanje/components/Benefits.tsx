"use client";

import { motion } from "framer-motion";
import { LifeBuoy, ShieldCheck, Droplets, Package, Clock3, Users } from "lucide-react";

const BENEFITS = [
  { icon: LifeBuoy, title: "Sigurno plutanje", desc: "Ravnomjerna raspodjela plutajućih segmenata." },
  { icon: ShieldCheck, title: "Otporan materijal", desc: "Izdržljiva tkanina otporna na habanje i kidanje." },
  { icon: Droplets, title: "Vodootporan", desc: "Ne upija vodu, ostaje lagan tokom cijele upotrebe." },
  { icon: Package, title: "Kompaktno pakovanje", desc: "Lako za nošenje, spremanje i transport." },
  { icon: Clock3, title: "Brza dostava", desc: "Isporuka na vašu adresu u kratkom roku." },
  { icon: Users, title: "Za sve uzraste", desc: "Veličine prilagođene djeci i odraslima." },
];

export default function Benefits() {
  return (
    <section className="bg-[#061B38] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#FFC107]">
            Prednosti
          </span>
          <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-white sm:text-[38px]">
            Sve što vam treba za sigurnost
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.07]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC107]">
                <Icon className="h-6 w-6 text-[#061B38]" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-[17px] font-bold text-white">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/55">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
