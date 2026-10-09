"use client";

import { useState, useRef, useEffect, FormEvent, CSSProperties } from "react";
import "./aeox.css";
import Image from "next/image";
import { createPortal } from "react-dom";
import { event as fbEvent } from "@/lib/fbpixel";

/* ── Constants ───────────────────────────────────────────────────── */
const ACCENT  = "#C14822";
const F       = "var(--font-manrope, 'Inter', sans-serif)";
const PRICE    = 59.90;
const DELIVERY = 0;

const DAY_NAMES = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];

function OrderReceivedCopy({ style }: { style: CSSProperties }) {
  const day = new Date().getDay();
  const ships = (day === 0 || day === 5 || day === 6)
    ? "Vaša narudžba se šalje u ponedjeljak."
    : `Vaša narudžba se šalje sutra (${DAY_NAMES[(day + 1) % 7]}).`;
  return (
    <p style={style}>
      Vaša narudžba je primljena.<br />
      {ships}
    </p>
  );
}

const SIZES = [41, 42, 43, 44, 45, 46, 47];
/* Stock: sizes not in stock can't be selected; LOW_STOCK caps qty and shows a red note */
const OUT_OF_STOCK = new Set<number>([47]);
const LOW_STOCK: Record<number, number> = { 41: 5 };
const maxQty = (s: number) => LOW_STOCK[s] ?? 5;
const LOW_STOCK_RED = "#DC2626";

const REVIEWS = [
  { name: "Haris D.", age: 32, city: "Ilijaš", role: "Montažer", rating: 5, text: "Nosim ih cijeli dan na krovu. Laganije su nego što sam očekivao i noga se manje umara." },
  { name: "Mehmed S.", age: 51, city: "Zenica", role: "Skladište", rating: 5, text: "Đon dobro drži i na mokrom podu. Uzeo sam ih zbog zaštite od proboja i zadovoljan sam." },
  { name: "Nermin A.", age: 34, city: "Mostar", role: "Automehaničar", rating: 5, text: "Broj mi odgovara, a u servisu se nisu klizale ni po vodi ni po ulju." },
];

const FAQS = [
  { q: "Koju veličinu da odaberem?", a: "Naručite broj koji inače nosite. Ako ste između dva broja, odaberite veći." },
  { q: "Jesu li vodootporne?", a: "Prednji dio ima vodonepropusnu foliju koja štiti stopalo na kiši i vlažnim podovima." },
  { q: "Koliko traje dostava?", a: "Dostava širom BiH traje 1–3 radna dana i besplatna je." },
  { q: "Kako plaćam narudžbu?", a: "Plaćate pouzećem, kuriru pri preuzimanju paketa." },
  { q: "Mogu li vratiti patike?", a: "Povrat je moguć u roku od 14 dana od primitka, za nenošene patike u originalnom pakovanju." },
];

/* ── Helpers ─────────────────────────────────────────────────────── */
function fmt(n: number) { return n.toFixed(2).replace(".", ",") + " KM"; }

const PIXEL_BASE = {
  content_name: "Aeox Plus S3 Radne Patike",
  content_ids: ["radne-patike-aeox"],
  content_type: "product",
  value: PRICE,
  currency: "BAM",
};

function pixel(name: string, extra: Record<string, unknown> = {}, eventID?: string) {
  fbEvent(name, { ...PIXEL_BASE, ...extra }, eventID);
}

function getExternalId() {
  try { return localStorage.getItem("_crt_eid") || ""; } catch { return ""; }
}

function useDayCountdown() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setRemaining(Math.max(0, Math.ceil((midnight.getTime() - now.getTime()) / 1000)));
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);
  return remaining;
}

function countdownText(remaining: number | null) {
  if (remaining === null) return "--:--:--";
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  return [hours, minutes, seconds].map(part => String(part).padStart(2, "0")).join(":");
}

/* ── Header ──────────────────────────────────────────────────────── */
function Header({ onOrder }: { onOrder: () => void }) {
  return <header className="ae-header"><div className="ae-header-inner"><a href="/" className="ae-logo">cartly<span>.</span>ba</a><nav aria-label="Navigacija proizvoda"><a href="#konstrukcija">Konstrukcija</a><a href="#naruci">Veličine i narudžba</a><a href="#iskustva">Iskustva</a></nav><button type="button" onClick={onOrder}>Naruči <span>↗</span></button></div></header>;
}

