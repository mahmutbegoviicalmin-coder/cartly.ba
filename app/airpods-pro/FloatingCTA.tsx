"use client";

import React, { useEffect, useState } from "react";
import { event } from "@/lib/fbpixel";
import { INK, MUTED, BG, WHITE, LINE, F } from "./theme";

interface Props {
  onOrder: () => void;
}

export default function FloatingCTA({ onOrder }: Props) {
  const [visible, setVisible] = useState(false);
  const [hideByForm, setHideByForm] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const section = document.getElementById("naruci");
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHideByForm(entry.isIntersecting),
      { threshold: 0.18 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const show = visible && !hideByForm;

  function handleClick() {
    event("AddToCart", {
      content_name:     "AirPods Pro",
      content_category: "Audio",
      content_ids:      ["airpods-pro"],
      content_type:     "product",
      value:            49.9,
      currency:         "BAM",
    });
    onOrder();
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        .ap-fab {
          position: fixed;
          right: 20px;
          bottom: calc(20px + env(safe-area-inset-bottom));
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 12px;
          background: ${WHITE};
          color: ${INK};
          border: 1px solid ${LINE};
          border-radius: 980px;
          padding: 8px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
          cursor: pointer;
          font-family: ${F};
          transition: transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.38s ease;
        }
        .ap-fab:hover { transform: translateY(-2px); }
        .ap-fab:active { transform: scale(0.98); }
        .ap-fab-copy { display: flex; flex-direction: column; padding-right: 4px; min-width: 0; }
        .ap-fab-btn {
          background: ${INK};
          color: ${WHITE};
          border: none;
          border-radius: 980px;
          padding: 11px 18px;
          font-size: 14px;
          font-weight: 500;
          font-family: ${F};
          white-space: nowrap;
          pointer-events: none;
        }
        @media (max-width: 520px) {
          .ap-fab { right: 14px; padding: 7px; }
          .ap-fab-copy { display: none; }
          .ap-fab-thumb { width: 40px !important; height: 40px !important; }
          .ap-fab-btn { padding: 10px 14px; font-size: 13px; }
        }
      `}</style>

      <button
        type="button"
        className="ap-fab"
        onClick={handleClick}
        aria-label="Naruči AirPods Pro"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(24px)",
          pointerEvents: show ? "auto" : "none",
        }}
      >
        <img
          className="ap-fab-thumb"
          src="/airpods-pro/hero.png"
          alt=""
          style={{
            width: 48, height: 48, borderRadius: 14, objectFit: "contain",
            background: BG, flexShrink: 0,
          }}
        />
        <div className="ap-fab-copy">
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            AirPods Pro
          </span>
          <span style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
            49,90 KM
          </span>
        </div>
        <span className="ap-fab-btn">Naruči</span>
      </button>
    </>
  );
}
