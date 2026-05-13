"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Image from "next/image";
import { event } from "@/lib/fbpixel";
import SocialProofToast from "./SocialProofToast";
import FloatingCTA from "./FloatingCTA";
import OrderSuccess from "@/components/OrderSuccess";

const ACCENT = "#FF6B00";

const IMAGES = [
  { src: "/celicnacetka.jpeg", alt: "Čelična Četka za Trimer — glavni prikaz" },
  { src: "/celicnacetka1.jpg", alt: "Čelična Četka za Trimer — detalj četke" },
  { src: "/1.jpg",             alt: "Čelična Četka za Trimer — montaža" },
  { src: "/2.jpg",             alt: "Čelična Četka za Trimer — u upotrebi" },
];

const PRICE_BASE  = 19.90;
const PRICE_EXTRA = 19.90;
const PRICE_OLD   = 39.90;
const DELIVERY    = 10.00;

const TRUST = [
  {
    label: "Plaćanje pouzećem",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Dostava 10 KM",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    label: "Povrat 14 dana",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
      </svg>
    ),
  },
  {
    label: "Dostava po BiH",
    svg: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: "Čelične žice visoke čvrstoće",
    desc:  "Kaljeni čelik koji odolijevaju najtvrdokornijem korovu, suhoj travi i korijenju.",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: "Odgovara svim trimerima",
    desc:  "Univerzalni adapter — montaža za manje od 60 sekundi na bilo koji standardni trimer.",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    title: "Eliminira korov iz korijena",
    desc:  "Reže i iskopava duboko ukorijenjeni korov tamo gdje obična nit ne može doći.",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    title: "Sigurna i balansirana rotacija",
    desc:  "Dizajnirana za minimalne vibracije — nema bacanja debrisa, nema opasnosti.",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    title: "Traje 10× duže od niti",
    desc:  "Nema više stalnih zamjena. Čelična četka traje cijelu sezonu bez habanja.",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    title: "Profesionalni rezultati",
    desc:  "Koriste je profesionalni vrtlari i komunalna preduzeća širom Bosne i Hercegovine.",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

const REVIEWS = [
  {
    name:   "Adnan H.",
    city:   "Sarajevo",
    rating: 5,
    text:   "Konačno nešto što stvarno radi! Korov ispod ograde nikako nisam mogao pokositi, probao sam sve. Ova četka je to riješila za 10 minuta. Naručio sam za tasta i za sebe, obojica smo oduševljeni. Dostava stigla drugi dan.",
    date:   "12. april 2026.",
  },
  {
    name:   "Emir K.",
    city:   "Tuzla",
    rating: 5,
    text:   "Nisam bio siguran hoće li odgovarati na moj Stihl trimer, ali odgovaralo je savršeno. Montaža 5 minuta. Razlika je ogromna — više ne kupujem niti uopće. Preporučam svima koji imaju problem sa korovom uz zidove i ivičnjake.",
    date:   "19. april 2026.",
  },
  {
    name:   "Nermin J.",
    city:   "Zenica",
    rating: 5,
    text:   "1+1 gratis je odlično, jednu poklonio bratu. Obojica koristimo već skoro mjesec i nema ni traga habanja. Za ovu cijenu je besmisleno ne naručiti. Iskreno nisam očekivao ovoliko od ovako jeftine stvari.",
    date:   "25. april 2026.",
  },
  {
    name:   "Damir P.",
    city:   "Mostar",
    rating: 5,
    text:   "Radio sam u komunalnom preduzeću 15 godina i nikad nismo imali ovako nešto dostupno na tržištu BiH. Odličan alat, solidna izrada. Jedino mi je žao što nisam ranije znao za ovo.",
    date:   "3. maj 2026.",
  },
  {
    name:   "Tarik M.",
    city:   "Banja Luka",
    rating: 5,
    text:   "Moja žena mi kupila za Birthday i bio sam skeptičan iskreno. Ali kad sam probao — nestvaran osjećaj moći! Travnjak izgleda fantastično. Naručujem drugu za rezervu odmah.",
    date:   "7. maj 2026.",
  },
  {
    name:   "Sanel B.",
    city:   "Visoko",
    rating: 5,
    text:   "Brza dostava, dobro upakovano, četka čvrsta i solidna. Montiralo se lako, radilo odmah. Moj Dolmar trimer plus ova četka = savršena kombinacija. 10/10.",
    date:   "9. maj 2026.",
  },
];

type Fields = { name: string; phone: string; address: string; city: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

function InputField({
  id, label, type = "text", autoComplete, placeholder, value, onChange, error,
}: {
  id: keyof Fields; label: string; type?: string; autoComplete?: string;
  placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>
        {label}
      </label>
      <input
        id={id} name={id} type={type} autoComplete={autoComplete}
        placeholder={placeholder} value={value} onChange={onChange}
        style={{
          background:   "#FFFFFF",
          border:       `1.5px solid ${error ? "#ef4444" : "#E5E5E5"}`,
          borderRadius: 10,
          padding:      "14px 16px",
          fontSize:     15,
          fontFamily:   "var(--font-manrope), sans-serif",
          outline:      "none",
          transition:   "border-color 0.15s",
          width:        "100%",
          boxSizing:    "border-box" as const,
          color:        "#0A0A0A",
        }}
        onFocus={e  => { e.currentTarget.style.borderColor = ACCENT; }}
        onBlur={e   => { e.currentTarget.style.borderColor = error ? "#ef4444" : "#E5E5E5"; }}
      />
      {error && <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>}
    </div>
  );
}

export default function CetkaClient() {
  const [imgIndex,   setImgIndex]   = useState(0);
  const [secs,       setSecs]       = useState<number | null>(null);
  const [viewers,    setViewers]    = useState(0);
  const [extraSet,   setExtraSet]   = useState(false);
  const [fields,     setFields]     = useState<Fields>({ name: "", phone: "", address: "", city: "" });
  const [errors,     setErrors]     = useState<FieldErrors>({});
  const [loading,    setLoading]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [serverError,setServerError]= useState<string | null>(null);

  const touchStartX     = useRef<number | null>(null);
  const checkoutTracked = useRef(false);

  const productTotal = extraSet ? PRICE_BASE + PRICE_EXTRA : PRICE_BASE;
  const grandTotal   = productTotal + DELIVERY;

  /* countdown */
  useEffect(() => {
    const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setSecs(rand(12, 48) * 60);
    const id = setInterval(() => {
      setSecs(prev => {
        if (prev === null) return null;
        if (prev <= 1) return rand(15, 44) * 60;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* viewer count */
  useEffect(() => {
    const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setViewers(rand(18, 47));
    const id = setInterval(() => {
      setViewers(v => Math.max(12, Math.min(58, v + (Math.random() > 0.45 ? 1 : -1))));
    }, 7000);
    return () => clearInterval(id);
  }, []);

  function fmtTime(s: number) {
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  }

  const prev = () => setImgIndex(i => (i - 1 + IMAGES.length) % IMAGES.length);
  const next = () => setImgIndex(i => (i + 1) % IMAGES.length);

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!fields.name.trim())    e.name    = "Unesite ime i prezime";
    if (!fields.phone.trim())   e.phone   = "Unesite broj telefona";
    if (!fields.address.trim()) e.address = "Unesite adresu";
    if (!fields.city.trim())    e.city    = "Unesite grad";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    if (!checkoutTracked.current) {
      event("InitiateCheckout", { content_name: "Čelična Četka za Trimer", value: grandTotal, currency: "BAM" });
      checkoutTracked.current = true;
    }
    setLoading(true);
    setServerError(null);
    try {
      const res  = await fetch("/api/cetka-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime: fields.name, telefon: fields.phone, adresa: fields.address, grad: fields.city, extraSet }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Greška");
      event("Purchase", { content_name: "Čelična Četka za Trimer", value: grandTotal, currency: "BAM", num_items: extraSet ? 2 : 1 });
      setSubmitted(true);
    } catch {
      setServerError("Došlo je do greške. Pokušajte ponovo ili nas kontaktirajte.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return <OrderSuccess />;

  return (
    <>
      <SocialProofToast />
      <FloatingCTA />

      <style suppressHydrationWarning>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.7)} }

        .cetka-thumb { transition: border-color 0.15s, opacity 0.15s; }
        .cetka-thumb:hover { opacity: 0.85; }

        .feature-card { transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(255,107,0,0.10); border-color: rgba(255,107,0,0.25) !important; }

        .review-card { transition: transform 220ms ease, box-shadow 220ms ease; }
        .review-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,0.08); }

        .cta-btn { transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
        .cta-btn:hover { opacity: 0.93; transform: translateY(-1px); box-shadow: 0 12px 36px rgba(255,80,0,0.45) !important; }
        .cta-btn:active { transform: scale(0.97); }

        @media (max-width: 1024px) {
          .gallery-grid-4 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .order-cols { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
          .gallery-grid-4 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "clamp(32px,5vw,72px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="hero-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(24px,4vw,64px)",
            alignItems: "start",
          }}>

            {/* ── Image slider ── */}
            <div>
              <div
                style={{
                  borderRadius: 20,
                  overflow:     "hidden",
                  background:   "#F5F5F3",
                  border:       "1px solid rgba(0,0,0,0.08)",
                  aspectRatio:  "1 / 1",
                  position:     "relative",
                  boxShadow:    "0 4px 32px rgba(0,0,0,0.09)",
                }}
                onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={e => {
                  if (touchStartX.current === null) return;
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  if (Math.abs(dx) > 40) { if (dx < 0) { next(); } else { prev(); } }
                  touchStartX.current = null;
                }}
              >
                <Image
                  key={imgIndex}
                  src={IMAGES[imgIndex].src}
                  alt={IMAGES[imgIndex].alt}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={imgIndex === 0}
                />

                {/* arrows */}
                {([prev, next] as const).map((fn, di) => (
                  <button key={di} onClick={fn}
                    aria-label={di === 0 ? "Prethodna" : "Sljedeća"}
                    style={{
                      position: "absolute", top: "50%",
                      [di === 0 ? "left" : "right"]: 12,
                      transform: "translateY(-50%)",
                      width: 38, height: 38, borderRadius: "50%",
                      background: "rgba(255,255,255,0.92)",
                      border: "1px solid rgba(0,0,0,0.10)",
                      color: "#0A0A0A", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)", zIndex: 2,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {di === 0 ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
                    </svg>
                  </button>
                ))}

                {/* badges */}
                <div style={{
                  position: "absolute", top: 14, left: 14,
                  background: ACCENT, color: "#fff",
                  fontSize: 12, fontWeight: 800, borderRadius: 8,
                  padding: "5px 11px", zIndex: 2,
                  boxShadow: "0 3px 10px rgba(255,107,0,0.35)",
                }}>1+1 GRATIS</div>

                <div style={{
                  position: "absolute", top: 14, right: 14,
                  background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
                  color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 600,
                  borderRadius: 7, padding: "5px 9px", zIndex: 2,
                  textDecoration: "line-through",
                }}>{fmt(PRICE_OLD)}</div>
              </div>

              {/* thumbnails */}
              <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
                {IMAGES.map((img, i) => (
                  <button key={i} onClick={() => setImgIndex(i)} className="cetka-thumb"
                    style={{
                      width: 60, height: 60, borderRadius: 10, overflow: "hidden",
                      border: `2px solid ${i === imgIndex ? ACCENT : "rgba(0,0,0,0.10)"}`,
                      cursor: "pointer", position: "relative",
                      background: "#F5F5F3", flexShrink: 0, padding: 0,
                    }}
                  >
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} sizes="60px" />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Text side ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: ACCENT,
              }}>
                Vrtlarstvo · Profesionalni alat
              </span>

              <h1 style={{
                fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 900,
                color: "#0A0A0A", letterSpacing: "-0.03em", lineHeight: 1.08,
                margin: 0, fontFamily: "var(--font-manrope), sans-serif",
              }}>
                Čelična Četka<br />
                <span style={{ color: ACCENT }}>za Trimer</span>
              </h1>

              <p style={{ fontSize: 16, color: "#5A5A5A", lineHeight: 1.65, margin: 0 }}>
                Profesionalna čelična četka eliminira korov, suhu travu i korijenje — bez habanja, bez pauzi. Jedan alat, trajni rezultati.
              </p>

              {/* Viewer count */}
              {viewers > 0 && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(255,107,0,0.06)",
                  border: "1px solid rgba(255,107,0,0.15)",
                  borderRadius: 8, padding: "7px 12px",
                  width: "fit-content",
                }}>
                  <span style={{
                    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                    background: "#FF6B00",
                    animation: "pulse-dot 1.8s ease-in-out infinite",
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>
                    <strong>{viewers}</strong> osoba trenutno gleda ovaj proizvod
                  </span>
                </div>
              )}

              {/* Price block */}
              <div style={{
                background: "#FAFAF7",
                border: "1.5px solid rgba(0,0,0,0.08)",
                borderRadius: 18, padding: "22px",
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                {/* price row */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                  <span style={{
                    fontSize: "clamp(36px,5vw,54px)", fontWeight: 900,
                    color: "#0A0A0A", letterSpacing: "-0.04em", lineHeight: 1,
                    fontFamily: "var(--font-manrope), sans-serif",
                  }}>
                    {fmt(PRICE_BASE)}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", paddingBottom: 4 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 600,
                      color: "#AAAAAA", textDecoration: "line-through", lineHeight: 1.3,
                    }}>{fmt(PRICE_OLD)}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", letterSpacing: "0.02em" }}>
                      −50% POPUST
                    </span>
                  </div>
                </div>

                {/* countdown */}
                {secs !== null && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 9,
                    background: "rgba(255,107,0,0.07)",
                    border: "1px solid rgba(255,107,0,0.18)",
                    borderRadius: 10, padding: "9px 14px",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
                      Akcijska cijena ističe za:
                    </span>
                    <span style={{
                      fontSize: 14, fontWeight: 800, color: ACCENT,
                      fontFamily: "var(--font-manrope), sans-serif",
                      letterSpacing: "0.04em", marginLeft: "auto",
                    }}>
                      {fmtTime(secs)}
                    </span>
                  </div>
                )}

                {/* 1+1 highlight */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 9,
                  background: "rgba(22,163,74,0.07)",
                  border: "1px solid rgba(22,163,74,0.2)",
                  borderRadius: 10, padding: "9px 14px",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/>
                    <path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#16A34A" }}>
                    1+1 GRATIS — naručite jednu, dobijate dvije!
                  </span>
                </div>

                {/* CTA */}
                <a
                  href="#narudzba"
                  className="cta-btn"
                  onClick={() => event("AddToCart", { content_name: "Čelična Četka za Trimer", value: PRICE_BASE, currency: "BAM" })}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    background: `linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)`,
                    color: "#FFFFFF", fontWeight: 800, fontSize: 17,
                    borderRadius: 14, padding: "17px 0", textDecoration: "none",
                    boxShadow: "0 8px 28px rgba(255,80,0,0.32)",
                    letterSpacing: "-0.01em",
                    fontFamily: "var(--font-manrope), sans-serif",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Naruči odmah — 1+1 GRATIS
                </a>
              </div>

              {/* trust chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TRUST.map(t => (
                  <div key={t.label} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "#F5F5F3", border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 8, padding: "7px 12px",
                    fontSize: 12, fontWeight: 600, color: "#555",
                  }}>
                    <span style={{ color: ACCENT }}>{t.svg}</span>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F7F7F5", padding: "clamp(48px,7vw,88px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(32px,5vw,52px)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: ACCENT, display: "block", marginBottom: 12 }}>
              Zašto izabrati ovu četku
            </span>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0, fontFamily: "var(--font-manrope), sans-serif" }}>
              Jednom probaj, zauvijek ostani.
            </h2>
          </div>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(10px,1.5vw,18px)" }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card" style={{
                background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 18, padding: "clamp(18px,2.5vw,26px)",
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "rgba(255,107,0,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ACCENT, flexShrink: 0,
                }}>
                  {f.svg}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A", margin: 0, lineHeight: 1.3, fontFamily: "var(--font-manrope), sans-serif" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GALLERY / PRODUCT SHOWCASE ════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "clamp(48px,7vw,88px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px,4vw,48px)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: ACCENT, display: "block", marginBottom: 12 }}>
              Pogledaj izbliza
            </span>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0, fontFamily: "var(--font-manrope), sans-serif" }}>
              Četka koja radi tamo gdje ostali ne mogu.
            </h2>
          </div>

          {/* 4-card equal grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "clamp(8px, 1.5vw, 14px)",
          }} className="gallery-grid-4">

            {[
              { src: "/celicnacetka.jpeg",  label: "Čelične žice visokog kvaliteta", badge: null },
              { src: "/celicnacetka1.jpg",  label: null,                              badge: "1+1 GRATIS" },
              { src: "/1.jpg",              label: "Laka montaža",                   badge: null },
              { src: "/2.jpg",              label: "Profesionalni rezultati",         badge: null },
            ].map((item, i) => (
              <div key={i} style={{
                borderRadius: 18, overflow: "hidden",
                background: "#F5F5F3", position: "relative",
                aspectRatio: "3 / 4",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}>
                <Image
                  src={item.src}
                  alt={item.label || "Čelična četka za trimer"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                />
                {item.badge && (
                  <div style={{
                    position: "absolute", top: 12, left: 12,
                    background: ACCENT, color: "#fff",
                    fontSize: 11, fontWeight: 800, borderRadius: 7,
                    padding: "5px 10px",
                    boxShadow: "0 3px 10px rgba(255,107,0,0.35)",
                  }}>{item.badge}</div>
                )}
                {item.label && (
                  <div style={{
                    position: "absolute", bottom: 12, left: 12, right: 12,
                    background: "rgba(0,0,0,0.58)", backdropFilter: "blur(6px)",
                    color: "#fff", fontSize: 12, fontWeight: 700,
                    borderRadius: 8, padding: "7px 11px",
                  }}>{item.label}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#F7F7F5", padding: "clamp(48px,7vw,88px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px,4vw,48px)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: ACCENT, display: "block", marginBottom: 12 }}>Kako funkcionira</span>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0, fontFamily: "var(--font-manrope), sans-serif" }}>
              Tri koraka do savršenog vrta.
            </h2>
          </div>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(12px,2vw,24px)" }}>
            {[
              { step: "01", title: "Montiraj na trimer", desc: "Skinite staru nit ili disk i montirajte četku za manje od 60 sekundi — radi sa svim standardnim trimerima.", svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
              { step: "02", title: "Pokosi i iskopaj", desc: "Čelične žice sijeku najtvrdokorniji korov i iskopavaju korijenje tamo gdje obična nit ne može doći.", svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
              { step: "03", title: "Uživaj u rezultatima", desc: "Savršen travnjak bez herbicida. Četka traje cijelu sezonu bez zamjene — isplati se svakim danom.", svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
            ].map(s => (
              <div key={s.step} style={{
                background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 20, padding: "clamp(20px,3vw,32px)",
                display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 12, right: 18,
                  fontSize: 56, fontWeight: 900, color: "rgba(0,0,0,0.04)",
                  lineHeight: 1, fontFamily: "var(--font-manrope), sans-serif", userSelect: "none" as const,
                }}>{s.step}</div>
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: "rgba(255,107,0,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ACCENT, flexShrink: 0,
                }}>{s.svg}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", margin: 0, lineHeight: 1.3, fontFamily: "var(--font-manrope), sans-serif" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ═══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#FFFFFF", padding: "clamp(48px,7vw,88px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px,4vw,48px)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: ACCENT, display: "block", marginBottom: 12 }}>Recenzije kupaca</span>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0, fontFamily: "var(--font-manrope), sans-serif" }}>
              Šta kažu naši kupci.
            </h2>
            <p style={{ fontSize: 15, color: "#888", marginTop: 12, lineHeight: 1.6 }}>
              Hiljade zadovoljnih kupaca širom Bosne i Hercegovine.
            </p>
          </div>

          <div className="reviews-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(10px,1.5vw,18px)" }}>
            {REVIEWS.map(r => (
              <div key={r.name} className="review-card" style={{
                background: "#FAFAF7", border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 18, padding: "clamp(18px,2.5vw,26px)",
                display: "flex", flexDirection: "column", gap: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="0.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7, margin: 0, flex: 1 }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,107,0,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: ACCENT, flexShrink: 0,
                  }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0A" }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "#AAAAAA" }}>{r.city} · {r.date}</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                      textTransform: "uppercase" as const, color: "#16A34A",
                      background: "rgba(22,163,74,0.09)", borderRadius: 6, padding: "3px 7px",
                    }}>Verificiran</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ORDER FORM ════════════════════════════════════════════════════════════ */}
      <section id="narudzba" style={{ background: "#F7F7F5", padding: "clamp(48px,8vw,96px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: ACCENT, display: "block", marginBottom: 12 }}>Narudžba</span>
            <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.025em", lineHeight: 1.1, margin: "0 0 10px", fontFamily: "var(--font-manrope), sans-serif" }}>
              Naruči 1+1 GRATIS
            </h2>
            <p style={{ fontSize: 15, color: "#777", margin: 0, lineHeight: 1.6 }}>
              Plaćanje pouzećem · Dostava 10 KM · Cijelom BiH
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{
            background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 24, padding: "clamp(24px,4vw,40px)",
            display: "flex", flexDirection: "column", gap: 18,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          }}>
            <InputField id="name"    label="Ime i prezime"  autoComplete="name"           placeholder="Npr. Adnan Hasić"  value={fields.name}    onChange={e => setFields(f => ({ ...f, name:    e.target.value }))} error={errors.name}    />
            <InputField id="phone"   label="Broj telefona"  autoComplete="tel"            placeholder="Npr. 061 234 567" value={fields.phone}   onChange={e => setFields(f => ({ ...f, phone:   e.target.value }))} error={errors.phone}   />
            <InputField id="address" label="Ulica i broj"   autoComplete="street-address" placeholder="Npr. Titova 12"   value={fields.address} onChange={e => setFields(f => ({ ...f, address: e.target.value }))} error={errors.address} />
            <InputField id="city"    label="Grad / općina"  autoComplete="address-level2" placeholder="Npr. Sarajevo"    value={fields.city}    onChange={e => setFields(f => ({ ...f, city:    e.target.value }))} error={errors.city}    />

            {/* upsell */}
            <div
              onClick={() => setExtraSet(x => !x)}
              style={{
                background: extraSet ? "rgba(255,107,0,0.05)" : "#FAFAF7",
                border: `1.5px solid ${extraSet ? ACCENT : "rgba(0,0,0,0.10)"}`,
                borderRadius: 14, padding: "16px 18px", cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 7,
                  border: `2px solid ${extraSet ? ACCENT : "#CCCCCC"}`,
                  background: extraSet ? ACCENT : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.15s",
                }}>
                  {extraSet && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0A", lineHeight: 1.3 }}>
                    Da, želim još jedan set (2 četke)
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                    Ukupno 4 četke — savršeno za poklon ili rezervu · 19,90 KM
                  </div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: ACCENT, flexShrink: 0 }}>
                  +{fmt(PRICE_EXTRA)}
                </span>
              </div>
            </div>

            {/* summary */}
            <div style={{ background: "#F7F7F5", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <span style={{ fontSize: 13, color: "#666" }}>
                  {extraSet ? "2 seta (4 četke)" : "1 set (2 četke) — 1+1 GRATIS"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{fmt(productTotal)}</span>
              </div>
              <div style={{ padding: "11px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <span style={{ fontSize: 13, color: "#666" }}>Dostava</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{fmt(DELIVERY)}</span>
              </div>
              <div style={{ padding: "13px 16px", display: "flex", justifyContent: "space-between", background: "rgba(255,107,0,0.05)" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A" }}>UKUPNO</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: ACCENT, fontFamily: "var(--font-manrope), sans-serif" }}>
                  {fmt(grandTotal)}
                </span>
              </div>
            </div>

            {serverError && (
              <p style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#DC2626", margin: 0,
              }}>{serverError}</p>
            )}

            <button type="submit" disabled={loading} className="cta-btn" style={{
              background: loading ? "#CCC" : `linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)`,
              color: "#FFFFFF", fontWeight: 800, fontSize: 17,
              borderRadius: 14, padding: "17px 0", border: "none",
              cursor: loading ? "not-allowed" : "pointer", width: "100%",
              boxShadow: loading ? "none" : "0 8px 28px rgba(255,80,0,0.30)",
              fontFamily: "var(--font-manrope), sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              {loading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Slanje...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Naruči — Plaćanje pouzećem
                </>
              )}
            </button>

            <p style={{ fontSize: 12, color: "#AAAAAA", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
              Plaćate kuriru pri preuzimanju. Nema avansa. Dostava 24–48h.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
