import Image from "next/image";
import { Droplets, Ruler, Zap } from "lucide-react";
import { IMAGES } from "../product";

const BENEFITS = [
  {
    Icon: Zap,
    title: "4,9 KS do kraja reza",
    text: "Benzinski motor od 4,9 KS ima snage za drva, debela debla i duže rezove, bez da staneš na pola posla.",
  },
  {
    Icon: Ruler,
    title: "Mač 40 cm, lanac .325",
    text: "Dužina od 40 cm pokriva većinu poslova oko kuće i imanja. Lanac sa 32 zuba ide čisto kroz drvo.",
  },
  {
    Icon: Droplets,
    title: "Lanac se sam podmazuje",
    text: "Automatsko podmazivanje drži lanac u pogonu tokom reza. Manje pauza, manje brige dok radiš.",
  },
];

export default function FeatureStory() {
  return (
    <>
      <section className="mp-section mp-section-alt" id="zasto">
        <div className="mp-wrap">
          <div className="mp-kicker">Zašto ova pila</div>
          <h2 className="mp-h2">Napravljena za posao koji moraš završiti.</h2>
          <p className="mp-copy">
            Nije igračka za vikend. Motorna pila sa stvarnom snagom, pravim mačem
            i kompletom u kutiji. Cijenu plaćaš tek kad stigne.
          </p>
          <div className="mp-benefits">
            {BENEFITS.map(({ Icon, title, text }) => (
              <article className="mp-benefit" key={title}>
                <div className="mp-benefit-icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mp-section">
        <div className="mp-wrap">
          <div className="mp-kicker">U radu</div>
          <h2 className="mp-h2">Jedna pila. Dovoljno snage za dvorište i imanje.</h2>
          <p className="mp-copy" style={{ marginBottom: 8 }}>
            6,3 kg, mač 40 cm i automatsko podmazivanje. Spremna čim otvoriš kutiju.
          </p>
          <figure className="mp-show">
            <Image
              src={IMAGES.front}
              alt="Motorna pila 4,9 KS, pogled niz mač"
              width={1536}
              height={1024}
              sizes="(max-width: 1180px) 100vw, 1180px"
            />
          </figure>
        </div>
      </section>
    </>
  );
}
