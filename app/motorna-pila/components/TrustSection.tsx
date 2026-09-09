import Image from "next/image";
import { Check } from "lucide-react";
import { IMAGES } from "../product";

const POINTS = [
  "4,9 KS snage",
  "Mač 40 cm",
  "Automatsko podmazivanje",
  "Set za održavanje uključen",
  "Dostava 10 KM",
];

export default function TrustSection() {
  return (
    <section className="mp-trust">
      <div className="mp-wrap mp-trust-grid">
        <div>
          <h2>Napravljena za posao.</h2>
          <ul className="mp-trust-list">
            {POINTS.map((t) => (
              <li key={t}>
                <Check size={18} strokeWidth={2.6} aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <figure className="mp-trust-photo">
          <Image
            src={IMAGES.front}
            alt="Motorna pila 4,9 KS — pogled niz mač"
            width={1536}
            height={1024}
            sizes="(max-width: 1024px) 100vw, 560px"
          />
        </figure>
      </div>
    </section>
  );
}
