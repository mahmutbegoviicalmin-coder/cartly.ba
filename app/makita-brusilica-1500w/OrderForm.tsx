"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Gift, Check, Lock, Truck, Banknote, ShieldCheck } from "lucide-react";
import { event } from "@/lib/fbpixel";
import { useOrderProtection } from "@/lib/order-protection";
import { isValidBaPhone, PHONE_ERROR } from "@/lib/ba-phone";
import {
  INK, MUTED, BG, LINE, TEAL, TEAL_T,
  PRODUCT, CONTENT_ID, UNIT_PRICE, GIFT_PRICE, DELIVERY, fmt,
} from "./theme";

type Fields = { ime: string; prezime: string; telefon: string; grad: string; postanski: string; adresa: string };
type Errs   = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { ime: "", prezime: "", telefon: "", grad: "", postanski: "", adresa: "" };

/** Saturday or Sunday in Sarajevo: couriers don't pick up, so the parcel leaves on Monday. */
function isWeekendInSarajevo(): boolean {
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Sarajevo", weekday: "short" }).format(new Date());
  return day === "Sat" || day === "Sun";
}

// Shared by the inline form and the popup so InitiateCheckout fires once per page view.
let checkoutTracked = false;

export function pixelContents(gift: boolean) {
  const value = UNIT_PRICE + (gift ? GIFT_PRICE : 0) + DELIVERY;
  return {
    content_name: gift ? `${PRODUCT} + Poklon` : PRODUCT,
    content_ids:  gift ? [CONTENT_ID, `${CONTENT_ID}-poklon`] : [CONTENT_ID],
    content_type: "product",
    contents: [
      { id: CONTENT_ID, quantity: 1, item_price: UNIT_PRICE },
      ...(gift ? [{ id: `${CONTENT_ID}-poklon`, quantity: 1, item_price: GIFT_PRICE }] : []),
    ],
    num_items: gift ? 2 : 1,
    value,
    currency:  "BAM",
  };
}

export function trackCheckout(gift = false) {
  if (checkoutTracked) return;
  checkoutTracked = true;
  event("InitiateCheckout", pixelContents(gift));
}

