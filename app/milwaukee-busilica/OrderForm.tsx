"use client";

import { useState, useRef, FormEvent } from "react";
import { ChevronRight } from "lucide-react";
import { event } from "@/lib/fbpixel";
import OrderSuccess from "@/components/OrderSuccess";

const ACCENT = "#E8460A";
const BEBAS: React.CSSProperties = { fontFamily: "var(--font-manrope, sans-serif)" };

interface FormData {
  ime: string;
  adresa: string;
  grad: string;
  telefon: string;
}

export default function OrderForm() {
  const [formData, setFormData] = useState<FormData>({
    ime: "",
    adresa: "",
    grad: "",
    telefon: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkoutTracked = useRef(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { ime, adresa, grad, telefon } = formData;
    if (!ime.trim() || !adresa.trim() || !grad.trim() || !telefon.trim()) {
      setError("Molimo popunite sva polja.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/narudzba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime, adresa, grad, telefon }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Greška pri slanju narudžbe.");
      }
      event("Purchase", {
        content_name: "Milwaukee M18 Bušilica",
        value:        69.90,
        currency:     "BAM",
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}>
        <OrderSuccess />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

      {/* ─── Forma ─────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-3 bg-white rounded-2xl p-8"
        style={{ border: "1px solid #E5E2DC" }}
        onFocus={() => {
          if (!checkoutTracked.current) {
            checkoutTracked.current = true;
            event("InitiateCheckout", { value: 69.90, currency: "BAM" });
          }
        }}
      >
        <h3
          className="text-[#1a1a1a] mb-6"
          style={{ ...BEBAS, fontSize: 28 }}
        >
          PODACI ZA DOSTAVU
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Ime i prezime */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Ime i prezime *
            </label>
            <input
              name="ime"
              value={formData.ime}
              onChange={handleChange}
              placeholder="npr. Emir Hadžić"
              autoComplete="name"
              className="w-full rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#bbb] outline-none transition-all duration-150"
              style={{
                border: "1.5px solid #E5E2DC",
                background: "#FAFAF8",
              }}
              onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E5E2DC"; e.target.style.background = "#FAFAF8"; }}
            />
          </div>

          {/* Adresa */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Adresa *
            </label>
            <input
              name="adresa"
              value={formData.adresa}
              onChange={handleChange}
              placeholder="npr. Titova 12"
              autoComplete="street-address"
              className="w-full rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#bbb] outline-none transition-all duration-150"
              style={{
                border: "1.5px solid #E5E2DC",
                background: "#FAFAF8",
              }}
              onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E5E2DC"; e.target.style.background = "#FAFAF8"; }}
            />
          </div>

          {/* Grad */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Grad *
            </label>
            <input
              name="grad"
              value={formData.grad}
              onChange={handleChange}
              placeholder="npr. Sarajevo"
              autoComplete="address-level2"
              className="w-full rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#bbb] outline-none transition-all duration-150"
              style={{
                border: "1.5px solid #E5E2DC",
                background: "#FAFAF8",
              }}
              onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E5E2DC"; e.target.style.background = "#FAFAF8"; }}
            />
          </div>

          {/* Telefon */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Telefon *
            </label>
            <input
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              placeholder="npr. 061 123 456"
              autoComplete="tel"
              type="tel"
              className="w-full rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#bbb] outline-none transition-all duration-150"
              style={{
                border: "1.5px solid #E5E2DC",
                background: "#FAFAF8",
              }}
              onFocus={(e) => { e.target.style.borderColor = ACCENT; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E5E2DC"; e.target.style.background = "#FAFAF8"; }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)" }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 text-white font-bold text-base py-4 rounded-full transition-all duration-150"
          style={{
            background: loading ? "#c0392b" : ACCENT,
            opacity: loading ? 0.8 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Slanje narudžbe...
            </>
          ) : (
            <>
              Potvrdi narudžbu
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-[#bbb] text-xs mt-3">
          Plaćanje pouzećem · Bez skrivenih troškova
        </p>
      </form>

      {/* ─── Sažetak ───────────────────────────────────────────── */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Proizvod kartica */}
        <div
          className="bg-white rounded-2xl p-6"
          style={{ border: "1px solid #E5E2DC" }}
        >
          <h4
            className="text-[#888] mb-4"
            style={{ ...BEBAS, fontSize: 14, letterSpacing: "0.15em" }}
          >
            SAŽETAK NARUDŽBE
          </h4>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">Proizvod</span>
              <span className="text-sm font-semibold text-[#1a1a1a] text-right max-w-[160px]">Milwaukee M18 Bušilica</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">Cijena</span>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>69,90 KM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">Dostava</span>
              <span className="text-sm font-semibold text-[#1a1a1a]">10,00 KM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">Plaćanje</span>
              <span className="text-sm font-semibold text-[#1a1a1a]">Pouzećem</span>
            </div>
            <div
              className="border-t pt-3 flex items-center justify-between"
              style={{ borderColor: "#E5E2DC" }}
            >
              <span className="text-base font-bold text-[#1a1a1a]">Ukupno</span>
              <span
                className="leading-none"
                style={{ ...BEBAS, fontSize: 28, color: ACCENT }}
              >
                79,90 KM
              </span>
            </div>
          </div>
        </div>

        {/* Trust kartice */}
        {([
          {
            svg: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8l4-2v10l-4-2" />
              </svg>
            ),
            title: "Dostava 10,00 KM",
            desc: "Cijela BiH — 24–48h",
          },
          {
            svg: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            ),
            title: "Plaćanje pouzećem",
            desc: "Platite pri preuzimanju",
          },
          {
            svg: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            ),
            title: "Povrat 14 dana",
            desc: "Bez pitanja i bez troškova",
          },
        ] as { svg: React.ReactNode; title: string; desc: string }[]).map(({ svg, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ border: "1px solid #E5E2DC" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(232,70,10,0.07)", color: ACCENT }}
            >
              {svg}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">{title}</p>
              <p className="text-xs text-[#888]">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
