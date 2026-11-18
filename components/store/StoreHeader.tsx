"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight, Menu, Search, X } from "lucide-react";
import { CATALOG, CATEGORIES, CategoryId, MAX_DISCOUNT, discountPct, km, searchCatalog } from "@/lib/catalog";
import { BlackNovemberBar } from "./BlackNovember";
import Mascot from "./Mascot";
import { useBlackNovember } from "@/lib/campaign";

const BRAND = "#F45B39";

function Thumb({ slug, size = 56 }: { slug: string; size?: number }) {
  return (
    <span className="relative shrink-0 overflow-hidden rounded-[12px] bg-[#F5F5F7]" style={{ width: size, height: size }}>
      <Image src={`/shop/sm/${slug}.webp`} alt="" fill sizes={`${size}px`} className="object-contain p-1.5" />
    </span>
  );
}

export default function StoreHeader() {
  const [mega,       setMega]       = useState<CategoryId | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [openCat,    setOpenCat]    = useState<CategoryId | null>("alati");
  const [q,          setQ]          = useState("");
  const inputRef  = useRef<HTMLInputElement>(null);
  const closeT    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bn        = useBlackNovember();
  const results   = searchCatalog(q).slice(0, 6);

  // ── Mega menu hover intent ──
  const openMega  = (id: CategoryId) => { if (closeT.current) clearTimeout(closeT.current); setMega(id); };
  const closeMega = () => { closeT.current = setTimeout(() => setMega(null), 120); };

  useEffect(() => { if (searchOpen) setTimeout(() => inputRef.current?.focus(), 30); }, [searchOpen]);

  // ── Scroll lock + Escape ──
  useEffect(() => {
    const locked = searchOpen || menuOpen;
    document.documentElement.style.overflow = locked ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSearchOpen(false); setMenuOpen(false); setMega(null);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
  }, [searchOpen, menuOpen]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (results.length === 1) window.location.href = `/${results[0].slug}`;
    else window.location.href = `/proizvodi?q=${encodeURIComponent(q.trim())}`;
  }

  const megaCat   = CATEGORIES.find(c => c.id === mega);
  const megaItems = mega ? CATALOG.filter(p => p.category === mega).slice(0, 6) : [];

  return (
    <>
      <BlackNovemberBar />

      <header className="sticky top-0 z-50" onMouseLeave={closeMega}>
        <div className="border-b border-black/[0.06] bg-[#FFF8F4]/85 backdrop-blur-xl backdrop-saturate-150">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[21px] font-extrabold tracking-[-0.04em] text-[#2A1E18]" aria-label="Cartly, početna">
              <Mascot size={28} title="" /><span>cartly<span style={{ color: BRAND }}>.</span></span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden h-full items-center md:flex" aria-label="Glavni meni">
              {bn.active && (
                <Link href="/proizvodi?sort=discount" className="mr-3 inline-flex h-8 items-center gap-2 rounded-full bg-[#FDEDE7] px-3.5 text-[13px] font-semibold text-[#F45B39]">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND }} />
                  Black November
                </Link>
              )}
              {CATEGORIES.map(c => (
                <div key={c.id} className="h-full" onMouseEnter={() => openMega(c.id)}>
                  <Link
                    href={`/proizvodi?kategorija=${c.id}`}
                    onFocus={() => openMega(c.id)}
                    aria-expanded={mega === c.id}
                    className={`relative flex h-full items-center gap-1 px-3.5 text-[14px] font-medium transition-colors ${mega === c.id ? "text-[#111]" : "text-[#424245] hover:text-[#111]"}`}
                  >
                    {c.label}
                    <ChevronDown size={14} strokeWidth={2.25} className={`transition-transform duration-200 ${mega === c.id ? "rotate-180" : ""}`} />
                    <span className="absolute inset-x-3.5 bottom-0 h-[2px] origin-left rounded-full transition-transform duration-200" style={{ background: BRAND, transform: mega === c.id ? "scaleX(1)" : "scaleX(0)" }} />
                  </Link>
                </div>
              ))}
              <Link href="/proizvodi" onMouseEnter={closeMega} className="px-3.5 text-[14px] font-medium text-[#424245] transition-colors hover:text-[#111]">
                Svi proizvodi
              </Link>
            </nav>

            <div className="flex items-center gap-1">
              <button onClick={() => { setMega(null); setSearchOpen(true); }} aria-label="Pretraga" className="flex h-10 items-center gap-2 rounded-full px-2.5 text-[#111] transition-colors hover:bg-black/[0.05] lg:bg-[#F5F5F7] lg:px-4 lg:hover:bg-[#E8E8ED]">
                <Search size={18} strokeWidth={2.1} />
                <span className="hidden text-[14px] text-[#6E6E73] lg:inline">Pretraga</span>
              </button>
              <button onClick={() => setMenuOpen(true)} aria-label="Otvori meni" className="flex h-10 w-10 items-center justify-center rounded-full text-[#111] transition-colors hover:bg-black/[0.05] md:hidden">
                <Menu size={21} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Desktop mega panel ── */}
        <div
          className={`absolute inset-x-0 top-full hidden origin-top border-b border-black/[0.06] bg-white/95 backdrop-blur-xl transition-all duration-200 md:block ${mega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
          onMouseEnter={() => mega && openMega(mega)}
        >
          {megaCat && (
            <div className="mx-auto grid max-w-[1200px] grid-cols-[260px_1fr] gap-10 px-6 py-8">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#86868B]">Kategorija</p>
                <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#111]">{megaCat.label}</p>
                <p className="mt-1 text-[14px] text-[#6E6E73]">{megaCat.desc}</p>
                <Link href={`/proizvodi?kategorija=${megaCat.id}`} onClick={() => setMega(null)} className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#111] px-5 text-[14px] font-semibold text-white hover:bg-black">
                  Pogledaj sve ({CATALOG.filter(p => p.category === megaCat.id).length}) <ArrowRight size={15} strokeWidth={2.25} />
                </Link>
              </div>
              <ul className="grid grid-cols-3 gap-x-6 gap-y-2">
                {megaItems.map(p => {
                  const d = discountPct(p);
                  return (
                    <li key={p.slug}>
                      <Link href={`/${p.slug}`} onClick={() => setMega(null)} className="group flex items-center gap-3 rounded-[16px] p-2 transition-colors hover:bg-[#F5F5F7]">
                        <Thumb slug={p.slug} size={64} />
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-semibold text-[#111] group-hover:text-[#111]">{p.name}</span>
                          <span className="mt-0.5 flex items-baseline gap-2 text-[13px]">
                            <span className="font-semibold tabular-nums text-[#111]">{km(p.price)}</span>
                            {d > 0 && <span className="text-[12px] font-semibold" style={{ color: BRAND }}>−{d}%</span>}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Dim the page while the mega menu is open */}
      <div aria-hidden className={`pointer-events-none fixed inset-0 z-40 hidden bg-black/20 transition-opacity duration-200 md:block ${mega ? "opacity-100" : "opacity-0"}`} />

      {/* ── Search overlay ─────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-[70] transition-[visibility] ${searchOpen ? "visible" : "invisible"}`} role="dialog" aria-modal="true" aria-label="Pretraga proizvoda" aria-hidden={!searchOpen}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${searchOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setSearchOpen(false)} />
        <div className={`relative max-h-[100dvh] overflow-y-auto bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${searchOpen ? "translate-y-0" : "-translate-y-full"}`}>
          <form onSubmit={submit} className="mx-auto flex h-16 max-w-[760px] items-center gap-3 px-4 sm:px-6">
            <Search size={20} strokeWidth={2} className="shrink-0 text-[#86868B]" />
            <input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Šta tražite? npr. bušilica, patike, kamera"
              className="h-full min-w-0 flex-1 bg-transparent text-[17px] text-[#111] outline-none placeholder:text-[#A1A1A6]"
              enterKeyHint="search"
              tabIndex={searchOpen ? 0 : -1}
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Zatvori pretragu" tabIndex={searchOpen ? 0 : -1} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#111]">
              <X size={17} strokeWidth={2.25} />
            </button>
          </form>

          <div className="mx-auto max-w-[760px] px-4 pb-6 sm:px-6">
            {q.trim() === "" ? (
              <div className="border-t border-[#E8E8ED] pt-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#86868B]">Popularno</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Bušilica", "Brusilica", "Radne patike", "Kamera", "Set alata", "Zvučnik"].map(t => (
                    <button key={t} type="button" onClick={() => setQ(t)} tabIndex={searchOpen ? 0 : -1} className="h-9 rounded-full bg-[#F5F5F7] px-4 text-[14px] font-medium text-[#111] hover:bg-[#E8E8ED]">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <p className="border-t border-[#E8E8ED] pt-5 text-[15px] text-[#6E6E73]">
                Nema rezultata za &bdquo;{q}&ldquo;. <Link href="/proizvodi" className="font-medium text-[#111] hover:underline">Pogledajte sve proizvode</Link>.
              </p>
            ) : (
              <ul className="divide-y divide-[#E8E8ED] border-t border-[#E8E8ED]">
                {results.map(p => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-4 py-3">
                      <Thumb slug={p.slug} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-[#111]">{p.name}</span>
                        <span className="block truncate text-[13px] text-[#6E6E73]">{p.short}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[15px] font-bold tabular-nums text-[#111]">{km(p.price)}</span>
                        {discountPct(p) > 0 && <span className="text-[12px] font-bold text-[#111]">−{discountPct(p)}%</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-[70] md:hidden ${menuOpen ? "visible" : "invisible"}`} role="dialog" aria-modal="true" aria-label="Meni" aria-hidden={!menuOpen}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMenuOpen(false)} />
        <div className={`absolute inset-y-0 right-0 flex w-[88%] max-w-[400px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E8E8ED] px-4">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-[21px] font-extrabold tracking-[-0.04em] text-[#111]">
              cartly<span style={{ color: BRAND }}>.</span>
            </Link>
            <button onClick={() => setMenuOpen(false)} aria-label="Zatvori meni" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] text-[#111]">
              <X size={19} strokeWidth={2.25} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4">
            <button onClick={() => { setMenuOpen(false); setSearchOpen(true); }} className="flex h-12 w-full items-center gap-3 rounded-[14px] bg-[#F5F5F7] px-4 text-left text-[15px] text-[#86868B]">
              <Search size={18} strokeWidth={2} className="text-[#111]" /> Pretraži proizvode
            </button>

            {bn.active && (
              <Link href="/proizvodi?sort=discount" onClick={() => setMenuOpen(false)} className="relative mt-4 block overflow-hidden rounded-[18px] bg-[#F45B39] p-4 text-white">
                <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/80"><span className="h-1.5 w-1.5 rounded-full bg-white" />Black November</span>
                <span className="mt-1 block text-[17px] font-semibold">Popusti do −{MAX_DISCOUNT}%</span>
              </Link>
            )}

            <Link href="/" onClick={() => setMenuOpen(false)} className="mt-4 flex items-center justify-between border-b border-[#E8E8ED] py-4 text-[19px] font-semibold text-[#111]">
              Početna <ChevronRight size={18} className="text-[#86868B]" />
            </Link>

            {CATEGORIES.map(c => {
              const open  = openCat === c.id;
              const items = CATALOG.filter(p => p.category === c.id);
              return (
                <div key={c.id} className="border-b border-[#E8E8ED]">
                  <button onClick={() => setOpenCat(open ? null : c.id)} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-left text-[19px] font-semibold text-[#111]">
                    <span>{c.label} <span className="text-[14px] font-medium text-[#86868B]">{items.length}</span></span>
                    <ChevronDown size={19} className={`text-[#86868B] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <ul className="overflow-hidden">
                      {items.map(p => (
                        <li key={p.slug}>
                          <Link href={`/${p.slug}`} onClick={() => setMenuOpen(false)} tabIndex={open && menuOpen ? 0 : -1} className="flex items-center gap-3 py-2">
                            <Thumb slug={p.slug} size={48} />
                            <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-[#111]">{p.name}</span>
                            <span className="shrink-0 text-[14px] font-semibold tabular-nums text-[#111]">{km(p.price)}</span>
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={`/proizvodi?kategorija=${c.id}`} onClick={() => setMenuOpen(false)} tabIndex={open && menuOpen ? 0 : -1} className="mb-3 mt-1 inline-flex items-center gap-1 text-[14px] font-semibold text-[#111]">
                          Sve iz kategorije {c.label} <ArrowRight size={14} strokeWidth={2.25} />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })}

            <Link href="/proizvodi" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-4 text-[19px] font-semibold text-[#111]">
              Svi proizvodi <ChevronRight size={18} className="text-[#86868B]" />
            </Link>

            <div className="mt-4 rounded-[18px] bg-[#F5F5F7] p-4 text-[13px] leading-relaxed text-[#6E6E73]">
              <span className="font-semibold text-[#111]">Plaćanje pouzećem.</span> Dostava 1–2 radna dana na adresu, po cijeloj BiH.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
