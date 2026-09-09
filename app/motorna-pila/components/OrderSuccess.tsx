"use client";

import { Check } from "lucide-react";
import { fmtKM } from "../product";

export default function OrderSuccess({
  orderNumber,
  total,
}: {
  orderNumber: string;
  total: number;
}) {
  return (
    <div className="mp-success" role="status">
      <div className="mp-success-icon" aria-hidden="true">
        <Check size={26} strokeWidth={2.6} />
      </div>
      <h3 className="mp-h2" style={{ fontSize: 28, marginBottom: 8 }}>
        Narudžba je uspješno primljena.
      </h3>
      <p className="mp-copy" style={{ marginInline: "auto" }}>
        Uskoro ćemo te kontaktirati radi potvrde narudžbe.
      </p>
      <div style={{ marginTop: 22, padding: "16px 0", borderTop: "1px solid #d8d6cf", borderBottom: "1px solid #d8d6cf" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6e68" }}>
          Broj narudžbe
        </div>
        <div className="mp-oid">#{orderNumber}</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>Ukupno: {fmtKM(total)}</div>
      </div>
      <p className="mp-copy" style={{ marginTop: 16, fontSize: 13 }}>
        Sačuvaj broj narudžbe.
      </p>
    </div>
  );
}
