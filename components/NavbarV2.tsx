"use client";

export default function NavbarV2({ onOrder }: { onOrder: () => void }) {
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "#111111",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}>
            Cartly<span style={{ color: "#F97316" }}>.ba</span>
          </span>
        </a>

        {/* Trust + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 500,
          }} className="hidden sm:inline">
            Plaćanje pouzećem · Dostava po BiH
          </span>
          <button
            onClick={onOrder}
            style={{
              background: "#F97316",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "9px 20px",
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            Naruči
          </button>
        </div>
      </div>
    </header>
  );
}
