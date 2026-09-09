"use client";

import { useEffect, useState } from "react";
import { DISCOUNT_PCT, ORIGINAL_PRICE, PRODUCT_PRICE, fmtKM } from "../product";

export default function FloatingCTA({
  onOrder,
  hidden = false,
}: {
  onOrder: () => void;
  hidden?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [hideByEnd, setHideByEnd] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = document.getElementById("naruci");
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setHideByEnd(e.isIntersecting), { threshold: 0.18 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const show = ready && !hidden && !hideByEnd;

  return (
    <div className={`mp-fcta${show ? "" : " is-hidden"}`}>
      <div className="mp-fcta-info">
        <div className="mp-fcta-stock">
          <i className="mp-live-dot" aria-hidden="true" />
          Na stanju
        </div>
        <div className="mp-fcta-price">
          <strong>{fmtKM(PRODUCT_PRICE)}</strong>
          <s>{fmtKM(ORIGINAL_PRICE)}</s>
          <span>-{DISCOUNT_PCT}%</span>
        </div>
        <p>Pouzećem · Dostava 10 KM</p>
      </div>
      <button type="button" className="mp-fcta-btn" onClick={onOrder}>
        Naruči
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
