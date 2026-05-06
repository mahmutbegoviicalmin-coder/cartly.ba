"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";
import {
  ShoppingBag, CheckCircle2, Shield, Package,
  RefreshCw, Lock, Clock, AlertCircle,
  ChevronRight, Truck, CreditCard, Zap, Box, Flame,
} from "lucide-react";
import { event } from "@/lib/fbpixel";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  red:    "#CC0000",
  redDk:  "#A80000",
  black:  "#0B0B0B",
  white:  "#FFFFFF",
  bgSoft: "#F5F3EE",
  muted:  "#5F5F5F",
  border: "#E4E2DC",
  green:  "#16A34A",
};
const SORA  = "var(--font-sora, 'Sora', sans-serif)";
const INTER = "var(--font-inter, 'Inter', sans-serif)";
const MAXW  = 1200;

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown() {
  const [t, setT] = useState({ h: 8, m: 0, s: 0 });
  useEffect(() => {
    const KEY = "milw_cdown_end";
    let end: number;
    try {
      const s = localStorage.getItem(KEY);
      end = s && parseInt(s, 10) > Date.now()
        ? parseInt(s, 10)
        : Date.now() + 8 * 3_600_000;
      localStorage.setItem(KEY, String(end));
    } catch { end = Date.now() + 3 * 3_600_000; }
    const tick = () => {
      const d = Math.max(0, end - Date.now());
      setT({ h: Math.floor(d / 3_600_000), m: Math.floor((d % 3_600_000) / 60_000), s: Math.floor((d % 60_000) / 1_000) });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);
  return t;
}
const pad = (n: number) => String(n).padStart(2, "0");

// ─── Data ─────────────────────────────────────────────────────────────────────
const NOTIFS = [
  "Mirza iz Sarajeva upravo naručio",
  "Haris iz Mostara upravo naručio",
  "Alen iz Banja Luke upravo naručio",
  "Dino iz Bihaća upravo naručio",
  "Emir iz Zenice upravo naručio",
  "Adnan iz Tuzle upravo naručio",
  "Kenan iz Travnika upravo naručio",
  "Sead iz Brčkog upravo naručio",
  "Jasmin iz Živinica upravo naručio",
  "Nedim iz Goražda upravo naručio",
  "Faruk iz Sarajeva upravo naručio",
  "Tarik iz Kaknja upravo naručio",
];

const KIT_COL1 = [
  { text: "Milwaukee M18 Bušilica/odvijač",    star: true  },
  { text: "2× 18V M18 Li-Ion baterija",         star: true  },
  { text: "M18/M12 brzi punjač",               star: true  },
  { text: "Set burgija — drvo, metal, beton",  star: true  },
  { text: "Bit set za odvijanje (10 kom)",      star: false },
  { text: "Magnetski nosač bita",              star: false },
  { text: "Adapter za udar",                   star: false },
];
const KIT_COL2 = [
  { text: "Kaiš za sigurnosno nošenje",        star: false },
  { text: "Razina libela",                     star: false },
  { text: "PVC izolir traka",                  star: false },
  { text: "Kutija šrafova i tiplova",          star: false },
  { text: "LED osvjetljenje radnog mjesta",    star: false },
  { text: "Uputstvo za korištenje (BS/HR)",    star: false },
  { text: "Prenosivi kofer M18",               star: true  },
];

const BENEFITS = [
  { Icon: Box,        title: "Kompletan set",         desc: "Sve u jednom — bušilica, baterije, burgije i kofer." },
  { Icon: Zap,        title: "Brushless motor",        desc: "Veća efikasnost, duži vijek, manje održavanja." },
  { Icon: Shield,     title: "Za svakoga",             desc: "Idealno za kuću, renovaciju i profesionalne majstore." },
  { Icon: CreditCard, title: "Plaćanje pouzećem",      desc: "Plaćate tek kada preuzmete paket." },
];

const DRILL_SPECS = [
  "18V M18 Li-Ion platforma — kompatibilna s cijelim M18 ekosistemom",
  "Brushless motor — veća efikasnost i duži vijek trajanja",
  "2 brzinska stepena za precizan rad na svakom materijalu",
  "2 baterije + punjač uključeni u cijenu",
];

// ─── Page component ───────────────────────────────────────────────────────────
export default function MilwaukeePage() {
  const [headerVis,  setHeaderVis]  = useState(true);
  const [notifIdx,   setNotifIdx]   = useState(0);
  const [notifShow,  setNotifShow]  = useState(false);
  const [viewers,    setViewers]    = useState(0);
  const [form,       setForm]       = useState({ ime: "", adresa: "", postanski_broj: "", grad: "", telefon: "" });
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const lastY          = useRef(0);
  const checkoutFired  = useRef(false);
  const timer          = useCountdown();

  useEffect(() => {
    event("ViewContent", {
      content_name: "Milwaukee M18 Bušilica Set",
      content_ids:  ["milwaukee-m18-set"],
      content_type: "product",
      value:        69.9,
      currency:     "BAM",
    });
  }, []);

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setHeaderVis(y < 80 || y < lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const cycle = () => {
      setNotifShow(true);
      setTimeout(() => { setNotifShow(false); setTimeout(() => setNotifIdx(i => (i + 1) % NOTIFS.length), 500); }, 4_000);
    };
    const id = setInterval(cycle, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    setViewers(rand(68, 94));
    const id = setInterval(() => {
      setViewers(v => Math.min(110, Math.max(52, v + rand(-4, 5))));
    }, rand(22_000, 38_000));
    return () => clearInterval(id);
  }, []);

  function scrollToForm() {
    if (!checkoutFired.current) { checkoutFired.current = true; event("InitiateCheckout", { value: 69.9, currency: "BAM" }); }
    document.getElementById("narudzba")?.scrollIntoView({ behavior: "smooth" });
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.name === "postanski_broj"
      ? e.target.value.replace(/\D/g, "").slice(0, 5)
      : e.target.value;
    setForm(p => ({ ...p, [e.target.name]: value }));
    if (error) setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { ime, adresa, postanski_broj, grad, telefon } = form;
    if (!ime.trim() || !adresa.trim() || !postanski_broj.trim() || !grad.trim() || !telefon.trim()) { setError("Molimo popunite sva obavezna polja."); return; }
    if (!/^[0-9+\s\-()]{6,}$/.test(telefon.trim())) { setError("Unesite ispravan broj telefona."); return; }
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/narudzba", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ime, adresa, grad, telefon }) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Greška pri slanju.");
      event("Purchase", { content_name: "Milwaukee M18 Bušilica Set", value: 69.9, currency: "BAM" }, json.orderNumber);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ background: C.white, color: C.black, overflowX: "hidden" }}>

      {/* ── Global styles ─────────────────────────────────── */}
      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --red:    ${C.red};
          --black:  ${C.black};
          --bgSoft: ${C.bgSoft};
          --border: ${C.border};
          --muted:  ${C.muted};
          --maxw:   ${MAXW}px;
          --sec-py: clamp(64px, 8vw, 100px);
          --sora:   ${SORA};
          --inter:  ${INTER};
        }
        .mw-h    { font-family: var(--sora); }
        .mw-body { font-family: var(--inter); }

        .mw-hero-cta {
          background: #0B0B0B;
          color: #fff;
          transition: background 220ms ease, color 220ms ease, transform 200ms ease;
        }
        .mw-hero-cta:hover {
          background: #fff;
          color: #CC0000;
          transform: scale(1.03);
        }

        @media (min-width: 901px) {
          .mw-hero-copy { flex: 1; }
          .mw-hero-grid { align-items: center !important; }
        }

        @keyframes mw-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        .mw-pulse { animation: mw-pulse 2s ease-in-out infinite; }

        @keyframes mw-success-in {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mw-check-pop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          65%  { transform: scale(1.18) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes mw-check-ring {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          60%  { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        .mw-success-card { animation: mw-success-in 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
        .mw-check-icon {
          animation:
            mw-check-pop  0.6s cubic-bezier(0.175,0.885,0.32,1.275) 0.15s both,
            mw-check-ring 1.4s ease 0.75s;
        }
        .mw-success-secondary:hover { background: rgba(0,0,0,0.07) !important; }

        @keyframes mw-fab-in {
          from { opacity: 0; transform: translateY(20px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes mw-fab-glow {
          0%,100% { box-shadow: 0 6px 28px rgba(204,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1); }
          50%      { box-shadow: 0 10px 36px rgba(204,0,0,0.32), 0 4px 16px rgba(0,0,0,0.12); }
        }
        @keyframes mw-icon-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(204,0,0,0.45); }
          60%      { box-shadow: 0 0 0 7px rgba(204,0,0,0); }
        }
        .mw-fab {
          animation:
            mw-fab-in   0.55s cubic-bezier(0.22,1,0.36,1) 1.4s both,
            mw-fab-glow 3.2s ease-in-out 2.2s infinite;
          transition: transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease;
        }
        .mw-fab:hover {
          transform: translateY(-4px) scale(1.03) !important;
          box-shadow: 0 16px 48px rgba(204,0,0,0.35), 0 4px 16px rgba(0,0,0,0.12) !important;
          animation-play-state: paused !important;
        }
        .mw-fab:active { transform: scale(0.95) !important; transition-duration: 80ms !important; }
        .mw-fab-icon { animation: mw-icon-pulse 2.4s ease-out 3s infinite; }

        @media (max-width: 640px) {
          .mw-fab-wrap {
            left: 50% !important; right: auto !important;
            transform: translateX(-50%) !important;
            bottom: calc(16px + env(safe-area-inset-bottom)) !important;
            width: 92vw !important; max-width: 380px !important;
          }
          .mw-fab { width: 100% !important; justify-content: center !important; }
          .mw-fab-urgency { display: none !important; }
          .mw-prod-img-card { flex: none !important; width: 100% !important; padding: 32px 24px !important; min-height: 280px !important; }
          .mw-kit-img-card  { flex: none !important; width: 100% !important; }
        }

        @keyframes mw-spin { to { transform: rotate(360deg); } }
        .mw-spin { animation: mw-spin .75s linear infinite; }

        .mw-btn:hover { opacity: .88; transform: translateY(-1px); }
        .mw-btn       { transition: opacity 200ms, transform 200ms; }

        .mw-input:focus { border-color: ${C.red} !important; }
        .mw-input { transition: border-color 150ms; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #fff inset !important;
          -webkit-text-fill-color: ${C.black} !important;
        }

        @media (max-width: 900px) {
          .mw-hero-grid   { flex-direction: column !important; }
          .mw-hero-visual { width: 100% !important; max-width: 360px !important; flex: none !important; align-self: center !important; margin-top: -16px !important; }
          .mw-hero-img-wrap { padding-bottom: 80% !important; margin-top: 0 !important; }
          .mw-hero-copy   { max-width: 100% !important; padding-bottom: 0 !important; padding-top: 16px !important; }
          .mw-hero-bg-text{ display: none !important; }
          .mw-kit-grid    { flex-direction: column !important; }
          .mw-prod-grid   { flex-direction: column !important; }
          .mw-form-grid   { flex-direction: column !important; }
          .mw-form-summary{ flex: none !important; width: 100% !important; }
          .mw-why-grid    { grid-template-columns: 1fr 1fr !important; }
          .mw-kit-cols    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .mw-why-grid    { grid-template-columns: 1fr !important; }
          .mw-header-btn  { font-size: 13px !important; padding: 9px 16px !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════
          1. HEADER
      ════════════════════════════════════════════════════════ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: C.black,
        transform: headerVis ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 300ms ease",
      }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="/" style={{ textDecoration: "none" }}>
              <span className="mw-h" style={{ fontSize: 20, fontWeight: 800, color: C.white, letterSpacing: "-0.02em" }}>
                cartly<span style={{ color: C.red }}>.</span>ba
              </span>
            </a>
            <a
              href="/"
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontFamily: INTER, fontWeight: 500, color: "rgba(255,255,255,0.45)", textDecoration: "none", letterSpacing: "0.01em", transition: "color 150ms" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            >
              ← Početna
            </a>
          </div>
          <button
            onClick={scrollToForm}
            className="mw-btn mw-header-btn"
            style={{ background: C.red, color: C.white, fontFamily: SORA, fontWeight: 700, fontSize: 14, letterSpacing: "0.01em", border: "none", borderRadius: 999, padding: "11px 24px", cursor: "pointer" }}
          >
            Naruči odmah
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          2. HERO
      ════════════════════════════════════════════════════════ */}
      <section style={{
        background: "radial-gradient(circle at 65% 35%, #E83030 0%, #CC0000 38%, #A30000 68%, #6B0000 100%)",
        paddingTop: 72, position: "relative", overflow: "hidden",
        minHeight: "calc(100vh - 72px)",
      }}>
        {/* Edge vignette */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 130% 110% at 50% 50%, transparent 45%, rgba(0,0,0,0.22) 100%)" }} />

        {/* Background "M18" — decorative */}
        <div className="mw-hero-bg-text" aria-hidden="true" style={{
          position: "absolute", right: "-2%", top: "50%", transform: "translateY(-50%)",
          fontSize: "clamp(160px, 28vw, 400px)", fontWeight: 800, fontFamily: SORA,
          color: "rgba(255,255,255,0.05)", letterSpacing: "-0.06em", lineHeight: 0.85,
          userSelect: "none", pointerEvents: "none", zIndex: 0, filter: "blur(4px)",
        }}>
          M18
        </div>

        {/* Main grid */}
        <div className="mw-hero-grid" style={{
          position: "relative", zIndex: 1, maxWidth: MAXW, margin: "0 auto",
          padding: "48px 28px 0", display: "flex", gap: 40,
          minHeight: "calc(100vh - 72px - 48px)",
        }}>

          {/* LEFT: Copy */}
          <div className="mw-hero-copy" style={{ maxWidth: 520, paddingBottom: 72, paddingTop: 20 }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(0,0,0,0.35)", borderRadius: 6, padding: "5px 13px",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
              fontFamily: SORA, color: "#fff", marginBottom: 24,
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              Milwaukee M18 — Kompletan Set
            </div>

            {/* H1 */}
            <h1 className="mw-h" style={{
              fontSize: "clamp(40px, 5.5vw, 68px)", fontWeight: 800, lineHeight: 1.04,
              letterSpacing: "-0.035em", color: C.white, marginBottom: 16,
            }}>
              Sve što ti treba.<br />
              U jednom koferu.
            </h1>

            {/* Subtext */}
            <p style={{ fontSize: 17, fontFamily: INTER, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 32, maxWidth: 460 }}>
              Bušilica, baterije, punjač i komplet burgija — sve spremno za rad odmah.
            </p>

            {/* Price block */}
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 14, fontFamily: INTER, color: "rgba(255,255,255,0.45)", textDecoration: "line-through", display: "block", marginBottom: 4, fontWeight: 500 }}>
                179,90 KM
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
                <span className="mw-h" style={{ fontSize: "clamp(52px, 7vw, 84px)", fontWeight: 900, color: C.white, letterSpacing: "-0.05em", lineHeight: 1 }}>
                  69,90 KM
                </span>
                <span style={{ background: "#16A34A", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: SORA, padding: "5px 12px", borderRadius: 6, alignSelf: "center" }}>
                  -61%
                </span>
              </div>
              <p style={{ fontSize: 13, fontFamily: INTER, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
                <Truck size={13} strokeWidth={2} /> +10,00 KM dostava
              </p>
            </div>

            {/* CTA */}
            <button onClick={scrollToForm} className="mw-hero-cta" style={{
              display: "flex", alignItems: "center", gap: 8, fontFamily: SORA, fontWeight: 700,
              fontSize: 16, border: "none", borderRadius: 14, padding: "17px 30px",
              cursor: "pointer", marginBottom: 20, width: "fit-content",
            }}>
              Naruči odmah — 69,90 KM
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>

            {/* Countdown */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "11px 18px", marginBottom: 20,
              backdropFilter: "blur(6px)",
            }}>
              <Clock size={14} strokeWidth={2} style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontFamily: INTER, color: "rgba(255,255,255,0.65)", fontWeight: 500, whiteSpace: "nowrap" }}>
                Ponuda završava za:
              </span>
              <span className="mw-h" style={{ fontSize: 20, fontWeight: 700, color: C.white, letterSpacing: "0.03em" }}>
                {pad(timer.h)}:{pad(timer.m)}:{pad(timer.s)}
              </span>
            </div>

            {/* Trust row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 22px", marginBottom: 18 }}>
              {[
                { Icon: CreditCard, text: "Plaćanje pouzećem"  },
                { Icon: Truck,      text: "Brza dostava"        },
                { Icon: Package,    text: "Ograničena količina" },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: INTER, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                  <Icon size={13} strokeWidth={2} />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Live viewers */}
            {viewers > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.22)", borderRadius: 999, padding: "7px 14px" }}>
                <span style={{ position: "relative", display: "inline-flex" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "block" }} />
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#ef4444", opacity: 0.4, animation: "mw-pulse 1.8s ease-in-out infinite", transform: "scale(2)" }} />
                </span>
                <span style={{ fontSize: 13, fontFamily: INTER, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                  <strong style={{ color: C.white }}>{viewers}</strong> osoba trenutno gleda ovaj proizvod
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Product image */}
          <div className="mw-hero-visual" style={{ flex: "0 0 54%", position: "relative", alignSelf: "flex-start", marginTop: "0px" }}>
            {/* Strong white halo behind drill */}
            <div aria-hidden="true" style={{
              position: "absolute", top: "42%", left: "50%", transform: "translate(-50%, -50%)",
              width: "80%", height: "80%",
              background: "radial-gradient(circle, rgba(255,255,255,0.32) 0%, rgba(255,240,240,0.15) 42%, transparent 68%)",
              filter: "blur(36px)", zIndex: 0, pointerEvents: "none",
            }} />
            {/* Outer soft halo — second layer for depth */}
            <div aria-hidden="true" style={{
              position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)",
              width: "110%", height: "110%",
              background: "radial-gradient(circle, rgba(255,220,220,0.12) 0%, transparent 65%)",
              filter: "blur(60px)", zIndex: 0, pointerEvents: "none",
            }} />
            {/* Ground shadow */}
            <div aria-hidden="true" style={{
              position: "absolute", bottom: "4%", left: "20%", right: "20%",
              height: "4%", background: "rgba(0,0,0,0.25)", borderRadius: "50%",
              filter: "blur(14px)", zIndex: 0,
            }} />
            {/* Drill image */}
            <div className="mw-hero-img-wrap" style={{ position: "relative", width: "100%", paddingBottom: "115%", zIndex: 1, marginTop: "24px" }}>
              <Image
                src="/images/milwaukee.png"
                alt="Milwaukee M18 Bušilica"
                fill
                sizes="(max-width:900px) 85vw, 54vw"
                style={{
                  objectFit: "contain", objectPosition: "center top",
                  filter: "drop-shadow(0 0 40px rgba(255,255,255,0.55)) drop-shadow(0 0 80px rgba(255,255,255,0.2)) drop-shadow(-2px 24px 32px rgba(0,0,0,0.45))",
                  transform: "rotate(2deg) scale(1.04)", transformOrigin: "center top",
                }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FLOATING NOTIFICATION
      ════════════════════════════════════════════════════════ */}
      <div style={{
        position: "fixed", bottom: 20, left: 20, zIndex: 300, maxWidth: 280,
        transform: notifShow ? "translateY(0)" : "translateY(12px)",
        opacity: notifShow ? 1 : 0, transition: "transform 350ms ease, opacity 350ms ease",
        pointerEvents: "none",
      }}>
        <div style={{ background: "#fff", borderLeft: `3px solid ${C.red}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(204,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShoppingBag size={13} strokeWidth={2} style={{ color: C.red }} />
          </div>
          <div>
            <span style={{ fontSize: 13, color: "#1a1a1a", fontFamily: INTER, fontWeight: 600, display: "block", lineHeight: 1.2 }}>{NOTIFS[notifIdx]}</span>
            <span style={{ fontSize: 11, color: "#aaa", fontFamily: INTER, fontWeight: 400 }}>Milwaukee M18 Set</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          FLOATING CTA — bottom right
      ════════════════════════════════════════════════════════ */}
      {!success && (
        <div className="mw-fab-wrap" style={{ position: "fixed", bottom: 28, right: 28, zIndex: 300 }}>
          <div className="mw-fab-urgency" style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: INTER,
              fontWeight: 600, color: "#555", background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)", border: "1px solid rgba(0,0,0,0.08)",
              padding: "4px 12px 4px 8px", borderRadius: 999, letterSpacing: "0.02em", whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}>
              <Flame size={12} strokeWidth={2} style={{ color: "#f97316", flexShrink: 0 }} />
              Ponuda ističe uskoro
            </span>
          </div>

          <button onClick={scrollToForm} className="mw-fab" style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "#fff", color: C.black,
            fontFamily: SORA, border: "1px solid rgba(0,0,0,0.07)", borderRadius: 999,
            padding: "11px 20px 11px 11px", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            <div className="mw-fab-icon" style={{
              width: 38, height: 38, borderRadius: "50%",
              background: C.red,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <ShoppingBag size={16} strokeWidth={2} style={{ color: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 3, color: C.black }}>Naruči odmah</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.red, letterSpacing: "-0.01em" }}>69,90 KM</span>
            </div>
            <ChevronRight size={15} strokeWidth={2.5} style={{ color: "#ccc", marginLeft: 4, flexShrink: 0 }} />
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          3. PACKAGE SECTION
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: C.white, padding: "var(--sec-py) 24px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto" }}>

          <div style={{ marginBottom: 48 }}>
            <span style={{ fontFamily: SORA, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.white, background: C.red, padding: "4px 10px", borderRadius: 4, display: "inline-block", marginBottom: 16 }}>
              Sadržaj paketa
            </span>
            <h2 className="mw-h" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: C.black }}>
              Šta dobijate u paketu?
            </h2>
          </div>

          <div className="mw-kit-grid" style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>

            {/* Image card */}
            <div className="mw-kit-img-card" style={{ flex: "0 0 44%", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
                <Image
                  src="/images/setmilw.jpeg"
                  alt="Milwaukee M18 Set"
                  fill
                  sizes="(max-width:900px) 100vw, 44vw"
                  style={{ objectFit: "contain", padding: "16px" }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div style={{ flex: 1 }}>
              {/* Callout */}
              <div style={{ background: C.red, border: `1.5px solid rgba(0,0,0,0.08)`, borderRadius: 14, padding: "18px 22px", marginBottom: 28 }}>
                <p className="mw-h" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: C.white, marginBottom: 4 }}>
                  2 baterije + punjač uključeni
                </p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: INTER }}>
                  Radite bez zastoja — dok se jedna puni, koristite drugu.
                </p>
              </div>

              {/* Two-column kit list */}
              <div className="mw-kit-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 28 }}>
                {[...KIT_COL1, ...KIT_COL2].map(({ text, star }) => (
                  <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <CheckCircle2
                      size={16} strokeWidth={2.5}
                      style={{ color: star ? C.red : "#AAAAAA", flexShrink: 0, marginTop: 3 }}
                    />
                    <span style={{ fontSize: 14, fontFamily: INTER, fontWeight: star ? 600 : 400, color: star ? C.black : C.muted, lineHeight: 1.45 }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <button onClick={scrollToForm} className="mw-btn" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.black, color: C.white, fontFamily: SORA, fontWeight: 700, fontSize: 15, border: "none", borderRadius: 10, padding: "14px 24px", cursor: "pointer" }}>
                Naruči set <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. BENEFITS SECTION
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: C.bgSoft, padding: "var(--sec-py) 24px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto" }}>
          <div style={{ marginBottom: 44 }}>
            <span style={{ fontFamily: SORA, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, display: "inline-block", marginBottom: 14 }}>
              Prednosti seta
            </span>
            <h2 className="mw-h" style={{ fontSize: "clamp(26px, 3.8vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.black }}>
              Zašto ovaj set?
            </h2>
          </div>

          <div className="mw-why-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {BENEFITS.map(({ Icon, title, desc }) => (
              <div key={title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: "24px 22px", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <Icon size={20} strokeWidth={2} style={{ color: C.white }} />
                </div>
                <h3 className="mw-h" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: C.black, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, fontFamily: INTER, color: C.muted, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          5. PRODUCT FEATURE SECTION
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: C.white, padding: "var(--sec-py) 24px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto" }}>
          <div className="mw-prod-grid" style={{ display: "flex", gap: 48, alignItems: "center" }}>

            {/* Product image card */}
            <div className="mw-prod-img-card" style={{ flex: "0 0 44%", background: C.white, borderRadius: 22, padding: "48px 40px", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${C.border}`, boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>
              <div style={{ position: "relative", width: "100%", paddingBottom: "85%", minHeight: 280 }}>
                <Image
                  src="/images/milwaukee.png"
                  alt="Milwaukee M18 Bušilica"
                  fill
                  sizes="(max-width:900px) 90vw, 44vw"
                  style={{ objectFit: "contain", filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.14))" }}
                />
              </div>
            </div>

            {/* Specs */}
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                SKU: M18 BLPD3 — 18V M18 Platform
              </span>
              <h2 className="mw-h" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: C.black, marginBottom: 24 }}>
                Milwaukee M18<br />bušilica/odvijač
              </h2>
              <div style={{ marginBottom: 32 }}>
                {DRILL_SPECS.map(spec => (
                  <div key={spec} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, border: `2px solid ${C.redDk}`, flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 15, fontFamily: INTER, color: "#444", lineHeight: 1.5 }}>{spec}</span>
                  </div>
                ))}
              </div>
              <button onClick={scrollToForm} className="mw-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.red, color: C.white, fontFamily: SORA, fontWeight: 700, fontSize: 15, border: "none", borderRadius: 10, padding: "14px 26px", cursor: "pointer" }}>
                Naruči odmah <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          6. SCARCITY STRIP
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: C.black, padding: "24px" }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="mw-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
              <span className="mw-h" style={{ fontSize: "clamp(15px, 2vw, 19px)", fontWeight: 700, color: C.white }}>
                Preostalo još <span style={{ color: C.red }}>9 komada</span> na lageru
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.38)", fontSize: 12, fontFamily: INTER }}>
              <RefreshCw size={12} strokeWidth={2} />
              Zalihe se ažuriraju u realnom vremenu
            </div>
          </div>
          <div style={{ height: 7, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "88%", background: `linear-gradient(90deg, ${C.red}, #FF3333)`, borderRadius: 999 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: INTER }}>Rasprodano 88%</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: INTER }}>Preostalo 12%</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          7. ORDER SECTION
      ════════════════════════════════════════════════════════ */}
      <section id="narudzba" style={{ background: C.bgSoft, padding: "var(--sec-py) 24px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto" }}>

          <div style={{ marginBottom: 48 }}>
            <span style={{ fontFamily: SORA, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, display: "inline-block", marginBottom: 14 }}>
              Narudžba
            </span>
            <h2 className="mw-h" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.black }}>
              Naručite odmah
            </h2>
          </div>

          {success ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="mw-success-card" style={{
                background: "#ffffff", borderRadius: 24,
                padding: "clamp(32px, 5vw, 52px) clamp(24px, 5vw, 48px)",
                textAlign: "center", maxWidth: 580, width: "100%",
                boxShadow: "0 12px 48px rgba(0,0,0,0.09)",
                display: "flex", flexDirection: "column", alignItems: "center",
              }}>
                <div className="mw-check-icon" style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 28, flexShrink: 0, boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h3 className="mw-h" style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.black, marginBottom: 14, lineHeight: 1.1 }}>
                  Narudžba uspješno zaprimljena
                </h3>
                <p style={{ fontSize: 16, fontFamily: INTER, color: "#555", lineHeight: 1.7, marginBottom: 8, maxWidth: 420 }}>
                  Hvala vam na povjerenju. Vaša narudžba je uspješno evidentirana i trenutno se obrađuje.
                </p>
                <p style={{ fontSize: 14, fontFamily: INTER, color: "#999", lineHeight: 1.6, marginBottom: 36, maxWidth: 400 }}>
                  Kontaktirat ćemo vas u najkraćem roku radi potvrde i isporuke.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 24px", marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid rgba(0,0,0,0.06)", width: "100%" }}>
                  {["Brza dostava (1–3 dana)", "Plaćanje pouzećem", "Provjeren kvalitet"].map((text) => (
                    <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontFamily: INTER, color: "#444", fontWeight: 500 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      {text}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                  <button onClick={() => window.location.href = "/"} className="mw-btn" style={{ width: "100%", background: C.black, color: C.white, fontFamily: SORA, fontWeight: 700, fontSize: 15, border: "none", borderRadius: 12, padding: "17px", cursor: "pointer" }}>
                    Vrati se na početnu
                  </button>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="mw-btn mw-success-secondary" style={{ width: "100%", background: "rgba(0,0,0,0.04)", color: "#666", fontFamily: SORA, fontWeight: 600, fontSize: 14, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "15px", cursor: "pointer", transition: "background 200ms" }}>
                    Pregled proizvoda
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mw-form-grid" style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

              {/* Form */}
              <form onSubmit={onSubmit} style={{ flex: 1, background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: "32px" }}
                onFocus={() => { if (!checkoutFired.current) { checkoutFired.current = true; event("InitiateCheckout", { value: 69.9, currency: "BAM" }); } }}
              >
                <h3 className="mw-h" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: C.black, marginBottom: 24 }}>
                  Podaci za dostavu
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {([
                    { name: "ime",            label: "Ime i prezime",  placeholder: "npr. Emir Hadžić",  type: "text", autoComplete: "name" },
                    { name: "adresa",         label: "Adresa dostave", placeholder: "npr. Titova 12",    type: "text", autoComplete: "street-address" },
                    { name: "postanski_broj", label: "Poštanski broj", placeholder: "npr. 71000",        type: "text", autoComplete: "postal-code" },
                    { name: "grad",           label: "Grad",           placeholder: "npr. Sarajevo",     type: "text", autoComplete: "address-level2" },
                    { name: "telefon",        label: "Broj telefona",  placeholder: "npr. 061 123 456",  type: "tel",  autoComplete: "tel" },
                  ] as const).map(f => (
                    <div key={f.name}>
                      <label style={{ display: "block", fontSize: 12, fontFamily: SORA, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#888", marginBottom: 7 }}>
                        {f.label} <span style={{ color: C.black }}>*</span>
                      </label>
                      <input
                        name={f.name} type={f.type} value={form[f.name]} onChange={onChange}
                        placeholder={f.placeholder} autoComplete={f.autoComplete}
                        className="mw-input"
                        style={{ width: "100%", background: C.bgSoft, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "13px 16px", fontSize: 15, fontFamily: INTER, color: C.black, outline: "none" }}
                      />
                    </div>
                  ))}

                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(204,0,0,0.06)", border: "1px solid rgba(204,0,0,0.18)", borderRadius: 10, padding: "12px 16px" }}>
                      <AlertCircle size={16} strokeWidth={2} style={{ color: C.red, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontFamily: INTER, color: C.red, fontWeight: 500 }}>{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="mw-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: loading ? "rgba(11,11,11,0.5)" : C.black, color: C.white, fontFamily: SORA, fontWeight: 700, fontSize: 17, border: "none", borderRadius: 12, padding: "18px", cursor: loading ? "not-allowed" : "pointer", width: "100%", marginTop: 4 }}>
                    {loading ? (
                      <>
                        <svg className="mw-spin" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Slanje narudžbe...
                      </>
                    ) : (
                      <>Potvrdi narudžbu <ChevronRight size={18} strokeWidth={2.5} /></>
                    )}
                  </button>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <Lock size={13} strokeWidth={2} style={{ color: "#bbb" }} />
                    <span style={{ fontSize: 13, fontFamily: INTER, color: "#bbb" }}>Sigurna narudžba. Plaćanje pouzećem.</span>
                  </div>
                </div>
              </form>

              {/* Summary */}
              <div className="mw-form-summary" style={{ flex: "0 0 340px" }}>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: "26px 24px", marginBottom: 14, borderTop: `4px solid ${C.red}` }}>
                  <h4 className="mw-h" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: 20 }}>
                    Sažetak narudžbe
                  </h4>
                  {[
                    { label: "Milwaukee M18 Set", value: "69,90 KM" },
                    { label: "Dostava",            value: "10,00 KM" },
                    { label: "Plaćanje",           value: "Pouzećem" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                      <span style={{ fontSize: 14, fontFamily: INTER, color: C.muted }}>{label}</span>
                      <span style={{ fontSize: 14, fontFamily: INTER, fontWeight: 600, color: C.black }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                    <span className="mw-h" style={{ fontSize: 17, fontWeight: 700, color: C.black }}>Ukupno</span>
                    <span className="mw-h" style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color: C.black, lineHeight: 1 }}>
                      79,90 KM
                    </span>
                  </div>
                </div>

                {[
                  { Icon: CreditCard, text: "Plaćanje pouzećem pri preuzimanju" },
                  { Icon: Lock,       text: "Sigurna narudžba"                  },
                  { Icon: Truck,      text: "Dostava 1–3 radna dana"            },
                ].map(({ Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 16px", marginBottom: 8 }}>
                    <Icon size={16} strokeWidth={2} style={{ color: C.black, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontFamily: INTER, color: C.muted }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          8. FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer style={{ background: C.black, padding: "28px 24px" }}>
        <div style={{ maxWidth: MAXW, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span className="mw-h" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: C.white }}>
            cartly<span style={{ color: C.red }}>.</span>ba
          </span>
          <p style={{ fontSize: 13, fontFamily: INTER, color: "rgba(255,255,255,0.35)" }}>
            © 2026 — Dostava 1–3 radna dana. Plaćanje pouzećem.
          </p>
        </div>
      </footer>

    </div>
  );
}
