"use client";

import { useEffect, useState } from "react";
import { BLACK_NOVEMBER_END } from "@/lib/campaign-dates";

/**
 * Countdown to the real end of the Black November price (same deadline as the
 * site-wide order bar), so the page never shows two different deadlines.
 * Returns null until mounted (avoids hydration mismatch) and once the campaign is over.
 */
export function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(BLACK_NOVEMBER_END - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (left === null || left <= 0) return null;
  const s = Math.floor(left / 1000);
  return {
    d: String(Math.floor(s / 86400)),
    h: String(Math.floor((s % 86400) / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
  };
}
