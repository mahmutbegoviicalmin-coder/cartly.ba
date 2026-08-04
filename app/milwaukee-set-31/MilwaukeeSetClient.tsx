"use client";

import { useState, useEffect, useRef, FormEvent, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ShoppingBag, Check, Shield, Truck, Lock, X,
  ChevronRight, AlertCircle, Battery, Zap, Briefcase,
  Disc3, Hammer, Wrench, PlugZap, Package, Clock, Gift, Percent,
} from "lucide-react";
import { event } from "@/lib/fbpixel";

const PRICE = 149;
const OLD_PRICE = 220;
const DELIVERY = 10;
const PRODUCT_NAME = "Milwaukee Set 3.1";
const CONTENT_ID = "milwaukee-set-31";
const STOCK_CAP = 10; // never show more than 10 on a single visit

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPromoDeadline(): number {
  try {
    const key = "ms3_promo_deadline";
    const existing = sessionStorage.getItem(key);
    if (existing) {
      const t = Number(existing);
      if (t > Date.now()) return t;
    }
    const deadline = Date.now() + 24 * 60 * 60 * 1000;
    sessionStorage.setItem(key, String(deadline));
    return deadline;
  } catch {
    return Date.now() + 24 * 60 * 60 * 1000;
  }
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const C = {
  red: "#E10600",
  black: "#0A0A0A",
  white: "#FFFFFF",
  soft: "#F5F5F5",
  muted: "#737373",
  border: "#E8E8E8",
  green: "#16A34A",
};

const FONT = "var(--font-manrope), 'Sora', system-ui, sans-serif";

const HERO_CHIPS = [
  "Bušilica / odvijač",
  "Udarni odvijač 226 Nm",
  "Brusilica",
  "2× baterija 5.0 Ah",
];

const KIT_ITEMS = [
  {
    Icon: Hammer,
    title: "Bušilica / odvijač",
    desc: "Bežična bušilica s podesivim momentom i LED svjetlom.",
  },
  {
    Icon: Zap,
    title: "Udarni odvijač 226 Nm",
    desc: "Do 226 Nm momenta. Do 3900 o/min i 4400 udaraca/min.",
  },
  {
    Icon: Disc3,
    title: "Brusilica",
    desc: "Za rezanje i brušenje metala, betona i keramike.",
  },
  {
    Icon: Battery,
    title: "2× baterija 5.0 Ah",
    desc: "Milwaukee M18 platforma. Dug radni vijek.",
  },
  {
    Icon: PlugZap,
    title: "Brzi punjač",
    desc: "Punjenje spremno za sljedeći posao.",
  },
  {
    Icon: Wrench,
    title: "Pribor u setu",
    desc: "Bočna ručka, ključ i sve za brzi start.",
  },
];

const CASE_ITEMS = [
  { Icon: Hammer, label: "Bušilica / odvijač" },
  { Icon: Zap, label: "Udarni odvijač 226 Nm" },
  { Icon: Disc3, label: "Brusilica s ručkom" },
  { Icon: Battery, label: "2× baterija 5.0 Ah" },
  { Icon: PlugZap, label: "Brzi punjač" },
  { Icon: Briefcase, label: "Čvrsti Milwaukee kofer" },
];

const TRUST = [
  { Icon: Truck, title: "Dostava +10 KM", desc: "Širom Bosne i Hercegovine" },
  { Icon: Lock, title: "Plaćanje pouzećem", desc: "Plaćate kuriru pri preuzimanju" },
  { Icon: Shield, title: "Povrat 14 dana", desc: "Bez rizika ako niste zadovoljni" },
  { Icon: Zap, title: "226 Nm momenta", desc: "Udarni odvijač profesionalne snage" },
];

function fmt(n: number) {
  return n % 1 === 0
    ? `${n},00 KM`
    : n.toFixed(2).replace(".", ",") + " KM";
}

type FormFields = {
  ime: string;
  prezime: string;
  adresa: string;
  grad: string;
  postanski_broj: string;
  telefon: string;
};

const EMPTY: FormFields = {
  ime: "",
  prezime: "",
  adresa: "",
  grad: "",
  postanski_broj: "",
  telefon: "",
};

function SafeImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  style,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
}) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div
        style={{
          ...style,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        <Package size={40} strokeWidth={1.3} />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      style={style}
      onError={() => setOk(false)}
    />
  );
}

