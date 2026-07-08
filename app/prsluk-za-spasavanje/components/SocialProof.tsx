"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, BadgeCheck } from "lucide-react";

const NOTIFICATIONS = [
  { name: "Amina", city: "Konjica" },
  { name: "Nermin", city: "Tuzle" },
  { name: "Selma", city: "Mostara" },
  { name: "Haris", city: "Sarajeva" },
  { name: "Emina", city: "Zenice" },
  { name: "Tarik", city: "Bihaća" },
  { name: "Lejla", city: "Konjica" },
  { name: "Adnan", city: "Banje Luke" },
  { name: "Amela", city: "Tuzle" },
  { name: "Kenan", city: "Travnika" },
  { name: "Dženita", city: "Goražda" },
  { name: "Faruk", city: "Livna" },
  { name: "Merima", city: "Neuma" },
  { name: "Ismar", city: "Jablanice" },
  { name: "Belma", city: "Konjica" },
  { name: "Damir", city: "Zavidovića" },
  { name: "Ajla", city: "Bijeljine" },
  { name: "Senad", city: "Fojnice" },
  { name: "Indira", city: "Trebinja" },
  { name: "Elvir", city: "Čapljine" },
] as const;

export default function SocialProof() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [current, setCurrent] = useState(0);
  const lastIdx = useRef(-1);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickNext = () => {
    let idx: number;
    do { idx = Math.floor(Math.random() * NOTIFICATIONS.length); }
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
      setTimeout(() => setVisible(false), 380);
    }, 4500);

    cycleTimer.current = setTimeout(show, 27000);
  };

  useEffect(() => {
    cycleTimer.current = setTimeout(show, 7000);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (cycleTimer.current) clearTimeout(cycleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setLeaving(true);
    setTimeout(() => setVisible(false), 380);
  };

  const p = NOTIFICATIONS[current];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 20, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 16, scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-24 left-3 z-[140] max-w-[300px] sm:bottom-24 sm:left-5"
        >
          <div className="relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-black/5 bg-[#061B38] py-2.5 pl-2.5 pr-3.5 shadow-[0_8px_32px_rgba(6,27,56,0.35)]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFC107] text-[14px] font-extrabold text-[#061B38]">
              {p.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold leading-tight text-white">
                <span className="text-[#FFC107]">{p.name}</span> iz {p.city} naručio/la
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] leading-tight text-white/45">
                <BadgeCheck className="h-3 w-3 shrink-0" /> Sigurnosni prsluk · prije par minuta
              </p>
            </div>
            <button
              onClick={dismiss}
              className="shrink-0 text-white/30 transition-colors hover:text-white/60"
              aria-label="Zatvori"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {!leaving && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4.5, ease: "linear" }}
                className="absolute bottom-0 left-0 h-[2px] bg-[#FFC107]"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
