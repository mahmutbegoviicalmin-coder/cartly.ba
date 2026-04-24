"use client";

import { useState, useRef, FormEvent } from "react";
import { event } from "@/lib/fbpixel";
import OrderSuccess from "@/components/OrderSuccess";

const ACCENT     = "#FF6B00";
const UNIT_PRICE = 59.9;
const DELIVERY   = 10.0;

function fmtKM(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

export default function OrderForm() {
  const [form, setForm] = useState({
    ime: "", telefon: "", adresa: "", grad: "", kolicina: "1",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const checkoutTracked = useRef(false);

  const qty      = Math.max(1, Math.min(5, Number(form.kolicina) || 1));
  const subtotal = qty * UNIT_PRICE;
  const total    = subtotal + DELIVERY;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { ime, telefon, adresa, grad } = form;
    if (!ime.trim() || !telefon.trim() || !adresa.trim() || !grad.trim()) {
      setError("Molimo popunite sva obavezna polja.");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/order-zvucnik", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, kolicina: qty }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Greška.");
      event("Purchase", {
        content_name: "ZQS-6239 Bluetooth Zvučnik",
        value:        total,
        currency:     "BAM",
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Greška pri slanju. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <OrderSuccess />;
  }

  const labelCls = "text-gray-500 text-xs font-semibold uppercase tracking-wider";
  const inputCls = [
    "w-full rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300",
    "outline-none transition-all duration-150",
    "bg-white border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
  ].join(" ");

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      onFocus={() => {
        if (!checkoutTracked.current) {
          checkoutTracked.current = true;
          event("InitiateCheckout", { value: total, currency: "BAM" });
        }
      }}
    >

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className={labelCls}>Ime i prezime *</label>
          <input name="ime" value={form.ime} onChange={handleChange} placeholder="npr. Amar Hadžić" autoComplete="name" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Broj telefona *</label>
          <input name="telefon" value={form.telefon} onChange={handleChange} placeholder="061 123 456" autoComplete="tel" type="tel" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Grad *</label>
          <input name="grad" value={form.grad} onChange={handleChange} placeholder="npr. Sarajevo" autoComplete="address-level2" className={inputCls} />
        </div>
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className={labelCls}>Adresa dostave *</label>
          <input name="adresa" value={form.adresa} onChange={handleChange} placeholder="npr. Titova 12" autoComplete="street-address" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Količina</label>
          <select name="kolicina" value={form.kolicina} onChange={handleChange} className={inputCls + " cursor-pointer bg-white"}>
            {[1,2,3,4,5].map(n => (
              <option key={n} value={n}>{n}×</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price summary */}
      <div className="rounded-xl p-4 flex flex-col gap-2 bg-gray-50 border border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Cijena ({qty}×)</span>
          <span className="text-gray-900 font-medium">{fmtKM(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Dostava · Brza Pošta</span>
          <span className="text-gray-900 font-medium">{fmtKM(DELIVERY)}</span>
        </div>
        <div className="h-px bg-gray-200 my-1" />
        <div className="flex justify-between items-center">
          <span className="text-gray-900 font-semibold">Ukupno</span>
          <span className="font-bold text-xl" style={{ color: ACCENT }}>{fmtKM(total)}</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">Plaćanje pouzećem pri preuzimanju</p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2.5 transition-opacity"
        style={{ background: loading ? "#cc5500" : ACCENT, opacity: loading ? 0.8 : 1, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Slanje...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Naruči odmah — {fmtKM(total)}
          </>
        )}
      </button>
    </form>
  );
}
