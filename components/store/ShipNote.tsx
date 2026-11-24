"use client";

import { useEffect, useState, type CSSProperties } from "react";

/**
 * Shipping days around public holidays. Post offices are closed on these days
 * (and on weekends). Add a date here for the next holiday; past dates do nothing.
 */
const HOLIDAYS: Record<string, string> = {
  "2026-11-25": "Dana državnosti BiH",
};
const DAY_NAMES = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];

const ymd = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400_000);
const weekday = (d: Date) => new Date(`${ymd(d)}T12:00:00`).getDay();
const isWorkday = (d: Date) => { const w = weekday(d); return w !== 0 && w !== 6 && !HOLIDAYS[ymd(d)]; };
const dm = (d: Date) => { const s = ymd(d); return `${Number(s.slice(8, 10))}.${Number(s.slice(5, 7))}.`; };

/** First working day after today: the day an order placed now leaves. */
export function nextShipDay(now = new Date()) {
  let d = addDays(now, 1);
  while (!isWorkday(d)) d = addDays(d, 1);
  return d;
}

/** "sutra (srijeda)" or "u četvrtak, 26.11." (already ends with a dot when dated). */
export function shipDayText(now = new Date()) {
  const d = nextShipDay(now);
  return ymd(d) === ymd(addDays(now, 1)) ? `sutra (${DAY_NAMES[weekday(d)]})` : `u ${DAY_NAMES[weekday(d)]}, ${dm(d)}`;
}

/** End a sentence without doubling the dot of "26.11.". */
export const withDot = (s: string) => (s.endsWith(".") ? s : `${s}.`);

/** A holiday today or tomorrow that delays orders placed now, if any. */
function upcomingHoliday(now = new Date()) {
  for (const n of [0, 1]) {
    const day = ymd(addDays(now, n));
    if (HOLIDAYS[day]) return { day, name: HOLIDAYS[day], today: n === 0 };
  }
  return null;
}

/**
 * Small card for the order confirmation screen. Renders nothing unless a
 * holiday today or tomorrow moves the shipping day, so it disappears by itself.
 */
export function ShipNote({ style }: { style?: CSSProperties }) {
  const [text, setText] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const h = upcomingHoliday();
    if (!h) return;
    const d = new Date(`${h.day}T12:00:00`);
    setText({
      title: `${h.today ? "Danas" : "Sutra"}, ${dm(d)}, pošte ne rade`,
      body: `Zbog ${h.name} paket šaljemo ${withDot(shipDayText())} Dostava zatim traje 1–2 radna dana.`,
    });
  }, []);

  if (!text) return null;
  return (
    <div role="note" style={{
      display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left",
      margin: "16px auto 20px", maxWidth: 360, width: "100%", boxSizing: "border-box",
      padding: "12px 14px", borderRadius: 14, background: "#FFF7E6", border: "1px solid #FBE3B0",
      color: "#6B4A00", fontSize: 14, lineHeight: 1.45, ...style,
    }}>
      <span aria-hidden style={{ fontSize: 18, lineHeight: "20px", flexShrink: 0 }}>📦</span>
      <span>
        <strong style={{ display: "block", fontWeight: 700, color: "#4A3300", marginBottom: 2 }}>{text.title}</strong>
        {text.body}
      </span>
    </div>
  );
}
