"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Kako odabrati pravu veličinu?",
    a: "Preporučujemo da odaberete svoju standardnu EU veličinu. Ako ste između dvije veličine, uzmite veću. Kalup je standardan i odgovara većini stopala.",
  },
  {
    q: "Kako se vrši dostava i koliko košta?",
    a: "Dostava se vrši putem Euro Express kurirske službe. Cijena dostave je 10,00 KM bez obzira na količinu. Isporuka je 1–3 radna dana od potvrde narudžbe.",
  },
  {
    q: "Mogu li platiti karticom ili samo pouzećem?",
    a: "Trenutno je dostupno isključivo plaćanje pouzećem — plaćate kuriru pri preuzimanju paketa. Plaćanje karticom uskoro dolazi.",
  },
  {
    q: "Šta ako mi veličina ne odgovara ili nisam zadovoljan proizvodom?",
    a: "Imate pravo na povrat u roku od 14 dana od dana preuzimanja. Proizvod mora biti nekorišten i u originalnoj ambalaži. Troškove povratne dostave snosi kupac.",
  },
  {
    q: "Da li su patike certificirane za radna mjesta?",
    a: "Da. Radne Patike S3 ispunjavaju EN ISO 20345 S3 standard, što uključuje čeličnu kapicu (zaštita do 200 J), antistatička svojstva, otpornost na probijanje i energetsku apsorpciju u peti.",
  },
  {
    q: "Koliko brzo ću dobiti potvrdu narudžbe?",
    a: "Nakon što popunite formu, naš tim vas kontaktira telefonom u roku od 24 sata radi potvrde narudžbe i dogovora oko dostave.",
  },
  {
    q: "Mogu li naručiti više pari odjednom?",
    a: "Da, u formi možete odabrati količinu do 5 pari. Za veće narudžbe kontaktirajte nas direktno na broj telefona.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="bg-white border-t border-black/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-10 lg:mb-12 text-[#0A0A0A]">
          Često <span className="text-[#FF6B00]">postavljena</span> pitanja
        </h2>

        <div className="divide-y divide-black/10 border-t border-black/10">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-6 py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${isOpen ? "text-[#FF6B00]" : "text-[#0A0A0A] group-hover:text-[#FF6B00]"}`}>
                    {faq.q}
                  </span>
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#FF6B00]">
                    {isOpen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-5" : "max-h-0"}`}
                >
                  <p className="text-sm text-black/60 leading-relaxed pr-10">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
