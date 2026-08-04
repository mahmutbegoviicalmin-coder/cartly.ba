"use client";

import React, {
  useState, useEffect, useRef, FormEvent,
} from "react";
import { Manrope } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@vercel/analytics";
import { event } from "@/lib/fbpixel";
import OrderPopup from "./OrderPopup";
import ZirafaFloatingCTA from "./FloatingCTA";

const manrope = Manrope({ subsets: ["latin"], weight: ["400","500","600","700","800"], display: "swap" });

/* ─── TOKENS ──────────────────────────────────── */
const BLK    = "#0a0a1a";
const ACC    = "#0284C7";
const ACC2   = "#075985";
const ACCT   = "#F0F9FF";
const ACCMID = "#BAE6FD";
const GR     = "#64748B";
const BRDR   = "rgba(2,132,199,0.16)";
const BRDR2  = "rgba(10,10,26,0.08)";
const F      = manrope.style.fontFamily + ",-apple-system,sans-serif";
const EASE: [number,number,number,number] = [0.22,1,0.36,1];

const UNIT_PRICE = 169.90;
const OLD_PRICE  = 269.90;
const DELIVERY   = 10.00;
const TOTAL      = UNIT_PRICE + DELIVERY;
const DISCOUNT_PCT = Math.round((1 - UNIT_PRICE / OLD_PRICE) * 100);

function shippingDayText(): string {
  const day = new Date().getDay(); // 0=Ned, 5=Pet, 6=Sub
  return (day === 5 || day === 6 || day === 0) ? "šalje se u ponedjeljak" : "šalje se sutra";
}

function fmt(n: number) { return n.toFixed(2).replace(".", ",") + " KM"; }

/* ─── NOTIFICATIONS (samo muška imena) ───────────── */
const NOTIF_NAMES = [
  { name: "Amar H.",    city: "Sarajevo",     time: "upravo sada" },
  { name: "Emir K.",    city: "Tuzla",        time: "prije 2 min" },
  { name: "Haris M.",   city: "Mostar",       time: "prije 3 min" },
  { name: "Adnan S.",   city: "Zenica",       time: "upravo sada" },
  { name: "Kenan B.",   city: "Banja Luka",   time: "prije 5 min" },
  { name: "Damir P.",   city: "Bijeljina",    time: "upravo sada" },
  { name: "Faruk T.",   city: "Travnik",      time: "prije 4 min" },
  { name: "Nedžad Č.",  city: "Bihać",        time: "prije 7 min" },
  { name: "Elvir J.",   city: "Doboj",        time: "upravo sada" },
  { name: "Sead G.",    city: "Cazin",        time: "prije 6 min" },
  { name: "Amel R.",    city: "Brčko",        time: "upravo sada" },
  { name: "Zlatan V.",  city: "Livno",        time: "prije 9 min" },
  { name: "Rusmir A.",  city: "Goražde",      time: "prije 3 min" },
  { name: "Benjamin D.",city: "Konjic",       time: "upravo sada" },
  { name: "Semir L.",   city: "Zavidovići",   time: "prije 8 min" },
  { name: "Almir N.",   city: "Gradačac",     time: "prije 2 min" },
  { name: "Muhamed F.", city: "Visoko",       time: "upravo sada" },
  { name: "Denis O.",   city: "Kakanj",       time: "prije 5 min" },
  { name: "Ismet Č.",   city: "Gračanica",    time: "prije 10 min" },
  { name: "Tarik B.",   city: "Prijedor",     time: "upravo sada" },
];

const HERO_SLIDES = [
  { src: "/zirafa/heroslika.png",  alt: "Žirafa brusilica za zidove u upotrebi" },
  { src: "/zirafa/heroslika2.png", alt: "Žirafa brusilica za zidove detalj" },
];

