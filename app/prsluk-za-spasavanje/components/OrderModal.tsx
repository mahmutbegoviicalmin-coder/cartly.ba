"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Truck, ShieldCheck, Users } from "lucide-react";
import { event } from "@/lib/fbpixel";

const SIZES = [
  { size: "S", price: 42, desc: "Djeca do 9 godina" },
  { size: "M", price: 45, desc: "Djeca do 15 godina" },
  { size: "3XL", price: 49, desc: "Odrasli" },
];
const FAMILY_PACKAGE = {
  size: "PORODICNI",
  price: 154.9,
  label: "Porodični paket",
  desc: "S + M + 2XL + 2XL",
};
const ALL_OPTIONS = [...SIZES, FAMILY_PACKAGE];
const COLORS = [
  { name: "Narandžasta", swatch: "#FF7A1A" },
  { name: "Fluorescentno zelena", swatch: "#D6F01A" },
];
const DELIVERY = 10.0;

interface Props {
  open: boolean;
  onClose: () => void;
  initialSize?: string | null;
  initialColor: string;
}

export default function OrderModal({ open, onClose, initialSize, initialColor }: Props) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string>(initialColor);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSize(initialSize ?? null);
      setColor(initialColor);
      setName(""); setPhone(""); setAddress(""); setCity(""); setZip("");
      setErrors({}); setServerError(null); setDone(false);
      const preSize = initialSize ? ALL_OPTIONS.find((s) => s.size === initialSize) : undefined;
      event("InitiateCheckout", {
        content_name: "Sigurnosni Prsluk za Spašavanje",
        content_ids: ["prsluk-spasavanje"],
        content_type: "product",
        value: preSize?.price ?? SIZES[0].price,
        currency: "BAM",
      });
    }
  }, [open, initialSize, initialColor]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const selectedSizeInfo = ALL_OPTIONS.find((s) => s.size === size);
  const price = selectedSizeInfo?.price ?? 0;
  const total = size ? price + DELIVERY : 0;
  const sizeLabel = size === "PORODICNI" ? FAMILY_PACKAGE.label : size;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!size) e.size = "Odaberite veličinu";
    if (!name.trim()) e.name = "Unesite ime i prezime";
    if (!phone.trim()) e.phone = "Unesite broj telefona";
    else if (!/^[\d\s+\-()]{7,}$/.test(phone)) e.phone = "Neispravan broj telefona";
    if (!address.trim()) e.address = "Unesite adresu";
    if (!city.trim()) e.city = "Unesite grad";
    if (!zip.trim()) e.zip = "Unesite poštanski broj";
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setServerError(null);
    const externalId = (() => { try { return localStorage.getItem("_crt_eid") || ""; } catch { return ""; } })();

    try {
      const res = await fetch("/api/prsluk-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime: name, telefon: phone, adresa: `${address}, ${zip}`, grad: city, velicina: size, boja: color, externalId }),
      });
      const data = await res.json();
      if (data.success) {
        event("Purchase", {
          value: total,
          currency: "BAM",
          content_name: "Sigurnosni Prsluk za Spašavanje",
          content_ids: ["prsluk-spasavanje"],
          content_type: "product",
          num_items: 1,
        }, data.orderNumber);
        setDone(true);
      } else {
        setServerError(data.error ?? "Greška. Pokušajte ponovo.");
      }
    } catch {
      setServerError("Greška. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-[#061B38]/60 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white sm:max-w-[440px] sm:rounded-[28px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#FFC107]">
                  Sigurnosni prsluk
                </p>
                <p className="mt-1 text-[19px] font-extrabold tracking-[-0.02em] text-[#061B38]">
                  {done ? "Narudžba primljena!" : "Naruči odmah"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] transition-colors hover:bg-[#EBEBEB]"
                aria-label="Zatvori"
              >
                <X className="h-4 w-4 text-[#061B38]/60" />
              </button>
            </div>

            <div className="px-6 pb-8 pt-4">
              {done ? (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-green-50">
                    <Check className="h-7 w-7 text-green-500" strokeWidth={2.5} />
                  </div>
                  <h3 className="mb-2 text-[20px] font-extrabold tracking-[-0.02em] text-[#061B38]">
                    Hvala, {name.split(" ")[0]}!
                  </h3>
                  <p className="mb-6 text-[14px] leading-relaxed text-[#061B38]/60">
                    Kontaktiramo vas na <strong>{phone}</strong> u roku od 24h radi potvrde narudžbe.
                  </p>
                  <button
                    onClick={onClose}
                    className="rounded-2xl bg-[#061B38] px-8 py-3.5 text-[14px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    Zatvori
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Size selector */}
                  <div className="mb-5">
                    <label className="mb-2 block text-[12px] font-bold text-[#061B38]">
                      Odaberite veličinu *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SIZES.map((s) => {
                        const isSel = size === s.size;
                        return (
                          <button
                            key={s.size}
                            type="button"
                            onClick={() => { setSize(s.size); setErrors((er) => ({ ...er, size: "" })); }}
                            className={`rounded-2xl border-2 p-3 text-center transition-all ${
                              isSel
                                ? "border-[#FFC107] bg-[#FFFBEB]"
                                : "border-[#EEEEEE] bg-white hover:border-[#061B38]/15"
                            }`}
                          >
                            <div className="text-[16px] font-extrabold text-[#061B38]">{s.size}</div>
                            <div className="mt-0.5 text-[12px] font-semibold text-[#061B38]/70">
                              {s.price},00 KM
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSize(FAMILY_PACKAGE.size); setErrors((er) => ({ ...er, size: "" })); }}
                      className={`mt-2 flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all ${
                        size === FAMILY_PACKAGE.size
                          ? "border-[#FFC107] bg-[#FFFBEB]"
                          : "border-[#EEEEEE] bg-white hover:border-[#061B38]/15"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#061B38]">
                        <Users className="h-4.5 w-4.5 text-[#FFC107]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-extrabold text-[#061B38]">{FAMILY_PACKAGE.label}</div>
                        <div className="text-[12px] text-[#061B38]/60">{FAMILY_PACKAGE.desc}</div>
                      </div>
                      <div className="text-[15px] font-bold text-[#061B38]">
                        {FAMILY_PACKAGE.price.toFixed(2).replace(".", ",")} KM
                      </div>
                    </button>
                    {errors.size && (
                      <p className="mt-2 text-[12px] font-semibold text-red-500">{errors.size}</p>
                    )}
                  </div>

                  {/* Color selector */}
                  <div className="mb-5">
                    <label className="mb-2 block text-[12px] font-bold text-[#061B38]">
                      Odaberite boju *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {COLORS.map((c) => {
                        const isSel = color === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setColor(c.name)}
                            className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-left transition-all ${
                              isSel
                                ? "border-[#FFC107] bg-[#FFFBEB]"
                                : "border-[#EEEEEE] bg-white hover:border-[#061B38]/15"
                            }`}
                          >
                            <span
                              className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                              style={{ background: c.swatch }}
                            />
                            <span className="text-[13px] font-semibold text-[#061B38]">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact fields */}
                  <div className="mb-5 flex flex-col gap-3">
                    {([
                      { k: "name", l: "Ime i prezime *", p: "Npr. Amir Begović", t: "text", a: "name", v: name, s: setName },
                      { k: "phone", l: "Broj telefona *", p: "Npr. 061 234 567", t: "tel", a: "tel", v: phone, s: setPhone },
                      { k: "address", l: "Adresa dostave *", p: "Npr. Ferhadija 1", t: "text", a: "street-address", v: address, s: setAddress },
                      { k: "city", l: "Grad *", p: "Npr. Sarajevo", t: "text", a: "address-level2", v: city, s: setCity },
                      { k: "zip", l: "Poštanski broj *", p: "Npr. 71000", t: "text", a: "postal-code", v: zip, s: setZip },
                    ] as const).map((f) => (
                      <div key={f.k}>
                        <label className="mb-1 block text-[12px] font-semibold text-[#061B38]/70">
                          {f.l}
                        </label>
                        <input
                          type={f.t}
                          value={f.v}
                          autoComplete={f.a}
                          placeholder={f.p}
                          onChange={(e) => {
                            (f.s as (v: string) => void)(e.target.value);
                            setErrors((er) => ({ ...er, [f.k]: "" }));
                          }}
                          className={`w-full rounded-xl border px-4 py-3 text-[14px] text-[#061B38] outline-none transition-colors placeholder:text-[#061B38]/30 ${
                            errors[f.k]
                              ? "border-red-400 bg-red-50"
                              : "border-[#EEEEEE] bg-[#F8FAFC] focus:border-[#FFC107]"
                          }`}
                        />
                        {errors[f.k] && (
                          <p className="mt-1 text-[12px] font-semibold text-red-500">{errors[f.k]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {serverError && (
                    <p className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-500">
                      {serverError}
                    </p>
                  )}

                  {/* Total breakdown */}
                  <div className="mb-5 rounded-2xl bg-[#F8FAFC] p-4">
                    <div className="flex items-center justify-between text-[13px] text-[#061B38]/60">
                      <span>Proizvod{size ? ` — ${sizeLabel}` : ""}</span>
                      <span>{size ? `${price.toFixed(2).replace(".", ",")} KM` : "—"}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[13px] text-[#061B38]/60">
                      <span className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" /> Dostava
                      </span>
                      <span>{DELIVERY.toFixed(2).replace(".", ",")} KM</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                      <span className="text-[14px] font-bold text-[#061B38]">Ukupno</span>
                      <span className="text-[22px] font-extrabold tracking-[-0.02em] text-[#061B38]">
                        {size ? `${total.toFixed(2).replace(".", ",")} KM` : "—"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-[#FFC107] py-4 text-[15px] font-bold text-[#061B38] transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? "Slanje..." : "Pošalji narudžbu"}
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[#061B38]/40">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Plaćanje pouzećem · Bez kartice
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

