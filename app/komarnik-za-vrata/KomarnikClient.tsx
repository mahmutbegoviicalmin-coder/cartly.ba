"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";
import { event } from "@/lib/fbpixel";

/* ─── CONSTANTS ──────────────────────────────────────── */
const ACCENT       = "#5C8B5A";
const ACCENT_DARK  = "#4A7248";
const ACCENT_LIGHT = "#EEF4ED";
const BG_CREAM     = "#F7F5F0";
const TEXT         = "#111111";
const TEXT_MUTED   = "#666666";
const DELIVERY     = 10.00;

/* ─── TYPES ──────────────────────────────────────────── */
type BundleId = 1 | 2 | 3;
type Fields   = { ime: string; telefon: string; adresa: string; grad: string };
type Errors   = Partial<Record<keyof Fields, string>>;

/* ─── BUNDLES ────────────────────────────────────────── */
const BUNDLES: {
  id: BundleId; qty: string; price: number;
  perPiece: string; badge: string | null; saving: string | null;
}[] = [
  { id: 1, qty: "1 komad",   price: 16.90, perPiece: "16,90", badge: null,                  saving: null },
  { id: 2, qty: "2 komada",  price: 29.90, perPiece: "14,95", badge: "Najpopularniji",      saving: "Uštedite 3,90 KM" },
  { id: 3, qty: "3 komada",  price: 39.90, perPiece: "13,30", badge: "Najbolja vrijednost", saving: "Uštedite 10,80 KM" },
];

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

/* ─── FEATURES ───────────────────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Montaža bez bušenja",
    desc: "Samolepljive trake učvršćuju okvir za ivice vrata za manje od 2 minute. Bez bušilice, bez alata.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    title: "Automatsko zatvaranje",
    desc: "Niz magneta duž središnjeg šava automatski zatvara komarnik čim prođete. Slobodnih ruku.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    title: "Gusto tkanje 1,2 mm",
    desc: "Fina mreža blokira komarce, muhe i sve insekte, a propušta svjež zrak i prirodno svjetlo.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    ),
    title: "Za sva standardna vrata",
    desc: "Dimenzije do 100 x 210 cm. Lako se skrati škarama. Odgovara i za klizna vrata.",
  },
];

/* ─── STEPS ──────────────────────────────────────────── */
const STEPS = [
  { num: "01", title: "Očistite ivice vrata",    desc: "Alkoholnom maramicom obrišite površinu gdje idu trake. Suho i čisto za savršenu adheziju." },
  { num: "02", title: "Zalijepite okvir",         desc: "Pritisnite samolepljive trake uz ivice vrata i čvrsto pritisnite 30 sekundi." },
  { num: "03", title: "Uživajte u svježem zraku", desc: "Zakačite gornji dio mreže za čičak traku. Magneti se sami poravnaju i gotovo." },
];

