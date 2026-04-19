"use client";

import { useState, useEffect } from "react";
import { Footprints } from "lucide-react";

const notifications = [
  { name: "Emir", city: "Brčko" },
  { name: "Mirza", city: "Sarajeva" },
  { name: "Nedim", city: "Tuzle" },
  { name: "Amar", city: "Mostara" },
  { name: "Damir", city: "Zenice" },
  { name: "Kenan", city: "Banje Luke" },
  { name: "Jasmin", city: "Bihaća" },
  { name: "Haris", city: "Travnika" },
  { name: "Sanel", city: "Goražda" },
  { name: "Tarik", city: "Konjica" },
];

export default function SocialProof() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const initial = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hide = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(hide);
  }, [visible, index]);

  useEffect(() => {
    if (visible) return;
    const next = setTimeout(() => {
      setIndex((i) => (i + 1) % notifications.length);
      setVisible(true);
    }, 2000);
    return () => clearTimeout(next);
  }, [visible]);

  const { name, city } = notifications[index];

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        bottom: "24px",
        left: "16px",
        zIndex: 50,
        transform: visible ? "translateX(0)" : "translateX(-110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.35s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          width: "280px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          borderLeft: "4px solid #FF6B00",
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* Top row: icon + label */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Footprints size={14} strokeWidth={1.8} color="#FF6B00" />
          <span
            style={{
              fontSize: "11px",
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            upravo naručio
          </span>
        </div>

        {/* Name + city */}
        <p
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#0A0A0A",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {name} iz {city}
        </p>

        {/* Product name */}
        <p
          style={{
            fontSize: "12px",
            color: "#888",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Radne Patike S3 — Tactical Black
        </p>

        {/* Bottom right timestamp */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2px" }}>
          <span style={{ fontSize: "11px", color: "#bbb" }}>upravo sada</span>
        </div>
      </div>
    </div>
  );
}
