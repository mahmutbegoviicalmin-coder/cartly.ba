"use client";

import { StockMeter } from "@/components/store/QuickOrder";
import { useBlackNovember } from "@/lib/campaign";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  ArrowRight, BatteryFull, Briefcase, Check, ChevronLeft, ChevronDown, Clock,
  CreditCard, Gauge, ShieldCheck, ShoppingBag, Timer, Truck,
} from "lucide-react";
import { event } from "@/lib/fbpixel";
import HeroImage from "./HeroImage";
import OrderForm from "./OrderForm";
import { ShipNote } from "@/components/store/ShipNote";

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
];

const KIT = [
  { title: "Akumulatorska brusilica M18", note: "Sa podesivom brzinom" },
  { title: "2 × Li-Ion baterija",          note: "Jedna radi, druga se puni" },
  { title: "Brzi punjač",                  note: "" },
  { title: "Štitnik za disk",              note: "" },
  { title: "Transportni kofer",            note: "Sve na jednom mjestu" },
  { title: "Uputstvo za korištenje",       note: "" },
];

const FEATURES = [
  { Icon: Gauge,       title: "Podesiva brzina",       desc: "Potenciometar za preciznu kontrolu pri svakom brušenju i rezanju." },
  { Icon: ShieldCheck, title: "Anti-kickback zaštita", desc: "Automatska reakcija kada se disk blokira. Alat ostaje pod kontrolom." },
  { Icon: Timer,       title: "Kočnica ispod 1 s",     desc: "Disk se zaustavlja za manje od jedne sekunde nakon otpuštanja." },
  { Icon: BatteryFull, title: "Dvije baterije",        desc: "Radite bez pauze. Dok koristite jednu, druga se puni." },
];

const TRUST = [
  { Icon: CreditCard, title: "Plaćanje pouzećem", desc: "Plaćate pri preuzimanju" },
  { Icon: Truck,      title: "Dostava 1–2 dana",  desc: "Cijela BiH, 10 KM" },
  { Icon: BatteryFull,title: "2 baterije",        desc: "Uključene u set" },
  { Icon: Briefcase,  title: "Kofer u setu",      desc: "Spremno za teren" },
];

