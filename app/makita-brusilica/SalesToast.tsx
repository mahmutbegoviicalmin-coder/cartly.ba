"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, X } from "lucide-react";
import { INK, MUTED, TEAL, F } from "./theme";

const NAMES = [
  "Adnan", "Emir", "Damir", "Tarik", "Mirza", "Nermin", "Sanel", "Kenan", "Haris", "Edin",
  "Armin", "Senad", "Elvir", "Jasmin", "Almir", "Dženan", "Muhamed", "Amar", "Faruk", "Benjamin",
  "Nedim", "Samir", "Alen", "Admir", "Ismet", "Hamza", "Eldin", "Nihad", "Mehmed", "Kemal",
];
const INITIALS = ["H.", "K.", "M.", "B.", "S.", "Č.", "Đ.", "O.", "Š.", "A.", "D.", "Z."];
const CITIES = [
  "Sarajevo", "Tuzla", "Zenica", "Mostar", "Bihać", "Travnik", "Cazin", "Visoko", "Kakanj",
  "Goražde", "Konjic", "Gračanica", "Živinice", "Lukavac", "Bugojno", "Velika Kladuša",
  "Srebrenik", "Tešanj", "Maglaj", "Zavidovići", "Gradačac", "Sanski Most", "Ilidža", "Brčko",
];
const MINUTES = [1, 2, 3, 4, 6, 8, 11, 14, 17];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

type Note = { name: string; city: string; min: number; gift: boolean };

export default function SalesToast() {
  const [note,      setNote]      = useState<Note | null>(null);
  const [visible,   setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dismissed) return;
    const show = () => {
      setNote({ name: `${pick(NAMES)} ${pick(INITIALS)}`, city: pick(CITIES), min: pick(MINUTES), gift: Math.random() < 0.45 });
      setVisible(true);
      timer.current = setTimeout(() => {
        setVisible(false);
        timer.current = setTimeout(show, 14000 + Math.random() * 12000);
      }, 4800);
    };
    timer.current = setTimeout(show, 7000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [dismissed]);

  if (dismissed || !note) return null;

  return (
    <div className="mk-toast" data-on={visible ? "1" : undefined} style={{ fontFamily: F }} role="status" aria-live="polite">
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: "rgba(0,131,143,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center", color: TEAL,
      }}>
        <BadgeCheck size={20} strokeWidth={1.9} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
          {note.name} · {note.city}
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.35 }}>
          naručio Makita brusilicu{note.gift ? " + poklon" : ""} · prije {note.min} min
        </div>
      </div>
      <button
        type="button"
        onClick={() => { if (timer.current) clearTimeout(timer.current); setDismissed(true); }}
        aria-label="Zatvori"
        style={{ background: "none", border: "none", color: "#C7C7CC", cursor: "pointer", padding: 4, display: "flex" }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
