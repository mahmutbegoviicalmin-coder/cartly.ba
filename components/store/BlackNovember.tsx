"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, BadgePercent, ChevronLeft, Percent, Truck } from "lucide-react";
import { pad2, useBlackNovember } from "@/lib/campaign";
import { MAX_DISCOUNT } from "@/lib/catalog";
import { PageTheme, STORE_THEME, themeFor } from "@/lib/campaign-themes";

/*
 * Everything Black November lives in this file and reads useBlackNovember(),
 * so the bar, countdowns, card badges, product-page bar and order-form note
 * all switch off by themselves on 1 Dec 2026 00:00 Sarajevo time, without a
 * deploy or a reload. On product pages the colours follow that page's own
 * palette (lib/campaign-themes.ts). The "back to home" link on product pages
 * stays after the campaign (as a slim strip).
 */

const STRIP_H = 36;

/** Product pages whose own header has no way back to the store. */
const NEEDS_HOME = new Set(["makita-brusilica", "makita-brusilica-1500w", "prsluk-za-spasavanje"]);

/**
 * Keeps product-page headers glued under the strip: --bn-h shrinks from the
 * strip height to 0 as the strip scrolls away, so fixed/sticky headers slide
 * up with it instead of stacking two bars.
 */
function useStripOffset(on: boolean) {
  useEffect(() => {
    if (!on) return;
    const root = document.documentElement;
    let raf = 0;
    const update = () => { raf = 0; root.style.setProperty("--bn-h", `${Math.max(0, STRIP_H - window.scrollY)}px`); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); root.style.removeProperty("--bn-h"); };
  }, [on]);
}

/** Slim, quiet campaign strip: one line, countdown in the page's accent. */
export function BlackNovemberBar({ theme = STORE_THEME, home }: { theme?: PageTheme; home?: boolean }) {
  const bn = useBlackNovember();
  if (!bn.active) return null;
  return (
    <div id="bn-strip" className="relative bg-[#141110] text-white" style={{ height: STRIP_H }}>
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-center gap-3 px-4 text-[12px] sm:text-[13px]">
        {home && (
          <Link href="/" className="absolute left-3 flex items-center gap-0.5 text-white/70 transition-colors hover:text-white sm:left-6">
            <ChevronLeft size={14} strokeWidth={2.25} /> <span className="hidden sm:inline">Cartly.ba</span>
          </Link>
        )}
        <Link href="/proizvodi?sort=discount" className="group flex min-w-0 items-center gap-2.5 whitespace-nowrap">
          <span className="font-semibold tracking-[0.01em]">Black November</span>
          <span className="h-3 w-px bg-white/20" />
          <span className="text-white/70">do <span className="font-semibold text-white">−{MAX_DISCOUNT}%</span><span className="hidden sm:inline"> na sve proizvode</span></span>
          <span className="h-3 w-px bg-white/20" />
          <span className="min-w-[78px] font-semibold tabular-nums" style={{ color: theme.accent === "#1B4332" ? "#9FD3B5" : theme.accent }}>
            {bn.mounted ? `${bn.days}d ${pad2(bn.hours)}:${pad2(bn.minutes)}:${pad2(bn.seconds)}` : ""}
          </span>
          <span className="hidden items-center gap-1 text-white/60 transition-colors group-hover:text-white md:flex">
            Pogledaj ponude <ArrowRight size={13} strokeWidth={2.25} />
          </span>
        </Link>
      </div>
    </div>
  );
}

/**
 * Strip on product landing pages, in the page's own colours. Scrolls away with
 * the page (headers follow via --bn-h). The store pages render their own strip
 * in StoreHeader; admin/supplier pages get nothing. Pages without a home link
 * in their own header get one here, also after the campaign.
 */
