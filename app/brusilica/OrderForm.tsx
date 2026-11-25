"use client";

import { useState, FormEvent } from "react";
import { AlertCircle, ArrowRight, Check, CreditCard, Lock, Truck } from "lucide-react";
import { event } from "@/lib/fbpixel";
import GiftAddon from "@/components/GiftAddon";
import { GIFT_PRICE } from "@/lib/gift";
import { BlackNovemberCartNote } from "@/components/store/BlackNovember";

const RED = "#CC0000";
const PRICE = 74.9;
const SHIPPING = 10;

const km = (n: number) => `${n.toFixed(2).replace(".", ",")}\u00a0KM`;

const FIELDS = [
  { name: "ime",            label: "Ime i prezime",  placeholder: "npr. Emir Hadžić", type: "text", autoComplete: "name",           span: 2 },
  { name: "adresa",         label: "Adresa dostave", placeholder: "npr. Titova 12",   type: "text", autoComplete: "street-address", span: 2 },
  { name: "postanski_broj", label: "Poštanski broj", placeholder: "npr. 71000",       type: "text", autoComplete: "postal-code",    span: 1, inputMode: "numeric" },
  { name: "grad",           label: "Grad",           placeholder: "npr. Sarajevo",    type: "text", autoComplete: "address-level2", span: 1 },
  { name: "telefon",        label: "Broj telefona",  placeholder: "npr. 061 123 456", type: "tel",  autoComplete: "tel",            span: 2 },
] as const;

type FormState = { ime: string; adresa: string; postanski_broj: string; grad: string; telefon: string };

interface Props {
  /** Fires InitiateCheckout once (shared with the page CTAs). */
  onFirstInteraction: () => void;
  onSuccess: () => void;
}

export default function OrderForm({ onFirstInteraction, onSuccess }: Props) {
  const [form,    setForm]    = useState<FormState>({ ime: "", adresa: "", postanski_broj: "", grad: "", telefon: "" });
  const [gift,    setGift]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const total = PRICE + SHIPPING + (gift ? GIFT_PRICE : 0);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.name === "postanski_broj"
      ? e.target.value.replace(/\D/g, "").slice(0, 5)
      : e.target.value;
    setForm(p => ({ ...p, [e.target.name]: value }));
    if (error) setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { ime, adresa, postanski_broj, grad, telefon } = form;
    if (!ime.trim() || !adresa.trim() || !postanski_broj.trim() || !grad.trim() || !telefon.trim()) { setError("Molimo popunite sva obavezna polja."); return; }
    if (!/^[0-9+\s\-()]{6,}$/.test(telefon.trim())) { setError("Unesite ispravan broj telefona."); return; }
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/brusilica-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ime, adresa: `${adresa}, ${postanski_broj} ${grad}`, grad, telefon, poklon: gift, externalId: (() => { try { return localStorage.getItem("_crt_eid") || ""; } catch { return ""; } })() }) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Greška pri slanju.");
      event("Purchase", { content_name: "Akumulatorska Brusilica M18 Set", content_ids: ["brusilica-m18-set"], content_type: "product", value: 84.9 + (gift ? GIFT_PRICE : 0), currency: "BAM" }, json.orderNumber);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally { setLoading(false); }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      {/* ── Form ─────────────────────────────────────────── */}
      <form
        onSubmit={onSubmit}
        onFocus={onFirstInteraction}
        noValidate
        className="rounded-[28px] bg-white p-5 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)]"
      >
        <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">Podaci za dostavu</h3>
        <p className="mt-1 text-[14px] text-[#6E6E73]">Ništa ne plaćate unaprijed.</p>

        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4">
          {FIELDS.map(f => (
            <label key={f.name} className={f.span === 2 ? "col-span-2" : "col-span-1 min-w-0"}>
              <span className="mb-1.5 block text-[13px] font-medium text-[#424245]">{f.label}</span>
              <input
                name={f.name}
                type={f.type}
                value={form[f.name]}
                onChange={onChange}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                inputMode={"inputMode" in f ? f.inputMode : undefined}
                required
                className="brs-input h-[52px] w-full min-w-0 rounded-[14px] border border-[#D2D2D7] bg-white px-4 text-[16px] text-[#1D1D1F] outline-none transition-[border-color,box-shadow] placeholder:text-[#A1A1A6] focus:border-[#1D1D1F] focus:shadow-[0_0_0_4px_rgba(0,0,0,0.06)]"
              />
            </label>
          ))}
        </div>

        {error && (
          <div role="alert" className="mt-4 flex items-center gap-2.5 rounded-[14px] bg-[#CC0000]/[0.06] px-4 py-3 text-[14px] font-medium text-[#CC0000]">
            <AlertCircle size={16} strokeWidth={2} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <GiftAddon checked={gift} onChange={setGift} accent={RED} style={{ marginTop: 20 }} />

        <BlackNovemberCartNote className="mt-5" />

        <div className="mt-5 flex items-baseline justify-between border-t border-[#E8E8ED] pt-4">
          <span className="text-[15px] text-[#6E6E73]">Ukupno za plaćanje</span>
          <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-[#1D1D1F]">{km(total)}</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="brs-cta mt-4 flex h-[56px] w-full items-center justify-center gap-2 rounded-full text-[17px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="brs-spin h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Slanje narudžbe...
            </>
          ) : (
            <>Potvrdi narudžbu <ArrowRight size={18} strokeWidth={2.25} /></>
          )}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-[#86868B]">
          <Lock size={13} strokeWidth={2} /> Sigurna narudžba. Plaćanje pouzećem.
        </p>
        <p className="mt-1 text-center text-[12px] text-[#A1A1A6]">Podatke koristimo samo da vas kontaktiramo oko narudžbe.</p>
      </form>

      {/* ── Summary ──────────────────────────────────────── */}
      <aside className="rounded-[28px] bg-white p-5 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)] lg:sticky lg:top-20">
        <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">Sažetak narudžbe</h4>
        <dl className="mt-4 space-y-3 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-[#424245]">Brusilica M18, kompletan set</dt>
            <dd className="shrink-0 font-medium tabular-nums text-[#1D1D1F]">{km(PRICE)}</dd>
          </div>
          {gift && (
            <div className="flex justify-between gap-4">
              <dt className="text-[#424245]">Poklon iznenađenja</dt>
              <dd className="shrink-0 font-medium tabular-nums text-[#1D1D1F]">{km(GIFT_PRICE)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-[#424245]">Dostava</dt>
            <dd className="shrink-0 font-medium tabular-nums text-[#1D1D1F]">{km(SHIPPING)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#424245]">Plaćanje</dt>
            <dd className="shrink-0 font-medium text-[#1D1D1F]">Pouzećem</dd>
          </div>
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-[#E8E8ED] pt-4">
          <span className="text-[17px] font-semibold text-[#1D1D1F]">Ukupno</span>
          <span className="text-[32px] font-semibold tracking-[-0.03em] tabular-nums text-[#1D1D1F]">{km(total)}</span>
        </div>

        <ul className="mt-6 space-y-3 border-t border-[#E8E8ED] pt-5 text-[14px] text-[#424245]">
          {[
            { Icon: CreditCard, text: "Plaćate kuriru pri preuzimanju" },
            { Icon: Truck,      text: "Dostava 1–2 radna dana, cijela BiH" },
            { Icon: Check,      text: "Narudžba automatski zaprimljena" },
          ].map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <Icon size={16} strokeWidth={2} className="shrink-0 text-[#1D1D1F]" />
              {text}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
