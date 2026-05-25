"use client";

import { useState, useEffect, useRef } from "react";

const notifications = [
  { name: "Mirza",  city: "Sarajeva"    },
  { name: "Edin",   city: "Tuzle"       },
  { name: "Tarik",  city: "Banje Luke"  },
  { name: "Adnan",  city: "Bihaća"      },
  { name: "Haris",  city: "Konjica"     },
  { name: "Kenan",  city: "Mostara"     },
  { name: "Damir",  city: "Zenice"      },
  { name: "Nedim",  city: "Tuzle"       },
  { name: "Jasmin", city: "Banje Luke"  },
  { name: "Senad",  city: "Bihaća"      },
  { name: "Amar",   city: "Travnika"    },
  { name: "Eldin",  city: "Sarajeva"    },
  { name: "Faruk",  city: "Goražda"     },
  { name: "Mahir",  city: "Brčkog"      },
  { name: "Denis",  city: "Lukavca"     },
  { name: "Amer",   city: "Zenice"      },
  { name: "Aldin",  city: "Cazina"      },
  { name: "Dino",   city: "Mostara"     },
  { name: "Anes",   city: "Živinica"    },
  { name: "Sanel",  city: "Doboja"      },
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
      setTimeout(() => setVisible(false), 380);
    }, 4500);

    cycleTimer.current = setTimeout(show, 28000);
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
    setTimeout(() => setVisible(false), 380);
  };

  if (!visible) return null;

  const p = notifications[current];

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes spIn {
          from { transform: translateY(16px) scale(0.96); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        @keyframes spOut {
          from { transform: translateY(0)    scale(1);    opacity: 1; }
          to   { transform: translateY(12px) scale(0.95); opacity: 0; }
        }
        @keyframes spProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .sp-toast {
          animation: ${leaving ? "spOut 0.38s ease forwards" : "spIn 0.38s cubic-bezier(0.22,1,0.36,1) forwards"};
        }
        @media (max-width: 640px) {
          .sp-root {
            bottom: calc(130px + env(safe-area-inset-bottom)) !important;
            left: 12px !important;
            right: 12px !important;
          }
        }
      `}</style>

      <div
        className="sp-root"
        style={{
          position: "fixed",
          bottom: 96,
          left: 20,
          zIndex: 9997,
          fontFamily: "var(--font-manrope), sans-serif",
          maxWidth: 300,
        }}
      >
        <div
          className="sp-toast"
          style={{
            background: "rgba(12,12,12,0.90)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.09)",
            padding: "10px 14px 10px 10px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.16)",
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #FF6B00, #E85E00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
          }}>
            {p.name[0]}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 12, fontWeight: 700,
              color: "#fff", lineHeight: 1.3,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              <span style={{ color: "#FF7A30" }}>{p.name}</span>
              {" "}iz {p.city} naručio
            </p>
            <p style={{
              margin: "2px 0 0", fontSize: 11,
              color: "rgba(255,255,255,0.45)", lineHeight: 1.2,
            }}>
              Radne Patike S3 · prije par minuta
            </p>
          </div>

          {/* Close */}
          <button
            onClick={dismiss}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.30)", cursor: "pointer",
              fontSize: 16, lineHeight: 1, padding: "0 0 0 4px", flexShrink: 0,
            }}
            aria-label="Zatvori"
          >
            ×
          </button>

          {/* Progress bar */}
          {!leaving && (
            <div style={{
              position: "absolute", bottom: 0, left: 0,
              height: 2,
              background: "linear-gradient(90deg, #FF6B00, #FF9A3C)",
              borderRadius: "0 0 14px 14px",
              animation: "spProgress 4.5s linear forwards",
            }} />
          )}
        </div>
      </div>
    </>
  );
}
