"use client";

import React, { useRef, useState, FormEvent } from "react";
import { event } from "@/lib/fbpixel";
import { CheckIcon } from "./icons";
import { INK, MUTED, BG, F } from "./theme";

export const UNIT_PRICE = 49.9;
export const DELIVERY   = 10;
export const PRODUCT    = "AirPods Pro";

type Fields = { ime: string; telefon: string; adresa: string; grad: string };
type Errs   = Partial<Record<keyof Fields, string>>;

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

export function Field({
  label, type = "text", placeholder = "", value, onChange, error, autoComplete,
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600, color: MUTED,
        fontFamily: F, marginBottom: 7, letterSpacing: "0.01em",
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "14px 16px",
          border: `1px solid ${error ? "#ff3b30" : "rgba(0,0,0,0.12)"}`,
          borderRadius: 12, fontSize: 16, fontFamily: F, color: INK,
          background: "#fff", outline: "none", boxSizing: "border-box",
          WebkitAppearance: "none", transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = INK;
          e.target.style.boxShadow = "0 0 0 4px rgba(29,29,31,0.08)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#ff3b30" : "rgba(0,0,0,0.12)";
          e.target.style.boxShadow = "none";
        }}
      />
      {error && (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ff3b30", fontFamily: F }}>{error}</p>
      )}
    </div>
  );
}

interface Props {
  compact?: boolean;
  onSuccess?: () => void;
}

export default function OrderForm({ compact, onSuccess }: Props) {
  const [fields,    setFields]    = useState<Fields>({ ime: "", telefon: "", adresa: "", grad: "" });
  const [qty,       setQty]       = useState(1);
  const [errors,    setErrors]    = useState<Errs>({});
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const checkoutTracked = useRef(false);

  const subtotal = qty * UNIT_PRICE;
  const total    = subtotal + DELIVERY;

  function trackCheckout() {
    if (checkoutTracked.current) return;
    checkoutTracked.current = true;
    event("InitiateCheckout", {
      content_name: PRODUCT,
      content_ids:  ["airpods-pro"],
      content_type: "product",
      value:        total,
      currency:     "BAM",
      num_items:    qty,
    });
  }

  function validate(): Errs {
    const e: Errs = {};
    if (!fields.ime.trim() || fields.ime.trim().length < 2) e.ime = "Unesite ime i prezime";
    if (!fields.telefon.trim() || fields.telefon.replace(/\D/g, "").length < 8) e.telefon = "Unesite ispravan broj";
    if (!fields.adresa.trim()) e.adresa = "Unesite adresu";
    if (!fields.grad.trim()) e.grad = "Unesite grad";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setServerErr(null);
    trackCheckout();
    try {
      const externalId = typeof localStorage !== "undefined" ? localStorage.getItem("_crt_eid") || "" : "";
      const res = await fetch("/api/airpods-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, kolicina: qty, externalId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Greška");
      event("Purchase", {
        content_name: PRODUCT,
        content_ids:  ["airpods-pro"],
        content_type: "product",
        value:        total,
        currency:     "BAM",
        num_items:    qty,
      }, data.orderNumber);
      setDone(true);
      onSuccess?.();
    } catch {
      setServerErr("Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: compact ? "28px 8px 12px" : "12px 0 8px" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: INK,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px",
        }}>
          <CheckIcon size={26} color="#fff" stroke={2.6} />
        </div>
        <h3 style={{
          margin: "0 0 10px", fontSize: 24, fontWeight: 300, color: INK,
          fontFamily: F, letterSpacing: "-0.03em",
        }}>
          Narudžba primljena
        </h3>
        <p style={{
          margin: 0, fontSize: 15, color: MUTED, fontFamily: F, lineHeight: 1.6,
          maxWidth: 320, marginInline: "auto",
        }}>
          Kontaktiraćemo vas radi potvrde. Plaćanje pouzećem, dostava 1 do 3 radna dana.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      onFocus={trackCheckout}
      style={{ display: "flex", flexDirection: "column", gap: compact ? 12 : 14 }}
    >
      <div className="ap-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field
            label="Ime i prezime"
            placeholder="Amar Hadžić"
            autoComplete="name"
            value={fields.ime}
            error={errors.ime}
            onChange={(v) => { setFields((f) => ({ ...f, ime: v })); setErrors((e) => ({ ...e, ime: undefined })); }}
          />
        </div>
        <Field
          label="Telefon"
          type="tel"
          placeholder="061 234 567"
          autoComplete="tel"
          value={fields.telefon}
          error={errors.telefon}
          onChange={(v) => { setFields((f) => ({ ...f, telefon: v })); setErrors((e) => ({ ...e, telefon: undefined })); }}
        />
        <Field
          label="Grad"
          placeholder="Sarajevo"
          autoComplete="address-level2"
          value={fields.grad}
          error={errors.grad}
          onChange={(v) => { setFields((f) => ({ ...f, grad: v })); setErrors((e) => ({ ...e, grad: undefined })); }}
        />
        <div style={{ gridColumn: "1 / -1" }}>
          <Field
            label="Adresa"
            placeholder="Ulica i broj"
            autoComplete="street-address"
            value={fields.adresa}
            error={errors.adresa}
            onChange={(v) => { setFields((f) => ({ ...f, adresa: v })); setErrors((e) => ({ ...e, adresa: undefined })); }}
          />
        </div>
      </div>

      <div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: MUTED, fontFamily: F,
          marginBottom: 8, letterSpacing: "0.01em",
        }}>
          Količina
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3].map((n) => {
            const active = qty === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setQty(n)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12, cursor: "pointer",
                  border: `1.5px solid ${active ? INK : "rgba(0,0,0,0.1)"}`,
                  background: active ? INK : "#fff",
                  color: active ? "#fff" : INK,
                  fontFamily: F, fontWeight: 500, fontSize: 15,
                  transition: "all 0.15s",
                }}
              >
                {n}×
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        background: BG, borderRadius: 16, padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontFamily: F, color: MUTED }}>
          <span>{PRODUCT} ({qty}×)</span>
          <span style={{ color: INK, fontWeight: 600 }}>{fmt(subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontFamily: F, color: MUTED }}>
          <span>Dostava</span>
          <span style={{ color: INK, fontWeight: 600 }}>{fmt(DELIVERY)}</span>
        </div>
        <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: F }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>Ukupno</span>
          <span style={{ fontSize: 22, fontWeight: 300, color: INK, letterSpacing: "-0.03em" }}>{fmt(total)}</span>
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED, fontFamily: F }}>
          Plaćanje pouzećem pri preuzimanju
        </p>
      </div>

      {serverErr && (
        <div style={{
          padding: "12px 14px", background: "#fff2f2", border: "1px solid #ffd0d0",
          borderRadius: 12, fontSize: 13, color: "#ff3b30", fontFamily: F,
        }}>
          {serverErr}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="ap-submit"
        style={{
          width: "100%", padding: "16px 20px",
          background: loading ? "#424245" : INK,
          color: "#fff", border: "none", borderRadius: 980,
          fontSize: 17, fontWeight: 500, fontFamily: F,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          letterSpacing: "-0.01em",
          boxShadow: "none",
          transition: "background 0.15s, transform 0.15s",
        }}
      >
        {loading ? (
          <>
            <svg className="ap-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Šalje se...
          </>
        ) : (
          <>Naruči odmah · {fmt(total)}</>
        )}
      </button>
    </form>
  );
}
