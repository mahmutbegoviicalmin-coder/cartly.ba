"use client";

import { Check } from "lucide-react";
import { DISCOUNT_PCT, ORIGINAL_PRICE, PRODUCT_PRICE, SAVINGS, fmtKM } from "../product";
import OrderForm from "./OrderForm";

export default function OrderSection({ onReady }: { onReady?: () => void }) {
  return (
    <section className="mp-section mp-order" id="naruci">
      <div className="mp-wrap mp-order-grid">
        <div>
          <div className="mp-kicker">Narudžba</div>
          <h2 className="mp-h2">Unesi podatke. Plaćaš pouzećem.</h2>
          <p className="mp-copy">
            Nema avansa i nema online plaćanja. Popuni formu, potvrdi narudžbu.
            Javimo se radi potvrde, a 114,90 KM daš kad preuzmeš.
          </p>
          <div className="mp-price-block" style={{ marginTop: 24 }}>
            <div className="mp-price-old">{fmtKM(ORIGINAL_PRICE)}</div>
            <div className="mp-price-now">
              <strong>{fmtKM(PRODUCT_PRICE)}</strong>
              <span className="mp-off">-{DISCOUNT_PCT}%</span>
            </div>
            <div className="mp-save">Ušteda {fmtKM(SAVINGS)}</div>
            <p className="mp-ship">Dostava 10 KM. Ukupno 114,90 KM.</p>
          </div>
          <ul className="mp-cod">
            <li><Check size={16} strokeWidth={2.4} /> Plaćanje pouzećem</li>
            <li><Check size={16} strokeWidth={2.4} /> Dostava 10 KM</li>
            <li><Check size={16} strokeWidth={2.4} /> Povrat u roku od 7 dana</li>
          </ul>
        </div>
        <div className="mp-order-card">
          <OrderForm idPrefix="lp" onReady={onReady} />
        </div>
      </div>
    </section>
  );
}
