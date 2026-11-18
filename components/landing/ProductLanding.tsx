"use client";

import { StockMeter } from "@/components/store/QuickOrder";
import { useBlackNovember } from "@/lib/campaign";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  type LucideIcon, AlertCircle, ArrowRight, Check, ChevronDown, ChevronLeft, Clock, CreditCard, Lock, Minus, Plus, ShoppingBag, Star, Truck,
} from "lucide-react";
import { event } from "@/lib/fbpixel";
import GiftAddon from "@/components/GiftAddon";
import { GIFT_PRICE } from "@/lib/gift";
import { BlackNovemberCartNote } from "@/components/store/BlackNovember";
import ProductOnFloor from "@/components/store/ProductOnFloor";

/*
 * Shared premium landing page for single products (Milwaukee set, Milwaukee
 * drill, Set 2u1, …). Each page passes a config: copy, images, colours and how
 * its order API expects the payload. Ordering, Meta Pixel events and prices
 * stay exactly what each product's API already handles.
 */

type Icon = LucideIcon;

export type LandingConfig = {
  slug: string;              // catalog slug (used for /shop/<slug> hero cut-out)
  pixelName: string;         // content_name for Meta events
  contentId: string;
  price: number;
  oldPrice: number;
  shipping: number;
  maxQty: number;            // 1 = no quantity picker
  api: string;
  /** "split": API wants ime + prezime + postanski_broj + kolicina. "single": ime (full name) only. */
  nameMode: "single" | "split";
  sendExternalId?: boolean;

  accent: string;            // brand colour of the product
  accentHover: string;
  onAccent: string;          // text colour on accent
  accentText: string;        // accent usable as text on white

  kicker: string;
  title: string;             // \n for line breaks
  subtitle: string;
  heroChips: string[];
  gallery?: { src: string; alt: string }[];

  trust: { Icon: Icon; title: string; desc: string }[];

  kit: {
    title: string;
    text: string;
    image: string;           // cut-out of the full kit
    imageSm: string;
    items: { Icon: Icon; title: string; note: string }[];
  };

  perf: { kicker: string; title: string; text: string; stats: { value: string; label: string }[] };
  /** Optional "bought separately vs. this set" value section. */
  valueStack?: { title: string; items: string[] };
  features: { Icon: Icon; title: string; desc: string }[];
  details?: { src: string; title: string; text: string }[];
  reviews: { name: string; city: string; text: string }[];
  faq: { q: string; a: string }[];

  countdownKey: string;
  toastLabel: string;
};

const km = (n: number) => `${n.toFixed(2).replace(".", ",")} KM`;
const pad = (n: number) => String(n).padStart(2, "0");

const NOTIFS = [
  "Mirza iz Sarajeva", "Haris iz Mostara", "Alen iz Banja Luke", "Dino iz Bihaća", "Emir iz Zenice",
  "Adnan iz Tuzle", "Kenan iz Travnika", "Sead iz Brčkog", "Jasmin iz Živinica", "Nedim iz Goražda",
  "Faruk iz Sarajeva", "Tarik iz Kaknja", "Amar iz Konjica", "Eldin iz Gračanice", "Samir iz Doboja",
];

/** Real time left until the end of Black November (null after it ends). */
function useCountdown() {
  const bn = useBlackNovember();
  if (!bn.mounted || !bn.active) return null;
  return { d: bn.days, h: bn.hours, m: bn.minutes, s: bn.seconds };
}

// ─── Order form ───────────────────────────────────────────────────────────────
type Fields = { ime: string; prezime: string; adresa: string; postanski_broj: string; grad: string; telefon: string };

