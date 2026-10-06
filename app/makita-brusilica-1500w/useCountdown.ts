"use client";

import { useEffect, useState } from "react";

const KEY      = "_mk15_deal_end";
const WINDOW_MS = (2 * 60 + 47) * 60 * 1000; // 2h 47m per visitor

function readDeadline(): number {
  const now = Date.now();
  try {
    const saved = Number(localStorage.getItem(KEY));
    if (Number.isFinite(saved) && saved > now) return saved;
    const next = now + WINDOW_MS;
    localStorage.setItem(KEY, String(next));
    return next;
  } catch {
    return now + WINDOW_MS;
  }
}

/** Per-visitor deal countdown. Returns null until mounted (avoids hydration mismatch). */
export function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    let deadline = readDeadline();
    const tick = () => {
      let ms = deadline - Date.now();
      if (ms <= 0) {
        deadline = readDeadline();
        ms = deadline - Date.now();
      }
      setLeft(ms);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (left === null) return null;
  const s = Math.max(0, Math.floor(left / 1000));
  return {
    h: String(Math.floor(s / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
  };
}
