"use client";

import { useState, useEffect, FormEvent } from "react";
import { event } from "@/lib/fbpixel";
import { track } from "@vercel/analytics";
import Link from "next/link";

// ─── Constants ───────────────────────────────────────────────────────────────

const PRICE = 69.9;
const DELIVERY = 10.0;

const COLORS = [
  { id: "tamno-zelena", label: "Tamno Zelena", hex: "#1B4332", light: "#D1FAE5" },
  { id: "bordo",        label: "Bordo",        hex: "#7B1D2A", light: "#FCE7EB" },
  { id: "crna",         label: "Crna",         hex: "#1A1A1A", light: "#F3F3F3" },
] as const;

type ColorId = typeof COLORS[number]["id"];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "Premium čelik okvir",
    desc: "Robusna čelična konstrukcija podnosi do 150 kg",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 12l2.5 2.5L16 9"/>
      </svg>
    ),
    title: "UV otporna tkanina",
    desc: "Polimer tkanina ne gubi boju na suncu",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
    title: "5 pozicija naslona",
    desc: "Od ležanja do sjedenja — lako podešavanje",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: "Ergonomski dizajn",
    desc: "Anatomski oblik za višesatno opuštanje",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: "Lako sklapanje",
    desc: "Složi se za 10 sekundi · idealno za transport",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
      </svg>
    ),
    title: "Povrat 14 dana",
    desc: "Garancija zadovoljstva ili novac nazad",
  },
];

// ─── Sun SVG decoration ──────────────────────────────────────────────────────

function SunDecor({ size = 200, opacity = 0.06 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={{ opacity }}>
      <circle cx="100" cy="100" r="40" fill="#F59E0B"/>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 100 + 52 * Math.cos(angle);
        const y1 = 100 + 52 * Math.sin(angle);
        const x2 = 100 + 72 * Math.cos(angle);
        const y2 = 100 + 72 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>;
      })}
    </svg>
  );
}

