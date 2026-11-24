"use client";

import { useEffect, useState } from "react";

/**
 * Dan državnosti BiH (25.11.2026): post offices are closed. After any successful
 * order (every product page posts to /api/...-order, /api/order, /api/narudzba…)
 * tell the customer when it ships. Turns itself off after 25.11. (Sarajevo time):
 * from 26.11. nothing renders and fetch is left untouched.
 */
const HOLIDAY = "2026-11-25";
const ORDER_API = /^\/api\/(?:[a-z0-9-]+-order|order|order-zvucnik|narudzba|orders)\/?$/;

const sarajevoDay = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Sarajevo" });

export function HolidayNotice() {
  const [show, setShow] = useState(false);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const d = sarajevoDay();
    setToday(d);
    if (d > HOLIDAY) return;

    const original = window.fetch;
    window.fetch = async (input, init) => {
      const res = await original(input, init);
      try {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const path = new URL(url, window.location.origin).pathname;
        const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
        if (method === "POST" && res.ok && ORDER_API.test(path) && sarajevoDay() <= HOLIDAY) setShow(true);
      } catch { /* never break checkout */ }
      return res;
    };
    return () => { window.fetch = original; };
  }, []);

  if (!show || !today || today > HOLIDAY) return null;
  const isHoliday = today === HOLIDAY;

  return (
    <div role="status" aria-live="polite" style={{
      position: "fixed", left: "50%", top: 16, transform: "translateX(-50%)", zIndex: 2147483000,
      width: "min(520px, calc(100vw - 24px))", background: "#FFF8E6", color: "#5C3D00",
      border: "1px solid #F5D27A", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
      padding: "14px 44px 14px 16px", fontSize: 15, lineHeight: 1.45, fontFamily: "inherit",
    }}>
      <strong style={{ display: "block", fontSize: 16, marginBottom: 4 }}>🇧🇦 Obavještenje o slanju</strong>
      {isHoliday
        ? <>Danas, <b>25.11.</b>, pošte ne rade zbog <b>Dana državnosti BiH</b>. Vaša narudžba je zaprimljena i biće poslana u <b>četvrtak, 26.11.</b></>
        : <>Sutra, <b>25.11.</b>, pošte ne rade zbog <b>Dana državnosti BiH</b>. Vaša narudžba je zaprimljena, a sve narudžbe od sutra šaljemo u <b>četvrtak, 26.11.</b></>}
      <button onClick={() => setShow(false)} aria-label="Zatvori obavještenje" style={{
        position: "absolute", top: 8, right: 8, width: 30, height: 30, border: "none", borderRadius: 15,
        background: "rgba(92,61,0,0.08)", color: "#5C3D00", fontSize: 18, lineHeight: "30px", cursor: "pointer",
      }}>×</button>
    </div>
  );
}