/* ─── SOCIAL PROOF ───────────────────────────────────── */
const RECENT_BUYERS = [
  { name: "Amira K.",   city: "Sarajeva",       qty: 2, ago: "prije 1 sat",   f: true  },
  { name: "Mirza H.",   city: "Zenice",         qty: 1, ago: "prije 2 sata",  f: false },
  { name: "Selma M.",   city: "Mostara",        qty: 3, ago: "jutros",        f: true  },
  { name: "Edin T.",    city: "Tuzle",          qty: 2, ago: "sinoć",         f: false },
  { name: "Lejla B.",   city: "Banje Luke",     qty: 1, ago: "jutros",        f: true  },
  { name: "Haris Ć.",   city: "Bihaća",         qty: 2, ago: "prije 4 sata",  f: false },
  { name: "Maida F.",   city: "Travnika",       qty: 3, ago: "jutros",        f: true  },
  { name: "Aldin N.",   city: "Goražda",        qty: 1, ago: "sinoć",         f: false },
  { name: "Jasmina R.", city: "Brčkog",         qty: 2, ago: "jutros",        f: true  },
  { name: "Damir P.",   city: "Cazina",         qty: 1, ago: "prije 5 sati",  f: false },
  { name: "Fatima S.",  city: "Konjica",        qty: 2, ago: "sinoć",         f: true  },
  { name: "Kenan O.",   city: "Livna",          qty: 1, ago: "jutros",        f: false },
  { name: "Aida M.",    city: "Zavidovića",     qty: 3, ago: "prije 2 sata",  f: true  },
  { name: "Senad I.",   city: "Lukavca",        qty: 2, ago: "sinoć",         f: false },
  { name: "Belma Č.",   city: "Doboja",         qty: 1, ago: "jutros",        f: true  },
  { name: "Tarik G.",   city: "Prijedora",      qty: 2, ago: "prije 3 sata",  f: false },
  { name: "Nermina V.", city: "Tešnja",         qty: 1, ago: "sinoć",         f: true  },
  { name: "Adnan B.",   city: "Gračanice",      qty: 3, ago: "jutros",        f: false },
  { name: "Dina H.",    city: "Visoko",         qty: 2, ago: "prije 6 sati",  f: true  },
  { name: "Ermin K.",   city: "Jajca",          qty: 1, ago: "sinoć",         f: false },
  { name: "Sanela T.",  city: "Gradačca",       qty: 2, ago: "jutros",        f: true  },
  { name: "Almir D.",   city: "Kaknja",         qty: 1, ago: "prije 1 sat",   f: false },
  { name: "Emina Š.",   city: "Žepča",          qty: 3, ago: "sinoć",         f: true  },
  { name: "Samir J.",   city: "Tuzle",          qty: 2, ago: "jutros",        f: false },
  { name: "Ilvana M.",  city: "Bugojna",        qty: 1, ago: "prije 2 sata",  f: true  },
  { name: "Jasmin F.",  city: "Čapljine",       qty: 2, ago: "sinoć",         f: false },
  { name: "Medina K.",  city: "Novog Travnika", qty: 1, ago: "jutros",        f: true  },
  { name: "Sanel R.",   city: "Sanskog Mosta",  qty: 3, ago: "sinoć",         f: false },
  { name: "Armin B.",   city: "Bihać",          qty: 2, ago: "prije 3 sata",  f: false },
  { name: "Azra N.",    city: "Sarajeva",       qty: 1, ago: "jutros",        f: true  },
];

/* ─── FAQ ────────────────────────────────────────────── */
const FAQ = [
  { q: "Za koja vrata odgovara komarnik?",     a: "Komarnik odgovara za sva standardna vrata do 100 x 210 cm. Može se lako skratiti škarama ako su vrata manja." },
  { q: "Da li treba alat za montažu?",         a: "Ne. Montaža je bez bušenja i bez alata. Samolepljive trake zalijepite uz ivice vrata, a mrežu zakačite za čičak traku. Traje oko 2 minute." },
  { q: "Da li propušta zrak i svjetlost?",     a: "Da. Fina mreža gustoće 1,2 mm propušta svjež zrak i prirodno svjetlo, a blokira komarce, muhe i sve insekte." },
  { q: "Kako se pere i čisti?",                a: "Mrežu možete skinuti i oprati ručno ili u mašini na 30 stepeni. Trake ostaju na vratima i ponovo se koriste." },
  { q: "Kako se vrši dostava i plaćanje?",     a: "Dostava je pouzećem putem BH Pošte ili kurirske službe. Plaćate gotovinom pri preuzimanju. Dostava košta 10 KM za sve pakete." },
];

const CUSTOMER_PHOTOS = [
  { src: "/komarnik/kupac-01.webp", caption: "Na ulaznim vratima stana" },
  { src: "/komarnik/kupac-02.webp", caption: "Balkon i vanjski izlaz" },
  { src: "/komarnik/kupac-03.webp", caption: "Kuhinja i dvorišni prolaz" },
  { src: "/komarnik/kupac-04.webp", caption: "Terasna i ljetna vrata" },
];