const FAQ = [
  { q: "Kako plaćam?",                         a: "Pouzećem. Plaćate kuriru u trenutku preuzimanja paketa, ništa ne plaćate unaprijed." },
  { q: "Koliko košta i koliko traje dostava?", a: "Dostava je 10,00 KM i traje 1–2 radna dana na području cijele Bosne i Hercegovine." },
  { q: "Šta tačno dobijam u setu?",            a: "Akumulatorsku brusilicu M18, dvije Li-Ion baterije, brzi punjač, štitnik za disk, transportni kofer i uputstvo za korištenje." },
  { q: "Šta se dešava nakon narudžbe?",        a: "Narudžba je automatski zaprimljena čim je pošaljete, bez poziva i dodatne potvrde. Paket šaljemo odmah i stiže na vašu adresu za 1–2 radna dana." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BrusilicaPage() {
  const [success,   setSuccess]   = useState(false);
  const [notifIdx,  setNotifIdx]  = useState(0);
  const [notifShow, setNotifShow] = useState(false);
  const checkoutFired = useRef(false);
  const orderRef      = useRef<HTMLElement>(null);
  const timer         = useCountdown();

  // ── Tracking ──
  useEffect(() => {
    event("ViewContent", {
      content_name: "Akumulatorska Brusilica M18 Set",
      content_ids:  ["brusilica-m18-set"],
      content_type: "product",
      value:        74.9,
      currency:     "BAM",
    });
  }, []);

  const fireCheckout = useCallback(() => {
    if (checkoutFired.current) return;
    checkoutFired.current = true;
    event("InitiateCheckout", { value: 74.9, currency: "BAM" });
  }, []);

  function scrollToForm() {
    fireCheckout();
    document.getElementById("narudzba")?.scrollIntoView({ behavior: "smooth" });
  }

  // ── Recent-order toast ──
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

  return (
    <div className="brs-root min-h-screen overflow-x-clip bg-white text-[#1D1D1F] antialiased">
      <style dangerouslySetInnerHTML={{ __html: `
        .brs-root { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .brs-cta { background: #CC0000; transition: background-color 200ms ease, transform 150ms ease; }
        .brs-cta:hover { background: #B30000; }
        .brs-cta:active { transform: scale(0.98); }
        .brs-ghost { transition: background-color 200ms ease; }
        @keyframes brs-spin { to { transform: rotate(360deg); } }
        .brs-spin { animation: brs-spin .75s linear infinite; }
        @keyframes brs-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .brs-rise { animation: brs-rise .7s cubic-bezier(.22,1,.36,1) both; }
        .brs-faq summary::-webkit-details-marker { display: none; }
        .brs-faq[open] .brs-faq-icon { transform: rotate(180deg); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #fff inset !important; -webkit-text-fill-color: #1D1D1F !important; }
        @media (prefers-reduced-motion: reduce) { .brs-rise { animation: none; } }
      ` }} />

      {/* ═══ Header ═══════════════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-[var(--bn-h,0px)] z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <a href="/" className="text-[19px] font-bold tracking-[-0.03em] text-[#1D1D1F]">
              cartly<span className="text-[#CC0000]">.</span>ba
            </a>
            <a href="/" className="hidden items-center gap-0.5 text-[13px] text-[#6E6E73] transition-colors hover:text-[#1D1D1F] sm:flex">
              <ChevronLeft size={14} strokeWidth={2} /> Početna
            </a>
          </div>
          <button onClick={scrollToForm} className="brs-cta h-9 rounded-full px-4 text-[14px] font-semibold text-white">
            Naruči
          </button>
        </div>
      </header>

      <main>
        {/* ═══ Hero ═════════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F5F7] pt-14">
          <div className="mx-auto grid max-w-[1200px] px-4 pb-8 pt-5 sm:px-6 sm:pt-10 lg:grid-cols-[5fr_7fr] lg:gap-x-10 lg:pb-16 lg:pt-12">

            {/* Title */}
            <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
              <p className="text-[13px] font-semibold tracking-[0.01em] text-[#CC0000] sm:text-[15px]">
                Kompletan set u koferu
              </p>
              <h1 className="mt-1.5 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[48px] lg:text-[60px]">
                Akumulatorska brusilica M18.
              </h1>
              <p className="mt-4 hidden max-w-[440px] text-[19px] leading-[1.45] text-[#6E6E73] sm:block">
                Dvije baterije, brzi punjač, štitnik za disk i kofer. Otvorite i počnite raditi.
              </p>
            </div>

            {/* Product */}
            <div className="mt-2 sm:mt-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-center">
              <HeroImage />
            </div>

            {/* Buy */}
            <div className="lg:col-start-1 lg:row-start-2 lg:mt-8 lg:self-start">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums lg:text-[52px]">74,90 KM</span>
                <span className="text-[17px] text-[#86868B] line-through tabular-nums">149,90 KM</span>
                <span className="rounded-full bg-[#CC0000]/10 px-2.5 py-1 text-[13px] font-semibold text-[#CC0000]">−50%</span>
              </div>
              <p className="mt-2 text-[14px] text-[#6E6E73]">+ 10,00 KM dostava · plaćanje pouzećem</p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={scrollToForm}
                  className="brs-cta flex h-[54px] w-full items-center justify-center gap-2 rounded-full px-8 text-[17px] font-semibold text-white sm:w-auto"
                >
                  Naruči odmah <ArrowRight size={18} strokeWidth={2.25} />
                </button>
                {timer && (
                  <p className="flex items-center justify-center gap-1.5 text-[14px] text-[#6E6E73] sm:justify-start">
                    <Clock size={14} strokeWidth={2} />
                    Black November cijena završava za
                    <span className="font-semibold tabular-nums text-[#1D1D1F]">{timer.d > 0 ? `${timer.d}d ` : ""}{pad(timer.h)}:{pad(timer.m)}:{pad(timer.s)}</span>
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
                  <p className="text-[15px] font-semibold leading-tight">{title}</p>
                  <p className="mt-0.5 text-[13px] text-[#6E6E73]">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ═══ What's in the box ═══════════════════════════════════════════ */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="text-[15px] font-semibold text-[#CC0000]">Sadržaj seta</p>
              <h2 className="mt-2 text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[48px]">
                Sve što trebate.<br className="hidden sm:block" /> U jednom koferu.
              </h2>
            </div>

            <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
              <div className="overflow-hidden rounded-[32px] bg-[#F5F5F7]">
                <div className="relative aspect-square">
                  <Image
                    src="/brusilica/brusilica-set.webp"
                    alt="Set brusilice M18 u transportnom koferu: brusilica, dvije baterije, punjač i štitnik"
                    fill
                    sizes="(max-width: 1023px) 100vw, 560px"
                    className="object-contain p-6 mix-blend-multiply sm:p-10"
                  />
                </div>
              </div>

              <div>
                <ul className="divide-y divide-[#E8E8ED] border-y border-[#E8E8ED]">
                  {KIT.map(({ title, note }) => (
                    <li key={title} className="flex items-center gap-4 py-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1D1D1F]">
                        <Check size={15} strokeWidth={2.5} className="text-white" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[17px] font-medium">{title}</p>
                        {note && <p className="text-[14px] text-[#6E6E73]">{note}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToForm}
                  className="brs-ghost mt-8 inline-flex h-[50px] items-center gap-2 rounded-full bg-[#1D1D1F] px-7 text-[16px] font-semibold text-white hover:bg-black"
                >
                  Naruči set za 74,90 KM <ArrowRight size={17} strokeWidth={2.25} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Performance ═════════════════════════════════════════════════ */}
        <section className="bg-white px-4 pb-20 sm:px-6 lg:pb-28">
          <div className="mx-auto max-w-[1200px]">
            {/* Red feature card */}
            <div
              className="relative overflow-hidden rounded-[32px] text-white lg:grid lg:grid-cols-[5fr_7fr] lg:items-center"
              style={{ background: "radial-gradient(120% 120% at 75% 35%, #E32626 0%, #CC0000 40%, #8A0000 100%)" }}
            >
              <div className="relative z-10 px-6 pt-10 sm:px-10 sm:pt-14 lg:py-16 lg:pl-14 lg:pr-0">
                <p className="text-[15px] font-semibold text-white/70">Performanse</p>
                <h2 className="mt-2 text-[32px] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">
                  Snaga koja ostaje pod kontrolom.
                </h2>
                <p className="mt-4 max-w-[420px] text-[17px] leading-[1.5] text-white/75">
                  Bez kabla i bez traženja utičnice. Dvije baterije u setu, pa radite bez pauze.
                </p>
                <button
                  onClick={scrollToForm}
                  className="brs-ghost mt-7 hidden h-[50px] items-center gap-2 rounded-full bg-white px-7 text-[16px] font-semibold text-[#CC0000] hover:bg-white/90 lg:inline-flex"
                >
                  Naruči za 74,90 KM <ArrowRight size={17} strokeWidth={2.25} />
                </button>
              </div>

              <div className="relative aspect-[16/11] lg:aspect-[4/3]">
                <div aria-hidden className="absolute inset-[18%] rounded-full bg-white/20 blur-3xl" />
                <Image
                  src="/brusilica/brusilica-hero.webp"
                  alt="Brusilica M18 s baterijom"
                  fill
                  sizes="(max-width: 1023px) 100vw, 700px"
                  className="object-cover object-[50%_48%] [filter:drop-shadow(0_28px_36px_rgba(0,0,0,0.45))]"
                />
              </div>

              <div className="px-6 pb-8 sm:px-10 lg:hidden">
                <button
                  onClick={scrollToForm}
                  className="brs-ghost flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white text-[16px] font-semibold text-[#CC0000] hover:bg-white/90"
                >
                  Naruči za 74,90 KM <ArrowRight size={17} strokeWidth={2.25} />
                </button>
              </div>
            </div>

            {/* Feature tiles */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} className="rounded-[24px] bg-[#F5F5F7] p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#CC0000]">
                    <Icon size={21} strokeWidth={2} className="text-white" />
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
            {success ? (
              <div className="brs-rise mx-auto flex max-w-[560px] flex-col items-center rounded-[32px] bg-white px-6 py-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.05)] sm:px-12">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1D1D1F]">
                  <Check size={30} strokeWidth={2.5} className="text-white" />
                </span>
                <h2 className="mt-6 text-[28px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">
                  Narudžba je zaprimljena.
                </h2>
                <p className="mt-3 text-[17px] leading-[1.55] text-[#424245]">
                  Hvala vam na povjerenju. Vaša narudžba je evidentirana i trenutno se obrađuje.
                </p>
                <p className="mt-2 text-[15px] text-[#6E6E73]">
                  Narudžba je 100% zaprimljena. Paket stiže na vašu adresu za 1–2 radna dana.
                </p>
                <ShipNote />
                <a href="/" className="brs-ghost mt-8 inline-flex h-[50px] w-full items-center justify-center rounded-full bg-[#1D1D1F] text-[16px] font-semibold text-white hover:bg-black">
                  Vrati se na početnu
                </a>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-10 max-w-[720px] text-center lg:mb-14">
                  <p className="text-[15px] font-semibold text-[#CC0000]">Narudžba</p>
                  <h2 className="mt-2 text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[48px]">
                    Naruči danas.<br /> Plati kad stigne.
                  </h2>
                  <StockMeter slug="brusilica" className="mt-6" />
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
                <details key={q} className="brs-faq group border-b border-[#D2D2D7]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-medium sm:text-[19px]">
                    {q}
                    <ChevronDown size={20} strokeWidth={2} className="brs-faq-icon shrink-0 text-[#6E6E73] transition-transform duration-200" />
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
            cartly<span className="text-[#CC0000]">.</span>ba
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
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7]">
            <ShoppingBag size={15} strokeWidth={2} className="text-[#1D1D1F]" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14px] font-semibold">{NOTIFS[notifIdx]} upravo naručio</p>
            <p className="text-[12px] text-[#86868B]">Brusilica M18, kompletan set</p>
          </div>
        </div>
      </div>

    </div>
  );
}
