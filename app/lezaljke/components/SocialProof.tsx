"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Countdown ───────────────────────────────────────────────────────────────

function getTarget(): Date {
  const key = "_lz_offer_end";
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const d = new Date(stored);
      if (d > new Date()) return d;
    }
  } catch {}
  // 24h from first visit
  const t = new Date(Date.now() + 24 * 60 * 60 * 1000);
  try { localStorage.setItem(key, t.toISOString()); } catch {}
  return t;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export function CountdownBanner({ accentHex }: { accentHex: string }) {
  const [time, setTime] = useState({ h: 23, m: 59, s: 59 });

  useEffect(() => {
    const target = getTarget();
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      background: "#0A0A0A",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      flexWrap: "wrap",
    }}>
      <span style={{
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)",
        letterSpacing: "0.04em",
      }}>
        Akcijska cijena završava za:
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[
          { val: time.h, label: "h" },
          { val: time.m, label: "min" },
          { val: time.s, label: "sek" },
        ].map((unit, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{
              background: accentHex,
              color: "#fff",
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: "-0.02em",
              borderRadius: 6,
              padding: "3px 7px",
              minWidth: 32,
              textAlign: "center",
              display: "inline-block",
              transition: "background 500ms",
            }}>
              {pad(unit.val)}
            </span>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
              {unit.label}
            </span>
            {i < 2 && (
              <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 14, marginRight: 2 }}>:</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Order notification ───────────────────────────────────────────────────────

const NAMES = [
  "Amir B.", "Zlata H.", "Dino K.", "Maja Č.", "Edin M.", "Amra F.",
  "Sanel J.", "Ivana P.", "Kenan R.", "Lejla S.", "Haris N.", "Alma O.",
  "Tarik G.", "Nermina V.", "Denis L.", "Selma T.", "Omer Š.", "Jasna B.",
];

const PLACES = [
  "Sarajevo", "Banja Luka", "Tuzla", "Mostar", "Zenica",
  "Bijeljina", "Brčko", "Travnik", "Cazin", "Livno",
  "Bihać", "Trebinje", "Doboj", "Lukavac", "Konjic",
];

type Notif = { id: number; name: string; place: string; color: string; colorHex: string };

let notifId = 0;

export function OrderNotifications() {
  const [notif, setNotif] = useState<Notif | null>(null);
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => {
    const next: Notif = {
      id: ++notifId,
      name: NAMES[Math.floor(Math.random() * NAMES.length)],
      place: PLACES[Math.floor(Math.random() * PLACES.length)],
      color: "Tamno maslinasto sivu",
      colorHex: "#4E5445",
    };
    setNotif(next);
    setVisible(true);
    setTimeout(() => setVisible(false), 4500);
  }, []);

  useEffect(() => {
    // First one after 8s, then every 30s
    const first = setTimeout(show, 8000);
    const interval = setInterval(show, 30000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, [show]);

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes lz-notif-in  { from { transform:translateY(12px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes lz-notif-out { from { transform:translateY(0);    opacity:1; } to { transform:translateY(-8px); opacity:0; } }
        .lz-notif-enter { animation: lz-notif-in  0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .lz-notif-exit  { animation: lz-notif-out 0.3s ease forwards; }
      `}</style>

      {notif && (
        <div
          key={notif.id}
          className={visible ? "lz-notif-enter" : "lz-notif-exit"}
          style={{
            position: "fixed",
            bottom: 90,
            left: 16,
            zIndex: 9997,
            background: "#fff",
            border: "1px solid #EBEBEB",
            borderRadius: 14,
            padding: "12px 14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            gap: 11,
            maxWidth: 280,
          }}
        >
          {/* Color dot */}
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: notif.colorHex,
            flexShrink: 0,
            boxShadow: `0 2px 8px ${notif.colorHex}55`,
          }} />

          <div>
            <div style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 13, fontWeight: 700, color: "#0A0A0A",
              lineHeight: 1.3, marginBottom: 2,
            }}>
              {notif.name} iz {notif.place}
            </div>
            <div style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 11, color: "#777", lineHeight: 1.3,
            }}>
              naručio/la ležaljku,{" "}
              <span style={{ fontWeight: 700, color: notif.colorHex }}>{notif.color}</span>
            </div>
            <div style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 10, color: "#BBB", marginTop: 3,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Upravo sada
            </div>
          </div>
        </div>
      )}
    </>
  );
}
