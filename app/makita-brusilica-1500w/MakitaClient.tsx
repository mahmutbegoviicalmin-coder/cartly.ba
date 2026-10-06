"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star, Truck, ShieldCheck, Gauge, Zap, Disc3,
  Hand, Clock, Eye, ArrowRight, ChevronDown, BadgeCheck, Gift, Flame, Cog, Wrench, Timer, Users, Plug, Sparkles,
} from "lucide-react";
import { event } from "@/lib/fbpixel";
import SmartImage from "./SmartImage";
import OrderPopup from "./OrderPopup";
import OrderForm from "./OrderForm";
import FloatingCTA from "./FloatingCTA";
import SalesToast from "./SalesToast";
import { useCountdown } from "./useCountdown";
import {
  INK, INK2, MUTED, SOFT, BG, PAGE, WHITE, LINE, TEAL, TEAL_T, SALE, STAR, F,
  PRODUCT, CONTENT_ID, UNIT_PRICE, OLD_PRICE, IMG, fmt,
} from "./theme";

// ── Content ────────────────────────────────────────────────────────────────
const SAVING  = OLD_PRICE - UNIT_PRICE;
const PERCENT = Math.round((SAVING / OLD_PRICE) * 100);

const GALLERY = [
  { src: IMG.hero,     label: "Brusilica" },
  { src: IMG.side,     label: "Pogled sa strane" },
  { src: IMG.exploded, label: "Dijelovi" },
];

const HERO_POINTS = [
  { Icon: Gauge,       text: "Potenciometar, 6 brzina za svaki posao" },
  { Icon: Zap,         text: "Snaga 1500 W, do 12.000 o/min" },
  { Icon: ShieldCheck, text: "Garancija 24 mjeseca na cijeli uređaj" },
];

const FEATURES = [
  {
    Icon: Gauge, eyebrow: "Potenciometar · 6 brzina", title: "Brzina tačno onakva kakva vam treba.",
    body: "Točkićem birate jednu od 6 brzina: nisko za fino brušenje, poliranje i inox, visoko za rezanje metala, kamena i betona. Disk ne plavi i ne puca.",
    img: IMG.side, label: "Potenciometar",
    points: [
      { Icon: Disc3,  t: "Poliranje i inox" },
      { Icon: Flame,  t: "Bez pregrijavanja" },
      { Icon: Wrench, t: "Rezanje metala" },
    ],
  },
  {
    Icon: Zap, eyebrow: "Motor 1500 W", title: "Snaga koja ne posustaje.",
    body: "Motor od 1500 W vrti do 12.000 obrtaja u minuti. Kabl znači punu snagu od prvog do posljednjeg reza, bez punjenja i bez čekanja.",
    img: IMG.hero, label: "Motor 1500 W",
    points: [
      { Icon: Zap,   t: "1500 W snage" },
      { Icon: Timer, t: "12.000 o/min" },
      { Icon: Plug,  t: "Bez punjenja" },
    ],
  },
];

const HOTSPOTS = [
  { n: 1, x: 17, y: 34, title: "Aluminijsko kućište",    desc: "Reduktor hladi motor i podnosi težak rad." },
  { n: 2, x: 40, y: 33, title: "Motor 1500 W",           desc: "Do 12.000 o/min za brz i čist rez." },
  { n: 3, x: 63, y: 30, title: "Bakreni namotaji",       desc: "Stabilna snaga i pod opterećenjem." },
  { n: 4, x: 80, y: 27, title: "Potenciometar",          desc: "Elektronika za 6 brzina rada." },
  { n: 5, x: 44, y: 63, title: "Zaštitni štitnik",       desc: "Podesiv, štiti od varnica i krhotina." },
  { n: 6, x: 81, y: 72, title: "Bočna drška",            desc: "Gumirana, za siguran i miran hvat." },
  { n: 7, x: 18, y: 80, title: "Disk i prirubnice",      desc: "Brza i čvrsta montaža diska." },
];

const BENTO = [
  { Icon: ShieldCheck, title: "Garancija 24 mjeseca", body: "Na cijeli uređaj, bez sitnih slova." },
  { Icon: Eye,         title: "Pregled prije plaćanja", body: "Otvorite paket i tek onda platite." },
  { Icon: Hand,        title: "Ergonomski grip",      body: "Gumirana drška i bočni rukohvat." },
  { Icon: Sparkles,    title: "Novi model",           body: "Poboljšana verzija, tiši i stabilniji rad." },
];

const IN_BOX: { Icon: typeof Star; title: string; desc: string }[] = [
  { Icon: Gauge,       title: "Brusilica 1500 W",        desc: "Sa potenciometrom i 6 brzina" },
  { Icon: Hand,        title: "Bočna drška",             desc: "Gumirana, za sigurniji hvat" },
  { Icon: ShieldCheck, title: "Zaštitni štitnik diska",  desc: "Podesiv, sa stezaljkom" },
  { Icon: Disc3,       title: "Rezni disk",              desc: "Spreman za rad odmah" },
  { Icon: Cog,         title: "Prirubnice za disk",      desc: "Matica i podloška za montažu" },
  { Icon: BadgeCheck,  title: "Garancija 24 mjeseca",    desc: "Na cijeli uređaj" },
];

