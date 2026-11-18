"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgePercent, ChevronLeft, ChevronRight } from "lucide-react";
import { CatalogProduct, MAX_DISCOUNT, bySlug, discountPct, heroImage, km } from "@/lib/catalog";
import { useBlackNovember } from "@/lib/campaign";
import { Countdown } from "./BlackNovember";
import Lisko from "./Lisko";
import ProductOnFloor from "./ProductOnFloor";

const SLIDE_MS = 7000;

type Slide = {
  key: string;
  product: CatalogProduct;
  kicker: string;
  title: string;
  watermark: string;
  /** Background (CSS), text tone, button colours, contact-shadow rgb. */
  bg: string;
  light: boolean;
  btn: string;
  btnText: string;
  shadow: string;
  campaign?: boolean;
};

function buildSlides(bnActive: boolean): Slide[] {
  const s = (slug: string) => bySlug(slug)!;
  const out: Slide[] = [];
  if (bnActive) out.push({
    key: "bn", product: s("set-2u1"), kicker: "Black November", title: `Do −${MAX_DISCOUNT}%\nna sve proizvode`, watermark: `−${MAX_DISCOUNT}%`,
    bg: "radial-gradient(120% 90% at 75% 30%, #FF7A55 0%, #F45B39 45%, #D9431F 100%)", light: true, btn: "#2A1E18", btnText: "#FFFFFF", shadow: "90,20,5", campaign: true,
  });
  out.push(
    { key: "milwaukee", product: s("milwaukee-set-31"), kicker: "Milwaukee Set 3.1", title: "Tri alata.\nJedan kofer.", watermark: "M12",
      bg: "radial-gradient(120% 90% at 75% 30%, #EE2B2B 0%, #C8102E 50%, #8E0A1F 100%)", light: true, btn: "#FFFFFF", btnText: "#C8102E", shadow: "60,0,8" },
    { key: "dewalt", product: s("dewalt-busilica"), kicker: "DeWalt 28V XR", title: "Sve što treba\nza kuću.", watermark: "XR",
      bg: "radial-gradient(120% 90% at 75% 30%, #FFD84D 0%, #FFC400 50%, #E9A800 100%)", light: false, btn: "#1D1D1F", btnText: "#FFC400", shadow: "90,60,0" },
    { key: "motorka", product: s("motorna-pila"), kicker: "Motorna pila 4,9 KS", title: "Snaga za\nsvaku cjepanicu.", watermark: "4,9 KS",
      bg: "radial-gradient(120% 90% at 75% 30%, #FFFFFF 0%, #F7EFE7 55%, #EEDFD2 100%)", light: false, btn: "#E85C04", btnText: "#FFFFFF", shadow: "110,45,25" },
  );
  return out.filter(x => x.product);
}

