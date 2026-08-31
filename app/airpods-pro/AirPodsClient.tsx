"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { event } from "@/lib/fbpixel";
import ProductPageHeader from "@/components/ProductPageHeader";
import OrderForm from "./OrderForm";
import OrderPopup from "./OrderPopup";
import FloatingCTA from "./FloatingCTA";
import HeroGallery from "./HeroGallery";
import {
  AncIcon, TransparencyIcon, AdaptiveIcon, SpatialIcon, ChipIcon,
  BatteryIcon, MagSafeIcon, WaterIcon, ConversationIcon, TouchIcon,
  UsbCIcon, FindMyIcon, MicIcon, CaseIcon, TruckIcon, ShieldIcon,
  CashIcon, CheckIcon,
} from "./icons";
import { INK, MUTED, BG, WHITE, LINE, F } from "./theme";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FEATURES = [
  { Icon: AncIcon, title: "Aktivno poništavanje buke", desc: "H2 čip blokira okolinu da ostane samo zvuk koji želiš da čuješ." },
  { Icon: AdaptiveIcon, title: "Adaptive Audio", desc: "Automatski miješa ANC i Transparency prema tome gdje se nalaziš." },
  { Icon: TransparencyIcon, title: "Transparency", desc: "Čuješ svijet oko sebe, bez da skidaš slušalice." },
  { Icon: SpatialIcon, title: "Prostorni zvuk", desc: "Kino u tvojim ušima. Zvuk se pomjera s tvojom glavom." },
  { Icon: ConversationIcon, title: "Conversation Awareness", desc: "Čim progovoriš, glasnoća se spušta da razgovor bude prirodan." },
  { Icon: MicIcon, title: "Kristalan glas", desc: "Beamforming mikrofoni izdvajaju tvoj glas i smanjuju buku oko tebe." },
];

const SPECS = [
  { Icon: ChipIcon, label: "H2 čip", value: "Računalni audio" },
  { Icon: BatteryIcon, label: "Do 6 sati", value: "Slušanje s ANC" },
  { Icon: CaseIcon, label: "Do 30 sati", value: "S kućištem" },
  { Icon: MagSafeIcon, label: "MagSafe", value: "Bežično punjenje" },
  { Icon: UsbCIcon, label: "USB-C", value: "Brzo punjenje" },
  { Icon: WaterIcon, label: "IP54", value: "Znoj i voda" },
  { Icon: TouchIcon, label: "Touch", value: "Kontrola na stablu" },
  { Icon: FindMyIcon, label: "Find My", value: "Pronađi kućište" },
];

const BOX = [
  "AirPods Pro slušalice",
  "MagSafe kućište za punjenje (USB-C)",
  "Silikonski vrhovi (S, M, L)",
  "USB-C kabel",
  "Dokumentacija",
];

const REVIEWS = [
  { name: "Amira K.", city: "Sarajevo", text: "Zvuk je čist, ANC stvarno radi. Koristim ih u tramvaju i više ne čujem ništa osim muzike." },
  { name: "Edin M.", city: "Mostar", text: "Sjedi savršeno u uhu. Cijeli dan na poslu, bez bola. Kućište je kompaktno i lako se puni." },
  { name: "Lamija S.", city: "Tuzla", text: "Transparency mode mi je game changer. Čujem dijete u drugoj sobi, a muzika i dalje svira." },
  { name: "Tarik L.", city: "Banja Luka", text: "Očekivao sam kompromis zbog cijene. Nema ga. Bass ostaje dubok, glasovi čisti, baterija traje." },
];

const FAQ = [
  { q: "Radi li sa Androidom?", a: "Da. Povezuju se preko Bluetootha sa iPhone, Android, laptopom i tabletom." },
  { q: "Kako plaćam?", a: "Plaćanje je pouzećem kad ti paket stigne. Ne tražimo predujam." },
  { q: "Koliko traje dostava?", a: "Dostava je 1 do 3 radna dana na adresu, po cijeloj BiH. Košta 10 KM." },
  { q: "Šta je u kutiji?", a: "Slušalice, MagSafe kućište, tri veličine silikonskih vrhova, USB-C kabel i dokumentacija." },
  { q: "Mogu li vratiti?", a: "Da. Imaš 14 dana za povrat ako nisi zadovoljan." },
];