const SET_ITEMS = [
  "Žirafa brusilica - glava i motor 710W",
  "Teleskopska šipka, podesiva 100-175cm",
  "5× brusni diskovi (razne granulacije)",
  "Adapter za priključak usisavača",
  "LED prsten za osvjetljenje 360°",
  "Torba za odlaganje i uputstvo za upotrebu",
];

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    title: "Snaga 710W",
    desc:  "Dovoljno za brzo i ravnomjerno brušenje svih vrsta zidnih površina.",
    tag:   null,
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8M12 8 6 3M12 8l6-5"/><circle cx="12" cy="8" r="2"/></svg>,
    title: "Teleskopska šipka 100-175cm",
    desc:  "Radite zidove i plafone bez ljestvi i skele, uz manje napora za ruke.",
    tag:   "Bez ljestvi",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
    title: "LED prsten za osvjetljenje",
    desc:  "360° osvjetljenje radne površine, radite precizno i u mračnijim prostorijama.",
    tag:   null,
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v10H4z"/><path d="M10 20h4M12 14v6"/></svg>,
    title: "Priključak za usisavač",
    desc:  "Odvod prašine kroz šipku - rad gotovo bez prašine u prostoriji.",
    tag:   "Manje prašine",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
    title: "Podesiva brzina 800-1750 o/min",
    desc:  "Prilagodite tempo brušenja vrsti i stanju površine.",
    tag:   null,
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8v8H8z"/></svg>,
    title: "Čičak sistem za brusni papir",
    desc:  "Promjena diska za par sekundi, bez alata i bez zastoja u radu.",
    tag:   null,
  },
];

const REVIEWS = [
  { name: "Almir",  city: "Sarajevo",    stars: 5, text: "Bojao sam se da neće imati dovoljno snage, al vala nema šta da prigovorim. Zid sam izgladio za pola vremena nego rukom. LED mi je upalio cijelu sobu, radio sam navečer bez problema." },
  { name: "Senad",  city: "Tuzla",       stars: 5, text: "Radim sa ovim već mjesec dana, ofarbao sam tri stana. Šipka se produžuje koliko ti treba, ne moraš na ljestve nikako. Preporučujem svakom ko farba plafone." },
  { name: "Mirsad", city: "Zenica",      stars: 5, text: "Iskreno nisam očekivao ovakav kvalitet za ovu cijenu. Diskovi se lako mijenjaju, prašina ide skoro sva u usisivač. Uštedio sam i vrijeme i leđa, ozbiljno." },
  { name: "Kenan",  city: "Mostar",      stars: 5, text: "Uzeo sam za renoviranje kuće, gips-karton sam izgladio ko staklo. Lagana je, ruka mi se nije umorila ni nakon par sati rada. Dostava stigla za dva dana." },
  { name: "Nihad",  city: "Banja Luka",  stars: 5, text: "Bio sam skeptičan zbog cijene ali stvarno vrijedi svaki feninga. Radim sitne majstorske poslove i ovo mi je sad glavni alat za zidove. Majstorski komad." },
  { name: "Adnan",  city: "Bihać",       stars: 5, text: "Kupio sam da ofarbam svoj stan, ostalo mi je vremena da pomognem i komšiji. Brzo se sastavlja i jednostavna je za korištenje i onima koji prvi put drže alat u ruci." },
];

const FAQ = [
  { q: "Za koje zidove i plafone se koristi?",  a: "Za sve vrste površina prije bojenja: gips-karton, glet masa, malter i beton. Idealna za pripremu zidova i plafona." },
  { q: "Da li je teška za rad iznad glave?",     a: "Ne, teleskopska šipka i lagana konstrukcija omogućavaju rad bez zamora ruku, bez ljestvi i bez skele." },
  { q: "Koliko brzo se mijenja brusni papir?",   a: "Čičak (velcro) sistem - papir mijenjate za par sekundi, bez ikakvog alata." },
  { q: "Diže li puno prašine tokom rada?",       a: "Ne, ima priključak za usisavač i odvod prašine kroz šipku, tako da je rad gotovo bez prašine." },
  { q: "Kako plaćam i kad stiže dostava?",       a: "Plaćanje je pouzećem prilikom preuzimanja, bez predujma. Dostava je Euro Express, rok isporuke 1-2 radna dana po cijeloj BiH." },
];

