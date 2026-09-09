"use client";

import { ArrowRight } from "lucide-react";
import {
  DISCOUNT_PCT,
  ORIGINAL_PRICE,
  PRODUCT_PRICE,
  QTY_OFFERS,
  SAVINGS,
  fmtKM,
} from "../product";

export default function OfferSection({ onOrder }: { onOrder: () => void }) {
  const offer = QTY_OFFERS[0];

  return (
    <section className="mp-offer">
      <div className="mp-wrap">
        <div className="mp-offer-card">
          <div>
            <div className="mp-kicker">Ponuda</div>
            <h2 className="mp-h2">Izaberi količinu</h2>
            <div className="mp-qty">
              <span>
                <b>{offer.label}</b>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Motorna pila</div>
              </span>
              <b>{fmtKM(offer.unitPrice)}</b>
            </div>
            <div className="mp-price-old" style={{ color: "rgba(255,255,255,0.4)" }}>{fmtKM(ORIGINAL_PRICE)}</div>
            <div className="mp-price-now">
              <strong>{fmtKM(PRODUCT_PRICE)}</strong>
              <span className="mp-off">-{DISCOUNT_PCT}%</span>
            </div>
            <div className="mp-save">Ušteda {fmtKM(SAVINGS)}</div>
            <p className="mp-ship">Dostava 10,00 KM</p>
            <p className="mp-stock">
              <span className="mp-pulse" aria-hidden="true" />
              Još malo – zadnji komadi na stanju
            </p>
            <p className="mp-limited">Ograničena količina</p>
          </div>
          <div>
            <button type="button" className="mp-btn mp-btn-buy mp-btn-wide" onClick={onOrder}>
              Naruči odmah
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
