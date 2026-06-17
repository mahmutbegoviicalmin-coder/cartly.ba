"use client";

import { useState, useEffect } from "react";

export default function FloatingOrderBtn({ onOrder }: { onOrder: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes fab-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fab-visible { animation: fab-in 0.3s ease both; }
        .fab-hidden { opacity:0; pointer-events:none; transform:translateY(12px); transition: opacity 0.2s, transform 0.2s; }
        .fab-btn { transition: background 150ms, transform 150ms; }
        .fab-btn:hover { background: #ea6c0f !important; transform: scale(1.04); }
        .fab-btn:active { transform: scale(0.96); }
      `}</style>

      <div
        className={visible ? "fab-visible" : "fab-hidden"}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 998,
        }}
      >
        <button
          onClick={onOrder}
          className="fab-btn"
          style={{
            background: "#F97316",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: "14px 22px",
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(249,115,22,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          aria-label="Naruči"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Naruči · 59,90 KM
        </button>
      </div>
    </>
  );
}
