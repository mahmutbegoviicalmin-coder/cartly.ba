"use client";

import {
  useState,
  useEffect,
  useRef,
  FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ShoppingBag,
  Check,
  Shield,
  Truck,
  Lock,
  X,
  ChevronRight,
  AlertCircle,
  Battery,
  Zap,
  Briefcase,
  Disc3,
  Hammer,
  PlugZap,
  ShieldCheck,
  Hand,
} from "lucide-react";
import { event } from "@/lib/fbpixel";

const PRICE = 104.9;
const OLD_PRICE = 199.9;
const DELIVERY = 10;
const PRODUCT_NAME = "Set 2 u 1 — Bušilica + Brusilica";
const CONTENT_ID = "set-2u1";
const IMG = "/set2u1/set.png";

const C = {
  red: "#B33000",
  redSoft: "#FFF1EB",
  black: "#222222",
  ink: "#0A0A0A",
  white: "#FFFFFF",
  soft: "#F7F7F7",
  muted: "#717171",
  border: "#EBEBEB",
  green: "#008A05",
};

const FONT = "var(--font-manrope), 'Sora', system-ui, sans-serif";

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

const CASE_ITEMS = [
  { Icon: Hammer, label: "Bušilica / odvijač" },
  { Icon: Disc3, label: "Brusilica" },
  { Icon: ShieldCheck, label: "Zaštita za brusilicu" },
  { Icon: Hand, label: "Držač / ručka za brusilicu" },
  { Icon: Battery, label: "2× baterija" },
  { Icon: PlugZap, label: "Punjač" },
  { Icon: Briefcase, label: "Prenosivi kofer" },
];

const TRUST = [
  { Icon: Truck, title: "Dostava +10 KM", desc: "Širom Bosne i Hercegovine" },
  { Icon: Lock, title: "Plaćanje pouzećem", desc: "Platite kuriru pri preuzimanju" },
  { Icon: Shield, title: "Povrat 14 dana", desc: "Bez rizika ako niste zadovoljni" },
  { Icon: Zap, title: "Spremno za rad", desc: "Raspakuj i kreni odmah" },
];

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

