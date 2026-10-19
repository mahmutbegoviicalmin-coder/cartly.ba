"use client";

import { Gift, Check } from "lucide-react";
import { event } from "@/lib/fbpixel";
import { GIFT_PRICE, GIFT_CONTENT_ID, GIFT_LABEL } from "@/lib/gift";

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Brand colour of the page; defaults to a neutral green. */
  accent?: string;
  /** Dark checkout backgrounds. */
  dark?: boolean;
  style?: React.CSSProperties;
}

function tint(hex: string, alpha: number) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return `rgba(22,163,74,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

/** "+5 KM Poklon iznenađenja" opt-in, shared by every product checkout. */
export default function GiftAddon({ checked, onChange, accent = "#16A34A", dark, style }: Props) {
  const ink   = dark ? "#FFFFFF" : "#1D1D1F";
  const muted = dark ? "rgba(255,255,255,0.65)" : "#6E6E73";

  function toggle() {
    const next = !checked;
    onChange(next);
    if (next) {
      event("AddToCart", {
        content_name: GIFT_LABEL,
        content_ids:  [GIFT_CONTENT_ID],
        content_type: "product",
        value:        GIFT_PRICE,
        currency:     "BAM",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={checked}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 14,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        background: checked ? tint(accent, dark ? 0.18 : 0.08) : dark ? "rgba(255,255,255,0.04)" : "#FFFFFF",
        border: `1.5px ${checked ? "solid" : "dashed"} ${checked ? accent : tint(accent, 0.55)}`,
        borderRadius: 16, transition: "all .2s ease", boxSizing: "border-box",
        ...style,
      }}
    >
      <span
        style={{
          width: 22, height: 22, borderRadius: 7, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1.5px solid ${checked ? accent : dark ? "rgba(255,255,255,0.35)" : "#C7C7CC"}`,
          background: checked ? accent : "transparent", transition: "all .2s ease",
        }}
      >
        {checked && <Check size={14} strokeWidth={3} color="#fff" />}
      </span>
      <span
        style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: checked ? (dark ? "rgba(255,255,255,0.12)" : "#FFFFFF") : tint(accent, 0.1), color: accent,
        }}
      >
        <Gift size={20} strokeWidth={1.8} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: ink, letterSpacing: "-0.01em" }}>{GIFT_LABEL}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: accent, whiteSpace: "nowrap" }}>+{GIFT_PRICE},00 KM</span>
        </span>
        <span style={{ display: "block", fontSize: 13, color: muted, marginTop: 3, lineHeight: 1.4 }}>
          Koristan dodatak spakovan uz vašu narudžbu. Dostupno samo uz ovu narudžbu.
        </span>
      </span>
    </button>
  );
}
