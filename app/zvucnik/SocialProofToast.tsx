"use client";

import { useState, useEffect, useRef } from "react";

const POOL = [
  { ime: "Amar K.",    grad: "Sarajeva"    },
  { ime: "Emina H.",   grad: "Tuzle"       },
  { ime: "Davor M.",   grad: "Mostara"     },
  { ime: "Selma B.",   grad: "Zenice"      },
  { ime: "Tarik O.",   grad: "Banja Luke"  },
  { ime: "Amra N.",    grad: "Bihaća"      },
  { ime: "Nermin Š.",  grad: "Travnika"    },
  { ime: "Lejla K.",   grad: "Brčkog"      },
  { ime: "Mirza F.",   grad: "Goražda"     },
  { ime: "Adna P.",    grad: "Živinica"    },
  { ime: "Sanel J.",   grad: "Kaknja"      },
  { ime: "Haris Č.",   grad: "Konjica"     },
];

const MINUTES = [2, 3, 5, 7, 8, 10, 12, 15];

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
        bottom: 96,
        left:   20,
        transform: visible ? "translateX(0)" : "translateX(calc(-100% - 32px))",
        opacity:   visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-white shadow-xl border border-gray-200"
        style={{ minWidth: 270 }}
      >
        {/* Shopping bag icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-50">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-xs font-semibold leading-tight">
            {person.ime} iz {person.grad} upravo naručio
          </p>
          <p className="text-gray-400 text-[11px] mt-0.5">
            Bluetooth Zvučnik ZQS-6239 · Prije {minute} min
          </p>
        </div>

        {/* Close */}
        <button
          onClick={() => { clear(); setDismissed(true); }}
          className="w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 text-base leading-none"
          aria-label="Zatvori"
        >
          ×
        </button>
      </div>
    </div>
  );
}
