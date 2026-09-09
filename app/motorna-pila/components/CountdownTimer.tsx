"use client";

import { useEffect, useState } from "react";

type Left = { h: string; m: string; s: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function remaining(): Left {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const num = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const elapsed = (num("hour") * 3600 + num("minute") * 60 + num("second")) * 1000;
  const left = Math.max(0, 86400000 - elapsed);
  const total = Math.floor(left / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h: pad(h), m: pad(m), s: pad(s) };
}

export default function CountdownTimer() {
  const [t, setT] = useState<Left>({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    setT(remaining());
    const id = setInterval(() => setT(remaining()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mp-timer" role="timer" aria-label="Akcijska cijena ističe">
      <span className="mp-timer-label">Akcijska cijena ističe</span>
      <div className="mp-timer-digits">
        <span><b>{t.h}</b><i>sati</i></span>
        <em>:</em>
        <span><b>{t.m}</b><i>min</i></span>
        <em>:</em>
        <span><b>{t.s}</b><i>sek</i></span>
      </div>
    </div>
  );
}
