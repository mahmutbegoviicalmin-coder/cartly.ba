"use client";

import React, {
  useState, useEffect, useRef, FormEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { event } from "@/lib/fbpixel";
import OrderPopup from "./OrderPopup";
import UsmjerivacFloatingCTA from "./FloatingCTA";

/* ─── TOKENS ──────────────────────────────────── */
const BLK   = "#0a0a1a";
const BLUE  = "#1a5fff";
const BLUE2 = "#1448d4";
const BLT   = "#eef3ff";
const BMID  = "#dce8ff";
const GR    = "#64748B";
const BRDR  = "rgba(26,95,255,0.14)";
const BRDR2 = "rgba(10,10,26,0.08)";
const F     = "var(--font-manrope),-apple-system,sans-serif";
const EASE: [number,number,number,number] = [0.22,1,0.36,1];

/* ─── NOTIFICATIONS ───────────────────────────── */
const NOTIF_NAMES = [
  { name: "Amira K.",    city: "Sarajevo",      time: "upravo sada" },
  { name: "Edin M.",     city: "Mostar",         time: "2 min" },
  { name: "Selma H.",    city: "Tuzla",          time: "5 min" },
  { name: "Tarik L.",    city: "Banja Luka",     time: "upravo sada" },
  { name: "Dina P.",     city: "Travnik",        time: "7 min" },
  { name: "Mirza O.",    city: "Zenica",         time: "upravo sada" },
  { name: "Lamija S.",   city: "Bijeljina",      time: "3 min" },
  { name: "Amir D.",     city: "Doboj",          time: "upravo sada" },
  { name: "Lejla K.",    city: "Cazin",          time: "12 min" },
  { name: "Jasmin F.",   city: "Brčko",          time: "upravo sada" },
  { name: "Sanja R.",    city: "Lukavac",        time: "8 min" },
  { name: "Eldin T.",    city: "Konjic",         time: "upravo sada" },
  { name: "Maja V.",     city: "Jajce",          time: "4 min" },
  { name: "Nedim A.",    city: "Goražde",        time: "upravo sada" },
  { name: "Belma C.",    city: "Livno",          time: "11 min" },
  { name: "Sanel M.",    city: "Bugojno",        time: "upravo sada" },
  { name: "Alma G.",     city: "Bosanska Krupa", time: "6 min" },
  { name: "Hasan J.",    city: "Novi Travnik",   time: "upravo sada" },
  { name: "Vanja K.",    city: "Gračanica",      time: "15 min" },
  { name: "Irma N.",     city: "Kalesija",       time: "upravo sada" },
  { name: "Denis O.",    city: "Čapljina",       time: "9 min" },
  { name: "Almira S.",   city: "Hadžići",        time: "upravo sada" },
  { name: "Kenan T.",    city: "Visoko",         time: "20 min" },
  { name: "Sanela B.",   city: "Kakanj",         time: "upravo sada" },
  { name: "Muamer H.",   city: "Zavidovići",     time: "13 min" },
  { name: "Edina P.",    city: "Gradiška",       time: "upravo sada" },
  { name: "Samir L.",    city: "Široki Brijeg",  time: "17 min" },
  { name: "Nermina F.",  city: "Bihać",          time: "upravo sada" },
  { name: "Adnan C.",    city: "Stolac",         time: "10 min" },
  { name: "Azra M.",     city: "Sarajevo",       time: "upravo sada" },
];

/* ─── DATA ────────────────────────────────────── */
type BID = 1 | 2 | 3;
const BUNDLES = [
  { id: 1 as BID, qty: "1 komad",  price: 19.90, delivery: 10.00, total: 29.90, savings: null,  badge: null,         badgeColor: "" },
  { id: 2 as BID, qty: "2 komada", price: 34.90, delivery: 10.00, total: 44.90, savings: 14.90, badge: "TOP PONUDA", badgeColor: "#f59e0b" },
  { id: 3 as BID, qty: "3 komada", price: 49.90, delivery:  0.00, total: 49.90, savings: 39.80, badge: "BESTSELLER", badgeColor: BLUE2 },
];


const REVIEWS = [
  { name: "Amira K., Sarajevo", stars: 5, text: "Nisam više u stanju da spavam zbog direktnog puhanja klime. Ovo mi je bukvalno promijenilo ljetne noći." },
  { name: "Edin M., Mostar",    stars: 5, text: "Postavio za manje od 5 minuta, bez ičega posebnog. Zrak se sada raspoređuje po cijeloj sobi a ne ide direktno u lice." },
  { name: "Selma H., Tuzla",    stars: 4, text: "Uzela za tatu koji ne podnosi direktan hladni zrak. Super rješenje, preporučujem." },
  { name: "Nuna B., Zenica",    stars: 5, text: "Malo sam sumnjala ali stvarno radi. Dostava brza, pakovanje uredno, kvaliteta dobra." },
];

const FAQ = [
  { q: "Za koje klime odgovara?",           a: "Za sve standardne split klime. Ako klima ima pravougaoni izlaz zraka, usmjerivač odgovara." },
  { q: "Da li kvari klimu?",                a: "Ne, usmjerivač se samo kači na rupe i preusmjerava zrak. Ne dodiruješ unutrašnjost klime." },
  { q: "Može li se skinuti?",               a: "Naravno, skineš ga za minutu. Kači se na rupe od klime, bez ljepila i bez traga." },
  { q: "Koliko traje montaža?",             a: "Obično 5 minuta, bez bušenja i bez majstora. Sve dolazi u paketu." },
  { q: "Kako plaćam?",                      a: "Plaćanje je pouzećem kad ti paket stigne, ne tražimo nikakav predujam." },
];

function fmt(n: number) { return n.toFixed(2).replace(".", ",") + " KM"; }

/* ─── COUNTDOWN ───────────────────────────────── */
function Countdown() {
  const [secs, setSecs] = useState(14 * 60 + 47);
  useEffect(() => {
    setSecs(Math.floor(13 * 60 + 20 + Math.random() * 100));
    const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : 14 * 60 + 59), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "linear-gradient(135deg, #fffbeb, #fefce8)",
      border: "1.5px solid #fde68a",
      borderRadius: 12, padding: "12px 16px",
      marginBottom: 20,
    }}>
      {/* Clock icon */}
      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: "rgba(220,38,38,0.09)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#92400e", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 3 }}>
          Posebna cijena ističe za
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#dc2626", fontFamily: F, letterSpacing: "-0.04em", lineHeight: 1 }}>{m}:{s}</span>
          <span style={{ fontSize: 12, color: "#92400e", fontFamily: F, fontWeight: 500 }}>min</span>
        </div>
      </div>
      {/* Flame + count */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(220,38,38,0.08)", borderRadius: 8, padding: "6px 10px" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#dc2626" stroke="none">
          <path d="M12 2c0 0-5 4.5-5 9a5 5 0 0 0 10 0c0-2-1-3.5-2-5-1 2-2 2.5-3 2.5C12 8.5 12 2 12 2z"/>
        </svg>
        <div style={{ textAlign: "right", lineHeight: 1.3 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#78350f", fontFamily: F, letterSpacing: "-0.02em" }}>23</div>
          <div style={{ fontSize: 10, color: "#92400e", fontFamily: F, fontWeight: 500 }}>danas</div>
        </div>
      </div>
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
      setTimeout(() => setShown(false), 4800);
    };
    const t1 = setTimeout(show, 10000);
    const t2 = setInterval(show, 30000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);
  const p = NOTIF_NAMES[personIdx];
  return (
    <AnimatePresence>
      {shown && (
        <motion.div initial={{ x: "-110%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "-110%", opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 30 }}
          style={{ position: "fixed", bottom: 86, left: 16, zIndex: 200, background: "#fff", borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 36px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12, maxWidth: 285, width: "calc(100vw - 32px)" }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, overflow: "hidden", background: BLT, flexShrink: 0 }}>
            <img src="/usmjerivac/hero.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#16a34a", fontFamily: F, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block", flexShrink: 0 }} />
              Upravo naručeno
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: BLK, fontFamily: F, lineHeight: 1.2 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: GR, fontFamily: F, marginTop: 2 }}>{p.city} · upravo sada</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── FIELD ───────────────────────────────────── */
function Field({ label, type = "text", placeholder = "", value, onChange, error }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: BLK, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "13px 16px", border: `1.5px solid ${error ? "#EF4444" : BRDR2}`, borderRadius: 10, fontSize: 15, fontFamily: F, color: BLK, background: "#fff", outline: "none", transition: "border-color 0.16s, box-shadow 0.16s" }}
        onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(37,99,235,0.12)`; }}
        onBlur={e  => { e.target.style.borderColor = error ? "#EF4444" : BRDR2; e.target.style.boxShadow = "none"; }}
      />
      {error && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 5, fontFamily: F }}>{error}</p>}
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────── */
type Fields = { ime: string; telefon: string; adresa: string; grad: string };
type Errs   = Partial<Record<keyof Fields, string>>;

export default function UsmjerivacClient() {
  const [bundle,    setBundle]    = useState<BID>(2);
  const [fields,    setFields]    = useState<Fields>({ ime: "", telefon: "", adresa: "", grad: "" });
  const [errors,    setErrors]    = useState<Errs>({});
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);
  const [views,     setViews]     = useState(1247);
  const [popupOpen,   setPopupOpen]   = useState(false);
  const [popupBundle, setPopupBundle] = useState<BID>(2);

  function openPopup(bid: BID) {
    const b = BUNDLES.find(x => x.id === bid)!;
    event("AddToCart", {
      content_name:     "Usmjerivač Zraka Klime",
      content_category: "Kućni dodaci",
      content_ids:      ["usmjerivac-zraka"],
      content_type:     "product",
      value:            b.total,
      currency:         "BAM",
    });
    setPopupBundle(bid);
    setPopupOpen(true);
  }

  useEffect(() => {
    // ViewContent je u PixelEvents.tsx — ne šaljemo dvaput
    setViews(Math.floor(1180 + Math.random() * 240));
    const t = setInterval(() => setViews(v => v + Math.floor(Math.random() * 3 + 1)), 7000);
    return () => clearInterval(t);
  }, []);

  const sel = BUNDLES.find(b => b.id === bundle)!;

  function validate(): Errs {
    const e: Errs = {};
    if (!fields.ime.trim()     || fields.ime.trim().length < 2)              e.ime     = "Unesite ime i prezime";
    if (!fields.telefon.trim() || fields.telefon.replace(/\D/g,"").length < 8) e.telefon = "Unesite ispravan broj";
    if (!fields.adresa.trim()) e.adresa = "Unesite adresu";
    if (!fields.grad.trim())   e.grad   = "Unesite grad";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerErr(null);
    try {
      event("InitiateCheckout", { content_name: "Usmjerivač Zraka Klime", content_ids: ["usmjerivac-zraka"], content_type: "product", value: sel.total, currency: "BAM", num_items: sel.id });
      const externalId = typeof localStorage !== "undefined" ? localStorage.getItem("_crt_eid") || "" : "";
      const res  = await fetch("/api/usmjerivac-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, bundle, externalId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      event("Purchase", { content_name: "Usmjerivač Zraka Klime", content_ids: ["usmjerivac-zraka"], content_type: "product", value: sel.total, currency: "BAM", num_items: sel.id }, data.orderNumber);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerErr("Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  const inner = { maxWidth: 1160, margin: "0 auto", padding: "0 28px" };
  const FIN   = { once: true, amount: 0.2 };
  const FADE  = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: FIN, transition: { duration: 0.52, ease: EASE } };

  return (
    <>
      <style suppressHydrationWarning>{`
        *{box-sizing:border-box;}
        .u-hero  { display:grid; grid-template-columns:45% 1fr; min-height:calc(100dvh - 72px); gap:0; align-items:stretch; }
        .u-hero-l{ padding:60px 52px 60px 0; display:flex; flex-direction:column; justify-content:center; }
        .u-hero-r{ display:flex; align-items:center; justify-content:center; padding:32px 0 32px 40px; }
        .u-hero-bundles { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .u-form-g{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .u-rev-g { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
        .u-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:40px; margin-top:60px; }
        .u-split { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
        .u-split-l { display:flex; flex-direction:column; }
        .u-split-r { position:relative; }
        .u-faq-btn{ width:100%; background:none; border:none; cursor:pointer; padding:20px 0; display:flex; align-items:center; justify-content:space-between; gap:16px; text-align:left; }
        .u-cta {
          display:inline-flex; align-items:center; gap:8px;
          background:${BLUE}; color:#fff; padding:15px 30px; border-radius:10px;
          font-size:16px; font-weight:700; font-family:${F};
          text-decoration:none; border:none; cursor:pointer;
          transition:background 0.18s, transform 0.15s, box-shadow 0.18s;
          box-shadow:0 4px 18px rgba(37,99,235,0.35);
        }
        .u-cta:hover { background:${BLUE2}; transform:translateY(-1px); box-shadow:0 6px 24px rgba(37,99,235,0.45); }
        .u-cta:active { transform:translateY(0); }
        .u-bun-card { transition:border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s; }
        .u-bun-card:hover { transform:translateY(-1px); }
.u-submit-btn {
          width:100%; padding:16px 24px; background:#fff; color:${BLUE};
          border:none; border-radius:12px;
          font-size:17px; font-weight:900; font-family:${F}; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:10px;
          box-shadow:0 4px 24px rgba(0,0,0,0.15);
          transition:transform 0.15s, box-shadow 0.15s; letter-spacing:-0.01em;
        }
        .u-submit-btn:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(0,0,0,0.2); }
        .u-submit-btn:active { transform:translateY(0); }
        @media(max-width:900px){
          .u-hero  { grid-template-columns:1fr; min-height:auto; }
          .u-hero-l{ padding:32px 24px 40px; order:2; }
          .u-hero-r{ padding:24px 24px 0; order:1; }
          .u-hero-bundles { grid-template-columns:1fr; gap:8px; }
          .u-form-g{ grid-template-columns:1fr; }
          .u-rev-g { grid-template-columns:1fr; }
          .u-steps { grid-template-columns:1fr; gap:24px; margin-top:40px; }
          .u-split { grid-template-columns:1fr; gap:48px; }
          .u-split-r { order:-1; }
          .u-gallery { grid-template-columns:1fr !important; }
          .u-prod-grid { grid-template-columns:1fr !important; }
        }
        @keyframes u-spin  { to{transform:rotate(360deg)} }
        .u-spin { animation:u-spin 0.9s linear infinite; }
        @keyframes u-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(0.78)} }
        .u-pulse-dot { width:8px; height:8px; border-radius:50%; background:#ef4444; display:inline-block; animation:u-pulse 1.6s ease-in-out infinite; }
        @keyframes windFloat {
          0%   { transform:translateX(-115%); opacity:0; }
          14%  { opacity:1; }
          86%  { opacity:1; }
          100% { transform:translateX(290%); opacity:0; }
        }
        .wind-line { position:absolute; left:0; border-radius:2px; animation:windFloat ease-in-out infinite; }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{ background: "#fff", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <div className="u-hero">
            <div className="u-hero-l">
              {/* Social proof + views */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 1 }}>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <span style={{ fontSize: 13.5, color: GR, fontFamily: F, fontWeight: 500 }}>
                    <strong style={{ color: BLK, fontWeight: 700 }}>4,8</strong> · 1.200+ kupaca
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: GR, fontFamily: F, fontWeight: 500 }}>
                  <span className="u-pulse-dot" />
                  <span><strong style={{ color: BLK }}>{views}</strong> osoba gleda</span>
                </div>
              </div>

              <h1 style={{ fontFamily: F, fontSize: "clamp(32px,4.2vw,54px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.06, marginBottom: 28 }}>
                Zaustavi klimu da puše<br /><span style={{ color: BLUE }}>direktno u tebe.</span>
              </h1>

              <ul style={{ listStyle: "none", margin: "0 0 32px", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {["Nema više hladnog zraka u lice i vrat", "Kut puhanja podesiv od 0° do 45°", "Montira se za 5 minuta, bez bušenja"].map((t, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: BLT, border: `1px solid ${BRDR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: 15, color: BLK, fontFamily: F, fontWeight: 500 }}>{t}</span>
                  </li>
                ))}
              </ul>

              {/* Hero mini bundles */}
              <div className="u-hero-bundles" style={{ marginBottom: 28 }}>
                {BUNDLES.map(b => (
                  <div key={b.id}
                    onClick={() => openPopup(b.id)}
                    style={{ padding: "13px 12px", border: `1.5px solid ${bundle === b.id ? BLUE : BRDR2}`, borderRadius: 12, cursor: "pointer", background: bundle === b.id ? BLT : "#fafafa", transition: "border-color 0.15s, background 0.15s", position: "relative" }}
                    onMouseEnter={e => { if (bundle !== b.id) e.currentTarget.style.borderColor = "rgba(26,95,255,0.35)"; }}
                    onMouseLeave={e => { if (bundle !== b.id) e.currentTarget.style.borderColor = BRDR2; }}
                  >
                    {b.badge && (
                      <div style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 800, color: "#fff", background: b.badgeColor, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: F, whiteSpace: "nowrap" }}>{b.badge}</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, border: `2px solid ${bundle === b.id ? BLUE : "rgba(0,0,0,0.18)"}`, background: bundle === b.id ? BLUE : "transparent", transition: "all 0.15s" }} />
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: BLK, fontFamily: F, lineHeight: 1 }}>{b.qty}</span>
                    </div>
                    <div style={{ paddingLeft: 20 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: bundle === b.id ? BLUE : BLK, fontFamily: F, letterSpacing: "-0.03em", lineHeight: 1.1, transition: "color 0.15s" }}>{fmt(b.price)}</div>
                      <div style={{ fontSize: 10, marginTop: 3, fontFamily: F, fontWeight: b.delivery === 0 ? 700 : 400, color: b.delivery === 0 ? "#16A34A" : GR }}>
                        {b.delivery === 0 ? "✓ Besplatna" : `+${fmt(b.delivery)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => openPopup(bundle)} className="u-cta" style={{ width: "100%", justifyContent: "center" }}>
                Naruči odmah
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <p style={{ fontSize: 12, color: GR, fontFamily: F, marginTop: 14 }}>Plaćanje pouzećem pri preuzimanju · Bez predujma</p>
            </div>

            <div className="u-hero-r">
              <motion.div
                initial={{ opacity: 0, x: 28, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                style={{ width: "100%", borderRadius: 24, overflow: "hidden", aspectRatio: "4/3", boxShadow: "0 32px 80px rgba(10,10,26,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}
              >
                <img
                  src="/usmjerivac/hero.png"
                  alt="Usmjerivač zraka klime montiran na klimi"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ GALERIJA ══ */}
      <section style={{ background: "#fff", padding: "72px 0 80px", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <div className="u-prod-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center", marginBottom: 48 }}>

            {/* Lijevo — tekst */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.52, ease: EASE }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: BLUE, fontFamily: F, marginBottom: 16 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />
                Proizvod
              </div>
              <h2 style={{ fontFamily: F, fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.07, marginBottom: 18 }}>
                Kompaktan.<br /><span style={{ color: BLUE }}>Čvrst. Praktičan.</span>
              </h2>
              <p style={{ fontSize: 15, color: GR, fontFamily: F, lineHeight: 1.8, marginBottom: 28, maxWidth: 380 }}>
                Napravljen od čvrstog ABS plastike. Lagan dizajn koji ne opterećuje klimu i ne kvari izgled uređaja. U paketu dolaze nosači i upute za montažu.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "ABS plastika otporna na temperaturu",
                  "Podesiv kut od 0° do 45°",
                  "U paketu: usmjerivač + nosači + upute",
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: BLT, border: `1px solid ${BRDR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: 14, color: BLK, fontFamily: F, fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Desno — glavna slika */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.52, ease: EASE, delay: 0.08 }}
              style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4/3", boxShadow: "0 20px 56px rgba(10,10,26,0.13), 0 0 0 1px rgba(0,0,0,0.06)" }}
            >
              <img src="/usmjerivac/after.png" alt="Usmjerivač zraka klime u prostoriji" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
            </motion.div>
          </div>

          {/* Dvije slike ispod */}
          <div className="u-prod-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { src: "/usmjerivac/product-1.jpeg", alt: "Usmjerivač zraka klime detalj" },
              { src: "/usmjerivac/product-2.jpeg", alt: "Usmjerivač zraka klime primjena" },
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.46, ease: EASE, delay: i * 0.1 }}
                style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", boxShadow: "0 6px 24px rgba(10,10,26,0.09), 0 0 0 1px rgba(0,0,0,0.05)" }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transition: "transform 0.4s ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ORDER FORM ══ */}
      <section id="narudzba" style={{ background: BLT, borderBottom: `1px solid ${BRDR}`, padding: "80px 0 96px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 28px" }}>
          {done ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 28px rgba(37,99,235,0.4)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontFamily: F, fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, marginBottom: 12 }}>Narudžba primljena.</h2>
              <p style={{ fontSize: 16, color: GR, lineHeight: 1.75, fontFamily: F, maxWidth: 380, margin: "0 auto" }}>Kontaktiraćemo vas radi potvrde i dogovora oko dostave.</p>
            </motion.div>
          ) : (
            <>
              <motion.div {...FADE} style={{ marginBottom: 32 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: BLUE, fontFamily: F, marginBottom: 14 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />
                  Narudžba
                </div>
                <h2 style={{ fontFamily: F, fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.08 }}>Odaberite paket.</h2>
              </motion.div>

              {/* Countdown */}
              <Countdown />

              {/* Bundle cards — novi dizajn */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                {BUNDLES.map(b => (
                  <div key={b.id} className="u-bun-card" onClick={() => setBundle(b.id)}
                    style={{
                      borderRadius: 16,
                      border: `2px solid ${bundle === b.id ? BLUE : "rgba(0,0,0,0.09)"}`,
                      background: bundle === b.id ? "#f0f6ff" : "#fff",
                      cursor: "pointer",
                      overflow: "hidden",
                      boxShadow: bundle === b.id
                        ? `0 0 0 4px rgba(26,95,255,0.1), 0 4px 20px rgba(26,95,255,0.12)`
                        : "0 1px 6px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Header */}
                    <div style={{ padding: "13px 16px 11px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${bundle === b.id ? "rgba(26,95,255,0.1)" : "rgba(0,0,0,0.06)"}` }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: `2.5px solid ${bundle === b.id ? BLUE : "#cbd5e1"}`, background: bundle === b.id ? BLUE : "transparent", transition: "all 0.18s", boxShadow: bundle === b.id ? `0 0 0 3px rgba(26,95,255,0.15)` : "none" }} />
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 800, color: BLK, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.05em" }}>{b.qty}</div>
                      {b.badge && (
                        <div style={{ background: b.badgeColor, color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 5, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: F, boxShadow: `0 2px 8px ${b.badgeColor}55` }}>
                          {b.badge}
                        </div>
                      )}
                    </div>

                    {/* Price breakdown */}
                    <div style={{ padding: "12px 16px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: GR, fontFamily: F }}>Cijena proizvoda</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: BLK, fontFamily: F }}>{fmt(b.price)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: GR, fontFamily: F }}>Dostava</span>
                        {b.delivery === 0 ? (
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", fontFamily: F, background: "#dcfce7", padding: "3px 9px", borderRadius: 5 }}>✓ BESPLATNO</span>
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 500, color: BLK, fontFamily: F }}>+ {fmt(b.delivery)}</span>
                        )}
                      </div>
                      <div style={{ borderTop: "1.5px dashed rgba(0,0,0,0.08)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 10, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Ukupno za plaćanje</div>
                          <div style={{ fontSize: 26, fontWeight: 900, color: bundle === b.id ? BLUE : BLK, fontFamily: F, letterSpacing: "-0.04em", lineHeight: 1, transition: "color 0.2s" }}>{fmt(b.total)}</div>
                        </div>
                        {b.savings != null && (
                          <div style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, fontFamily: F, fontWeight: 600, color: "#16a34a", marginBottom: 1 }}>Uštedite</div>
                            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: F, color: "#15803d", letterSpacing: "-0.02em" }}>{fmt(b.savings)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: -4 }}>Podaci za dostavu</div>
                <div className="u-form-g">
                  <Field label="Ime i prezime" placeholder="Amira Kovačević" value={fields.ime} error={errors.ime} onChange={v => { setFields(f => ({ ...f, ime: v })); setErrors(e => ({ ...e, ime: undefined })); }} />
                  <Field label="Broj telefona" type="tel" placeholder="061 234 567" value={fields.telefon} error={errors.telefon} onChange={v => { setFields(f => ({ ...f, telefon: v })); setErrors(e => ({ ...e, telefon: undefined })); }} />
                </div>
                <Field label="Adresa dostave" placeholder="Ulica i broj" value={fields.adresa} error={errors.adresa} onChange={v => { setFields(f => ({ ...f, adresa: v })); setErrors(e => ({ ...e, adresa: undefined })); }} />
                <Field label="Grad" placeholder="Sarajevo" value={fields.grad} error={errors.grad} onChange={v => { setFields(f => ({ ...f, grad: v })); setErrors(e => ({ ...e, grad: undefined })); }} />

                {serverErr && <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 13, color: "#EF4444", fontFamily: F }}>{serverErr}</div>}

                {/* Submit card */}
                <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, borderRadius: 18, padding: "22px 22px 18px", marginTop: 8, boxShadow: "0 8px 36px rgba(26,95,255,0.35)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Ukupno za plaćanje</div>
                      <motion.div key={sel.total} initial={{ opacity: 0.5, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                        style={{ fontSize: 38, fontWeight: 900, color: "#fff", fontFamily: F, letterSpacing: "-0.05em", lineHeight: 1 }}>
                        {fmt(sel.total)}
                      </motion.div>
                    </div>
                    <AnimatePresence mode="wait">
                      {sel.delivery === 0 ? (
                        <motion.div key="free" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                          style={{ background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.38)", borderRadius: 10, padding: "8px 14px", textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dostava</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#4ade80", fontFamily: F }}>BESPLATNO</div>
                        </motion.div>
                      ) : (
                        <motion.div key="paid" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "8px 14px", textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.06em" }}>Uključuje</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: F }}>dostavu ✓</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button type="submit" disabled={loading} className="u-submit-btn" style={{ background: loading ? "rgba(255,255,255,0.55)" : "#fff", cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? (
                      <><svg className="u-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Šalje se...</>
                    ) : (
                      <>Naruči odmah — Plaćanje pouzećem<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></>
                    )}
                  </button>
                  <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
                    {([
                      { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, label: "Dostava 48h" },
                      { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: "Bez predujma" },
                      { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>, label: "Povrat 14 dana" },
                    ] as { icon: React.ReactNode; label: string }[]).map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.72)", fontFamily: F, fontWeight: 500 }}>{item.icon}<span>{item.label}</span></div>
                    ))}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ══ SPLIT — KARAKTERISTIKE ══ */}
      <section style={{ background: "#fff", padding: "96px 0", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <div className="u-split">

            {/* ── LEFT: features ── */}
            <div className="u-split-l">
              <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.55, ease: EASE }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: BLUE, fontFamily: F, marginBottom: 18 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />
                  Karakteristike
                </div>
                <h2 style={{ fontFamily: F, fontSize: "clamp(28px,3.8vw,46px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.06, marginBottom: 14 }}>
                  Kaži klimi<br /><span style={{ color: BLUE }}>gdje da puše.</span>
                </h2>
                <p style={{ fontSize: 15, color: GR, fontFamily: F, lineHeight: 1.75, marginBottom: 40, maxWidth: 420 }}>
                  Kači se na rupe od klime i preusmjerava zrak gore, dolje ili u stranu, gdje god da ti odgovara.
                </p>
              </motion.div>

              {/* Feature rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  {
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 0 0 0-20"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/><circle cx="12" cy="12" r="3"/></svg>,
                    title: "Kut puhanja 0° – 45°",
                    desc:  "Okreneš ga gore, dolje ili u stranu, kako ti paše.",
                    tag:   null,
                  },
                  {
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
                    title: "Zrak po cijeloj sobi",
                    desc:  "Nema više da je jedan kut hladan a drugi topao.",
                    tag:   null,
                  },
                  {
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                    title: "Postavljaš za 5 minuta",
                    desc:  "Kači se na rupe od klime, bez bušenja i bez alata.",
                    tag:   "Bez bušenja",
                  },
                  {
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><path d="M8 7V5a2 2 0 0 1 4 0"/></svg>,
                    title: "Odgovara svim split klimama",
                    desc:  "Ako klima ima pravougaoni izlaz zraka, odgovara.",
                    tag:   null,
                  },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -22 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={FIN}
                    transition={{ duration: 0.46, ease: EASE, delay: 0.1 + i * 0.09 }}
                    style={{
                      display:     "flex",
                      gap:          16,
                      padding:     "20px 0",
                      borderBottom: i < 3 ? `1px solid ${BRDR2}` : "none",
                      alignItems:  "flex-start",
                    }}
                  >
                    {/* Icon bubble */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: BLT, border: `1px solid ${BRDR}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {f.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: BLK, fontFamily: F, letterSpacing: "-0.02em" }}>{f.title}</span>
                        {f.tag && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#dcfce7", borderRadius: 5, padding: "2px 8px", fontFamily: F, letterSpacing: "0.04em" }}>
                            {f.tag}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: GR, fontFamily: F, lineHeight: 1.65 }}>{f.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.44, ease: EASE, delay: 0.52 }} style={{ marginTop: 36 }}>
                <button onClick={() => openPopup(2)} className="u-cta">
                  Naruči odmah — od 19,90 KM
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </motion.div>
            </div>

            {/* ── RIGHT: image ── */}
            <motion.div
              className="u-split-r"
              initial={{ opacity: 0, x: 32, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={FIN}
              transition={{ duration: 0.58, ease: EASE, delay: 0.08 }}
            >
              <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", aspectRatio: "16/10", boxShadow: "0 28px 72px rgba(10,10,26,0.16), 0 0 0 1px rgba(0,0,0,0.06)" }}>
                <img src="/usmjerivac/after.png" alt="Komforan boravak sa usmjerivačem" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }} />

                {/* Overlay gradient bottom */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,26,0.45) 0%, transparent 55%)", pointerEvents: "none" }} />

                {/* Bottom caption */}
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                  <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0, boxShadow: "0 0 8px rgba(74,222,128,0.8)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: F }}>Komforan boravak bez direktnog puhanja</span>
                  </div>
                </div>

                {/* Top-right chip */}
                <motion.div
                  initial={{ opacity: 0, y: -12 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.4, delay: 0.45 }}
                  style={{ position: "absolute", top: 16, right: 16, background: "#fff", borderRadius: 12, padding: "8px 13px", boxShadow: "0 4px 20px rgba(10,10,26,0.14)", display: "flex", alignItems: "center", gap: 7 }}
                >
                  <div style={{ display: "flex", gap: 1 }}>
                    {[...Array(5)].map((_, i) => <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: BLK, fontFamily: F }}>4,8 · 1.200+ kupaca</span>
                </motion.div>

                {/* Top-left chip */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.4, delay: 0.55 }}
                  style={{ position: "absolute", top: 16, left: 16, background: `linear-gradient(135deg,${BLUE},${BLUE2})`, borderRadius: 10, padding: "7px 12px", boxShadow: "0 4px 16px rgba(26,95,255,0.4)" }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: F, letterSpacing: "-0.01em" }}>−50% AKCIJA</span>
                </motion.div>
              </div>
            </motion.div>

          </div>

          {/* ── Installation steps ── */}
          <div className="u-steps" style={{ marginTop: 72 }}>
            {[
              { num: "01", title: "Postavite nosače", desc: "Zakačite plastične nosače na postojeće rupe na gornjoj strani klime." },
              { num: "02", title: "Pričvrstite usmjerivač", desc: "Jednostavno umetnite usmjerivač u nosače i klikne na mjesto za sekundu." },
              { num: "03", title: "Podesite kut", desc: "Okrenite usmjerivač do željenog ugla i usmjerite zrak gdje vam treba." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.48, ease: EASE, delay: i * 0.1 }}
                style={{ borderTop: `3px solid ${BRDR}`, paddingTop: 24 }}>
                <div style={{ fontSize: "clamp(36px,4vw,52px)", fontWeight: 900, color: BMID, fontFamily: F, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 14, userSelect: "none" }}>{s.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: BLK, fontFamily: F, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: GR, fontFamily: F, lineHeight: 1.72 }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ══ */}
      <section style={{ background: "#fff", padding: "88px 0", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <motion.div {...FADE}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: BLUE, fontFamily: F, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />Recenzije
            </div>
            <h2 style={{ fontFamily: F, fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.08, marginBottom: 48, maxWidth: 400 }}>Šta kažu kupci.</h2>
          </motion.div>
          <div className="u-rev-g">
            {REVIEWS.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
                style={{ background: BLT, borderRadius: "0 0 14px 14px", padding: "22px 24px 24px", border: `1px solid ${BRDR}`, borderTopWidth: 3, borderTopColor: BLUE }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {[...Array(5)].map((_, s) => <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s < r.stars ? "#f59e0b" : "#e0e4ef"} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.72, color: BLK, fontFamily: F, marginBottom: 16 }}>&ldquo;{r.text}&rdquo;</p>
                <p style={{ fontSize: 13, color: BLUE, fontFamily: F, fontWeight: 700 }}>{r.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ background: BLT, padding: "88px 0 108px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 28px" }}>
          <motion.div {...FADE}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: BLUE, fontFamily: F, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />FAQ
            </div>
            <h2 style={{ fontFamily: F, fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.08, marginBottom: 40 }}>Pitanja i odgovori.</h2>
          </motion.div>
          <div style={{ borderTop: `1px solid ${BRDR}` }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${BRDR}` }}>
                <button className="u-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: openFaq === i ? BLUE : BLK, fontFamily: F, transition: "color 0.18s" }}>{item.q}</span>
                  <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={openFaq === i ? BLUE : GR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.22 }} style={{ flexShrink: 0 }}>
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

      <PurchaseNotification />
      <OrderPopup open={popupOpen} onClose={() => setPopupOpen(false)} initialBundle={popupBundle} />
      <UsmjerivacFloatingCTA onOrder={() => openPopup(2)} />
    </>
  );
}
