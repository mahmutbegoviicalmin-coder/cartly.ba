"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { event } from "@/lib/fbpixel";

const ACCENT    = "#FF6B00";
const PRICE    = 89.90;
const DELIVERY = 10.00;

/* ─── Types ─────────────────────────────────────────── */
type Fields = { ime: string; telefon: string; adresa: string; grad: string };
type Errors = Partial<Record<keyof Fields, string>>;

/* ─── SET ITEMS ─────────────────────────────────────── */
const SET_ITEMS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    title: "Mašina za šišanje 850W",
    desc: "Profesionalni električni šišač ovaca · 2800 okretaja u minuti",
    badge: null,
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: "Rezervni nož",
    desc: "Visokokvalitetni čelični nož · Dugotrajno oštro sječivo",
    badge: "GRATIS",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    title: "Kofer za prenošenje",
    desc: "Čvrsti zaštitni kofer · Sve uredno složeno na jednom mjestu",
    badge: null,
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
    ),
    title: "Mazivo za noževe",
    desc: "Produžava vijek trajanja noževa · Štiti od hrđe i trenja",
    badge: null,
  },
];

/* ─── FEATURES ──────────────────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "850W snažan motor",
    desc: "Brije i najtvrđu vunu bez zastajkivanja",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "2800 okr./min",
    desc: "Brzo i efikasno šišanje · Uštedite sat vremena po ovci",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
        <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
        <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
        <line x1="17" y1="16" x2="23" y2="16"/>
      </svg>
    ),
    title: "6 brzina rada",
    desc: "Podesivi pritisak za svaki tip vune",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    title: "Hlađenje zrakom",
    desc: "Motor se ne pregrijava ni pri dugotrajnoj upotrebi",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    title: "Ergonomska drška",
    desc: "Udobna i za višesatni rad · Smanjuje umor ruke",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Čelični noževi",
    desc: "Precizno sječivo · Lako se skida i zamjenjuje",
  },
];

/* ─── FAQ ───────────────────────────────────────────── */
const FAQ = [
  { q: "Za koje životinje je pogodna mašina?", a: "Mašina je primarno namijenjena za ovce, ali se može koristiti i za koze, alpake i slične životinje s dužom dlakom." },
  { q: "Koliko dugo traju noževi?", a: "Uz redovno mazanje i pravilno čuvanje, noževi traju više sezona. U setu dobijate rezervni nož koji osigurava kontinuitet rada." },
  { q: "Da li je teška za rad?", a: "Mašina teži oko 2.3 kg s ergonomskom drškom koja raspoređuje težinu i značajno smanjuje umor pri dugotrajnom šišanju." },
  { q: "Kako se vrši dostava i plaćanje?", a: "Dostava je pouzećem putem BH Pošte ili kurirske službe. Plaćate gotovinom pri preuzimanju. Dostava košta 10 KM." },
];

/* ─── SOCIAL PROOF DATA ─────────────────────────────── */
const RECENT_BUYERS = [
  { name: "Mirza H.",    city: "Sarajeva",       ago: "prije 1 sat"   },
  { name: "Edin K.",     city: "Tuzle",          ago: "prije 2 sata"  },
  { name: "Tarik M.",    city: "Banje Luke",     ago: "prije 3 sata"  },
  { name: "Adnan B.",    city: "Bihaća",         ago: "prije 4 sata"  },
  { name: "Samir J.",    city: "Mostara",        ago: "prije 5 sati"  },
  { name: "Haris Ć.",    city: "Zenice",         ago: "prije 6 sati"  },
  { name: "Alen F.",     city: "Travnika",       ago: "jutros"        },
  { name: "Dino N.",     city: "Goražda",        ago: "jutros"        },
  { name: "Kenan O.",    city: "Livna",          ago: "sinoć"         },
  { name: "Jasmin R.",   city: "Tešnja",         ago: "sinoć"         },
  { name: "Eldin S.",    city: "Kaknja",         ago: "prije 1 sat"   },
  { name: "Amir T.",     city: "Gračanice",      ago: "prije 2 sata"  },
  { name: "Nermin V.",   city: "Konjica",        ago: "prije 3 sata"  },
  { name: "Senad I.",    city: "Brčkog",         ago: "jutros"        },
  { name: "Damir P.",    city: "Cazina",         ago: "jutros"        },
  { name: "Elvedin H.",  city: "Lukavca",        ago: "sinoć"         },
  { name: "Harun K.",    city: "Gradačca",       ago: "sinoć"         },
  { name: "Faruk M.",    city: "Visokog",        ago: "prije 4 sata"  },
  { name: "Almir D.",    city: "Olova",          ago: "jutros"        },
  { name: "Nedim L.",    city: "Zavidovića",     ago: "sinoć"         },
  { name: "Muhamed A.",  city: "Jajca",          ago: "prije 5 sati"  },
  { name: "Emir C.",     city: "Doboja",         ago: "jutros"        },
  { name: "Rifet G.",    city: "Prijedora",      ago: "sinoć"         },
  { name: "Sead N.",     city: "Tuzle",          ago: "prije 2 sata"  },
  { name: "Bakir V.",    city: "Žepča",          ago: "jutros"        },
  { name: "Mahir I.",    city: "Bugojna",        ago: "prije 6 sati"  },
  { name: "Ervin K.",    city: "Čapljine",       ago: "sinoć"         },
  { name: "Suad R.",     city: "Novog Travnika", ago: "jutros"        },
  { name: "Denis M.",    city: "Sanskog Mosta",  ago: "sinoć"         },
  { name: "Armin Š.",    city: "Sarajeva",       ago: "prije 3 sata"  },
];