/* ─── SOCIAL NOTIFICATION ────────────────────────────── */
function SocialNotification() {
  const [state, setState] = useState<{ buyer: typeof RECENT_BUYERS[0]; hiding: boolean } | null>(null);
  const shuffled = useRef<typeof RECENT_BUYERS>([]);
  const idx      = useRef(0);
  const timers   = useRef<ReturnType<typeof setTimeout>[]>([]);

  function tick(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  function showNext() {
    const buyer = shuffled.current[idx.current % shuffled.current.length];
    idx.current++;
    setState({ buyer, hiding: false });
    // visible 5s, then slide out, then 24.5s gap = ~30s cycle
    tick(() => {
      setState(prev => prev ? { ...prev, hiding: true } : null);
      tick(() => { setState(null); tick(showNext, 24500); }, 420);
    }, 5000);
  }

  useEffect(() => {
    shuffled.current = [...RECENT_BUYERS].sort(() => Math.random() - 0.5);
    tick(showNext, 6000);
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return null;
  const { buyer, hiding } = state;
  const initials = buyer.name.split(" ").map(w => w[0]).join("").slice(0, 2);
  const qty      = buyer.qty === 1 ? "1 komad" : buyer.qty === 2 ? "2 komada" : "3 komada";
  const verb     = buyer.f ? "naručila" : "naručio";

  return (
    <div
      className={hiding ? "kml-notif-out" : "kml-notif-in"}
      style={{
        position: "fixed", bottom: 96, left: 20, zIndex: 9996,
        width: 308, background: "#fff", borderRadius: 14,
        padding: "13px 15px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1px solid rgba(0,0,0,0.07)",
        display: "flex", alignItems: "center", gap: 12,
        pointerEvents: "none",
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: "50%", background: ACCENT,
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "var(--font-manrope),sans-serif" }}>
          {initials}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.48, fontFamily: "var(--font-manrope),sans-serif", color: "#111" }}>
          <strong>{buyer.name}</strong>
          <span style={{ color: "#666" }}> iz {buyer.city} {verb} {qty}</span>
        </div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 3, fontFamily: "var(--font-manrope),sans-serif" }}>
          {buyer.ago}
        </div>
      </div>
    </div>
  );
}

