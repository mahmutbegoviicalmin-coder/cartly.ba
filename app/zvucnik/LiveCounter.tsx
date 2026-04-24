"use client";

import { useState, useEffect } from "react";

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function LiveCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Set initial value client-side only to avoid hydration mismatch
    setCount(randomBetween(18, 40));
    const interval = setInterval(() => {
      setCount(randomBetween(18, 40));
    }, 4_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-100">
      {/* Pulsing green dot */}
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: "#22c55e" }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ background: "#22c55e" }}
        />
      </span>
      <span className="text-gray-700 text-sm">
        <span className="font-semibold text-gray-900">{count ?? "—"}</span> osoba gleda sada
      </span>
    </div>
  );
}
