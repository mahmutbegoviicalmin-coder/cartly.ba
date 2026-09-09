import Image from "next/image";
import { IMAGES } from "../product";

export default function InUseSection() {
  return (
    <section className="mp-work">
      <div className="mp-wrap mp-work-inner">
        <div>
          <div className="mp-kicker">Alat, ne dekoracija</div>
          <h2 className="mp-h2">Ovo nije ukras.<br />Ovo je alat za posao.</h2>
          <p className="mp-copy">
            Motorna pila od 4,9 KS sa mačem od 40 cm. Lanac .325 i automatsko
            podmazivanje drže rez čistim dok traje posao — drva, grane, ozbiljan rad.
          </p>
        </div>
        <figure className="mp-work-photo">
          <Image
            src={IMAGES.side}
            alt="Motorna pila spremna za rezanje — bočni ugao"
            width={1536}
            height={1024}
            sizes="(max-width: 760px) 100vw, 560px"
          />
        </figure>
      </div>
    </section>
  );
}
