"use client";

import { useState, useRef, FormEvent } from "react";
import { ChevronRight, Truck, CreditCard, RotateCcw } from "lucide-react";
import { event } from "@/lib/fbpixel";
import OrderSuccess from "@/components/OrderSuccess";

const ACCENT = "#FF6B00";

const TRUST_ITEMS = [
  { Icon: Truck,      title: "Dostava 10,00 KM",  desc: "Cijela BiH — 1–3 radna dana"  },
  { Icon: CreditCard, title: "Plaćanje pouzećem",  desc: "Platite pri preuzimanju"       },
  { Icon: RotateCcw,  title: "Povrat 14 dana",     desc: "Bez pitanja i bez troškova"   },
];

interface FormData {
  ime:      string;
  telefon:  string;
  adresa:   string;
  grad:     string;
  napomena: string;
}

export default function OrderForm() {
  const [formData, setFormData] = useState<FormData>({
    ime: "", telefon: "", adresa: "", grad: "", napomena: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const checkoutTracked = useRef(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { ime, telefon, adresa, grad } = formData;
    if (!ime.trim() || !telefon.trim() || !adresa.trim() || !grad.trim()) {
      setError("Molimo popunite sva obavezna polja.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/brusilica-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Greška pri slanju narudžbe.");

      event("Purchase", { content_name: "Akumulatorska Brusilica", value: 74.9, currency: "BAM" });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E5E2DC", boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}>
        <OrderSuccess />
      </div>
    );
  }

  // Shared input styles (light theme)
  const inputBase: React.CSSProperties = {
    border:     "1.5px solid #E5E2DC",
    background: "#FAFAF8",
    color:      "#1a1a1a",
  };

  function onFocusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = ACCENT;
    e.target.style.background  = "#fff";
  }
  function onBlurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "#E5E2DC";
    e.target.style.background  = "#FAFAF8";
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

      {/* ── Form ──────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-3 bg-white rounded-2xl p-8"
        style={{ border: "1px solid #E5E2DC" }}
        onFocus={() => {
          if (!checkoutTracked.current) {
            checkoutTracked.current = true;
            event("InitiateCheckout", { value: 74.9, currency: "BAM" });
          }
        }}
      >
        <h3 className="font-extrabold text-[#1a1a1a] text-2xl mb-6 tracking-tight">
          Podaci za dostavu
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

          {/* Ime */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Ime i prezime *
            </label>
            <input
              name="ime" value={formData.ime} onChange={handleChange}
              onFocus={onFocusInput} onBlur={onBlurInput}
              placeholder="npr. Emir Hadžić" autoComplete="name"
              className="w-full rounded-xl px-4 py-3 text-sm placeholder-[#bbb] outline-none transition-all duration-150"
              style={inputBase}
            />
          </div>

          {/* Telefon */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Broj telefona *
            </label>
            <input
              name="telefon" type="tel" value={formData.telefon} onChange={handleChange}
              onFocus={onFocusInput} onBlur={onBlurInput}
              placeholder="npr. 061 123 456" autoComplete="tel"
              className="w-full rounded-xl px-4 py-3 text-sm placeholder-[#bbb] outline-none transition-all duration-150"
              style={inputBase}
            />
          </div>

          {/* Grad */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Grad *
            </label>
            <input
              name="grad" value={formData.grad} onChange={handleChange}
              onFocus={onFocusInput} onBlur={onBlurInput}
              placeholder="npr. Sarajevo" autoComplete="address-level2"
              className="w-full rounded-xl px-4 py-3 text-sm placeholder-[#bbb] outline-none transition-all duration-150"
              style={inputBase}
            />
          </div>

          {/* Adresa */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Adresa dostave *
            </label>
            <input
              name="adresa" value={formData.adresa} onChange={handleChange}
              onFocus={onFocusInput} onBlur={onBlurInput}
              placeholder="npr. Titova 12" autoComplete="street-address"
              className="w-full rounded-xl px-4 py-3 text-sm placeholder-[#bbb] outline-none transition-all duration-150"
              style={inputBase}
            />
          </div>

          {/* Napomena */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Napomena{" "}
              <span className="normal-case font-normal text-[#ccc]">(opciono)</span>
            </label>
            <textarea
              name="napomena" value={formData.napomena} onChange={handleChange}
              onFocus={onFocusInput} onBlur={onBlurInput}
              placeholder="Posebne instrukcije za dostavu ili ostale napomene..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm placeholder-[#bbb] outline-none transition-all duration-150 resize-none"
              style={inputBase}
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
          style={{ background: loading ? "#cc5500" : ACCENT, opacity: loading ? 0.8 : 1, cursor: loading ? "not-allowed" : "pointer" }}
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
              <ChevronRight size={18} strokeWidth={2.5} />
            </>
          )}
        </button>

        <p className="text-center text-[#bbb] text-xs mt-3">
          Plaćanje pouzećem · Bez skrivenih troškova
        </p>
      </form>

      {/* ── Summary ───────────────────────────────────────────── */}
      <div className="lg:col-span-2 flex flex-col gap-4">

        {/* Order card */}
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E5E2DC" }}>
          <h4 className="text-[#aaa] font-bold text-xs uppercase tracking-[0.15em] mb-5">
            Sažetak narudžbe
          </h4>

          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm text-[#888]">Proizvod</span>
              <span className="text-sm font-semibold text-[#1a1a1a] text-right">Akumulatorska Brusilica</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm text-[#888]">Komplet</span>
              <span className="text-xs font-medium text-[#aaa] text-right max-w-[160px]">
                2× baterija, punjač, HD kaseta
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#888]">Cijena</span>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>74,90 KM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#888]">Dostava</span>
              <span className="text-sm font-semibold text-[#1a1a1a]">10,00 KM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#888]">Plaćanje</span>
              <span className="text-sm font-semibold text-[#1a1a1a]">Pouzećem</span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: "#E5E2DC" }}>
              <span className="text-base font-bold text-[#1a1a1a]">Ukupno</span>
              <span className="font-extrabold leading-none" style={{ fontSize: 28, color: ACCENT }}>
                84,90 KM
              </span>
            </div>
          </div>
        </div>

        {/* Trust cards */}
        {TRUST_ITEMS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ border: "1px solid #E5E2DC" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,107,0,0.07)", color: ACCENT }}
            >
              <Icon size={18} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">{title}</p>
              <p className="text-xs text-[#aaa]">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
