"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const COMBOS: { name: string; cityGen: string }[] = [
  { name: "Adnan",   cityGen: "Sarajeva"   },
  { name: "Emir",    cityGen: "Tuzle"      },
  { name: "Damir",   cityGen: "Zenice"     },
  { name: "Tarik",   cityGen: "Mostara"    },
  { name: "Nermin",  cityGen: "Banja Luke" },
  { name: "Mirza",   cityGen: "Visokog"    },
  { name: "Sanel",   cityGen: "Cazina"     },
  { name: "Kenan",   cityGen: "Travnika"   },
  { name: "Alen",    cityGen: "Goražda"    },
  { name: "Nedim",   cityGen: "Lukavca"    },
  { name: "Haris",   cityGen: "Brčkog"     },
  { name: "Dino",    cityGen: "Sarajeva"   },
  { name: "Jasmin",  cityGen: "Zenice"     },
  { name: "Aldin",   cityGen: "Tuzle"      },
  { name: "Senad",   cityGen: "Doboja"     },
  { name: "Eldin",   cityGen: "Bijeljine"  },
  { name: "Faruk",   cityGen: "Mostara"    },
  { name: "Samir",   cityGen: "Živinica"   },
  { name: "Nedad",   cityGen: "Sarajeva"   },
  { name: "Muhamed", cityGen: "Bugojna"    },
];

/* Only simple, natural-sounding messages · no "Nova narudžba" prefix */
const TEMPLATES = [
  (n: string, c: string) => `${n} iz ${c} je upravo naručio`,
  (n: string, c: string) => `${n} iz ${c} je upravo naručio 1+1 GRATIS`,
  (n: string, c: string) => `${n} iz ${c} je dodao u korpu`,
  (n: string, c: string) => `${n} iz ${c} je upravo poručio`,
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randBetween(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function timeAgo() {
  const m = randBetween(1, 9);
  if (m === 1) return "prije 1 minutu";
  if (m < 5)   return `prije ${m} minute`;
  return `prije ${m} minuta`;
}

export default function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [ago,     setAgo]     = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    const combo = rand(COMBOS);
    setMsg(rand(TEMPLATES)(combo.name, combo.cityGen));
    setAgo(timeAgo());
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(show, randBetween(14000, 30000));
    }, 4800);
  }

  useEffect(() => {
    timerRef.current = setTimeout(show, randBetween(5000, 11000));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes spt-in  { from{opacity:0;transform:translateX(-110%) scale(0.94)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes spt-out { from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(-110%) scale(0.94)} }
        .spt-box { animation: spt-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {visible && (
        <div className="spt-box" style={{
          position:     "fixed",
          bottom:       "clamp(80px,11vw,92px)",
          left:         "clamp(12px,3vw,20px)",
          zIndex:       9998,
          background:   "#FFFFFF",
          borderRadius: 14,
          border:       "1px solid rgba(0,0,0,0.09)",
          boxShadow:    "0 8px 28px rgba(0,0,0,0.12)",
          padding:      "10px 13px",
          display:      "flex",
          alignItems:   "center",
          gap:          10,
          maxWidth:     "min(310px, calc(100vw - 24px))",
        }}>
          {/* product thumbnail */}
          <div style={{
            width: 44, height: 44, borderRadius: 10, overflow: "hidden",
            flexShrink: 0, position: "relative",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#F5F5F3",
          }}>
            <Image
              src="/celicnacetka.jpeg"
              alt="Čelična četka"
              fill
              style={{ objectFit: "cover" }}
              sizes="44px"
            />
          </div>

          {/* text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 700, color: "#0A0A0A",
              lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {msg}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#AAAAAA", fontWeight: 500 }}>
              Čelična Četka · {ago}
            </p>
          </div>

          {/* close */}
          <button
            onClick={() => { setVisible(false); if (timerRef.current) clearTimeout(timerRef.current); }}
            aria-label="Zatvori"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 4, color: "#CCCCCC", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