const SPECS: [string, string][] = [
  ["Snaga",             "1500 W"],
  ["Brzina",            "12.000 o/min"],
  ["Regulacija brzine", "Potenciometar, 6 brzina"],
  ["Napon",             "220–230 V"],
  ["Frekvencija",       "50–60 Hz"],
  ["Jačina struje",     "2.6 A"],
  ["Garancija",         "24 mjeseca"],
];

const REVIEWS = [
  { name: "Emir H.",    city: "Tuzla",     stars: 5, date: "prije 2 dana",    text: "Ozbiljna mašina za ove pare. Na inoxu spustim na drugu brzinu i nema plavljenja, a na šestoj reže armaturu kao puter." },
  { name: "Damir K.",   city: "Zenica",    stars: 5, date: "prije 4 dana",    text: "Radim limarske poslove i ovo mi je sad glavna brusilica. 1500 W se osjeti, ne guši se ni na debljem materijalu." },
  { name: "Tarik M.",   city: "Mostar",    stars: 5, date: "prije 1 sedmice", text: "Stiglo za dva dana, pregledao paket pa platio kuriru. Sve uredno, bez ijedne ogrebotine." },
  { name: "Kenan S.",   city: "Bihać",     stars: 5, date: "prije 1 sedmice", text: "Uzeo i poklon iznenađenja za 5 KM, dobio koristan dodatak. Brusilica radi tiho i mirno, regulacija brzine je odlična." },
  { name: "Nermin B.",  city: "Sarajevo",  stars: 4, date: "prije 2 sedmice", text: "Jako dobra mašina, kabl je mogao biti malo duži. Inače rezanje pločica i metala bez problema." },
  { name: "Haris Č.",   city: "Travnik",   stars: 5, date: "prije 3 sedmice", text: "Kupio drugu za radionicu. Garancija 24 mjeseca mi je bila presudna, a mašina je opravdala svaku marku." },
];

const DISTRIBUTION = [
  { stars: 5, pct: 92 },
  { stars: 4, pct: 6 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

const FAQ = [
  { q: "Mogu li pregledati paket prije plaćanja?", a: "Da. Kupovina je bez rizika: paket otvorite i pregledate pred kurirom, a platite tek kad ste zadovoljni." },
  { q: "Kako plaćam?", a: "Plaćate gotovinom kuriru u trenutku preuzimanja paketa. Nema plaćanja unaprijed niti kartice." },
  { q: "Koliko traje dostava i koliko košta?", a: "Dostava je besplatna na cijelu BiH i traje 1 do 3 radna dana. Narudžbe pristigle vikendom šaljemo u ponedjeljak, jer brza pošta vikendom ne radi." },
  { q: "Čemu služi potenciometar i 6 brzina?", a: "Točkićem birate brzinu. Nižim brzinama polirate i brusite osjetljive materijale poput inoxa, višim brzo režete metal, kamen i beton." },
  { q: "Kolika je garancija?", a: "Garancija je 24 mjeseca na cijeli uređaj. Uz to imate i 14 dana za povrat ako niste zadovoljni." },
  { q: "Šta je poklon iznenađenja?", a: "Za samo 5 KM uz narudžbu dobijate koristan dodatak za radionicu, spakovan u isti paket. Opciju birate u formi za narudžbu." },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function Stars({ n = 5, size = 15 }: { n?: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} strokeWidth={0} fill={i < n ? STAR : "#E5E5EA"} />
      ))}
    </span>
  );
}