function SlideView({ s, active, animate, priority, eager }: { s: Slide; active: boolean; animate: boolean; priority: boolean; eager: boolean }) {
  const d = discountPct(s.product);
  const ink = s.light ? "text-white" : "text-[#1D1D1F]";
  const sub = s.light ? "text-white/75" : "text-black/55";
  const enter = animate && active;
  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 overflow-hidden rounded-[32px] transition-opacity duration-700 ease-out ${active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}
      style={{ background: s.bg }}
    >
      {/* Watermark */}
      <span aria-hidden className={`pointer-events-none absolute bottom-[30%] right-[-2%] select-none whitespace-nowrap text-[120px] font-black leading-none tracking-[-0.06em] sm:bottom-auto sm:right-[2%] sm:top-1/2 sm:-translate-y-1/2 sm:text-[230px] lg:text-[280px] ${s.light ? "text-white/[0.09]" : "text-black/[0.06]"}`}>
        {s.watermark}
      </span>

      <div className="relative flex h-full flex-col sm:grid sm:grid-cols-[1fr_1.15fr]">
        {/* Copy */}
        <div key={enter ? "in" : "still"} className={`relative z-10 px-6 pt-9 sm:flex sm:flex-col sm:justify-center sm:py-12 sm:pl-14 lg:pl-20 ${enter ? "rise-in" : ""}`}>
          {s.campaign ? (
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white py-1 pl-1.5 pr-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[#F45B39]">
              <BadgePercent size={16} strokeWidth={2.5} /> {s.kicker}
            </p>
          ) : (
            <p className={`text-[12px] font-semibold uppercase tracking-[0.16em] ${sub}`}>{s.kicker}</p>
          )}
          <h2 className={`mt-3 whitespace-pre-line font-bold leading-[1.0] tracking-[-0.045em] ${ink} ${s.campaign ? "text-[42px] sm:text-[60px] lg:text-[70px]" : "text-[36px] sm:text-[54px] lg:text-[62px]"}`}>{s.title}</h2>

          {s.campaign ? (
            <Countdown className="mt-5 sm:mt-7" />
          ) : (
            <div className="mt-4 flex items-center gap-3 sm:mt-6">
              <span className={`text-[24px] font-bold tabular-nums sm:text-[28px] ${ink}`}>{km(s.product.price)}</span>
              {s.product.oldPrice && <span className={`text-[14px] tabular-nums line-through ${s.light ? "text-white/50" : "text-black/40"}`}>{km(s.product.oldPrice)}</span>}
              {d > 0 && <span className="rounded-full px-2.5 py-0.5 text-[13px] font-bold" style={{ background: s.btn, color: s.btnText }}>−{d}%</span>}
            </div>
          )}

          <Link
            href={s.campaign ? "#black-november" : `/${s.product.slug}`}
            tabIndex={active ? 0 : -1}
            className="group mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-full px-6 text-[15px] font-semibold shadow-[0_12px_28px_-14px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.03] active:scale-95 sm:mt-8"
            style={{ background: s.btn, color: s.btnText }}
          >
            {s.campaign ? "Pogledaj ponude" : "Pogledaj ponudu"} <ArrowRight size={16} strokeWidth={2.25} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Product on the floor */}
        <div className="relative min-h-0 flex-1">
          <div className={`absolute inset-y-0 left-0 ${s.campaign ? "right-[26%]" : "right-0"} ${enter ? "rise-in" : ""}`}>
            <ProductOnFloor
              slug={s.product.slug}
              src={heroImage(s.product)}
              alt={s.product.name}
              priority={priority}
              eager={eager}
              sizes="(max-width: 640px) 72vw, 560px"
              tileAspect={1.25}
              floor={14}
              area={0.5}
              maxW={0.92}
              maxH={0.8}
              shadow={s.shadow}
            />
          </div>
          {s.campaign && (
            <div className="absolute bottom-[12%] right-3 z-10 sm:right-8">
              <Lisko size={104} bubble="top-end" messages={["Psst… najniže cijene!", "Stiže za 1–2 dana!", `Do −${MAX_DISCOUNT}% do 30.11.`]} autoCycle />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HeroSlider() {
  const bn = useBlackNovember();
  const slides = buildSlides(bn.active);
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [moved, setMoved] = useState(false);
  const touchX = useRef<number | null>(null);
  // Warm up the other slides' images shortly after load, so crossfades never show an empty stage.
  const [warm, setWarm] = useState(false);
  useEffect(() => { const id = setTimeout(() => setWarm(true), 1500); return () => clearTimeout(id); }, []);

  const go = useCallback((i: number) => { setMoved(true); setActive(((i % count) + count) % count); }, [count]);

  useEffect(() => { if (active >= count) setActive(0); }, [active, count]);

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => { if (!document.hidden) go(active + 1); }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [active, paused, count, go]);

  const cur = slides[active] ?? slides[0];
  const light = cur?.light;

  return (
    <section aria-roledescription="carousel" aria-label="Izdvojene ponude" className="px-3 pt-3 sm:px-6 sm:pt-6">
      <div
        className="relative mx-auto h-[600px] max-w-[1200px] select-none sm:h-[500px] lg:h-[540px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={e => { touchX.current = e.touches[0].clientX; setPaused(true); }}
        onTouchEnd={e => {
          const start = touchX.current; touchX.current = null;
          if (start !== null) {
            const dx = e.changedTouches[0].clientX - start;
            if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
          }
          setTimeout(() => setPaused(false), 3000);
        }}
      >
        {slides.map((s, i) => (
          <SlideView key={s.key} s={s} active={i === active} animate={moved} priority={i === 0} eager={warm} />
        ))}

        {/* Controls */}
        <div className="absolute inset-x-6 bottom-5 z-20 flex items-center justify-between sm:inset-x-14 lg:inset-x-20">
          <div className={`flex items-center gap-3 text-[12px] font-semibold tabular-nums ${light ? "text-white" : "text-[#1D1D1F]"}`}>
            <span>{String(active + 1).padStart(2, "0")}</span>
            <span className={`relative h-[2px] w-16 overflow-hidden rounded-full sm:w-24 ${light ? "bg-white/30" : "bg-black/15"}`}>
              <span
                key={`${active}-${paused}`}
                className={`absolute inset-0 rounded-full ${light ? "bg-white" : "bg-[#1D1D1F]"} ${paused ? "scale-x-0" : "slide-progress"}`}
                style={{ ["--slide-ms" as string]: `${SLIDE_MS}ms` }}
              />
            </span>
            <span className="opacity-60">{String(count).padStart(2, "0")}</span>
          </div>
          <div className="flex gap-2">
            {[{ d: -1, I: ChevronLeft, l: "Prethodni slajd" }, { d: 1, I: ChevronRight, l: "Sljedeći slajd" }].map(({ d, I, l }) => (
              <button
                key={l}
                onClick={() => go(active + d)}
                aria-label={l}
                className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition-colors ${light ? "border-white/35 text-white hover:bg-white/15" : "border-black/15 text-[#1D1D1F] hover:bg-black/5"}`}
              >
                <I size={18} strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
