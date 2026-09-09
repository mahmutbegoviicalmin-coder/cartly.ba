import { Banknote, RotateCcw, Truck } from "lucide-react";

const CARDS = [
  {
    Icon: Banknote,
    title: "Plaćanje pouzećem",
    text: "Nema avansa. Plaćaš kad preuzmeš.",
  },
  {
    Icon: Truck,
    title: "Dostava 10 KM",
    text: "Na adresu koju uneseš u narudžbi.",
  },
  {
    Icon: RotateCcw,
    title: "Povrat 7 dana",
    text: "Možeš vratiti u roku od 7 dana.",
  },
];

export default function TrustCards() {
  return (
    <section className="mp-trust-strip" aria-label="Uslovi kupovine">
      <div className="mp-wrap mp-trust-grid">
        {CARDS.map(({ Icon, title, text }) => (
          <article className="mp-trust-card" key={title}>
            <div className="mp-trust-icon" aria-hidden="true">
              <Icon size={22} strokeWidth={2} />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
