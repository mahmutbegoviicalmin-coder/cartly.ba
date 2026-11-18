"use client";

import { useEffect, useState } from "react";

/**
 * Black November. Everything campaign-related (announcement bar, hero slider
 * labels, card ribbons) switches off on its own when this moment passes:
 * 1 December 2026, 00:00 Sarajevo time (CET = UTC+1).
 */
import { BLACK_NOVEMBER_END } from "./campaign-dates";

export { BLACK_NOVEMBER_END, isBlackNovember } from "./campaign-dates";

/** Live campaign state, re-checked every second so it flips off at midnight without a reload. */
export function useBlackNovember() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);
  // Before mount (SSR) assume the campaign state at render time.
  const t = now ?? Date.now();
  const left = Math.max(0, BLACK_NOVEMBER_END - t);
  return {
    active: left > 0,
    mounted: now !== null,
    days:    Math.floor(left / 86_400_000),
    hours:   Math.floor((left % 86_400_000) / 3_600_000),
    minutes: Math.floor((left % 3_600_000) / 60_000),
    seconds: Math.floor((left % 60_000) / 1_000),
  };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
