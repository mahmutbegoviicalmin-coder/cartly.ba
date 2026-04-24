"use client";

import { useState, FormEvent, useRef } from "react";
import Image from "next/image";
import { event } from "@/lib/fbpixel";
import SizeGuideModal from "./SizeGuideModal";
import OrderSuccess from "./OrderSuccess";

const SIZES = [39, 40, 41, 42, 43, 44, 45, 46, 47];
const PRICE_PER_PAIR = 59.9;
const DELIVERY = 10.0;

type SizeQuantities = Record<number, number>;
type Fields = { name: string; phone: string; address: string; city: string };
type FieldErrors = Partial<Record<keyof Fields | "sizes", string>>;

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

function InputField({
  id, label, type = "text", autoComplete, placeholder, value, onChange, error,
}: {
  id: keyof Fields; label: string; type?: string; autoComplete?: string;
  placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0A" }}>
        {label}
      </label>
      <input
        id={id} name={id} type={type} autoComplete={autoComplete}
        placeholder={placeholder} value={value} onChange={onChange}
        style={{
          background: "#F9F9F9",
          border: `1px solid ${error ? "#ef4444" : "#E5E5E5"}`,
          borderRadius: 8,
          padding: "14px 16px",
          fontSize: 15,
          fontFamily: "var(--font-manrope), sans-serif",
          outline: "none",
          transition: "border-color 0.15s",
          width: "100%",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6B00"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? "#ef4444" : "#E5E5E5"; }}
      />
      {error && <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>}
    </div>
  );
}

export default function OrderForm() {
  const [fields, setFields] = useState<Fields>({ name: "", phone: "", address: "", city: "" });
  const [quantities, setQuantities] = useState<SizeQuantities>(
    Object.fromEntries(SIZES.map((s) => [s, 0]))
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const checkoutTracked = useRef(false);

  const totalPairs = Object.values(quantities).reduce((a, b) => a + b, 0);
  const productTotal = totalPairs * PRICE_PER_PAIR;
  const grandTotal = totalPairs > 0 ? productTotal + DELIVERY : 0;
  const selectedSizes = SIZES.filter((s) => quantities[s] > 0);

  const changeQty = (size: number, delta: number) => {
    setQuantities((prev) => ({ ...prev, [size]: Math.max(0, (prev[size] ?? 0) + delta) }));
    if (errors.sizes) setErrors((e) => ({ ...e, sizes: undefined }));
  };

  const handleField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Fields]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!fields.name.trim()) e.name = "Unesite ime i prezime";
    if (!fields.phone.trim()) e.phone = "Unesite broj telefona";
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(fields.phone)) e.phone = "Neispravan broj telefona";
    if (!fields.address.trim()) e.address = "Unesite adresu";
    if (!fields.city.trim()) e.city = "Unesite grad";
    if (totalPairs === 0) e.sizes = "Odaberite najmanje jedan par";
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ime: fields.name,
          telefon: fields.phone,
          adresa: fields.address,
          grad: fields.city,
          velicine: SIZES.map((s) => ({ velicina: s, kolicina: quantities[s] ?? 0 })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        event("Purchase", {
          value: grandTotal,
          currency: "BAM",
          content_name: "Radne Patike S3 Tactical Black",
        });
        setSubmitted(true);
      } else {
        setServerError(data.error ?? "Greška pri slanju narudžbe. Pokušajte ponovo.");
      }
    } catch {
      setServerError("Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="order" style={{ backgroundColor: "#F5F5F5", padding: "48px 0" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 24px rgba(0,0,0,0.06)" }}>
            <OrderSuccess />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
    <section id="order" style={{ backgroundColor: "#F5F5F5", padding: "80px 0" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Section heading */}
        <h2 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 800, color: "#0A0A0A", marginBottom: 32 }}>
          Naruči <span style={{ color: "#FF6B00" }}>odmah</span>
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── LEFT COLUMN ── */}
            <div style={{ flex: "1 1 60%" }} className="flex flex-col gap-5">

              {/* Personal data card */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32 }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#0A0A0A", marginBottom: 24 }}>
                  Vaši podaci
                </p>

                {/* 2×2 grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}
                  onFocus={() => {
                    if (!checkoutTracked.current) {
                      checkoutTracked.current = true;
                      event("InitiateCheckout", { value: 59.90, currency: "BAM" });
                    }
                  }}
                >
                  <InputField id="name" label="Ime i prezime" autoComplete="name" placeholder="npr. Emir Hadžić" value={fields.name} onChange={handleField} error={errors.name} />
                  <InputField id="phone" label="Broj telefona" type="tel" autoComplete="tel" placeholder="npr. 061 123 456" value={fields.phone} onChange={handleField} error={errors.phone} />
                  <InputField id="address" label="Adresa" autoComplete="street-address" placeholder="npr. Ferhadija 12" value={fields.address} onChange={handleField} error={errors.address} />
                  <InputField id="city" label="Grad" autoComplete="address-level2" placeholder="npr. Sarajevo" value={fields.city} onChange={handleField} error={errors.city} />
                </div>
              </div>

              {/* Size table card */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: "#0A0A0A", margin: 0 }}>
                    Odaberite veličinu i količinu
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {errors.sizes && (
                      <span style={{ fontSize: 12, color: "#ef4444" }}>{errors.sizes}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      style={{
                        fontSize: 13, color: "#FF6B00", fontWeight: 500,
                        background: "none", border: "none", cursor: "pointer",
                        padding: 0, fontFamily: "var(--font-manrope), sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Nisi siguran koja veličina? →
                    </button>
                  </div>
                </div>

                <div style={{ border: `1px solid ${errors.sizes ? "#ef4444" : "#E5E5E5"}`, borderRadius: 10, overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#F5F5F5", padding: "10px 16px", borderBottom: "1px solid #E5E5E5" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em" }}>Veličina</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Količina</span>
                  </div>

                  {SIZES.map((size, i) => {
                    const qty = quantities[size];
                    const active = qty > 0;
                    return (
                      <div
                        key={size}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          alignItems: "center",
                          padding: "12px 16px",
                          borderBottom: i < SIZES.length - 1 ? "1px solid #F0F0F0" : "none",
                          background: active ? "rgba(255,107,0,0.06)" : "#fff",
                          transition: "background 0.15s",
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 600, color: active ? "#FF6B00" : "#0A0A0A" }}>
                          EU {size}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => changeQty(size, -1)}
                            disabled={qty === 0}
                            aria-label={`Smanji količinu za EU ${size}`}
                            style={{
                              width: 32, height: 32, border: "1px solid",
                              borderColor: qty === 0 ? "#E5E5E5" : "#ccc",
                              borderRadius: 6, background: "#fff",
                              color: qty === 0 ? "#ccc" : "#0A0A0A",
                              fontSize: 16, fontWeight: 500,
                              cursor: qty === 0 ? "not-allowed" : "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                          >−</button>
                          <span style={{ width: 24, textAlign: "center", fontSize: 14, fontWeight: 700, color: active ? "#FF6B00" : "#0A0A0A" }}>
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQty(size, 1)}
                            aria-label={`Povećaj količinu za EU ${size}`}
                            style={{
                              width: 32, height: 32, border: "1px solid #ccc",
                              borderRadius: 6, background: "#fff",
                              color: "#0A0A0A", fontSize: 16, fontWeight: 500,
                              cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                          >+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN — ORDER SUMMARY ── */}
            <div style={{ flex: "1 1 40%" }} className="w-full lg:sticky lg:top-20">
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Product info */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", background: "#F5F5F5", flexShrink: 0, position: "relative" }}>
                    <Image src="/images/product-1.webp" alt="Radne Patike S3" fill style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A", margin: 0, lineHeight: 1.3 }}>Radne Patike S3</p>
                    <p style={{ fontSize: 13, color: "#999", margin: "3px 0 0", lineHeight: 1.3 }}>Tactical Black</p>
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #F0F0F0", margin: 0 }} />

                {/* Selected sizes */}
                <div style={{ minHeight: 40 }}>
                  {selectedSizes.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#aaa", fontStyle: "italic", margin: 0 }}>
                      Još niste odabrali veličinu
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {selectedSizes.map((size) => (
                        <div key={size} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                          <span style={{ color: "#0A0A0A", fontWeight: 500 }}>EU {size}</span>
                          <span style={{ color: "#666" }}>{quantities[size]}× — {fmt(quantities[size] * PRICE_PER_PAIR)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #F0F0F0", margin: 0 }} />

                {/* Pricing */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "#666" }}>Cijena po paru</span>
                    <span style={{ color: "#0A0A0A", fontWeight: 500 }}>59,90 KM</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "#666" }}>Dostava</span>
                    <span style={{ color: "#0A0A0A", fontWeight: 500 }}>10,00 KM</span>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #F0F0F0", margin: "4px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A" }}>Ukupno</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#FF6B00" }}>
                      {totalPairs > 0 ? fmt(grandTotal) : "—"}
                    </span>
                  </div>
                </div>

                {/* Server error */}
                {serverError && (
                  <p style={{ fontSize: 13, color: "#ef4444", textAlign: "center", margin: 0 }}>
                    {serverError}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", background: loading ? "#ccc" : "#FF6B00", color: "#fff",
                    border: "none", borderRadius: 10, padding: "16px",
                    fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-manrope), sans-serif",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#e05e00"; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#FF6B00"; }}
                >
                  {loading ? "Slanje..." : totalPairs > 0 ? `Naruči — ${fmt(grandTotal)}` : "Naruči odmah"}
                </button>

                <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", margin: 0, lineHeight: 1.5 }}>
                  Plaćanje pouzećem &bull; Euro Express &bull; 1–3 radna dana
                </p>

                {/* Trust icons */}
                <div style={{ display: "flex", gap: 16, justifyContent: "center", paddingTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span style={{ fontSize: 12, color: "#666" }}>Sigurna narudžba</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                      <path d="M16.5 9.4 7.55 4.24" />
                      <polyline points="3.29 7 12 12 20.71 7" />
                      <line x1="12" y1="22" x2="12" y2="12" />
                      <circle cx="18.5" cy="15.5" r="2.5" />
                      <path d="M20.27 17.27 22 19" />
                    </svg>
                    <span style={{ fontSize: 12, color: "#666" }}>Brza dostava</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </form>
      </div>
    </section>

    {sizeGuideOpen && (
      <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />
    )}
    </>
  );
}