/* ─── VIDEO CARD ─────────────────────────────────────── */
function VideoCard({ src, badge, caption, desc }: { src: string; badge: string; caption: string; desc: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); }
    else { v.pause(); }
  }

  return (
    <div style={{
      background: "#fff",
      borderRadius: 24,
      overflow: "hidden",
      boxShadow: "0 12px 48px rgba(92,139,90,0.14), 0 2px 12px rgba(0,0,0,0.05)",
      border: "1px solid rgba(92,139,90,0.14)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Badge bar */}
      <div style={{
        background: ACCENT, padding: "9px 20px",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "rgba(255,255,255,0.55)", display: "inline-block", flexShrink: 0,
        }} />
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#fff",
          letterSpacing: "0.1em", textTransform: "uppercase",
          fontFamily: "var(--font-manrope),sans-serif",
        }}>
          {badge}
        </span>
      </div>

      {/* Video area */}
      <div
        onClick={toggle}
        style={{ position: "relative", aspectRatio: "9/16", cursor: "pointer", background: "#0a0a0a", flexShrink: 0 }}
      >
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          loop
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: playing ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.22)",
          transition: "background 0.3s ease",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: playing ? 0 : 1,
            transform: playing ? "scale(0.75)" : "scale(1)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
            boxShadow: "0 6px 24px rgba(0,0,0,0.22)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={ACCENT} stroke="none">
              <polygon points="6 3 20 12 6 21 6 3"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div style={{ padding: "20px 22px 22px" }}>
        <div style={{
          fontSize: 15, fontWeight: 800, color: TEXT,
          fontFamily: "var(--font-manrope),sans-serif", marginBottom: 6,
          letterSpacing: "-0.01em",
        }}>
          {caption}
        </div>
        <div style={{
          fontSize: 13, color: TEXT_MUTED, lineHeight: 1.65,
          fontFamily: "var(--font-manrope),sans-serif",
        }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

/* ─── HERO URGENCY ───────────────────────────────────── */
function HeroUrgency() {
  const [viewers,  setViewers]  = useState(0);
  const [seconds,  setSeconds]  = useState(0);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    const base = 18 + Math.floor(Math.random() * 16); // 18-33
    const mins = 14 + Math.floor(Math.random() * 22); // 14-35 min countdown
    setViewers(base);
    setSeconds(mins * 60);
    setMounted(true);

    // Countdown every second
    const cd = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          // Reset to new random time when expired
          return (14 + Math.floor(Math.random() * 22)) * 60;
        }
        return s - 1;
      });
    }, 1000);

    // Viewer count drifts ±1 every 8-14s
    const vd = setInterval(() => {
      setViewers(v => Math.max(11, Math.min(42, v + (Math.random() > 0.45 ? 1 : -1))));
    }, 8000 + Math.random() * 6000);

    return () => { clearInterval(cd); clearInterval(vd); };
  }, []);

  if (!mounted) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
      {/* Price highlight */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        background: "#FFF8E7", border: "1px solid #F5D87A",
        borderRadius: 10, padding: "10px 14px", width: "fit-content",
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C97D0A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#8A5C00", fontFamily: "var(--font-manrope),sans-serif" }}>
          Akcijska cijena od{" "}
          <span style={{ fontFamily: "var(--font-display),sans-serif", fontSize: 16, letterSpacing: "-0.02em", color: "#6B4500" }}>
            16,90 KM
          </span>
          {" "} uz dostavu 10 KM
        </span>
      </div>

      {/* Countdown */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        background: "#FEF2F2", border: "1px solid #FCA5A5",
        borderRadius: 10, padding: "10px 14px", width: "fit-content",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#991B1B", fontFamily: "var(--font-manrope),sans-serif" }}>
          Ponuda ističe za:{" "}
          <span style={{ fontFamily: "var(--font-display),sans-serif", fontSize: 15, letterSpacing: "-0.01em", fontWeight: 800, color: "#DC2626" }}>
            {mm}:{ss}
          </span>
        </span>
      </div>

      {/* Live viewers */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 0",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: "#22C55E",
          display: "inline-block", flexShrink: 0,
          boxShadow: "0 0 0 3px rgba(34,197,94,0.25)",
          animation: "kml-pulse 2s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 13, color: TEXT_MUTED, fontFamily: "var(--font-manrope),sans-serif" }}>
          <strong style={{ color: TEXT }}>{viewers} osoba</strong> trenutno gleda ovaj proizvod
        </span>
      </div>
    </div>
  );
}

/* ─── FIELD ──────────────────────────────────────────── */
function Field({
  label, type = "text", placeholder = "",
  value, onChange, error,
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: "var(--font-manrope),sans-serif" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={ev => onChange(ev.target.value)}
        placeholder={placeholder}
        style={{
          padding: "13px 15px", borderRadius: 10,
          border: `1.5px solid ${error ? "#E5534B" : "#E0E0E0"}`,
          fontSize: 15, fontFamily: "var(--font-manrope),sans-serif",
          outline: "none", background: "#FAFAFA", color: TEXT,
          transition: "border-color 0.18s",
        }}
        onFocus={ev => (ev.target.style.borderColor = ACCENT)}
        onBlur={ev  => (ev.target.style.borderColor = error ? "#E5534B" : "#E0E0E0")}
      />
      {error && (
        <span style={{ fontSize: 12, color: "#E5534B", fontFamily: "var(--font-manrope),sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  );
}

/* ─── DISPLAY HEADING STYLE ──────────────────────────── */
const H = (size: string, mb = 0) => ({
  fontFamily: "var(--font-display), var(--font-manrope), sans-serif",
  fontSize:   size,
  fontWeight: 800,
  letterSpacing: "-0.03em",
  lineHeight: 1.08,
  color: TEXT,
  marginBottom: mb,
});

/* ─── COMPONENT ──────────────────────────────────────── */
export default function KomarnikClient() {
  const [bundle,    setBundle]    = useState<BundleId>(2);
  const [fields,    setFields]    = useState<Fields>({ ime: "", telefon: "", adresa: "", grad: "" });
  const [errors,    setErrors]    = useState<Errors>({});
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);

  const selectedBundle = BUNDLES.find(b => b.id === bundle)!;
  const total = selectedBundle.price + DELIVERY;

  function handleBundleSelect(id: BundleId) {
    setBundle(id);
    document.getElementById("narudzba")?.scrollIntoView({ behavior: "smooth" });
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!fields.ime.trim() || fields.ime.trim().length < 2)
      e.ime = "Unesite ime i prezime";
    if (!fields.telefon.trim() || fields.telefon.replace(/\D/g, "").length < 8)
      e.telefon = "Unesite ispravan broj telefona";
    if (!fields.adresa.trim())
      e.adresa = "Unesite adresu dostave";
    if (!fields.grad.trim())
      e.grad = "Unesite grad";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setServerErr(null);
    try {
      event("InitiateCheckout", { content_name: "Magnetni Komarnik za Vrata", value: total, currency: "BAM" });
      const externalId = typeof localStorage !== "undefined" ? localStorage.getItem("_crt_eid") || "" : "";
      const res = await fetch("/api/komarnik-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, bundle, externalId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      event("Purchase", { content_name: "Magnetni Komarnik za Vrata", value: total, currency: "BAM" }, data.orderNumber);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerErr("Greška pri slanju narudžbe. Molimo pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        .kml-hero-inner    { max-width:1160px; margin:0 auto; padding:0 24px; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
        .kml-section-inner { max-width:1160px; margin:0 auto; padding:0 24px; }
        .kml-bundles-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .kml-features-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
        .kml-steps-grid    { display:grid; grid-template-columns:repeat(3,1fr); gap:48px; }
        .kml-photos-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .kml-videos-grid   { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; max-width:680px; margin:40px auto 0; }
        .kml-form-grid     { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .kml-bundle-card   { border-radius:14px; padding:24px; cursor:pointer; border:2px solid #E8E8E8; background:#fff; transition:all 0.22s ease; position:relative; overflow:hidden; }
        .kml-bundle-card:hover { transform:translateY(-3px); box-shadow:0 10px 36px rgba(0,0,0,0.09); }
        .kml-bundle-card.active { border-color:${ACCENT}; background:#F4FAF4; box-shadow:0 4px 24px rgba(92,139,90,0.18); }
        .kml-feature-card  { background:#fff; border-radius:16px; padding:28px; border:1px solid #EBEBEB; transition:box-shadow 0.2s; }
        .kml-feature-card:hover { box-shadow:0 8px 32px rgba(0,0,0,0.07); }
        .kml-faq-item      { border-bottom:1px solid #EBEBEB; }
        .kml-faq-btn       { width:100%; background:none; border:none; cursor:pointer; padding:20px 0; display:flex; align-items:center; justify-content:space-between; gap:12px; text-align:left; }
        .kml-mini-bundle   { border-radius:12px; padding:14px 8px; border:2px solid #E0E0E0; background:#fff; cursor:pointer; text-align:center; transition:all 0.18s; position:relative; }
        .kml-mini-bundle.active { border-color:${ACCENT}; background:${ACCENT_LIGHT}; }
        .kml-cta-btn       { transition:transform 0.18s,box-shadow 0.18s; }
        .kml-cta-btn:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(92,139,90,0.45) !important; }
        @keyframes kml-fade-up { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes kml-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes kml-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(0.65)} }
        .kml-badge { animation:kml-fade-up 0.5s  cubic-bezier(0.22,1,0.36,1) 0.1s  both; }
        .kml-h1    { animation:kml-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s  both; }
        .kml-sub   { animation:kml-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.3s  both; }
        .kml-cta   { animation:kml-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.4s  both; }
        .kml-img   { animation:kml-fade-up 0.7s  cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .kml-dot   { animation:kml-pulse 2.2s ease-in-out infinite; }
        .kml-spin  { animation:kml-spin 1s linear infinite; }
        @keyframes kml-notif-in  { from{opacity:0;transform:translateX(calc(-100% - 20px))} to{opacity:1;transform:translateX(0)} }
        @keyframes kml-notif-out { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(calc(-100% - 20px))} }
        .kml-notif-in  { animation:kml-notif-in  0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .kml-notif-out { animation:kml-notif-out 0.35s ease-in both; }
        @media (max-width:860px) {
          .kml-hero-inner    { grid-template-columns:1fr; gap:0; }
          .kml-hero-text     { order:2; padding-top:32px; }
          .kml-img           { order:1; }
          .kml-bundles-grid  { grid-template-columns:1fr; }
          .kml-features-grid { grid-template-columns:1fr; }
          .kml-steps-grid    { grid-template-columns:1fr; gap:28px; }
          .kml-photos-grid   { grid-template-columns:repeat(2,1fr); }
          .kml-videos-grid   { grid-template-columns:1fr; max-width:380px; }
          .kml-form-grid     { grid-template-columns:1fr; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ background: BG_CREAM, paddingBottom: 72 }}>
        <div className="kml-hero-inner">

          {/* Text */}
          <div className="kml-hero-text">
            <div className="kml-badge" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: ACCENT_LIGHT, border: "1px solid rgba(92,139,90,0.3)",
              borderRadius: 100, padding: "6px 16px", marginBottom: 24,
            }}>
              <span className="kml-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-manrope),sans-serif" }}>
                Magnetni komarnik za vrata
              </span>
            </div>

            <h1 className="kml-h1" style={{
              fontFamily: "var(--font-display), var(--font-manrope), sans-serif",
              fontSize: "clamp(40px, 5.5vw, 68px)",
              fontWeight: 800, lineHeight: 1.05,
              letterSpacing: "-0.035em", color: TEXT, marginBottom: 20,
            }}>
              Svjež zrak unutra.<br />
              <span style={{ color: ACCENT }}>Komarci vani.</span>
            </h1>

            <p className="kml-sub" style={{
              fontSize: 17, lineHeight: 1.72, color: TEXT_MUTED,
              marginBottom: 32, maxWidth: 440,
              fontFamily: "var(--font-manrope),sans-serif",
            }}>
              Magnetni komarnik sa samozatvarajućim panelima. Montaža za 2 minute, bez bušenja i bez alata.
            </p>

            <div className="kml-cta" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <a
                  href="#narudzba"
                  className="kml-cta-btn"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: ACCENT, color: "#fff", padding: "15px 30px",
                    borderRadius: 12, fontSize: 16, fontWeight: 700,
                    textDecoration: "none", fontFamily: "var(--font-manrope),sans-serif",
                    boxShadow: "0 4px 20px rgba(92,139,90,0.35)",
                  }}
                >
                  Naruči odmah
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
                <span style={{ fontSize: 14, color: TEXT_MUTED, fontFamily: "var(--font-manrope),sans-serif" }}>
                  od <strong style={{ color: TEXT, fontWeight: 800 }}>16,90 KM</strong> uz dostavu 10 KM
                </span>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { path: <polyline points="20 6 9 17 4 12"/>,                                                                                           label: "Plaćanje pouzećem" },
                  { path: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>, label: "Dostava po BiH" },
                  { path: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,                                                                       label: "Bez bušenja" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      {item.path}
                    </svg>
                    <span style={{ fontSize: 13, color: TEXT_MUTED, fontFamily: "var(--font-manrope),sans-serif" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <HeroUrgency />
          </div>

          {/* Hero image */}
          <div className="kml-img" style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "4/5", width: "100%" }}>
            <Image
              src="/komarnik/hero.webp"
              alt="Magnetni komarnik za vrata"
              fill
              priority
              style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
          </div>

        </div>
      </section>

      {/* ── BUNDLES ───────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "72px 0" }}>
        <div className="kml-section-inner">
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-manrope),sans-serif" }}>
              Odaberite paket
            </span>
          </div>
          <h2 style={{ ...H("clamp(28px,4vw,42px)", 48), textAlign: "center" }}>
            Ušteđujete više uz veći paket.
          </h2>
          <div className="kml-bundles-grid">
            {BUNDLES.map(b => (
              <div
                key={b.id}
                className={`kml-bundle-card${bundle === b.id ? " active" : ""}`}
                onClick={() => setBundle(b.id)}
              >
                {b.badge && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    background: ACCENT, color: "#fff", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    textAlign: "center", padding: "7px 0",
                    fontFamily: "var(--font-manrope),sans-serif",
                  }}>
                    {b.badge}
                  </div>
                )}
                <div style={{ marginTop: b.badge ? 30 : 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, marginBottom: 8, fontFamily: "var(--font-manrope),sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {b.qty}
                  </div>
                  <div style={{ ...H("38px", 4) }}>{fmt(b.price)}</div>
                  <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 16, fontFamily: "var(--font-manrope),sans-serif" }}>
                    {b.perPiece} KM po komadu
                  </div>
                  {b.saving && (
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: ACCENT,
                      background: ACCENT_LIGHT, borderRadius: 6, padding: "4px 10px",
                      display: "inline-block", marginBottom: 16,
                      fontFamily: "var(--font-manrope),sans-serif",
                    }}>
                      {b.saving}
                    </div>
                  )}
                  <button
                    onClick={ev => { ev.stopPropagation(); handleBundleSelect(b.id); }}
                    style={{
                      width: "100%", padding: "12px 0", marginTop: b.saving ? 0 : 16,
                      background: bundle === b.id ? ACCENT : "transparent",
                      color: bundle === b.id ? "#fff" : TEXT,
                      border: `1.5px solid ${bundle === b.id ? ACCENT : "#D0D0D0"}`,
                      borderRadius: 10, fontSize: 14, fontWeight: 700,
                      fontFamily: "var(--font-manrope),sans-serif",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {bundle === b.id ? "Odabrano" : "Odaberi i naruči"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section style={{ background: BG_CREAM, padding: "72px 0" }}>
        <div className="kml-section-inner">
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-manrope),sans-serif" }}>
              Zašto komarnik
            </span>
          </div>
          <h2 style={{ ...H("clamp(28px,4vw,42px)", 48), textAlign: "center" }}>
            Dizajniran za udobnost.
          </h2>
          <div className="kml-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="kml-feature-card">
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: ACCENT_LIGHT,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ACCENT, marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 10, fontFamily: "var(--font-manrope),sans-serif" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.72, color: TEXT_MUTED, margin: 0, fontFamily: "var(--font-manrope),sans-serif" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "72px 0" }}>
        <div className="kml-section-inner">
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-manrope),sans-serif" }}>
              Montaža
            </span>
          </div>
          <h2 style={{ ...H("clamp(28px,4vw,42px)", 56), textAlign: "center" }}>
            Tri koraka do slobode.
          </h2>
          <div className="kml-steps-grid">
            {STEPS.map((s, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "var(--font-display), var(--font-manrope), sans-serif",
                  fontSize: 80, fontWeight: 800,
                  color: ACCENT_LIGHT, lineHeight: 1,
                  marginBottom: 16, userSelect: "none", letterSpacing: "-0.04em",
                }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 10, fontFamily: "var(--font-manrope),sans-serif" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: TEXT_MUTED, margin: 0, fontFamily: "var(--font-manrope),sans-serif" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEOS ────────────────────────────────────────── */}
      <section style={{ background: ACCENT_LIGHT, padding: "72px 0" }}>
        <div className="kml-section-inner">
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-manrope),sans-serif" }}>
              Vidi u akciji
            </span>
          </div>
          <h2 style={{ ...H("clamp(28px,4vw,42px)", 14), textAlign: "center" }}>
            Pogledajte prije nego naručite.
          </h2>
          <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.7, textAlign: "center", maxWidth: 480, margin: "0 auto", fontFamily: "var(--font-manrope),sans-serif" }}>
            Kratki videi koji pokazuju kako magnetno zatvaranje funkcioniše i koliko je montaža jednostavna.
          </p>
          <div className="kml-videos-grid">
            <VideoCard
              src="/komarnik/video-demonstracija.mp4"
              badge="Demonstracija"
              caption="Magnetno zatvaranje u praksi"
              desc="Prođite kroz komarnik slobodnih ruku. Magneti se automatski zatvaraju odmah nakon prolaska."
            />
            <VideoCard
              src="/komarnik/video-montaza.mp4"
              badge="Montaža"
              caption="Postavljanje za manje od 2 minute"
              desc="Bez bušilice, bez alata. Samolepljive trake i čičak traka. Gotovo."
            />
          </div>
        </div>
      </section>

      {/* ── CUSTOMER PHOTOS ───────────────────────────────── */}
      <section style={{ background: BG_CREAM, padding: "72px 0" }}>
        <div className="kml-section-inner">
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-manrope),sans-serif" }}>
              Stvarni prostori
            </span>
          </div>
          <h2 style={{ ...H("clamp(28px,4vw,42px)", 12) }}>
            Radi na svim vrstama vrata.
          </h2>
          <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.7, marginBottom: 40, maxWidth: 560, fontFamily: "var(--font-manrope),sans-serif" }}>
            Pogledajte kako komarnik izgleda montiran na različitim tipovima vrata i izlaza kod naših kupaca.
          </p>
          <div className="kml-photos-grid">
            {CUSTOMER_PHOTOS.map((item, i) => (
              <div key={i} style={{
                background: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}>
                <div style={{ position: "relative", aspectRatio: "3/4" }}>
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 860px) 50vw, 25vw"
                  />
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: "var(--font-manrope),sans-serif" }}>
                    {item.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ORDER FORM ────────────────────────────────────── */}
      <section id="narudzba" style={{ background: BG_CREAM, padding: "72px 0 88px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", background: ACCENT_LIGHT,
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ ...H("clamp(28px,4vw,34px)", 14), textAlign: "center" }}>
                Narudžba primljena.
              </h2>
              <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.72, fontFamily: "var(--font-manrope),sans-serif", maxWidth: 400, margin: "0 auto" }}>
                Kontaktiraćemo vas u najkraćem mogućem roku kako bismo potvrdili narudžbu i dogovorili dostavu.
              </p>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-manrope),sans-serif", display: "block", marginBottom: 12 }}>
                  Naruči sada
                </span>
                <h2 style={{ ...H("clamp(26px,4vw,36px)") }}>
                  Odaberite paket i naručite.
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 32 }}>
                {BUNDLES.map(b => (
                  <button
                    key={b.id}
                    className={`kml-mini-bundle${bundle === b.id ? " active" : ""}`}
                    onClick={() => setBundle(b.id)}
                  >
                    {b.badge && (
                      <div style={{
                        position: "absolute", top: -1, left: 0, right: 0,
                        fontSize: 9, fontWeight: 700, color: "#fff", background: ACCENT,
                        borderRadius: "10px 10px 0 0", padding: "3px 0",
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        fontFamily: "var(--font-manrope),sans-serif",
                      }}>
                        {b.badge}
                      </div>
                    )}
                    <div style={{
                      fontSize: 11, fontWeight: 700, marginTop: b.badge ? 18 : 0,
                      color: bundle === b.id ? ACCENT : TEXT_MUTED,
                      fontFamily: "var(--font-manrope),sans-serif",
                    }}>
                      {b.qty}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display), var(--font-manrope), sans-serif",
                      fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em",
                      color: bundle === b.id ? ACCENT_DARK : TEXT, lineHeight: 1.2,
                    }}>
                      {fmt(b.price)}
                    </div>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="kml-form-grid" style={{ marginBottom: 14 }}>
                  <Field label="Ime i prezime" placeholder="Npr. Amira Kovačević"
                    value={fields.ime} error={errors.ime}
                    onChange={v => { setFields(f => ({ ...f, ime: v })); setErrors(e => ({ ...e, ime: undefined })); }} />
                  <Field label="Broj telefona" type="tel" placeholder="Npr. 061 234 567"
                    value={fields.telefon} error={errors.telefon}
                    onChange={v => { setFields(f => ({ ...f, telefon: v })); setErrors(e => ({ ...e, telefon: undefined })); }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <Field label="Adresa dostave" placeholder="Ulica i broj"
                    value={fields.adresa} error={errors.adresa}
                    onChange={v => { setFields(f => ({ ...f, adresa: v })); setErrors(e => ({ ...e, adresa: undefined })); }} />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <Field label="Grad" placeholder="Npr. Sarajevo"
                    value={fields.grad} error={errors.grad}
                    onChange={v => { setFields(f => ({ ...f, grad: v })); setErrors(e => ({ ...e, grad: undefined })); }} />
                </div>

                <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", marginBottom: 20, border: "1px solid #E8E8E8" }}>
                  {[
                    { label: `Komarnik (${selectedBundle.qty})`, value: fmt(selectedBundle.price) },
                    { label: "Dostava",                          value: fmt(DELIVERY) },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      marginBottom: i === 0 ? 8 : 0,
                      paddingBottom: i === 0 ? 12 : 0,
                      borderBottom: i === 0 ? "1px solid #F0F0F0" : "none",
                    }}>
                      <span style={{ fontSize: 13, color: TEXT_MUTED, fontFamily: "var(--font-manrope),sans-serif" }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: "var(--font-manrope),sans-serif" }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, fontFamily: "var(--font-manrope),sans-serif" }}>Ukupno</span>
                    <span style={{
                      fontFamily: "var(--font-display), var(--font-manrope), sans-serif",
                      fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: ACCENT,
                    }}>
                      {fmt(total)}
                    </span>
                  </div>
                </div>

                {serverErr && (
                  <div style={{ padding: "12px 16px", background: "#FEF2F2", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "#E5534B", fontFamily: "var(--font-manrope),sans-serif" }}>
                    {serverErr}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "17px 0",
                    background: loading ? "#8FB88D" : ACCENT,
                    color: "#fff", border: "none", borderRadius: 12,
                    fontSize: 16, fontWeight: 800,
                    fontFamily: "var(--font-manrope),sans-serif",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    boxShadow: loading ? "none" : "0 4px 20px rgba(92,139,90,0.35)",
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="kml-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Šalje se...
                    </>
                  ) : (
                    <>
                      Naruči za {fmt(total)}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </>
                  )}
                </button>

                <p style={{ textAlign: "center", fontSize: 12, color: TEXT_MUTED, marginTop: 14, fontFamily: "var(--font-manrope),sans-serif" }}>
                  Plaćanje gotovinom pri preuzimanju. Bez predujma.
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "72px 0 88px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ ...H("clamp(26px,4vw,36px)", 40), textAlign: "center" }}>
            Česta pitanja.
          </h2>
          <div style={{ borderTop: "1px solid #EBEBEB" }}>
            {FAQ.map((item, i) => (
              <div key={i} className="kml-faq-item">
                <button className="kml-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: TEXT, fontFamily: "var(--font-manrope),sans-serif" }}>
                    {item.q}
                  </span>
                  <svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0, transition: "transform 0.22s", transform: openFaq === i ? "rotate(180deg)" : "none" }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: 14, lineHeight: 1.78, color: TEXT_MUTED, paddingBottom: 20, margin: 0, fontFamily: "var(--font-manrope),sans-serif" }}>
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SocialNotification />
    </>
  );
}
