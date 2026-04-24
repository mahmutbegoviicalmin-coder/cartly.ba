"use client";

import { useEffect } from "react";

const sizes = [
  { cm: "24,5 cm", eu: "EU 39" },
  { cm: "25,0 cm", eu: "EU 40" },
  { cm: "25,5 cm", eu: "EU 41" },
  { cm: "26,0 cm", eu: "EU 42" },
  { cm: "26,5 cm", eu: "EU 43" },
  { cm: "27,0 cm", eu: "EU 44" },
  { cm: "27,5 cm", eu: "EU 45" },
  { cm: "28,0 cm", eu: "EU 46" },
  { cm: "28,5 cm", eu: "EU 47" },
  { cm: "29,0 cm", eu: "EU 48" },
];

const steps = [
  "Stanite uz zid. Peta mora biti uz zid, stopalo ravno na podu.",
  "Označite najduži prst. Stavite oznaku na kraju najdužeg prsta.",
  "Izmjerite rastojanje od zida do oznake u centimetrima.",
];

interface Props {
  onClose: () => void;
}

export default function SizeGuideModal({ onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Pronađi svoju veličinu"
    >
      {/* Backdrop */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        style={{
          position: "relative", zIndex: 10,
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 420,
          maxHeight: "90vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: 32,
          boxSizing: "border-box",
        }}
      >

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <h2 style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontSize: 20, fontWeight: 700, color: "#0A0A0A", margin: 0,
          }}>
            Pronađi svoju veličinu
          </h2>
          <button
            onClick={onClose}
            aria-label="Zatvori"
            style={{
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", cursor: "pointer",
              color: "#999", padding: 0, flexShrink: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0A0A0A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* How to measure */}
        <p style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 12, fontWeight: 600, color: "#888",
          textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 14,
        }}>
          Kako izmjeriti
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {steps.map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{
                flexShrink: 0,
                width: 32, height: 32,
                borderRadius: "50%",
                background: "#FF6B00",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13, fontWeight: 700,
              }}>
                {i + 1}
              </span>
              <p style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14, fontWeight: 400, color: "#555555",
                margin: 0, lineHeight: 1.55, paddingTop: 6,
              }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Size table */}
        <div>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            paddingBottom: 8,
            borderBottom: "1px solid #E5E5E5",
            marginBottom: 2,
          }}>
            <span style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 12, fontWeight: 600, color: "#888",
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>
              Dužina stopala
            </span>
            <span style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 12, fontWeight: 600, color: "#888",
              textTransform: "uppercase", letterSpacing: "0.07em",
              textAlign: "right",
            }}>
              EU veličina
            </span>
          </div>

          {/* Rows */}
          {sizes.map((row, i) => (
            <div
              key={row.eu}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                padding: "10px 0",
                borderBottom: i < sizes.length - 1 ? "1px solid #F5F5F5" : "none",
              }}
            >
              <span style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14, fontWeight: 400, color: "#0A0A0A",
              }}>
                {row.cm}
              </span>
              <span style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 14, fontWeight: 400, color: "#0A0A0A",
                textAlign: "right",
              }}>
                {row.eu}
              </span>
            </div>
          ))}
        </div>

        {/* Note */}
        <p style={{
          fontFamily: "var(--font-manrope), sans-serif",
          fontSize: 12, color: "#999", fontStyle: "italic",
          margin: "16px 0 0", lineHeight: 1.5,
        }}>
          Ako ste između dvije veličine, uzmite veću.
        </p>

      </div>
    </div>
  );
}
