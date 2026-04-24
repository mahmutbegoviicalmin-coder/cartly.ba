"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import ProductPageHeader from "@/components/ProductPageHeader";
import Footer from "@/components/Footer";
import { event } from "@/lib/fbpixel";
import OrderSuccess from "@/components/OrderSuccess";

const UNIT_PRICE = 129.9;
const DELIVERY = 10.0;

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

// ─────────────────────────────────────────────────────────
// Hero Social Proof Widget (inline pill)
// ─────────────────────────────────────────────────────────
const viewerPool = [18, 22, 24, 27, 29, 31, 33, 26];
const orderPool  = [74, 79, 81, 83, 86, 88, 91, 85];

function HeroSocialProof() {
  const [viewers, setViewers] = useState<number>(0);
  const [orders, setOrders]   = useState<number>(0);
  const [flashV, setFlashV]   = useState(false);
  const [flashO, setFlashO]   = useState(false);

  useEffect(() => {
    setViewers(viewerPool[Math.floor(Math.random() * viewerPool.length)]);
    setOrders(orderPool[Math.floor(Math.random() * orderPool.length)]);

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = Math.random() * 4000 + 8000;
      timer = setTimeout(() => {
        setViewers(viewerPool[Math.floor(Math.random() * viewerPool.length)]);
        setOrders(orderPool[Math.floor(Math.random() * orderPool.length)]);
        setFlashV(true);
        setFlashO(true);
        setTimeout(() => { setFlashV(false); setFlashO(false); }, 400);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="hero-social-proof"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        background: "rgba(249,115,22,0.06)",
        border: "1px solid rgba(249,115,22,0.18)",
        borderRadius: 99,
        padding: "10px 20px",
        marginBottom: 28,
        width: "fit-content",
        fontFamily: "var(--font-manrope, sans-serif)",
      }}
    >
      {/* Left: viewers */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span className="live-dot" />
        <span style={{ fontSize: 13, fontWeight: 500, color: "#3d3d3d" }}>
          <span className={flashV ? "numFlash" : ""} style={{ fontWeight: 700, color: "#1d1d1f", display: "inline-block" }}>
            {viewers || "—"}
          </span>
          {" "}osoba gleda
        </span>
      </div>

      {/* Divider */}
      <span style={{ width: 1, height: 18, background: "rgba(249,115,22,0.25)", flexShrink: 0, display: "inline-block" }} />

      {/* Right: orders */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#3d3d3d" }}>
          Naručeno{" "}
          <span className={flashO ? "numFlash" : ""} style={{ fontWeight: 700, color: "#1d1d1f", display: "inline-block" }}>
            {orders || "—"}
          </span>
          x danas
        </span>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// FAQ Accordion Item
// ─────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: open ? "#FF6B00" : "#0A0A0A",
            fontFamily: "var(--font-manrope, sans-serif)",
            lineHeight: 1.4,
            transition: "color 0.15s",
          }}
        >
          {q}
        </span>
        <span style={{ flexShrink: 0, color: "#FF6B00" }}>
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </span>
      </button>
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? 200 : 0,
          transition: "max-height 0.3s ease",
          paddingBottom: open ? 16 : 0,
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: "rgba(0,0,0,0.6)",
            lineHeight: 1.7,
            margin: 0,
            fontFamily: "var(--font-manrope, sans-serif)",
            paddingRight: 40,
          }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Camera Order Form
// ─────────────────────────────────────────────────────────
type Fields = { name: string; phone: string; address: string; city: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

function CameraOrderForm() {
  const [qty, setQty] = useState(1);
  const [fields, setFields] = useState<Fields>({ name: "", phone: "", address: "", city: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const checkoutTracked = useRef(false);

  const productTotal = qty * UNIT_PRICE;
  const grandTotal = productTotal + DELIVERY;

  const handleField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Fields])
      setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!fields.name.trim()) e.name = "Unesite ime i prezime";
    if (!fields.phone.trim()) e.phone = "Unesite broj telefona";
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(fields.phone)) e.phone = "Neispravan broj";
    if (!fields.address.trim()) e.address = "Unesite adresu";
    if (!fields.city.trim()) e.city = "Unesite grad";
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/kamera-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ime: fields.name,
          telefon: fields.phone,
          adresa: fields.address,
          grad: fields.city,
          kolicina: qty,
        }),
      });
      const data = await res.json();
      if (data.success) {
        event("Purchase", {
          value: grandTotal,
          currency: "BAM",
          content_name: "V380 Pro Kamera 12MP",
        });
        setSubmitted(true);
      } else {
        setServerError(data.error ?? "Greška pri slanju narudžbe.");
      }
    } catch {
      setServerError("Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <OrderSuccess />;
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    height: 52,
    padding: "0 16px",
    fontSize: 15,
    fontFamily: "var(--font-manrope, sans-serif)",
    border: `1px solid ${hasError ? "#ef4444" : "#E5E5E5"}`,
    borderRadius: 8,
    background: "#F9F9F9",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    color: "#0A0A0A",
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left Column ── */}
        <div style={{ flex: "1 1 60%" }} className="flex flex-col gap-5 w-full">

          {/* Personal data */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 32 }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#0A0A0A", marginBottom: 24, fontFamily: "var(--font-manrope, sans-serif)" }}>
              Vaši podaci
            </p>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
              className="form-grid"
              onFocus={() => {
                if (!checkoutTracked.current) {
                  checkoutTracked.current = true;
                  event("InitiateCheckout", { value: grandTotal, currency: "BAM" });
                }
              }}
            >
              {([
                { id: "name",    label: "Ime i prezime",  type: "text", autoComplete: "name",           placeholder: "npr. Emir Hadžić" },
                { id: "phone",   label: "Broj telefona",  type: "tel",  autoComplete: "tel",             placeholder: "npr. 061 123 456" },
                { id: "address", label: "Adresa",         type: "text", autoComplete: "street-address",  placeholder: "npr. Ferhadija 12" },
                { id: "city",    label: "Grad",           type: "text", autoComplete: "address-level2",  placeholder: "npr. Sarajevo" },
              ] as const).map(({ id, label, type, autoComplete, placeholder }) => (
                <div key={id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0A", fontFamily: "var(--font-manrope, sans-serif)" }}>
                    {label}
                  </label>
                  <input
                    id={id} name={id} type={type} autoComplete={autoComplete}
                    placeholder={placeholder} value={fields[id]} onChange={handleField}
                    style={inputStyle(!!errors[id])}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6B00"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors[id] ? "#ef4444" : "#E5E5E5"; }}
                  />
                  {errors[id] && (
                    <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{errors[id]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 32 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#0A0A0A", marginBottom: 20, fontFamily: "var(--font-manrope, sans-serif)" }}>
              Količina
            </p>
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", background: "#F9F9F9", borderRadius: 10,
                border: "1px solid #E5E5E5",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#0A0A0A", fontFamily: "var(--font-manrope, sans-serif)" }}>
                V380 Pro Kamera 12MP
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: "1px solid", borderColor: qty <= 1 ? "#E5E5E5" : "#ccc",
                    background: "#fff", color: qty <= 1 ? "#ccc" : "#0A0A0A",
                    fontSize: 18, cursor: qty <= 1 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-manrope, sans-serif)",
                  }}
                >−</button>
                <span style={{ width: 24, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#0A0A0A", fontFamily: "var(--font-manrope, sans-serif)" }}>
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(5, q + 1))}
                  disabled={qty >= 5}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: "1px solid", borderColor: qty >= 5 ? "#E5E5E5" : "#ccc",
                    background: "#fff", color: qty >= 5 ? "#ccc" : "#0A0A0A",
                    fontSize: 18, cursor: qty >= 5 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-manrope, sans-serif)",
                  }}
                >+</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column — Summary ── */}
        <div style={{ flex: "1 1 40%" }} className="w-full lg:sticky lg:top-20">
          <div
            style={{
              background: "#fff", borderRadius: 16, padding: 32,
              display: "flex", flexDirection: "column", gap: 20,
            }}
          >
            {/* Product thumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", background: "#F5F5F5", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/kamere.png" alt="V380 Pro Kamera" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A", margin: 0, lineHeight: 1.3, fontFamily: "var(--font-manrope, sans-serif)" }}>
                  V380 Pro Kamera
                </p>
                <p style={{ fontSize: 13, color: "#999", margin: "3px 0 0", lineHeight: 1.3, fontFamily: "var(--font-manrope, sans-serif)" }}>
                  12MP WiFi · Vanjska sigurnost
                </p>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #F0F0F0", margin: 0 }} />

            {/* Order lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontFamily: "var(--font-manrope, sans-serif)" }}>
                <span style={{ color: "#666" }}>
                  {qty}× V380 Pro Kamera
                </span>
                <span style={{ color: "#0A0A0A", fontWeight: 500 }}>{fmt(productTotal)}</span>
              </div>
              {/* SD card free gift line */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 4, fontFamily: "var(--font-manrope, sans-serif)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" style={{ flexShrink: 0 }}>
                    <polyline points="20 12 20 22 4 22 4 12"/>
                    <rect x="2" y="7" width="20" height="5"/>
                    <line x1="12" y1="22" x2="12" y2="7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                  <span style={{ fontSize: 14, color: "#3d3d3d", fontWeight: 500 }}>SD kartica 64GB</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>GRATIS</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontFamily: "var(--font-manrope, sans-serif)" }}>
                <span style={{ color: "#666" }}>Dostava</span>
                <span style={{ color: "#0A0A0A", fontWeight: 500 }}>{fmt(DELIVERY)}</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #F0F0F0", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A", fontFamily: "var(--font-manrope, sans-serif)" }}>Ukupno</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#FF6B00", fontFamily: "var(--font-manrope, sans-serif)" }}>{fmt(grandTotal)}</span>
              </div>
            </div>

            {serverError && (
              <p style={{ fontSize: 13, color: "#ef4444", textAlign: "center", margin: 0 }}>{serverError}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", background: loading ? "#ccc" : "#FF6B00", color: "#fff",
                border: "none", borderRadius: 10, padding: "16px",
                fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-manrope, sans-serif)",
                transition: "background 0.15s",
                lineHeight: 1.3,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#E85E00"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#FF6B00"; }}
            >
              {loading ? "Slanje..." : `Naruči odmah — Plaćanje pouzećem`}
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", margin: 0, lineHeight: 1.5, fontFamily: "var(--font-manrope, sans-serif)" }}>
              🔒 Sigurna narudžba &bull; Euro Express &bull; 1–3 radna dana
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────
// Sticky Bottom Bar
// ─────────────────────────────────────────────────────────
// Purchase Notification Popup
// ─────────────────────────────────────────────────────────
const notifData = [
  { name: "Mirza",    city: "Sarajeva",  gender: "m" },
  { name: "Amra",     city: "Mostara",   gender: "f" },
  { name: "Edin",     city: "Tuzle",     gender: "m" },
  { name: "Lejla",    city: "Zenice",    gender: "f" },
  { name: "Tarik",    city: "Banje Luke",gender: "m" },
  { name: "Selma",    city: "Bihaća",    gender: "f" },
  { name: "Adnan",    city: "Travnika",  gender: "m" },
  { name: "Amina",    city: "Goražda",   gender: "f" },
  { name: "Haris",    city: "Konjica",   gender: "m" },
  { name: "Dženana",  city: "Brčkog",    gender: "f" },
] as const;

function PurchaseNotif() {
  const [visible, setVisible]   = useState(false);
  const [leaving, setLeaving]   = useState(false);
  const [current, setCurrent]   = useState(0);
  const lastIdx = useRef(-1);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickNext = () => {
    let idx: number;
    do { idx = Math.floor(Math.random() * notifData.length); }
    while (idx === lastIdx.current);
    lastIdx.current = idx;
    return idx;
  };

  const show = () => {
    const idx = pickNext();
    setCurrent(idx);
    setLeaving(false);
    setVisible(true);

    // Auto-hide after 4 s
    hideTimer.current = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => setVisible(false), 420);
    }, 4000);

    // Schedule next
    cycleTimer.current = setTimeout(show, 30000);
  };

  useEffect(() => {
    // First appearance after 8 s
    cycleTimer.current = setTimeout(show, 8000);
    return () => {
      if (hideTimer.current)  clearTimeout(hideTimer.current);
      if (cycleTimer.current) clearTimeout(cycleTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setLeaving(true);
    setTimeout(() => setVisible(false), 420);
  };

  if (!visible) return null;
  const p = notifData[current];
  const action = p.gender === "f" ? "upravo naručila V380 Pro kameru" : "upravo naručio V380 Pro kameru";

  return (
    <div
      className="pnotif-wrap"
      style={{
        position: "fixed",
        bottom: 90,
        left: 24,
        zIndex: 9999,
        fontFamily: "var(--font-manrope, sans-serif)",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 14,
          padding: "14px 18px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          minWidth: 280,
          maxWidth: 320,
          position: "relative",
          animation: leaving
            ? "slideOutLeft 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : "slideInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          overflow: "hidden",
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: "#fff",
        }}>
          {p.name[0]}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1d1d1f", lineHeight: 1.3 }}>
            {p.name} iz {p.city}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6e6e73", fontWeight: 400, lineHeight: 1.3 }}>
            {action}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#aeaeb2", fontWeight: 500 }}>
            Prije nekoliko minuta
          </p>
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            position: "absolute", top: 8, right: 10,
            background: "none", border: "none",
            fontSize: 14, color: "#aeaeb2", cursor: "pointer", lineHeight: 1,
            padding: 0,
          }}
          aria-label="Zatvori"
        >
          ×
        </button>

        {/* Progress bar */}
        {!leaving && (
          <div style={{
            position: "absolute", bottom: 0, left: 0,
            height: 2, background: "#f97316",
            borderRadius: "0 0 14px 14px",
            animation: "pnotifShrink 4s linear forwards",
          }} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function MobileFloatingBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const orderEl = document.getElementById("order");
    if (!orderEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(orderEl);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    event("AddToCart", { content_name: "V380 Pro Kamera 12MP", value: UNIT_PRICE, currency: "BAM" });
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: "#1a1a1a",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        transform: hidden ? "translateY(100%)" : "translateY(0)",
        transition: "transform 0.3s ease",
        fontFamily: "var(--font-manrope, sans-serif)",
      }}
      className="sticky-bar"
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>

        {/* Price block */}
        <div>
          <span style={{ fontSize: 9, letterSpacing: "3px", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase" as const, display: "block", marginBottom: 2 }}>
            Akcijska cijena
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>129,90 KM</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "line-through", lineHeight: 1 }}>220,00 KM</span>
            <span style={{ background: "#f97316", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>-45%</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} className="sbar-divider" />

        {/* Garancija badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="sbar-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Garancija 12 mj.</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} className="sbar-divider" />

        {/* SD card badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="sbar-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ flexShrink: 0 }}>
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>SD 64GB gratis</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} className="sbar-divider" />

        {/* Pouzeće badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="sbar-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Pouzećem</span>
        </div>

      </div>

      {/* RIGHT — CTA */}
      <button
        onClick={handleClick}
        style={{
          flexShrink: 0,
          background: "#f97316",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "12px 32px",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "var(--font-manrope, sans-serif)",
          whiteSpace: "nowrap",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#ea6c0a"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#f97316"; }}
      >
        Naruči sada
      </button>
    </div>
  );
}


const reviews = [
  {
    name: "Marko T.",
    text: "Odlična kamera za cijenu. Slika je jasna, aplikacija radi savršeno. Instalacija 15 minuta.",
    date: "15. april 2026.",
  },
  {
    name: "Sanel M.",
    text: "Postavio sam je na ulaz vikendice. Noćni vid me iznenadio — vidi se sve kao danju.",
    date: "11. april 2026.",
  },
  {
    name: "Amra K.",
    text: "Naručila sam za firmu. Stigla brzo, sve radi kako treba. Sigurno naručujem još.",
    date: "8. april 2026.",
  },
];

const faqs = [
  { q: "Treba li mi poseban router?", a: "Ne. Kamera se spaja na standardni 2.4GHz WiFi bez potrebe za posebnom opremom." },
  { q: "Je li vodootporna?", a: "Da, IP66 certifikat — otporna na kišu, snijeg i prašinu. Pogodna za vanjsku montažu." },
  { q: "Može li snimati lokalno?", a: "Da, podržava microSD karticu do 128GB za lokalno snimanje bez cloud pretplate." },
  { q: "Kako naručiti?", a: "Popunite formu iznad, naš tim vas kontaktira u roku od 24h radi potvrde i dostave." },
];

// ─────────────────────────────────────────────────────────
// Star Rating
// ─────────────────────────────────────────────────────────
function Stars({ count = 5, size = 14, color = "#FF6B00" }: { count?: number; size?: number; color?: string }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────
export default function KameraClient() {
  useEffect(() => {
    event("ViewContent", {
      content_name: "V380 Pro Kamera 12MP",
      value: UNIT_PRICE,
      currency: "BAM",
    });
  }, []);

  const handleHeroCTA = () => {
    event("AddToCart", { content_name: "V380 Pro Kamera 12MP", value: UNIT_PRICE, currency: "BAM" });
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <ProductPageHeader ctaHref="#order" />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          marginTop: 68,
          background: "#f5f5f7",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          fontFamily: "var(--font-manrope, sans-serif)",
        }}
        className="hero-section"
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 60px",
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
          className="hero-inner"
        >

          {/* ── LEFT column ── */}
          <div
            style={{
              flex: "0 0 45%",
              paddingRight: 60,
              display: "flex",
              flexDirection: "column",
            }}
            className="hero-left"
          >
            {/* Label */}
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#f97316",
              marginBottom: 20,
            }}>
              VANJSKA SIGURNOST &middot; NOVO
            </span>

            {/* H1 */}
            <h1 style={{
              fontFamily: "var(--font-manrope, sans-serif)",
              fontSize: "clamp(52px, 5.5vw, 88px)",
              fontWeight: 900,
              color: "#1d1d1f",
              lineHeight: 0.95,
              letterSpacing: "-3px",
              margin: "0 0 16px",
            }}>
              V380 Pro.
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: "clamp(18px, 2vw, 24px)",
              fontWeight: 400,
              color: "#6e6e73",
              margin: "0 0 32px",
              lineHeight: 1.4,
            }}>
              Vidi sve, propusti ništa.
            </p>

            {/* Feature pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }} className="hero-pills">
              {["12MP", "Trostruko sočivo", "WiFi", "Noćni vid"].map((pill) => (
                <span key={pill} style={{
                  background: "#e8e8ed",
                  borderRadius: 99,
                  padding: "6px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1d1d1f",
                  border: "none",
                }}>
                  {pill}
                </span>
              ))}
            </div>

            {/* Price row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }} className="hero-price-row">
              <span style={{
                fontSize: 38,
                fontWeight: 800,
                color: "#f97316",
                letterSpacing: "-1px",
                fontFamily: "var(--font-manrope, sans-serif)",
                lineHeight: 1,
              }}>
                129,90 KM
              </span>
              <span style={{ fontSize: 18, color: "#aeaeb2", textDecoration: "line-through", lineHeight: 1 }}>
                220,00 KM
              </span>
              <span style={{
                background: "#f97316",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 6,
              }}>
                -45%
              </span>
            </div>

            {/* Trust line */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <Stars count={5} size={13} color="#f97316" />
              <span style={{ fontSize: 13, color: "#6e6e73" }}>
                4.8/5 &nbsp;&middot;&nbsp; Preko 500 zadovoljnih kupaca
              </span>
            </div>

            {/* Gift badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.25)",
              borderRadius: 99,
              padding: "6px 14px",
              marginBottom: 20,
              width: "fit-content",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ flexShrink: 0 }}>
                <polyline points="20 12 20 22 4 22 4 12"/>
                <rect x="2" y="7" width="20" height="5"/>
                <line x1="12" y1="22" x2="12" y2="7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316", fontFamily: "var(--font-manrope, sans-serif)" }}>
                GRATIS SD kartica 64GB uz svaku narudžbu
              </span>
            </div>

            {/* Live social proof widget */}
            <HeroSocialProof />

            {/* CTA */}
            <button
              onClick={handleHeroCTA}
              style={{
                alignSelf: "flex-start",
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 980,
                padding: "18px 48px",
                fontSize: 17,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-manrope, sans-serif)",
                transition: "opacity 0.2s",
                width: "fit-content",
                whiteSpace: "nowrap",
              }}
              className="hero-cta-btn"
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              Naruči odmah
            </button>
          </div>

          {/* ── RIGHT column ── */}
          <div
            style={{
              flex: "0 0 55%",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="hero-right"
          >
            {/* Subtle radial glow behind camera */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 60% 50% at center, rgba(249,115,22,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
              zIndex: 0,
            }} />

            {/* Camera image — floats directly on bg, no container */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/kamere.png"
              alt="V380 Pro WiFi Kamera 12MP"
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                maxWidth: 620,
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0px 40px 80px rgba(0,0,0,0.18)) drop-shadow(0px 8px 20px rgba(0,0,0,0.10))",
                transition: "transform 0.4s ease",
              }}
              className="hero-camera-img"
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            />
          </div>

        </div>
      </section>


      {/* ── STATS STRIP ──────────────────────────────────── */}
      <section style={{ background: "#fff", borderTop: "1px solid #F0F0F0", borderBottom: "1px solid #F0F0F0" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          {[
            { value: "12MP", label: "Rezolucija" },
            { value: "360°", label: "Pokrivenost" },
            { value: "IP66", label: "Vodootpornost" },
          ].map((stat, i) => (
            <div
              key={stat.value}
              style={{
                padding: "36px 24px",
                textAlign: "center",
                borderRight: i < 2 ? "1px solid #F0F0F0" : "none",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-manrope, sans-serif)",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 900,
                  color: "#0A0A0A",
                  margin: "0 0 6px",
                  letterSpacing: "-0.03em",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-manrope, sans-serif)",
                  fontSize: 13,
                  color: "#888",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* ── FEATURE SECTIONS ─────────────────────────────── */}

      {/* ── Section 1: image LEFT / text RIGHT / white ── */}
      <section style={{ display: "flex", minHeight: 520 }} className="kf-section kf-s1">
        {/* Image column */}
        <div style={{
          width: "50%", background: "#f5f5f7",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 48, flexShrink: 0,
        }} className="kf-img-col">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://kaktustore.com/cdn/shop/files/ddd_4ce88831-c747-4a3e-b766-c58910e35822.webp?v=1744288603&width=750"
            alt="Nema slijepih kutova"
            style={{ maxWidth: 500, maxHeight: 420, objectFit: "contain", width: "100%", height: "auto", display: "block" }}
          />
        </div>
        {/* Text column */}
        <div style={{
          width: "50%", background: "#ffffff",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "80px 72px", fontFamily: "var(--font-manrope, sans-serif)",
        }} className="kf-text-col">
          <span style={{ fontSize: 11, letterSpacing: "4px", fontWeight: 600, color: "#f97316", textTransform: "uppercase" as const, marginBottom: 16, display: "block" }}>VIDNO POLJE</span>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.0, color: "#1d1d1f", margin: "0 0 20px" }}>Nema slijepih kutova.</h2>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: "#6e6e73", margin: "0 0 32px", fontWeight: 400 }}>
            Tri neovisna sočiva pokrivaju cijeli prostor simultano — bez ručnog pomicanja.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["Trostruko neovisno sočivo", "360° horizontalno pokrivanje", "PTZ kontrola u realnom vremenu", "Auto-tracking pokreta"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ flexShrink: 0 }}><polyline points="20 6 9 12 4 16"/></svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#3d3d3d" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: text LEFT / image RIGHT / dark ── */}
      <section style={{ display: "flex", minHeight: 520 }} className="kf-section kf-s2">
        {/* Text column */}
        <div style={{
          width: "50%", background: "#0f0f0f",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "80px 72px", fontFamily: "var(--font-manrope, sans-serif)",
        }} className="kf-text-col">
          <span style={{ fontSize: 11, letterSpacing: "4px", fontWeight: 600, color: "#f97316", textTransform: "uppercase" as const, marginBottom: 16, display: "block" }}>NOĆNI VID</span>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.0, color: "#ffffff", margin: "0 0 20px" }}>Jasno i danju i noću.</h2>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: "rgba(255,255,255,0.6)", margin: "0 0 32px", fontWeight: 400 }}>
            Ultra HD 12MP sa naprednim IR senzorima. Oštra slika čak i pri nultoj svjetlosti.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["IR noćni vid do 30m", "Automatski dan/noć mod", "12MP Ultra HD rezolucija", "WDR tehnologija"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ flexShrink: 0 }}><polyline points="20 6 9 12 4 16"/></svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Image column */}
        <div style={{
          width: "50%", background: "#1a1a1a",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 48, flexShrink: 0,
        }} className="kf-img-col">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://kaktustore.com/cdn/shop/files/dddddddd_d66d2405-c49e-4ee9-a188-fcd812737d14.webp?v=1744288603&width=750"
            alt="Noćni vid"
            style={{ maxWidth: 500, maxHeight: 420, objectFit: "contain", width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </section>

      {/* ── Section 3: image LEFT / text RIGHT / light ── */}
      <section style={{ display: "flex", minHeight: 520 }} className="kf-section kf-s3">
        {/* Image column */}
        <div style={{
          width: "50%", background: "#f5f5f7",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 48, flexShrink: 0,
        }} className="kf-img-col">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://kaktustore.com/cdn/shop/files/dd_3b2bef0c-7e8c-42ea-95dd-fc511b23ccbe.webp?v=1744288603&width=750"
            alt="Aplikacija"
            style={{ maxWidth: 500, maxHeight: 420, objectFit: "contain", width: "100%", height: "auto", display: "block" }}
          />
        </div>
        {/* Text column */}
        <div style={{
          width: "50%", background: "#ffffff",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "80px 72px", fontFamily: "var(--font-manrope, sans-serif)",
        }} className="kf-text-col">
          <span style={{ fontSize: 11, letterSpacing: "4px", fontWeight: 600, color: "#f97316", textTransform: "uppercase" as const, marginBottom: 16, display: "block" }}>UPRAVLJANJE</span>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.0, color: "#1d1d1f", margin: "0 0 20px" }}>Kontrola s telefona.</h2>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: "#6e6e73", margin: "0 0 32px", fontWeight: 400 }}>
            Live stream, dvosmjerna komunikacija i notifikacije na Android i iOS. Bez pretplate.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["Live pregled 24/7", "Push notifikacije za pokret", "Cloud + SD snimanje", "iOS i Android"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ flexShrink: 0 }}><polyline points="20 6 9 12 4 16"/></svg>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#3d3d3d" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SD CARD PROMO BANNER ─────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea6c0a 100%)",
          padding: "32px 60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "var(--font-manrope, sans-serif)",
        }}
        className="sd-banner"
      >
        {/* Gift icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" style={{ flexShrink: 0 }}>
          <polyline points="20 12 20 22 4 22 4 12"/>
          <rect x="2" y="7" width="20" height="5"/>
          <line x1="12" y1="22" x2="12" y2="7"/>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>

        {/* Text block */}
        <div style={{ textAlign: "center" }} className="sd-banner-text">
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500, display: "block", letterSpacing: "0.02em" }}>
            Uz svaku narudžbu
          </span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", display: "block", letterSpacing: "-0.5px", lineHeight: 1.1, marginTop: 2 }}>
            GRATIS SD kartica 64GB
          </span>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.3)", margin: "0 24px", flexShrink: 0 }} className="sd-banner-sep" />

        {/* Value */}
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500, whiteSpace: "nowrap" }}>
          Vrijednost{" "}
          <span style={{ textDecoration: "line-through" }}>25,00 KM</span>
        </span>
      </div>

      {/* ── INSTALLATION STEPS ───────────────────────────── */}
      <section style={{ background: "#ffffff", padding: "100px 60px", textAlign: "center", fontFamily: "var(--font-manrope, sans-serif)" }} className="install-section">

        {/* Header */}
        <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-2px", color: "#1d1d1f", margin: "0 0 12px" }}>
          Instalacija za 5 minuta
        </h2>
        <p style={{ fontSize: 18, color: "#6e6e73", fontWeight: 400, margin: "0 auto 64px", maxWidth: 520 }}>
          Bez majstora, bez komplikacija. Sam odradiš sve.
        </p>

        {/* Steps grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, maxWidth: 1100, margin: "0 auto", position: "relative" }} className="install-grid">

          {/* Dashed connector line behind badges */}
          <div style={{
            position: "absolute",
            top: 58,
            left: "calc(12.5% + 18px)",
            right: "calc(12.5% + 18px)",
            borderTop: "2px dashed rgba(249,115,22,0.25)",
            pointerEvents: "none",
            zIndex: 0,
          }} className="install-connector" />

          {[
            {
              n: 1,
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              ),
              title: "Otvori kutiju",
              body: "Sve je unutra. Kamera, vijci, tipla, adapter i uputstvo na bosanskom.",
            },
            {
              n: 2,
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              ),
              title: "Postavi nosač",
              body: "Svrdlaj 3 rupe pomoću šablone, stavi tiplane i privini nosač. Desetak minuta posla.",
            },
            {
              n: 3,
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              ),
              title: "Preuzmi aplikaciju",
              body: "Besplatno na Google Play i App Store. Skeniraj QR kod s kamere i gotovo.",
            },
            {
              n: 4,
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                  <circle cx="12" cy="20" r="1" fill="#f97316" stroke="none"/>
                </svg>
              ),
              title: "Spoji na WiFi",
              body: "Unesi WiFi lozinku jednom i kamera se automatski spaja svaki put kad je uključena.",
            },
          ].map((step) => (
            <div
              key={step.n}
              style={{
                background: "#f9f9f9",
                border: "1px solid #efefef",
                borderRadius: 20,
                padding: "40px 28px",
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative",
                zIndex: 1,
              }}
              className="install-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Step number badge */}
              <div style={{
                width: 36, height: 36,
                background: "#f97316",
                borderRadius: "50%",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontFamily: "var(--font-manrope, sans-serif)",
              }}>
                {step.n}
              </div>

              {/* Icon */}
              <div style={{ margin: "0 auto 20px", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {step.icon}
              </div>

              {/* Title */}
              <p style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", margin: "0 0 10px", fontFamily: "var(--font-manrope, sans-serif)" }}>
                {step.title}
              </p>

              {/* Body */}
              <p style={{ fontSize: 14, color: "#6e6e73", lineHeight: 1.6, fontWeight: 400, margin: 0, fontFamily: "var(--font-manrope, sans-serif)" }}>
                {step.body}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* ── ORDER FORM ───────────────────────────────────── */}
      <section id="order" style={{ background: "#F5F5F5", padding: "80px 0" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px" }}>
          <h2
            style={{
              fontFamily: "var(--font-manrope, sans-serif)",
              fontSize: "clamp(22px, 4vw, 30px)",
              fontWeight: 800,
              color: "#0A0A0A",
              marginBottom: 32,
            }}
          >
            Naruči <span style={{ color: "#FF6B00" }}>odmah</span>
          </h2>
          <CameraOrderForm />
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────── */}
      <section style={{ background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "80px 24px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p
              style={{
                fontFamily: "var(--font-manrope, sans-serif)",
                fontSize: "clamp(40px, 6vw, 64px)",
                fontWeight: 900,
                color: "#0A0A0A",
                margin: "0 0 10px",
                letterSpacing: "-0.04em",
              }}
            >
              4.9 / 5
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 8 }}>
              <Stars count={5} />
            </div>
            <p
              style={{
                fontFamily: "var(--font-manrope, sans-serif)",
                fontSize: 14,
                color: "#888",
                margin: 0,
              }}
            >
              141 recenzija
            </p>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
            className="reviews-grid"
          >
            {reviews.map((r) => (
              <div
                key={r.name}
                style={{
                  background: "#F9F9F9",
                  borderRadius: 16,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <Stars />
                <p
                  style={{
                    fontFamily: "var(--font-manrope, sans-serif)",
                    fontSize: 15,
                    color: "#0A0A0A",
                    lineHeight: 1.65,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-manrope, sans-serif)",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0A0A0A",
                    }}
                  >
                    {r.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-manrope, sans-serif)",
                      fontSize: 12,
                      color: "#aaa",
                    }}
                  >
                    {r.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section style={{ background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>
          <h2
            style={{
              fontFamily: "var(--font-manrope, sans-serif)",
              fontSize: "clamp(22px, 4vw, 30px)",
              fontWeight: 800,
              color: "#0A0A0A",
              marginBottom: 40,
            }}
          >
            Često <span style={{ color: "#FF6B00" }}>postavljena</span> pitanja
          </h2>
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            {faqs.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Purchase notification popup */}
      <PurchaseNotif />

      {/* Mobile floating bar */}
      <MobileFloatingBar />

      {/* Responsive styles */}
      <style suppressHydrationWarning>{`
        /* ── Order success — mobile ── */
        @media (max-width: 640px) {
          .success-cards {
            flex-direction: column !important;
            align-items: stretch !important;
            width: 100% !important;
          }
          .success-cards > div {
            min-width: unset !important;
          }
        }

        /* ── Purchase notification animations ── */
        @keyframes slideInLeft {
          from { transform: translateX(-120%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0);     opacity: 1; }
          to   { transform: translateX(-120%); opacity: 0; }
        }
        @keyframes pnotifShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @media (max-width: 640px) {
          .pnotif-wrap {
            bottom: 80px !important;
            left: 12px !important;
            right: 12px !important;
          }
          .pnotif-wrap > div {
            min-width: unset !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }

        /* ── Social proof animations ── */
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%       { opacity: 0.8; transform: scale(1.3); box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        .live-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          background: #22c55e;
          border-radius: 50%;
          animation: livePulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes numFlash {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.2); color: #f97316; }
          100% { transform: scale(1); }
        }
        .numFlash {
          animation: numFlash 0.4s ease forwards;
        }
      `}</style>
      <style suppressHydrationWarning>{`
        /* ── HERO — mobile (≤768px) ── */
        @media (max-width: 768px) {
          .hero-section {
            align-items: flex-start !important;
            min-height: unset !important;
          }
          .hero-inner {
            flex-direction: column !important;
            padding: 48px 24px !important;
            gap: 0 !important;
          }
          .hero-right {
            flex: none !important;
            width: 100% !important;
            order: -1 !important;
            margin-bottom: 32px !important;
            justify-content: center !important;
          }
          .hero-camera-img {
            max-width: 85vw !important;
          }
          .hero-left {
            flex: none !important;
            width: 100% !important;
            padding-right: 0 !important;
            align-items: center !important;
            text-align: center !important;
          }
          .hero-pills {
            justify-content: center !important;
          }
          .hero-price-row {
            justify-content: center !important;
          }
          .hero-cta-btn {
            align-self: stretch !important;
            text-align: center !important;
            width: 100% !important;
          }
          .hero-social-proof {
            font-size: 12px !important;
            padding: 8px 14px !important;
            gap: 10px !important;
            align-self: center !important;
          }
        }

        /* ── HERO — tablet (768px–1024px) ── */
        @media (min-width: 768px) and (max-width: 1024px) {
          .hero-inner {
            padding: 0 32px !important;
          }
          .hero-left {
            padding-right: 32px !important;
          }
          .hero-camera-img {
            max-width: 480px !important;
          }
          .hero-social-proof {
            padding: 8px 16px !important;
          }
        }

        /* ── Feature sections — tablet + mobile (≤900px) ── */
        @media (max-width: 900px) {
          .kf-section {
            flex-direction: column !important;
            min-height: unset !important;
          }
          .kf-img-col {
            width: 100% !important;
            height: 300px !important;
            padding: 24px !important;
            order: -1 !important;
          }
          .kf-img-col img {
            max-height: 260px !important;
          }
          .kf-s2 .kf-img-col {
            order: -1 !important;
          }
          .kf-text-col {
            width: 100% !important;
            padding: 48px 32px !important;
          }
        }

        /* ── Feature sections — mobile (≤480px) ── */
        @media (max-width: 480px) {
          .kf-img-col {
            height: 240px !important;
          }
          .kf-img-col img {
            max-height: 200px !important;
          }
          .kf-text-col {
            padding: 36px 20px !important;
          }
          .kf-text-col h2 {
            font-size: 28px !important;
            letter-spacing: -1px !important;
          }
          .kf-text-col p {
            font-size: 16px !important;
          }
        }

        /* ── Sticky bar — mobile (<640px) ── */
        @media (max-width: 640px) {
          .sticky-bar {
            padding: 0 16px !important;
          }
          .sbar-badge {
            display: none !important;
          }
          .sbar-divider {
            display: none !important;
          }
          .sticky-bar button {
            font-size: 14px !important;
            padding: 10px 20px !important;
          }
        }

        /* ── SD promo banner — mobile ── */
        @media (max-width: 640px) {
          .sd-banner {
            flex-direction: column !important;
            padding: 24px 20px !important;
            gap: 12px !important;
            text-align: center !important;
          }
          .sd-banner-sep {
            display: none !important;
          }
        }

        /* ── Installation steps — tablet (600–900px) ── */
        @media (max-width: 900px) and (min-width: 600px) {
          .install-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .install-connector {
            display: none !important;
          }
        }

        /* ── Installation steps — mobile (<600px) ── */
        @media (max-width: 599px) {
          .install-section {
            padding: 64px 20px !important;
          }
          .install-grid {
            grid-template-columns: 1fr !important;
          }
          .install-card {
            padding: 32px 24px !important;
          }
          .install-connector {
            display: none !important;
          }
        }

        /* ── Other sections — mobile ── */
        @media (max-width: 768px) {
          .reviews-grid {
            grid-template-columns: 1fr !important;
          }
          .form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
