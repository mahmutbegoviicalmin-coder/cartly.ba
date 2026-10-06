"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import SmartImage from "./SmartImage";
import OrderForm, { trackCheckout } from "./OrderForm";
import { INK, SOFT, LINE, F, PRODUCT, UNIT_PRICE, OLD_PRICE, IMG, fmt } from "./theme";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OrderPopup({ open, onClose }: Props) {
  // Lock page scroll + fire InitiateCheckout (once per page) when the sheet opens.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    trackCheckout();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="mk-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <motion.div
            className="mk-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Narudžba"
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: F }}
          >
            <div className="mk-grabber" />

            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 22px 16px", borderBottom: `1px solid ${LINE}` }}>
              <div style={{ width: 56, flexShrink: 0 }}>
                <SmartImage src={IMG.hero} alt={PRODUCT} label="" radius={14} fit="contain" minimal />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: INK, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                  {PRODUCT}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>{fmt(UNIT_PRICE)}</span>
                  <span style={{ fontSize: 13, color: SOFT, textDecoration: "line-through" }}>{fmt(OLD_PRICE)}</span>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Zatvori" className="mk-close">
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            <div className="mk-sheet-body">
              <OrderForm onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