/* ─── HERO SLIDER ─────────────────────────────── */
function HeroSlider() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);
  const prev = () => setIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => setIdx(i => (i + 1) % HERO_SLIDES.length);

  return (
    <div className="z-hero-stage" style={{ position: "relative", width: "100%" }}>
      {/* Decorative blurred blobs */}
      <div aria-hidden style={{ position: "absolute", top: "-12%", right: "-14%", width: "58%", aspectRatio: "1/1", borderRadius: "50%", background: `radial-gradient(circle, ${ACCMID} 0%, transparent 70%)`, filter: "blur(6px)", opacity: 0.85, zIndex: 0 }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "40%", aspectRatio: "1/1", borderRadius: "50%", background: `radial-gradient(circle, ${ACC}22 0%, transparent 70%)`, filter: "blur(4px)", zIndex: 0 }} />

      <div className="z-hero-card" style={{ position: "relative", width: "100%", borderRadius: 26, overflow: "hidden", aspectRatio: "1/1", boxShadow: "0 32px 80px rgba(2,132,199,0.16), 0 0 0 1px rgba(0,0,0,0.06)", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={idx}
            src={HERO_SLIDES[idx].src}
            alt={HERO_SLIDES[idx].alt}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </AnimatePresence>

        {/* Bottom gradient for dot legibility */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "22%", background: "linear-gradient(to top, rgba(10,10,26,0.28), transparent)", pointerEvents: "none" }} />

        {/* Prev / next arrows */}
        <button aria-label="Prethodna slika" onClick={prev} className="z-hero-arrow z-hero-arrow-l">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button aria-label="Sljedeća slika" onClick={next} className="z-hero-arrow z-hero-arrow-r">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Dots */}
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 7, zIndex: 2 }}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Slika ${i + 1}`}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 22 : 7, height: 7, borderRadius: 4, border: "none", cursor: "pointer",
                background: i === idx ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "width 0.25s ease, background 0.25s ease",
                padding: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>

        {/* Discount ribbon */}
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 2, background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 900, fontFamily: F, padding: "6px 13px", borderRadius: 10, boxShadow: "0 4px 16px rgba(220,38,38,0.35)", letterSpacing: "-0.01em" }}>
          -{DISCOUNT_PCT}%
        </div>
      </div>

      {/* Floating rating chip */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
        className="z-hero-chip"
        style={{ position: "absolute", bottom: -18, left: 24, zIndex: 3, background: "#fff", borderRadius: 14, padding: "10px 16px", boxShadow: "0 12px 32px rgba(10,10,26,0.16), 0 0 0 1px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 10 }}
      >
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCT, border: `1.5px solid ${BRDR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.91 8.84 8.56 21.19a1.93 1.93 0 0 1-2.73 0L2.81 18.2a1.93 1.93 0 0 1 0-2.73L15.16 3.11a1.93 1.93 0 0 1 2.73 0L20.91 6.1a1.93 1.93 0 0 1 0 2.73z"/></svg>
        </div>
        <div>
          <div style={{ display: "flex", gap: 1, marginBottom: 2 }}>
            {[...Array(5)].map((_, i) => <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: BLK, fontFamily: F, whiteSpace: "nowrap" }}>4,9 · 640+ kupaca</div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── PURCHASE NOTIFICATION ───────────────────── */
function PurchaseNotification() {
  const [shown, setShown]         = useState(false);
  const [personIdx, setPersonIdx] = useState(0);
  const idxRef = useRef(0);
  useEffect(() => {
    const show = () => {
      setPersonIdx(idxRef.current % NOTIF_NAMES.length);
      idxRef.current++;
      setShown(true);
      setTimeout(() => setShown(false), 3000);
    };
    const t1 = setTimeout(show, 5000);
    const t2 = setInterval(show, 8000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);
  const p = NOTIF_NAMES[personIdx];
  return (
    <AnimatePresence>
      {shown && (
        <motion.div initial={{ x: "-110%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "-110%", opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 30 }}
          style={{ position: "fixed", bottom: 20, left: 16, zIndex: 9997, background: "#fff", borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 36px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12, maxWidth: 285, width: "calc(100vw - 32px)" }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, overflow: "hidden", background: ACCT, flexShrink: 0 }}>
            <img src="/zirafa/heroslika.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#16a34a", fontFamily: F, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block", flexShrink: 0 }} />
              Upravo naručeno
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: BLK, fontFamily: F, lineHeight: 1.2 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: GR, fontFamily: F, marginTop: 2 }}>{p.city} · {p.time}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── INLINE ORDER FORM ──────────────────────── */
type Fields = { ime: string; telefon: string; adresa: string; grad: string };
type Errs   = Partial<Record<keyof Fields, string>>;

function InlineField({ label, type = "text", placeholder = "", value, onChange, error }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "13px 14px", border: `1.5px solid ${error ? "#ef4444" : "rgba(0,0,0,0.1)"}`, borderRadius: 10, fontSize: 15, fontFamily: F, color: BLK, background: "#fff", outline: "none", boxSizing: "border-box", WebkitAppearance: "none" }}
        onFocus={e => { e.target.style.borderColor = ACC; e.target.style.boxShadow = `0 0 0 3px rgba(2,132,199,0.12)`; }}
        onBlur={e  => { e.target.style.borderColor = error ? "#ef4444" : "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none"; }}
      />
      {error && <p style={{ margin: "5px 0 0", fontSize: 11, color: "#ef4444", fontFamily: F }}>{error}</p>}
    </div>
  );
}

function InlineOrderForm() {
  const [fields, setFields]   = useState<Fields>({ ime: "", telefon: "", adresa: "", grad: "" });
  const [errors, setErrors]   = useState<Errs>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [orderNum, setOrderNum] = useState("");
  const [serverErr, setServerErr] = useState<string | null>(null);

  function validate(): Errs {
    const e: Errs = {};
    if (!fields.ime.trim() || fields.ime.trim().length < 2) e.ime = "Unesite ime i prezime";
    if (!fields.telefon.trim() || fields.telefon.replace(/\D/g, "").length < 8) e.telefon = "Unesite ispravan broj";
    if (!fields.adresa.trim()) e.adresa = "Unesite adresu";
    if (!fields.grad.trim()) e.grad = "Unesite grad";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerErr(null);
    try {
      event("InitiateCheckout", { content_name: "Žirafa Brusilica za Zidove", content_ids: ["zirafa-brusilica"], content_type: "product", value: TOTAL, currency: "BAM", num_items: 1 });
      const externalId = typeof localStorage !== "undefined" ? localStorage.getItem("_crt_eid") || "" : "";
      const res  = await fetch("/api/zirafa-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, externalId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      event("Purchase", { content_name: "Žirafa Brusilica za Zidove", content_ids: ["zirafa-brusilica"], content_type: "product", value: TOTAL, currency: "BAM", num_items: 1 }, data.orderNumber);
      track("order_submitted", { total: TOTAL, source: "zirafa-inline" });
      setOrderNum(data.orderNumber);
      setDone(true);
    } catch {
      setServerErr("Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: ACC, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 28px rgba(2,132,199,0.35)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: BLK, fontFamily: F, marginBottom: 6 }}>Narudžba primljena!</div>
        <div style={{ fontSize: 13, color: GR, fontFamily: F, marginBottom: 10 }}>Broj narudžbe: <strong style={{ color: BLK }}>{orderNum}</strong></div>
        <p style={{ fontSize: 14, color: GR, fontFamily: F, lineHeight: 1.7 }}>Narudžba je zaprimljena, paket {shippingDayText()} putem Euro Express-a.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="z-inline-row">
        <InlineField label="Ime i prezime" placeholder="Amar Hodžić" value={fields.ime} error={errors.ime}
          onChange={v => { setFields(f => ({ ...f, ime: v })); setErrors(e => ({ ...e, ime: undefined })); }} />
        <InlineField label="Telefon" type="tel" placeholder="061 234 567" value={fields.telefon} error={errors.telefon}
          onChange={v => { setFields(f => ({ ...f, telefon: v })); setErrors(e => ({ ...e, telefon: undefined })); }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="z-inline-row">
        <InlineField label="Adresa" placeholder="Ulica i broj" value={fields.adresa} error={errors.adresa}
          onChange={v => { setFields(f => ({ ...f, adresa: v })); setErrors(e => ({ ...e, adresa: undefined })); }} />
        <InlineField label="Grad" placeholder="Sarajevo" value={fields.grad} error={errors.grad}
          onChange={v => { setFields(f => ({ ...f, grad: v })); setErrors(e => ({ ...e, grad: undefined })); }} />
      </div>

      {serverErr && (
        <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#ef4444", fontFamily: F }}>{serverErr}</div>
      )}

      {/* Order summary breakdown */}
      <div style={{ background: "#fafafa", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: F, color: GR }}>
          <span>Žirafa Brusilica za Zidove</span><span style={{ color: BLK, fontWeight: 600 }}>{fmt(UNIT_PRICE)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: 13, fontFamily: F, color: GR, gap: 12 }}>
          <span>Dostava · Euro Express · rok isporuke 1-2 dana</span><span style={{ color: BLK, fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(DELIVERY)}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 4, padding: "14px 16px", background: ACCT, border: `1px solid ${BRDR}`, borderRadius: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.08em" }}>Ukupno za plaćanje</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: ACC, fontFamily: F, letterSpacing: "-0.04em" }}>{fmt(TOTAL)}</span>
            <span style={{ fontSize: 12, color: GR, fontFamily: F }}>uklj. dostavu</span>
          </div>
        </div>
        <button type="submit" disabled={loading} className="z-inline-submit">
          {loading ? (
            <>
              <svg className="z-inline-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Šalje se...
            </>
          ) : (
            <>
              Naruči odmah
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </>
          )}
        </button>
      </div>
      <p style={{ fontSize: 11.5, color: GR, fontFamily: F, textAlign: "center", margin: 0 }}>Plaćanje pouzećem pri preuzimanju · Bez predujma</p>
    </form>
  );
}

/* ─── MAIN ────────────────────────────────────── */
export default function ZirafaClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [views, setViews]     = useState(860);
  const [popupOpen, setPopupOpen] = useState(false);

  function openPopup() {
    event("AddToCart", {
      content_name:     "Žirafa Brusilica za Zidove",
      content_category: "Alati",
      content_ids:      ["zirafa-brusilica"],
      content_type:     "product",
      value:            TOTAL,
      currency:         "BAM",
    });
    setPopupOpen(true);
  }

  useEffect(() => {
    setViews(Math.floor(640 + Math.random() * 210));
    const t = setInterval(() => setViews(v => v + Math.floor(Math.random() * 3 + 1)), 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href="#order"]');
      if (link) { e.preventDefault(); openPopup(); }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inner = { maxWidth: 1160, margin: "0 auto", padding: "0 28px" };
  const FIN   = { once: true, amount: 0.2 };
  const FADE  = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: FIN, transition: { duration: 0.52, ease: EASE } };

  return (
    <>
      <style suppressHydrationWarning>{`
        *{box-sizing:border-box;}
        .z-hero  { display:grid; grid-template-columns:47% 1fr; min-height:calc(100dvh - 72px); gap:0; align-items:stretch; }
        .z-hero-l{ padding:60px 52px 60px 0; display:flex; flex-direction:column; justify-content:center; }
        .z-hero-r{ display:flex; align-items:center; justify-content:center; padding:32px 40px 56px 40px; }
        .z-hero-stage { max-width:540px; width:100%; }
        .z-hero-arrow {
          position:absolute; top:50%; transform:translateY(-50%); z-index:2;
          width:36px; height:36px; border-radius:50%; border:none; cursor:pointer;
          background:rgba(255,255,255,0.92); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 4px 16px rgba(10,10,26,0.16);
          opacity:0; transition:opacity 0.2s ease, transform 0.15s ease;
        }
        .z-hero-card:hover .z-hero-arrow { opacity:1; }
        .z-hero-arrow:hover { transform:translateY(-50%) scale(1.08); }
        .z-hero-arrow-l { left:12px; }
        .z-hero-arrow-r { right:12px; }
        .z-hero-chip { transition:transform 0.2s ease; }
        .z-set-grid { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; }
        .z-rev-g { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .z-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:40px; margin-top:60px; }
        .z-split { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
        .z-split-r { position:relative; }
        .z-faq-btn{ width:100%; background:none; border:none; cursor:pointer; padding:20px 0; display:flex; align-items:center; justify-content:space-between; gap:16px; text-align:left; }
        .z-cta {
          display:inline-flex; align-items:center; gap:8px;
          background:${ACC}; color:#fff; padding:15px 30px; border-radius:10px;
          font-size:16px; font-weight:700; font-family:${F};
          text-decoration:none; border:none; cursor:pointer;
          transition:background 0.18s, transform 0.15s, box-shadow 0.18s;
          box-shadow:0 4px 18px rgba(2,132,199,0.35);
        }
        .z-cta:hover { background:${ACC2}; transform:translateY(-1px); box-shadow:0 6px 24px rgba(2,132,199,0.45); }
        .z-cta:active { transform:translateY(0); }
        .z-inline-submit {
          background:${ACC}; color:#fff; border:none; border-radius:12px; padding:14px 26px;
          font-size:15px; font-weight:800; font-family:${F}; cursor:pointer;
          display:flex; align-items:center; gap:8px; white-space:nowrap;
          box-shadow:0 4px 18px rgba(2,132,199,0.3); transition:transform 0.15s, box-shadow 0.15s;
        }
        .z-inline-submit:hover { transform:translateY(-1px); box-shadow:0 6px 22px rgba(2,132,199,0.4); }
        .z-inline-submit:disabled { opacity:0.7; cursor:not-allowed; }
        @keyframes z-inline-spin { to { transform:rotate(360deg); } }
        .z-inline-spin { animation:z-inline-spin 0.85s linear infinite; }
        @media(max-width:900px){
          .z-hero  { grid-template-columns:1fr; min-height:auto; }
          .z-hero-l{ padding:28px 20px 40px; order:2; }
          .z-hero-r{ padding:0 20px 44px; order:1; }
          .z-hero-stage { max-width:460px; width:100%; margin:0 auto; }
          .z-set-grid { grid-template-columns:1fr !important; gap:28px; }
          .z-rev-g { grid-template-columns:1fr !important; }
          .z-steps { grid-template-columns:1fr; gap:24px; margin-top:40px; }
          .z-split { grid-template-columns:1fr; gap:32px; }
          .z-split-r { order:-1; }
          .z-inline-row { grid-template-columns:1fr !important; }
          .z-hero-arrow { opacity:1; }
        }
        @media(max-width:640px){
          .z-rev-g { grid-template-columns:1fr !important; }
        }
        @keyframes z-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(0.78)} }
        .z-pulse-dot { width:8px; height:8px; border-radius:50%; background:#ef4444; display:inline-block; animation:z-pulse 1.6s ease-in-out infinite; }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{ background: `radial-gradient(120% 100% at 100% 0%, ${ACCT} 0%, #fff 55%)`, borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <div className="z-hero">
            <div className="z-hero-l">
              {/* Eyebrow kicker */}
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: ACCT, border: `1px solid ${BRDR}`, borderRadius: 20, padding: "6px 13px 6px 10px", marginBottom: 20, width: "fit-content" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: ACC2, fontFamily: F, letterSpacing: "0.02em" }}>Profesionalni alat za brušenje</span>
              </motion.div>

              {/* Social proof + views */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 1 }}>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <span style={{ fontSize: 13.5, color: GR, fontFamily: F, fontWeight: 500 }}>
                    <strong style={{ color: BLK, fontWeight: 700 }}>4,9</strong> · 640+ kupaca
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: GR, fontFamily: F, fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span className="z-pulse-dot" />
                  <span><strong style={{ color: BLK }}>{views}</strong> osoba trenutno gleda</span>
                </div>
              </div>

              <h1 style={{ fontFamily: F, fontSize: "clamp(32px,4.2vw,54px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.06, marginBottom: 22 }}>
                Zidovi glatki k&apos;o staklo.<br /><span style={{ color: ACC }}>Bez ljestvi, bez napora.</span>
              </h1>

              <p style={{ fontSize: 15.5, color: GR, fontFamily: F, lineHeight: 1.75, marginBottom: 26, maxWidth: 440 }}>
                Žirafa brusilica sa teleskopskom šipkom i LED osvjetljenjem. Izgladite zidove i plafone prije bojenja, bez skele i bez nepotrebne prašine u kući.
              </p>

              <ul style={{ listStyle: "none", margin: "0 0 30px", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {["Teleskopska šipka 100-175cm - radite bez ljestvi", "LED prsten 360° osvjetljava radnu površinu", "Priključak za usisavač - rad gotovo bez prašine"].map((t, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: ACCT, border: `1px solid ${BRDR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: 15, color: BLK, fontFamily: F, fontWeight: 500 }}>{t}</span>
                  </li>
                ))}
              </ul>

              {/* Price block */}
              <div style={{
                display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap",
                background: "#fff", border: `1px solid ${BRDR}`, borderRadius: 16, padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(2,132,199,0.07)", width: "fit-content",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: ACC, fontFamily: F, letterSpacing: "-0.04em" }}>{fmt(UNIT_PRICE)}</span>
                  <span style={{ fontSize: 18, color: "#94a3b8", fontFamily: F, textDecoration: "line-through" }}>{fmt(OLD_PRICE)}</span>
                </div>
                <span style={{ background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 800, fontFamily: F, padding: "5px 10px", borderRadius: 8, border: "1px solid #fecaca" }}>
                  UŠTEDITE {DISCOUNT_PCT}%
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <button onClick={openPopup} className="z-cta">
                  Naruči odmah
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <span style={{ fontSize: 12, color: GR, fontFamily: F }}>Plaćanje pouzećem · Bez predujma</span>
              </div>
            </div>

            <div className="z-hero-r">
              <HeroSlider />
            </div>
          </div>
        </div>
      </section>

      {/* ══ URGENCY BANNER ══ */}
      <div style={{ background: `linear-gradient(135deg, ${ACC} 0%, ${ACC2} 100%)`, padding: "14px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexWrap: "wrap", padding: "0 24px" }}>
          {[
            {
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
              text: "Zalihe ograničene - zadnjih 30 komada",
            },
            {
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c2 2 2 5 0 7.5A7 7 0 0 1 5 12c0-3 2-5 3-6-.3 1.5 0 2.5 1 3 .3-3 1.5-5 3-7z"/></svg>,
              text: "Akcijska cijena ističe uskoro",
            },
            {
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 10h4l3 3v4h-7z"/><circle cx="6.5" cy="19" r="1.8"/><circle cx="18" cy="19" r="1.8"/></svg>,
              text: "Dostava Euro Express - rok isporuke 1-2 dana",
            },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: F, letterSpacing: "0.01em" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ ŠTA SVE DOĐE U SETU ══ */}
      <section style={{ background: `linear-gradient(180deg,${ACCT} 0%,#fff 100%)`, padding: "80px 0 88px", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <div className="z-set-grid">
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.55, ease: EASE }}
              style={{ borderRadius: 22, overflow: "hidden", aspectRatio: "1/1", boxShadow: "0 24px 64px rgba(10,10,26,0.14), 0 0 0 1px rgba(0,0,0,0.06)", order: 2 }}
              className="z-set-img"
            >
              <img src="/zirafa/stasvedodje.png" alt="Šta sve dolazi u setu žirafa brusilice" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.55, ease: EASE }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: ACC, fontFamily: F, marginBottom: 16 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACC, display: "inline-block" }} />
                Sadržaj paketa
              </div>
              <h2 style={{ fontFamily: F, fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.08, marginBottom: 18 }}>
                Sve što vam treba,<br /><span style={{ color: ACC }}>u jednom paketu.</span>
              </h2>
              <p style={{ fontSize: 15, color: GR, fontFamily: F, lineHeight: 1.8, marginBottom: 28, maxWidth: 420 }}>
                Kompletan set spreman za upotrebu odmah po raspakivanju, bez dodatne kupovine dijelova.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SET_ITEMS.map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: ACCT, border: `1px solid ${BRDR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: 14.5, color: BLK, fontFamily: F, fontWeight: 500 }}>{t}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          <style suppressHydrationWarning>{`@media(max-width:900px){ .z-set-img { order:1 !important; } }`}</style>
        </div>
      </section>

      {/* ══ SPLIT — KARAKTERISTIKE ══ */}
      <section style={{ background: "#fff", padding: "96px 0", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <div className="z-split">
            <div>
              <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.55, ease: EASE }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: ACC, fontFamily: F, marginBottom: 18 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACC, display: "inline-block" }} />
                  Karakteristike
                </div>
                <h2 style={{ fontFamily: F, fontSize: "clamp(28px,3.8vw,46px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.06, marginBottom: 14 }}>
                  Napravljena za<br /><span style={{ color: ACC }}>ozbiljan posao.</span>
                </h2>
                <p style={{ fontSize: 15, color: GR, fontFamily: F, lineHeight: 1.75, marginBottom: 36, maxWidth: 420 }}>
                  Profesionalne performanse u lakom i praktičnom kućištu, pravljena za svakodnevnu upotrebu.
                </p>
              </motion.div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {FEATURES.map((f, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -22 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN}
                    transition={{ duration: 0.46, ease: EASE, delay: 0.06 + i * 0.07 }}
                    style={{ display: "flex", gap: 16, padding: "18px 0", borderBottom: i < FEATURES.length - 1 ? `1px solid ${BRDR2}` : "none", alignItems: "flex-start" }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: ACCT, border: `1px solid ${BRDR}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {f.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: BLK, fontFamily: F, letterSpacing: "-0.02em" }}>{f.title}</span>
                        {f.tag && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#dcfce7", borderRadius: 5, padding: "2px 8px", fontFamily: F, letterSpacing: "0.04em" }}>{f.tag}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: GR, fontFamily: F, lineHeight: 1.65 }}>{f.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.44, ease: EASE, delay: 0.5 }} style={{ marginTop: 32 }}>
                <button onClick={openPopup} className="z-cta">
                  Naruči odmah - {fmt(UNIT_PRICE)}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </motion.div>
            </div>

            <motion.div className="z-split-r" initial={{ opacity: 0, x: 32, scale: 0.97 }} whileInView={{ opacity: 1, x: 0, scale: 1 }} viewport={FIN} transition={{ duration: 0.58, ease: EASE, delay: 0.08 }}>
              <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", aspectRatio: "1/1", boxShadow: "0 28px 72px rgba(10,10,26,0.16), 0 0 0 1px rgba(0,0,0,0.06)" }}>
                <img src="/zirafa/heroslika2.png" alt="Žirafa brusilica u upotrebi na plafonu" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,26,0.45) 0%, transparent 55%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                  <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0, boxShadow: "0 0 8px rgba(74,222,128,0.8)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: F }}>Rad bez ljestvi, bez zamora ruku</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Steps */}
          <div className="z-steps">
            {[
              { num: "01", title: "Podesite šipku i disk", desc: "Izvucite teleskopsku šipku na željenu dužinu i postavite odgovarajući brusni disk." },
              { num: "02", title: "Uključite LED i usisavač", desc: "Povežite crijevo usisavača za manje prašine, uključite LED za bolju vidljivost." },
              { num: "03", title: "Brusite ravnomjernim pokretima", desc: "Prelazite preko površine kružnim pokretima, bez pritiskanja - mašina radi za vas." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.48, ease: EASE, delay: i * 0.1 }}
                style={{ borderTop: `3px solid ${BRDR}`, paddingTop: 24 }}>
                <div style={{ fontSize: "clamp(36px,4vw,52px)", fontWeight: 900, color: ACCMID, fontFamily: F, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 14, userSelect: "none" }}>{s.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: BLK, fontFamily: F, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: GR, fontFamily: F, lineHeight: 1.72 }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ══ */}
      <section style={{ background: ACCT, padding: "88px 0", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <motion.div {...FADE} style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: ACC, fontFamily: F, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACC, display: "inline-block" }} />
              Recenzije kupaca
            </div>
            <h2 style={{ fontFamily: F, fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.08, margin: "0 auto 12px", maxWidth: 480 }}>
              Stvarni kupci. <span style={{ color: ACC }}>Stvarni rezultati.</span>
            </h2>
            <p style={{ fontSize: 15, color: GR, fontFamily: F, margin: 0 }}>Više od 640 zadovoljnih kupaca širom Bosne i Hercegovine</p>
          </motion.div>

          <div className="z-rev-g">
            {REVIEWS.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.5, ease: EASE, delay: (i % 3) * 0.09 }}
                style={{ background: "#fff", borderRadius: 18, padding: "22px 22px 20px", boxShadow: "0 2px 18px rgba(10,10,26,0.07)", border: `1px solid ${BRDR2}`, display: "flex", flexDirection: "column" }}
              >
                <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill={s < r.stars ? "#f59e0b" : "#e0e4ef"} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: BLK, fontFamily: F, marginBottom: 18, fontWeight: 500, flex: 1 }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${ACC} 0%,${ACC2} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: F }}>{r.name[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: BLK, fontFamily: F, lineHeight: 1.2 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: GR, fontFamily: F }}>{r.city}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, padding: "3px 8px", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "#15803d", fontFamily: F }}>Verifikovano</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ background: "#fff", padding: "88px 0 72px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 28px" }}>
          <motion.div {...FADE}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: ACC, fontFamily: F, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACC, display: "inline-block" }} />FAQ
            </div>
            <h2 style={{ fontFamily: F, fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.08, marginBottom: 40 }}>Pitanja i odgovori.</h2>
          </motion.div>
          <div style={{ borderTop: `1px solid ${BRDR}` }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${BRDR}` }}>
                <button className="z-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: openFaq === i ? ACC : BLK, fontFamily: F, transition: "color 0.18s" }}>{item.q}</span>
                  <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={openFaq === i ? ACC : GR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.22 }} style={{ flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }} style={{ overflow: "hidden" }}>
                      <p style={{ fontSize: 14, lineHeight: 1.85, color: GR, paddingBottom: 22, margin: 0, fontFamily: F }}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INLINE NARUDŽBA ══ */}
      <section id="narudzba" style={{ background: ACCT, padding: "88px 0 108px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 28px" }}>
          <motion.div {...FADE} style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: ACC, fontFamily: F, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACC, display: "inline-block" }} />
              Naruči odmah
            </div>
            <h2 style={{ fontFamily: F, fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.08, marginBottom: 10 }}>
              Unesite podatke, naručite direktno.
            </h2>
            <p style={{ fontSize: 14.5, color: GR, fontFamily: F, margin: 0 }}>Plaćanje pouzećem prilikom preuzimanja, bez predujma.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.5, ease: EASE }}
            style={{ background: "#fff", borderRadius: 22, padding: "28px 26px", boxShadow: "0 24px 64px rgba(10,10,26,0.1), 0 0 0 1px rgba(0,0,0,0.04)" }}
          >
            <InlineOrderForm />
          </motion.div>
        </div>
      </section>

      <PurchaseNotification />
      <OrderPopup open={popupOpen} onClose={() => setPopupOpen(false)} />
      <ZirafaFloatingCTA onOrder={openPopup} />
    </>
  );
}
