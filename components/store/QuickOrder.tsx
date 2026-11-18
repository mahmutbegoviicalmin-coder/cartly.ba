"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Gift, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { BLACK_NOVEMBER_END, pad2, useBlackNovember } from "@/lib/campaign";
import { bySlug, km } from "@/lib/catalog";
import { themeFor } from "@/lib/campaign-themes";
import { QuickOrderConfig, QuickVariant, quickOrderFor } from "@/lib/quick-order";
import { GIFT_PRICE } from "@/lib/gift";
import { event } from "@/lib/fbpixel";
import { useOrderProtection } from "@/lib/order-protection";
import { isValidBaPhone, looksLikeRealAddress, looksLikeRealName, looksLikeRealPlace, PHONE_ERROR } from "@/lib/ba-phone";

/*
 * One floating "Naruči" button + one order pop-up for every product page.
 * Mounted once in app/layout.tsx; renders only on routes listed in
 * lib/quick-order.ts. The pop-up is built for older customers: big type,
 * one column, tall fields, big option buttons, plain error messages.
 *
 * Any button on a page can open it with openQuickOrder().
 */

const OPEN_EVENT = "cartly:quick-order";
export const openQuickOrder = () => window.dispatchEvent(new Event(OPEN_EVENT));

/** Length of the campaign the ring measures against (Black November = 30 days). */
const CAMPAIGN_MS = 30 * 86_400_000;
const SOON_MS = 48 * 3_600_000;

// ─── Time + stock display ────────────────────────────────────────────────────

/** Ring that empties as the campaign runs out. */
function TimeRing({ size = 44, accent }: { size?: number; accent: string }) {
  const bn = useBlackNovember();
  const left = Math.max(0, BLACK_NOVEMBER_END - Date.now());
  const frac = bn.mounted ? Math.min(1, left / CAMPAIGN_MS) : 1;
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth={4} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - frac)} style={{ transition: "stroke-dashoffset 1s linear" }}
      />
    </svg>
  );
}

/** Stock as a row of segments: filled = still in stock (max 10 shown). */
function StockDots({ stock, accent }: { stock: number; accent: string }) {
  const total = 10;
  const filled = Math.max(0, Math.min(total, stock));
  return (
    <span className="flex gap-[3px]" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="h-[6px] w-[9px] rounded-full" style={{ background: i < filled ? accent : "rgba(0,0,0,0.12)" }} />
      ))}
    </span>
  );
}