function Field({
  label, value, onChange, error, placeholder, type = "text", autoComplete, inputMode,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  placeholder?: string; type?: string; autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 6, letterSpacing: "0.01em" }}>
        {label}
      </span>
      <input
        className="mk-input"
        data-error={error ? "1" : undefined}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span style={{ display: "block", marginTop: 5, fontSize: 12, color: "#FF3B30" }}>{error}</span>}
    </label>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, color: MUTED }}>
      <span>{label}</span>
      <span style={{ color: accent ? TEAL : INK, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function OrderForm({ onClose }: { onClose?: () => void }) {
  const [fields,    setFields]    = useState<Fields>(EMPTY);
  const [gift,      setGift]      = useState(false);
  const [errors,    setErrors]    = useState<Errs>({});
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [weekend,   setWeekend]   = useState(false);
  const { honeypot, protectionPayload } = useOrderProtection();

  const total = UNIT_PRICE + (gift ? GIFT_PRICE : 0) + DELIVERY;

  function set<K extends keyof Fields>(k: K, v: string) {
    setFields((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setServerErr(null);
  }

  function toggleGift() {
    const next = !gift;
    setGift(next);
    if (next) {
      event("AddToCart", {
        content_name: "Poklon iznenađenja",
        content_ids:  [`${CONTENT_ID}-poklon`],
        content_type: "product",
        value:        GIFT_PRICE,
        currency:     "BAM",
      });
    }
  }

  function validate(): Errs {
    const e: Errs = {};
    if (fields.ime.trim().length < 2)     e.ime     = "Unesite ime";
    if (fields.prezime.trim().length < 2) e.prezime = "Unesite prezime";
    if (!isValidBaPhone(fields.telefon))  e.telefon = PHONE_ERROR;
    if (fields.grad.trim().length < 2)    e.grad    = "Unesite grad";
    if (!/^\d{5}$/.test(fields.postanski)) e.postanski = "Unesite poštanski broj (5 cifara)";
    if (fields.adresa.trim().length < 3)  e.adresa  = "Unesite ulicu i broj";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerErr(null);
    trackCheckout(gift);
    try {
      let externalId = "";
      try { externalId = localStorage.getItem("_crt_eid") || ""; } catch {}
      const res = await fetch("/api/makita-1500-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...fields,
          poklon: gift,
          externalId,
          sourceUrl: window.location.href,
          ...protectionPayload(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Greška pri slanju narudžbe.");

      // Same eventID as the server-side CAPI Purchase → Meta deduplicates them.
      if (!data.duplicate) event("Purchase", pixelContents(gift), data.orderNumber);
      setWeekend(isWeekendInSarajevo());
      setDone(data.orderNumber);
    } catch (err) {
      setServerErr(err instanceof Error ? err.message : "Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "36px 8px 20px" }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          style={{
            width: 72, height: 72, borderRadius: "50%", background: TEAL, margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 32px rgba(0,131,143,0.3)",
          }}
        >
          <Check size={32} color="#fff" strokeWidth={2.6} />
        </motion.div>
        <h3 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 600, color: INK, letterSpacing: "-0.03em" }}>
          Hvala, {fields.ime.trim()}!
        </h3>
        <p style={{ margin: "0 auto", maxWidth: 340, fontSize: 15, lineHeight: 1.55, color: MUTED }}>
          Vaša narudžba je primljena{gift ? " zajedno sa poklonom iznenađenja" : ""}.{" "}
          {weekend
            ? "Brza pošta ne radi vikendom, pa vaš paket šaljemo u ponedjeljak. Dostava traje 1 do 3 radna dana."
            : "Paket šaljemo u najkraćem roku i stiže za 1 do 3 radna dana."}
        </p>
        <div style={{ marginTop: 20, display: "inline-flex", gap: 8, padding: "10px 16px", borderRadius: 999, background: BG, fontSize: 13, color: MUTED }}>
          Broj narudžbe <strong style={{ color: INK, fontWeight: 600 }}>{done}</strong>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="mk-btn" style={{ marginTop: 26 }}>
            Zatvori
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={() => trackCheckout(gift)}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}
    >
      {honeypot}

      <div style={{ fontSize: 13, color: MUTED, display: "flex", alignItems: "center", gap: 6 }}>
        <Lock size={13} /> Plaćate tek kada preuzmete paket
      </div>

      <div className="mk-grid">
        <Field label="Ime" placeholder="Emir" autoComplete="given-name"
          value={fields.ime} error={errors.ime} onChange={(v) => set("ime", v)} />
        <Field label="Prezime" placeholder="Hadžić" autoComplete="family-name"
          value={fields.prezime} error={errors.prezime} onChange={(v) => set("prezime", v)} />
      </div>
      <Field label="Broj telefona" type="tel" placeholder="061 234 567" autoComplete="tel" inputMode="tel"
        value={fields.telefon} error={errors.telefon} onChange={(v) => set("telefon", v)} />
      <div className="mk-grid">
        <Field label="Grad" placeholder="Sarajevo" autoComplete="address-level2"
          value={fields.grad} error={errors.grad} onChange={(v) => set("grad", v)} />
        <Field label="Poštanski broj" placeholder="71000" autoComplete="postal-code" inputMode="numeric"
          value={fields.postanski} error={errors.postanski}
          onChange={(v) => set("postanski", v.replace(/\D/g, "").slice(0, 5))} />
      </div>
      <Field label="Adresa" placeholder="Ulica i broj" autoComplete="street-address"
        value={fields.adresa} error={errors.adresa} onChange={(v) => set("adresa", v)} />

      {/* Gift upsell */}
      <button type="button" onClick={toggleGift} aria-pressed={gift} className="mk-gift" data-on={gift ? "1" : undefined}>
        <span className="mk-check" data-on={gift ? "1" : undefined}>
          {gift && <Check size={14} strokeWidth={3} color="#fff" />}
        </span>
        <span className="mk-gift-icon" style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: gift ? "#fff" : TEAL_T, color: TEAL,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Gift size={20} strokeWidth={1.8} />
        </span>
        <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>Poklon iznenađenja</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: TEAL, whiteSpace: "nowrap" }}>+{fmt(GIFT_PRICE)}</span>
          </span>
          <span style={{ display: "block", fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.4 }}>
            Koristan dodatak za radionicu, spakovan uz vašu brusilicu. Dostupno samo uz ovu narudžbu.
          </span>
        </span>
      </button>

      {/* Summary */}
      <div style={{ background: BG, borderRadius: 18, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 9 }}>
        <Row label={PRODUCT} value={fmt(UNIT_PRICE)} />
        {gift && <Row label="Poklon iznenađenja" value={`+${fmt(GIFT_PRICE)}`} />}
        <Row label="Dostava" value="Besplatna" accent />
        <div style={{ height: 1, background: LINE, margin: "3px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>Ukupno za platiti</span>
          <span style={{ fontSize: 24, fontWeight: 600, color: INK, letterSpacing: "-0.03em" }}>{fmt(total)}</span>
        </div>
      </div>

      {serverErr && (
        <div style={{ padding: "12px 14px", background: "#FFF2F2", border: "1px solid #FFD0D0", borderRadius: 14, fontSize: 13, color: "#D70015" }}>
          {serverErr}
        </div>
      )}

      <button type="submit" disabled={loading} className="mk-btn">
        {loading ? (
          <>
            <svg className="mk-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Šaljem narudžbu...
          </>
        ) : (
          <>Potvrdi narudžbu · {fmt(total)}</>
        )}
      </button>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", fontSize: 12, color: MUTED }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Truck size={13} /> Besplatna dostava</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Banknote size={13} /> Pouzećem</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><ShieldCheck size={13} /> Garancija</span>
      </div>
    </form>
  );
}