const NOTIFS = [
  { name: "Amira K.", city: "Sarajevo" },
  { name: "Edin M.", city: "Mostar" },
  { name: "Selma H.", city: "Tuzla" },
  { name: "Tarik L.", city: "Banja Luka" },
  { name: "Lamija S.", city: "Zenica" },
  { name: "Mirza O.", city: "Bihać" },
];

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

function PurchaseToast() {
  const [shown, setShown] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let i = 0;
    const show = () => {
      setIdx(i % NOTIFS.length);
      i += 1;
      setShown(true);
      setTimeout(() => setShown(false), 4600);
    };
    const t1 = setTimeout(show, 9000);
    const t2 = setInterval(show, 28000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  const p = NOTIFS[idx];

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ x: "-110%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-110%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          style={{
            position: "fixed", bottom: 96, left: 16, zIndex: 200,
            background: WHITE, borderRadius: 18, padding: "12px 14px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
            display: "flex", alignItems: "center", gap: 12, maxWidth: 280,
            width: "calc(100vw - 32px)", fontFamily: F,
            border: `1px solid ${LINE}`,
          }}
        >
          <img src="/airpods-pro/hero.png" alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "contain", background: BG }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: INK, fontWeight: 500, marginBottom: 2 }}>Upravo naručeno</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: INK }}>{p.name}</div>
            <div style={{ fontSize: 11, color: MUTED }}>{p.city} · upravo sada</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AirPodsClient() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mode, setMode] = useState<"anc" | "trans">("anc");
  const [stock, setStock] = useState<number | null>(null);

  useEffect(() => {
    setStock(Math.floor(Math.random() * 19) + 9);
  }, []);

  function openPopup() {
    event("AddToCart", {
      content_name:     "AirPods Pro",
      content_category: "Audio",
      content_ids:      ["airpods-pro"],
      content_type:     "product",
      value:            49.9,
      currency:         "BAM",
    });
    setPopupOpen(true);
  }

  const inner = { maxWidth: 1160, margin: "0 auto", padding: "0 24px" } as const;
  const fade  = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6, ease: EASE } };

  return (
    <>
      <ProductPageHeader ctaColor={INK} onOrder={openPopup} />
      <style suppressHydrationWarning>{`
        .ap-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 56px;
          align-items: center;
          padding: 48px 0 64px;
          min-height: calc(100dvh - 68px);
        }
        .ap-hero-copy { max-width: 520px; }
        .ap-bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .ap-spec { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .ap-order { display: grid; grid-template-columns: 0.92fr 1.08fr; gap: 48px; align-items: start; }
        .ap-rev { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .ap-split { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .ap-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ap-submit:hover { filter: brightness(1.12); }
        .ap-submit:active { transform: scale(0.99); }
        @keyframes ap-spin { to { transform: rotate(360deg); } }
        .ap-spin { animation: ap-spin 0.85s linear infinite; }
        @media (max-width: 980px) {
          .ap-hero {
            grid-template-columns: 1fr;
            gap: 28px;
            min-height: auto;
            padding: 24px 0 40px;
          }
          .ap-hero-visual { order: -1; max-width: 520px; margin: 0 auto; width: 100%; }
          .ap-hero-copy { max-width: none; }
          .ap-bento { grid-template-columns: 1fr 1fr; }
          .ap-spec { grid-template-columns: 1fr 1fr; }
          .ap-order, .ap-split, .ap-rev { grid-template-columns: 1fr; gap: 28px; }
        }
        @media (max-width: 560px) {
          .ap-inner { padding: 0 16px !important; }
          .ap-bento { grid-template-columns: 1fr; }
          .ap-form-grid { grid-template-columns: 1fr; }
          .ap-hero { padding: 16px 0 32px; gap: 20px; }
        }
      `}</style>

      {/* HERO */}
      <section style={{ background: WHITE }}>
        <div className="ap-inner" style={inner}>
          <div className="ap-hero">
            <motion.div
              className="ap-hero-copy"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p style={{
                margin: "0 0 16px", fontFamily: F, fontSize: 12, fontWeight: 500,
                letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED,
              }}>
                Adaptive Audio
              </p>
              <h1 style={{
                fontFamily: F, fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 200,
                letterSpacing: "-0.05em", lineHeight: 0.95, color: INK, margin: "0 0 14px",
              }}>
                AirPods Pro
              </h1>
              <p style={{
                fontFamily: F, fontSize: "clamp(18px, 2.4vw, 24px)", fontWeight: 300,
                letterSpacing: "-0.025em", color: MUTED, margin: "0 0 28px", lineHeight: 1.35,
              }}>
                Zvuk koji se prilagođava tebi.
              </p>

              <ul style={{ listStyle: "none", margin: "0 0 28px", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Aktivno poništavanje buke",
                  "MagSafe kućište, USB-C",
                  "Plaćanje pouzećem",
                ].map((t) => (
                  <li key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: F, fontSize: 15, fontWeight: 400, color: INK }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%", background: BG,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <CheckIcon size={11} color={INK} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>

              <div style={{ marginBottom: 10 }}>
                <div style={{
                  fontFamily: F, fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 400,
                  letterSpacing: "-0.055em", color: INK, lineHeight: 0.95,
                }}>
                  49,90 KM
                </div>
              </div>
              {stock !== null && (
                <p style={{
                  margin: "0 0 22px", fontFamily: F, fontSize: 13, fontWeight: 400, color: MUTED,
                  letterSpacing: "-0.01em",
                }}>
                  Totalna rasprodaja · Ostalo {stock} komada
                </p>
              )}

              <button
                onClick={openPopup}
                style={{
                  background: INK, color: WHITE, border: "none", borderRadius: 980,
                  padding: "16px 32px", fontSize: 17, fontWeight: 500, fontFamily: F,
                  cursor: "pointer",
                }}
              >
                Naruči odmah
              </button>
            </motion.div>

            <motion.div
              className="ap-hero-visual"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
            >
              <HeroGallery />
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div style={{ background: BG, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div className="ap-inner" style={{ ...inner, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", padding: "16px 24px" }}>
          {[
            { Icon: CashIcon, t: "Plaćanje pouzećem" },
            { Icon: TruckIcon, t: "Dostava 1 do 3 dana" },
            { Icon: ShieldIcon, t: "Povrat 14 dana" },
          ].map(({ Icon, t }) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, color: INK, fontFamily: F, fontSize: 13, fontWeight: 400 }}>
              <Icon size={16} color={INK} />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* SPATIAL */}
      <section style={{ background: WHITE, padding: "88px 0", textAlign: "center" }}>
        <div className="ap-inner" style={inner}>
          <motion.div {...fade}>
            <p style={{ margin: 0, fontFamily: F, fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED }}>
              Prostorni zvuk
            </p>
            <h2 style={{
              fontFamily: F, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 200,
              letterSpacing: "-0.045em", color: INK, margin: "12px 0 10px", lineHeight: 1.08,
            }}>
              Kino. U tvojim ušima.
            </h2>
            <p style={{ margin: 0, fontFamily: F, fontSize: 18, fontWeight: 300, color: MUTED, letterSpacing: "-0.02em" }}>
              Zvuk se pomjera s tobom. Bass ostaje taman. Glas ostaje čist.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: BG, padding: "88px 0" }}>
        <div className="ap-inner" style={inner}>
          <motion.div {...fade} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: F, fontSize: "clamp(32px, 4.4vw, 48px)", fontWeight: 200, letterSpacing: "-0.045em", color: INK, margin: "0 0 10px", lineHeight: 1.08 }}>
              Pro. U svakom detalju.
            </h2>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 300, color: MUTED, fontFamily: F }}>
              Inteligencija koja sluša okolo, pa onda tebe.
            </p>
          </motion.div>
          <div className="ap-bento">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, ease: EASE, delay: i * 0.04 }}
                style={{ background: WHITE, borderRadius: 24, padding: "28px 24px" }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: BG,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: INK,
                }}>
                  <f.Icon size={22} color={INK} />
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 500, color: INK, fontFamily: F, letterSpacing: "-0.03em" }}>
                  {f.title}
                </h3>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 400, color: MUTED, lineHeight: 1.6, fontFamily: F }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ANC */}
      <section style={{ background: WHITE, padding: "88px 0" }}>
        <div className="ap-inner" style={inner}>
          <motion.div {...fade} style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontFamily: F, fontSize: "clamp(32px, 4.2vw, 48px)", fontWeight: 200, letterSpacing: "-0.045em", color: INK, margin: "0 0 10px" }}>
              Svijet. Ili tišina.
            </h2>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 300, color: MUTED, fontFamily: F }}>
              Jedan dodir. Dva načina slušanja.
            </p>
          </motion.div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
            <div style={{ background: BG, borderRadius: 980, padding: 4, display: "inline-flex" }}>
              {([
                { id: "anc" as const, label: "Poništavanje buke" },
                { id: "trans" as const, label: "Transparency" },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  style={{
                    border: "none", cursor: "pointer", borderRadius: 980,
                    padding: "10px 18px", fontFamily: F, fontSize: 14, fontWeight: 500,
                    background: mode === tab.id ? INK : "transparent",
                    color: mode === tab.id ? WHITE : MUTED,
                    transition: "all 0.2s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ap-split">
            <div style={{ borderRadius: 28, overflow: "hidden", background: BG, border: `1px solid ${LINE}` }}>
              <img
                src={mode === "anc" ? "/airpods-pro/earbuds.png" : "/airpods-pro/case.png"}
                alt={mode === "anc" ? "AirPods Pro slušalice" : "MagSafe kućište"}
                style={{ width: "100%", display: "block" }}
              />
            </div>
            <div>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: BG,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
              }}>
                {mode === "anc" ? <AncIcon size={24} color={INK} /> : <TransparencyIcon size={24} color={INK} />}
              </div>
              <h3 style={{ fontFamily: F, fontSize: 30, fontWeight: 200, letterSpacing: "-0.035em", color: INK, margin: "0 0 12px" }}>
                {mode === "anc" ? "Blokiraj buku." : "Ostani prisutan."}
              </h3>
              <p style={{ fontFamily: F, fontSize: 17, fontWeight: 300, color: MUTED, lineHeight: 1.7, margin: 0, maxWidth: 440 }}>
                {mode === "anc"
                  ? "H2 čip i mikrofoni rade zajedno da uklone motor, kancelariju i grad. Ostaje samo tvoja muzika, podcast ili tišina."
                  : "Transparency propušta glasove i saobraćaj. Idealan za šetnju, ured ili kad treba da čuješ svoje ime."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SPECS */}
      <section style={{ background: BG, padding: "88px 0" }}>
        <div className="ap-inner" style={inner}>
          <motion.div {...fade} style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: F, fontSize: "clamp(32px, 4vw, 46px)", fontWeight: 200, letterSpacing: "-0.045em", color: INK, margin: 0 }}>
              Specifikacije.
            </h2>
          </motion.div>
          <div className="ap-spec">
            {SPECS.map((s) => (
              <div key={s.label} style={{ background: WHITE, borderRadius: 22, padding: "22px 16px", textAlign: "center", fontFamily: F }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <s.Icon size={24} color={INK} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: INK }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 300, color: MUTED, marginTop: 4 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOX */}
      <section style={{ background: WHITE, padding: "88px 0" }}>
        <div className="ap-inner" style={inner}>
          <div className="ap-split">
            <motion.div {...fade}>
              <h2 style={{ fontFamily: F, fontSize: "clamp(32px, 4vw, 46px)", fontWeight: 200, letterSpacing: "-0.045em", color: INK, margin: "0 0 24px", lineHeight: 1.08 }}>
                Šta stiže u kutiji.
              </h2>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {BOX.map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: F, fontSize: 16, fontWeight: 400, color: INK }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%", background: BG,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <CheckIcon size={11} color={INK} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <div style={{ borderRadius: 28, overflow: "hidden", background: BG, border: `1px solid ${LINE}` }}>
              <img src="/airpods-pro/case.png" alt="MagSafe kućište AirPods Pro" style={{ width: "100%", display: "block" }} />
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ background: BG, padding: "88px 0" }}>
        <div className="ap-inner" style={inner}>
          <motion.div {...fade} style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: F, fontSize: "clamp(32px, 4vw, 46px)", fontWeight: 200, letterSpacing: "-0.045em", color: INK, margin: "0 0 8px" }}>
              Ljudi već slušaju.
            </h2>
            <p style={{ margin: 0, color: MUTED, fontFamily: F, fontSize: 16, fontWeight: 300 }}>Verificirane narudžbe iz BiH</p>
          </motion.div>
          <div className="ap-rev">
            {REVIEWS.map((r) => (
              <div key={r.name} style={{ background: WHITE, borderRadius: 22, padding: "24px", fontFamily: F }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={INK}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 400, lineHeight: 1.7, color: INK }}>{r.text}</p>
                <div style={{ fontSize: 14, fontWeight: 500, color: INK }}>{r.name}</div>
                <div style={{ fontSize: 13, fontWeight: 300, color: MUTED, marginTop: 2 }}>{r.city}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER */}
      <section id="naruci" style={{ background: WHITE, padding: "88px 0 104px" }}>
        <div className="ap-inner" style={inner}>
          <div className="ap-order">
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, fontFamily: F, marginBottom: 12 }}>
                Naruči odmah
              </div>
              <h2 style={{ fontFamily: F, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 200, letterSpacing: "-0.045em", color: INK, margin: "0 0 12px", lineHeight: 1.08 }}>
                Tvoje AirPods Pro. Na tvojoj adresi.
              </h2>
              <p style={{ fontFamily: F, fontSize: 16, fontWeight: 300, color: MUTED, lineHeight: 1.65, margin: "0 0 28px" }}>
                Naruči odmah. Plaćaš pouzećem kad paket stigne.
              </p>
              <div style={{
                background: BG, borderRadius: 24, padding: 16,
                display: "flex", alignItems: "center", gap: 16,
                border: `1px solid ${LINE}`,
              }}>
                <img src="/airpods-pro/hero.png" alt="" style={{ width: 84, height: 84, borderRadius: 16, objectFit: "contain", background: WHITE }} />
                <div>
                  <div style={{ fontFamily: F, fontSize: 16, fontWeight: 500, color: INK }}>AirPods Pro</div>
                  <div style={{ fontFamily: F, fontSize: 14, fontWeight: 300, color: MUTED, marginTop: 4 }}>MagSafe · USB-C · ANC</div>
                  <div style={{ fontFamily: F, fontSize: 22, fontWeight: 300, color: INK, marginTop: 8, letterSpacing: "-0.03em" }}>
                    {fmt(49.9)}
                  </div>
                </div>
              </div>
            </div>
            <div style={{
              background: WHITE, border: `1px solid ${LINE}`,
              borderRadius: 28, padding: "28px 24px",
            }}>
              <OrderForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: BG, padding: "72px 0 112px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontFamily: F, fontSize: "clamp(28px, 3.8vw, 42px)", fontWeight: 200, letterSpacing: "-0.045em", color: INK, margin: "0 0 24px" }}>
            Pitanja.
          </h2>
          <div style={{ borderTop: `1px solid ${LINE}` }}>
            {FAQ.map((item, i) => (
              <div key={item.q} style={{ borderBottom: `1px solid ${LINE}` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", background: "none", border: "none", cursor: "pointer",
                    padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 16, textAlign: "left", fontFamily: F, fontSize: 16, fontWeight: 400,
                    color: INK, letterSpacing: "-0.02em",
                  }}
                >
                  {item.q}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8" strokeLinecap="round" style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                      <p style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 300, color: MUTED, lineHeight: 1.75, fontFamily: F }}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PurchaseToast />
      <OrderPopup open={popupOpen} onClose={() => setPopupOpen(false)} />
      <FloatingCTA onOrder={openPopup} />
    </>
  );
}