function WaveDivider({ color = "#FFF9F0", flip = false }: { color?: string; flip?: boolean }) {
  return (
    <div style={{ lineHeight: 0, transform: flip ? "scaleY(-1)" : undefined }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60 }}>
        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill={color}/>
      </svg>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LezaljkaPage() {
  const [selectedColor, setSelectedColor] = useState<ColorId>("tamno-zelena");
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [floatVisible, setFloatVisible] = useState(false);
  const [viewers, setViewers] = useState(0);

  const activeColor = COLORS.find(c => c.id === selectedColor)!;
  const total = PRICE * qty + DELIVERY;

  useEffect(() => {
    const t = setTimeout(() => setFloatVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const r = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setViewers(r(28, 67));
    const id = setInterval(() => setViewers(v => Math.min(90, Math.max(18, v + r(-2, 3)))), r(20000, 35000));
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    event("ViewContent", { content_name: "Premium Lezaljka", value: PRICE, currency: "BAM" });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = "Unesite ime i prezime";
    if (!phone.trim())   e.phone   = "Unesite broj telefona";
    else if (!/^[\d\s+\-()]{7,}$/.test(phone)) e.phone = "Neispravan broj";
    if (!address.trim()) e.address = "Unesite adresu";
    if (!city.trim())    e.city    = "Unesite grad";
    if (!zip.trim())     e.zip     = "Unesite poštanski broj";
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setServerError(null);
    const externalId = (() => { try { return localStorage.getItem("_crt_eid") || ""; } catch { return ""; } })();
    try {
      const res = await fetch("/api/lezaljka-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime: name, telefon: phone, adresa: address, grad: city, postanski_broj: zip, boja: selectedColor, kolicina: qty, externalId }),
      });
      const data = await res.json();
      if (data.success) {
        track("lezaljka_order", { color: selectedColor, qty, total });
        event("Purchase", { value: total, currency: "BAM", content_name: "Premium Lezaljka", content_ids: ["lezaljka"], content_type: "product", num_items: qty }, data.orderNumber);
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerError(data.error ?? "Greška. Pokušajte ponovo.");
      }
    } catch {
      setServerError("Greška. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToOrder = () => {
    event("AddToCart", { content_name: "Premium Lezaljka", value: PRICE, currency: "BAM" });
    document.getElementById("naruci")?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#F0FDF4 0%,#DCFCE7 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: 28, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Hvala, {name.split(" ")[0]}!
          </h2>
          <p style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 16, color: "#555", lineHeight: 1.6, margin: "0 0 28px" }}>
            Narudžba primljena. Javit ćemo se na <strong>{phone}</strong> u roku od 24h.
          </p>
          <Link href="/" style={{ display: "inline-block", background: "#1B4332", color: "#fff", padding: "14px 28px", borderRadius: 12, fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Nazad na početnu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes lz-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes lz-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes lz-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes lz-sun-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .lz-live { animation: lz-pulse 2s ease-in-out infinite; }
        .lz-float-chair { animation: lz-float 4s ease-in-out infinite; }
        .lz-inp {
          width:100%; border:1.5px solid #E2E2E2; border-radius:10px;
          padding:13px 14px; font-size:15px; font-family:var(--font-manrope),sans-serif;
          outline:none; background:#fff; box-sizing:border-box; color:#0A0A0A; transition:border-color 130ms;
        }
        .lz-inp:focus { border-color:#1B4332; }
        .lz-inp.err { border-color:#ef4444; }
        .lz-em { font-size:11px;color:#ef4444;margin:3px 0 0;font-family:var(--font-manrope),sans-serif; }
        .lz-sub {
          width:100%;border:none;border-radius:14px;padding:18px;
          font-family:var(--font-manrope),sans-serif;font-weight:800;font-size:17px;
          cursor:pointer;transition:all 150ms;color:#fff;
        }
        .lz-sub:hover { filter:brightness(0.9); transform:translateY(-1px); }
        .lz-sub:disabled { opacity:.55;cursor:not-allowed;transform:none; }
        .lz-color-btn {
          border-radius:14px;border:2.5px solid transparent;
          cursor:pointer;padding:16px;transition:all 180ms;
          display:flex;flex-direction:column;align-items:center;gap:10px;
          background:#fff;
        }
        .lz-color-btn:hover { transform:translateY(-2px); }
        .lz-color-btn.active { border-color:currentColor;box-shadow:0 4px 20px rgba(0,0,0,0.12); }
        .lz-qty-btn {
          width:36px;height:36px;border-radius:9px;border:1.5px solid #E0E0E0;
          background:#fff;font-size:20px;font-weight:700;color:#444;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;padding:0;flex-shrink:0;transition:all 120ms;
          font-family:var(--font-manrope),sans-serif;line-height:1;
        }
        .lz-qty-btn:hover { border-color:#1B4332;background:#1B4332;color:#fff; }
        .lz-qty-btn:disabled { opacity:.3;cursor:not-allowed; }
        .lz-fcta {
          position:fixed;bottom:0;left:0;right:0;z-index:9998;
          background:#fff;border-top:1px solid #EBEBEB;
          padding:10px 16px;padding-bottom:calc(10px + env(safe-area-inset-bottom));
          display:flex;align-items:center;gap:12px;
          box-shadow:0 -4px 24px rgba(0,0,0,0.07);
          transition:transform 0.35s cubic-bezier(0.22,1,0.36,1),opacity 0.35s ease;
        }
        .lz-fcta.hidden { opacity:0;transform:translateY(100%);pointer-events:none; }
        @media (min-width:640px) {
          .lz-fcta { bottom:20px;left:auto;right:20px;border-radius:16px;border:1px solid #E8E8E8;padding:12px 16px;max-width:340px;box-shadow:0 8px 32px rgba(0,0,0,0.12); }
        }
        @media (max-width:640px) {
          .lz-form-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EBEBEB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#666", fontSize: 14, fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Nazad na početnu
          </Link>
          <button onClick={scrollToOrder} style={{ background: "#1B4332", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            Naruči odmah →
          </button>
        </div>
      </header>

      {/* ── TICKER ── */}
      <div style={{ background: "#1B4332", overflow: "hidden", padding: "9px 0" }}>
        <div style={{ display: "flex", gap: 48, animation: "lz-shimmer 0s linear infinite", whiteSpace: "nowrap" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0, paddingLeft: i === 0 ? "100vw" : 0 }}>
              ☀️ Ljetna akcija &nbsp;&nbsp;✦&nbsp;&nbsp; Dostava 10 KM &nbsp;&nbsp;✦&nbsp;&nbsp; Plaćanje pouzećem &nbsp;&nbsp;✦&nbsp;&nbsp; 3 premium boje &nbsp;&nbsp;✦&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(160deg,#FFFBEB 0%,#FEF3C7 40%,#FFF9F0 100%)", position: "relative", overflow: "hidden", paddingTop: 72, paddingBottom: 0 }}>

        {/* Sun decorations */}
        <div style={{ position: "absolute", top: -40, right: -40, pointerEvents: "none" }}>
          <SunDecor size={300} opacity={0.12} />
        </div>
        <div style={{ position: "absolute", bottom: 60, left: -60, pointerEvents: "none" }}>
          <SunDecor size={200} opacity={0.07} />
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

          {/* Live badge */}
          {viewers > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <span className="lz-live" style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#444", fontFamily: "var(--font-manrope), sans-serif" }}>
                <strong style={{ color: "#0A0A0A" }}>{viewers}</strong> osoba trenutno gleda
              </span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>

            {/* Left: text */}
            <div>
              <p style={{ margin: "0 0 14px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#D97706" }}>
                Premium lezaljka · Ljetna kolekcija
              </p>
              <h1 style={{ margin: "0 0 20px", fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: "clamp(38px,5vw,62px)", lineHeight: 1.05, letterSpacing: "-0.035em", color: "#0A0A0A" }}>
                Opusti se u<br />
                <span style={{ color: "#1B4332" }}>pravom stilu</span>
              </h1>
              <p style={{ margin: "0 0 32px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 17, color: "#555", lineHeight: 1.65 }}>
                Premium lezaljka s UV otpornom tkaninom, čeličnim okvirom i 5 pozicija naslona.
                Dostupna u <strong style={{ color: "#0A0A0A" }}>3 ekskluzivne boje</strong> — savršena za baštu, terasu ili bazen.
              </p>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 32 }}>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: 52, color: "#0A0A0A", letterSpacing: "-0.04em", lineHeight: 1 }}>69,90 KM</span>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 18, color: "rgba(0,0,0,0.3)", textDecoration: "line-through" }}>129,90 KM</span>
                <span style={{ background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 800, padding: "5px 10px", borderRadius: 7, fontFamily: "var(--font-manrope), sans-serif" }}>−46%</span>
              </div>

              {/* Color picker mini */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#888" }}>Boja:</span>
                {COLORS.map(c => (
                  <button key={c.id} onClick={() => setSelectedColor(c.id)} title={c.label} style={{
                    width: 28, height: 28, borderRadius: "50%", background: c.hex,
                    border: selectedColor === c.id ? `3px solid ${c.hex}` : "3px solid transparent",
                    outline: selectedColor === c.id ? `2px solid ${c.hex}` : "2px solid transparent",
                    outlineOffset: 2,
                    cursor: "pointer", transition: "all 150ms",
                  }} />
                ))}
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 14, fontWeight: 700, color: "#0A0A0A", marginLeft: 4 }}>{activeColor.label}</span>
              </div>

              <button onClick={scrollToOrder} style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "#1B4332", color: "#fff", border: "none", borderRadius: 14,
                padding: "17px 32px", fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: 800, fontSize: 17, cursor: "pointer", letterSpacing: "0.01em",
                boxShadow: "0 8px 32px rgba(27,67,50,0.3)", transition: "all 180ms",
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                ☀️ Naruči odmah
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <p style={{ margin: "12px 0 0", fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#AAA" }}>
                Pouzećem · Bez kartice · Dostava 10 KM
              </p>
            </div>

            {/* Right: chair visual */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
              <div className="lz-float-chair" style={{ position: "relative" }}>
                {/* Glow */}
                <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", width: "80%", height: 40, background: `radial-gradient(ellipse, ${activeColor.hex}40 0%, transparent 70%)`, filter: "blur(12px)", transition: "background 400ms" }} />
                {/* Chair SVG illustration */}
                <svg width="340" height="300" viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Shadow */}
                  <ellipse cx="170" cy="285" rx="100" ry="10" fill="rgba(0,0,0,0.08)"/>
                  {/* Chair base/legs */}
                  <rect x="60" y="200" width="12" height="70" rx="6" fill={activeColor.hex} opacity="0.9"/>
                  <rect x="268" y="200" width="12" height="70" rx="6" fill={activeColor.hex} opacity="0.9"/>
                  <rect x="80" y="240" width="12" height="40" rx="6" fill={activeColor.hex} opacity="0.7"/>
                  <rect x="248" y="240" width="12" height="40" rx="6" fill={activeColor.hex} opacity="0.7"/>
                  {/* Cross bars */}
                  <rect x="60" y="260" width="220" height="8" rx="4" fill={activeColor.hex} opacity="0.5"/>
                  <rect x="60" y="230" width="220" height="6" rx="3" fill={activeColor.hex} opacity="0.4"/>
                  {/* Main seat frame */}
                  <rect x="55" y="155" width="230" height="20" rx="8" fill={activeColor.hex}/>
                  {/* Seat fabric */}
                  <rect x="60" y="160" width="220" height="12" rx="4" fill={activeColor.hex} opacity="0.6"/>
                  {/* Backrest frame */}
                  <path d="M60 160 Q90 80 170 60 Q250 80 280 160" stroke={activeColor.hex} strokeWidth="18" strokeLinecap="round" fill="none"/>
                  {/* Backrest fabric */}
                  <path d="M72 157 Q96 87 170 68 Q244 87 268 157" stroke={activeColor.hex} strokeWidth="8" strokeLinecap="round" strokeOpacity="0.5" fill="none"/>
                  {/* Fabric stripes */}
                  {[90, 110, 130, 150, 170, 190, 210, 230, 250].map((x, i) => (
                    <line key={i} x1={x} y1="155" x2={x} y2="172" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
                  ))}
                  {/* Headrest */}
                  <ellipse cx="170" cy="58" rx="38" ry="18" fill={activeColor.hex}/>
                  <ellipse cx="170" cy="58" rx="30" ry="12" fill={activeColor.hex} opacity="0.6"/>
                  {/* Armrests */}
                  <rect x="42" y="145" width="28" height="12" rx="6" fill={activeColor.hex}/>
                  <rect x="270" y="145" width="28" height="12" rx="6" fill={activeColor.hex}/>
                  {/* Sun reflection */}
                  <circle cx="220" cy="90" r="8" fill="rgba(255,255,255,0.2)"/>
                </svg>
                {/* Color label */}
                <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderRadius: 100, padding: "6px 16px", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: activeColor.hex, flexShrink: 0, transition: "background 400ms" }} />
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 12, color: "#0A0A0A", transition: "all 300ms" }}>{activeColor.label}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile hero — stacked */}
        <style suppressHydrationWarning>{`
          @media (max-width: 768px) {
            .lz-hero-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
            .lz-hero-chair { display: none !important; }
          }
        `}</style>

        <WaveDivider color="#fff" />
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ margin: "0 0 8px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#D97706" }}>Zašto baš ova lezaljka?</p>
            <h2 style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: "clamp(28px,4vw,42px)", color: "#0A0A0A", letterSpacing: "-0.03em" }}>Napravljena za pravo opuštanje</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: "#FAFAFA", border: "1px solid #F0F0F0", borderRadius: 16, padding: "24px 22px", display: "flex", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F0FAF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#1B4332" }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 15, color: "#0A0A0A", marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#777", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLOR PICKER SECTION ── */}
      <section style={{ background: "linear-gradient(160deg,#FFFBEB 0%,#FEF3C7 100%)", padding: "72px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, pointerEvents: "none" }}>
          <SunDecor size={280} opacity={0.09} />
        </div>
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ margin: "0 0 8px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#D97706" }}>Odaberi svoju boju</p>
            <h2 style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: "clamp(26px,3.5vw,38px)", color: "#0A0A0A", letterSpacing: "-0.03em" }}>3 ekskluzivne boje</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {COLORS.map(c => (
              <button key={c.id} className={`lz-color-btn${selectedColor === c.id ? " active" : ""}`} onClick={() => setSelectedColor(c.id)} style={{ color: c.hex }}>
                {/* Chair preview dot */}
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: c.hex, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${c.hex}44` }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="rgba(255,255,255,0.15)"/>
                  </svg>
                </div>
                <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 15, color: "#0A0A0A" }}>{c.label}</div>
                {selectedColor === c.id && (
                  <div style={{ background: c.hex, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, fontFamily: "var(--font-manrope), sans-serif" }}>
                    Odabrano ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: "#0A0A0A", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40 }}>
          {[
            { num: "1.400+", label: "zadovoljnih kupaca" },
            { num: "4,9 ★", label: "prosječna ocjena" },
            { num: "3 boje", label: "ekskluzivnih opcija" },
            { num: "14 dana", label: "garancija povrata" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: 32, color: "#fff", letterSpacing: "-0.03em" }}>{s.num}</div>
              <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ORDER FORM ── */}
      <section id="naruci" style={{ background: "#F9F9F9", borderTop: "1px solid #EBEBEB", padding: "72px 24px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ margin: "0 0 8px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#D97706" }}>
              ☀️ Naruči odmah
            </p>
            <h2 style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: "clamp(24px,3.5vw,36px)", color: "#0A0A0A", letterSpacing: "-0.03em" }}>
              Popuni narudžbu
            </h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* Contact fields */}
            <div className="lz-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {([
                { k: "name",    l: "Ime i prezime *",   p: "Npr. Amir Begović",  t: "text", v: name,    s: setName },
                { k: "phone",   l: "Broj telefona *",   p: "Npr. 061 234 567",   t: "tel",  v: phone,   s: setPhone },
                { k: "address", l: "Adresa dostave *",  p: "Npr. Ferhadija 1",   t: "text", v: address, s: setAddress },
                { k: "city",    l: "Grad *",            p: "Npr. Sarajevo",      t: "text", v: city,    s: setCity },
                { k: "zip",     l: "Poštanski broj *",  p: "Npr. 71000",         t: "text", v: zip,     s: setZip },
              ] as const).map(f => (
                <div key={f.k} style={f.k === "name" || f.k === "address" ? { gridColumn: "1 / -1" } : {}}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#666", fontFamily: "var(--font-manrope), sans-serif", display: "block", marginBottom: 5 }}>{f.l}</label>
                  <input type={f.t} value={f.v} placeholder={f.p}
                    onChange={e => { (f.s as (v: string) => void)(e.target.value); setErrors(er => ({ ...er, [f.k]: "" })); }}
                    className={`lz-inp${errors[f.k] ? " err" : ""}`}
                  />
                  {errors[f.k] && <p className="lz-em">{errors[f.k]}</p>}
                </div>
              ))}
            </div>

            {/* Color + qty picker */}
            <div style={{ background: "#fff", border: "1.5px solid #E8E8E8", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #F0F0F0" }}>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>Odaberi boju i količinu</span>
              </div>
              <div style={{ padding: "16px 18px" }}>
                {/* Color select */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <button key={c.id} type="button" onClick={() => setSelectedColor(c.id)} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                      border: `2px solid ${selectedColor === c.id ? c.hex : "#E0E0E0"}`,
                      borderRadius: 10, background: selectedColor === c.id ? c.light : "#fff",
                      cursor: "pointer", transition: "all 150ms", fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: selectedColor === c.id ? 700 : 500, fontSize: 14,
                      color: selectedColor === c.id ? c.hex : "#555",
                    }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: c.hex, flexShrink: 0 }} />
                      {c.label}
                      {selectedColor === c.id && <span style={{ fontSize: 12 }}>✓</span>}
                    </button>
                  ))}
                </div>

                {/* Qty */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 14, color: "#444" }}>Količina</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button type="button" className="lz-qty-btn" disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 20, color: "#1B4332", minWidth: 24, textAlign: "center" }}>{qty}</span>
                    <button type="button" className="lz-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {serverError && (
              <p style={{ fontSize: 13, color: "#ef4444", background: "#fef2f2", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontFamily: "var(--font-manrope), sans-serif" }}>{serverError}</p>
            )}

            {/* Price breakdown */}
            <div style={{ borderTop: "1px solid #EBEBEB", paddingTop: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#888" }}>{qty} × 69,90 KM</span>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#555" }}>{(qty * PRICE).toFixed(2).replace(".", ",")} KM</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#888", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  Dostava Euro Express
                </span>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#555" }}>10,00 KM</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 15, color: "#0A0A0A" }}>Ukupno</span>
                <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: 28, color: "#0A0A0A", letterSpacing: "-0.03em" }}>{total.toFixed(2).replace(".", ",")} KM</span>
              </div>
            </div>

            <button type="submit" className="lz-sub" disabled={loading} style={{ background: activeColor.hex }}>
              {loading ? "Slanje..." : `☀️ Pošalji narudžbu · ${total.toFixed(2).replace(".", ",")} KM`}
            </button>
            <p style={{ fontSize: 11, color: "#BBBBBB", textAlign: "center", marginTop: 10, fontFamily: "var(--font-manrope), sans-serif" }}>
              Plaćanje pouzećem · Bez kartice · Povrat 14 dana
            </p>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0A0A0A", padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          © 2025 Cartly.ba · Sve narudžbe se isporučuju diljem BiH
        </p>
      </footer>

      {/* ── FLOATING CTA ── */}
      <div className={`lz-fcta${!floatVisible ? " hidden" : ""}`}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <span className="lz-live" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22c55e", fontFamily: "var(--font-manrope), sans-serif" }}>Na stanju</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
            <span style={{ fontSize: 19, fontWeight: 900, color: "#0A0A0A", fontFamily: "var(--font-manrope), sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>69,90 KM</span>
            <span style={{ fontSize: 12, color: "#BBBBBB", textDecoration: "line-through", fontFamily: "var(--font-manrope), sans-serif" }}>129,90</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#1B4332", background: "#D1FAE5", border: "1px solid rgba(27,67,50,0.2)", borderRadius: 5, padding: "2px 6px", fontFamily: "var(--font-manrope), sans-serif" }}>−46%</span>
          </div>
          <div style={{ fontSize: 10, color: "#AAAAAA", fontFamily: "var(--font-manrope), sans-serif", marginTop: 1 }}>Pouzećem · Dostava 10 KM</div>
        </div>
        <button onClick={scrollToOrder} style={{
          flexShrink: 0, background: "#1B4332", color: "#fff", border: "none", borderRadius: 11,
          padding: "12px 18px", fontSize: 14, fontWeight: 800, fontFamily: "var(--font-manrope), sans-serif",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
        }}>
          Naruči
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </>
  );
}
