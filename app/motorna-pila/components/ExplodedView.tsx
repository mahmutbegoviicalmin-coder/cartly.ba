import Image from "next/image";
import { IMAGES } from "../product";

export default function ExplodedView() {
  return (
    <section className="mp-section" id="konstrukcija">
      <div className="mp-wrap">
        <div className="mp-kicker">Konstrukcija</div>
        <h2 className="mp-h2">Pogledaj konstrukciju prije nego što naručiš.</h2>
        <p className="mp-copy">
          Filter, motor, kvačilo, mač 40 cm i lanac sa 32 zuba. Sve na jednom
          pregledu, na istoj svijetloj podlozi.
        </p>
        <figure className="mp-explode">
          <Image
            src={IMAGES.exploded}
            alt="Rastavljeni pregled motorne pile: filter, motor, kvačilo, mač 40 cm i lanac"
            width={1536}
            height={1024}
            sizes="(max-width: 1180px) 100vw, 1180px"
          />
        </figure>
      </div>
    </section>
  );
}
