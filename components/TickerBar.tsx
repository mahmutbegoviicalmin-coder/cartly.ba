"use client";

// Ticker content — rendered inline for seamless loop

export default function TickerBar() {
  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 55s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        aria-label="Promotivna akcija"
        style={{
          background:  "#0A0A0A",
          overflow:    "hidden",
          borderBottom:"1px solid rgba(255,107,0,0.2)",
          position:    "relative",
          zIndex:      49,
        }}
      >
        {/* Left + right fade masks */}
        <div aria-hidden="true" style={{
          position:       "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background:     "linear-gradient(90deg, #0A0A0A 0%, transparent 8%, transparent 92%, #0A0A0A 100%)",
        }} />

        <div className="ticker-track" style={{ padding: "11px 0" }}>
          {/* Two identical halves for a seamless loop */}
          {[0, 1].map((half) => (
            <span key={half} style={{
              fontFamily:    "var(--font-manrope), sans-serif",
              fontSize:      12,
              fontWeight:    700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color:         "#FFFFFF",
              whiteSpace:    "nowrap",
              paddingRight:  80,
            }}>
              {Array(8).fill(null).map((_, i) => (
                <span key={i}>
                  <span style={{ color: "#FF6B00" }}>PROMOTIVNA AKCIJA!</span>
                  <span style={{ color: "rgba(255,255,255,0.35)", margin: "0 16px" }}>◆</span>
                  <span style={{ color: "#fff" }}>ZA NARUDŽBE IZNAD 100 KM — </span>
                  <span style={{ color: "#FF6B00" }}>BESPLATNA PRIORITETNA DOSTAVA!</span>
                  <span style={{ color: "rgba(255,255,255,0.35)", margin: "0 16px" }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