/* ── Hero ────────────────────────────────────────────────────────── */
function Hero({ onOrder, remaining }: { onOrder: () => void; remaining: number | null }) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const gallery = [
    { src: "/aeoxplus/2.webp", alt: "Aeox Plus S3 radna patika, bočni pogled" },
    { src: "/aeoxplus/11.webp", alt: "Aeox Plus S3 patike i protuklizni đon" },
    { src: "/aeoxplus/1.webp", alt: "Aeox Plus S3 radna patika, drugi pogled" },
  ];
  const move = (step: number) => setActive(index => (index + step + gallery.length) % gallery.length);
  const order = () => { pixel("AddToCart"); onOrder(); };

  return (
    <section className="ae-hero">
      <div className="ae-hero-inner">
        <div className="ae-hero-head">
          <span className="ae-eyebrow"><span className="ae-eyebrow-line" /> AEOX PLUS S3 / RADNE PATIKE</span>
          <span className="ae-hero-code">ZAŠTITA ZA SVAKI RADNI DAN</span>
        </div>
        <div className="ae-hero-grid">
          <div className="ae-hero-copy">
            <div className="ae-offer-kicker"><span className="ae-offer-kicker-dot" /> AKCIJSKA PONUDA <span>UŠTEDA 80 KM</span></div>
            <h1>Siguran korak.<br /><em>Lakši radni dan.</em></h1>
            <p className="ae-hero-lead">S3 zaštita u patikama koje možeš nositi cijeli dan.</p>
            <div className="ae-hero-proof"><span>200 J zaštita prstiju</span><span>Protuklizni đon</span><span>Besplatna dostava</span></div>
          </div>
          <div className="ae-gallery">
            <div className="ae-gallery-main" onTouchStart={e => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touchStart.current !== null) { const delta = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1); touchStart.current = null; } }}>
              <span className="ae-gallery-tag">EN ISO 20345 / S3</span>
              {gallery.map((item, index) => (
                <div className={`ae-gallery-slide${index === active ? " is-active" : ""}`} key={item.src}>
                  <Image src={item.src} alt={item.alt} fill sizes="(max-width: 900px) 100vw, 690px" quality={85} priority={index === 0} style={{ objectFit: "contain" }} />
                </div>
              ))}
              <div className="ae-gallery-controls">
                <span className="ae-gallery-count">0{active + 1} <span>/ 0{gallery.length}</span></span>
                <div className="ae-gallery-arrows">
                  <button type="button" onClick={() => move(-1)} aria-label="Prethodna slika">←</button>
                  <button type="button" onClick={() => move(1)} aria-label="Sljedeća slika">→</button>
                </div>
              </div>
            </div>
            <div className="ae-gallery-thumbs" aria-label="Fotografije proizvoda">
              {gallery.map((item, index) => (
                <button type="button" className={`ae-thumb${index === active ? " is-active" : ""}`} key={item.src} onClick={() => setActive(index)} aria-label={`Prikaži sliku ${index + 1}`} aria-pressed={index === active}>
                  <Image src={item.src} alt="" fill sizes="100px" style={{ objectFit: "contain" }} />
                </button>
              ))}
              <div className="ae-gallery-note">Pogledaj iz svakog ugla</div>
            </div>
          </div>
          <div className="ae-buy-panel">
            <div className="ae-price-row"><div><span className="ae-price-label">Akcijska cijena / par</span><div className="ae-price">59,90 <small>KM</small></div></div><span className="ae-old-price">139,90 KM</span></div>
            <div className="ae-promo-timer" role="timer" aria-label={`Akcijska cijena ističe za ${countdownText(remaining)}`}>
              <span><i aria-hidden="true" /> Akcijska cijena ističe za</span>
              <strong>{countdownText(remaining)}</strong>
            </div>
            <button className="ae-primary-button" type="button" onClick={order}>Odaberi veličinu i naruči <span aria-hidden>↗</span></button>
            <div className="ae-buy-meta"><span>✓ Plaćanje pouzećem</span><span>✓ Dostava 0 KM</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Exploded construction view ──────────────────────────────────── */
