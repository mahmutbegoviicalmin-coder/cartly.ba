"use client";

import React, {
  useState, useEffect, useRef,
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
type BID = 1 | 2 | 3 | 4;
const BUNDLES = [
  { id: 1 as BID, qty: "1 komad",  qty_n: 1, price: 13.90, delivery: 10.00, total: 23.90, savings: null,  badge: null,                   badgeColor: "" },
  { id: 2 as BID, qty: "2 komada", qty_n: 2, price: 21.90, delivery: 10.00, total: 31.90, savings: 5.90,  badge: "TOP PONUDA",            badgeColor: "#f59e0b" },
  { id: 3 as BID, qty: "3 komada", qty_n: 3, price: 28.90, delivery: 10.00, total: 38.90, savings: 12.90, badge: "NAJVIŠE SE NARUČUJE",   badgeColor: "#e11d48" },
  { id: 4 as BID, qty: "4 komada", qty_n: 4, price: 34.90, delivery: 10.00, total: 44.90, savings: 20.70, badge: "PORODIČNI PAKET",       badgeColor: BLUE2 },
];


const REVIEWS = [
  { name: "Amira K.", city: "Sarajevo", stars: 5, photo: "/usmjerivac/real1.webp", text: "Postavljeno za 3 minute i to je to. Više ne piše direktno u lice, zrak se ravnomjerno raspoređuje po sobi. Konačno mogu normalno spavati." },
  { name: "Edin M.",  city: "Tuzla",    stars: 5, photo: "/usmjerivac/real2.webp", text: "Nisam očekivao da će toliko napraviti razliku. Klima radi isti posao, samo zrak više ne ide direktno prema krevetu. Kvalitetno i čvrsto, ne miče se." },
  { name: "Selma H.", city: "Mostar",   stars: 5, photo: "/usmjerivac/real3.webp", text: "Uzela za oca koji ima problema sa direktnim hladom. Montaža je bila jednostavna, drži se odlično. Svaka preporuka — vrijedi svakog feninga." },
  { name: "Mirza B.", city: "Zenica",   stars: 5, photo: "/usmjerivac/real4.webp", text: "Imam djecu i ovo mi je rješilo problem. Klima radi, djeca nisu u direktnom strujanju, i izgleda uredno na klimi. Preporučujem." },
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

/* ─── MAIN ────────────────────────────────────── */
export default function UsmjerivacClient() {
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

  // Navbar "Naruči odmah" CTA: intercept clicks on href="#order" links
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href="#order"]');
      if (link) { e.preventDefault(); openPopup(2); }
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
        .u-hero  { display:grid; grid-template-columns:45% 1fr; min-height:calc(100dvh - 72px); gap:0; align-items:stretch; }
        .u-hero-l{ padding:60px 52px 60px 0; display:flex; flex-direction:column; justify-content:center; }
        .u-hero-r{ display:flex; align-items:center; justify-content:center; padding:32px 0 32px 40px; }
        .u-hero-bundles { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
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
          .u-hero-l{ padding:28px 20px 40px; order:2; }
          .u-hero-r{ padding:0; order:1; }
          .u-hero-bundles { grid-template-columns:repeat(2,1fr); gap:8px; }
          .u-form-g{ grid-template-columns:1fr; }
          .u-rev-g { grid-template-columns:1fr; }
          .u-steps { grid-template-columns:1fr; gap:24px; margin-top:40px; }
          .u-split { grid-template-columns:1fr; gap:32px; }
          .u-split-r { order:-1; }
          .u-split-chip { display:none !important; }
          .u-split-caption span { font-size:12px !important; }
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

              {/* Hero bundle cards 2×2 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {BUNDLES.map((b) => {
                  const isBest = b.id === 3;
                  return (
                    <div key={b.id}
                      onClick={() => openPopup(b.id)}
                      style={{
                        borderRadius: 16, overflow: "hidden", cursor: "pointer",
                        border: `2px solid ${isBest ? "#e11d48" : BRDR2}`,
                        background: isBest ? "linear-gradient(160deg,#fff5f7 0%,#fff 100%)" : "#fff",
                        boxShadow: isBest ? "0 4px 20px rgba(225,29,72,0.12)" : "0 1px 8px rgba(10,10,26,0.07)",
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = isBest ? "0 8px 28px rgba(225,29,72,0.2)" : "0 6px 20px rgba(26,95,255,0.14)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isBest ? "0 4px 20px rgba(225,29,72,0.12)" : "0 1px 8px rgba(10,10,26,0.07)"; }}
                    >
                      {b.badge ? (
                        <div style={{ background: b.badgeColor, color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: F, padding: "5px 10px", textAlign: "center" }}>{b.badge}</div>
                      ) : <div style={{ height: 28 }} />}
                      <div style={{ padding: "10px 14px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{b.qty}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: isBest ? "#e11d48" : BLK, fontFamily: F, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 2 }}>{fmt(b.price)}</div>
                        <div style={{ fontSize: 10, color: GR, fontFamily: F, marginBottom: 8 }}>+ 10,00 KM dostava</div>
                        {b.savings != null && (
                          <div style={{ fontSize: 10, fontWeight: 700, color: isBest ? "#e11d48" : BLUE, fontFamily: F }}>✓ Uštedite {fmt(b.savings)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 12, color: GR, fontFamily: F, marginTop: 12 }}>Plaćanje pouzećem pri preuzimanju · Bez predujma</p>
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

      {/* ══ URGENCY BANNER ══ */}
      <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, padding: "14px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexWrap: "wrap", padding: "0 24px" }}>
          {[
            { icon: "⚡", text: "Zalihe ograničene — preostalo 38 kom" },
            { icon: "🔥", text: "Velika potražnja zbog ljetne sezone" },
            { icon: "🚚", text: "Dostava 24–48h na vašu adresu" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: F, letterSpacing: "0.01em" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ URGENCY CTA SEKCIJA ══ */}
      <section style={{ background: "#fff", padding: "64px 0 72px", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 40, alignItems: "center" }} className="u-urgency-grid">

            {/* Lijevo */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.5, ease: EASE }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: BLUE, fontFamily: F, marginBottom: 18 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />
                Akcijska cijena
              </div>
              <h2 style={{ fontFamily: F, fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.06, marginBottom: 20 }}>
                Spremi svoju sobu<br /><span style={{ color: BLUE }}>ovog ljeta.</span>
              </h2>
              <p style={{ fontSize: 15, color: GR, fontFamily: F, lineHeight: 1.8, marginBottom: 32, maxWidth: 420 }}>
                Bez direktnog strujanja, bez prehlade, bez neugodnosti. Postavljanje za 3 minute — bez majstora, bez bušenja.
              </p>

              {/* Trust checkmarks */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
                {[
                  "Plaćanje pouzećem — nema predujma",
                  "Dostava 24–48h na kućnu adresu",
                  "14 dana pravo na povrat bez pitanja",
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: BLT, border: `1.5px solid ${BRDR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: 14, color: BLK, fontFamily: F, fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => openPopup(3)} className="u-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", fontSize: 15, fontWeight: 800 }}>
                Naruči odmah
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </motion.div>

            {/* Desno — featured bundle card */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={FIN} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}>
              <div style={{
                borderRadius: 24, overflow: "hidden",
                border: `2px solid ${BLUE}`,
                boxShadow: `0 0 0 6px rgba(26,95,255,0.08), 0 24px 64px rgba(26,95,255,0.18)`,
                background: "#fff",
              }}>
                {/* Header badge */}
                <div style={{ background: `linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: F, textTransform: "uppercase", letterSpacing: "0.08em" }}>⭐ Najviše se naručuje</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)", fontFamily: F }}>3 komada</span>
                </div>

                <div style={{ padding: "28px 28px 24px" }}>
                  {/* Price */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Cijena paketa</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <span style={{ fontSize: 48, fontWeight: 900, color: BLUE, fontFamily: F, letterSpacing: "-0.05em", lineHeight: 1 }}>28,90 KM</span>
                    </div>
                    <div style={{ fontSize: 13, color: GR, fontFamily: F, marginTop: 4 }}>
                      Ukupno za plaćanje: <strong style={{ color: BLK }}>38,90 KM</strong> (uklj. dostava)
                    </div>
                  </div>

                  {/* Savings */}
                  <div style={{ background: "#f0f6ff", border: `1px solid ${BRDR}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: BLT, border: `1.5px solid ${BRDR}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, fontFamily: F }}>Uštedite 12,90 KM</div>
                      <div style={{ fontSize: 11, color: GR, fontFamily: F }}>u odnosu na pojedinačnu kupovinu</div>
                    </div>
                  </div>

                  {/* Per unit */}
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${BRDR}`, paddingTop: 16, marginBottom: 22 }}>
                    {[
                      { label: "Cijena po komadu", value: "9,63 KM" },
                      { label: "Dostava", value: "10,00 KM" },
                      { label: "Komada", value: "3" },
                    ].map((row, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: GR, fontFamily: F, marginBottom: 3 }}>{row.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: BLK, fontFamily: F }}>{row.value}</div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => openPopup(3)}
                    style={{ width: "100%", padding: "15px 0", background: `linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: F, cursor: "pointer", letterSpacing: "0.01em", boxShadow: "0 6px 24px rgba(26,95,255,0.32)" }}>
                    Naruči odmah — Plaćanje pouzećem
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <style suppressHydrationWarning>{`
          @media (max-width: 860px) { .u-urgency-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>

      {/* ══ BUNDLE SEKCIJA ══ */}
      <section style={{ background: "linear-gradient(180deg,#f8faff 0%,#fff 100%)", padding: "72px 0 80px", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.5, ease: EASE }}
            style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: BLUE, fontFamily: F, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />
              Odaberite paket
            </div>
            <h2 style={{ fontFamily: F, fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.08, margin: 0 }}>
              Što više uzmeš, <span style={{ color: BLUE }}>više uštediš.</span>
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="u-pkg-grid">
            {BUNDLES.map((b, i) => {
              const isBest = b.id === 3;
              return (
                <motion.div key={b.id}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN}
                  transition={{ duration: 0.45, ease: EASE, delay: i * 0.07 }}
                  onClick={() => openPopup(b.id)}
                  style={{
                    borderRadius: 20,
                    border: `2px solid ${isBest ? "#e11d48" : BRDR2}`,
                    background: isBest ? "linear-gradient(160deg,#fff5f7 0%,#fff 100%)" : "#fff",
                    boxShadow: isBest ? "0 8px 40px rgba(225,29,72,0.13), 0 0 0 4px rgba(225,29,72,0.06)" : "0 2px 16px rgba(10,10,26,0.07)",
                    cursor: "pointer",
                    overflow: "hidden",
                    transition: "transform 0.18s, box-shadow 0.18s",
                    position: "relative",
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                >
                  {/* Badge */}
                  {b.badge && (
                    <div style={{
                      background: b.badgeColor, color: "#fff",
                      fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: F,
                      padding: "7px 14px", textAlign: "center",
                    }}>
                      {b.badge}
                    </div>
                  )}
                  {!b.badge && <div style={{ height: 32 }} />}

                  <div style={{ padding: "20px 22px 24px" }}>
                    {/* Quantity dots */}
                    <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
                      {Array.from({ length: b.qty_n }).map((_, j) => (
                        <div key={j} style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: isBest ? "#e11d48" : BLUE,
                          opacity: 1,
                        }} />
                      ))}
                    </div>

                    {/* Qty label */}
                    <div style={{ fontSize: 13, fontWeight: 700, color: GR, fontFamily: F, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      {b.qty}
                    </div>

                    {/* Price */}
                    <div style={{ fontSize: 38, fontWeight: 900, color: isBest ? "#e11d48" : BLK, fontFamily: F, letterSpacing: "-0.05em", lineHeight: 1, marginBottom: 4 }}>
                      {fmt(b.price)}
                    </div>
                    <div style={{ fontSize: 12, color: GR, fontFamily: F, marginBottom: 18 }}>+ 10,00 KM dostava</div>

                    {/* Savings */}
                    {b.savings != null ? (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: isBest ? "rgba(225,29,72,0.08)" : "#f0f9ff",
                        border: `1px solid ${isBest ? "rgba(225,29,72,0.2)" : "rgba(26,95,255,0.15)"}`,
                        borderRadius: 8, padding: "5px 10px", marginBottom: 22,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isBest ? "#e11d48" : BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isBest ? "#e11d48" : BLUE, fontFamily: F }}>Uštedite {fmt(b.savings)}</span>
                      </div>
                    ) : (
                      <div style={{ height: 33, marginBottom: 22 }} />
                    )}

                    {/* CTA */}
                    <button style={{
                      width: "100%", padding: "12px 0", borderRadius: 12,
                      background: isBest ? "#e11d48" : `linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`,
                      color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: F, border: "none",
                      cursor: "pointer", letterSpacing: "0.02em",
                      boxShadow: isBest ? "0 4px 18px rgba(225,29,72,0.35)" : "0 4px 18px rgba(26,95,255,0.28)",
                    }}>
                      Naruči odmah →
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <style>{`
            @media (max-width: 900px) { .u-pkg-grid { grid-template-columns: repeat(2,1fr) !important; } }
            @media (max-width: 520px) { .u-pkg-grid { grid-template-columns: 1fr !important; } }
          `}</style>
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
                  Naruči odmah — od 11,90 KM
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
                <div className="u-split-caption" style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                  <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0, boxShadow: "0 0 8px rgba(74,222,128,0.8)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: F }}>Komforan boravak bez direktnog puhanja</span>
                  </div>
                </div>

                {/* Top-right chip */}
                <motion.div
                  className="u-split-chip"
                  initial={{ opacity: 0, y: -12 }} whileInView={{ opacity: 1, y: 0 }} viewport={FIN} transition={{ duration: 0.4, delay: 0.45 }}
                  style={{ position: "absolute", top: 16, right: 16, background: "#fff", borderRadius: 12, padding: "8px 13px", boxShadow: "0 4px 20px rgba(10,10,26,0.14)", display: "flex", alignItems: "center", gap: 7 }}
                >
                  <div style={{ display: "flex", gap: 1 }}>
                    {[...Array(5)].map((_, i) => <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: BLK, fontFamily: F }}>4,8 · 1.200+ kupaca</span>
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
      <section style={{ background: "#f8faff", padding: "88px 0", borderBottom: `1px solid ${BRDR2}` }}>
        <div style={inner}>
          <motion.div {...FADE} style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: BLUE, fontFamily: F, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, display: "inline-block" }} />
              Recenzije kupaca
            </div>
            <h2 style={{ fontFamily: F, fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 900, letterSpacing: "-0.04em", color: BLK, lineHeight: 1.08, margin: "0 auto 12px", maxWidth: 480 }}>
              Stvarni kupci. <span style={{ color: BLUE }}>Stvarni rezultati.</span>
            </h2>
            <p style={{ fontSize: 15, color: GR, fontFamily: F, margin: 0 }}>Više od 400 zadovoljnih kupaca širom Bosne i Hercegovine</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="u-rev-g">
            {REVIEWS.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={FIN} transition={{ duration: 0.5, ease: EASE, delay: i * 0.09 }}
                style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 18px rgba(10,10,26,0.07)", border: `1px solid ${BRDR2}` }}
              >
                {/* Photo */}
                <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", position: "relative" }}>
                  <img
                    src={r.photo}
                    alt={`Recenzija ${r.name}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transition: "transform 0.4s ease" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                  />
                  {/* Verified badge */}
                  <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", borderRadius: 8, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#15803d", fontFamily: F }}>Verificirano</span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "18px 20px 20px" }}>
                  {/* Stars */}
                  <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                    {[...Array(5)].map((_, s) => (
                      <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill={s < r.stars ? "#f59e0b" : "#e0e4ef"} stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  {/* Text */}
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: BLK, fontFamily: F, marginBottom: 16, fontWeight: 500 }}>
                    &ldquo;{r.text}&rdquo;
                  </p>
                  {/* Author */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: F }}>{r.name[0]}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: BLK, fontFamily: F, lineHeight: 1.2 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: GR, fontFamily: F }}>{r.city}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <style suppressHydrationWarning>{`
            @media (max-width: 900px) { .u-rev-g { grid-template-columns: repeat(2,1fr) !important; } }
            @media (max-width: 520px)  { .u-rev-g { grid-template-columns: 1fr !important; } }
          `}</style>
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
