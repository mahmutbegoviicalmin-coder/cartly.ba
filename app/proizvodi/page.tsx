"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, X } from "lucide-react";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import { CATALOG, CATEGORIES, CategoryId, discountPct, searchCatalog } from "@/lib/catalog";
import { event } from "@/lib/fbpixel";

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

type Sort = "popular" | "price-asc" | "price-desc" | "discount";
const SORTS: { value: Sort; label: string }[] = [
  { value: "popular",    label: "Najpopularnije" },
  { value: "price-asc",  label: "Cijena: od najniže" },
  { value: "price-desc", label: "Cijena: od najviše" },
  { value: "discount",   label: "Najveći popust" },
];

export default function ProizvodiPage() {
  const [cat,  setCat]  = useState<CategoryId | "sve">("sve");
  const [q,    setQ]    = useState("");
  const [sort, setSort] = useState<Sort>("popular");

  // Read ?kategorija= and ?q= on load (links from the header, footer and home page)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const k = sp.get("kategorija");
    if (k && CATEGORIES.some(c => c.id === k)) setCat(k as CategoryId);
    const qs = sp.get("q");
    if (qs) setQ(qs);
    const s = sp.get("sort");
    if (s && SORTS.some(o => o.value === s)) setSort(s as Sort);
  }, []);

  // Keep the URL shareable without adding history entries
  useEffect(() => {
    const sp = new URLSearchParams();
    if (cat !== "sve") sp.set("kategorija", cat);
    if (q.trim()) sp.set("q", q.trim());
    if (sort !== "popular") sp.set("sort", sort);
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `/proizvodi?${qs}` : "/proizvodi");
  }, [cat, q, sort]);

  useEffect(() => {
    event("ViewContent", {
      content_name:     "Katalog proizvoda",
      content_category: "Svi proizvodi",
      currency:         "BAM",
    });
  }, []);

  const list = useMemo(() => {
    let out = q.trim() ? searchCatalog(q) : [...CATALOG];
    if (cat !== "sve") out = out.filter(p => p.category === cat);
    if (sort === "popular")    out.sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
    if (sort === "price-asc")  out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    if (sort === "discount")   out.sort((a, b) => discountPct(b) - discountPct(a));
    return out;
  }, [cat, q, sort]);

  const tabs: { id: CategoryId | "sve"; label: string; n: number }[] = [
    { id: "sve", label: "Sve", n: CATALOG.length },
    ...CATEGORIES.map(c => ({ id: c.id, label: c.label, n: CATALOG.filter(p => p.category === c.id).length })),
  ];

  const title = cat === "sve" ? "Svi proizvodi." : `${CATEGORIES.find(c => c.id === cat)?.label}.`;

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#2A1E18] antialiased" style={{ fontFamily: FONT }}>
      <StoreHeader />

      <main className="px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
        <div className="mx-auto max-w-[1200px]">
          <Link href="/" className="inline-flex items-center gap-0.5 text-[14px] text-[#6E6E73] hover:text-[#1D1D1F]">
            <ChevronLeft size={15} strokeWidth={2} /> Početna
          </Link>
          <h1 className="mt-2 text-[36px] font-semibold tracking-[-0.035em] sm:text-[52px]">{title}</h1>
          <p className="mt-1 text-[17px] text-[#6E6E73]">Dostava po cijeloj BiH. Plaćate kuriru kad paket stigne.</p>

          {/* Controls */}
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2" role="tablist" aria-label="Kategorije">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={cat === t.id}
                    onClick={() => setCat(t.id)}
                    className={`h-10 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-colors ${cat === t.id ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]"}`}
                  >
                    {t.label} <span className={cat === t.id ? "text-white/60" : "text-[#86868B]"}>{t.n}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <label className="relative min-w-0 flex-1 lg:w-[280px] lg:flex-none">
                <span className="sr-only">Pretraga</span>
                <Search size={17} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Pretraži"
                  enterKeyHint="search"
                  className="h-10 w-full rounded-full bg-[#F5F5F7] pl-10 pr-9 text-[16px] text-[#1D1D1F] outline-none placeholder:text-[#86868B] focus:bg-white focus:shadow-[0_0_0_2px_#1D1D1F] sm:text-[14px]"
                />
                {q && (
                  <button onClick={() => setQ("")} aria-label="Obriši pretragu" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#D2D2D7] text-white">
                    <X size={13} strokeWidth={2.5} />
                  </button>
                )}
              </label>
              <label className="shrink-0">
                <span className="sr-only">Sortiraj</span>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as Sort)}
                  className="h-10 rounded-full bg-[#F5F5F7] pl-4 pr-8 text-[14px] font-medium text-[#1D1D1F] outline-none"
                >
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {/* Grid */}
          {list.length ? (
            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 4} />)}
            </div>
          ) : (
            <div className="mt-16 text-center">
              <p className="text-[19px] font-semibold">Nema rezultata za &bdquo;{q}&ldquo;.</p>
              <p className="mt-1 text-[15px] text-[#6E6E73]">Probajte drugi pojam ili pogledajte sve proizvode.</p>
              <button onClick={() => { setQ(""); setCat("sve"); }} className="mt-5 h-[44px] rounded-full bg-[#1D1D1F] px-6 text-[15px] font-semibold text-white">
                Prikaži sve
              </button>
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