function ExplodedView() {
  const details = [
    { number: "01", title: "Metalna kapica", text: "Štiti prste od udara do 200 J." },
    { number: "02", title: "Kevlar sloj", text: "Štiti stopalo od proboja odozdo." },
    { number: "03", title: "Protuklizni đon", text: "Stabilan oslonac na zahtjevnim površinama." },
  ];
  return (
    <section className="ae-anatomy" id="konstrukcija">
      <div className="ae-section-shell">
        <div className="ae-anatomy-intro"><span className="ae-eyebrow"><span className="ae-eyebrow-line" /> Ispod površine</span><h2>Zaštita je u<br /><em>svakom sloju.</em></h2><p>Od kapice do đona, svaki detalj ima svoju ulogu. Pogledaj kako je Aeox Plus S3 napravljen.</p></div>
        <div className="ae-anatomy-grid">
          <figure className="ae-anatomy-image"><a href="/aeoxplus/4.webp" target="_blank" rel="noopener noreferrer" aria-label="Otvori uvećani prikaz konstrukcije"><Image src="/aeoxplus/4.webp" alt="Rastavljeni prikaz Aeox Plus S3 patike sa metalnom kapicom, uloškom, kevlar slojem i protukliznim đonom" width={1312} height={1199} quality={85} sizes="(max-width: 900px) 100vw, 750px" style={{ display: "block", width: "100%", height: "auto" }} /></a><figcaption><span>01—06 / Anatomija Aeox Plus S3 patike</span><a href="/aeoxplus/4.webp" target="_blank" rel="noopener noreferrer">Povećaj prikaz ↗</a></figcaption></figure>
          <div className="ae-anatomy-details"><span className="ae-detail-kicker">KONSTRUKCIJA / S3</span>{details.map(detail => <div className="ae-detail" key={detail.number}><span>{detail.number}</span><div><h3>{detail.title}</h3><p>{detail.text}</p></div></div>)}<a href="#naruci" className="ae-anatomy-link">Pronađi svoj broj <span>↗</span></a></div>
        </div>
      </div>
    </section>
  );
}

function FloatingBar({ onOrder, remaining, hidden }: { onOrder: () => void; remaining: number | null; hidden: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const hero = document.querySelector(".ae-hero");
      const order = document.getElementById("naruci");
      const footer = document.querySelector("footer");
      if (!hero || !order || !footer) return;
      const form = order.getBoundingClientRect();
      const bottom = footer.getBoundingClientRect();
      const formInView = form.top < window.innerHeight - 120 && form.bottom > 80;
      const footerInView = bottom.top < window.innerHeight;
      setVisible(hero.getBoundingClientRect().bottom < 80 && !formInView && !footerInView);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!visible || hidden) return null;

  return (
    <div className="ae-floating-cta">
      <div className="ae-floating-info">
        <span className="ae-floating-label">Aeox Plus S3</span>
        <strong>59,90 <small>KM</small></strong>
        <span className="ae-floating-time">Akcija ističe za {countdownText(remaining)}</span>
      </div>
      <button type="button" onClick={() => { pixel("AddToCart"); onOrder(); }}>Naruči odmah <span aria-hidden="true">↗</span></button>
    </div>
  );
}

