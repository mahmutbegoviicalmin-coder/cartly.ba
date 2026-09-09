"use client";

import { ArrowRight } from "lucide-react";
import { PRODUCT_PRICE, fmtKM } from "../product";

export default function FinalCTA({ onOrder }: { onOrder: () => void }) {
  return (
    <section className="mp-final" id="naruci">
      <div className="mp-wrap">
        <h2 className="mp-h2">Spremna za posao.</h2>
        <p className="mp-copy" style={{ marginInline: "auto", color: "rgba(255,255,255,0.65)" }}>
          Motorna pila od 4,9 KS sa mačem od 40 cm.
        </p>
        <div className="mp-price-now" style={{ marginTop: 20 }}>
          <strong>{fmtKM(PRODUCT_PRICE)}</strong>
        </div>
        <p className="mp-ship">Dostava 10 KM</p>
        <p className="mp-stock" style={{ justifyContent: "center" }}>
          <span className="mp-pulse" aria-hidden="true" />
          Još malo – zadnji komadi na stanju
        </p>
        <div className="mp-cta-row" style={{ marginTop: 8 }}>
          <button type="button" className="mp-btn mp-btn-buy" onClick={onOrder}>
            Naruči odmah
            <ArrowRight size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </section>
  );
}
