"use client";

import { StockMeter } from "@/components/store/QuickOrder";
import { useBlackNovember } from "@/lib/campaign";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  AlertCircle, ArrowRight, BatteryFull, Briefcase, Check, ChevronDown, ChevronLeft,
  Clock, CreditCard, Gauge, Maximize2, ShoppingBag, Truck, Wrench, Zap,
} from "lucide-react";
import { event } from "@/lib/fbpixel";
import OrderForm from "./OrderForm";
import { ShipNote } from "@/components/store/ShipNote";

/** Flip to true when the set is sold out: CTAs and the form are replaced by a notice. */
const OUT_OF_STOCK = false;

// ─── Countdown: real end of Black November, hidden after it ends ─────────────
function useCountdown() {
  const bn = useBlackNovember();
  if (!bn.mounted || !bn.active) return null;
  return { d: bn.days, h: bn.hours, m: bn.minutes, s: bn.seconds };
}
const pad = (n: number) => String(n).padStart(2, "0");

// ─── Content ──────────────────────────────────────────────────────────────────
const NOTIFS = [
  "Mirza iz Sarajeva", "Haris iz Mostara", "Alen iz Banja Luke", "Dino iz Bihaća", "Emir iz Zenice",
  "Adnan iz Tuzle", "Kenan iz Travnika", "Sead iz Brčkog", "Jasmin iz Živinica", "Nedim iz Goražda",
  "Faruk iz Sarajeva", "Tarik iz Kaknja", "Amar iz Konjica", "Eldin iz Gračanice", "Samir iz Doboja",
];

const KIT_MAIN = [
  { title: "Bušilica DeWalt 28V XR", note: "Dva brzinska stepena" },
  { title: "2 × 28V XR baterija",     note: "Litij-ionske" },
  { title: "Punjač",                  note: "Uključen u set" },
  { title: "Tvrdi kofer",             note: "Sve uredno složeno" },
];

const KIT_TOOLS = [
  "Metalna testera + rezervni listovi", "Čekić sa kandžom", "Kombinovana i dugačka kliješta",
  "Podesivi ključ", "Ravni i križni odvijači", "Tester napona (olovka)", "Skalpel / krojački nož",
  "Metar 3 m", "PVC izolir traka", "Set burgija za drvo, metal i beton", "Kutija šrafova, tiplova i pribora",
];

const FEATURES = [
  { Icon: Zap,         title: "28V XR platforma",     desc: "Litij-ionske baterije za snažan rad bez kabla." },
  { Icon: Gauge,       title: "Dvije brzine",         desc: "Sporije za šrafljenje, brže za bušenje. Precizno u oba slučaja." },
  { Icon: Maximize2,   title: "Kompaktna i lagana",   desc: "Lako se drži i stane i u uske prostore." },
  { Icon: BatteryFull, title: "Dvije baterije",       desc: "Dok radite s jednom, druga se puni. Bez pauze." },
];

const TRUST = [
  { Icon: CreditCard, title: "Plaćanje pouzećem", desc: "Plaćate pri preuzimanju" },
  { Icon: Truck,      title: "Dostava 1–2 dana",  desc: "Cijela BiH, 10 KM" },
  { Icon: Wrench,     title: "15+ alata",         desc: "Sve u jednom setu" },
  { Icon: Briefcase,  title: "Tvrdi kofer",       desc: "Za kuću i teren" },
];