/* ── Reviews ─────────────────────────────────────────────────────── */
function Reviews() {
  return (
    <section id="iskustva" style={{ background: "#FAFAFA", padding: "80px 24px", borderTop: "1px solid #F0F0F0" }} className="ae-reviews">
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
            Iskustva s terena
          </h2>
          <p style={{ fontSize: 14, color: "#999", fontFamily: F }}>Kako se patike nose kroz stvaran radni dan</p>
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0A", fontFamily: F }}>{r.name}, {r.age}</div>
                  <div style={{ fontSize: 11, color: "#999", fontFamily: F }}>{r.role} · {r.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style suppressHydrationWarning>{`
        .r-reviews-grid { grid-template-columns: repeat(3,1fr) !important; }
        @media(max-width:900px) {
          .r-reviews-grid { grid-template-columns:1fr !important; }
          .ae-reviews { padding: 48px 16px !important; }
        }
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
          <p style={{ fontSize: 14, color: "#999", fontFamily: F }}>Kratko i jasno prije narudžbe</p>
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
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: F, margin: 0 }}>Aeox Plus S3 Radne Patike · Plaćanje pouzećem · BiH</p>
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: F }}>Dostava širom BiH</span>
          <a href="mailto:taysibog@gmail.com" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: F, textDecoration: "none" }}>Kontakt</a>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "24px auto 0", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: F, margin: 0 }}>© {new Date().getFullYear()} Cartly.ba · Sva prava pridržana</p>
      </div>
    </footer>
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
      const res  = await fetch("/api/aeox-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, velicina: size, kolicina: qty, externalId: getExternalId() }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      pixel("Purchase", { value: total, num_items: qty }, data.orderNumber);
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
            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 10px", fontFamily: F }}>Hvala{fields.ime.trim() ? `, ${fields.ime.trim().split(" ")[0]}` : ""}!</h3>
            <OrderReceivedCopy style={{ fontSize: 14, color: "#888", lineHeight: 1.75, margin: "0 0 28px", maxWidth: 320, marginLeft: "auto", marginRight: "auto", fontFamily: F }} />
            <button onClick={onClose} style={{ padding: "13px 36px", background: "#0A0A0A", color: "#fff", border: "none", borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F }}>Zatvori</button>
          </div>
        ) : (
          <div style={{ padding: "24px 24px 48px" }}>
            {/* Header */}
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 4px", fontFamily: F }}>Naruči Aeox Plus S3</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "#ccc", textDecoration: "line-through", fontFamily: F }}>139,90 KM</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#0A0A0A", letterSpacing: "-0.03em", fontFamily: F }}>59,90 KM</span>
                <span style={{ background: "#16A34A", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 5, fontFamily: F }}>−57%</span>
              </div>
            </div>

            {/* Size picker */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12, fontFamily: F }}>
                Odaberite veličinu {errors.size && <span style={{ color: "#ef4444", textTransform: "none", fontWeight: 600 }}>- {errors.size}</span>}
              </div>
              <div className="ae-modal-sizes" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SIZES.map(s => {
                  const out = OUT_OF_STOCK.has(s);
                  const low = LOW_STOCK[s] !== undefined;
                  return (
                    <button key={s} type="button" disabled={out} className="ae-modal-size"
                      aria-label={out ? `Broj ${s} - nema na stanju` : low ? `Broj ${s} - još ${LOW_STOCK[s]} komada na stanju` : `Broj ${s}`}
                      title={out ? "Nema na stanju" : undefined}
                      onClick={() => { if (out) return; setSize(s); setQty(q => Math.min(q, maxQty(s))); setErrors(er => ({ ...er, size: "" })); }}
                      style={{ position: "relative", width: 48, height: 48, border: `2px solid ${size===s ? ACCENT : low ? "rgba(220,38,38,0.45)" : "#E5E7EB"}`, background: out ? "#F5F5F5" : size===s ? "rgba(179,48,0,0.06)" : "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, color: out ? "#BDBDBD" : size===s ? ACCENT : "#0A0A0A", textDecoration: out ? "line-through" : "none", cursor: out ? "not-allowed" : "pointer", transition: "all 0.15s", fontFamily: F }}>
                      {s}
                      {low && <span aria-hidden style={{ position: "absolute", top: -4, right: -4, width: 10, height: 10, borderRadius: "50%", background: LOW_STOCK_RED, border: "2px solid #fff" }} />}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", columnGap: 14, rowGap: 4, fontSize: 12, fontFamily: F, lineHeight: 1.4 }}>
                {Object.entries(LOW_STOCK).map(([sz, n]) => (
                  <span key={sz} style={{ color: LOW_STOCK_RED, fontWeight: 700 }}>Broj {sz}: još {n} komada na stanju</span>
                ))}
                {Array.from(OUT_OF_STOCK).map(sz => (
                  <span key={sz} style={{ color: "#9CA3AF", fontWeight: 600 }}>Broj {sz}: nema na stanju</span>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12, fontFamily: F }}>Količina</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width: 40, height: 40, border: "1.5px solid #E5E7EB", background: "#fff", borderRadius: 10, fontSize: 18, fontWeight: 700, color: "#0A0A0A", cursor: "pointer", fontFamily: F }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#0A0A0A", fontFamily: F, minWidth: 20, textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(size !== undefined ? maxQty(size) : 5, q+1))} style={{ width: 40, height: 40, border: "none", background: ACCENT, borderRadius: 10, fontSize: 18, fontWeight: 700, color: "#fff", cursor: "pointer" }}>+</button>
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
                    <div style={{ fontSize:13, fontWeight:800, color:"#4ade80", fontFamily:F }}>Besplatno</div>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="r-cta"
                  style={{ width:"100%", padding:"15px", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:900, cursor:loading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:14, boxShadow:"0 4px 20px rgba(0,0,0,0.15)", fontFamily:F, opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Šalje se..." : "Naruči - Plaćanje pouzećem"}
                </button>
                <div style={{ display:"flex", justifyContent:"center", gap:18, marginTop:12, flexWrap:"wrap" }}>
                  {["Bez predujma","Dostava 1-3 dana","Garancija 1 god."].map((t,i) => (
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
      if (OUT_OF_STOCK.has(s)) return prev;
      const next = Math.min(maxQty(s), Math.max(0, (prev[s] ?? 0) + d));
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
      const res  = await fetch("/api/aeox-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ime: name, telefon: phone, adresa: addr, grad: city, velicina: velicine[0]?.velicina, kolicina: totalPairs, velicine, externalId: getExternalId() }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      pixel("Purchase", { value: total, num_items: totalPairs }, data.orderNumber);
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
        <OrderReceivedCopy style={{ fontFamily: F, fontSize: 15, color: "#666", lineHeight: 1.6, margin: 0 }} />
      </div>
    </section>
  );

  return (
    <section id="naruci" className="ae-order" style={{ background: "#F9F9F9", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB", padding: "52px 20px" }}>
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
        .rq-sz-row { gap:12px; }
        .rq-sz-info { display:flex; align-items:center; flex-wrap:wrap; column-gap:10px; row-gap:2px; min-width:0; }
        .rq-sz-note { font-size:12px; font-weight:700; font-family:${F}; line-height:1.3; }
        @media(max-width:380px) { .rq-sz-note { font-size:11px; } .rq-sz-info { column-gap:8px; } }
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
                const out = OUT_OF_STOCK.has(s);
                const low = LOW_STOCK[s];
                return (
                  <div key={s} className="rq-sz-row" style={out ? { opacity: 0.55 } : undefined}>
                    <div className="rq-sz-info">
                      <span style={{ fontFamily: F, fontWeight: 700, fontSize: 15, color: out ? "#9CA3AF" : qty > 0 ? ACCENT : "#0A0A0A", minWidth: 28, textDecoration: out ? "line-through" : "none" }}>{s}</span>
                      {out && <span className="rq-sz-note" style={{ color: "#9CA3AF" }}>Nema na stanju</span>}
                      {!out && low !== undefined && <span className="rq-sz-note" style={{ color: LOW_STOCK_RED }}>Još {low} komada na stanju</span>}
                      {qty > 0 && <span style={{ fontSize: 11, color: ACCENT, fontFamily: F, fontWeight: 600 }}>{(qty * PRICE).toFixed(2).replace(".",",")} KM</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <button type="button" className="rq-q-btn" disabled={out || qty === 0} onClick={() => changeQty(s,-1)} aria-label={`Smanji broj ${s}`}>−</button>
                      <span style={{ fontFamily: F, fontWeight: 800, fontSize: 16, color: qty > 0 ? ACCENT : "#CCC", minWidth: 20, textAlign: "center" }}>{qty}</span>
                      <button type="button" className="rq-q-btn" disabled={out || qty >= maxQty(s)} onClick={() => changeQty(s,+1)} aria-label={`Povećaj broj ${s}`}>+</button>
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
              {totalPairs > 0 ? `${totalPairs} par${totalPairs > 1 ? "a" : ""} · besplatna dostava` : "Odaberi veličine"}
            </span>
            <span style={{ fontFamily: F, fontWeight: 900, fontSize: 24, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
              {totalPairs > 0 ? `${total.toFixed(2).replace(".",",")} KM` : "-"}
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
const B2B_KOLICINE = ["10-20 pari","21-50 pari","51-100 pari","100+ pari"];
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
                Posebne cijene za veće narudžbe, dostava na adresu firme i PDV račun. Sve u jednoj narudžbi.
              </p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { title:"Zaštita vaših zaposlenika", desc:"Zaštitna obuća za timove na terenu.",
                  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
                { title:"Dostava na adresu firme", desc:"Dostava direktno na adresu firme.",
                  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                { title:"Faktura i PDV račun", desc:"Dokumentacija za jednostavniju nabavku.",
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

          {/* Right - form */}
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
export default function AeoxPage() {
  const [modalOpen, setModalOpen]       = useState(false);
  const [initialSize, setInitialSize]   = useState<number|undefined>();
  const remaining = useDayCountdown();

  useEffect(() => {
    pixel("ViewContent");
  }, []);

  function openOrder(size?: number) {
    setInitialSize(size);
    setModalOpen(true);
    pixel("InitiateCheckout");
  }

  return (
    <>
      <style suppressHydrationWarning>{`html { scroll-behavior: smooth; } *, *::before, *::after { box-sizing: border-box; } body { margin: 0; }`}</style>
      <Header onOrder={() => openOrder()} />
      <main>
        <Hero onOrder={() => openOrder()} remaining={remaining} />
        <ExplodedView />
        <QuickOrderSection />
        <Reviews />
        <B2BSection />
        <FAQ />
      </main>
      <Footer />
      <FloatingBar onOrder={() => openOrder()} remaining={remaining} hidden={modalOpen} />
      <OrderModal open={modalOpen} onClose={() => setModalOpen(false)} initialSize={initialSize} />
    </>
  );
}
