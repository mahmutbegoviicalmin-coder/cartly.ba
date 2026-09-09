"use client";

import { ArrowRight } from "lucide-react";
import ProductGallery from "./ProductGallery";
import CountdownTimer from "./CountdownTimer";
import { DISCOUNT_PCT, ORIGINAL_PRICE, PRODUCT_PRICE, SAVINGS, fmtKM } from "../product";

export default function ProductHero({ onOrder }: { onOrder: () => void }) {
  return (
    <section className="mp-hero">
      <div className="mp-wrap mp-hero-grid">
        <div className="mp-hero-media">
          <ProductGallery />
        </div>

        <div className="mp-hero-copy">
          <div className="mp-badge">Akcija -{DISCOUNT_PCT}%</div>
          <h1>Za drvo koje neće samo od sebe.</h1>
          <p className="mp-hero-lead mp-desk">
            Mač 40 cm, lanac .325 sa 32 zuba i automatsko podmazivanje. Umjesto
            299 KM plaćaš 104,90 KM. Dostava 10 KM, plaćanje pouzećem.
          </p>
          <p className="mp-hero-lead mp-mob">
            Mač 40 cm. 104,90 KM umjesto 299 KM. Plaćanje pouzećem.
          </p>

          <CountdownTimer />

          <div className="mp-price-block">
            <div className="mp-price-old">{fmtKM(ORIGINAL_PRICE)}</div>
            <div className="mp-price-now">
              <strong>{fmtKM(PRODUCT_PRICE)}</strong>
              <span className="mp-off">-{DISCOUNT_PCT}%</span>
            </div>
            <div className="mp-save">Ušteda {fmtKM(SAVINGS)}</div>
            <p className="mp-ship">Dostava 10 KM. Ukupno 114,90 KM pouzećem.</p>
          </div>

          <div className="mp-cta-row">
            <button type="button" className="mp-btn mp-btn-buy" onClick={onOrder}>
              Naruči odmah
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>
            <a href="#karakteristike" className="mp-btn mp-btn-ghost mp-desk">
              Pogledaj karakteristike
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