export default function Set2u1Client() {
  const [fields, setFields] = useState<FormFields>(EMPTY);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [floatVisible, setFloatVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stockLeft, setStockLeft] = useState(18);
  const checkoutFired = useRef(false);
  const formRef = useRef<HTMLElement>(null);

  const productTotal = PRICE * qty;
  const total = productTotal + DELIVERY;
  const stockPct = Math.max(12, Math.min(92, (stockLeft / 40) * 100));

  useEffect(() => {
    setMounted(true);
    setStockLeft(randomBetween(8, 29));
    event("ViewContent", {
      content_name: PRODUCT_NAME,
      content_ids: [CONTENT_ID],
      content_type: "product",
      value: PRICE,
      currency: "BAM",
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setFloatVisible(true), 800);
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
      { threshold: 0.2 }
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
      const res = await fetch("/api/set2u1-order", {
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

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit(fields, qty);
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.soft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            background: C.white,
            borderRadius: 28,
            padding: "48px 36px",
            maxWidth: 460,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Check size={28} color="#fff" strokeWidth={3} />
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 12,
              color: C.ink,
            }}
          >
            Vaša narudžba je uspješno zaprimljena.
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
            Hvala, {fields.ime}. Narudžba se pakuje i šalje sutra. Na adresu stiže u roku od 24 do 48 sati.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              background: C.ink,
              color: C.white,
              padding: "14px 28px",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Nazad na početnu
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.white, color: C.ink, fontFamily: FONT, overflowX: "hidden" }}>
      <style suppressHydrationWarning>{`
        .s2-inp {
          width: 100%; box-sizing: border-box;
          background: #fff; border: 1.5px solid ${C.border};
          border-radius: 14px; padding: 15px 16px;
          font-size: 15px; font-family: ${FONT}; color: ${C.ink};
          outline: none; transition: border-color 150ms, box-shadow 150ms;
        }
        .s2-inp:focus { border-color: ${C.ink}; box-shadow: 0 0 0 4px rgba(10,10,10,0.06); }
        .s2-btn { transition: transform 160ms, filter 160ms; }
        .s2-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .s2-btn:active { transform: scale(0.98); }
        .s2-float {
          position: fixed;
          right: 18px;
          bottom: calc(18px + env(safe-area-inset-bottom));
          z-index: 90;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          max-width: calc(100vw - 36px);
        }
        @keyframes s2-pulse {
          0%, 100% { box-shadow: 0 10px 28px rgba(179,48,0,0.35); transform: scale(1); }
          50% { box-shadow: 0 14px 36px rgba(179,48,0,0.55); transform: scale(1.03); }
        }
        @keyframes s2-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes s2-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .s2-fab { animation: s2-pulse 2.2s ease-in-out infinite; }
        .s2-blink { animation: s2-blink 1.4s ease-in-out infinite; }
        .s2-dot { animation: s2-dot 1.6s ease-in-out infinite; }
        @media (max-width: 900px) {
          .s2-hero-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .s2-hero-visual { order: -1; }
          .s2-trust { grid-template-columns: 1fr 1fr !important; }
          .s2-form-grid { grid-template-columns: 1fr !important; }
          .s2-case-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .s2-name-grid { grid-template-columns: 1fr !important; }
          .s2-case-list { grid-template-columns: 1fr !important; }
          .s2-trust { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 20px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a href="/" style={{ textDecoration: "none", fontWeight: 800, fontSize: 18, color: C.ink, letterSpacing: "-0.03em" }}>
            cartly<span style={{ color: C.red }}>.</span>ba
          </a>
          <button
            type="button"
            onClick={openPopup}
            className="s2-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.red,
              color: C.white,
              border: "none",
              borderRadius: 999,
              padding: "11px 18px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Naruči · {fmt(PRICE)}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: C.soft }}>
        <div
          className="s2-hero-grid"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "clamp(28px, 5vw, 56px) 20px clamp(40px, 7vw, 72px)",
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 999,
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.muted,
                }}
              >
                Set 2 u 1
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: C.redSoft,
                  border: "1px solid rgba(179,48,0,0.18)",
                  borderRadius: 999,
                  padding: "7px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.red,
                }}
              >
                <span className="s2-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: C.red }} />
                Još {stockLeft} na stanju
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(34px, 5.5vw, 52px)",
                fontWeight: 800,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
                marginBottom: 14,
                color: C.ink,
              }}
            >
              Bušilica + brusilica.
              <br />
              Sve u jednom koferu.
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.65, color: C.muted, maxWidth: 440, marginBottom: 22 }}>
              Kompletan Set 2 u 1 — bušilica, brusilica, dvije baterije, punjač, zaštita, ručka i prenosivi kofer.
            </p>

            <div style={{ marginBottom: 22, maxWidth: 340 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: stockLeft < 15 ? C.red : C.muted }}>
                  {stockLeft < 15 ? "Brzo nestaje" : "Ograničeno stanje"}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.red }}>{stockLeft} kom</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "#E8E8E8", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${stockPct}%`,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${C.red}, #E85E00)`,
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontWeight: 600 }}>Akcijska cijena</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {fmt(PRICE)}
                  </span>
                  <span style={{ fontSize: 16, color: "#B0B0B0", textDecoration: "line-through" }}>{fmt(OLD_PRICE)}</span>
                </div>
              </div>
              <span
                style={{
                  background: C.red,
                  color: C.white,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "6px 10px",
                  borderRadius: 8,
                  marginBottom: 6,
                }}
              >
                Ušteda {fmt(OLD_PRICE - PRICE)}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={openPopup}
                className="s2-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: C.red,
                  color: C.white,
                  border: "none",
                  borderRadius: 16,
                  padding: "16px 24px",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                <ShoppingBag size={18} strokeWidth={2.2} />
                Naruči odmah
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={scrollToForm}
                style={{
                  background: C.white,
                  color: C.ink,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: "15px 18px",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                Vidi formu
              </button>
            </div>
            <p style={{ marginTop: 14, fontSize: 13, color: C.muted }}>
              Dostava +{fmt(DELIVERY)} širom BiH · Ukupno {fmt(PRICE + DELIVERY)}
            </p>
          </div>

          <div className="s2-hero-visual" style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                borderRadius: 28,
                overflow: "hidden",
                background: C.white,
                boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
              }}
            >
              <Image
                src={IMG}
                alt="Set 2 u 1 — bušilica i brusilica u koferu"
                fill
                priority
                sizes="(max-width: 900px) 90vw, 520px"
                style={{ objectFit: "contain", padding: 16 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={{ padding: "28px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div
          className="s2-trust"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 18,
          }}
        >
          {TRUST.map(({ Icon, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: C.soft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={C.ink} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kofer */}
      <section style={{ padding: "clamp(48px, 8vw, 80px) 20px", background: C.white }}>
        <div
          className="s2-case-grid"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              borderRadius: 28,
              overflow: "hidden",
              background: C.soft,
            }}
          >
            <Image
              src={IMG}
              alt="Šta sve dobijate u koferu"
              fill
              sizes="(max-width: 900px) 90vw, 520px"
              style={{ objectFit: "contain", padding: 16 }}
            />
          </div>

          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.red,
                marginBottom: 10,
              }}
            >
              U koferu
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: 12,
                lineHeight: 1.15,
              }}
            >
              Šta sve dobijate u koferu
            </h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.65, marginBottom: 24 }}>
              Sve uredno posloženo. Otvaraš kofer i radiš.
            </p>

            <div
              className="s2-case-list"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
            >
              {CASE_ITEMS.map(({ Icon, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: C.soft,
                    borderRadius: 16,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: C.ink,
                      color: C.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
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
      <section
        id="narudzba"
        ref={formRef}
        style={{
          background: C.soft,
          padding: "clamp(48px, 8vw, 80px) 20px",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.red,
              marginBottom: 10,
            }}
          >
            Narudžba
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 10,
            }}
          >
            Popuni podatke
          </h2>
          <p style={{ fontSize: 15, color: C.muted, marginBottom: 28 }}>
            Akcija · Set {fmt(PRICE)} + dostava {fmt(DELIVERY)} = {fmt(PRICE + DELIVERY)}
          </p>

          <div
            className="s2-form-grid"
            style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "start" }}
          >
            <form
              onSubmit={onSubmit}
              onFocus={fireCheckout}
              style={{
                background: C.white,
                borderRadius: 28,
                padding: "clamp(20px, 4vw, 32px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="s2-name-grid"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}
              >
                <Field label="Ime *">
                  <input
                    className="s2-inp"
                    autoComplete="given-name"
                    placeholder="npr. Emir"
                    value={fields.ime}
                    onChange={(e) => update("ime", e.target.value)}
                  />
                </Field>
                <Field label="Prezime *">
                  <input
                    className="s2-inp"
                    autoComplete="family-name"
                    placeholder="npr. Hadžić"
                    value={fields.prezime}
                    onChange={(e) => update("prezime", e.target.value)}
                  />
                </Field>
              </div>
              <div style={{ marginBottom: 14 }}>
                <Field label="Adresa *">
                  <input
                    className="s2-inp"
                    autoComplete="street-address"
                    placeholder="npr. Titova 12"
                    value={fields.adresa}
                    onChange={(e) => update("adresa", e.target.value)}
                  />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 14, marginBottom: 14 }}>
                <Field label="Grad *">
                  <input
                    className="s2-inp"
                    autoComplete="address-level2"
                    placeholder="npr. Sarajevo"
                    value={fields.grad}
                    onChange={(e) => update("grad", e.target.value)}
                  />
                </Field>
                <Field label="PTT *">
                  <input
                    className="s2-inp"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    placeholder="71000"
                    value={fields.postanski_broj}
                    onChange={(e) => update("postanski_broj", e.target.value)}
                  />
                </Field>
              </div>
              <div style={{ marginBottom: 18 }}>
                <Field label="Broj telefona *">
                  <input
                    className="s2-inp"
                    type="tel"
                    autoComplete="tel"
                    placeholder="npr. 061 123 456"
                    value={fields.telefon}
                    onChange={(e) => update("telefon", e.target.value)}
                  />
                </Field>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: C.soft,
                  borderRadius: 16,
                  padding: "14px 16px",
                  marginBottom: 18,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Količina</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Broj setova</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: C.white,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    disabled={qty <= 1}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={{
                      width: 42,
                      height: 42,
                      border: "none",
                      background: "transparent",
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: qty <= 1 ? "not-allowed" : "pointer",
                      opacity: qty <= 1 ? 0.35 : 1,
                      fontFamily: FONT,
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 36, textAlign: "center", fontWeight: 800, fontSize: 16 }}>{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(5, q + 1))}
                    style={{
                      width: 42,
                      height: 42,
                      border: "none",
                      background: "transparent",
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: FONT,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    background: "rgba(179,48,0,0.06)",
                    border: "1px solid rgba(179,48,0,0.18)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 14,
                  }}
                >
                  <AlertCircle size={16} color={C.red} />
                  <span style={{ fontSize: 13, color: C.red, fontWeight: 500 }}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="s2-btn"
                style={{
                  width: "100%",
                  background: loading ? "#666" : C.red,
                  color: C.white,
                  border: "none",
                  borderRadius: 16,
                  padding: "17px",
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: FONT,
                }}
              >
                {loading ? "Slanje..." : `Potvrdi narudžbu · ${fmt(total)}`}
              </button>
            </form>

            <aside
              style={{
                background: C.ink,
                color: C.white,
                borderRadius: 28,
                overflow: "hidden",
                position: "sticky",
                top: 80,
              }}
            >
              <div style={{ padding: "28px 24px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.4)",
                        marginBottom: 8,
                      }}
                    >
                      Sažetak
                    </p>
                    <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                      Set 2 u 1
                    </h3>
                  </div>
                  <span
                    style={{
                      background: C.red,
                      color: C.white,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "5px 9px",
                      borderRadius: 6,
                      height: "fit-content",
                    }}
                  >
                    AKCIJA
                  </span>
                </div>

                <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
                  <div
                    style={{
                      position: "relative",
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    <Image src={IMG} alt="" fill sizes="72px" style={{ objectFit: "contain", padding: 4 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                      {qty} × set
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 22, fontWeight: 900 }}>{fmt(PRICE)}</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>
                        {fmt(OLD_PRICE)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                  <Row label={`${qty} × set`} value={fmt(productTotal)} />
                  <Row label="Dostava širom BiH" value={`+ ${fmt(DELIVERY)}`} />
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  padding: "18px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Ukupno</span>
                <span style={{ fontWeight: 900, fontSize: 30, letterSpacing: "-0.04em" }}>{fmt(total)}</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <footer style={{ background: C.ink, padding: "32px 20px", textAlign: "center" }}>
        <span style={{ color: C.white, fontWeight: 800, fontSize: 16 }}>
          cartly<span style={{ color: C.red }}>.</span>ba
        </span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
          © 2026 · Set 2 u 1 · Dostava +{fmt(DELIVERY)} širom BiH
        </p>
      </footer>

      {/* Floating CTA */}
      {floatVisible && !popupOpen && (
        <div className="s2-float">
          <div
            className="s2-blink"
            style={{
              background: C.ink,
              color: C.white,
              fontSize: 11,
              fontWeight: 700,
              padding: "7px 12px",
              borderRadius: 999,
              letterSpacing: "0.02em",
            }}
          >
            Cijena / Akcija završava uskoro
          </div>
          <button
            type="button"
            onClick={openPopup}
            className="s2-btn s2-fab"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: C.red,
              color: C.white,
              border: "none",
              borderRadius: 999,
              padding: "14px 20px 14px 16px",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingBag size={18} />
            </span>
            <span style={{ textAlign: "left" }}>
              <span style={{ display: "block", fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>Naruči</span>
              <span style={{ display: "block", fontSize: 12, opacity: 0.9, marginTop: 2 }}>{fmt(PRICE)}</span>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#888",
          marginBottom: 7,
        }}
      >
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
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 env(safe-area-inset-bottom)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.white,
          width: "100%",
          maxWidth: 480,
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: "28px 28px 0 0",
          padding: "20px 20px 24px",
          fontFamily: FONT,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.red,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Brza narudžba
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4 }}>
              Set 2 u 1
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: C.soft,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            background: C.ink,
            color: C.white,
            borderRadius: 18,
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{qty} × set</span>
            <span style={{ fontWeight: 700 }}>{fmt(productTotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Dostava širom BiH</span>
            <span style={{ fontWeight: 700 }}>+ {fmt(DELIVERY)}</span>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Ukupno</span>
            <span style={{ fontWeight: 900, fontSize: 24 }}>{fmt(total)}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <Field label="Ime *">
            <input className="s2-inp" value={fields.ime} placeholder="Ime" onChange={(e) => onChange("ime", e.target.value)} />
          </Field>
          <Field label="Prezime *">
            <input
              className="s2-inp"
              value={fields.prezime}
              placeholder="Prezime"
              onChange={(e) => onChange("prezime", e.target.value)}
            />
          </Field>
        </div>
        <div style={{ marginBottom: 10 }}>
          <Field label="Adresa *">
            <input
              className="s2-inp"
              value={fields.adresa}
              placeholder="Adresa"
              onChange={(e) => onChange("adresa", e.target.value)}
            />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10, marginBottom: 10 }}>
          <Field label="Grad *">
            <input className="s2-inp" value={fields.grad} placeholder="Grad" onChange={(e) => onChange("grad", e.target.value)} />
          </Field>
          <Field label="PTT *">
            <input
              className="s2-inp"
              value={fields.postanski_broj}
              placeholder="71000"
              inputMode="numeric"
              onChange={(e) => onChange("postanski_broj", e.target.value)}
            />
          </Field>
        </div>
        <div style={{ marginBottom: 10 }}>
          <Field label="Telefon *">
            <input
              className="s2-inp"
              type="tel"
              value={fields.telefon}
              placeholder="061 123 456"
              onChange={(e) => onChange("telefon", e.target.value)}
            />
          </Field>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: C.soft,
            borderRadius: 14,
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14 }}>Količina</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => onQty((q) => Math.max(1, q - 1))}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.white,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              −
            </button>
            <span style={{ fontWeight: 800, minWidth: 20, textAlign: "center" }}>{qty}</span>
            <button
              type="button"
              onClick={() => onQty((q) => Math.min(5, q + 1))}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.white,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: C.red, marginBottom: 12, fontWeight: 500 }}>{error}</p>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={onSubmit}
          className="s2-btn"
          style={{
            width: "100%",
            background: C.red,
            color: C.white,
            border: "none",
            borderRadius: 16,
            padding: "16px",
            fontWeight: 800,
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: FONT,
          }}
        >
          {loading ? "Slanje..." : `Pošalji · ${fmt(total)}`}
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: "#AAA", marginTop: 12 }}>
          Set {fmt(PRICE)} + dostava {fmt(DELIVERY)} = {fmt(PRICE + DELIVERY)}
        </p>
      </div>
    </div>
  );
}