export default function MilwaukeeSetClient() {
  const [fields, setFields] = useState<FormFields>(EMPTY);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [floatVisible, setFloatVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stockLeft, setStockLeft] = useState(7);
  const [countdown, setCountdown] = useState("24:00:00");
  const checkoutFired = useRef(false);
  const formRef = useRef<HTMLElement>(null);
  const deadlineRef = useRef(0);

  const productTotal = PRICE * qty;
  const total = productTotal + DELIVERY;
  const stockPct = Math.max(8, Math.min(100, (stockLeft / STOCK_CAP) * 100));

  useEffect(() => {
    setMounted(true);
    setStockLeft(Math.min(STOCK_CAP, randomBetween(4, 10)));
    deadlineRef.current = getPromoDeadline();
    setCountdown(formatCountdown(deadlineRef.current - Date.now()));
    const tick = setInterval(() => {
      const left = deadlineRef.current - Date.now();
      if (left <= 0) {
        deadlineRef.current = getPromoDeadline();
      }
      setCountdown(formatCountdown(deadlineRef.current - Date.now()));
    }, 1000);
    event("ViewContent", {
      content_name: PRODUCT_NAME,
      content_ids: [CONTENT_ID],
      content_type: "product",
      value: PRICE,
      currency: "BAM",
    });
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setFloatVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFloatVisible(false);
        else if (!success) setFloatVisible(true);
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [success]);

  function fireCheckout() {
    if (checkoutFired.current) return;
    checkoutFired.current = true;
    event("InitiateCheckout", {
      content_name: PRODUCT_NAME,
      content_ids: [CONTENT_ID],
      content_type: "product",
      value: total,
      currency: "BAM",
      num_items: qty,
    });
  }

  function openPopup() {
    event("AddToCart", {
      content_name: PRODUCT_NAME,
      content_ids: [CONTENT_ID],
      content_type: "product",
      value: PRICE,
      currency: "BAM",
    });
    fireCheckout();
    setPopupOpen(true);
  }

  function scrollToForm() {
    event("AddToCart", {
      content_name: PRODUCT_NAME,
      content_ids: [CONTENT_ID],
      content_type: "product",
      value: PRICE,
      currency: "BAM",
    });
    fireCheckout();
    document.getElementById("narudzba")?.scrollIntoView({ behavior: "smooth" });
  }

  function update(name: keyof FormFields, value: string) {
    const v =
      name === "postanski_broj" ? value.replace(/\D/g, "").slice(0, 5) : value;
    setFields((p) => ({ ...p, [name]: v }));
    if (error) setError(null);
  }

  function validate(f: FormFields): string | null {
    if (!f.ime.trim() || !f.prezime.trim()) return "Unesite ime i prezime.";
    if (!f.adresa.trim()) return "Unesite adresu.";
    if (!f.grad.trim()) return "Unesite grad.";
    if (!f.postanski_broj.trim() || f.postanski_broj.length < 4)
      return "Unesite poštanski broj.";
    if (!/^[0-9+\s\-()]{6,}$/.test(f.telefon.trim()))
      return "Unesite ispravan broj telefona.";
    return null;
  }

  async function submit(f: FormFields, q: number) {
    const err = validate(f);
    if (err) {
      setError(err);
      return false;
    }
    setLoading(true);
    setError(null);
    fireCheckout();
    try {
      const externalId = (() => {
        try {
          return localStorage.getItem("_crt_eid") || "";
        } catch {
          return "";
        }
      })();
      const res = await fetch("/api/milwaukee-set-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ime: f.ime.trim(),
          prezime: f.prezime.trim(),
          adresa: f.adresa.trim(),
          grad: f.grad.trim(),
          postanski_broj: f.postanski_broj.trim(),
          telefon: f.telefon.trim(),
          kolicina: q,
          externalId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Greška pri slanju.");
      event(
        "Purchase",
        {
          content_name: PRODUCT_NAME,
          content_ids: [CONTENT_ID],
          content_type: "product",
          value: PRICE * q + DELIVERY,
          currency: "BAM",
          num_items: q,
        },
        data.orderNumber
      );
      setSuccess(true);
      setPopupOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Greška. Pokušajte ponovo.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await submit(fields, qty);
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: FONT }}>
        <div style={{ background: C.white, borderRadius: 24, padding: "48px 36px", maxWidth: 440, width: "100%", textAlign: "center", border: `1px solid ${C.border}` }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Check size={28} color="#fff" strokeWidth={3} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Vaša narudžba je uspješno zaprimljena.
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
            Hvala, {fields.ime}. Narudžba je zaprimljena i trenutno se pakuje.
            Poslat ćemo je sutra, a na vašu adresu stiže u roku od 24 do 48 sati.
          </p>
          <a href="/" style={{ display: "inline-block", background: C.black, color: C.white, padding: "14px 28px", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Nazad na početnu
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.white, color: C.black, fontFamily: FONT, overflowX: "hidden" }}>
      <style suppressHydrationWarning>{`
        .ms3-inp {
          width: 100%; box-sizing: border-box;
          background: #fff; border: 1.5px solid ${C.border};
          border-radius: 12px; padding: 14px 16px;
          font-size: 15px; font-family: ${FONT}; color: ${C.black};
          outline: none; transition: border-color 150ms, box-shadow 150ms;
        }
        .ms3-inp:focus { border-color: ${C.black}; box-shadow: 0 0 0 3px rgba(10,10,10,0.06); }
        .ms3-btn { transition: transform 160ms, filter 160ms; }
        .ms3-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .ms3-btn:active { transform: scale(0.98); }
        .ms3-float {
          position: fixed;
          right: 20px;
          bottom: calc(20px + env(safe-area-inset-bottom));
          z-index: 90;
        }
        @media (max-width: 900px) {
          .ms3-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .ms3-hero-visual { order: -1; max-width: 440px; margin: 0 auto; width: 100%; }
          .ms3-kit-grid { grid-template-columns: 1fr 1fr !important; }
          .ms3-form-grid { grid-template-columns: 1fr !important; }
          .ms3-trust-grid { grid-template-columns: 1fr 1fr !important; }
          .ms3-kofer-grid { grid-template-columns: 1fr !important; }
          .ms3-float { right: 16px; left: auto; bottom: calc(16px + env(safe-area-inset-bottom)); }
        }
        @media (max-width: 560px) {
          .ms3-kit-grid { grid-template-columns: 1fr !important; }
          .ms3-name-grid { grid-template-columns: 1fr !important; }
          .ms3-case-list { grid-template-columns: 1fr !important; }
          .ms3-promo-chips { grid-template-columns: 1fr !important; }
        }
        @keyframes ms3-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .ms3-dot { animation: ms3-pulse 1.8s ease-in-out infinite; }
        @keyframes ms3-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ms3-popup-shell { animation: ms3-up 0.28s cubic-bezier(0.22,1,0.36,1); }
        @keyframes ms3-fab-in {
          from { opacity: 0; transform: translateY(12px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ms3-fab { animation: ms3-fab-in 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none", color: C.black, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>
            cartly<span style={{ color: C.red }}>.</span>
          </a>
          <button type="button" onClick={openPopup} className="ms3-btn" style={{ background: C.black, color: C.white, border: "none", borderRadius: 999, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>
            Naruči · {fmt(PRICE)}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: C.black, color: C.white }}>
        <div
          className="ms3-hero-grid"
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            padding: "clamp(32px, 6vw, 64px) 20px clamp(48px, 8vw, 80px)",
            display: "grid",
            gridTemplateColumns: "1fr 1.05fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "6px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
                Milwaukee Set 3.1
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(225,6,0,0.15)", border: "1px solid rgba(225,6,0,0.35)", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#ffb4b0" }}>
                <span className="ms3-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: C.red }} />
                Još {stockLeft} na stanju
              </span>
            </div>

            <div style={{ marginBottom: 22, maxWidth: 360 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: stockLeft <= 5 ? "#ff8a84" : "rgba(255,255,255,0.45)" }}>
                  {stockLeft <= 5 ? "Kritično malo!" : "Ograničeno stanje"}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#ffb4b0" }}>
                  {stockLeft}/{STOCK_CAP} komada
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${stockPct}%`,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${C.red}, #ff4d47)`,
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
            </div>

            <h1 style={{ fontSize: "clamp(34px, 5.2vw, 54px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 16 }}>
              Kompletan set.
              <br />
              Spreman za rad.
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.55)", maxWidth: 420, marginBottom: 24 }}>
              Bušilica, udarni odvijač od 226 Nm, brusilica, dvije baterije 5.0 Ah,
              punjač i originalni Milwaukee kofer.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {HERO_CHIPS.map((label) => (
                <span key={label} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.82)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "8px 12px" }}>
                  {label}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 600 }}>Akcijska cijena</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>{fmt(PRICE)}</span>
                  <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>{fmt(OLD_PRICE)}</span>
                </div>
              </div>
              <span style={{ background: C.red, color: C.white, fontSize: 12, fontWeight: 800, padding: "6px 10px", borderRadius: 8, marginBottom: 6 }}>
                Ušteda {fmt(OLD_PRICE - PRICE)}
              </span>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button type="button" onClick={openPopup} className="ms3-btn" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.white, color: C.black, border: "none", borderRadius: 14, padding: "16px 26px", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: FONT }}>
                <ShoppingBag size={18} strokeWidth={2.2} />
                Naruči odmah
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
              <button type="button" onClick={scrollToForm} style={{ background: "transparent", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "15px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>
                Vidi formu
              </button>
            </div>
            <p style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Dostava +{fmt(DELIVERY)} širom BiH · Ukupno {fmt(PRICE + DELIVERY)}
            </p>
          </div>

          <div className="ms3-hero-visual" style={{ position: "relative" }}>
            <div style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 20, overflow: "hidden", background: "#fff" }}>
              <SafeImage
                src="/milwaukee-set-31/hero.png"
                alt="Milwaukee Set 3.1"
                fill
                priority
                sizes="(max-width: 900px) 90vw, 540px"
                style={{ objectFit: "contain", objectPosition: "center", padding: 12 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "28px 20px" }}>
        <div className="ms3-trust-grid" style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {TRUST.map(({ Icon, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: C.soft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={C.black} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Šta dolazi u setu */}
      <section style={{ background: C.soft, padding: "clamp(48px, 8vw, 80px) 20px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.red, marginBottom: 10 }}>Komplet</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10 }}>Šta dolazi u setu</h2>
          <p style={{ fontSize: 15, color: C.muted, maxWidth: 480, marginBottom: 36, lineHeight: 1.6 }}>
            Profesionalni alati. Udarni odvijač do 226 Nm. Baterije 5.0 Ah.
          </p>

          <div className="ms3-kit-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {KIT_ITEMS.map(({ Icon, title, desc }, i) => (
              <div key={title} style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "22px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.black, color: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#BBB" }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Šta dolazi u koferu */}
      <section style={{ background: C.white, padding: "clamp(48px, 8vw, 80px) 20px" }}>
        <div className="ms3-kofer-grid" style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center" }}>
          <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: 24, overflow: "hidden", background: C.soft, border: `1px solid ${C.border}` }}>
            <SafeImage
              src="/milwaukee-set-31/kofer.png"
              alt="Milwaukee Set 3.1 u koferu"
              fill
              sizes="(max-width: 900px) 100vw, 600px"
              style={{ objectFit: "cover" }}
            />
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.red, marginBottom: 10 }}>Pakovanje</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 14 }}>
              Šta dolazi u koferu
            </h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.65, marginBottom: 28 }}>
              Sve uredno posloženo u čvrstom Milwaukee koferu. Otvaraš i radiš.
            </p>

            <div className="ms3-case-list" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {CASE_ITEMS.map(({ Icon, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: C.soft,
                    borderRadius: 14,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: C.black, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} strokeWidth={2.2} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Order */}
      <section id="narudzba" ref={formRef} style={{ background: C.soft, padding: "clamp(48px, 8vw, 80px) 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.red, marginBottom: 10 }}>Narudžba</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20 }}>Popuni podatke</h2>

          {/* Promo banner */}
          <div
            style={{
              background: C.black,
              color: C.white,
              borderRadius: 18,
              padding: "16px 18px",
              marginBottom: 24,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(225,6,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Clock size={18} color="#ffb4b0" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Akcija ističe za 24 sata</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                  Preostalo: <span style={{ color: "#ffb4b0", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{countdown}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 700 }}>
                <Percent size={13} /> Ušteda {fmt(OLD_PRICE - PRICE)}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(225,6,0,0.2)", borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 700, color: "#ffb4b0" }}>
                <Gift size={13} /> Set samo {fmt(PRICE)}
              </span>
            </div>
          </div>

          <div className="ms3-form-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "start" }}>
            <form onSubmit={onSubmit} onFocus={fireCheckout} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 24, padding: "clamp(20px, 4vw, 32px)" }}>
              {/* Promo chips inside form */}
              <div className="ms3-promo-chips" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                <div style={{ background: "rgba(225,6,0,0.06)", border: "1px solid rgba(225,6,0,0.15)", borderRadius: 14, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Promo</div>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.35 }}>Cijena seta {fmt(PRICE)} umjesto {fmt(OLD_PRICE)}</div>
                </div>
                <div style={{ background: C.soft, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Ističe</div>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.35 }}>Za 24 sata · {countdown}</div>
                </div>
              </div>

              <div className="ms3-name-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <Field label="Ime *">
                  <input className="ms3-inp" autoComplete="given-name" placeholder="npr. Emir" value={fields.ime} onChange={(e) => update("ime", e.target.value)} />
                </Field>
                <Field label="Prezime *">
                  <input className="ms3-inp" autoComplete="family-name" placeholder="npr. Hadžić" value={fields.prezime} onChange={(e) => update("prezime", e.target.value)} />
                </Field>
              </div>
              <div style={{ marginBottom: 14 }}>
                <Field label="Adresa *">
                  <input className="ms3-inp" autoComplete="street-address" placeholder="npr. Titova 12" value={fields.adresa} onChange={(e) => update("adresa", e.target.value)} />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 14, marginBottom: 14 }}>
                <Field label="Grad *">
                  <input className="ms3-inp" autoComplete="address-level2" placeholder="npr. Sarajevo" value={fields.grad} onChange={(e) => update("grad", e.target.value)} />
                </Field>
                <Field label="PTT *">
                  <input className="ms3-inp" autoComplete="postal-code" inputMode="numeric" placeholder="71000" value={fields.postanski_broj} onChange={(e) => update("postanski_broj", e.target.value)} />
                </Field>
              </div>
              <div style={{ marginBottom: 14 }}>
                <Field label="Broj telefona *">
                  <input className="ms3-inp" type="tel" autoComplete="tel" placeholder="npr. 061 123 456" value={fields.telefon} onChange={(e) => update("telefon", e.target.value)} />
                </Field>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.soft, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Količina</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Broj setova</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                  <button type="button" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 42, height: 42, border: "none", background: "transparent", fontSize: 18, fontWeight: 700, cursor: qty <= 1 ? "not-allowed" : "pointer", opacity: qty <= 1 ? 0.35 : 1, fontFamily: FONT }}>−</button>
                  <span style={{ minWidth: 36, textAlign: "center", fontWeight: 800, fontSize: 16 }}>{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} style={{ width: 42, height: 42, border: "none", background: "transparent", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>+</button>
                </div>
              </div>

              {/* Stock bar in form */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>Još {stockLeft} na stanju</span>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Ne čekaj — brzo nestaje</span>
                </div>
                <div style={{ height: 7, borderRadius: 999, background: "#EDEDED", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${stockPct}%`, borderRadius: 999, background: C.red, transition: "width 0.8s ease" }} />
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(225,6,0,0.06)", border: "1px solid rgba(225,6,0,0.18)", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
                  <AlertCircle size={16} color={C.red} />
                  <span style={{ fontSize: 13, color: C.red, fontWeight: 500 }}>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="ms3-btn" style={{ width: "100%", background: loading ? "#444" : C.black, color: C.white, border: "none", borderRadius: 14, padding: "17px", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT }}>
                {loading ? "Slanje..." : `Potvrdi narudžbu · ${fmt(total)}`}
              </button>
            </form>

            <OrderSummary qty={qty} productTotal={productTotal} total={total} stockLeft={stockLeft} stockPct={stockPct} countdown={countdown} />
          </div>
        </div>
      </section>

      <footer style={{ background: C.black, padding: "32px 20px", textAlign: "center" }}>
        <span style={{ color: C.white, fontWeight: 800, fontSize: 16 }}>cartly<span style={{ color: C.red }}>.</span>ba</span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
          © 2026 · Milwaukee Set 3.1 · Dostava +{fmt(DELIVERY)} širom BiH
        </p>
      </footer>

      {/* Floating CTA — bottom right */}
      {floatVisible && !popupOpen && (
        <div className="ms3-float">
          <button
            type="button"
            onClick={openPopup}
            className="ms3-btn ms3-fab"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: C.red,
              color: C.white,
              border: "none",
              borderRadius: 999,
              padding: "14px 20px 14px 16px",
              boxShadow: "0 12px 36px rgba(225,6,0,0.4)",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={18} />
            </span>
            <span style={{ textAlign: "left" }}>
              <span style={{ display: "block", fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Naruči</span>
              <span style={{ display: "block", fontSize: 12, opacity: 0.85, marginTop: 2 }}>{fmt(PRICE)}</span>
            </span>
          </button>
        </div>
      )}

      {mounted &&
        popupOpen &&
        createPortal(
          <OrderPopup
            fields={fields}
            qty={qty}
            loading={loading}
            error={error}
            productTotal={productTotal}
            total={total}
            onClose={() => setPopupOpen(false)}
            onChange={update}
            onQty={setQty}
            onSubmit={async () => {
              await submit(fields, qty);
            }}
          />,
          document.body
        )}
    </div>
  );
}

function OrderSummary({
  qty,
  productTotal,
  total,
  stockLeft,
  stockPct,
  countdown,
}: {
  qty: number;
  productTotal: number;
  total: number;
  stockLeft: number;
  stockPct: number;
  countdown: string;
}) {
  return (
    <div style={{ background: C.black, color: C.white, borderRadius: 24, overflow: "hidden", position: "sticky", top: 80 }}>
      <div style={{ padding: "28px 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Sažetak narudžbe</p>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{PRODUCT_NAME}</h3>
          </div>
          <span style={{ background: C.red, color: C.white, fontSize: 11, fontWeight: 800, padding: "5px 9px", borderRadius: 6 }}>AKCIJA</span>
        </div>

        <div style={{ background: "rgba(225,6,0,0.15)", border: "1px solid rgba(225,6,0,0.3)", borderRadius: 12, padding: "10px 12px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} color="#ffb4b0" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#ffb4b0" }}>
            Ističe za 24 sata · {countdown}
          </span>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <div style={{ position: "relative", width: 72, height: 72, borderRadius: 14, overflow: "hidden", background: "#fff", flexShrink: 0 }}>
            <SafeImage src="/milwaukee-set-31/hero.png" alt="" fill sizes="72px" style={{ objectFit: "contain", padding: 4 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{qty} × set</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>{fmt(PRICE)}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>{fmt(OLD_PRICE)}</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Na stanju</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#ffb4b0" }}>{stockLeft}/{STOCK_CAP}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stockPct}%`, borderRadius: 999, background: C.red, transition: "width 0.8s ease" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SummaryRow label={`${qty} × set`} value={fmt(productTotal)} />
          <SummaryRow
            label={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Truck size={13} /> Dostava širom BiH</span>}
            value={`+ ${fmt(DELIVERY)}`}
          />
          <SummaryRow label="Ušteda" value={fmt((OLD_PRICE - PRICE) * qty)} />
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.04)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Ukupno</span>
        <span style={{ fontWeight: 900, fontSize: 32, letterSpacing: "-0.04em" }}>{fmt(total)}</span>
      </div>

      <div style={{ background: C.white, color: C.black, padding: "14px 20px", display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, fontWeight: 600 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Truck size={14} /> Dostava +{fmt(DELIVERY)}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Lock size={14} /> Pouzećem</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
      <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#888", marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function OrderPopup({
  fields,
  qty,
  loading,
  error,
  productTotal,
  total,
  onClose,
  onChange,
  onQty,
  onSubmit,
}: {
  fields: FormFields;
  qty: number;
  loading: boolean;
  error: string | null;
  productTotal: number;
  total: number;
  onClose: () => void;
  onChange: (k: keyof FormFields, v: string) => void;
  onQty: (n: number | ((q: number) => number)) => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="ms3-popup-shell"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          width: "100%",
          maxWidth: 480,
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 24px",
          fontFamily: FONT,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: "0.1em", textTransform: "uppercase" }}>Brza narudžba</p>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4 }}>{PRODUCT_NAME}</h3>
          </div>
          <button type="button" onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: C.soft, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ background: C.black, color: C.white, borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{qty} × set</span>
            <span style={{ fontWeight: 700 }}>{fmt(productTotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Truck size={12} /> Dostava širom BiH
            </span>
            <span style={{ fontWeight: 700 }}>+ {fmt(DELIVERY)}</span>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Ukupno</span>
            <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.03em" }}>{fmt(total)}</span>
          </div>
        </div>

        <div style={{ background: "rgba(225,6,0,0.06)", border: "1px solid rgba(225,6,0,0.15)", borderRadius: 12, padding: "10px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} color={C.red} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>
            Akcija ističe za 24 sata · ušteda {fmt(OLD_PRICE - PRICE)}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <Field label="Ime *">
            <input className="ms3-inp" value={fields.ime} placeholder="Ime" onChange={(e) => onChange("ime", e.target.value)} />
          </Field>
          <Field label="Prezime *">
            <input className="ms3-inp" value={fields.prezime} placeholder="Prezime" onChange={(e) => onChange("prezime", e.target.value)} />
          </Field>
        </div>
        <div style={{ marginBottom: 10 }}>
          <Field label="Adresa *">
            <input className="ms3-inp" value={fields.adresa} placeholder="Adresa" onChange={(e) => onChange("adresa", e.target.value)} />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10, marginBottom: 10 }}>
          <Field label="Grad *">
            <input className="ms3-inp" value={fields.grad} placeholder="Grad" onChange={(e) => onChange("grad", e.target.value)} />
          </Field>
          <Field label="PTT *">
            <input className="ms3-inp" value={fields.postanski_broj} placeholder="71000" inputMode="numeric" onChange={(e) => onChange("postanski_broj", e.target.value)} />
          </Field>
        </div>
        <div style={{ marginBottom: 10 }}>
          <Field label="Telefon *">
            <input className="ms3-inp" type="tel" value={fields.telefon} placeholder="061 123 456" onChange={(e) => onChange("telefon", e.target.value)} />
          </Field>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.soft, borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Količina</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={() => onQty((q) => Math.max(1, q - 1))} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontWeight: 700, cursor: "pointer" }}>−</button>
            <span style={{ fontWeight: 800, minWidth: 20, textAlign: "center" }}>{qty}</span>
            <button type="button" onClick={() => onQty((q) => Math.min(10, q + 1))} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontWeight: 700, cursor: "pointer" }}>+</button>
          </div>
        </div>

        {error && <p style={{ fontSize: 13, color: C.red, marginBottom: 12, fontWeight: 500 }}>{error}</p>}

        <button type="button" disabled={loading} onClick={onSubmit} className="ms3-btn" style={{ width: "100%", background: C.black, color: C.white, border: "none", borderRadius: 14, padding: "16px", fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT }}>
          {loading ? "Slanje..." : `Pošalji · ${fmt(total)}`}
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: "#AAA", marginTop: 12 }}>
          Set {fmt(PRICE)} + dostava {fmt(DELIVERY)} = {fmt(PRICE + DELIVERY)}
        </p>
      </div>
    </div>
  );
}