/* ─── COMPONENT ─────────────────────────────────────── */
export default function MasinaClient() {
  const [imgIndex, setImgIndex]  = useState(0);
  const [fields,   setFields]    = useState<Fields>({ ime: "", telefon: "", adresa: "", grad: "" });
  const [errors,   setErrors]    = useState<Errors>({});
  const [kolicina, setKolicina]  = useState(1);
  const [loading,  setLoading]   = useState(false);
  const [submitted,setSubmitted] = useState(false);
  const [serverErr,setServerErr] = useState<string | null>(null);
  const [openFaq,  setOpenFaq]   = useState<number | null>(null);
  const [secs,     setSecs]      = useState<number | null>(null);
  const [stock,    setStock]     = useState<number | null>(null);
  const [buyers,   setBuyers]    = useState<typeof RECENT_BUYERS>([]);

  const IMAGES = ["/masina1.jpeg", "/masina2.png"];

  useEffect(() => {
    const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    setSecs(rand(18, 42) * 60);
    setStock(rand(3, 9));
    // pick 3 random buyers from the list
    const shuffled = [...RECENT_BUYERS].sort(() => Math.random() - 0.5).slice(0, 3);
    setBuyers(shuffled);
    const id = setInterval(() => {
      setSecs(prev => {
        if (prev === null) return null;
        if (prev <= 1) return rand(20, 40) * 60;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  function setField(key: keyof Fields, val: string) {
    setFields(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e: Errors = {};
    if (!fields.ime.trim())     e.ime     = "Unesite ime i prezime";
    if (!fields.telefon.trim()) e.telefon = "Unesite broj telefona";
    if (!fields.adresa.trim())  e.adresa  = "Unesite adresu";
    if (!fields.grad.trim())    e.grad    = "Unesite grad";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true); setServerErr(null);
    try {
      const externalId = (() => { try { return localStorage.getItem("_crt_eid") || ""; } catch { return ""; } })();
      const res = await fetch("/api/masina-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, kolicina, externalId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Greška");
      event("Purchase", { value: PRICE * kolicina + DELIVERY, currency: "BAM", content_name: "Masina za Sisanje Ovaca 850W" }, data.orderNumber);
      setSubmitted(true);
      document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setServerErr("Došlo je do greške. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  const total = PRICE * kolicina + DELIVERY;

  return (
    <>
      <style suppressHydrationWarning>{`
        @keyframes msn-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        .msn-dot { animation: msn-pulse 2s ease-in-out infinite; }
        @keyframes msn-badge-in { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .msn-badge { animation: msn-badge-in 0.5s ease both; }
        .msn-img-btn { border:none; background:none; cursor:pointer; padding:0; border-radius:12px; overflow:hidden; transition:transform 150ms; }
        .msn-img-btn:hover { transform:scale(1.04); }
        .msn-img-btn.active { outline:2.5px solid ${ACCENT}; }
        .msn-faq-item { border-bottom:1px solid #F0F0F0; }
        .msn-faq-item:last-child { border-bottom:none; }
        .msn-input:focus { outline:none; border-color:${ACCENT} !important; box-shadow:0 0 0 3px rgba(255,107,0,0.10); }
        .msn-input::placeholder { color:#9CA3AF; }
        .msn-submit { background:linear-gradient(135deg,#FF7A20 0%,#D94000 100%); transition:transform 150ms, box-shadow 150ms; }
        .msn-submit:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(255,80,0,0.38); }
        .msn-submit:active { transform:scale(0.97); }
        .msn-feature-card { transition:transform 200ms, box-shadow 200ms; }
        .msn-feature-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.09); }
        @media (max-width:768px) {
          .msn-hero-grid { flex-direction:column !important; }
          .msn-hero-img  { width:100% !important; }
          .msn-hero-info { padding:28px 16px 0 !important; }
          .msn-set-split { flex-direction:column !important; }
          .msn-set-img   { width:100% !important; max-height:280px !important; }
          .msn-set-cards { width:100% !important; }
          .msn-feat-grid { grid-template-columns:1fr 1fr !important; }
        }
        @media (max-width:480px) {
          .msn-feat-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <section style={{ background: "#fff", overflow: "hidden", position: "relative", borderBottom:"1px solid #F0F0F0" }}>

        {/* subtle warm glow top-right */}
        <div aria-hidden style={{ position:"absolute", top:"-20%", right:"-5%", width:"55%", height:"90%",
          background:"radial-gradient(ellipse, rgba(255,107,0,0.06) 0%, transparent 65%)", pointerEvents:"none", zIndex:0 }} />

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"clamp(40px,6vw,80px) clamp(16px,4vw,48px)", position:"relative", zIndex:1 }}>
          <div className="msn-hero-grid" style={{ display:"flex", gap:"clamp(32px,5vw,64px)", alignItems:"center" }}>

            {/* ── IMAGE COLUMN ── */}
            <div className="msn-hero-img" style={{ flex:"0 0 48%", display:"flex", flexDirection:"column", gap:12 }}>

              {/* main image */}
              <div style={{
                position:"relative", borderRadius:20, overflow:"hidden",
                background:"linear-gradient(145deg, #F7F4EF 0%, #EEEBE4 100%)",
                border:"1px solid #E8E4DE",
                aspectRatio:"1/1",
                boxShadow:"0 4px 32px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)",
              }}>
                {/* soft orange glow under machine */}
                <div aria-hidden style={{
                  position:"absolute", bottom:"-10%", left:"50%", transform:"translateX(-50%)",
                  width:"60%", height:"35%", borderRadius:"50%",
                  background:"radial-gradient(ellipse,rgba(255,107,0,0.15) 0%,transparent 70%)",
                  zIndex:0, pointerEvents:"none",
                }} />

                {IMAGES.map((src, i) => (
                  <div key={i} style={{
                    position:"absolute", inset:0, zIndex: i === imgIndex ? 1 : 0,
                    opacity: i === imgIndex ? 1 : 0, transition:"opacity 350ms ease",
                  }}>
                    <Image src={src} alt={i === 0 ? "Mašina za šišanje ovaca 850W" : "Kompletni set u koferu"} fill
                      style={{ objectFit:"cover" }} priority={i === 0} />
                  </div>
                ))}

                {/* badge top-left */}
                <div className="msn-badge" style={{
                  position:"absolute", top:14, left:14, zIndex:10,
                  display:"flex", flexDirection:"column", gap:6,
                }}>
                  <span style={{
                    background:ACCENT, backdropFilter:"blur(8px)",
                    color:"#fff", fontSize:10, fontWeight:800, letterSpacing:"0.12em",
                    textTransform:"uppercase", padding:"5px 10px", borderRadius:6,
                    fontFamily:"var(--font-manrope),sans-serif", width:"fit-content",
                  }}>850W Pro</span>
                </div>

                {/* viewer count top-right */}
                <div style={{
                  position:"absolute", top:14, right:14, zIndex:10,
                  display:"flex", alignItems:"center", gap:5,
                  background:"rgba(10,10,10,0.55)", backdropFilter:"blur(8px)",
                  borderRadius:8, padding:"6px 10px",
                }}>
                  <span className="msn-dot" style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444", display:"inline-block" }} />
                  <span style={{ fontSize:11, fontWeight:700, color:"#fff", fontFamily:"var(--font-manrope),sans-serif" }}>47 gleda</span>
                </div>

                {/* image counter */}
                <div style={{
                  position:"absolute", bottom:12, right:12, zIndex:10,
                  background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)",
                  borderRadius:6, padding:"4px 10px",
                  fontSize:11, fontWeight:700, color:"#fff", fontFamily:"var(--font-manrope),sans-serif",
                }}>
                  {imgIndex + 1} / {IMAGES.length}
                </div>
              </div>

              {/* thumbnails */}
              <div style={{ display:"flex", gap:10 }}>
                {IMAGES.map((src, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={`msn-img-btn${i === imgIndex ? " active" : ""}`}
                    aria-label={`Slika ${i + 1}`}
                    style={{ flex:1, aspectRatio:"1/1", position:"relative", borderRadius:12, background:"#F2EFE9" }}>
                    <Image src={src} alt="" fill style={{ objectFit:"cover", borderRadius:12 }} />
                    {i === imgIndex && <div style={{ position:"absolute", inset:0, background:"rgba(255,107,0,0.15)", borderRadius:12 }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* ── INFO COLUMN ── */}
            <div className="msn-hero-info" style={{ flex:1 }}>

              {/* category */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span style={{
                  fontSize:10, fontWeight:700, letterSpacing:"0.14em",
                  textTransform:"uppercase", color:ACCENT,
                  fontFamily:"var(--font-manrope),sans-serif",
                }}>Profesionalni alat za šišanje</span>
                <span style={{ width:24, height:1, background:"rgba(255,107,0,0.4)", display:"inline-block" }} />
                <span style={{
                  fontSize:10, fontWeight:600, letterSpacing:"0.1em",
                  textTransform:"uppercase", color:"rgba(0,0,0,0.30)",
                  fontFamily:"var(--font-manrope),sans-serif",
                }}>850W</span>
              </div>

              {/* H1 */}
              <h1 style={{
                fontSize:"clamp(30px,4vw,50px)", fontWeight:900, lineHeight:1.06,
                letterSpacing:"-0.03em", color:"#0A0A0A", marginBottom:16,
                fontFamily:"var(--font-manrope),sans-serif",
              }}>
                Mašina za šišanje<br />
                <span style={{ color:ACCENT }}>ovaca 850W</span>
              </h1>

              {/* stars */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
                <div style={{ display:"flex", gap:2 }}>
                  {Array.from({length:5}).map((_,i) => (
                    <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:"#0A0A0A", fontFamily:"var(--font-manrope),sans-serif" }}>4,9</span>
                <span style={{ fontSize:13, color:"rgba(0,0,0,0.40)", fontFamily:"var(--font-manrope),sans-serif" }}>· 340+ zadovoljnih kupaca</span>
              </div>

              {/* price block */}
              <div style={{
                background:"linear-gradient(135deg,#FFF8F4,#FFF3EB)",
                border:"1px solid rgba(255,107,0,0.15)",
                borderRadius:16, padding:"20px 22px", marginBottom:20,
              }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:8, flexWrap:"wrap" }}>
                  <span style={{
                    fontSize:"clamp(38px,5vw,52px)", fontWeight:900, color:"#0A0A0A",
                    letterSpacing:"-0.04em", lineHeight:1,
                    fontFamily:"var(--font-manrope),sans-serif",
                  }}>89,90 KM</span>
                  <span style={{ fontSize:16, color:"rgba(0,0,0,0.30)", textDecoration:"line-through", fontFamily:"var(--font-manrope),sans-serif" }}>169,90 KM</span>
                  <span style={{ background:"#16A34A", color:"#fff", fontSize:12, fontWeight:800, padding:"4px 9px", borderRadius:6, fontFamily:"var(--font-manrope),sans-serif" }}>
                    UŠTEDI 80 KM
                  </span>
                </div>
                {/* stock indicator */}
                {stock !== null && (
                  <div style={{
                    display:"inline-flex", alignItems:"center", gap:7,
                    background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.20)",
                    borderRadius:8, padding:"5px 12px", marginBottom:10,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span style={{ fontSize:12, fontWeight:700, color:"#EF4444", fontFamily:"var(--font-manrope),sans-serif" }}>
                      Ostalo još <strong>{stock}</strong> komada na zalihi
                    </span>
                  </div>
                )}

                <p style={{ fontSize:12, color:"rgba(0,0,0,0.45)", margin:"0 0 14px", fontFamily:"var(--font-manrope),sans-serif" }}>
                  +10,00 KM dostava · Plaćanje pouzećem · Nema skrivenih troškova
                </p>

                {/* countdown */}
                {secs !== null && (
                  <div style={{
                    display:"flex", alignItems:"center", gap:10,
                    background:"rgba(255,255,255,0.70)", border:"1px solid rgba(255,107,0,0.20)",
                    borderRadius:10, padding:"10px 14px",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontSize:12, color:"rgba(0,0,0,0.50)", fontFamily:"var(--font-manrope),sans-serif", flexShrink:0 }}>
                      Akcijska cijena ističe za:
                    </span>
                    <span style={{ fontSize:14, fontWeight:900, color:ACCENT, letterSpacing:"0.06em", fontFamily:"var(--font-manrope),sans-serif", fontVariantNumeric:"tabular-nums" }}>
                      {String(Math.floor(secs/3600)).padStart(2,"0")}:{String(Math.floor((secs%3600)/60)).padStart(2,"0")}:{String(secs%60).padStart(2,"0")}
                    </span>
                  </div>
                )}
              </div>

              {/* what's in the box preview */}
              <div style={{ marginBottom:24 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(0,0,0,0.35)", marginBottom:12, fontFamily:"var(--font-manrope),sans-serif" }}>
                  Šta dobijate u setu
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {SET_ITEMS.map(item => (
                    <div key={item.title} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{ fontSize:13, color:"rgba(0,0,0,0.70)", fontFamily:"var(--font-manrope),sans-serif" }}>
                        {item.title}
                        {item.badge && <span style={{ marginLeft:6, background:"rgba(22,163,74,0.15)", color:"#4ADE80", fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:4 }}>{item.badge}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  event("AddToCart", { content_name: "Masina za Sisanje Ovaca 850W", value: PRICE, currency: "BAM" });
                  document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  background:`linear-gradient(135deg, #FF7A20 0%, #D94000 100%)`,
                  color:"#fff", border:"none", borderRadius:14, padding:"17px 32px",
                  fontFamily:"var(--font-manrope),sans-serif", fontWeight:800, fontSize:17,
                  cursor:"pointer", letterSpacing:"0.01em", marginBottom:12,
                  boxShadow:"0 8px 32px rgba(255,80,0,0.38)",
                  transition:"transform 160ms, box-shadow 160ms",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Naruči odmah · 89,90 KM
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <p style={{ textAlign:"center", fontSize:12, color:"rgba(0,0,0,0.35)", fontFamily:"var(--font-manrope),sans-serif" }}>
                Naruči bez plaćanja · Platite gotovinom pri preuzimanju
              </p>

              {/* warranty badge */}
              <div style={{
                display:"flex", alignItems:"center", gap:14,
                background:"linear-gradient(135deg,#0F0F0F,#1C1C1C)",
                borderRadius:14, padding:"14px 18px", marginTop:4,
                border:"1px solid rgba(255,255,255,0.08)",
                boxShadow:"0 4px 20px rgba(0,0,0,0.12)",
              }}>
                <div style={{
                  width:40, height:40, borderRadius:11, flexShrink:0,
                  background:"linear-gradient(135deg,rgba(255,107,0,0.22),rgba(255,107,0,0.08))",
                  border:"1px solid rgba(255,107,0,0.30)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:"#fff", fontFamily:"var(--font-manrope),sans-serif", letterSpacing:"-0.01em" }}>
                      1 godina garancije
                    </span>
                  </div>
                  <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.38)", fontFamily:"var(--font-manrope),sans-serif" }}>
                    Servis i zamjena dijelova · Bez skrivenih uvjeta
                  </p>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:22, fontWeight:900, color:"#fff", fontFamily:"var(--font-manrope),sans-serif", lineHeight:1, letterSpacing:"-0.04em" }}>12</div>
                  <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.35)", fontFamily:"var(--font-manrope),sans-serif", letterSpacing:"0.06em", textTransform:"uppercase" }}>mjeseci</div>
                </div>
              </div>

              {/* trust row */}
              <div style={{ display:"flex", gap:16, marginTop:16, flexWrap:"wrap" }}>
                {[
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label:"Pouzeće" },
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, label:"Dostava 10 KM" },
                  { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label:"14 dana povrat" },
                ].map(t => (
                  <div key={t.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ color:"rgba(0,0,0,0.35)" }}>{t.icon}</span>
                    <span style={{ fontSize:12, color:"rgba(0,0,0,0.40)", fontFamily:"var(--font-manrope),sans-serif" }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ŠTA DOBIJATE U SETU
      ════════════════════════════════════════════════ */}
      <section style={{ background:"#F8F8F8", padding:"clamp(56px,8vw,96px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>

          <div style={{ textAlign:"center", marginBottom:"clamp(32px,5vw,48px)" }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:ACCENT, fontFamily:"var(--font-manrope),sans-serif" }}>Kompletni set</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, color:"#0A0A0A", letterSpacing:"-0.03em", margin:"12px 0 10px", fontFamily:"var(--font-manrope),sans-serif" }}>
              Sve što vam treba,<br/>u jednoj kutiji
            </h2>
            <p style={{ fontSize:15, color:"rgba(0,0,0,0.45)", maxWidth:440, margin:"0 auto", fontFamily:"var(--font-manrope),sans-serif", lineHeight:1.65 }}>
              Otvorite kofer i odmah ste spremni za rad. Nema dodatnih troškova.
            </p>
          </div>

          {/* split: image left — cards right */}
          <div className="msn-set-split" style={{ display:"flex", gap:"clamp(20px,4vw,40px)", alignItems:"stretch" }}>

            {/* image panel */}
            <div className="msn-set-img" style={{
              flex:"0 0 42%", borderRadius:24, overflow:"hidden",
              background:"linear-gradient(145deg,#F2EFE9,#E8E4DC)",
              border:"1px solid #E0DAD0", position:"relative", minHeight:360,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <div aria-hidden style={{
                position:"absolute", bottom:"5%", left:"50%", transform:"translateX(-50%)",
                width:"70%", height:"30%", borderRadius:"50%",
                background:"radial-gradient(ellipse,rgba(255,107,0,0.12) 0%,transparent 70%)",
                pointerEvents:"none",
              }} />
              <Image
                src="/masina2.png"
                alt="Kompletni set u koferu"
                width={480} height={400}
                style={{ width:"88%", height:"auto", objectFit:"contain", position:"relative", zIndex:1 }}
              />
              <div style={{
                position:"absolute", bottom:18, left:"50%", transform:"translateX(-50%)",
                background:"rgba(10,10,10,0.60)", backdropFilter:"blur(8px)",
                borderRadius:10, padding:"7px 16px", whiteSpace:"nowrap",
                fontSize:12, fontWeight:700, color:"#fff", fontFamily:"var(--font-manrope),sans-serif",
                letterSpacing:"0.04em",
              }}>
                Kofer za prenošenje — uključen u setu
              </div>
            </div>

            {/* cards */}
            <div className="msn-set-cards" style={{ flex:1, display:"flex", flexDirection:"column", gap:14 }}>
              {SET_ITEMS.map((item, i) => (
                <div key={i} style={{
                  display:"flex", gap:16, alignItems:"flex-start",
                  background: i === 1 ? "linear-gradient(135deg,#F0FDF4,#DCFCE7)" : "#fff",
                  border: i === 1 ? "1.5px solid rgba(22,163,74,0.22)" : "1.5px solid #EBEBEB",
                  borderRadius:18, padding:"18px 20px",
                  boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <div style={{
                    width:46, height:46, borderRadius:13, flexShrink:0,
                    background: i === 1 ? "rgba(22,163,74,0.10)" : "rgba(255,107,0,0.07)",
                    border: i === 1 ? "1.5px solid rgba(22,163,74,0.18)" : "1.5px solid rgba(255,107,0,0.12)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color: i === 1 ? "#16A34A" : ACCENT,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:800, color:"#0A0A0A", fontFamily:"var(--font-manrope),sans-serif", letterSpacing:"-0.01em" }}>
                        {item.title}
                      </span>
                      {item.badge && (
                        <span style={{ background:"#16A34A", color:"#fff", fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:5, fontFamily:"var(--font-manrope),sans-serif" }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize:13, color:"rgba(0,0,0,0.48)", margin:0, lineHeight:1.55, fontFamily:"var(--font-manrope),sans-serif" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════ */}
      <section style={{ background:"#F8F8F8", padding:"clamp(56px,8vw,96px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"clamp(36px,5vw,56px)" }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:ACCENT, fontFamily:"var(--font-manrope),sans-serif" }}>Tehničke karakteristike</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, color:"#0A0A0A", letterSpacing:"-0.03em", margin:"12px 0 0", fontFamily:"var(--font-manrope),sans-serif" }}>
              Profesionalna snaga,<br/>jednostavna upotreba
            </h2>
          </div>

          <div className="msn-feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"clamp(12px,2vw,20px)" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="msn-feature-card" style={{
                background:"#fff", borderRadius:18, padding:"24px 22px",
                border:"1.5px solid #F0F0F0",
                boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
              }}>
                <div style={{
                  width:48, height:48, borderRadius:14, marginBottom:14,
                  background:"rgba(255,107,0,0.08)", border:"1.5px solid rgba(255,107,0,0.14)",
                  display:"flex", alignItems:"center", justifyContent:"center", color:ACCENT,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize:14, fontWeight:800, color:"#0A0A0A", margin:"0 0 6px", fontFamily:"var(--font-manrope),sans-serif", letterSpacing:"-0.01em" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize:13, color:"rgba(0,0,0,0.48)", margin:0, lineHeight:1.6, fontFamily:"var(--font-manrope),sans-serif" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ORDER FORM
      ════════════════════════════════════════════════ */}
      <section id="order" style={{ background:"#fff", padding:"clamp(56px,8vw,96px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:ACCENT, fontFamily:"var(--font-manrope),sans-serif" }}>Naruči danas</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, color:"#0A0A0A", letterSpacing:"-0.03em", margin:"12px 0 10px", fontFamily:"var(--font-manrope),sans-serif" }}>
              Popunite narudžbu
            </h2>
            <p style={{ fontSize:15, color:"rgba(0,0,0,0.45)", fontFamily:"var(--font-manrope),sans-serif" }}>
              Plaćanje pouzećem · Dostava 1-3 radna dana
            </p>
          </div>

          {/* social proof strip */}
          {buyers.length > 0 && (
            <div style={{
              background:"rgba(255,107,0,0.05)",
              border:"1.5px solid rgba(255,107,0,0.18)",
              borderRadius:16, padding:"16px 18px", marginBottom:24,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{
                  width:7, height:7, borderRadius:"50%", background:ACCENT,
                  display:"inline-block", flexShrink:0,
                  boxShadow:`0 0 0 3px rgba(255,107,0,0.20)`,
                }} />
                <span style={{ fontSize:12, fontWeight:700, color:ACCENT, fontFamily:"var(--font-manrope),sans-serif" }}>
                  Aktivno danas — kupci iz cijele BiH
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {buyers.map((b, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{
                      width:32, height:32, borderRadius:"50%", flexShrink:0,
                      background:"rgba(255,107,0,0.12)",
                      border:"1.5px solid rgba(255,107,0,0.20)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:800, color:ACCENT,
                      fontFamily:"var(--font-manrope),sans-serif",
                    }}>
                      {b.name[0]}
                    </div>
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#0A0A0A", fontFamily:"var(--font-manrope),sans-serif" }}>
                        {b.name}
                      </span>
                      <span style={{ fontSize:13, color:"rgba(0,0,0,0.50)", fontFamily:"var(--font-manrope),sans-serif" }}>
                        {" "}iz {b.city} naručio
                      </span>
                    </div>
                    <span style={{ fontSize:11, color:"rgba(255,107,0,0.55)", fontFamily:"var(--font-manrope),sans-serif", flexShrink:0, fontWeight:600 }}>
                      {b.ago}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {submitted ? (
            <div style={{
              background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",
              border:"1.5px solid rgba(22,163,74,0.25)", borderRadius:24,
              padding:"48px 32px", textAlign:"center",
            }}>
              <div style={{
                width:64, height:64, borderRadius:"50%",
                background:"rgba(22,163,74,0.12)", border:"2px solid rgba(22,163,74,0.3)",
                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ fontSize:22, fontWeight:900, color:"#0A0A0A", margin:"0 0 10px", fontFamily:"var(--font-manrope),sans-serif" }}>
                Narudžba primljena!
              </h3>
              <p style={{ fontSize:14, color:"rgba(0,0,0,0.50)", margin:0, lineHeight:1.65, fontFamily:"var(--font-manrope),sans-serif" }}>
                Kontaktiramo vas u roku od 24h radi potvrde i dogovora o dostavi.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background:"#FAFAFA", border:"1.5px solid #F0F0F0",
              borderRadius:24, padding:"clamp(24px,4vw,36px)",
              display:"flex", flexDirection:"column", gap:16,
            }}>

              {/* fields */}
              {([
                { key:"ime",     label:"Ime i prezime",  placeholder:"Npr. Alen Begović", type:"text" },
                { key:"telefon", label:"Broj telefona",  placeholder:"Npr. 061 234 567",  type:"tel"  },
                { key:"adresa",  label:"Adresa",         placeholder:"Npr. Titova 12",    type:"text" },
                { key:"grad",    label:"Grad",           placeholder:"Npr. Sarajevo",     type:"text" },
              ] as { key: keyof Fields; label: string; placeholder: string; type: string }[]).map(f => (
                <div key={f.key}>
                  <label style={{
                    display:"block", fontSize:11, fontWeight:700,
                    color:"#374151", marginBottom:6,
                    fontFamily:"var(--font-manrope),sans-serif",
                    textTransform:"uppercase", letterSpacing:"0.07em",
                  }}>{f.label}</label>
                  <input
                    className="msn-input"
                    type={f.type}
                    placeholder={f.placeholder}
                    value={fields[f.key]}
                    onChange={e => setField(f.key, e.target.value)}
                    style={{
                      width:"100%", boxSizing:"border-box",
                      background:"#fff",
                      border:`1.5px solid ${errors[f.key] ? "#EF4444" : "#E5E7EB"}`,
                      borderRadius:10, padding:"13px 16px",
                      fontSize:14, color:"#111",
                      fontFamily:"var(--font-manrope),sans-serif", outline:"none",
                      transition:"border-color 0.15s, box-shadow 0.15s",
                    }}
                  />
                  {errors[f.key] && <p style={{ fontSize:11, color:"#EF4444", margin:"5px 0 0", fontFamily:"var(--font-manrope),sans-serif" }}>{errors[f.key]}</p>}
                </div>
              ))}

              {/* quantity */}
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:8, fontFamily:"var(--font-manrope),sans-serif", textTransform:"uppercase", letterSpacing:"0.07em" }}>
                  Količina
                </label>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <button type="button" onClick={() => setKolicina(k => Math.max(1, k - 1))}
                    style={{ width:40, height:40, border:"1.5px solid #E5E7EB", borderRadius:10, background:"#fff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#374151" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span style={{ fontSize:18, fontWeight:800, color:"#0A0A0A", minWidth:32, textAlign:"center", fontFamily:"var(--font-manrope),sans-serif" }}>{kolicina}</span>
                  <button type="button" onClick={() => setKolicina(k => Math.min(10, k + 1))}
                    style={{ width:40, height:40, border:"1.5px solid #E5E7EB", borderRadius:10, background:"#fff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#374151" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span style={{ fontSize:13, color:"rgba(0,0,0,0.45)", fontFamily:"var(--font-manrope),sans-serif" }}>
                    × 89,90 KM = <strong style={{ color:"#0A0A0A" }}>{(PRICE * kolicina).toFixed(2).replace(".",",")} KM</strong>
                  </span>
                </div>
              </div>

              {/* total */}
              <div style={{ background:"linear-gradient(135deg,#FFF8F4,#FFF3EB)", border:"1px solid rgba(255,107,0,0.15)", borderRadius:12, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <p style={{ margin:0, fontSize:12, color:"rgba(0,0,0,0.45)", fontFamily:"var(--font-manrope),sans-serif" }}>Ukupno s dostavom</p>
                  <p style={{ margin:0, fontSize:22, fontWeight:900, color:"#0A0A0A", fontFamily:"var(--font-manrope),sans-serif", letterSpacing:"-0.02em" }}>
                    {total.toFixed(2).replace(".",",")} KM
                  </p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ margin:0, fontSize:11, color:"rgba(0,0,0,0.35)", fontFamily:"var(--font-manrope),sans-serif" }}>Dostava</p>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:"rgba(0,0,0,0.55)", fontFamily:"var(--font-manrope),sans-serif" }}>10,00 KM</p>
                </div>
              </div>

              {serverErr && (
                <p style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#DC2626", margin:0, fontFamily:"var(--font-manrope),sans-serif" }}>
                  {serverErr}
                </p>
              )}

              <button type="submit" disabled={loading} className="msn-submit"
                style={{
                  color:"#fff", fontWeight:800, fontSize:16, border:"none",
                  borderRadius:12, padding:"16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily:"var(--font-manrope),sans-serif", letterSpacing:"-0.01em",
                  opacity: loading ? 0.7 : 1,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}
              >
                {loading ? "Slanje..." : (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Naruči odmah · Plaćanje pouzećem
                  </>
                )}
              </button>

              <p style={{ fontSize:11, color:"#9CA3AF", textAlign:"center", margin:0, fontFamily:"var(--font-manrope),sans-serif" }}>
                Bez predujma · Platite gotovinom pri preuzimanju
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════ */}
      <section style={{ background:"#F8F8F8", padding:"clamp(56px,8vw,80px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:ACCENT, fontFamily:"var(--font-manrope),sans-serif" }}>Česta pitanja</span>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,36px)", fontWeight:900, color:"#0A0A0A", letterSpacing:"-0.02em", margin:"12px 0 0", fontFamily:"var(--font-manrope),sans-serif" }}>
              Imate pitanje?
            </h2>
          </div>

          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F0F0F0", overflow:"hidden" }}>
            {FAQ.map((item, i) => (
              <div key={i} className="msn-faq-item">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"20px 24px", background:"none", border:"none", cursor:"pointer", textAlign:"left",
                  }}
                >
                  <span style={{ fontSize:15, fontWeight:700, color:"#0A0A0A", fontFamily:"var(--font-manrope),sans-serif", lineHeight:1.4, paddingRight:16 }}>
                    {item.q}
                  </span>
                  <div style={{
                    width:28, height:28, borderRadius:8, flexShrink:0,
                    background: openFaq === i ? ACCENT : "#F5F5F5",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"background 0.2s",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={openFaq === i ? "#fff" : "#666"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transition:"transform 0.2s", transform: openFaq === i ? "rotate(180deg)" : "none" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>
                {openFaq === i && (
                  <div style={{ padding:"0 24px 20px" }}>
                    <p style={{ fontSize:14, color:"rgba(0,0,0,0.55)", margin:0, lineHeight:1.7, fontFamily:"var(--font-manrope),sans-serif" }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
