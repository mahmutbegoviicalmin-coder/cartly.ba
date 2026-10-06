"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import SmartImage from "./SmartImage";
import { INK, MUTED, SOFT, IMG, PRODUCT, UNIT_PRICE, OLD_PRICE, F, fmt } from "./theme";

export default function FloatingCTA({ onOrder, hidden }: { onOrder: () => void; hidden?: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  const show = visible && !hidden;

  return (
    <button
      type="button"
      className="mk-fab"
      onClick={onOrder}
      aria-label={`Naruči odmah ${PRODUCT}`}
      style={{
        fontFamily: F,
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(28px)",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <span className="mk-fab-thumb" style={{ width: 48, flexShrink: 0 }}>
        <SmartImage src={IMG.hero} alt="" label="" radius={14} fit="contain" minimal />
      </span>
      <span className="mk-fab-copy">
        <span style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>Makita 1500W</span>
        <span style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
          {fmt(UNIT_PRICE)} <s style={{ color: SOFT }}>{fmt(OLD_PRICE)}</s>
        </span>
      </span>
      <span className="mk-fab-btn">
        Naruči odmah <ArrowRight size={16} strokeWidth={2.2} />
      </span>
    </button>
  );
}