const FAQ = [
  { q: "Kako plaćam?",                         a: "Pouzećem. Plaćate kuriru u trenutku preuzimanja paketa, ništa ne plaćate unaprijed." },
  { q: "Koliko košta i koliko traje dostava?", a: "Dostava je 10,00 KM i traje 1–2 radna dana na području cijele Bosne i Hercegovine." },
  { q: "Šta tačno dobijam u setu?",            a: "Bušilicu DeWalt 28V XR, dvije baterije, punjač i preko 15 alata i dodataka (testera, čekić, kliješta, ključ, odvijači, burgije, metar i pribor), sve u tvrdom koferu." },
  { q: "Za koga je ovaj set?",                 a: "Za kućne popravke, renoviranje i majstore kojima treba kompletan alat na jednom mjestu." },
  { q: "Šta se dešava nakon narudžbe?",        a: "Narudžba je automatski zaprimljena čim je pošaljete, bez poziva i dodatne potvrde. Paket šaljemo odmah i stiže na vašu adresu za 1–2 radna dana." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DeWaltPage() {
  const [success,   setSuccess]   = useState(false);
  const [notifIdx,  setNotifIdx]  = useState(0);
  const [notifShow, setNotifShow] = useState(false);
  const checkoutFired = useRef(false);
  const orderRef      = useRef<HTMLElement>(null);
  const timer         = useCountdown();

  // ── Tracking ──
  useEffect(() => {
    event("ViewContent", {
      content_name: "DeWalt 28V XR Set",
      content_ids:  ["dewalt-28v-xr-set"],
      content_type: "product",
      value:        69.9,
      currency:     "BAM",
    });
  }, []);

  const fireCheckout = useCallback(() => {
    if (checkoutFired.current) return;
    checkoutFired.current = true;
    event("InitiateCheckout", { value: 69.9, currency: "BAM" });
  }, []);

  function scrollToForm() {
    if (!OUT_OF_STOCK) fireCheckout();
    document.getElementById("narudzba")?.scrollIntoView({ behavior: "smooth" });
  }

  // ── Recent-order toast ──
  useEffect(() => {
    if (OUT_OF_STOCK) return;
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

  const ctaLabel = OUT_OF_STOCK ? "Rasprodano" : "Naruči odmah";

  return (
    <div className="dw-root min-h-screen overflow-x-clip bg-white text-[#1D1D1F] antialiased">
      <style dangerouslySetInnerHTML={{ __html: `
        .dw-root { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", var(--font-inter), "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .dw-cta { background: #FFC400; color: #111; transition: background-color 200ms ease, transform 150ms ease; }
        .dw-cta:hover { background: #F2B700; }
        .dw-cta:active { transform: scale(0.98); }
        .dw-cta:disabled { background: #E8E8ED; color: #86868B; }
        .dw-ghost { transition: background-color 200ms ease; }
        @keyframes dw-spin { to { transform: rotate(360deg); } }
        .dw-spin { animation: dw-spin .75s linear infinite; }
        .dw-faq summary::-webkit-details-marker { display: none; }
        .dw-faq[open] .dw-faq-icon { transform: rotate(180deg); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #fff inset !important; -webkit-text-fill-color: #1D1D1F !important; }
      ` }} />

      {/* ═══ Header ═══════════════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-[var(--bn-h,0px)] z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <a href="/" className="text-[19px] font-bold tracking-[-0.03em] text-[#1D1D1F]">
              cartly<span className="text-[#FFC400]">.</span>ba
            </a>
            <a href="/" className="hidden items-center gap-0.5 text-[13px] text-[#6E6E73] transition-colors hover:text-[#1D1D1F] sm:flex">
              <ChevronLeft size={14} strokeWidth={2} /> Početna
            </a>
          </div>
          <button onClick={scrollToForm} disabled={OUT_OF_STOCK} className="dw-cta h-9 rounded-full px-4 text-[14px] font-semibold">
            {OUT_OF_STOCK ? "Rasprodano" : "Naruči"}
          </button>
        </div>
      </header>

      <main>
        {/* ═══ Hero ═════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#F5F5F7] pt-14">
          <div className="mx-auto grid max-w-[1200px] px-4 pb-8 pt-5 sm:px-6 sm:pt-10 lg:grid-cols-[6fr_6fr] lg:gap-x-10 lg:pb-16 lg:pt-12">

            {/* Title */}
            <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
              <p className="text-[13px] font-semibold text-[#9A6B00] sm:text-[15px]">
                Kompletan set · 15+ alata u koferu
              </p>
              <h1 className="mt-1.5 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[48px] lg:text-[60px]">
                DeWalt 28V XR<br /> bušilica.
              </h1>
              <p className="mt-4 hidden max-w-[460px] text-[19px] leading-[1.45] text-[#6E6E73] sm:block">
                Dvije baterije, punjač i sav alat koji vam treba za kuću. Složeno u jednom tvrdom koferu.
              </p>
            </div>

            {/* Product */}
            <div className="relative mt-3 h-[268px] sm:mt-6 sm:h-[400px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:h-[560px] lg:self-center">
              <div aria-hidden className="absolute left-1/2 top-1/2 h-[78%] w-[78%] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFC400]/30 blur-3xl" />
              <div aria-hidden className="absolute bottom-[3%] left-1/2 h-[6%] w-[46%] max-w-[300px] -translate-x-1/2 rounded-[50%] bg-black/25 blur-xl" />
              <Image
                src="/dewalt/busilica.webp"
                alt="Akumulatorska bušilica DeWalt 28V XR s baterijom"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 600px"
                className="object-contain"
              />
            </div>

            {/* Buy */}
            <div className="mt-4 lg:col-start-1 lg:row-start-2 lg:mt-8 lg:self-start">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums lg:text-[52px]">69,90 KM</span>
                <span className="text-[17px] tabular-nums text-[#86868B] line-through">199,90 KM</span>
                <span className="rounded-full bg-[#FFC400] px-2.5 py-1 text-[13px] font-semibold text-[#111]">−65%</span>
              </div>
              <p className="mt-2 text-[14px] text-[#6E6E73]">+ 10,00 KM dostava · plaćanje pouzećem</p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={scrollToForm}
                  disabled={OUT_OF_STOCK}
                  className="dw-cta flex h-[54px] w-full items-center justify-center gap-2 rounded-full px-8 text-[17px] font-semibold sm:w-auto"
                >
                  {ctaLabel} {!OUT_OF_STOCK && <ArrowRight size={18} strokeWidth={2.25} />}
                </button>
                {timer && !OUT_OF_STOCK && (
                  <p className="flex items-center justify-center gap-1.5 text-[14px] text-[#6E6E73] sm:justify-start">
                    <Clock size={14} strokeWidth={2} />
                    <span className="whitespace-nowrap"><span className="hidden min-[400px]:inline">Black November cijena</span><span className="min-[400px]:hidden">Cijena</span> završava za</span>
                    <span className="whitespace-nowrap font-semibold tabular-nums text-[#1D1D1F]">{timer.d > 0 ? `${timer.d}d ` : ""}{pad(timer.h)}:{pad(timer.m)}:{pad(timer.s)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Trust strip ═════════════════════════════════════════════════ */}
        <section className="border-b border-[#E8E8ED] bg-white">
          <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:py-10">
            {TRUST.map(({ Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[#1D1D1F]" />
                <div className="min-w-0">
                  <p className="whitespace-nowrap text-[14px] font-semibold leading-tight min-[360px]:text-[15px]">{title}</p>
                  <p className="mt-0.5 whitespace-nowrap text-[12px] text-[#6E6E73] min-[360px]:text-[13px]">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ═══ What's in the box ═══════════════════════════════════════════ */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="text-[15px] font-semibold text-[#9A6B00]">Sadržaj seta</p>
              <h2 className="mt-2 text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[48px]">
                15+ alata.<br /> Jedan kofer.
              </h2>
              <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-[1.5] text-[#6E6E73] sm:text-[19px]">
                Otvorite kofer i imate sve: od bušilice do zadnjeg tipla.
              </p>
            </div>

            <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-14">
              <div className="overflow-hidden rounded-[32px] bg-[#F5F5F7]">
                <div className="relative aspect-square">
                  <Image
                    src="/dewalt/set.webp"
                    alt="DeWalt 28V XR set u otvorenom koferu: bušilica, dvije baterije, punjač i ručni alat"
                    fill
                    sizes="(max-width: 1023px) 100vw, 560px"
                    className="object-cover mix-blend-multiply"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">Glavno</h3>
                <ul className="mt-3 grid grid-cols-2 gap-3">
                  {KIT_MAIN.map(({ title, note }) => (
                    <li key={title} className="rounded-[20px] bg-[#F5F5F7] p-4">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC400]">
                        <Check size={15} strokeWidth={2.75} className="text-[#111]" />
                      </span>
                      <p className="mt-3 text-[16px] font-semibold leading-snug">{title}</p>
                      <p className="mt-0.5 text-[13px] text-[#6E6E73]">{note}</p>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-8 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">Ručni alat i pribor</h3>
                <ul className="mt-2 grid sm:grid-cols-2 sm:gap-x-6">
                  {KIT_TOOLS.map(t => (
                    <li key={t} className="flex items-center gap-3 border-b border-[#E8E8ED] py-3 text-[15px]">
                      <Check size={16} strokeWidth={2.25} className="shrink-0 text-[#1D1D1F]" />
                      {t}
                    </li>
                  ))}
                </ul>

                {!OUT_OF_STOCK && (
                  <button
                    onClick={scrollToForm}
                    className="dw-ghost mt-8 inline-flex h-[50px] items-center gap-2 rounded-full bg-[#1D1D1F] px-7 text-[16px] font-semibold text-white hover:bg-black"
                  >
                    Naruči set za 69,90 KM <ArrowRight size={17} strokeWidth={2.25} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Performance ═════════════════════════════════════════════════ */}
        <section className="bg-white px-4 pb-20 sm:px-6 lg:pb-28">
          <div className="mx-auto max-w-[1200px]">
            <div
              className="relative overflow-hidden rounded-[32px] text-white lg:grid lg:grid-cols-[6fr_6fr] lg:items-center"
              style={{ background: "radial-gradient(70% 90% at 75% 50%, rgba(255,196,0,0.38) 0%, rgba(255,196,0,0.08) 45%, transparent 70%), linear-gradient(160deg, #1C1C1E 0%, #0B0B0C 100%)" }}
            >
              <div className="relative z-10 px-6 pt-10 sm:px-10 sm:pt-14 lg:py-16 lg:pl-14 lg:pr-0">
                <p className="text-[15px] font-semibold text-[#FFC400]">Performanse</p>
                <h2 className="mt-2 text-[32px] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">
                  Buši. Šarafi.<br /> Bez kabla.
                </h2>
                <p className="mt-4 max-w-[420px] text-[17px] leading-[1.5] text-white/70">
                  28V XR baterije i dvije brzine za drvo, metal i zid. Dvije baterije u setu, pa radite bez čekanja.
                </p>
                {!OUT_OF_STOCK && (
                  <button
                    onClick={scrollToForm}
                    className="dw-cta mt-7 hidden h-[50px] items-center gap-2 rounded-full px-7 text-[16px] font-semibold lg:inline-flex"
                  >
                    Naruči za 69,90 KM <ArrowRight size={17} strokeWidth={2.25} />
                  </button>
                )}
              </div>

              <div className="relative mt-4 h-[300px] sm:h-[380px] lg:mt-0 lg:h-[500px]">
                <Image
                  src="/dewalt/busilica.webp"
                  alt="Bušilica DeWalt 28V XR"
                  fill
                  sizes="(max-width: 1023px) 100vw, 600px"
                  className="object-contain p-4 [filter:drop-shadow(0_28px_36px_rgba(0,0,0,0.55))] lg:p-10"
                />
              </div>

              {!OUT_OF_STOCK && (
                <div className="px-6 pb-8 sm:px-10 lg:hidden">
                  <button
                    onClick={scrollToForm}
                    className="dw-cta flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold"
                  >
                    Naruči za 69,90 KM <ArrowRight size={17} strokeWidth={2.25} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} className="rounded-[24px] bg-[#F5F5F7] p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFC400]">
                    <Icon size={21} strokeWidth={2} className="text-[#111]" />
                  </span>
                  <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.5] text-[#6E6E73]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Order ═══════════════════════════════════════════════════════ */}
        <section id="narudzba" ref={orderRef} className="scroll-mt-14 bg-[#F5F5F7] px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1080px]">
            {OUT_OF_STOCK ? (
              <div className="mx-auto flex max-w-[560px] flex-col items-center rounded-[32px] bg-white px-6 py-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.05)] sm:px-12">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F7]">
                  <AlertCircle size={30} strokeWidth={2} className="text-[#1D1D1F]" />
                </span>
                <h2 className="mt-6 text-[28px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">Trenutno rasprodano.</h2>
                <p className="mt-3 text-[17px] leading-[1.55] text-[#424245]">
                  DeWalt 28V XR set je trenutno rasprodan. Pratite nas za povratak zaliha ili pogledajte ostale proizvode.
                </p>
                <a href="/" className="dw-ghost mt-8 inline-flex h-[50px] w-full items-center justify-center rounded-full bg-[#1D1D1F] text-[16px] font-semibold text-white hover:bg-black">
                  Pogledaj ostale proizvode
                </a>
              </div>
            ) : success ? (
              <div className="mx-auto flex max-w-[560px] flex-col items-center rounded-[32px] bg-white px-6 py-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.05)] sm:px-12">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC400]">
                  <Check size={30} strokeWidth={2.5} className="text-[#111]" />
                </span>
                <h2 className="mt-6 text-[28px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">Narudžba je zaprimljena.</h2>
                <p className="mt-3 text-[17px] leading-[1.55] text-[#424245]">
                  Hvala vam na povjerenju. Vaša narudžba je evidentirana i trenutno se obrađuje.
                </p>
                <p className="mt-2 text-[15px] text-[#6E6E73]">Narudžba je 100% zaprimljena. Paket stiže na vašu adresu za 1–2 radna dana.</p>
                <ShipNote />
                <a href="/" className="dw-ghost mt-8 inline-flex h-[50px] w-full items-center justify-center rounded-full bg-[#1D1D1F] text-[16px] font-semibold text-white hover:bg-black">
                  Vrati se na početnu
                </a>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-10 max-w-[720px] text-center lg:mb-14">
                  <p className="text-[15px] font-semibold text-[#9A6B00]">Narudžba</p>
                  <h2 className="mt-2 text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[48px]">
                    Naruči danas.<br /> Plati kad stigne.
                  </h2>
                  <StockMeter slug="dewalt-busilica" className="mt-6" />
                </div>
                <OrderForm onFirstInteraction={fireCheckout} onSuccess={onOrderSuccess} />
              </>
            )}
          </div>
        </section>

        {/* ═══ FAQ ═════════════════════════════════════════════════════════ */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-[760px]">
            <h2 className="text-center text-[28px] font-semibold tracking-[-0.03em] sm:text-[40px]">Česta pitanja</h2>
            <div className="mt-10 border-t border-[#D2D2D7]">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="dw-faq border-b border-[#D2D2D7]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-medium sm:text-[19px]">
                    {q}
                    <ChevronDown size={20} strokeWidth={2} className="dw-faq-icon shrink-0 text-[#6E6E73] transition-transform duration-200" />
                  </summary>
                  <p className="pb-6 pr-8 text-[16px] leading-[1.6] text-[#6E6E73]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ═══ Footer ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#E8E8ED] bg-[#F5F5F7] px-4 pb-28 pt-8 sm:px-6 lg:pb-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 text-[13px] text-[#86868B] sm:flex-row">
          <span className="text-[15px] font-bold tracking-[-0.03em] text-[#1D1D1F]">
            cartly<span className="text-[#FFC400]">.</span>ba
          </span>
          <span>© 2026 · Dostava 1–2 radna dana · Plaćanje pouzećem</span>
        </div>
      </footer>

      {/* ═══ Recent-order toast ══════════════════════════════════════════ */}
      <div
        aria-hidden
        className={`pointer-events-none fixed left-4 z-40 max-w-[calc(100vw-32px)] transition-all duration-300 sm:left-6 bottom-[104px] lg:bottom-6 ${notifShow ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/90 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFC400]">
            <ShoppingBag size={15} strokeWidth={2} className="text-[#111]" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14px] font-semibold">{NOTIFS[notifIdx]} upravo naručio</p>
            <p className="text-[12px] text-[#86868B]">DeWalt 28V XR, kompletan set</p>
          </div>
        </div>
      </div>

    </div>
  );
}
