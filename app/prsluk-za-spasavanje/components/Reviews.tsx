"use client";

import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";

const REVIEWS = [
  {
    name: "Amila H.",
    location: "Sarajevo",
    text: "Kupila sam za dvoje djece za odlazak na more. Kvalitetan materijal, kopče su čvrste i djeca su se osjećala sigurno cijelo ljeto.",
    rating: 5,
  },
  {
    name: "Nermin K.",
    location: "Tuzla",
    text: "Odličan prsluk za cijenu, brza dostava i tačno onako kako je opisano na stranici. Preporučujem svima koji idu na rijeku ili jezero.",
    rating: 5,
  },
  {
    name: "Selma B.",
    location: "Mostar",
    text: "Prvo smo naručili pogrešnu veličinu, zamjena je bila brza i bez problema. Sada koristimo prsluk skoro svaki vikend.",
    rating: 4,
  },
];

export default function Reviews() {
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
            Recenzije
          </span>
          <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.02em] text-[#061B38] sm:text-[38px]">
            Šta kažu naši kupci
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="rounded-[24px] border border-black/5 bg-white p-8 shadow-[0_2px_20px_-8px_rgba(6,27,56,0.08)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-16px_rgba(6,27,56,0.18)]"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-4 w-4 ${
                      idx < r.rating
                        ? "fill-[#FFC107] text-[#FFC107]"
                        : "fill-transparent text-[#061B38]/15"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-[#061B38]/70">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="text-[14px] font-bold text-[#061B38]">
                  {r.name}
                </span>
                <BadgeCheck className="h-4 w-4 text-[#FFC107]" strokeWidth={2} />
                <span className="text-[13px] text-[#061B38]/45">
                  · {r.location}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
