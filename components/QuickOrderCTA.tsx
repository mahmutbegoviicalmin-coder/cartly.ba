"use client";

import { useState, FormEvent } from "react";
import { event } from "@/lib/fbpixel";
import { track } from "@vercel/analytics";

const SIZES = [39, 40, 41, 42, 43, 44, 45, 46, 47, 48];
const OUT_OF_STOCK = new Set([48]);
const PRICE = 59.9;
const DELIVERY = 10.0;

export default function QuickOrderCTA() {
  const [qtys, setQtys]       = useState<Record<number, number>>({});
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity]       = useState("");
  const [zip, setZip]         = useState("");
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setQty = (s: number, delta: number) => {
    setQtys(prev => {
      const next = Math.max(0, (prev[s] ?? 0) + delta);
      const updated = { ...prev, [s]: next };
      if (next === 0) delete updated[s];
      return updated;
    });
    setErrors(e => ({ ...e, sizes: "" }));
  };

  const totalPairs = Object.values(qtys).reduce((a, b) => a + b, 0);
  const freeDelivery = totalPairs >= 2;
  const totalPrice = PRICE * totalPairs + (freeDelivery ? 0 : totalPairs > 0 ? DELIVERY : 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (totalPairs === 0) e.sizes   = "Odaberite barem jednu veličinu";
    if (!name.trim())     e.name    = "Unesite ime i prezime";
    if (!phone.trim())    e.phone   = "Unesite broj telefona";
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(phone)) e.phone = "Neispravan broj";
    if (!address.trim())  e.address = "Unesite adresu";
    if (!city.trim())     e.city    = "Unesite grad";
    if (!zip.trim())      e.zip     = "Unesite poštanski broj";
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setServerError(null);
    const externalId = (() => { try { return localStorage.getItem("_crt_eid") || ""; } catch { return ""; } })();
    const velicine = Object.entries(qtys).map(([s, k]) => ({ velicina: Number(s), kolicina: k }));
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime: name, telefon: phone, adresa: `${address}, ${zip} ${city}`, grad: city, velicine, externalId }),
      });
      const data = await res.json();
      if (data.success) {
        track("order_submitted", { pairs: totalPairs, total: totalPrice, source: "inline" });
        event("Purchase", { value: totalPrice, currency: "BAM", content_name: "Radne Patike S3 Tactical Black", content_ids: ["radne-patike-s3"], content_type: "product", num_items: totalPairs }, data.orderNumber);
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

  if (done) {
    return (
      <section id="naruci" style={{ background: "#F9F9F9", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB", padding: "64px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 22, color: "#0A0A0A", letterSpacing: "-0.02em", margin: "0 0 10px" }}>Hvala, {name.split(" ")[0]}!</h3>
          <p style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 15, color: "#666", lineHeight: 1.6, margin: 0 }}>
            Narudžba primljena. Javit ćemo se na <strong>{phone}</strong> u roku od 24h.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="naruci" style={{ background: "#F9F9F9", borderTop: "1px solid #EBEBEB", borderBottom: "1px solid #EBEBEB", padding: "52px 20px" }}>
      <style>{`
        .qoc-inp {
          width: 100%; border: 1.5px solid #E2E2E2; border-radius: 10px;
          padding: 12px 14px; font-size: 15px; font-family: var(--font-manrope), sans-serif;
          outline: none; background: #fff; box-sizing: border-box;
          color: #0A0A0A; transition: border-color 130ms;
        }
        .qoc-inp:focus { border-color: #B33000; }
        .qoc-inp.qe { border-color: #ef4444; }
        .qoc-em { font-size: 11px; color: #ef4444; margin: 3px 0 0; font-family: var(--font-manrope), sans-serif; }
        .qoc-sub {
          width: 100%; background: #B33000; color: #fff; border: none; border-radius: 12px;
          padding: 17px; font-family: var(--font-manrope), sans-serif;
          font-weight: 800; font-size: 16px; cursor: pointer; transition: background 130ms;
        }
        .qoc-sub:hover { background: #961f00; }
        .qoc-sub:disabled { opacity: .55; cursor: not-allowed; }
        .qoc-sz-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid #F2F2F2;
        }
        .qoc-sz-row:last-child { border-bottom: none; padding-bottom: 0; }
        .qoc-sz-row:first-child { padding-top: 0; }
        .qoc-q-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid #E0E0E0; background: #fff;
          font-size: 18px; font-weight: 700; color: #444;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; padding: 0; flex-shrink: 0; transition: all 120ms;
          font-family: var(--font-manrope), sans-serif; line-height: 1;
        }
        .qoc-q-btn:hover { border-color: #B33000; background: #B33000; color: #fff; }
        .qoc-q-btn:disabled { opacity: .3; cursor: not-allowed; }
        .qoc-q-btn:disabled:hover { border-color: #E0E0E0; background: #fff; color: #444; }
      `}</style>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p style={{ margin: "0 0 8px", fontFamily: "var(--font-manrope), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B33000" }}>
            Naruči odmah
          </p>
          <h2 style={{ margin: 0, fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 26, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
            Popuni narudžbu
          </h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
            {([
              { k: "name",    l: "Ime i prezime *",   p: "Npr. Amir Begović",  t: "text", a: "name",           v: name,    s: setName },
              { k: "phone",   l: "Broj telefona *",   p: "Npr. 061 234 567",   t: "tel",  a: "tel",            v: phone,   s: setPhone },
              { k: "address", l: "Adresa dostave *",  p: "Npr. Ferhadija 1",   t: "text", a: "street-address", v: address, s: setAddress },
              { k: "city",    l: "Grad *",            p: "Npr. Sarajevo",      t: "text", a: "address-level2", v: city,    s: setCity },
              { k: "zip",     l: "Poštanski broj *",  p: "Npr. 71000",         t: "text", a: "postal-code",    v: zip,     s: setZip },
            ] as const).map(f => (
              <div key={f.k}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666", fontFamily: "var(--font-manrope), sans-serif", display: "block", marginBottom: 5 }}>{f.l}</label>
                <input type={f.t} value={f.v} autoComplete={f.a} placeholder={f.p}
                  onChange={e => { (f.s as (v: string) => void)(e.target.value); setErrors(er => ({ ...er, [f.k]: "" })); }}
                  className={`qoc-inp${errors[f.k] ? " qe" : ""}`}
                />
                {errors[f.k] && <p className="qoc-em">{errors[f.k]}</p>}
              </div>
            ))}
          </div>

          {/* Size + qty picker */}
          <div style={{ background: "#fff", border: "1.5px solid #E8E8E8", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 14, color: "#0A0A0A" }}>Odaberi veličine i količine</span>
              {freeDelivery && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "3px 8px", fontFamily: "var(--font-manrope), sans-serif" }}>
                  🎉 Besplatna dostava
                </span>
              )}
            </div>
            <div style={{ padding: "4px 18px 8px" }}>
              {SIZES.map(s => {
                const oos = OUT_OF_STOCK.has(s);
                const qty = qtys[s] ?? 0;
                return (
                  <div key={s} className="qoc-sz-row" style={{ opacity: oos ? 0.4 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 15,
                        color: qty > 0 ? "#B33000" : "#0A0A0A", minWidth: 28,
                      }}>
                        {s}
                      </span>
                      {qty > 0 && (
                        <span style={{ fontSize: 11, color: "#B33000", fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600 }}>
                          {(qty * PRICE).toFixed(2).replace(".", ",")} KM
                        </span>
                      )}
                      {oos && (
                        <span style={{ fontSize: 11, color: "#CCC", fontFamily: "var(--font-manrope), sans-serif" }}>rasprodano</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button type="button" className="qoc-q-btn" disabled={oos || qty === 0} onClick={() => setQty(s, -1)}>−</button>
                      <span style={{
                        fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 16,
                        color: qty > 0 ? "#B33000" : "#CCCCCC", minWidth: 20, textAlign: "center",
                      }}>{qty}</span>
                      <button type="button" className="qoc-q-btn" disabled={oos} onClick={() => setQty(s, +1)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.sizes && (
              <div style={{ padding: "0 18px 12px" }}>
                <p className="qoc-em">{errors.sizes}</p>
              </div>
            )}
          </div>

          {/* Free delivery banner */}
          {!freeDelivery && totalPairs === 1 && (
            <div style={{ background: "#FFF9F5", border: "1px solid rgba(179,48,0,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontFamily: "var(--font-manrope), sans-serif", color: "#666" }}>
                Dodaj još 1 par za <strong style={{ color: "#B33000" }}>besplatnu dostavu</strong>
              </span>
            </div>
          )}

          {serverError && (
            <p style={{ fontSize: 13, color: "#ef4444", background: "#fef2f2", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontFamily: "var(--font-manrope), sans-serif" }}>{serverError}</p>
          )}

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "12px 0", borderTop: "1px solid #EBEBEB" }}>
            <div>
              <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontSize: 13, color: "#888", display: "block" }}>
                {totalPairs > 0 ? `${totalPairs} par${totalPairs > 1 ? "a" : ""}` : "Odaberi veličine"}{" "}
                {totalPairs > 0 && (freeDelivery
                  ? <span style={{ color: "#22c55e", fontWeight: 600 }}>· dostava gratis</span>
                  : <span>· dostava 10 KM</span>
                )}
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 900, fontSize: 24, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
              {totalPairs > 0 ? `${totalPrice.toFixed(2).replace(".", ",")} KM` : "—"}
            </span>
          </div>

          <button type="submit" className="qoc-sub" disabled={loading}>
            {loading ? "Slanje..." : "Pošalji narudžbu"}
          </button>
          <p style={{ fontSize: 11, color: "#BBBBBB", textAlign: "center", marginTop: 10, fontFamily: "var(--font-manrope), sans-serif" }}>
            Plaćanje pouzećem · Bez kartice · Povrat 14 dana
          </p>
        </form>
      </div>
    </section>
  );
}
