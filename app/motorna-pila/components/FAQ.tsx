"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const ITEMS = [
  {
    q: "Kako naručujem?",
    a: "Popuni formu na dnu stranice: ime, prezime, adresa, grad, poštanski broj i telefon. Potvrdi narudžbu. Javimo se radi potvrde.",
  },
  {
    q: "Kako se plaća?",
    a: "Plaćanje je pouzećem. Nema avansa i nema plaćanja karticom online. 114,90 KM daš kad preuzmeš paket.",
  },
  {
    q: "Koliko košta dostava?",
    a: "Dostava košta 10 KM. Šaljemo na adresu koju uneseš u narudžbi.",
  },
  {
    q: "Šta dolazi uz pilu?",
    a: "U kutiji je motorna pila, posuda za miješanje goriva i set ključeva za održavanje.",
  },
  {
    q: "Mogu li vratiti proizvod?",
    a: "Da. Povrat je moguć u roku od 7 dana od preuzimanja, ako je pila nekorištena i u originalnoj kutiji.",
  },
  {
    q: "Koja je mješavina goriva?",
    a: "Mješavina je 25:1. Posuda za miješanje dolazi u paketu, da to odradiš odmah.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mp-section" id="pitanja">
      <div className="mp-wrap">
        <div className="mp-kicker">Često postavljena pitanja</div>
        <h2 className="mp-h2">Sve što obično pitaš prije narudžbe.</h2>
        <div className="mp-faq">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`mp-faq-item${isOpen ? " is-open" : ""}`} key={item.q}>
                <button
                  type="button"
                  className="mp-faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {item.q}
                  <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>
                {isOpen && <p className="mp-faq-a">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
