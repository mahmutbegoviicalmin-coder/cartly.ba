"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

function getTimeLeft() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { h, m, s };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function UrgencyBar() {
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[#061B38]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2.5 px-5 py-3 text-center sm:px-8">
        <Flame className="h-4 w-4 shrink-0 text-[#FFC107]" strokeWidth={2.2} />
        <span className="text-[13px] font-semibold text-white/90 sm:text-[14px]">
          Akcijska ponuda ističe danas
        </span>
        <span className="rounded-lg bg-[#FFC107] px-2.5 py-1 font-mono text-[13px] font-extrabold tabular-nums text-[#061B38] sm:text-[14px]" suppressHydrationWarning>
          {time ? `${pad(time.h)}:${pad(time.m)}:${pad(time.s)}` : "--:--:--"}
        </span>
      </div>
    </div>
  );
}
