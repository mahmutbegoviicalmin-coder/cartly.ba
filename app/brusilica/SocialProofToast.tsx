"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingBag, X } from "lucide-react";

const POOL = [
  { ime: "Adnan K.",  grad: "Sarajeva"   },
  { ime: "Emir H.",   grad: "Tuzle"      },
  { ime: "Damir M.",  grad: "Mostara"    },
  { ime: "Selma B.",  grad: "Zenice"     },
  { ime: "Tarik O.",  grad: "Banja Luke" },
  { ime: "Amra N.",   grad: "Bihaća"     },
  { ime: "Nermin Š.", grad: "Travnika"   },
  { ime: "Lejla K.",  grad: "Brčkog"     },
  { ime: "Mirza F.",  grad: "Goražda"    },
  { ime: "Sanel J.",  grad: "Kaknja"     },
];

const MINUTES = [2, 3, 5, 7, 8, 10, 12, 15];
const ACCENT  = "#FF6B00";

export default function SocialProofToast() {
  const [index,     setIndex]     = useState(0);
  const [visible,   setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minute,    setMinute]    = useState(2);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clear() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function schedule(idx: number) {
    const nextIdx = idx % POOL.length;
    setIndex(nextIdx);
    setMinute(MINUTES[Math.floor(Math.random() * MINUTES.length)]);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(() => schedule(nextIdx + 1), 30_000);
    }, 4_000);
  }

  useEffect(() => {
    if (dismissed) return;
    timerRef.current = setTimeout(() => schedule(0), 6_000);
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed]);

  if (dismissed) return null;

  const person = POOL[index];

  return (
    <div
      className="fixed z-[9998] transition-all duration-500 ease-out"
      style={{
        bottom:        96,
        left:          20,
        transform:     visible ? "translateX(0)" : "translateX(calc(-100% - 32px))",
        opacity:       visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-white shadow-xl"
        style={{
          minWidth:    270,
          borderTop:   "1px solid #e5e7eb",
          borderRight: "1px solid #e5e7eb",
          borderBottom:"1px solid #e5e7eb",
          borderLeft:  `3px solid ${ACCENT}`,
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,107,0,0.08)" }}
        >
          <ShoppingBag size={18} color={ACCENT} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-xs font-semibold leading-tight">
            Neko iz {person.grad} upravo naručio brusilicu
          </p>
          <p className="text-gray-400 text-[11px] mt-0.5">
            {person.ime} · Prije {minute} min
          </p>
        </div>

        <button
          onClick={() => { clear(); setDismissed(true); }}
          className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Zatvori"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
