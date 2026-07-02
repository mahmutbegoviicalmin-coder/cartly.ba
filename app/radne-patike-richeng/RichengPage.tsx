"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

/* ── Constants ───────────────────────────────────────────────────── */
const ACCENT  = "#B33000";
const F       = "var(--font-manrope, 'Inter', sans-serif)";
const PRICE   = 49.90;
const DELIVERY = 10;

const IMAGES = [
  { src: "/richeng/1.png", alt: "Richeng S3 · pogled sprijeda" },
  { src: "/richeng/2.png", alt: "Richeng S3 · detalj kapice" },
  { src: "/richeng/3.png", alt: "Richeng S3 · đon detalj" },
  { src: "/richeng/4.png", alt: "Richeng S3 · bočni pogled" },
];

const SIZES = [36,37,38,39,40,41,42,43,44,45,46,47];

const TRUST = [
  {
    label: "Plaćanje pouzećem",
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  },
  {
    label: "Dostava 10 KM",
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    label: "Povrat 14 dana",
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>,
  },
  {
    label: "S3 Certifikat",
    svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
];

const REVIEWS = [
  { name: "Kenan M.",   city: "Sarajevo",  rating: 5, role: "Elektro montažer",   text: "Naručio sam br. 43 i stigle za dva dana. Savršen fit, noga ne boli ni nakon 10 sati. Cijena je nevjerovatna za ovaj kvalitet." },
  { name: "Samir T.",   city: "Zenica",    rating: 5, role: "Fabrika metalnih d.", text: "Vodootporne su stvarno dobro — radio sam u kiši cijeli dan, stopala suha. Čelična kapica me već spasila jednom od lakše ozljede." },
  { name: "Adis H.",    city: "Tuzla",     rating: 5, role: "Građevinski radnik",  text: "Ove su mi među najboljima od par koje sam probao. Lagane su, ne grijete noge, protuklizne na vlažnoj podlozi." },
  { name: "Mirza K.",   city: "Mostar",    rating: 4, role: "Skladištar",          text: "Tačno kako su opisane. Bit ću iskren, nisam očekivao toliki kvalitet za ovu cijenu. Definitivno naručujem i drugi par." },
  { name: "Damir J.",   city: "Banja Luka",rating: 5, role: "Automehaničar",       text: "Radim na klizavim podovima u servisu, ove drže odlično. Unutrašnjost je ugodna, noge ne budu otečene poslije posla." },
  { name: "Irfan P.",   city: "Bijeljina", rating: 5, role: "Terenski tehničar",   text: "Kupio sam u ponedeljak, nosim svaki dan i već dva tjedna. Impresioniran sam. Uštedjeh 100 KM u odnosu na prethodne patike." },
];

const FAQS = [
  { q: "Da li su vodootporne?",             a: "Da, gornji materijal je vodootporan. Stopala ostaju suha na kiši i vlažnim podovima." },
  { q: "Koje brojeve imate?",               a: "Dostupni su brojevi od 36 do 47 EU. Preporučujemo naručiti vaš uobičajeni broj, a ako ste između — odaberite veći." },
  { q: "Koliko traje dostava?",             a: "Dostava putem Euro Express kurirske službe traje 1–3 radna dana na cijelu BiH. Cijena dostave je 10 KM." },
  { q: "Koja je garancija?",                a: "Richeng S3 patike dolaze s garancijom od 1 godine na materijal i izradu." },
  { q: "Plaćanje unaprijed ili pouzećem?",  a: "Isključivo plaćanje pouzećem — platite vozaču pri preuzimanju paketa. Bez predujma." },
  { q: "Mogu li ih vratiti?",               a: "Prihvatamo povrat u roku od 14 dana od primanja, ukoliko patike nisu nošene i nalaze se u originalnom pakovanju." },
  { q: "Jesu li pogodne za građevinu?",     a: "Apsolutno. S3 certifikat, čelična kapica i protuklizni đon čine ih idealnim za gradilišta, industriju i skladišta." },
  { q: "Da li su teške za nošenje?",        a: "Ne — konstruisane su da budu što lakše. Uprkos svim zaštitama, udobnost tokom cijelog radnog dana je ključna karakteristika." },
];

/* ── Helpers ─────────────────────────────────────────────────────── */
function fmt(n: number) { return n.toFixed(2).replace(".", ",") + " KM"; }

function fireFbq(...args: unknown[]) {
  const w = window as unknown as { fbq?: (...a: unknown[]) => void };
  if (typeof window !== "undefined" && w.fbq) w.fbq(...args);
}

/* ── Header ──────────────────────────────────────────────────────── */
function Header({ onOrder }: { onOrder: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50, width: "100%",
      background: "#fff",
      borderBottom: scrolled ? "1px solid rgba(0,0,0,0.07)" : "1px solid #F0EDE8",
      boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      transition: "box-shadow 300ms, border-color 300ms",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 17, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", fontFamily: F }}>
            Cartly<span style={{ color: ACCENT }}>.</span>ba
          </span>
        </a>
        <button onClick={onOrder}
          style={{ padding: "10px 24px", background: ACCENT, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800, fontFamily: F, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Naruči odmah
        </button>
      </div>
    </header>
  );
}

/* ── Hero ────────────────────────────────────────────────────────── */
function Hero({ onOrder }: { onOrder: () => void }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [viewers,  setViewers]  = useState(0);
  const [secs,     setSecs]     = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const r = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setSecs(r(12, 48) * 60);
    const id = setInterval(() => {
      setSecs(p => p === null ? null : p <= 1 ? r(15, 44) * 60 : p - 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const r = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setViewers(r(38, 74));
    const id = setInterval(() => {
      setViewers(v => Math.min(95, Math.max(28, v + r(-3, 4))));
    }, r(18_000, 32_000));
    return () => clearInterval(id);
  }, []);

  const prev = () => setImgIndex(i => i === 0 ? IMAGES.length - 1 : i - 1);
  const next = () => setImgIndex(i => i === IMAGES.length - 1 ? 0 : i + 1);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  const handleCTA = () => {
    fireFbq("track", "AddToCart", { content_name: "Richeng S3 Radne Patike", value: PRICE, currency: "BAM" });
    onOrder();
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes r-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .r-live-dot { animation: r-pulse 2s ease-in-out infinite; }
        .r-thumb { border: 2px solid transparent; transition: border-color 150ms, transform 150ms; cursor: pointer; }
        .r-thumb:hover { transform: scale(1.05); }
        .r-thumb.active { border-color: ${ACCENT}; }
        .r-cta { background: ${ACCENT}; transition: background 200ms, transform 180ms, box-shadow 200ms; }
        .r-cta:hover { background: #8B2200; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(179,48,0,0.38); }
        .r-cta:active { transform: scale(0.97); }
        .r-arrow { opacity: 0; transition: opacity 200ms, background 150ms; }
        .r-slider:hover .r-arrow { opacity: 1; }
        @media(max-width:1023px) {
          .r-hero-grid  { flex-direction: column !important; gap: 0 !important; }
          .r-img-col    { width: 100% !important; max-width: 100% !important; }
          .r-inner      { padding: 0 0 40px !important; }
          .r-badge-row  { display: none !important; }
          .r-slider     { border-radius: 0 !important; box-shadow: none !important; aspect-ratio: 4/3 !important; }
          .r-thumbs     { padding: 10px 16px 0 !important; gap: 8px !important; }
          .r-info-inner { padding: 20px 16px 0 !important; }
          .r-info-col   { width: 100% !important; padding-top: 0 !important; }
        }
        @media(max-width:640px) { .r-trust-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      <section style={{ background: "#fff", paddingTop: 0 }}>
        <div className="r-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 56px" }}>

          {/* Badge row — desktop */}
          <div className="r-badge-row" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            <span style={{ background: "#0A0A0A", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "5px 13px", borderRadius: 4, fontFamily: F }}>
              EN ISO 20345 S3
            </span>
            <span style={{ background: `rgba(179,48,0,0.08)`, color: ACCENT, border: `1px solid rgba(179,48,0,0.25)`, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "5px 13px", borderRadius: 4, fontFamily: F }}>
              Čelična kapica 200J
            </span>
            <span style={{ background: "rgba(22,163,74,0.08)", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "5px 13px", borderRadius: 4, fontFamily: F }}>
              ✓ Na stanju
            </span>
            {viewers > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,0.04)", borderRadius: 4, padding: "5px 12px", marginLeft: "auto", fontFamily: F }}>
                <span className="r-live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#444" }}><strong style={{ color: "#0A0A0A" }}>{viewers}</strong> osoba trenutno gleda</span>
              </span>
            )}
          </div>

          {/* Main grid */}
          <div className="r-hero-grid" style={{ display: "flex", gap: 52, alignItems: "flex-start" }}>

            {/* IMAGE COLUMN */}
            <div className="r-img-col" style={{ flex: "0 0 480px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                className="r-slider"
                style={{ position: "relative", aspectRatio: "1/1", borderRadius: 20, overflow: "hidden", background: "linear-gradient(145deg,#F7F4EF 0%,#EEEBE4 100%)", boxShadow: "0 4px 32px rgba(0,0,0,0.08),inset 0 0 0 1px rgba(0,0,0,0.06)", userSelect: "none" }}
                onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
              >
                <div aria-hidden style={{ position: "absolute", bottom: "-10%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "40%", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(255,107,0,0.14) 0%,transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

                {IMAGES.map((img, i) => (
                  <div key={i} style={{ position: "absolute", inset: 0, zIndex: i === imgIndex ? 1 : 0, opacity: i === imgIndex ? 1 : 0, transition: "opacity 350ms ease" }}>
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} priority={i === 0} />
                  </div>
                ))}

                {/* Arrows */}
                {[{ dir: "prev", side: "left", onclick: prev, path: "M15 18 9 12 15 6" }, { dir: "next", side: "right", onclick: next, path: "M9 18 15 12 9 6" }].map(a => (
                  <button key={a.dir} className="r-arrow" onClick={a.onclick} aria-label={a.dir}
                    style={{ position: "absolute", [a.side]: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points={a.path}/></svg>
                  </button>
                ))}

                <div style={{ position: "absolute", bottom: 14, right: 14, zIndex: 10, background: "rgba(0,0,0,0.48)", backdropFilter: "blur(4px)", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: F, letterSpacing: "0.05em" }}>
                  {imgIndex + 1} / {IMAGES.length}
                </div>

                {/* Mobile overlays */}
                <style suppressHydrationWarning>{`
                  .r-mob-badges,.r-mob-viewers { display:none; }
                  @media(max-width:1023px) { .r-mob-badges,.r-mob-viewers { display:flex !important; } }
                `}</style>
                <div className="r-mob-badges" style={{ position: "absolute", top: 12, left: 12, zIndex: 10, flexDirection: "column", gap: 6 }}>
                  <span style={{ background: "rgba(10,10,10,0.72)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 6, fontFamily: F, width: "fit-content" }}>EN ISO 20345 S3</span>
                  <span style={{ background: `rgba(179,48,0,0.85)`, backdropFilter: "blur(8px)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 6, fontFamily: F, width: "fit-content" }}>Čelična kapica</span>
                </div>
                {viewers > 0 && (
                  <div className="r-mob-viewers" style={{ position: "absolute", top: 12, right: 12, zIndex: 10, alignItems: "center", gap: 5, background: "rgba(0,0,0,0.58)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "6px 10px" }}>
                    <span className="r-live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: F }}>{viewers} gleda</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="r-thumbs" style={{ display: "flex", gap: 10 }}>
                {IMAGES.map((img, i) => (
                  <button key={i} onClick={() => setImgIndex(i)} className={`r-thumb${i === imgIndex ? " active" : ""}`} aria-label={`Slika ${i+1}`}
                    style={{ flex: 1, aspectRatio: "1/1", borderRadius: 10, overflow: "hidden", background: "#F5F5F5", position: "relative" }}>
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} />
                    {i === imgIndex && <div style={{ position: "absolute", inset: 0, background: "rgba(255,107,0,0.12)" }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* INFO COLUMN */}
            <div className="r-info-col r-info-inner" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0, paddingTop: 4 }}>

              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, display: "block", marginBottom: 12, fontFamily: F }}>
                Zaštitna obuća S3 · Richeng
              </span>

              <h1 style={{ fontSize: "clamp(32px,4.5vw,52px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.03em", color: "#0A0A0A", marginBottom: 16, fontFamily: F }}>
                Radne Patike S3<br />
                <span style={{ color: "rgba(10,10,10,0.3)", fontWeight: 700 }}>Richeng</span>
              </h1>

              {/* Stars */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A", fontFamily: F }}>4,9</span>
                <span style={{ fontSize: 13, color: "#999", fontFamily: F }}>/ 2.000+ zadovoljnih kupaca</span>
              </div>

              {/* Price block */}
              <div style={{ background: "linear-gradient(135deg,#FFF8F4 0%,#FFF3EB 100%)", border: "1px solid rgba(255,107,0,0.15)", borderRadius: 16, padding: "20px 22px", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "clamp(40px,5vw,56px)", fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.04em", lineHeight: 1, fontFamily: F }}>
                    49,90 KM
                  </span>
                  <span style={{ fontSize: 16, color: "rgba(0,0,0,0.35)", textDecoration: "line-through", fontWeight: 500, fontFamily: F }}>
                    79,90 KM
                  </span>
                  <span style={{ background: "#16A34A", color: "#fff", fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 6, fontFamily: F }}>
                    −38%
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", margin: "0 0 14px", fontFamily: F }}>
                  +10,00 KM dostava · Plaćanje pouzećem · Nema skrivenih troškova
                </p>
                {secs !== null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.55)", fontFamily: F, flexShrink: 0 }}>Akcijska cijena ističe za:</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: ACCENT, letterSpacing: "0.06em", fontFamily: F, fontVariantNumeric: "tabular-nums" }}>
                      {String(Math.floor(secs / 3600)).padStart(2,"0")}:{String(Math.floor((secs % 3600) / 60)).padStart(2,"0")}:{String(secs % 60).padStart(2,"0")}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(10,10,10,0.6)", marginBottom: 28, fontFamily: F }}>
                Profesionalna zaštitna obuća s <strong style={{ color: "#0A0A0A" }}>čeličnom kapicom</strong> po{" "}
                <strong style={{ color: "#0A0A0A" }}>EN ISO 20345 S3</strong> standardu. Vodootporne, lagane i udobne —{" "}
                za maksimalnu zaštitu tokom cijelog radnog dana na gradilištu, u industriji ili skladištu.
              </p>

              {/* Features grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {([
                  { title: "Čelična kapica", sub: "Zaštita do 200J udara",
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                  { title: "Vodootpornost", sub: "Suha stopala na kiši",
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
                  { title: "Anti-slip đon", sub: "SRC · klizanje i ulje",
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="20" rx="10" ry="2"/><path d="M5 20V10a7 7 0 0 1 14 0v10"/></svg> },
                  { title: "EN ISO 20345 S3", sub: "Europski S3 certifikat",
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
                  { title: "Lagane i udobne", sub: "Anatomski footbed",
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
                  { title: "Veličine 36–47", sub: "Dostupne sve veličine",
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9"/></svg> },
                ] as { title: string; sub: string; icon: React.ReactNode }[]).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FAFAFA", border: "1px solid #F0F0F0", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontFamily: F, fontWeight: 700, fontSize: 13, color: "#0A0A0A", lineHeight: 1.2 }}>{f.title}</div>
                      <div style={{ fontFamily: F, fontSize: 11, color: "#888", marginTop: 2, lineHeight: 1.3 }}>{f.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button onClick={handleCTA} className="r-cta"
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#fff", borderRadius: 14, padding: "18px 32px", fontFamily: F, fontWeight: 800, fontSize: 17, border: "none", cursor: "pointer", letterSpacing: "0.01em", marginBottom: 12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Odaberi veličinu i naruči
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: "#bbb", marginBottom: 24, fontFamily: F }}>Naruči bez plaćanja · platite pri preuzimanju paketa</p>

              {/* Trust grid */}
              <div className="r-trust-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, borderTop: "1px solid #F0F0F0", paddingTop: 20 }}>
                {TRUST.map(({ label, svg }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 8px", borderRadius: 12, background: "#FAFAFA", border: "1px solid #F0F0F0", textAlign: "center" }}>
                    <div style={{ color: ACCENT }}>{svg}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#555", lineHeight: 1.35, fontFamily: F }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Reviews ─────────────────────────────────────────────────────── */
function Reviews() {
  return (
    <section style={{ background: "#FAFAFA", padding: "80px 24px", borderTop: "1px solid #F0F0F0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 12 }}>
            {Array.from({length:5}).map((_,i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
              </svg>
            ))}
          </div>
          <h2 style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 8px", fontFamily: F }}>
            Šta kažu naši kupci
          </h2>
          <p style={{ fontSize: 14, color: "#999", fontFamily: F }}>4,9 / 5 · Više od 2.000 narudžbi</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="r-reviews-grid">
          {REVIEWS.map((r, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 18, padding: "24px 20px" }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                {Array.from({length:r.rating}).map((_,j) => (
                  <svg key={j} width="13" height="13" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "#444", fontFamily: F, lineHeight: 1.75, margin: "0 0 18px" }}>&ldquo;{r.text}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT} 0%,#8B2200 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: F }}>{r.name[0]}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0A", fontFamily: F }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "#999", fontFamily: F }}>{r.role} · {r.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style suppressHydrationWarning>{`
        .r-reviews-grid { grid-template-columns: repeat(3,1fr) !important; }
        @media(max-width:900px) { .r-reviews-grid { grid-template-columns:1fr 1fr !important; } }
        @media(max-width:560px) { .r-reviews-grid { grid-template-columns:1fr !important; } }
      `}</style>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number|null>(null);
  return (
    <section style={{ background: "#fff", padding: "80px 24px", borderTop: "1px solid #F0F0F0" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(22px,2.8vw,34px)", fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 8px", fontFamily: F }}>Česta pitanja</h2>
          <p style={{ fontSize: 14, color: "#999", fontFamily: F }}>Sve što trebate znati prije narudžbe</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((item, i) => (
            <div key={i} style={{ border: `1px solid ${open===i ? "rgba(179,48,0,0.2)" : "#EBEBEB"}`, borderRadius: 14, overflow: "hidden", background: open===i ? "rgba(179,48,0,0.02)" : "#fff", transition: "border-color 0.2s" }}>
              <button onClick={() => setOpen(open===i ? null : i)}
                style={{ width: "100%", padding: "18px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A", fontFamily: F, textAlign: "left" }}>{item.q}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={open===i ? ACCENT : "#999"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: "transform 0.2s", transform: open===i ? "rotate(180deg)" : "none" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div style={{ maxHeight: open===i ? 300 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
                <p style={{ margin: 0, padding: "0 20px 18px", fontSize: 14, color: "#666", fontFamily: F, lineHeight: 1.75 }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: "#0A0A0A", padding: "48px 24px 36px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", fontFamily: F, marginBottom: 8 }}>
            Cartly<span style={{ color: ACCENT }}>.</span>ba
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: F, margin: 0 }}>Richeng S3 Radne Patike · Plaćanje pouzećem · BiH</p>
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center" }}>
          {["Politika privatnosti", "Uvjeti korištenja", "Kontakt"].map(t => (
            <span key={t} style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: F, cursor: "pointer" }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "24px auto 0", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: F, margin: 0 }}>© {new Date().getFullYear()} Cartly.ba · Sva prava pridržana</p>
      </div>
    </footer>
  );
}

/* ── Floating CTA ────────────────────────────────────────────────── */
function FloatingBar({ onOrder }: { onOrder: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    fireFbq("track", "AddToCart", { content_name: "Richeng S3 Radne Patike", value: PRICE, currency: "BAM" });
    onOrder();
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes rfcta-glow {
          0%,100% { box-shadow: 0 4px 20px rgba(179,48,0,0.25); }
          50%      { box-shadow: 0 6px 28px rgba(179,48,0,0.45); }
        }
        @keyframes rfcta-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.3; transform:scale(0.5); }
        }
        .rfcta-wrap {
          position:fixed; bottom:0; left:0; right:0; z-index:9998;
          background:#fff; border-top:1px solid #EBEBEB;
          padding:10px 16px;
          padding-bottom:calc(10px + env(safe-area-inset-bottom));
          display:flex; align-items:center; gap:12px;
          box-shadow:0 -4px 24px rgba(0,0,0,0.07);
          transition:transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease;
        }
        .rfcta-wrap.hidden { opacity:0; transform:translateY(100%); pointer-events:none; }
        @media(min-width:640px) {
          .rfcta-wrap {
            bottom:20px; left:auto; right:20px;
            border-radius:16px; border:1px solid #E8E8E8;
            padding:12px 16px; max-width:340px;
            box-shadow:0 8px 32px rgba(0,0,0,0.12);
          }
        }
        .rfcta-btn {
          flex-shrink:0; background:${ACCENT}; color:#fff;
          border:none; border-radius:11px; padding:12px 18px;
          font-size:14px; font-weight:800; font-family:${F};
          letter-spacing:-0.01em; cursor:pointer; white-space:nowrap;
          animation:rfcta-glow 3s ease-in-out 2s infinite;
          transition:background 150ms,transform 150ms;
          display:flex; align-items:center; gap:5px;
        }
        .rfcta-btn:hover  { background:#961f00; transform:scale(1.02); }
        .rfcta-btn:active { transform:scale(0.97); }
        .rfcta-pulse {
          width:6px; height:6px; border-radius:50%;
          background:#22c55e; flex-shrink:0;
          animation:rfcta-dot 2s ease-in-out infinite;
        }
      `}</style>

      <div className={`rfcta-wrap${!visible ? " hidden" : ""}`}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <span className="rfcta-pulse" />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22c55e", fontFamily: F }}>Na stanju</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 19, fontWeight: 900, color: "#0A0A0A", fontFamily: F, letterSpacing: "-0.03em", lineHeight: 1 }}>49,90 KM</span>
            <span style={{ fontSize: 12, color: "#BBBBBB", textDecoration: "line-through", fontFamily: F }}>79,90</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: ACCENT, background: "#FFF0EB", border: "1px solid rgba(179,48,0,0.2)", borderRadius: 5, padding: "2px 6px", fontFamily: F }}>−38%</span>
          </div>
          <div style={{ fontSize: 10, color: "#AAAAAA", fontFamily: F, marginTop: 1 }}>Pouzećem · Dostava 10 KM</div>
        </div>
        <button onClick={handleClick} className="rfcta-btn">
          Naruči
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </>
  );
}

/* ── Order Modal ─────────────────────────────────────────────────── */
type Fields = { ime: string; telefon: string; adresa: string; grad: string };

function OrderModal({ open, onClose, initialSize }: { open: boolean; onClose: () => void; initialSize?: number }) {
  const [mounted,    setMounted]    = useState(false);
  const [size,       setSize]       = useState<number|undefined>(initialSize);
  const [qty,        setQty]        = useState(1);
  const [fields,     setFields]     = useState<Fields>({ ime:"", telefon:"", adresa:"", grad:"" });
  const [errors,     setErrors]     = useState<Record<string,string>>({});
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [serverError,setServerError]= useState<string|null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (open) setSize(initialSize); }, [open, initialSize]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  const total = PRICE * qty + DELIVERY;

  function validate() {
    const e: Record<string,string> = {};
    if (!size) e.size = "Odaberite veličinu";
    if (!fields.ime.trim()) e.ime = "Obavezno polje";
    if (!fields.telefon.trim()) e.telefon = "Obavezno polje";
    if (!fields.adresa.trim()) e.adresa = "Obavezno polje";
    if (!fields.grad.trim()) e.grad = "Obavezno polje";
    setErrors(e);
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (Object.keys(validate()).length) return;
    setLoading(true); setServerError(null);
    try {
      const res  = await fetch("/api/richeng-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, velicina: size, kolicina: qty }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      fireFbq("track", "Purchase", { value: total, currency: "BAM", content_name: "Richeng S3 Radne Patike", content_ids: ["richeng-s3"], num_items: qty }, { eventID: data.orderNumber });
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Greška pri slanju narudžbe.");
    } finally { setLoading(false); }
  }

  if (!mounted || !open) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 19000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />

      {/* Sheet */}
      <div className="r-modal" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 19001, background: "#fff", borderRadius: "28px 28px 0 0", maxHeight: "94dvh", overflowY: "auto", fontFamily: F }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#D1D5DB", margin: "14px auto 0" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 20, background: "rgba(0,0,0,0.06)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {done ? (
          <div style={{ padding: "60px 28px", textAlign: "center" }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(179,48,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9"/></svg>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 10px", fontFamily: F }}>Narudžba primljena!</h3>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.75, margin: "0 0 28px", maxWidth: 300, marginLeft: "auto", marginRight: "auto", fontFamily: F }}>Kontaktirat ćemo vas radi potvrde. Dostava 1–3 radna dana.</p>
            <button onClick={onClose} style={{ padding: "13px 36px", background: "#0A0A0A", color: "#fff", border: "none", borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F }}>Zatvori</button>
          </div>
        ) : (
          <div style={{ padding: "24px 24px 48px" }}>
            {/* Header */}
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 4px", fontFamily: F }}>Naruči Richeng S3</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "#ccc", textDecoration: "line-through", fontFamily: F }}>79,90 KM</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", fontFamily: F }}>49,90 KM</span>
                <span style={{ background: "#16A34A", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 5, fontFamily: F }}>−38%</span>
              </div>
            </div>

            {/* Size picker */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12, fontFamily: F }}>
                Odaberite veličinu {errors.size && <span style={{ color: "#ef4444", textTransform: "none", fontWeight: 600 }}>— {errors.size}</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SIZES.map(s => (
                  <button key={s} onClick={() => { setSize(s); setErrors(er => ({ ...er, size: "" })); }}
                    style={{ width: 48, height: 48, border: `2px solid ${size===s ? ACCENT : "#E5E7EB"}`, background: size===s ? "rgba(179,48,0,0.06)" : "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, color: size===s ? ACCENT : "#0A0A0A", cursor: "pointer", transition: "all 0.15s", fontFamily: F }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12, fontFamily: F }}>Količina</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width: 40, height: 40, border: "1.5px solid #E5E7EB", background: "#fff", borderRadius: 10, fontSize: 18, fontWeight: 700, color: "#0A0A0A", cursor: "pointer", fontFamily: F }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#0A0A0A", fontFamily: F, minWidth: 20, textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(5, q+1))} style={{ width: 40, height: 40, border: "none", background: ACCENT, borderRadius: 10, fontSize: 18, fontWeight: 700, color: "#fff", cursor: "pointer" }}>+</button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }} className="r-form-grid">
                {([
                  { key:"ime",     label:"Ime i prezime", type:"text", ph:"Amira Kovačević" },
                  { key:"telefon", label:"Telefon",       type:"tel",  ph:"061 234 567" },
                  { key:"adresa",  label:"Adresa",        type:"text", ph:"Ulica i broj" },
                  { key:"grad",    label:"Grad",          type:"text", ph:"Sarajevo" },
                ] as { key: keyof Fields; label:string; type:string; ph:string }[]).map(({ key,label,type,ph }) => (
                  <div key={key}>
                    <label style={{ display:"block", fontSize:10, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, fontFamily:F }}>{label}</label>
                    <input type={type} value={fields[key]} placeholder={ph}
                      onChange={e => { setFields(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]:"" })); }}
                      style={{ width:"100%", padding:"12px", border:`1.5px solid ${errors[key] ? "#ef4444" : "#E5E7EB"}`, borderRadius:10, fontSize:14, color:"#0A0A0A", background:"#fff", boxSizing:"border-box", WebkitAppearance:"none", outline:"none", fontFamily:F }}
                      onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px rgba(179,48,0,0.1)`; }}
                      onBlur={e  => { e.target.style.borderColor = errors[key] ? "#ef4444" : "#E5E7EB"; e.target.style.boxShadow = "none"; }} />
                    {errors[key] && <p style={{ margin:"3px 0 0", fontSize:10, color:"#ef4444", fontFamily:F }}>{errors[key]}</p>}
                  </div>
                ))}
              </div>

              {errors.size && <p style={{ fontSize:13, color:"#ef4444", fontWeight:700, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", margin:"0 0 10px", fontFamily:F }}>⚠️ Odaberite broj patike prije narudžbe</p>}
              {serverError && <p style={{ fontSize:12, color:"#ef4444", margin:"0 0 10px", fontFamily:F }}>{serverError}</p>}

              {/* Summary */}
              <div style={{ background: "#0A0A0A", borderRadius: 16, padding: "18px 20px", marginTop: 16, marginBottom: 16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:3, fontFamily:F }}>Ukupno za plaćanje</div>
                    <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:"-0.04em", lineHeight:1, fontFamily:F }}>{fmt(total)}</div>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:10, padding:"8px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:F }}>Dostava</div>
                    <div style={{ fontSize:13, fontWeight:800, color:"#fff", fontFamily:F }}>10,00 KM</div>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="r-cta"
                  style={{ width:"100%", padding:"15px", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:900, cursor:loading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:14, boxShadow:"0 4px 20px rgba(0,0,0,0.15)", fontFamily:F, opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Šalje se..." : "Naruči — Plaćanje pouzećem"}
                </button>
                <div style={{ display:"flex", justifyContent:"center", gap:18, marginTop:12, flexWrap:"wrap" }}>
                  {["Bez predujma","Dostava 1–3 dana","Garancija 1 god."].map((t,i) => (
                    <span key={i} style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontFamily:F, display:"flex", alignItems:"center", gap:4 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      <style suppressHydrationWarning>{`
        @media(min-width:640px) {
          .r-modal {
            bottom: auto !important; top: 50% !important;
            left: 50% !important; right: auto !important;
            transform: translate(-50%,-50%) !important;
            width: 520px !important; border-radius: 24px !important;
            max-height: 90vh !important;
          }
        }
        .r-form-grid { grid-template-columns: 1fr 1fr !important; }
        @media(max-width:400px) { .r-form-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
}

/* ── Quick Order Section ─────────────────────────────────────────── */
function QuickOrderSection({ onDone }: { onDone?: (orderNumber: string, total: number, qty: number) => void }) {
  const [qtys, setQtys]   = useState<Record<number, number>>({});
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr]   = useState("");
  const [city, setCity]   = useState("");
  const [errors, setErrors]     = useState<Record<string,string>>({});
  const [loading, setLoading]   = useState(false);
  const [done,    setDone]      = useState(false);
  const [srvErr,  setSrvErr]    = useState<string|null>(null);

  const changeQty = (s: number, d: number) => {
    setQtys(prev => {
      const next = Math.max(0, (prev[s] ?? 0) + d);
      const up = { ...prev, [s]: next };
      if (next === 0) delete up[s];
      return up;
    });
    setErrors(e => ({ ...e, sizes: "" }));
  };

  const totalPairs = Object.values(qtys).reduce((a,b) => a+b, 0);
  const total = PRICE * totalPairs + DELIVERY;

  function validate() {
    const e: Record<string,string> = {};
    if (totalPairs === 0) e.sizes = "Odaberite barem jednu veličinu";
    if (!name.trim())  e.name  = "Unesite ime i prezime";
    if (!phone.trim()) e.phone = "Unesite broj telefona";
    if (!addr.trim())  e.addr  = "Unesite adresu";
    if (!city.trim())  e.city  = "Unesite grad";
    setErrors(e);
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (Object.keys(validate()).length) return;
    setLoading(true); setSrvErr(null);
    const velicine = Object.entries(qtys).map(([s,k]) => ({ velicina: Number(s), kolicina: k }));
    try {
      const res  = await fetch("/api/richeng-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ime: name, telefon: phone, adresa: addr, grad: city, velicina: velicine[0]?.velicina, kolicina: totalPairs, velicine }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      fireFbq("track", "Purchase", { value: total, currency: "BAM", content_name: "Richeng S3 Radne Patike", content_ids: ["richeng-s3"], num_items: totalPairs }, { eventID: data.orderNumber });
      if (onDone) onDone(data.orderNumber, total, totalPairs);
      setDone(true);
    } catch (err) {
      setSrvErr(err instanceof Error ? err.message : "Greška pri slanju narudžbe.");
    } finally { setLoading(false); }
  }

  if (done) return (
    <section id="naruci" style={{ background: "#F9F9F9", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB", padding: "64px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style={{ fontFamily: F, fontWeight: 800, fontSize: 22, color: "#0A0A0A", letterSpacing: "-0.02em", margin: "0 0 10px" }}>Hvala, {name.split(" ")[0]}!</h3>
        <p style={{ fontFamily: F, fontSize: 15, color: "#666", lineHeight: 1.6, margin: 0 }}>Narudžba primljena. Javit ćemo se na <strong>{phone}</strong> radi potvrde.</p>
      </div>
    </section>
  );

  return (
    <section id="naruci" style={{ background: "#F9F9F9", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB", padding: "52px 20px" }}>
      <style suppressHydrationWarning>{`
        .rq-inp { width:100%; border:1.5px solid #E2E2E2; border-radius:10px; padding:12px 14px; font-size:15px; font-family:${F}; outline:none; background:#fff; box-sizing:border-box; color:#0A0A0A; transition:border-color 130ms; }
        .rq-inp:focus { border-color:${ACCENT}; }
        .rq-inp.rq-err { border-color:#ef4444; }
        .rq-sub { width:100%; background:${ACCENT}; color:#fff; border:none; border-radius:12px; padding:17px; font-family:${F}; font-weight:800; font-size:16px; cursor:pointer; transition:background 130ms; }
        .rq-sub:hover { background:#961f00; }
        .rq-sub:disabled { opacity:.55; cursor:not-allowed; }
        .rq-sz-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #F2F2F2; }
        .rq-sz-row:last-child { border-bottom:none; padding-bottom:0; }
        .rq-sz-row:first-child { padding-top:0; }
        .rq-q-btn { width:32px; height:32px; border-radius:8px; border:1.5px solid #E0E0E0; background:#fff; font-size:18px; font-weight:700; color:#444; display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0; flex-shrink:0; transition:all 120ms; font-family:${F}; line-height:1; }
        .rq-q-btn:hover { border-color:${ACCENT}; background:${ACCENT}; color:#fff; }
        .rq-q-btn:disabled { opacity:.3; cursor:not-allowed; }
      `}</style>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ margin: "0 0 8px", fontFamily: F, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT }}>Naruči odmah</p>
          <h2 style={{ margin: 0, fontFamily: F, fontWeight: 800, fontSize: 26, color: "#0A0A0A", letterSpacing: "-0.03em" }}>Popuni narudžbu</h2>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 20 }}>
            {([
              { k:"name",  l:"Ime i prezime *",  p:"Npr. Amir Begović", t:"text", v:name,  s:setName  },
              { k:"phone", l:"Broj telefona *",  p:"Npr. 061 234 567",  t:"tel",  v:phone, s:setPhone },
              { k:"addr",  l:"Adresa dostave *", p:"Npr. Ferhadija 1",  t:"text", v:addr,  s:setAddr  },
              { k:"city",  l:"Grad *",           p:"Npr. Sarajevo",     t:"text", v:city,  s:setCity  },
            ] as { k:string; l:string; p:string; t:string; v:string; s:(v:string)=>void }[]).map(f => (
              <div key={f.k}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666", fontFamily: F, display: "block", marginBottom: 5 }}>{f.l}</label>
                <input type={f.t} value={f.v} placeholder={f.p} className={`rq-inp${errors[f.k] ? " rq-err" : ""}`}
                  onChange={e => { f.s(e.target.value); setErrors(er => ({ ...er, [f.k]:"" })); }} />
                {errors[f.k] && <p style={{ fontSize:11, color:"#ef4444", margin:"3px 0 0", fontFamily:F }}>{errors[f.k]}</p>}
              </div>
            ))}
          </div>

          {/* Size + qty picker */}
          <div style={{ background: "#fff", border: "1.5px solid #E8E8E8", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #F0F0F0" }}>
              <span style={{ fontFamily: F, fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>Odaberi veličine i količine</span>
            </div>
            <div style={{ padding: "4px 18px 8px" }}>
              {SIZES.map(s => {
                const qty = qtys[s] ?? 0;
                return (
                  <div key={s} className="rq-sz-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: F, fontWeight: 700, fontSize: 15, color: qty > 0 ? ACCENT : "#0A0A0A", minWidth: 28 }}>{s}</span>
                      {qty > 0 && <span style={{ fontSize: 11, color: ACCENT, fontFamily: F, fontWeight: 600 }}>{(qty * PRICE).toFixed(2).replace(".",",")} KM</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button type="button" className="rq-q-btn" disabled={qty === 0} onClick={() => changeQty(s,-1)}>−</button>
                      <span style={{ fontFamily: F, fontWeight: 800, fontSize: 16, color: qty > 0 ? ACCENT : "#CCC", minWidth: 20, textAlign: "center" }}>{qty}</span>
                      <button type="button" className="rq-q-btn" onClick={() => changeQty(s,+1)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.sizes && <div style={{ padding: "0 18px 12px" }}><p style={{ fontSize:11, color:"#ef4444", margin:0, fontFamily:F }}>{errors.sizes}</p></div>}
          </div>

          {srvErr && <p style={{ fontSize:13, color:"#ef4444", background:"#fef2f2", padding:"10px 14px", borderRadius:8, marginBottom:14, fontFamily:F }}>{srvErr}</p>}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "12px 0", borderTop: "1px solid #EBEBEB" }}>
            <span style={{ fontFamily: F, fontSize: 13, color: "#888" }}>
              {totalPairs > 0 ? `${totalPairs} par${totalPairs > 1 ? "a" : ""} · dostava 10 KM` : "Odaberi veličine"}
            </span>
            <span style={{ fontFamily: F, fontWeight: 900, fontSize: 24, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
              {totalPairs > 0 ? `${total.toFixed(2).replace(".",",")} KM` : "—"}
            </span>
          </div>

          <button type="submit" className="rq-sub" disabled={loading}>{loading ? "Slanje..." : "Pošalji narudžbu"}</button>
          <p style={{ fontSize:11, color:"#BBB", textAlign:"center", marginTop:10, fontFamily:F }}>Plaćanje pouzećem · Bez kartice · Povrat 14 dana</p>
        </form>
      </div>
    </section>
  );
}

/* ── B2B Section ─────────────────────────────────────────────────── */
const B2B_KOLICINE = ["10 – 20 pari","21 – 50 pari","51 – 100 pari","100+ pari"];
type B2BFields = { firma: string; kontakt: string; grad: string; adresa: string; kolicina: string };

function B2BSection() {
  const [fields,    setFields]    = useState<B2BFields>({ firma:"", kontakt:"", grad:"", adresa:"", kolicina:"" });
  const [errors,    setErrors]    = useState<Partial<Record<keyof B2BFields,string>>>({});
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverErr, setServerErr] = useState<string|null>(null);

  function setF(key: keyof B2BFields, val: string) {
    setFields(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e: Partial<Record<keyof B2BFields,string>> = {};
    if (!fields.firma.trim())   e.firma   = "Unesite naziv firme";
    if (!fields.kontakt.trim()) e.kontakt = "Unesite kontakt telefon";
    if (!fields.grad.trim())    e.grad    = "Unesite grad";
    if (!fields.adresa.trim())  e.adresa  = "Unesite adresu";
    if (!fields.kolicina)       e.kolicina = "Odaberite količinu";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true); setServerErr(null);
    try {
      const res  = await fetch("/api/b2b-inquiry", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(fields) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Greška");
      setSubmitted(true);
    } catch { setServerErr("Došlo je do greške. Pokušajte ponovo."); }
    finally { setLoading(false); }
  }

  return (
    <section style={{ background: "#0A0A0A", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position:"absolute", top:"-20%", left:"-10%", width:"50%", height:"80%", background:"radial-gradient(ellipse,rgba(255,107,0,0.08) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />
      <style suppressHydrationWarning>{`
        @media(max-width:768px) { .rb2b-grid { grid-template-columns:1fr !important; } }
        .rb2b-inp::placeholder { color:#9CA3AF !important; }
        .rb2b-inp:focus { outline:none; border-color:${ACCENT} !important; box-shadow:0 0 0 3px rgba(255,107,0,0.12) !important; }
        .rb2b-qty:hover { background:#FFF7F0 !important; border-color:${ACCENT} !important; color:${ACCENT} !important; }
        .rb2b-sub { transition:background 150ms,transform 150ms,box-shadow 150ms; }
        .rb2b-sub:hover:not(:disabled) { background:${ACCENT} !important; transform:translateY(-1px); box-shadow:0 8px 24px rgba(255,107,0,0.35) !important; }
      `}</style>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"clamp(56px,8vw,96px) clamp(16px,4vw,48px)", position:"relative", zIndex:1 }}>
        <div className="rb2b-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"clamp(32px,5vw,64px)", alignItems:"start" }}>

          {/* Left */}
          <div style={{ display:"flex", flexDirection:"column", gap:32 }}>
            <div>
              <span style={{ display:"inline-block", background:"rgba(255,107,0,0.15)", color:ACCENT, fontSize:11, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", padding:"5px 14px", borderRadius:999, fontFamily:F, border:`1px solid rgba(255,107,0,0.3)`, marginBottom:16 }}>B2B</span>
              <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:"#fff", letterSpacing:"-0.03em", lineHeight:1.1, margin:"0 0 16px", fontFamily:F }}>
                Naručujete<br /><span style={{ color:"rgba(255,255,255,0.45)", fontWeight:700 }}>za firmu?</span>
              </h2>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.55)", lineHeight:1.7, margin:0, fontFamily:F, maxWidth:380 }}>
                Posebne cijene za veće narudžbe, dostava na adresu firme i PDV račun — sve u jednoj narudžbi.
              </p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { title:"Zaštita vaših zaposlenika", desc:"EN ISO 20345 S3 certifikat · ispunjavate zakonsku obavezu zaštite na radu.",
                  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
                { title:"Dostava na adresu firme", desc:"Organizujemo dostavu direktno na vaše radno mjesto.",
                  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                { title:"Faktura i PDV račun", desc:"Izdajemo sve potrebne dokumente za vaše računovodstvo.",
                  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
              ].map(item => (
                <div key={item.title} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:"rgba(255,107,0,0.12)", border:"1px solid rgba(255,107,0,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:ACCENT }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:4, fontFamily:F }}>{item.title}</div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.6, fontFamily:F }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 16px", background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontFamily:F, fontWeight:500 }}>Odgovaramo u roku od 24h · Bez obaveze kupovine</span>
            </div>
          </div>

          {/* Right — form */}
          {submitted ? (
            <div style={{ background:"#fff", borderRadius:20, padding:"48px 36px", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
              <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(22,163,74,0.10)", border:"2px solid rgba(22,163,74,0.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ fontSize:22, fontWeight:900, color:"#111", margin:"0 0 10px", fontFamily:F, letterSpacing:"-0.02em" }}>Upit primljen!</h3>
              <p style={{ fontSize:14, color:"#6B7280", margin:0, lineHeight:1.65, fontFamily:F }}>Kontaktiramo vas u roku od 24h sa personalnom ponudom za vašu firmu.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background:"#fff", borderRadius:20, padding:"clamp(24px,3vw,36px)", display:"flex", flexDirection:"column", gap:16, boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
              {([
                { key:"firma",   label:"Naziv firme",     placeholder:"Npr. Građevina d.o.o.", type:"text" },
                { key:"kontakt", label:"Kontakt telefon", placeholder:"Npr. 061 234 567",      type:"tel"  },
                { key:"grad",    label:"Grad",            placeholder:"Npr. Sarajevo",         type:"text" },
                { key:"adresa",  label:"Adresa firme",    placeholder:"Npr. Titova 12",        type:"text" },
              ] as { key: keyof B2BFields; label:string; placeholder:string; type:string }[]).map(f => (
                <div key={f.key}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:6, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.07em" }}>{f.label}</label>
                  <input className="rb2b-inp" type={f.type} placeholder={f.placeholder} value={fields[f.key]}
                    onChange={e => setF(f.key, e.target.value)}
                    style={{ width:"100%", boxSizing:"border-box", background:"#F9FAFB", border:`1.5px solid ${errors[f.key] ? "#EF4444" : "#E5E7EB"}`, borderRadius:10, padding:"13px 16px", fontSize:14, color:"#111", fontFamily:F, outline:"none", transition:"border-color 0.15s,box-shadow 0.15s" }} />
                  {errors[f.key] && <p style={{ fontSize:11, color:"#EF4444", margin:"5px 0 0", fontFamily:F }}>{errors[f.key]}</p>}
                </div>
              ))}
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:8, fontFamily:F, textTransform:"uppercase", letterSpacing:"0.07em" }}>Količina pari</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {B2B_KOLICINE.map(k => (
                    <button key={k} type="button" className="rb2b-qty"
                      onClick={() => setF("kolicina", k)}
                      style={{ padding:"12px 8px", background:fields.kolicina===k ? "#FFF0E6" : "#F9FAFB", border:`1.5px solid ${fields.kolicina===k ? ACCENT : "#E5E7EB"}`, borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:700, color:fields.kolicina===k ? ACCENT : "#6B7280", fontFamily:F, transition:"all 0.15s" }}>
                      {k}
                    </button>
                  ))}
                </div>
                {errors.kolicina && <p style={{ fontSize:11, color:"#EF4444", margin:"5px 0 0", fontFamily:F }}>{errors.kolicina}</p>}
              </div>
              {serverErr && <p style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#DC2626", margin:0, fontFamily:F }}>{serverErr}</p>}
              <button type="submit" disabled={loading} className="rb2b-sub"
                style={{ background: loading ? "rgba(179,48,0,0.5)" : ACCENT, color:"#fff", fontWeight:800, fontSize:15, border:"none", borderRadius:12, padding:"16px", cursor: loading ? "not-allowed" : "pointer", fontFamily:F, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {loading ? "Slanje..." : (<>Pošalji upit <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></>)}
              </button>
              <p style={{ fontSize:11, color:"#9CA3AF", textAlign:"center", margin:0, lineHeight:1.5, fontFamily:F }}>Odgovaramo u roku od 24h radnim danima</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function RichengPage() {
  const [modalOpen, setModalOpen]       = useState(false);
  const [initialSize, setInitialSize]   = useState<number|undefined>();

  useEffect(() => {
    fireFbq("track", "ViewContent", { content_name: "Richeng S3 Radne Patike", content_ids: ["richeng-s3"], content_type: "product", value: PRICE, currency: "BAM" });
  }, []);

  function openOrder(size?: number) {
    setInitialSize(size);
    setModalOpen(true);
    fireFbq("track", "InitiateCheckout", { content_name: "Richeng S3 Radne Patike", content_ids: ["richeng-s3"], value: PRICE, currency: "BAM" });
  }

  return (
    <>
      <style suppressHydrationWarning>{`html { scroll-behavior: smooth; } *, *::before, *::after { box-sizing: border-box; } body { margin: 0; }`}</style>
      <Header onOrder={() => openOrder()} />
      <main>
        <Hero onOrder={() => openOrder()} />
        <QuickOrderSection />
        <Reviews />
        <B2BSection />
        <FAQ />
      </main>
      <Footer />
      <FloatingBar onOrder={() => openOrder()} />
      <OrderModal open={modalOpen} onClose={() => setModalOpen(false)} initialSize={initialSize} />
    </>
  );
}
