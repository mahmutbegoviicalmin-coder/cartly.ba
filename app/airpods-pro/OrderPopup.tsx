"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderForm from "./OrderForm";
import { INK, MUTED, BG, F } from "./theme";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OrderPopup({ open, onClose }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <style suppressHydrationWarning>{`
            .ap-overlay {
              position: fixed; inset: 0; z-index: 9999;
              background: rgba(44,34,24,0.42);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              display: flex; align-items: flex-end; justify-content: center;
            }
            @media (min-width: 641px) {
              .ap-overlay { align-items: center; }
            }
            .ap-modal {
              position: relative;
              width: 100%;
              max-width: 100%;
              max-height: 92dvh;
              background: #fff;
              border-radius: 28px 28px 0 0;
              display: flex; flex-direction: column;
              box-shadow: 0 -12px 60px rgba(0,0,0,0.18);
              overflow: hidden;
            }
            @media (min-width: 641px) {
              .ap-modal {
                max-width: 480px;
                border-radius: 28px;
                max-height: 90vh;
                box-shadow: 0 32px 80px rgba(0,0,0,0.22);
              }
            }
            .ap-modal-body {
              overflow-y: auto;
              overscroll-behavior: contain;
              -webkit-overflow-scrolling: touch;
              flex: 1;
              padding: 8px 22px 28px;
            }
            .ap-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            @media (max-width: 420px) {
              .ap-form-grid { grid-template-columns: 1fr; }
            }
            @keyframes ap-spin { to { transform: rotate(360deg); } }
            .ap-spin { animation: ap-spin 0.85s linear infinite; }
          `}</style>

          <motion.div
            className="ap-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            <motion.div
              className="ap-modal"
              initial={{ y: 56, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 56, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.12)" }} />
              </div>

              <div style={{
                padding: "10px 22px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src="/airpods-pro/hero.png"
                    alt=""
                    style={{ width: 48, height: 48, borderRadius: 14, objectFit: "contain", background: BG }}
                  />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, fontFamily: F, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Plaćanje pouzećem
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 400, color: INK, fontFamily: F, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                      AirPods Pro
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Zatvori"
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: BG, border: "none", color: INK,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="ap-modal-body">
                <OrderForm compact />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