const fadeUp = {
  initial:     { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: "-60px" },
  transition:  { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

function Countdown({ dark }: { dark?: boolean }) {
  const t = useCountdown();
  const cells: [string, string][] = [
    [t?.h ?? "--", "sati"],
    [t?.m ?? "--", "min"],
    [t?.s ?? "--", "sek"],
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {cells.map(([v, l], i) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            minWidth: 52, padding: "8px 6px 6px", borderRadius: 12, textAlign: "center",
            background: dark ? "rgba(255,255,255,0.1)" : WHITE,
            border: dark ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${LINE}`,
          }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: dark ? WHITE : INK, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: dark ? "rgba(255,255,255,0.55)" : SOFT, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
          </div>
          {i < 2 && <span style={{ fontSize: 18, fontWeight: 600, color: dark ? "rgba(255,255,255,0.4)" : SOFT }}>:</span>}
        </div>
      ))}
    </div>
  );
}

function InlineTimer() {
  const t = useCountdown();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontVariantNumeric: "tabular-nums" }}>
      {[t?.h ?? "--", t?.m ?? "--", t?.s ?? "--"].map((v, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ minWidth: 36, padding: "6px 0", textAlign: "center", borderRadius: 10, background: INK, color: WHITE, fontSize: 16, fontWeight: 600 }}>{v}</span>
          {i < 2 && <span style={{ fontWeight: 600, color: SOFT }}>:</span>}
        </span>
      ))}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function MakitaClient() {
  const [open,    setOpen]    = useState(false);
  const [active,  setActive]  = useState(0);
  const [faq,     setFaq]     = useState<number | null>(0);
  const [viewers, setViewers] = useState(27);
  const [stock,   setStock]   = useState(9);
  const [formInView, setFormInView] = useState(false);

  // Hide the floating CTA while the inline order form is on screen.
  useEffect(() => {
    const el = document.getElementById("naruci");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setFormInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setViewers(19 + Math.floor(Math.random() * 18));
    setStock(6 + Math.floor(Math.random() * 6));
    const id = setInterval(() => {
      setViewers((v) => Math.max(14, Math.min(48, v + Math.round((Math.random() - 0.45) * 4))));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  function scrollToForm() {
    event("AddToCart", {
      content_name: PRODUCT,
      content_ids:  [CONTENT_ID],
      content_type: "product",
      value:        UNIT_PRICE,
      currency:     "BAM",
      placement:    "hero",
    });
    document.getElementById("naruci")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openOrder(placement: string) {
    event("AddToCart", {
      content_name: PRODUCT,
      content_ids:  [CONTENT_ID],
      content_type: "product",
      value:        UNIT_PRICE,
      currency:     "BAM",
      placement,
    });
    setOpen(true);
  }

  return (
    <div className="mk-root" style={{ fontFamily: F, background: PAGE, color: INK }}>
      <style suppressHydrationWarning>{CSS}</style>

      {/* Announcement */}
      <div style={{ background: INK, color: WHITE, fontSize: 13, fontWeight: 500, textAlign: "center", padding: "10px 16px", letterSpacing: "-0.005em" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Truck size={15} strokeWidth={1.9} /> Besplatna dostava<span className="mk-hide-sm">&nbsp;na cijelu BiH</span>
          <span style={{ opacity: 0.35 }}>·</span> Plaćanje pouzećem
        </span>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="mk-wrap mk-hero">
        {/* Gallery */}
        <div className="mk-gallery">
          <div style={{ position: "relative" }}>
            <SmartImage key={active} src={GALLERY[active].src} alt={PRODUCT} label={GALLERY[active].label} radius={28} eager={active === 0} />
            <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="mk-pill" style={{ background: SALE, color: WHITE }}>-{PERCENT}%</span>
              <span className="mk-pill" style={{ background: "rgba(255,255,255,0.9)", color: INK, backdropFilter: "blur(8px)" }}>
                <Flame size={13} color={SALE} /> Najprodavanije
              </span>
            </div>
          </div>
          <div className="mk-thumbs">
            {GALLERY.map((g, i) => (
              <button
                key={g.src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Slika ${i + 1}`}
                className="mk-thumb"
                data-on={i === active ? "1" : undefined}
              >
                <SmartImage src={g.src} alt="" label="" radius={14} minimal />
              </button>
            ))}
          </div>
        </div>

        {/* Buy box */}
        <div className="mk-buy">
          <a href="#recenzije" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: INK }}>
            <Stars />
            <span style={{ fontSize: 14, fontWeight: 600 }}>4,9</span>
            <span style={{ fontSize: 14, color: MUTED }}>· 1.284 recenzije</span>
          </a>

          <h1 className="mk-h1">
            Makita brusilica 1500W
            <span style={{ display: "block", color: MUTED, fontWeight: 500 }}>sa potenciometrom.</span>
          </h1>

          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, color: INK2, maxWidth: 480 }}>
            Novi, poboljšani model sa 6 brzina i punih 1500 W. Kupovina bez rizika: paket pregledate prije plaćanja.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {HERO_POINTS.map(({ Icon, text }) => (
              <li key={text} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: INK }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: TEAL_T, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} strokeWidth={1.9} />
                </span>
                {text}
              </li>
            ))}
          </ul>

          {/* Price card */}
          <div className="mk-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}>{fmt(UNIT_PRICE)}</span>
                  <span style={{ fontSize: 17, color: SOFT, textDecoration: "line-through" }}>{fmt(OLD_PRICE)}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: SALE }}>
                  Uštedite {fmt(SAVING)} danas
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEAL, background: TEAL_T, padding: "6px 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Truck size={14} /> Dostava besplatna
              </div>
            </div>

            <div style={{ height: 1, background: LINE }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: INK }}>
                <Clock size={16} color={SALE} /> Akcijska cijena ističe za
              </div>
              <Countdown />
            </div>
          </div>

          <button type="button" className="mk-btn mk-btn-lg" onClick={scrollToForm}>
            Naruči odmah <ArrowRight size={19} strokeWidth={2.2} />
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: INK2 }}>
              <span className="mk-dot" /> Na stanju još <strong style={{ fontWeight: 600 }}>{stock} kom</strong> po akcijskoj cijeni
            </div>
            <div className="mk-stock"><span style={{ width: `${Math.min(100, stock * 7)}%` }} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: MUTED }}>
              <Eye size={14} /> {viewers} osoba trenutno gleda ovaj proizvod
            </div>
          </div>

          <div className="mk-trust">
            {[
              { Icon: Truck,       t: "Besplatna dostava", d: "1 do 3 radna dana" },
              { Icon: Eye,         t: "Pregled paketa",    d: "Prije plaćanja" },
              { Icon: ShieldCheck, t: "Garancija",         d: "24 mjeseca" },
            ].map(({ Icon, t, d }) => (
              <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6 }}>
                <Icon size={20} strokeWidth={1.7} color={INK} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{d}</div>
              </div>
            ))}
          </div>

          <div className="mk-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>EH</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Stars size={13} />
                <span style={{ fontSize: 12, color: MUTED, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <BadgeCheck size={13} color={TEAL} /> Emir H., Tuzla
                </span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.5, color: INK2 }}>
                &ldquo;Na inoxu spustim na drugu brzinu i nema plavljenja, a na šestoj reže armaturu kao puter.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ORDER FORM ───────────────────────────────────────────────── */}
      <section id="naruci" className="mk-wrap" style={{ scrollMarginTop: 16, paddingBottom: 72 }}>
        <motion.div {...fadeUp} style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 32px" }}>
          <div className="mk-eyebrow">Naručite danas</div>
          <h2 className="mk-h2">Narudžba za manje od minute.</h2>
          <p className="mk-lead">Popunite podatke i plaćate tek kad paket stigne. Dostava traje 1 do 3 radna dana.</p>
        </motion.div>

        <motion.div {...fadeUp} className="mk-order">
          {/* Summary */}
          <div className="mk-order-summary">
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 104, flexShrink: 0, borderRadius: 20, overflow: "hidden", background: WHITE, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <SmartImage src={IMG.hero} alt={PRODUCT} label="" radius={20} fit="contain" bg="#FFFFFF" minimal />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{PRODUCT}</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>1500 W · 6 brzina · 12.000 o/min</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <Stars size={13} />
                  <span style={{ fontSize: 12, color: MUTED }}>4,9 · 1.284</span>
                </div>
              </div>
            </div>

            <div className="mk-order-price">
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>Akcijska cijena</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}>{fmt(UNIT_PRICE)}</span>
                  <span style={{ fontSize: 15, color: SOFT, textDecoration: "line-through" }}>{fmt(OLD_PRICE)}</span>
                </div>
              </div>
              <span className="mk-pill" style={{ background: "rgba(215,0,21,0.08)", color: SALE, fontSize: 13, padding: "7px 12px" }}>
                -{PERCENT}% · Uštedite {fmt(SAVING)}
              </span>
            </div>

            <div className="mk-order-timer">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
                <Clock size={16} color={SALE} /> Akcija ističe za
              </span>
              <InlineTimer />
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>U paketu</div>
              <div className="mk-order-chips">
                {[
                  { Icon: Gauge,       t: "Brusilica 1500 W" },
                  { Icon: Hand,        t: "Bočna drška" },
                  { Icon: ShieldCheck, t: "Štitnik" },
                  { Icon: Disc3,       t: "Disk" },
                ].map(({ Icon, t }) => (
                  <span key={t} className="mk-chip"><Icon size={15} strokeWidth={1.9} color={TEAL} /> {t}</span>
                ))}
              </div>
            </div>

            <div className="mk-order-trust">
              {[
                { Icon: Truck,       t: "Besplatna dostava",     d: "Cijela BiH, 1 do 3 dana" },
                { Icon: Eye,         t: "Pregled prije plaćanja", d: "Platite kuriru tek kad pregledate" },
                { Icon: ShieldCheck, t: "Garancija 24 mjeseca",  d: "Na cijeli uređaj" },
              ].map(({ Icon, t, d }) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 12, background: WHITE, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{t}</span>
                    <span style={{ display: "block", fontSize: 12, color: MUTED, marginTop: 1 }}>{d}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="mk-order-form">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: INK, color: WHITE, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em" }}>Podaci za dostavu</h3>
            </div>
            <OrderForm />
          </div>
        </motion.div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────── */}
      <section className="mk-wrap" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="mk-stats">
          {[
            { Icon: Star,  v: "4,9/5",  l: "Prosječna ocjena" },
            { Icon: Users, v: "3.700+", l: "Zadovoljnih kupaca" },
            { Icon: Clock, v: "24h",    l: "Slanje paketa" },
            { Icon: Truck, v: "0 KM",   l: "Cijena dostave" },
          ].map(({ Icon, v, l }) => (
            <div key={l} className="mk-stat">
              <span className="mk-stat-icon"><Icon size={22} strokeWidth={1.8} /></span>
              <div>
                <div style={{ fontSize: "clamp(24px, 3.4vw, 30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{v}</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>{l}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="mk-wrap mk-section">
        <motion.div {...fadeUp} style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 56px" }}>
          <div className="mk-eyebrow">Zašto baš ova brusilica</div>
          <h2 className="mk-h2">Jedan alat. Svaki materijal.</h2>
          <p className="mk-lead">Od finog poliranja do rezanja betona, sa 6 brzina i punih 1500 W.</p>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp} className="mk-feature" data-flip={i % 2 ? "1" : undefined}>
              <div className="mk-feature-media">
                <SmartImage src={f.img} alt={f.title} label={f.label} ratio="1 / 1" radius={22} fit="contain" bg="#FFFFFF" />
              </div>
              <div className="mk-feature-copy">
                <span style={{ width: 44, height: 44, borderRadius: 14, background: TEAL_T, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <f.Icon size={22} strokeWidth={1.8} />
                </span>
                <div className="mk-eyebrow" style={{ marginTop: 18 }}>{f.eyebrow}</div>
                <h3 className="mk-h3">{f.title}</h3>
                <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: MUTED }}>{f.body}</p>
                <div className="mk-points">
                  {f.points.map(({ Icon, t }) => (
                    <div key={t} className="mk-point">
                      <Icon size={20} strokeWidth={1.7} color={TEAL} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mk-bento">
          {BENTO.map(({ Icon, title, body }) => (
            <motion.div key={title} {...fadeUp} className="mk-card" style={{ padding: 24 }}>
              <Icon size={24} strokeWidth={1.6} color={TEAL} />
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 16 }}>{title}</div>
              <div style={{ fontSize: 14, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>{body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── EXPLODED VIEW ────────────────────────────────────────────── */}
      <section className="mk-wrap mk-section" style={{ paddingTop: 24 }}>
        <motion.div {...fadeUp} className="mk-xray">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <div className="mk-eyebrow">Pogled iznutra</div>
            <h2 className="mk-h2">Napravljena da traje. Iznutra i spolja.</h2>
            <p className="mk-lead">Rastavili smo je da vidite šta plaćate: kvalitetni dijelovi, bakreni namotaji i aluminijsko kućište.</p>
          </div>

          <div className="mk-xray-stage">
            <SmartImage src={IMG.exploded} alt="Makita brusilica 1500W rastavljena na dijelove" label="Exploded view" ratio="1 / 1" radius={0} fit="contain" bg="transparent" />
            {HOTSPOTS.map((h) => (
              <span key={h.n} className="mk-hotspot" style={{ left: `${h.x}%`, top: `${h.y}%` }} aria-hidden="true">{h.n}</span>
            ))}
          </div>

          <div className="mk-xray-legend">
            {HOTSPOTS.map((h) => (
              <div key={h.n} className="mk-xray-item">
                <span className="mk-xray-num">{h.n}</span>
                <span>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{h.title}</span>
                  <span style={{ display: "block", fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>{h.desc}</span>
                </span>
              </div>
            ))}
            <div className="mk-xray-item" style={{ background: INK, borderColor: INK, color: WHITE }}>
              <span className="mk-xray-num" style={{ background: WHITE, color: INK }}><ShieldCheck size={14} strokeWidth={2.2} /></span>
              <span>
                <span style={{ display: "block", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Garancija 24 mjeseca</span>
                <span style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2, lineHeight: 1.45 }}>Na svaki od ovih dijelova.</span>
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── IN THE BOX + SPECS ───────────────────────────────────────── */}
      <section className="mk-wrap mk-section">
        <div className="mk-two">
          <motion.div {...fadeUp} className="mk-card" style={{ padding: 28 }}>
            <div className="mk-eyebrow">Šta dolazi u paketu</div>
            <h3 className="mk-h3" style={{ marginBottom: 20 }}>Sve što vam treba, odmah spremno za rad.</h3>
            <SmartImage src={IMG.side} alt="Makita brusilica 1500W sa bočnom drškom i štitnikom" label="Brusilica" ratio="1 / 1" radius={18} fit="contain" bg="#FFFFFF" />
            <div className="mk-box-grid">
              {IN_BOX.map(({ Icon, title, desc }) => (
                <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 11, background: TEAL_T, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</span>
                    <span style={{ display: "block", fontSize: 12, color: MUTED, marginTop: 2 }}>{desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="mk-card" style={{ padding: 28 }}>
            <div className="mk-eyebrow">Specifikacije</div>
            <h3 className="mk-h3" style={{ marginBottom: 20 }}>Tehnički detalji.</h3>
            <div>
              {SPECS.map(([k, v], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "15px 0", borderTop: i ? `1px solid ${LINE}` : "none", fontSize: 15 }}>
                  <span style={{ color: MUTED }}>{k}</span>
                  <span style={{ fontWeight: 500, textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, padding: 18, borderRadius: 18, background: TEAL_T, display: "flex", gap: 14, alignItems: "center" }}>
              <Gift size={26} color={TEAL} strokeWidth={1.7} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 14, lineHeight: 1.5, color: INK2 }}>
                <strong style={{ color: INK, fontWeight: 600 }}>Poklon iznenađenja za samo 5 KM.</strong> Dodajte ga u narudžbi i stiže u istom paketu.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────── */}
      <section id="recenzije" className="mk-section" style={{ background: WHITE, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div className="mk-wrap">
          <motion.div {...fadeUp} style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
            <div className="mk-eyebrow">Recenzije kupaca</div>
            <h2 className="mk-h2">Majstori su rekli svoje.</h2>
          </motion.div>

          <div className="mk-reviews-top">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 1 }}>4,9</div>
              <div style={{ marginTop: 10 }}><Stars size={20} /></div>
              <div style={{ fontSize: 14, color: MUTED, marginTop: 8 }}>na osnovu 1.284 recenzije</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, maxWidth: 420, width: "100%" }}>
              {DISTRIBUTION.map(({ stars, pct }) => (
                <div key={stars} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: MUTED }}>
                  <span style={{ width: 12 }}>{stars}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: BG, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: INK, borderRadius: 3 }} />
                  </div>
                  <span style={{ width: 34, textAlign: "right" }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mk-review-grid">
            {REVIEWS.map((r) => (
              <motion.div key={r.name} {...fadeUp} className="mk-card" style={{ padding: 24, background: PAGE }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Stars n={r.stars} size={14} />
                  <span style={{ fontSize: 12, color: SOFT }}>{r.date}</span>
                </div>
                <p style={{ margin: "14px 0 18px", fontSize: 15, lineHeight: 1.55, color: INK }}>{r.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: WHITE, border: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                    {r.name.split(" ").map((p) => p[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                      <BadgeCheck size={12} color={TEAL} /> Verifikovan kupac · {r.city}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="mk-wrap mk-section" style={{ maxWidth: 760, paddingBottom: 140 }}>
        <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="mk-eyebrow">Pitanja</div>
          <h2 className="mk-h2">Sve što trebate znati.</h2>
        </motion.div>
        <div className="mk-card" style={{ padding: "4px 24px" }}>
          {FAQ.map((f, i) => {
            const isOpen = faq === i;
            return (
              <div key={f.q} style={{ borderTop: i ? `1px solid ${LINE}` : "none" }}>
                <button
                  type="button"
                  onClick={() => setFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
                    padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    fontFamily: F, fontSize: 17, fontWeight: 600, color: INK, letterSpacing: "-0.01em",
                  }}
                >
                  {f.q}
                  <ChevronDown size={18} color={MUTED} style={{ transition: "transform .3s", transform: isOpen ? "rotate(180deg)" : "none", flexShrink: 0 }} />
                </button>
                <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows .35s cubic-bezier(.22,1,.36,1)" }}>
                  <div style={{ overflow: "hidden" }}>
                    <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.6, color: MUTED }}>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <FloatingCTA onOrder={() => openOrder("floating")} hidden={open || formInView} />
      <SalesToast />
      <OrderPopup open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const CSS = `
@media (max-width: 480px) { .mk-hide-sm { display: none; } }
.mk-root { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow-x: clip; }
.mk-root *, .mk-root *::before, .mk-root *::after { box-sizing: border-box; }
.mk-wrap { max-width: 1180px; margin: 0 auto; padding-left: 20px; padding-right: 20px; }
.mk-section { padding-top: 96px; padding-bottom: 96px; }
@media (max-width: 720px) { .mk-section { padding-top: 64px; padding-bottom: 64px; } .mk-wrap { padding-left: 16px; padding-right: 16px; } }

.mk-hero { display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; padding-top: 40px; padding-bottom: 72px; align-items: start; }
@media (max-width: 900px) { .mk-hero { grid-template-columns: 1fr; gap: 28px; padding-top: 16px; padding-bottom: 48px; } }
.mk-gallery { position: sticky; top: 24px; display: flex; flex-direction: column; gap: 12px; }
@media (max-width: 900px) { .mk-gallery { position: static; } }
.mk-thumbs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.mk-thumb { padding: 0; border: 2px solid transparent; border-radius: 16px; background: none; cursor: pointer; transition: border-color .2s, opacity .2s; opacity: .7; }
.mk-thumb[data-on] { border-color: ${INK}; opacity: 1; }
.mk-thumb:hover { opacity: 1; }
.mk-buy { display: flex; flex-direction: column; gap: 22px; }

.mk-h1 { margin: 0; font-size: clamp(36px, 5.2vw, 56px); line-height: 1.04; font-weight: 600; letter-spacing: -0.045em; }
.mk-h2 { margin: 0 0 14px; font-size: clamp(32px, 4.6vw, 52px); line-height: 1.06; font-weight: 600; letter-spacing: -0.04em; }
.mk-h3 { margin: 8px 0 12px; font-size: clamp(24px, 3vw, 32px); line-height: 1.12; font-weight: 600; letter-spacing: -0.03em; }
.mk-lead { margin: 0; font-size: clamp(17px, 2vw, 20px); line-height: 1.5; color: ${MUTED}; }
.mk-eyebrow { font-size: 13px; font-weight: 600; letter-spacing: 0.02em; color: ${TEAL}; margin-bottom: 10px; }

.mk-card { background: ${WHITE}; border: 1px solid ${LINE}; border-radius: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.mk-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 6px 11px; border-radius: 999px; letter-spacing: -0.005em; }

.mk-btn {
  width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px 22px; border: none; border-radius: 980px; cursor: pointer;
  background: ${INK}; color: ${WHITE}; font-family: inherit; font-size: 17px; font-weight: 500; letter-spacing: -0.01em;
  transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
}
.mk-btn:hover { background: #000; box-shadow: 0 10px 30px rgba(0,0,0,0.18); transform: translateY(-1px); }
.mk-btn:active { transform: scale(0.985); }
.mk-btn:disabled { opacity: .75; cursor: not-allowed; transform: none; }
.mk-btn-lg { padding: 19px 24px; font-size: 18px; }
.mk-btn-light { background: ${WHITE}; color: ${INK}; max-width: 360px; }
.mk-btn-light:hover { background: ${WHITE}; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }

.mk-dot { width: 8px; height: 8px; border-radius: 50%; background: #FF3B30; box-shadow: 0 0 0 0 rgba(255,59,48,.5); animation: mk-pulse 1.8s infinite; flex-shrink: 0; }
@keyframes mk-pulse { 0% { box-shadow: 0 0 0 0 rgba(255,59,48,.45); } 70% { box-shadow: 0 0 0 8px rgba(255,59,48,0); } 100% { box-shadow: 0 0 0 0 rgba(255,59,48,0); } }
.mk-stock { height: 5px; border-radius: 3px; background: ${BG}; overflow: hidden; }
.mk-stock span { display: block; height: 100%; background: linear-gradient(90deg, #FF3B30, #FF9F0A); border-radius: 3px; }

.mk-trust { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 18px 8px; border-top: 1px solid ${LINE}; border-bottom: 1px solid ${LINE}; }

.mk-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.mk-stat { display: flex; align-items: center; gap: 14px; padding: 22px 20px; background: ${WHITE}; border: 1px solid ${LINE}; border-radius: 22px; }
.mk-stat-icon { width: 48px; height: 48px; border-radius: 15px; background: ${TEAL_T}; color: ${TEAL}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
@media (max-width: 900px) { .mk-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
@media (max-width: 520px) {
  .mk-stat { flex-direction: column; align-items: flex-start; gap: 12px; padding: 18px 16px; border-radius: 20px; }
  .mk-stat-icon { width: 42px; height: 42px; border-radius: 13px; }
}

.mk-points { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 24px; }
.mk-point { display: flex; flex-direction: column; gap: 8px; padding: 14px 12px; border-radius: 16px; background: ${BG}; font-size: 13px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; }
.mk-feature-media { background: ${WHITE}; border-radius: 22px; overflow: hidden; }
.mk-feature { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; background: ${WHITE}; border: 1px solid ${LINE}; border-radius: 32px; padding: 20px; }
.mk-feature[data-flip] .mk-feature-media { order: 2; }
.mk-feature-copy { padding: 20px 28px 20px 0; }
.mk-feature[data-flip] .mk-feature-copy { padding: 20px 0 20px 28px; }
@media (max-width: 900px) {
  .mk-feature { grid-template-columns: 1fr; gap: 8px; padding: 12px; border-radius: 28px; }
  .mk-feature[data-flip] .mk-feature-media { order: 0; }
  .mk-feature-copy, .mk-feature[data-flip] .mk-feature-copy { padding: 16px 12px 20px; }
}
.mk-bento { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 28px; }
@media (max-width: 900px) { .mk-bento { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 420px) { .mk-bento { grid-template-columns: 1fr; } }

.mk-two { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 900px) { .mk-two { grid-template-columns: 1fr; } }

.mk-reviews-top { display: flex; align-items: center; justify-content: center; gap: 56px; margin-bottom: 48px; flex-wrap: wrap; }
.mk-review-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 900px) { .mk-review-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 620px) { .mk-review-grid { grid-template-columns: 1fr; } }

.mk-box-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 16px; margin-top: 22px; }
@media (max-width: 420px) { .mk-box-grid { grid-template-columns: 1fr; } }
.mk-order {
  display: grid; grid-template-columns: 0.92fr 1.08fr; gap: 10px; padding: 10px;
  background: ${WHITE}; border: 1px solid ${LINE}; border-radius: 34px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.03);
}
.mk-order-summary { display: flex; flex-direction: column; gap: 22px; padding: 28px; border-radius: 26px; background: ${BG}; }
.mk-order-price { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding-top: 22px; border-top: 1px solid ${LINE}; }
.mk-order-timer { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 12px 12px 16px; border-radius: 16px; background: ${WHITE}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.mk-order-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.mk-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; background: ${WHITE}; font-size: 13px; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.mk-order-trust { display: flex; flex-direction: column; gap: 14px; padding-top: 22px; border-top: 1px solid ${LINE}; margin-top: auto; }
.mk-order-form { padding: 28px 26px 22px; }
@media (max-width: 900px) {
  .mk-order { grid-template-columns: 1fr; border-radius: 28px; padding: 8px; }
  .mk-order-summary { padding: 20px 18px; gap: 18px; border-radius: 22px; }
  .mk-order-form { padding: 22px 12px 14px; }
  .mk-order-trust { display: none; }
}
.mk-xray {
  position: relative; padding: 56px 32px 40px; border-radius: 36px; overflow: hidden;
  background: radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0,131,143,0.10), transparent 70%), ${WHITE};
  border: 1px solid ${LINE}; box-shadow: 0 30px 80px rgba(0,0,0,0.05);
}
.mk-xray-stage { position: relative; max-width: 760px; margin: 28px auto 8px; }
.mk-xray-stage img { mix-blend-mode: multiply; }
.mk-hotspot {
  position: absolute; transform: translate(-50%, -50%); width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600;
  background: ${INK}; color: ${WHITE}; border: 2px solid ${WHITE};
  box-shadow: 0 6px 18px rgba(0,0,0,0.22); animation: mk-hot 2.4s ease-out infinite;
}
@keyframes mk-hot {
  0% { box-shadow: 0 6px 18px rgba(0,0,0,0.22), 0 0 0 0 rgba(0,131,143,0.45); }
  70% { box-shadow: 0 6px 18px rgba(0,0,0,0.22), 0 0 0 12px rgba(0,131,143,0); }
  100% { box-shadow: 0 6px 18px rgba(0,0,0,0.22), 0 0 0 0 rgba(0,131,143,0); }
}
.mk-xray-legend { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px; }
.mk-xray-item { display: flex; gap: 12px; align-items: flex-start; padding: 16px; border-radius: 18px; background: ${PAGE}; border: 1px solid ${LINE}; }
.mk-xray-num { width: 26px; height: 26px; border-radius: 50%; background: ${TEAL}; color: ${WHITE}; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
@media (max-width: 900px) { .mk-xray-legend { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) {
  .mk-xray { padding: 36px 12px 14px; border-radius: 28px; }
  .mk-hotspot { width: 22px; height: 22px; font-size: 11px; border-width: 1.5px; }
  .mk-xray-legend { grid-template-columns: 1fr 1fr; gap: 8px; }
  .mk-xray-item { flex-direction: column; gap: 8px; padding: 12px; border-radius: 16px; }
  .mk-xray-item > span:last-child > span:first-child { font-size: 14px !important; }
  .mk-xray-item > span:last-child > span:last-child { font-size: 12px !important; }
}
.mk-final { text-align: center; background: ${INK}; color: ${WHITE}; border-radius: 32px; padding: 72px 24px; background-image: radial-gradient(ellipse at top, rgba(0,131,143,0.35), transparent 60%); }

/* Floating CTA */
.mk-fab {
  position: fixed; right: 20px; bottom: calc(20px + env(safe-area-inset-bottom)); z-index: 9990;
  display: flex; align-items: center; gap: 12px; padding: 8px;
  background: rgba(255,255,255,0.86); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid ${LINE}; border-radius: 980px; cursor: pointer;
  box-shadow: 0 16px 48px rgba(0,0,0,0.14);
  transition: transform .45s cubic-bezier(.22,1,.36,1), opacity .45s ease, box-shadow .2s;
}
.mk-fab:hover { box-shadow: 0 20px 56px rgba(0,0,0,0.2); }
.mk-fab-copy { display: flex; flex-direction: column; align-items: flex-start; padding-right: 2px; }
.mk-fab-btn {
  display: inline-flex; align-items: center; gap: 6px; background: ${INK}; color: ${WHITE};
  border-radius: 980px; padding: 13px 20px; font-size: 15px; font-weight: 500; letter-spacing: -0.01em; white-space: nowrap;
}
@media (max-width: 560px) {
  .mk-fab { right: 14px; bottom: calc(14px + env(safe-area-inset-bottom)); padding: 6px; gap: 0; }
  .mk-fab-copy, .mk-fab-thumb { display: none !important; }
  .mk-fab-btn { padding: 15px 22px; font-size: 16px; }
}

/* Sales toast */
.mk-toast {
  position: fixed; left: 20px; bottom: calc(24px + env(safe-area-inset-bottom)); z-index: 9989;
  display: flex; align-items: center; gap: 12px; width: 320px; max-width: calc(100vw - 32px);
  padding: 12px 12px 12px 14px; border-radius: 20px;
  background: rgba(255,255,255,0.9); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid ${LINE}; box-shadow: 0 16px 44px rgba(0,0,0,0.12);
  opacity: 0; transform: translateY(16px) scale(.97); pointer-events: none;
  transition: opacity .45s ease, transform .45s cubic-bezier(.22,1,.36,1);
}
.mk-toast[data-on] { opacity: 1; transform: none; pointer-events: auto; }
@media (max-width: 560px) {
  .mk-toast { left: 16px; right: 16px; width: auto; top: calc(12px + env(safe-area-inset-top)); bottom: auto; transform: translateY(-16px) scale(.97); }
}

/* Order sheet */
.mk-overlay {
  position: fixed; inset: 0; z-index: 10000; display: flex; align-items: flex-end; justify-content: center;
  background: rgba(0,0,0,0.32); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}
@media (min-width: 641px) { .mk-overlay { align-items: center; padding: 24px; } }
.mk-sheet {
  width: 100%; max-height: 94dvh; display: flex; flex-direction: column; overflow: hidden;
  background: ${WHITE}; border-radius: 28px 28px 0 0; box-shadow: 0 -12px 60px rgba(0,0,0,0.2);
}
@media (min-width: 641px) { .mk-sheet { max-width: 500px; border-radius: 28px; max-height: 92vh; box-shadow: 0 40px 100px rgba(0,0,0,0.28); } }
.mk-grabber { width: 38px; height: 5px; border-radius: 3px; background: rgba(0,0,0,0.14); margin: 10px auto 6px; flex-shrink: 0; }
@media (min-width: 641px) { .mk-grabber { visibility: hidden; height: 4px; } }
.mk-sheet-body { overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding: 18px 22px calc(24px + env(safe-area-inset-bottom)); }
.mk-close { width: 34px; height: 34px; border-radius: 50%; border: none; background: ${BG}; color: ${INK}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 330px) { .mk-grid { grid-template-columns: 1fr; } }
@media (max-width: 400px) { .mk-gift-icon { display: none !important; } }
.mk-input {
  width: 100%; padding: 14px 15px; font-size: 16px; font-family: inherit; color: ${INK};
  background: ${PAGE}; border: 1px solid rgba(0,0,0,0.12); border-radius: 14px; outline: none; -webkit-appearance: none;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.mk-input::placeholder { color: #AEAEB2; }
.mk-input:focus { border-color: ${TEAL}; background: ${WHITE}; box-shadow: 0 0 0 4px rgba(0,131,143,0.12); }
.mk-input[data-error] { border-color: #FF3B30; }
.mk-gift {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px; cursor: pointer; font-family: inherit;
  background: ${WHITE}; border: 1.5px dashed rgba(0,131,143,0.45); border-radius: 18px; transition: all .2s;
}
.mk-gift[data-on] { background: ${TEAL_T}; border-style: solid; border-color: ${TEAL}; }
.mk-check { width: 22px; height: 22px; border-radius: 7px; border: 1.5px solid #C7C7CC; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; }
.mk-check[data-on] { background: ${TEAL}; border-color: ${TEAL}; }
.mk-spin { animation: mk-spin .85s linear infinite; }
@keyframes mk-spin { to { transform: rotate(360deg); } }
@media (max-width: 420px) { .mk-point { font-size: 12px; padding: 12px 10px; } .mk-points { gap: 8px; } }
`;