/** "Cijena završava za …" + "Ostalo na stanju: …". Real campaign end, real stock only. */
export function UrgencyPanel({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const bn = useBlackNovember();
  const accent = themeFor(`/${slug}`).accent;
  const ringAccent = accent === "#FFC400" || accent === "#FFC107" ? "#C78A00" : accent;
  const stock = bySlug(slug)?.stock;
  const soon = bn.mounted && BLACK_NOVEMBER_END - Date.now() < SOON_MS;

  if (!bn.active && stock == null) return null;

  return (
    <div className="flex min-w-0 items-center gap-2.5 text-[#1D1D1F]">
      {bn.active && <TimeRing accent={ringAccent} size={compact ? 38 : 44} />}
      <div className="min-w-0 leading-tight">
        {bn.active && (
          <>
            <p className={`urgency-blink inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#E11D2E] px-2 py-[2px] ${compact ? "text-[12.5px]" : "text-[13px]"} font-extrabold text-white`}>
              <span className="h-[6px] w-[6px] rounded-full bg-white" aria-hidden="true" />
              {soon ? "Akcija završava uskoro" : "Cijena završava za"}
            </p>
            <p className={`mt-0.5 ${compact ? "text-[16px]" : "text-[18px]"} font-extrabold tabular-nums text-[#E11D2E]`}>
              {bn.mounted && bn.days > 0 && (
                <span className="urgency-blink">{bn.days} {bn.days === 1 ? "dan" : "dana"} </span>
              )}
              <span className="text-[#1D1D1F]">{bn.mounted ? `${pad2(bn.hours)}:${pad2(bn.minutes)}:${pad2(bn.seconds)}` : ""}</span>
            </p>
          </>
        )}
        {stock != null && (
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-black/65">
            <span className="whitespace-nowrap">Ostalo na stanju: <b className="text-[#1D1D1F]">{stock}</b></span>
            {!compact && <StockDots stock={stock} accent={ringAccent} />}
          </p>
        )}
      </div>
    </div>
  );
}

/** Inline stock meter for the order section. Renders nothing unless lib/catalog.ts has a real `stock`. */
export function StockMeter({ slug, className = "" }: { slug: string; className?: string }) {
  const stock = bySlug(slug)?.stock;
  if (stock == null) return null;
  const accent = themeFor(`/${slug}`).accent;
  return (
    <div className={`flex items-center justify-center gap-2.5 text-[14px] text-[#1D1D1F] ${className}`}>
      <span className="font-semibold">Ostalo na stanju: {stock}</span>
      <StockDots stock={stock} accent={accent === "#FFC400" || accent === "#FFC107" ? "#C78A00" : accent} />
    </div>
  );
}

// ─── Floating bar / card ─────────────────────────────────────────────────────

const HIDDEN_PREFIXES = ["/admin", "/dobavljac", "/proizvodi", "/api"];

export function QuickOrderGate() {
  const path = usePathname() || "/";
  const slug = path.split("/")[1] || "";
  const cfg = path === "/" || HIDDEN_PREFIXES.some(p => path.startsWith(p)) ? undefined : quickOrderFor(slug);
  if (!cfg) return null;
  return <QuickOrder key={slug} slug={slug} cfg={cfg} />;
}

function QuickOrder({ slug, cfg }: { slug: string; cfg: QuickOrderConfig }) {
  const [open, setOpen] = useState(false);
  const product = bySlug(slug);
  const theme = themeFor(`/${slug}`);
  const bn = useBlackNovember();

  const show = useCallback(() => {
    setOpen(true);
    event("InitiateCheckout", { content_name: cfg.pixelName, content_ids: [cfg.pixelId], content_type: "product", value: cfg.price, currency: "BAM" });
  }, [cfg]);

  useEffect(() => {
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, [show]);

  const button = (cls: string) => (
    <button
      type="button" onClick={show}
      className={`flex shrink-0 items-center justify-center gap-2 rounded-[16px] font-bold shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-transform active:scale-[0.97] ${cls}`}
      style={{ background: theme.accent, color: theme.on }}
    >
      <ShoppingBag size={20} strokeWidth={2.25} /> Naruči
    </button>
  );

  return (
    <>
      {/* Space so the bar never covers the page's last content on phones. */}
      <div aria-hidden="true" className="h-[92px] md:hidden" />

      {!open && (
        <>
          {/* Phone: bar at the bottom. */}
          <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-black/[0.08] bg-white/95 px-3 pt-2.5 backdrop-blur-md md:hidden" style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
            <div className="mx-auto flex max-w-[560px] items-center justify-between gap-3">
              {bn.active || product?.stock != null ? (
                <UrgencyPanel slug={slug} compact />
              ) : (
                <div className="min-w-0 leading-tight">
                  <p className="text-[18px] font-bold text-[#1D1D1F]">{km(cfg.price)}</p>
                  <p className="flex items-center gap-1 text-[12px] text-black/60"><Truck size={13} /> Plaćanje pouzećem</p>
                </div>
              )}
              {button("h-[56px] min-w-[132px] px-5 text-[18px]")}
            </div>
          </div>

          {/* Desktop: floating card bottom right. */}
          <div className="fixed bottom-6 right-6 z-[90] hidden w-[300px] rounded-[22px] border border-black/[0.06] bg-white p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] md:block">
            <p className="truncate text-[14px] font-semibold text-[#1D1D1F]">{product?.name}</p>
            <p className="mb-3 flex items-baseline gap-2">
              <span className="text-[22px] font-bold text-[#1D1D1F]">{km(cfg.price)}</span>
              {product?.oldPrice && <span className="text-[14px] text-black/40 line-through">{km(product.oldPrice)}</span>}
            </p>
            <div className="mb-3"><UrgencyPanel slug={slug} /></div>
            {button("h-[54px] w-full text-[18px]")}
          </div>
        </>
      )}

      {open && <OrderDialog slug={slug} cfg={cfg} onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── Pop-up ──────────────────────────────────────────────────────────────────

type Fields = { ime: string; prezime: string; adresa: string; grad: string; postanski: string; telefon: string };
type FieldKey = keyof Fields;

const LABELS: Record<FieldKey, string> = {
  ime: "Ime", prezime: "Prezime", adresa: "Adresa (ulica i broj)", grad: "Grad", postanski: "Poštanski broj", telefon: "Broj telefona",
};

function validate(f: Fields, cfg: QuickOrderConfig): Partial<Record<FieldKey, string>> {
  const e: Partial<Record<FieldKey, string>> = {};
  if (!looksLikeRealName(f.ime)) e.ime = "Upišite svoje ime.";
  if (!looksLikeRealName(f.prezime)) e.prezime = "Upišite svoje prezime.";
  if (!looksLikeRealAddress(f.adresa)) e.adresa = "Upišite ulicu i kućni broj.";
  if (!looksLikeRealPlace(f.grad, 2)) e.grad = "Upišite grad ili mjesto.";
  if (cfg.requirePostal && !/^\d{5}$/.test(f.postanski.trim())) e.postanski = "Poštanski broj ima 5 cifara, npr. 71000.";
  if (!isValidBaPhone(f.telefon)) e.telefon = PHONE_ERROR;
  return e;
}

function OptionGrid({ title, options, value, onChange, accent, on, cols }: {
  title: string; options: QuickVariant[]; value: string; onChange: (v: string) => void; accent: string; on: string; cols: number;
}) {
  return (
    <fieldset className="mb-5">
      <legend className="mb-2 text-[15.5px] font-semibold text-[#1D1D1F]">{title}</legend>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {options.map(o => {
          const sel = o.value === value;
          return (
            <button
              key={o.value} type="button" disabled={o.soldOut} onClick={() => onChange(o.value)} aria-pressed={sel}
              className={`flex min-h-[50px] flex-col items-center justify-center rounded-[14px] border-2 px-2 py-2 text-center text-[15.5px] font-bold transition-colors ${o.soldOut ? "cursor-not-allowed border-black/10 bg-black/[0.03] text-black/30 line-through" : sel ? "" : "border-black/15 bg-white text-[#1D1D1F]"}`}
              style={sel ? { borderColor: accent, background: accent, color: on } : undefined}
            >
              {o.label}
              {o.hint && <span className={`text-[13px] font-medium ${sel ? "opacity-90" : "text-black/55"}`}>{o.hint}</span>}
              {o.price != null && <span className={`text-[14px] font-semibold ${sel ? "opacity-90" : "text-black/60"}`}>{km(o.price)}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function OrderDialog({ slug, cfg, onClose }: { slug: string; cfg: QuickOrderConfig; onClose: () => void }) {
  const product = bySlug(slug);
  const theme = themeFor(`/${slug}`);
  const bn = useBlackNovember();
  const { honeypot, protectionPayload } = useOrderProtection();

  const firstSize = cfg.sizes?.find(s => !s.soldOut)?.value ?? "";
  const [fields, setFields] = useState<Fields>({ ime: "", prezime: "", adresa: "", grad: "", postanski: "", telefon: "" });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [size, setSize] = useState(cfg.sizes && cfg.sizes.length <= 4 ? firstSize : "");
  const [color, setColor] = useState(cfg.colors?.[0]?.value ?? "");
  const [bundle, setBundle] = useState(cfg.bundles?.[0]?.value ?? "");
  const [qty, setQty] = useState(1);
  const [gift, setGift] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const firstInput = useRef<HTMLInputElement>(null);

  // Lock page scroll, Esc closes, focus the first field.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstInput.current?.focus({ preventScroll: true }), 120);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [onClose]);

  const unit =
    (cfg.bundles?.find(b => b.value === bundle)?.price) ??
    (cfg.sizes?.find(s => s.value === size)?.price) ??
    cfg.price;
  const subtotal = unit * (cfg.maxQty ? qty : 1);
  const total = subtotal + cfg.delivery + (gift ? GIFT_PRICE : 0);

  const set = (k: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const errs = validate(fields, cfg);
    if (cfg.sizes && !size) { setFormError("Odaberite veličinu."); }
    setErrors(errs);
    const firstBad = (Object.keys(LABELS) as FieldKey[]).find(k => errs[k]);
    if (firstBad || (cfg.sizes && !size)) {
      if (firstBad) document.getElementById(`qo-${firstBad}`)?.focus();
      return;
    }

    let externalId = "";
    try { externalId = localStorage.getItem("_crt_eid") || ""; } catch {}

    const payload: Record<string, unknown> = {
      ime: fields.ime.trim(),
      prezime: fields.prezime.trim(),
      adresa: fields.adresa.trim(),
      grad: fields.grad.trim(),
      telefon: fields.telefon.trim(),
      poklon: gift,
      ...protectionPayload(),
      ...cfg.extra,
    };
    if (fields.postanski.trim()) payload.postanski_broj = fields.postanski.trim();
    if (cfg.externalId) payload.externalId = externalId;
    if (cfg.sourceUrl) payload.sourceUrl = window.location.href;
    if (cfg.maxQty) payload.kolicina = qty;
    if (cfg.bundles) payload.bundle = Number(bundle);
    if (cfg.colors) payload.boja = color;
    if (cfg.sizes) {
      if (cfg.sizesAsList) payload.velicine = [{ velicina: Number(size), kolicina: qty }];
      else payload.velicina = /^\d+$/.test(size) ? Number(size) : size;
    }

    setSending(true);
    try {
      const res = await fetch(cfg.api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setFormError(json.error || "Narudžba nije poslana. Pokušajte ponovo ili nas nazovite.");
        return;
      }
      if (!json.duplicate) {
        event("Purchase", { content_name: cfg.pixelName, content_ids: [cfg.pixelId], content_type: "product", value: total, currency: "BAM", num_items: cfg.maxQty ? qty : 1 }, json.orderNumber);
      }
      setDone(json.orderNumber || "");
    } catch {
      setFormError("Nema internet veze. Provjerite vezu i pokušajte ponovo.");
    } finally {
      setSending(false);
    }
  }

  const input = (k: FieldKey, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="mb-3">
      <label htmlFor={`qo-${k}`} className="mb-1.5 block text-[15.5px] font-semibold text-[#1D1D1F]">{LABELS[k]}</label>
      <input
        id={`qo-${k}`} ref={k === "ime" ? firstInput : undefined} value={fields[k]} onChange={set(k)}
        aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `qo-${k}-err` : undefined}
        className={`h-[50px] w-full rounded-[14px] border-2 bg-white px-4 text-[16px] text-[#1D1D1F] outline-none transition-colors placeholder:text-black/35 focus:border-[#1D1D1F] ${errors[k] ? "border-[#D70015] bg-[#FFF5F5]" : "border-black/20"}`}
        {...props}
      />
      {errors[k] && <p id={`qo-${k}-err`} className="mt-1.5 text-[14px] font-semibold text-[#D70015]">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[20000] flex items-end justify-center bg-black/55 md:items-center md:p-6" onClick={onClose} role="presentation">
      <div
        role="dialog" aria-modal="true" aria-labelledby="qo-title" onClick={e => e.stopPropagation()}
        className="relative flex h-[100dvh] w-full max-w-[560px] flex-col overflow-clip bg-[#F5F5F7] md:h-auto md:max-h-[92vh] md:rounded-[28px]"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, 'Segoe UI', Roboto, sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-black/[0.08] bg-white px-5 py-4">
          <h2 id="qo-title" className="min-w-0 flex-1 text-[18px] font-bold leading-tight text-[#1D1D1F]">
            {done !== null ? "Narudžba je primljena" : "Narudžba"}
            {done === null && <span className="block truncate text-[13.5px] font-medium text-black/55">{product?.name}</span>}
          </h2>
          <button type="button" onClick={onClose} aria-label="Zatvori" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-[#1D1D1F]">
            <X size={26} strokeWidth={2.25} />
          </button>
        </div>

        {done !== null ? (
          <div className="overflow-y-auto px-5 py-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F7EE] text-[#15803D]">
              <Check size={44} strokeWidth={3} />
            </div>
            <p className="mb-2 text-[19px] font-bold text-[#1D1D1F]">Hvala, {fields.ime.trim()}!</p>
            <p className="mb-5 text-[15.5px] leading-relaxed text-black/70">
              Narudžba je zaprimljena automatski, ne trebate čekati poziv.
              Paket stiže za 1–2 radna dana, a plaćate kad ga preuzmete.
            </p>
            {done && <p className="mb-6 text-[14px] text-black/55">Broj narudžbe: <b className="text-[#1D1D1F]">{done}</b></p>}
            <p className="mb-6 text-[15.5px] font-bold text-[#1D1D1F]">Za platiti pri preuzimanju: {km(total)}</p>
            <button type="button" onClick={onClose} className="h-[50px] w-full rounded-[16px] bg-[#1D1D1F] text-[16px] font-bold text-white">Zatvori</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col overflow-clip">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-5">
              {bn.active && (
                <div className="mb-5 flex items-center gap-3 rounded-[16px] bg-[#141110] px-4 py-3.5 text-white">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: theme.accent, color: theme.on }}>
                    <Check size={20} strokeWidth={3} />
                  </span>
                  <p className="text-[15px] font-semibold leading-snug">Black November cijena je već uračunata</p>
                </div>
              )}

              {cfg.bundles && <OptionGrid title="Koliko komada?" options={cfg.bundles} value={bundle} onChange={setBundle} accent={theme.accent} on={theme.on} cols={2} />}
              {cfg.sizes && (
                <OptionGrid
                  title={cfg.sizeLabel ?? "Veličina (broj)"} options={cfg.sizes} value={size} onChange={v => { setSize(v); setFormError(""); }}
                  accent={theme.accent} on={theme.on} cols={cfg.sizes.length <= 4 ? 2 : 4}
                />
              )}
              {cfg.colors && <OptionGrid title="Boja" options={cfg.colors} value={color} onChange={setColor} accent={theme.accent} on={theme.on} cols={2} />}

              {cfg.maxQty && (
                <div className="mb-5">
                  <p className="mb-2 text-[15.5px] font-semibold text-[#1D1D1F]">Količina</p>
                  <div className="flex items-center gap-3">
                    <button type="button" aria-label="Manje" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                      className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border-2 border-black/15 bg-white text-[#1D1D1F] disabled:opacity-35">
                      <Minus size={24} strokeWidth={2.5} />
                    </button>
                    <span className="w-14 text-center text-[22px] font-bold tabular-nums text-[#1D1D1F]" aria-live="polite">{qty}</span>
                    <button type="button" aria-label="Više" onClick={() => setQty(q => Math.min(cfg.maxQty!, q + 1))} disabled={qty >= cfg.maxQty}
                      className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border-2 border-black/15 bg-white text-[#1D1D1F] disabled:opacity-35">
                      <Plus size={24} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-2 rounded-[20px] bg-white p-4">
                {input("ime", { autoComplete: "given-name", placeholder: "npr. Mehmed" })}
                {input("prezime", { autoComplete: "family-name", placeholder: "npr. Hodžić" })}
                {input("adresa", { autoComplete: "street-address", placeholder: "npr. Titova 12" })}
                {input("grad", { autoComplete: "address-level2", placeholder: "npr. Tuzla" })}
                {cfg.requirePostal && input("postanski", { autoComplete: "postal-code", inputMode: "numeric", maxLength: 5, placeholder: "npr. 75000" })}
                {input("telefon", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "npr. 061 234 567" })}
                {honeypot}
              </div>
              <p className="mb-5 flex items-start gap-2 rounded-2xl bg-[#E8F5EC] px-3.5 py-3 text-[13.5px] font-semibold leading-snug text-[#1E7A3C]">
                <Check size={18} strokeWidth={3} className="mt-0.5 shrink-0" /> Narudžba se zaprima automatski, bez poziva. Paket stiže za 1–2 radna dana.
              </p>

              {/* Gift */}
              <label className={`mb-5 flex cursor-pointer items-center gap-4 rounded-[18px] border-2 bg-white p-4 ${gift ? "border-[#16A34A]" : "border-black/15"}`}>
                <input type="checkbox" checked={gift} onChange={e => setGift(e.target.checked)} className="sr-only" />
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border-2 ${gift ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-black/30 bg-white"}`}>
                  {gift && <Check size={24} strokeWidth={3.5} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[15.5px] font-bold text-[#1D1D1F]"><Gift size={20} /> Poklon paket</span>
                  <span className="block text-[13.5px] text-black/60">Iznenađenje u paketu, samo +{GIFT_PRICE} KM</span>
                </span>
              </label>

              {/* Summary */}
              <div className="rounded-[20px] bg-white p-4 text-[15px] text-[#1D1D1F]">
                <div className="flex justify-between py-1"><span className="text-black/65">Proizvod{cfg.maxQty && qty > 1 ? ` (${qty} kom)` : ""}</span><span className="font-semibold tabular-nums">{km(subtotal)}</span></div>
                <div className="flex justify-between py-1"><span className="text-black/65">Dostava</span><span className="font-semibold tabular-nums">{cfg.delivery ? km(cfg.delivery) : "Besplatna"}</span></div>
                {gift && <div className="flex justify-between py-1"><span className="text-black/65">Poklon paket</span><span className="font-semibold tabular-nums">{km(GIFT_PRICE)}</span></div>}
                <div className="mt-2 flex items-baseline justify-between border-t border-black/10 pt-3">
                  <span className="text-[16px] font-bold">Ukupno</span>
                  <span className="text-[22px] font-bold tabular-nums">{km(total)}</span>
                </div>
                <p className="mt-1 text-[13.5px] text-black/55">Plaćate gotovinom kad preuzmete paket.</p>
              </div>
            </div>

            <div className="border-t border-black/[0.08] bg-white px-5 pt-3" style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}>
              {formError && <p role="alert" className="mb-2 text-[14px] font-semibold text-[#D70015]">{formError}</p>}
              <button
                type="submit" disabled={sending}
                className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[18px] text-[17px] font-bold transition-opacity disabled:opacity-60"
                style={{ background: theme.accent, color: theme.on }}
              >
                {sending ? "Šaljem narudžbu…" : `Naruči · ${km(total)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
