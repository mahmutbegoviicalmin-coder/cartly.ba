"use client";

import { useState, useEffect, useRef } from "react";

const notifications = [
  { name: "Mirza",   city: "Sarajeva",  gender: "m" },
  { name: "Amra",    city: "Mostara",   gender: "f" },
  { name: "Edin",    city: "Tuzle",     gender: "m" },
  { name: "Lejla",   city: "Zenice",    gender: "f" },
  { name: "Tarik",   city: "Banje Luke",gender: "m" },
  { name: "Selma",   city: "Bihaća",    gender: "f" },
  { name: "Adnan",   city: "Travnika",  gender: "m" },
  { name: "Amina",   city: "Goražda",   gender: "f" },
  { name: "Haris",   city: "Konjica",   gender: "m" },
  { name: "Dženana", city: "Brčkog",    gender: "f" },
  { name: "Kenan",   city: "Mostara",   gender: "m" },
  { name: "Sanela",  city: "Sarajeva",  gender: "f" },
  { name: "Damir",   city: "Tuzle",     gender: "m" },
  { name: "Emina",   city: "Zenice",    gender: "f" },
  { name: "Nedim",   city: "Tuzle",     gender: "m" },
  { name: "Azra",    city: "Sarajeva",  gender: "f" },
  { name: "Jasmin",  city: "Banje Luke",gender: "m" },
  { name: "Merima",  city: "Travnika",  gender: "f" },
  { name: "Senad",   city: "Bihaća",    gender: "m" },
  { name: "Lamija",  city: "Konjica",   gender: "f" },
] as const;

export default function SocialProof() {
  const [visible, setVisible]  = useState(false);
  const [leaving, setLeaving]  = useState(false);
  const [current, setCurrent]  = useState(0);
  const lastIdx = useRef(-1);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickNext = () => {
    let idx: number;
    do { idx = Math.floor(Math.random() * notifications.length); }
    while (idx === lastIdx.current);
    lastIdx.current = idx;
    return idx;
  };

  const show = () => {
    const idx = pickNext();
    setCurrent(idx);
    setLeaving(false);
    setVisible(true);

    hideTimer.current = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => setVisible(false), 420);
    }, 4000);

    cycleTimer.current = setTimeout(show, 30000);
  };

  useEffect(() => {
    cycleTimer.current = setTimeout(show, 8000);
    return () => {
      if (hideTimer.current)  clearTimeout(hideTimer.current);
      if (cycleTimer.current) clearTimeout(cycleTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setLeaving(true);
    setTimeout(() => setVisible(false), 420);
  };

  if (!visible) return null;

  const p = notifications[current];
  const action = p.gender === "f"
    ? "upravo naručila Radne Patike S3"
    : "upravo naručio Radne Patike S3";

  return (
    <>
      <style>{`
        @keyframes spSlideIn {
          from { transform: translateX(-120%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes spSlideOut {
          from { transform: translateX(0);     opacity: 1; }
          to   { transform: translateX(-120%); opacity: 0; }
        }
        @keyframes spShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @media (max-width: 640px) {
          .sp-wrap {
            bottom: 80px !important;
            left: 12px !important;
            right: 12px !important;
          }
          .sp-wrap > div {
            min-width: unset !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

      <div
        className="sp-wrap"
        style={{
          position: "fixed",
          bottom: 90,
          left: 24,
          zIndex: 9999,
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 14,
            padding: "14px 18px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            minWidth: 280,
            maxWidth: 320,
            position: "relative",
            overflow: "hidden",
            animation: leaving
              ? "spSlideOut 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              : "spSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff",
          }}>
            {p.name[0]}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1d1d1f", lineHeight: 1.3 }}>
              {p.name} iz {p.city}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6e6e73", fontWeight: 400, lineHeight: 1.3 }}>
              {action}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#aeaeb2", fontWeight: 500 }}>
              Prije nekoliko minuta
            </p>
          </div>

          {/* Close */}
          <button
            onClick={dismiss}
            style={{
              position: "absolute", top: 8, right: 10,
              background: "none", border: "none",
              fontSize: 14, color: "#aeaeb2", cursor: "pointer", lineHeight: 1,
              padding: 0,
            }}
            aria-label="Zatvori"
          >
            ×
          </button>

          {/* Progress bar */}
          {!leaving && (
            <div style={{
              position: "absolute", bottom: 0, left: 0,
              height: 2, background: "#f97316",
              borderRadius: "0 0 14px 14px",
              animation: "spShrink 4s linear forwards",
            }} />
          )}
        </div>
      </div>
    </>
  );
}