export function CampaignBarGate() {
  const path = usePathname() || "/";
  const bn = useBlackNovember();
  const slug = path.split("/")[1] || "";
  const storePage = path === "/" || path.startsWith("/proizvodi") || path.startsWith("/admin") || path.startsWith("/dobavljac") || path.startsWith("/api");
  const needsHome = NEEDS_HOME.has(slug);
  useStripOffset(!storePage && (bn.active || needsHome));
  if (storePage) return null;
  if (bn.active) return <BlackNovemberBar theme={themeFor(path)} home={needsHome} />;
  if (!needsHome) return null;
  return (
    <div id="bn-strip" className="flex items-center border-b border-black/[0.06] bg-white px-3" style={{ height: STRIP_H }}>
      <Link href="/" className="flex items-center gap-1 text-[13px] font-medium text-[#1D1D1F]">
        <ChevronLeft size={15} strokeWidth={2.25} /> Cartly.ba
      </Link>
    </div>
  );
}

/** Discount badge for product cards: a percent seal while the campaign runs. */
export function DiscountBadge({ pct }: { pct: number }) {
  const bn = useBlackNovember();
  if (!pct) return null;
  if (!bn.active) {
    return <span className="inline-flex h-7 items-center rounded-full bg-[#F45B39] px-2.5 text-[12px] font-bold tabular-nums text-white">−{pct}%</span>;
  }
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full bg-[#141110] pl-1 pr-2.5 text-[12px] font-bold tabular-nums text-white shadow-[0_6px_14px_-8px_rgba(20,17,16,0.8)]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F45B39] transition-transform duration-500 group-hover:rotate-[360deg]">
        <Percent size={11} strokeWidth={3} className="text-white" />
      </span>
      −{pct}%
    </span>
  );
}

/** Line under the price on cards. */
export function BlackNovemberPriceNote() {
  const bn = useBlackNovember();
  if (!bn.active) {
    return <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#8C7B72]"><Truck size={12} strokeWidth={2} /> Stiže za 1–2 dana</p>;
  }
  return (
    <p className="mt-1.5 flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-[#2A1E18]">
      <BadgePercent size={13} strokeWidth={2.25} className="shrink-0 text-[#F45B39]" /> Black November cijena
    </p>
  );
}

/** Order-form line: Black November price applied. Uses the landing page's own colours. */
export function BlackNovemberCartNote({ className = "" }: { className?: string }) {
  const bn = useBlackNovember();
  const theme = themeFor(usePathname());
  if (!bn.active) return null;
  return (
    <div className={`flex items-center justify-between gap-3 rounded-[14px] bg-[#141110] px-4 py-3 text-[13px] text-white ${className}`}>
      <span className="flex items-center gap-2 font-semibold">
        <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: theme.accent, color: theme.on }}>
          <Percent size={13} strokeWidth={3} />
        </span>
        Black November cijena uračunata
      </span>
      <span className="shrink-0 font-semibold tabular-nums" style={{ color: theme.accent }}>
        {bn.mounted ? `${bn.days}d ${pad2(bn.hours)}:${pad2(bn.minutes)}` : ""}
      </span>
    </div>
  );
}

/** Countdown tiles. */
export function Countdown({ className = "" }: { className?: string }) {
  const bn = useBlackNovember();
  const cells: [number, string][] = [[bn.days, "dana"], [bn.hours, "sati"], [bn.minutes, "min"], [bn.seconds, "sek"]];
  return (
    <div className={`flex gap-2 ${className}`} aria-label="Do kraja Black November akcije">
      {cells.map(([v, l]) => (
        <div key={l} className="flex w-[60px] flex-col items-center rounded-[14px] bg-white py-2.5 text-[#2A1E18] shadow-[0_6px_16px_-10px_rgba(110,45,25,0.4)] sm:w-[70px]">
          <span className="text-[22px] font-bold leading-none tabular-nums sm:text-[26px]">{bn.mounted ? pad2(v) : "00"}</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8C7B72]">{l}</span>
        </div>
      ))}
    </div>
  );
}

/** Renders children only while the campaign runs. */
export function DuringBlackNovember({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const bn = useBlackNovember();
  return <>{bn.active ? children : fallback}</>;
}
