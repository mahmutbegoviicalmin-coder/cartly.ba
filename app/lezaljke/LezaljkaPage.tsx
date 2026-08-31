"use client";

import { useState, useEffect, FormEvent } from "react";
import { event } from "@/lib/fbpixel";
import { track } from "@vercel/analytics";
import Link from "next/link";
import LezaljkaHero from "./components/LezaljkaHero";
import TrustStats from "./components/TrustStats";
import FeatureCards from "./components/FeatureCards";
import GallerySection from "./components/GallerySection";
import { CountdownBanner, OrderNotifications } from "./components/SocialProof";
import { PRODUCT } from "./components/types";

const PRICE = 59.9;
const DELIVERY = 10.0;

const TICKER_ITEMS = [
  "Dostava 10 KM",
  "Plaćanje pouzećem",
  "Povrat 14 dana",
  "Brza isporuka",
  "500+ zadovoljnih kupaca",
];

export default function LezaljkaPage() {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [floatVisible, setFloatVisible] = useState(false);
  const [checkoutFired, setCheckoutFired] = useState(false);

  const activeColor = PRODUCT;
  const total = PRICE * qty + DELIVERY;

  useEffect(() => {
    const t = setTimeout(() => setFloatVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    event("ViewContent", {
      content_name: "Premium Lezaljka",
      content_ids: ["lezaljka"],
      content_type: "product",
      value: PRICE,
      currency: "BAM",
    });
    track("lezaljka_page_view");
  }, []);

  const fireInitiateCheckout = () => {
    if (checkoutFired) return;
    setCheckoutFired(true);
    event("InitiateCheckout", {
      content_name: "Premium Lezaljka",
      content_ids: ["lezaljka"],
      content_type: "product",
      value: total,
      currency: "BAM",
      num_items: qty,
    });
    track("lezaljka_initiate_checkout");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Unesite ime i prezime";
    if (!phone.trim()) e.phone = "Unesite broj telefona";
    else if (!/^[\d\s+\-()]{7,}$/.test(phone)) e.phone = "Neispravan broj";
    if (!address.trim()) e.address = "Unesite adresu";
    if (!city.trim()) e.city = "Unesite grad";
    if (!zip.trim()) e.zip = "Unesite poštanski broj";
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setServerError(null);
    const externalId = (() => { try { return localStorage.getItem("_crt_eid") || ""; } catch { return ""; } })();
    try {
      const res = await fetch("/api/lezaljka-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime: name, telefon: phone, adresa: address, grad: city, postanski_broj: zip, boja: PRODUCT.id, kolicina: qty, externalId }),
      });
      const data = await res.json();
      if (data.success) {
        track("lezaljka_order", { color: PRODUCT.id, qty, total });
        event("Purchase", { value: total, currency: "BAM", content_name: "Premium Lezaljka", content_ids: ["lezaljka"], content_type: "product", num_items: qty }, data.orderNumber);
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerError(data.error ?? "Greška. Pokušajte ponovo.");
        track("lezaljka_order_error");
      }
    } catch {
      setServerError("Greška. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToOrder = () => {
    event("AddToCart", { content_name: "Premium Lezaljka", content_ids: ["lezaljka"], content_type: "product", value: PRICE, currency: "BAM" });
    track("lezaljka_cta_click");
    document.getElementById("naruci")?.scrollIntoView({ behavior: "smooth" });
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#F0FDF4 0%,#DCFCE7 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: "clamp(22px,5vw,28px)", color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Hvala, {name.split(" ")[0]}!
          </h2>
          <p style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 15, color: "#555", lineHeight: 1.6, margin: "0 0 28px" }}>
            Narudžba primljena. Javit ćemo se na <strong>{phone}</strong> u roku od 24h.
          </p>
          <Link href="/" style={{ display: "inline-block", background: "#1B4332", color: "#fff", padding: "14px 28px", borderRadius: 12, fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Nazad na početnu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ─ Inputs ─ */
        .lz-inp {
          width: 100%;
          border: 1.5px solid #E2E2E2;
          border-radius: 10px;
          padding: 13px 14px;
          font-size: 15px;
          font-family: var(--font-manrope), sans-serif;
          outline: none;
          background: #fff;
          box-sizing: border-box;
          color: #0A0A0A;
          transition: border-color 150ms, box-shadow 150ms;
          -webkit-appearance: none;
        }
        .lz-inp:focus {
          border-color: ${activeColor.hex};
          box-shadow: 0 0 0 3px ${activeColor.hex}18;
        }
        .lz-inp.err { border-color: #ef4444; box-shadow: 0 0 0 3px #ef444418; }
        .lz-em { font-size: 11px; color: #ef4444; margin: 4px 0 0; font-family: var(--font-manrope), sans-serif; }

        /* ─ Submit button ─ */
        .lz-sub {
          width: 100%; border: none; border-radius: 14px;
          padding: 17px 20px;
          font-family: var(--font-manrope), sans-serif;
          font-weight: 800; font-size: 16px;
          cursor: pointer; transition: filter 150ms, transform 150ms; color: #fff;
          -webkit-tap-highlight-color: transparent;
        }
        .lz-sub:hover:not(:disabled) { filter: brightness(0.88); transform: translateY(-1px); }
        .lz-sub:active:not(:disabled) { transform: scale(0.98); }
        .lz-sub:disabled { opacity: .55; cursor: not-allowed; }

        /* ─ Qty buttons ─ */
        .lz-qty-btn {
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          font-size: 22px; font-weight: 700; color: #444;
          font-family: var(--font-manrope), sans-serif;
          transition: color 120ms; -webkit-tap-highlight-color: transparent;
        }
        .lz-qty-btn:disabled { opacity: .3; cursor: not-allowed; }
        .lz-qty-btn:hover:not(:disabled) { color: ${activeColor.hex}; }

        /* ─ Ticker ─ */
        @keyframes lz-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .lz-ticker-track {
          display: flex;
          animation: lz-ticker 22s linear infinite;
          will-change: transform;
        }
        .lz-ticker-track:hover { animation-play-state: paused; }

        /* ─ Floating CTA ─ */
        .lz-fcta {
          position: fixed; z-index: 9998;
          transition: transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease;
        }
        .lz-fcta.visible {
          opacity: 1; transform: translateY(0);
        }
        .lz-fcta.hidden {
          opacity: 0; pointer-events: none;
        }

        /* Mobile: full-width bar at bottom */
        @media (max-width: 639px) {
          .lz-fcta {
            bottom: 0; left: 0; right: 0;
            background: #fff;
            border-top: 1px solid #EBEBEB;
            padding: 10px 16px;
            padding-bottom: calc(10px + env(safe-area-inset-bottom));
            display: flex; align-items: center; gap: 12px;
            box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
          }
          .lz-fcta.hidden { transform: translateY(100%); }
        }

        /* Desktop: floating pill bottom-right */
        @media (min-width: 640px) {
          .lz-fcta {
            bottom: 24px; right: 24px;
            background: #fff;
            border: 1px solid #E8E8E8;
            border-radius: 18px;
            padding: 14px 16px;
            display: flex; align-items: center; gap: 14px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.13);
            min-width: 280px; max-width: 340px;
          }
          .lz-fcta.hidden { transform: translateY(16px); }
        }

        /* ─ Live pulse ─ */
        @keyframes lz-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        .lz-live { animation: lz-pulse 2s ease-in-out infinite; }

        /* ─ Form city/zip grid ─ */
        .lz-city-zip {
          display: grid;
          grid-template-columns: 1fr 130px;
          gap: 12px;
        }
        @media (max-width: 400px) {
          .lz-city-zip { grid-template-columns: 1fr; }
        }

        /* ─ Form padding ─ */
        .lz-form-pad { padding: 24px; }
        @media (min-width: 480px) { .lz-form-pad { padding: 28px; } }

        /* ─ Sticky header text ─ */
        .lz-nav-back-text { display: inline; }
        @media (max-width: 360px) { .lz-nav-back-text { display: none; } }

        /* ─ Step label ─ */
        .lz-step-label { display: inline; }
        @media (max-width: 360px) { .lz-step-label { font-size: 14px !important; } }
      `}</style>

      {/* ─── COUNTDOWN ─── */}
      <CountdownBanner accentHex={activeColor.hex} />

      {/* ─── STICKY HEADER ─── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid #EBEBEB",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 16px",
          height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 8,
        }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 6,
            textDecoration: "none", color: "#555",
            fontSize: 13, fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600,
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            <span className="lz-nav-back-text">Nazad</span>
          </Link>

          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 18, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
              cartly<span style={{ color: "#B33000" }}>.</span>
            </span>
          </Link>

          <button onClick={scrollToOrder} style={{
            background: activeColor.hex, color: "#fff", border: "none",
            borderRadius: 9, padding: "9px 16px",
            fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800,
            fontSize: 13, cursor: "pointer",
            transition: "background 400ms",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}>
            Naruči →
          </button>
        </div>
      </header>

      {/* ─── TICKER ─── */}
      <div style={{ background: activeColor.hex, overflow: "hidden", padding: "8px 0", transition: "background 500ms" }}>
        <div className="lz-ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 11, fontWeight: 700, color: "#fff",
              letterSpacing: "0.12em", textTransform: "uppercase",
              flexShrink: 0, paddingRight: 40,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="rgba(255,255,255,0.5)" /></svg>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── HERO ─── */}
      <LezaljkaHero onOrder={scrollToOrder} />

      {/* ─── FEATURES ─── */}
      <FeatureCards />

      {/* ─── TRUST STATS ─── */}
      <TrustStats />

      {/* ─── GALLERY ─── */}
      <GallerySection />

      {/* ─── ORDER FORM ─── */}
      <section id="naruci" style={{
        background: "linear-gradient(180deg, #F4F7F5 0%, #EBF0EC 100%)",
        padding: "72px 16px 100px",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <p style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "#D97706",
            }}>
              Naruči odmah
            </p>
            <h2 style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 900, fontSize: "clamp(24px,5vw,38px)",
              color: "#0A0A0A", letterSpacing: "-0.035em", lineHeight: 1.1,
            }}>
              Završi narudžbu
            </h2>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 14, color: "#6B7280", lineHeight: 1.55,
            }}>
              Popuni podatke. Dostava u roku od 1-3 radna dana
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 4px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}>

            {/* ── STEP 1: Podaci ── */}
            <div className="lz-form-pad" style={{ paddingBottom: 0 }}>
              <StepHeader n={1} label="Podaci za dostavu" hex={activeColor.hex} />
              <form id="lz-form" onSubmit={handleSubmit} noValidate style={{ marginTop: 20 }}>
                <Field label="IME I PREZIME" error={errors.name}>
                  <input type="text" value={name} placeholder="Npr. Amir Begović"
                    onFocus={fireInitiateCheckout}
                    onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: "" })); }}
                    className={`lz-inp${errors.name ? " err" : ""}`} />
                </Field>
                <Field label="BROJ TELEFONA" error={errors.phone}>
                  <input type="tel" value={phone} placeholder="Npr. 061 234 567"
                    inputMode="tel"
                    onChange={e => { setPhone(e.target.value); setErrors(er => ({ ...er, phone: "" })); }}
                    className={`lz-inp${errors.phone ? " err" : ""}`} />
                </Field>
                <Field label="ADRESA DOSTAVE" error={errors.address}>
                  <input type="text" value={address} placeholder="Npr. Ferhadija 1"
                    autoComplete="street-address"
                    onChange={e => { setAddress(e.target.value); setErrors(er => ({ ...er, address: "" })); }}
                    className={`lz-inp${errors.address ? " err" : ""}`} />
                </Field>
                <div className="lz-city-zip" style={{ marginBottom: 0 }}>
                  <Field label="GRAD" error={errors.city}>
                    <input type="text" value={city} placeholder="Npr. Sarajevo"
                      autoComplete="address-level2"
                      onChange={e => { setCity(e.target.value); setErrors(er => ({ ...er, city: "" })); }}
                      className={`lz-inp${errors.city ? " err" : ""}`} />
                  </Field>
                  <Field label="PTT" error={errors.zip}>
                    <input type="text" value={zip} placeholder="71000"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      onChange={e => { setZip(e.target.value); setErrors(er => ({ ...er, zip: "" })); }}
                      className={`lz-inp${errors.zip ? " err" : ""}`} />
                  </Field>
                </div>
              </form>
            </div>

            <Divider />

            {/* ── STEP 2: Količina ── */}
            <div className="lz-form-pad" style={{ paddingTop: 0, paddingBottom: 0 }}>
              <StepHeader n={2} label="Količina" hex={activeColor.hex} />
              <div style={{ marginTop: 18 }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#F7F7F7", borderRadius: 12, padding: "12px 16px",
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>Količina</div>
                    <div style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "#AAA", marginTop: 1 }}>Boja: {PRODUCT.label}</div>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center",
                    background: "#fff", border: "1.5px solid #E8E8E8", borderRadius: 10, overflow: "hidden",
                  }}>
                    <button type="button" className="lz-qty-btn"
                      disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}
                      style={{ borderRight: "1.5px solid #E8E8E8" }}>−</button>
                    <span style={{
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: 800, fontSize: 17, color: "#0A0A0A",
                      minWidth: 40, textAlign: "center",
                    }}>{qty}</span>
                    <button type="button" className="lz-qty-btn"
                      onClick={() => setQty(q => q + 1)}
                      style={{ borderLeft: "1.5px solid #E8E8E8" }}>+</button>
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            {/* ── STEP 3: Pregled ── */}
            <div className="lz-form-pad" style={{ paddingTop: 0 }}>
              <StepHeader n={3} label="Pregled narudžbe" hex={activeColor.hex} />

              <div style={{
                background: "#F8F8F8", borderRadius: 12,
                padding: "14px 16px", marginTop: 18, marginBottom: 16,
              }}>
                <PriceRow label={`${qty} × Ležaljka (${PRODUCT.label})`}
                  value={`${(qty * PRICE).toFixed(2).replace(".", ",")} KM`} />
                <div style={{ height: 1, background: "#EBEBEB", margin: "10px 0" }} />
                <PriceRow
                  label={<span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                    Dostava (Euro Express)
                  </span>}
                  value="10,00 KM"
                />
                <div style={{ height: 1, background: "#EBEBEB", margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>Ukupno za platiti</span>
                  <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: "clamp(22px,5vw,28px)", color: "#0A0A0A", letterSpacing: "-0.03em" }}>
                    {total.toFixed(2).replace(".", ",")} KM
                  </span>
                </div>
              </div>

              {serverError && (
                <p style={{ fontSize: 13, color: "#ef4444", background: "#fef2f2", padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontFamily: "var(--font-manrope), sans-serif" }}>
                  {serverError}
                </p>
              )}

              <button type="submit" form="lz-form" className="lz-sub" disabled={loading}
                style={{ background: activeColor.hex, transition: "background 400ms" }}>
                {loading ? "Slanje..." : `Potvrdi narudžbu · ${total.toFixed(2).replace(".", ",")} KM`}
              </button>

              <div style={{ display: "flex", justifyContent: "center", gap: "clamp(10px,3vw,20px)", marginTop: 14, flexWrap: "wrap" }}>
                {[
                  { svg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>, text: "Pouzećem" },
                  { svg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, text: "Povrat 14 dana" },
                  { svg: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>, text: "Brza dostava" },
                ].map((b, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, color: "#999" }}>
                    {b.svg}
                    <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, color: "#AAA", fontWeight: 500 }}>{b.text}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "#0A0A0A", padding: "28px 16px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>
          © 2025 Cartly.ba · Isporuka diljem Bosne i Hercegovine
        </p>
      </footer>

      {/* ─── FLOATING CTA ─── */}
      <div className={`lz-fcta ${floatVisible ? "visible" : "hidden"}`}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
            <span className="lz-live" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22c55e", fontFamily: "var(--font-manrope), sans-serif" }}>Na stanju</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#0A0A0A", fontFamily: "var(--font-manrope), sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>59,90 KM</span>
            <span style={{ fontSize: 11, color: "#C0C0C0", textDecoration: "line-through", fontFamily: "var(--font-manrope), sans-serif" }}>129,90</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: activeColor.hex, background: activeColor.bg, borderRadius: 4, padding: "2px 5px", fontFamily: "var(--font-manrope), sans-serif", transition: "all 400ms" }}>−54%</span>
          </div>
          <div style={{ fontSize: 10, color: "#BBBBBB", fontFamily: "var(--font-manrope), sans-serif", marginTop: 2, whiteSpace: "nowrap" }}>Pouzećem · Dostava 10 KM</div>
        </div>
        <button onClick={scrollToOrder} style={{
          flexShrink: 0,
          background: activeColor.hex, color: "#fff", border: "none",
          borderRadius: 10, padding: "11px 16px",
          fontSize: 13, fontWeight: 800,
          fontFamily: "var(--font-manrope), sans-serif",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          transition: "background 400ms",
          WebkitTapHighlightColor: "transparent",
        }}>
          Naruči
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* ─── SOCIAL PROOF NOTIFICATIONS ─── */}
      <OrderNotifications />
    </>
  );
}

/* ─── Shared sub-components ─── */

function StepHeader({ n, label, hex }: { n: number; label: string; hex: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: hex, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 400ms",
      }}>
        <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: 12, color: "#fff" }}>{n}</span>
      </div>
      <span className="lz-step-label" style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 15, color: "#0A0A0A" }}>{label}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#F0F0F0", margin: "22px 0" }} />;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block",
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 11, fontWeight: 700, color: "#888",
        marginBottom: 6, letterSpacing: "0.08em",
      }}>{label}</label>
      {children}
      {error && <p className="lz-em">{error}</p>}
    </div>
  );
}

function PriceRow({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#777" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, fontWeight: 600, color: "#333" }}>{value}</span>
    </div>
  );
}
