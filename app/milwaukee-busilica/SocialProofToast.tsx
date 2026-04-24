"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const NOTIFICATIONS = [
  { ime: "Emir",    grad: "Tuzle",     rod: "m" },
  { ime: "Alen",    grad: "Sarajeva",  rod: "m" },
  { ime: "Damir",   grad: "Mostara",   rod: "m" },
  { ime: "Selma",   grad: "Zenice",    rod: "f" },
  { ime: "Tarik",   grad: "Banja Luke",rod: "m" },
  { ime: "Amra",    grad: "Bihaća",    rod: "f" },
  { ime: "Nermin",  grad: "Travnika",  rod: "m" },
  { ime: "Jasmina", grad: "Brčkog",    rod: "f" },
  { ime: "Haris",   grad: "Goražda",   rod: "m" },
  { ime: "Lejla",   grad: "Živinica",  rod: "f" },
  { ime: "Mirza",   grad: "Kaknja",    rod: "m" },
  { ime: "Adna",    grad: "Konjica",   rod: "f" },
  { ime: "Sanel",   grad: "Gradačca",  rod: "m" },
];

export default function SocialProofToast() {
  const [index, setIndex]       = useState(0);
  const [visible, setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear helper
  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  // Show → wait 4s → hide → wait 30s → show next → loop
  function scheduleNext(nextIndex: number) {
    // Show
    setIndex(nextIndex);
    setVisible(true);

    // Hide after 4s
    timerRef.current = setTimeout(() => {
      setVisible(false);

      // Next notification after 30s
      timerRef.current = setTimeout(() => {
        scheduleNext((nextIndex + 1) % NOTIFICATIONS.length);
      }, 30_000);
    }, 4_000);
  }

  useEffect(() => {
    if (dismissed) return;

    // Initial delay: 5s before first appearance
    timerRef.current = setTimeout(() => {
      scheduleNext(0);
    }, 5_000);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed]);

  if (dismissed) return null;

  const notif = NOTIFICATIONS[index];
  const verb  = notif.rod === "f" ? "naručila" : "naručio";

  return (
    <div
      className="fixed z-[9998] transition-all duration-500 ease-out"
      style={{
        bottom: "96px",
        left: "20px",
        transform: visible ? "translateX(0)" : "translateX(calc(-100% - 32px))",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-lg flex items-center gap-3 px-3 py-3"
        style={{ border: "1px solid #F0EDE8", minWidth: 264, maxWidth: 300 }}
      >
        {/* Product image */}
        <div
          className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
          style={{ background: "#F2F0EB" }}
        >
          <Image
            src="/images/milw2.webp"
            alt="Milwaukee M18"
            width={40}
            height={40}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-[#1a1a1a] leading-tight">
            {notif.ime} iz {notif.grad} je upravo {verb}
          </p>
          <p className="text-[11px] text-[#888] mt-0.5">
            Milwaukee M18 Bušilica
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => { clearTimer(); setDismissed(true); }}
          className="w-5 h-5 flex items-center justify-center rounded-full text-[#bbb] hover:text-[#666] transition-colors flex-shrink-0 text-base leading-none"
          aria-label="Zatvori"
        >
          ×
        </button>
      </div>
    </div>
  );
}
