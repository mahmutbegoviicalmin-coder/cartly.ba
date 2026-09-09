"use client";

import { FormEvent, useRef, useState } from "react";
import {
  DELIVERY_PRICE,
  ORDER_TOTAL,
  PRODUCT_ID,
  PRODUCT_NAME,
  PRODUCT_PRICE,
  fmtKM,
} from "../product";
import { trackPurchase } from "@/lib/analytics";
import OrderSuccess from "./OrderSuccess";

type Fields = {
  ime: string;
  prezime: string;
  adresa: string;
  grad: string;
  postanski: string;
  telefon: string;
};

type Errs = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = {
  ime: "",
  prezime: "",
  adresa: "",
  grad: "",
  postanski: "",
  telefon: "",
};

function Field({
  idPrefix,
  label,
  name,
  type = "text",
  autoComplete,
  inputMode,
  value,
  error,
  onChange,
}: {
  idPrefix: string;
  label: string;
  name: keyof Fields;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "text";
  value: string;
  error?: string;
  onChange: (name: keyof Fields, value: string) => void;
}) {
  const id = `${idPrefix}-${name}`;
  return (
    <div className="mp-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={error ? "is-err" : undefined}
        onChange={(e) => onChange(name, e.target.value)}
      />
      {error && (
        <p className="mp-err" id={`${id}-err`}>{error}</p>
      )}
    </div>
  );
}

export default function OrderForm({
  idPrefix = "lp",
  onReady,
}: {
  idPrefix?: string;
  onReady?: () => void;
}) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errs>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paidTotal, setPaidTotal] = useState(ORDER_TOTAL);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const submitting = useRef(false);

  function setField(name: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validate(): Errs {
    const e: Errs = {};
    if (!fields.ime.trim()) e.ime = "Unesi ime.";
    if (!fields.prezime.trim()) e.prezime = "Unesi prezime.";
    if (!fields.adresa.trim()) e.adresa = "Unesi adresu.";
    if (!fields.grad.trim()) e.grad = "Unesi grad.";
    if (!/^\d{5}$/.test(fields.postanski.trim())) e.postanski = "Unesi poštanski broj.";
    const digits = fields.telefon.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) e.telefon = "Unesi ispravan broj telefona.";
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (submitting.current || loading) return;

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const first = Object.keys(errs)[0];
      document.getElementById(`${idPrefix}-${first}`)?.focus();
      return;
    }

    submitting.current = true;
    setLoading(true);
    setServerErr(null);

    try {
      const externalId =
        typeof localStorage !== "undefined" ? localStorage.getItem("_crt_eid") || "" : "";

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, productId: PRODUCT_ID, externalId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success || !data?.orderNumber) {
        throw new Error("fail");
      }

      // Purchase fires only after the backend confirms the order.
      // eventID = orderNumber so Meta can dedupe against the server CAPI event.
      trackPurchase({
        id: PRODUCT_ID,
        name: PRODUCT_NAME,
        category: "Alati",
        value: Number(data.total) || ORDER_TOTAL,
        orderId: data.orderNumber,
      });

      setOrderNumber(data.orderNumber);
      setPaidTotal(Number(data.total) || ORDER_TOTAL);
      setDone(true);
    } catch {
      setServerErr("Došlo je do greške. Pokušaj ponovo.");
      submitting.current = false;
    } finally {
      setLoading(false);
    }
  }

  if (done) return <OrderSuccess orderNumber={orderNumber} total={paidTotal} />;

  return (
    <form className="mp-form" onSubmit={handleSubmit} noValidate onFocus={onReady}>
      <div className="mp-form-grid">
        <Field idPrefix={idPrefix} label="Ime" name="ime" autoComplete="given-name" value={fields.ime} error={errors.ime} onChange={setField} />
        <Field idPrefix={idPrefix} label="Prezime" name="prezime" autoComplete="family-name" value={fields.prezime} error={errors.prezime} onChange={setField} />
        <div style={{ gridColumn: "1 / -1" }}>
          <Field idPrefix={idPrefix} label="Adresa" name="adresa" autoComplete="street-address" value={fields.adresa} error={errors.adresa} onChange={setField} />
        </div>
        <Field idPrefix={idPrefix} label="Grad" name="grad" autoComplete="address-level2" value={fields.grad} error={errors.grad} onChange={setField} />
        <Field idPrefix={idPrefix} label="Poštanski broj" name="postanski" autoComplete="postal-code" inputMode="numeric" value={fields.postanski} error={errors.postanski} onChange={setField} />
        <div style={{ gridColumn: "1 / -1" }}>
          <Field idPrefix={idPrefix} label="Broj telefona" name="telefon" type="tel" autoComplete="tel" value={fields.telefon} error={errors.telefon} onChange={setField} />
        </div>
      </div>

      <div className="mp-summary" aria-label="Pregled narudžbe">
        <div className="mp-summary-row">
          <span>Motorna pila</span>
          <strong>{fmtKM(PRODUCT_PRICE)}</strong>
        </div>
        <div className="mp-summary-row">
          <span>Dostava</span>
          <strong>{fmtKM(DELIVERY_PRICE)}</strong>
        </div>
        <div className="mp-summary-total">
          <span style={{ fontWeight: 600, color: "#141414" }}>Ukupno za plaćanje</span>
          <strong style={{ fontSize: 20, letterSpacing: "-0.03em" }}>{fmtKM(ORDER_TOTAL)}</strong>
        </div>
      </div>

      {serverErr && (
        <div className="mp-err" role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", color: "#b91c1c" }}>
          {serverErr}
        </div>
      )}

      <button type="submit" className="mp-btn mp-btn-buy mp-btn-wide" disabled={loading} aria-busy={loading}>
        {loading ? (
          <>
            <svg className="mp-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Obrada u toku...
          </>
        ) : (
          "Potvrdi narudžbu"
        )}
      </button>
    </form>
  );
}