function OrderForm({ c, onFirstInteraction, onSuccess }: { c: LandingConfig; onFirstInteraction: () => void; onSuccess: () => void }) {
  const [f, setF] = useState<Fields>({ ime: "", prezime: "", adresa: "", postanski_broj: "", grad: "", telefon: "" });
  const [qty, setQty] = useState(1);
  const [gift, setGift] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productTotal = c.price * qty;
  const total = productTotal + c.shipping + (gift ? GIFT_PRICE : 0);

  const split = c.nameMode === "split";
  const fields: { name: keyof Fields; label: string; placeholder: string; type: string; auto: string; span: 1 | 2; numeric?: boolean }[] = [
    ...(split
      ? [
          { name: "ime" as const, label: "Ime", placeholder: "npr. Emir", type: "text", auto: "given-name", span: 1 as const },
          { name: "prezime" as const, label: "Prezime", placeholder: "npr. Hadžić", type: "text", auto: "family-name", span: 1 as const },
        ]
      : [{ name: "ime" as const, label: "Ime i prezime", placeholder: "npr. Emir Hadžić", type: "text", auto: "name", span: 2 as const }]),
    { name: "adresa", label: "Adresa dostave", placeholder: "npr. Titova 12", type: "text", auto: "street-address", span: 2 },
    { name: "postanski_broj", label: "Poštanski broj", placeholder: "npr. 71000", type: "text", auto: "postal-code", span: 1, numeric: true },
    { name: "grad", label: "Grad", placeholder: "npr. Sarajevo", type: "text", auto: "address-level2", span: 1 },
    { name: "telefon", label: "Broj telefona", placeholder: "npr. 061 123 456", type: "tel", auto: "tel", span: 2 },
  ];

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name as keyof Fields;
    const value = name === "postanski_broj" ? e.target.value.replace(/\D/g, "").slice(0, 5) : e.target.value;
    setF(p => ({ ...p, [name]: value }));
    if (error) setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const missing = !f.ime.trim() || (split && !f.prezime.trim()) || !f.adresa.trim() || !f.postanski_broj.trim() || !f.grad.trim() || !f.telefon.trim();
    if (missing) { setError("Molimo popunite sva obavezna polja."); return; }
    if (f.postanski_broj.length < 4) { setError("Unesite ispravan poštanski broj."); return; }
    if (!/^[0-9+\s\-()]{6,}$/.test(f.telefon.trim())) { setError("Unesite ispravan broj telefona."); return; }
    setLoading(true); setError(null); onFirstInteraction();
    try {
      let externalId = "";
      if (c.sendExternalId) { try { externalId = localStorage.getItem("_crt_eid") || ""; } catch { /* private mode */ } }
      const body = split
        ? {
            ime: f.ime.trim(), prezime: f.prezime.trim(), adresa: f.adresa.trim(), grad: f.grad.trim(),
            postanski_broj: f.postanski_broj.trim(), telefon: f.telefon.trim(), kolicina: qty, poklon: gift,
            ...(c.sendExternalId ? { externalId } : {}),
          }
        : { ime: f.ime.trim(), adresa: f.adresa.trim(), grad: f.grad.trim(), telefon: f.telefon.trim(), poklon: gift };
      const res = await fetch(c.api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Greška pri slanju.");
      // orderNumber as eventID deduplicates against the server-side CAPI event
      event("Purchase", {
        content_name: c.pixelName, content_ids: [c.contentId], content_type: "product",
        value: c.price * qty + c.shipping + (gift ? GIFT_PRICE : 0), currency: "BAM", num_items: qty,
      }, json.orderNumber);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Greška pri slanju narudžbe. Pokušajte ponovo.");
    } finally { setLoading(false); }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <form onSubmit={onSubmit} onFocus={onFirstInteraction} noValidate className="rounded-[28px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)] sm:p-8">
        <h3 className="text-[21px] font-semibold tracking-[-0.02em]">Podaci za dostavu</h3>
        <p className="mt-1 text-[14px] text-[#6E6E73]">Ništa ne plaćate unaprijed.</p>

        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4">
          {fields.map(fl => (
            <label key={fl.name} className={fl.span === 2 ? "col-span-2" : "col-span-1 min-w-0"}>
              <span className="mb-1.5 block text-[13px] font-medium text-[#424245]">{fl.label}</span>
              <input
                name={fl.name}
                type={fl.type}
                value={f[fl.name]}
                onChange={onChange}
                placeholder={fl.placeholder}
                autoComplete={fl.auto}
                inputMode={fl.numeric ? "numeric" : undefined}
                required
                className="lp-input h-[52px] w-full min-w-0 rounded-[14px] border border-[#D2D2D7] bg-white px-4 text-[16px] outline-none transition-[border-color,box-shadow] placeholder:text-[#A1A1A6]"
              />
            </label>
          ))}
        </div>

        {c.maxQty > 1 && (
          <div className="mt-5 flex items-center justify-between rounded-[16px] bg-[#F5F5F7] px-4 py-3">
            <div>
              <p className="text-[15px] font-semibold">Količina</p>
              <p className="text-[13px] text-[#6E6E73]">{km(c.price)} po setu</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <button type="button" aria-label="Manje" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F5F5F7] disabled:opacity-30">
                <Minus size={16} strokeWidth={2.25} />
              </button>
              <span className="w-8 text-center text-[16px] font-semibold tabular-nums">{qty}</span>
              <button type="button" aria-label="Više" onClick={() => setQty(q => Math.min(c.maxQty, q + 1))} disabled={qty >= c.maxQty} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F5F5F7] disabled:opacity-30">
                <Plus size={16} strokeWidth={2.25} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-4 flex items-center gap-2.5 rounded-[14px] bg-[#D70015]/[0.06] px-4 py-3 text-[14px] font-medium text-[#D70015]">
            <AlertCircle size={16} strokeWidth={2} className="shrink-0" /> <span>{error}</span>
          </div>
        )}

        <GiftAddon checked={gift} onChange={setGift} accent={c.accentText} style={{ marginTop: 20 }} />
        <BlackNovemberCartNote className="mt-5" />

        <div className="mt-5 flex items-baseline justify-between border-t border-[#E8E8ED] pt-4">
          <span className="text-[15px] text-[#6E6E73]">Ukupno za plaćanje</span>
          <span className="text-[22px] font-semibold tabular-nums tracking-[-0.02em]">{km(total)}</span>
        </div>

        <button type="submit" disabled={loading} className="lp-cta mt-4 flex h-[56px] w-full items-center justify-center gap-2 rounded-full text-[17px] font-semibold disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? (
            <>
              <svg className="lp-spin h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Slanje narudžbe...
            </>
          ) : (<>Potvrdi narudžbu <ArrowRight size={18} strokeWidth={2.25} /></>)}
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-[#86868B]">
          <Lock size={13} strokeWidth={2} /> Sigurna narudžba. Plaćanje pouzećem.
        </p>
      </form>

      <aside className="rounded-[28px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)] sm:p-7 lg:sticky lg:top-20">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[300px] rounded-[20px] bg-[#F5F5F7]">
          <ProductOnFloor slug={c.slug} src={`/shop/sm/${c.slug}.webp`} alt="" sizes="300px" tileAspect={4 / 3} floor={12} area={0.4} maxH={0.8} shadow="0,0,0" />
        </div>
        <h4 className="mt-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">Sažetak narudžbe</h4>
        <dl className="mt-3 space-y-3 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-[#424245]">{c.pixelName}{qty > 1 ? ` × ${qty}` : ""}</dt>
            <dd className="shrink-0 font-medium tabular-nums">{km(productTotal)}</dd>
          </div>
          {gift && (
            <div className="flex justify-between gap-4"><dt className="text-[#424245]">Poklon iznenađenja</dt><dd className="shrink-0 font-medium tabular-nums">{km(GIFT_PRICE)}</dd></div>
          )}
          <div className="flex justify-between gap-4"><dt className="text-[#424245]">Dostava</dt><dd className="shrink-0 font-medium tabular-nums">{km(c.shipping)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-[#424245]">Plaćanje</dt><dd className="shrink-0 font-medium">Pouzećem</dd></div>
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-[#E8E8ED] pt-4">
          <span className="text-[17px] font-semibold">Ukupno</span>
          <span className="text-[30px] font-semibold tabular-nums tracking-[-0.03em]">{km(total)}</span>
        </div>
        <ul className="mt-6 space-y-3 border-t border-[#E8E8ED] pt-5 text-[14px] text-[#424245]">
          {[
            { I: CreditCard, t: "Plaćate kuriru pri preuzimanju" },
            { I: Truck, t: "Dostava 1–2 radna dana, cijela BiH" },
            { I: Check, t: "Narudžba automatski zaprimljena" },
          ].map(({ I, t }) => (
            <li key={t} className="flex items-center gap-3"><I size={16} strokeWidth={2} className="shrink-0" />{t}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductLanding({ c }: { c: LandingConfig }) {
  const [success, setSuccess] = useState(false);
  const [notifIdx, setNotifIdx] = useState(0);
  const [notifShow, setNotifShow] = useState(false);
  const [shot, setShot] = useState(0);
  const checkoutFired = useRef(false);
  const orderRef = useRef<HTMLElement>(null);
  const timer = useCountdown();
  const discount = Math.round((1 - c.price / c.oldPrice) * 100);

  useEffect(() => {
    event("ViewContent", { content_name: c.pixelName, content_ids: [c.contentId], content_type: "product", value: c.price, currency: "BAM" });
  }, [c.pixelName, c.contentId, c.price]);

  const fireCheckout = useCallback(() => {
    if (checkoutFired.current) return;
    checkoutFired.current = true;
    event("InitiateCheckout", { content_name: c.pixelName, content_ids: [c.contentId], content_type: "product", value: c.price + c.shipping, currency: "BAM", num_items: 1 });
  }, [c.pixelName, c.contentId, c.price, c.shipping]);

  function scrollToForm() {
    event("AddToCart", { content_name: c.pixelName, content_ids: [c.contentId], content_type: "product", value: c.price, currency: "BAM" });
    fireCheckout();
    document.getElementById("narudzba")?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const id = setInterval(() => {
      setNotifShow(true);
      timeouts.push(setTimeout(() => {
        setNotifShow(false);
        timeouts.push(setTimeout(() => setNotifIdx(i => (i + 1) % NOTIFS.length), 500));
      }, 4_000));
    }, 30_000);
    return () => { clearInterval(id); timeouts.forEach(clearTimeout); };
  }, []);

  function onOrderSuccess() {
    setSuccess(true);
    requestAnimationFrame(() => document.getElementById("narudzba")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const gallery = c.gallery ?? [];
  const glow = `${c.accent}40`;

  return (
    <div
      className="lp-root min-h-screen overflow-x-clip bg-white text-[#1D1D1F] antialiased"
      style={{ ["--acc" as string]: c.accent, ["--acc-h" as string]: c.accentHover, ["--acc-on" as string]: c.onAccent, ["--acc-t" as string]: c.accentText }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .lp-root { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .lp-cta { background: var(--acc); color: var(--acc-on); transition: background-color 200ms ease, transform 150ms ease; }
        .lp-cta:hover { background: var(--acc-h); }
        .lp-cta:active { transform: scale(0.98); }
        .lp-input:focus { border-color: #1D1D1F; box-shadow: 0 0 0 4px color-mix(in srgb, var(--acc) 22%, transparent); }
        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spin { animation: lp-spin .75s linear infinite; }
        .lp-faq summary::-webkit-details-marker { display: none; }
        .lp-faq[open] .lp-faq-icon { transform: rotate(180deg); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #fff inset !important; -webkit-text-fill-color: #1D1D1F !important; }
      ` }} />

      {/* ═══ Header ═══ */}
      <header className="fixed inset-x-0 top-[var(--bn-h,0px)] z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <a href="/" className="text-[19px] font-bold tracking-[-0.03em]">cartly<span style={{ color: c.accent }}>.</span>ba</a>
            <a href="/" className="hidden items-center gap-0.5 text-[13px] text-[#6E6E73] transition-colors hover:text-[#1D1D1F] sm:flex">
              <ChevronLeft size={14} strokeWidth={2} /> Početna
            </a>
          </div>
          <button onClick={scrollToForm} className="lp-cta h-9 rounded-full px-4 text-[14px] font-semibold">Naruči</button>
        </div>
      </header>

      <main>
        {/* ═══ Hero ═══ */}
        <section className="relative overflow-hidden bg-[#F5F5F7] pt-14">
          <div className="mx-auto grid max-w-[1200px] px-4 pb-8 pt-5 sm:px-6 sm:pt-10 lg:grid-cols-[5fr_7fr] lg:gap-x-10 lg:pb-16 lg:pt-12">
            <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
              <p className="text-[13px] font-semibold sm:text-[15px]" style={{ color: c.accentText }}>{c.kicker}</p>
              <h1 className="mt-1.5 whitespace-pre-line text-[34px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[48px] lg:text-[58px]">{c.title}</h1>
              <p className="mt-4 hidden max-w-[460px] text-[19px] leading-[1.45] text-[#6E6E73] sm:block">{c.subtitle}</p>
            </div>

            {/* Product stage + gallery */}
            <div className="relative mt-3 sm:mt-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-center">
              <div className="relative h-[290px] sm:h-[420px] lg:h-[540px]">
                <div aria-hidden className="absolute left-1/2 top-1/2 h-[80%] w-[80%] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: glow }} />
                {shot === 0 || !gallery.length ? (
                  <ProductOnFloor slug={c.slug} src={`/shop/${c.slug}.webp`} alt={c.pixelName} priority sizes="(max-width: 1023px) 90vw, 640px" tileAspect={1.3} floor={8} area={0.55} maxW={0.95} maxH={0.88} shadow="0,0,0" />
                ) : (
                  <div className="absolute inset-[6%] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
                    <Image src={gallery[shot - 1].src} alt={gallery[shot - 1].alt} fill sizes="(max-width: 1023px) 90vw, 600px" className="object-contain" />
                  </div>
                )}
              </div>
              {gallery.length > 0 && (
                <div className="mt-3 flex justify-center gap-2">
                  {[{ src: `/shop/sm/${c.slug}.webp`, alt: c.pixelName }, ...gallery].map((g, i) => (
                    <button
                      key={g.src}
                      onClick={() => setShot(i)}
                      aria-label={`Slika ${i + 1}`}
                      className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-white transition-all sm:h-16 sm:w-16 sm:rounded-[14px] ${shot === i ? "ring-2 ring-offset-2 ring-offset-[#F5F5F7]" : "opacity-70 hover:opacity-100"}`}
                      style={shot === i ? { ["--tw-ring-color" as string]: c.accent } : undefined}
                    >
                      <Image src={g.src} alt="" fill sizes="64px" className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buy */}
            <div className="mt-5 lg:col-start-1 lg:row-start-2 lg:mt-8 lg:self-start">
              <ul className="mb-5 flex flex-wrap gap-2">
                {c.heroChips.map(t => (
                  <li key={t} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <Check size={14} strokeWidth={2.5} style={{ color: c.accentText }} /> {t}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums lg:text-[52px]">{km(c.price)}</span>
                <span className="text-[17px] tabular-nums text-[#86868B] line-through">{km(c.oldPrice)}</span>
                <span className="rounded-full px-2.5 py-1 text-[13px] font-semibold" style={{ background: c.accent, color: c.onAccent }}>−{discount}%</span>
              </div>
              <p className="mt-2 text-[14px] text-[#6E6E73]">Uštedite {km(c.oldPrice - c.price)} · + {km(c.shipping)} dostava · plaćanje pouzećem</p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={scrollToForm} className="lp-cta flex h-[54px] w-full items-center justify-center gap-2 rounded-full px-8 text-[17px] font-semibold sm:w-auto">
                  Naruči odmah <ArrowRight size={18} strokeWidth={2.25} />
                </button>
                {timer && (
                  <p className="flex items-center justify-center gap-1.5 text-[14px] text-[#6E6E73] sm:justify-start">
                    <Clock size={14} strokeWidth={2} /> Black November cijena završava za
                    <span className="font-semibold tabular-nums text-[#1D1D1F]">{timer.d > 0 ? `${timer.d}d ` : ""}{pad(timer.h)}:{pad(timer.m)}:{pad(timer.s)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Trust ═══ */}
        <section className="border-b border-[#E8E8ED] bg-white">
          <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:py-10">
            {c.trust.map(({ Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon size={22} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold leading-tight">{title}</p>
                  <p className="mt-0.5 text-[13px] text-[#6E6E73]">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ═══ In the box ═══ */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="text-[15px] font-semibold" style={{ color: c.accentText }}>Šta dobijate</p>
              <h2 className="mt-2 whitespace-pre-line text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[48px]">{c.kit.title}</h2>
              <p className="mx-auto mt-4 max-w-[540px] text-[17px] leading-[1.5] text-[#6E6E73] sm:text-[19px]">{c.kit.text}</p>
            </div>

            <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-14">
              <div className="relative overflow-hidden rounded-[32px] bg-[#F5F5F7]">
                <div className="relative aspect-square">
                  <div aria-hidden className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: `${c.accent}26` }} />
                  <div aria-hidden className="absolute bottom-[7%] left-1/2 h-[5%] w-[64%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.25),transparent)]" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.kit.image}
                    srcSet={`${c.kit.imageSm} 640w, ${c.kit.image} 1200w`}
                    sizes="(max-width: 1023px) 90vw, 560px"
                    alt="Sve što dobijate u setu"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-x-[8%] bottom-[9%] top-[8%] h-[83%] w-[84%] object-contain object-bottom"
                  />
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-3">
                {c.kit.items.map(({ Icon, title, note }) => (
                  <li key={title} className="rounded-[22px] bg-[#F5F5F7] p-4 sm:p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: c.accent, color: c.onAccent }}>
                      <Icon size={19} strokeWidth={2} />
                    </span>
                    <p className="mt-3 text-[15px] font-semibold leading-snug sm:text-[16px]">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-[#6E6E73]">{note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══ Value stack ═══ */}
        {c.valueStack && (
          <section className="bg-white px-4 pb-20 sm:px-6 lg:pb-28">
            <div className="mx-auto grid max-w-[1080px] items-center gap-8 rounded-[32px] bg-[#F5F5F7] p-6 sm:p-10 lg:grid-cols-[1fr_420px] lg:p-14">
              <div>
                <p className="text-[15px] font-semibold" style={{ color: c.accentText }}>Isplati se</p>
                <h2 className="mt-2 whitespace-pre-line text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[42px]">{c.valueStack.title}</h2>
                <p className="mt-4 max-w-[420px] text-[17px] leading-[1.5] text-[#6E6E73]">
                  Redovna cijena seta je {km(c.oldPrice)}. Sada ga plaćate {km(c.price)} i uštedite {km(c.oldPrice - c.price)}.
                </p>
                <button onClick={scrollToForm} className="lp-cta mt-7 inline-flex h-[52px] items-center gap-2 rounded-full px-7 text-[16px] font-semibold">
                  Uzmi set za {km(c.price)} <ArrowRight size={17} strokeWidth={2.25} />
                </button>
              </div>
              <div className="rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-20px_rgba(0,0,0,0.25)] sm:p-7">
                <ul className="divide-y divide-[#E8E8ED]">
                  {c.valueStack.items.map(i => (
                    <li key={i} className="flex items-center gap-2.5 py-3 text-[15px]">
                      <Check size={16} strokeWidth={2.5} style={{ color: c.accentText }} /> {i}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between border-t-2 border-[#1D1D1F] pt-4">
                  <span className="text-[15px] text-[#6E6E73]">Redovna cijena</span>
                  <span className="text-[17px] tabular-nums text-[#86868B] line-through">{km(c.oldPrice)}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[17px] font-semibold">Cijena seta</span>
                  <span className="text-[34px] font-semibold tabular-nums tracking-[-0.03em]" style={{ color: c.accentText }}>{km(c.price)}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══ Performance band ═══ */}
        <section className="bg-white px-4 pb-20 sm:px-6 lg:pb-28">
          <div className="mx-auto max-w-[1200px]">
            <div
              className="relative overflow-hidden rounded-[32px] text-white lg:grid lg:grid-cols-[6fr_6fr] lg:items-center"
              style={{ background: `radial-gradient(70% 90% at 75% 50%, ${c.accent}66 0%, ${c.accent}14 45%, transparent 70%), linear-gradient(160deg, #1C1C1E 0%, #0B0B0C 100%)` }}
            >
              <div className="relative z-10 px-6 pt-10 sm:px-10 sm:pt-14 lg:py-16 lg:pl-14 lg:pr-0">
                <p className="text-[15px] font-semibold" style={{ color: c.accent === "#FFC400" ? c.accent : "#FF8A80" }}>{c.perf.kicker}</p>
                <h2 className="mt-2 whitespace-pre-line text-[32px] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">{c.perf.title}</h2>
                <p className="mt-4 max-w-[440px] text-[17px] leading-[1.5] text-white/70">{c.perf.text}</p>
                <dl className="mt-8 grid max-w-[460px] grid-cols-3 gap-4 border-t border-white/15 pt-6">
                  {c.perf.stats.map(s => (
                    <div key={s.label}>
                      <dt className="text-[28px] font-semibold leading-none tracking-[-0.03em] sm:text-[34px]">{s.value}</dt>
                      <dd className="mt-1.5 text-[12px] leading-snug text-white/60 sm:text-[13px]">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="relative mt-6 h-[300px] sm:h-[380px] lg:mt-0 lg:h-[520px]">
                <ProductOnFloor slug={c.slug} src={`/shop/${c.slug}.webp`} alt="" sizes="(max-width: 1023px) 90vw, 600px" tileAspect={1.15} floor={10} area={0.5} maxW={0.9} maxH={0.85} shadow="0,0,0" />
              </div>
              <div className="px-6 pb-8 sm:px-10 lg:hidden">
                <button onClick={scrollToForm} className="lp-cta flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold">
                  Naruči za {km(c.price)} <ArrowRight size={17} strokeWidth={2.25} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {c.features.map(({ Icon, title, desc }) => (
                <div key={title} className="rounded-[24px] bg-[#F5F5F7] p-4 sm:p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:h-11 sm:w-11">
                    <Icon size={20} strokeWidth={2} className="text-[#1D1D1F]" />
                  </span>
                  <h3 className="mt-4 text-[16px] font-semibold leading-snug tracking-[-0.02em] sm:mt-5 sm:text-[19px]">{title}</h3>
                  <p className="mt-1 text-[13px] leading-[1.45] text-[#6E6E73] sm:mt-1.5 sm:text-[15px] sm:leading-[1.5]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Details ═══ */}
        {c.details && c.details.length > 0 && (
          <section className="bg-[#F5F5F7] px-4 py-20 sm:px-6 lg:py-28">
            <div className="mx-auto max-w-[1200px]">
              <h2 className="text-center text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[44px]">Pogledajte izbliza.</h2>
              <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {c.details.map(d => (
                  <figure key={d.src} className="overflow-hidden rounded-[24px] bg-white">
                    <div className="relative aspect-square">
                      <Image src={d.src} alt={d.title} fill sizes="(max-width: 640px) 90vw, 280px" className="object-cover" />
                    </div>
                    <figcaption className="p-4 sm:p-5">
                      <p className="text-[15px] font-semibold sm:text-[16px]">{d.title}</p>
                      <p className="mt-1 text-[13px] leading-[1.45] text-[#6E6E73] sm:text-[14px]">{d.text}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ Reviews ═══ */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={20} strokeWidth={0} className="fill-[#FFB800]" />)}
              </div>
              <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[44px]">Kupci kažu.</h2>
            </div>
            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {c.reviews.map(r => (
                <figure key={r.name} className="flex flex-col rounded-[24px] bg-[#F5F5F7] p-6 sm:p-7">
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} strokeWidth={0} className="fill-[#FFB800]" />)}</div>
                  <blockquote className="mt-3 flex-1 text-[16px] leading-[1.6]">&bdquo;{r.text}&ldquo;</blockquote>
                  <figcaption className="mt-5 text-[14px]"><span className="font-semibold">{r.name}</span><span className="text-[#6E6E73]"> · {r.city}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Order ═══ */}
        <section id="narudzba" ref={orderRef} className="scroll-mt-14 bg-[#F5F5F7] px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1080px]">
            {success ? (
              <div className="mx-auto flex max-w-[560px] flex-col items-center rounded-[32px] bg-white px-6 py-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.05)] sm:px-12">
                <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: c.accent, color: c.onAccent }}>
                  <Check size={30} strokeWidth={2.5} />
                </span>
                <h2 className="mt-6 text-[28px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">Narudžba je zaprimljena.</h2>
                <p className="mt-3 text-[17px] leading-[1.55] text-[#424245]">Hvala vam na povjerenju. Narudžba je 100% zaprimljena i paket šaljemo odmah.</p>
                <p className="mt-2 text-[15px] text-[#6E6E73]">Paket stiže na vašu adresu za 1–2 radna dana. Plaćate kuriru pri preuzimanju.</p>
                <a href="/" className="mt-8 inline-flex h-[50px] w-full items-center justify-center rounded-full bg-[#1D1D1F] text-[16px] font-semibold text-white transition-colors hover:bg-black">
                  Vrati se na početnu
                </a>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-10 max-w-[720px] text-center lg:mb-14">
                  <p className="text-[15px] font-semibold" style={{ color: c.accentText }}>Narudžba</p>
                  <h2 className="mt-2 text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[48px]">Naruči danas.<br /> Plati kad stigne.</h2>
                  <StockMeter slug={c.slug} className="mt-6" />
                </div>
                <OrderForm c={c} onFirstInteraction={fireCheckout} onSuccess={onOrderSuccess} />
              </>
            )}
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-[760px]">
            <h2 className="text-center text-[28px] font-semibold tracking-[-0.03em] sm:text-[40px]">Česta pitanja</h2>
            <div className="mt-10 border-t border-[#D2D2D7]">
              {c.faq.map(({ q, a }) => (
                <details key={q} className="lp-faq border-b border-[#D2D2D7]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-medium sm:text-[19px]">
                    {q}
                    <ChevronDown size={20} strokeWidth={2} className="lp-faq-icon shrink-0 text-[#6E6E73] transition-transform duration-200" />
                  </summary>
                  <p className="pb-6 pr-8 text-[16px] leading-[1.6] text-[#6E6E73]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E8E8ED] bg-[#F5F5F7] px-4 pb-28 pt-8 sm:px-6 lg:pb-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 text-[13px] text-[#86868B] sm:flex-row">
          <a href="/" className="text-[15px] font-bold tracking-[-0.03em] text-[#1D1D1F]">cartly<span style={{ color: c.accent }}>.</span>ba</a>
          <span>© 2026 · Dostava 1–2 radna dana · Plaćanje pouzećem</span>
        </div>
      </footer>

      {/* Recent-order toast */}
      <div
        aria-hidden
        className={`pointer-events-none fixed left-4 z-40 max-w-[calc(100vw-32px)] transition-all duration-300 sm:left-6 bottom-[104px] lg:bottom-6 ${notifShow ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/90 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: c.accent, color: c.onAccent }}>
            <ShoppingBag size={15} strokeWidth={2} />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14px] font-semibold">{NOTIFS[notifIdx]} upravo naručio</p>
            <p className="text-[12px] text-[#86868B]">{c.toastLabel}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
