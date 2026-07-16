"use client";

export default function FinalCTAV2({ onOrder }: { onOrder: () => void }) {
  return (
    <section style={{ background: "#111111", padding: "96px 24px" }}>
      <div style={{
        maxWidth: 640,
        margin: "0 auto",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "#F97316",
          fontFamily: "var(--font-manrope), sans-serif",
          margin: 0,
        }}>
          Tactical S3 · 59,90 KM
        </p>

        <h2 style={{
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          color: "#ffffff",
          lineHeight: 1.1,
          fontFamily: "var(--font-manrope), sans-serif",
          margin: 0,
        }}>
          Spreman za sigurniji<br />i udobniji rad?
        </h2>

        <p style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.45)",
          fontFamily: "var(--font-manrope), sans-serif",
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 420,
        }}>
          Naruči danas, dostava za 1–3 radna dana. Plaćanje pouzećem — bez rizika.
        </p>

        <button
          onClick={onOrder}
          style={{
            background: "#F97316",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "18px 40px",
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 800,
            fontSize: 17,
            cursor: "pointer",
            letterSpacing: "0.01em",
            transition: "background 180ms, transform 150ms",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#ea6c0f";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#F97316";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          Naruči odmah
        </button>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {["Plaćanje pouzećem", "Povrat 14 dana", "Dostava 10 KM"].map((t) => (
            <span key={t} style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 500,
            }}>
              ✓ {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
