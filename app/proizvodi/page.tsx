"use client";

import { useState, useEffect, useRef } from "react";
import { Search, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/Header";
import FilterSidebar, { FilterState } from "./FilterSidebar";
import ProductCard, { Product } from "./ProductCard";
import { event } from "@/lib/fbpixel";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ACCENT = "#FF6B00";

const ALL_PRODUCTS: Product[] = [
  {
    name:     "Milwaukee Bušilica M18",
    desc:     "Profesionalna akumulatorska bušilica 18V brushless",
    price:    69.90,
    oldPrice: 299.90,
    tag:      "ALATI",
    href:     "/milwaukee-busilica",
    image:    "/images/milw2.webp",
    hot:      true,
  },
  {
    name:     "Akumulatorska Brusilica",
    desc:     "125mm disk, anti-kickback zaštita, AVS sistem, komplet sa 2 baterije",
    price:    74.90,
    oldPrice: 159.90,
    tag:      "ALATI",
    href:     "/brusilica",
    image:    "/images/brusilica.webp",
    hot:      false,
  },
  {
    name:     "Kamera V380 Pro",
    desc:     "Bežični HD video nadzor za unutarnje i vanjske prostore",
    price:    129.90,
    oldPrice: 149.90,
    tag:      "VIDEO NADZOR",
    href:     "/kamera",
    image:    "/images/kamere.png",
    hot:      false,
  },
  {
    name:     "Radne Patike S3",
    desc:     "Zaštitna obuća s čeličnom kapicom i anti-slip đonom",
    price:    59.90,
    oldPrice: 99.90,
    tag:      "RADNA OBUĆA",
    href:     "/radne-patike",
    image:    "/images/product-1.webp",
    hot:      true,
  },
  {
    name:     "Bluetooth Zvučnik ZQS",
    desc:     "Bežični zvučnik 40W s mikrofonom i IPX5 zaštitom",
    price:    59.90,
    oldPrice: 99.90,
    tag:      "DOM",
    href:     "/zvucnik",
    image:    "/images/zvucnik/zvucnik1.webp",
    hot:      false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function applyFilters(products: Product[], filters: FilterState, query: string): Product[] {
  let out = [...products];

  if (filters.categories.length > 0)
    out = out.filter(p => filters.categories.includes(p.tag));

  out = out.filter(p => p.price <= filters.priceMax);

  if (query.trim())
    out = out.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.tag.toLowerCase().includes(query.toLowerCase())
    );

  if (filters.sortBy === "price-asc")  out.sort((a, b) => a.price - b.price);
  if (filters.sortBy === "price-desc") out.sort((a, b) => b.price - a.price);
  if (filters.sortBy === "name-asc")   out.sort((a, b) => a.name.localeCompare(b.name));

  return out;
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  priceMax:   300,
  inStock:    false,
  sortBy:     "default",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProizvodiPage() {
  const [filters,   setFilters]   = useState<FilterState>(DEFAULT_FILTERS);
  const [query,     setQuery]     = useState("");
  const [visible,   setVisible]   = useState(false);
  const [mobileFilter, setMobileFilter] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = applyFilters(ALL_PRODUCTS, filters, query);

  // Facebook Pixel — ViewContent on page load
  useEffect(() => {
    event("ViewContent", {
      content_name:     "Katalog proizvoda",
      content_category: "Svi proizvodi",
      currency:         "BAM",
    });
  }, []);

  // Trigger entrance animation shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Reset visibility briefly when filters change for re-animate effect
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [filters, query]);

  return (
    <div className="bg-[#F5F2EE] min-h-screen">
      <Header />

      {/* ─── Page hero bar ───────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">
          <div className="flex items-center gap-2 text-[11.5px] text-gray-400 font-medium mb-3">
            <a href="/" className="hover:text-gray-700 transition-colors">Početna</a>
            <span>/</span>
            <span className="text-gray-700">Proizvodi</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: ACCENT }}>
                Sva naša ponuda
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-none tracking-tight">
                Proizvodi
              </h1>
            </div>

            {/* Search */}
            <div className="sm:ml-auto relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Pretraži proizvode..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-150"
                style={{ ["--tw-ring-color" as string]: "rgba(255,107,0,0.25)" }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main content ────────────────────────────────────────── */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">

        {/* Mobile: filter toggle + count */}
        <div className="lg:hidden flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500 font-medium">
            <span className="font-bold text-gray-900">{filtered.length}</span> {filtered.length === 1 ? "proizvod" : "proizvoda"}
          </p>
          <button
            onClick={() => setMobileFilter(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-400 transition-all shadow-sm"
          >
            <SlidersHorizontal size={14} style={{ color: ACCENT }} />
            Filteri
          </button>
        </div>

        {/* Mobile filter drawer */}
        {mobileFilter && (
          <div className="lg:hidden fixed inset-0 z-[300] flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilter(false)} />
            <div className="relative ml-auto w-[85vw] max-w-sm bg-white h-full overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="font-bold text-sm uppercase tracking-widest">Filteri</span>
                <button onClick={() => setMobileFilter(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <MobileFilters filters={filters} onChange={setFilters} total={filtered.length} onClose={() => setMobileFilter(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Sidebar + grid */}
        <div className="flex gap-7 lg:gap-8 items-start">
          <FilterSidebar filters={filters} onChange={setFilters} total={filtered.length} />

          {/* Grid area */}
          <div className="flex-1 min-w-0" ref={gridRef}>
            {/* Count + label — desktop */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray-900">{filtered.length}</span> {filtered.length === 1 ? "proizvod" : "proizvoda"}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <LayoutGrid size={13} />
                Grid prikaz
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState onReset={() => { setFilters(DEFAULT_FILTERS); setQuery(""); }} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
                {filtered.map((product, i) => (
                  <ProductCard
                    key={product.href}
                    product={product}
                    visible={visible}
                    delay={i * 70}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white mt-10 md:mt-14">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-bold text-gray-900">
            cartly<span style={{ color: ACCENT }}>.</span>
          </span>
          <p className="text-xs text-gray-400 font-medium">
            © 2026 Cartly · Dostava 10 KM · Plaćanje pouzećem
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Search size={24} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1.5">Nema rezultata</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Nijedan proizvod ne odgovara odabranim filterima.
      </p>
      <button
        onClick={onReset}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
        style={{ background: ACCENT }}
      >
        Resetuj filtere
      </button>
    </div>
  );
}

// ─── Mobile filter panel ──────────────────────────────────────────────────────
import { Wrench, Camera, HardHat, Speaker, ChevronDown, RotateCcw } from "lucide-react";

const MOBILE_CATEGORIES = [
  { label: "ALATI",        Icon: Wrench   },
  { label: "VIDEO NADZOR", Icon: Camera   },
  { label: "RADNA OBUĆA",  Icon: HardHat  },
  { label: "DOM",          Icon: Speaker  },
];

const SORT_OPTIONS = [
  { value: "default",    label: "Preporučeno"  },
  { value: "price-asc",  label: "Cijena: niža" },
  { value: "price-desc", label: "Cijena: viša" },
  { value: "name-asc",   label: "Naziv A → Z"  },
];

function MobileFilters({
  filters, onChange, total, onClose,
}: { filters: FilterState; onChange: (f: FilterState) => void; total: number; onClose: () => void }) {
  function toggleCat(label: string) {
    const next = filters.categories.includes(label)
      ? filters.categories.filter(c => c !== label)
      : [...filters.categories, label];
    onChange({ ...filters, categories: next });
  }

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2.5">Sortiraj</label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={e => onChange({ ...filters, sortBy: e.target.value })}
            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700 pr-8 focus:outline-none"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Categories */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Kategorija</label>
        <div className="space-y-1.5">
          {MOBILE_CATEGORIES.map(({ label, Icon }) => {
            const active = filters.categories.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggleCat(label)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-left transition-all duration-150 border"
                style={{
                  color:      active ? "#FF6B00" : "#4B5563",
                  background: active ? "rgba(255,107,0,0.06)" : "transparent",
                  borderColor: active ? "#FED7AA" : "transparent",
                }}
              >
                <Icon size={14} style={{ color: active ? ACCENT : "#AAAAAA", flexShrink: 0 }} />
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Price */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Max. cijena</label>
          <span className="text-sm font-bold" style={{ color: ACCENT }}>{filters.priceMax} KM</span>
        </div>
        <input
          type="range" min={30} max={300} step={10}
          value={filters.priceMax}
          onChange={e => onChange({ ...filters, priceMax: Number(e.target.value) })}
          className="w-full cursor-pointer" style={{ accentColor: ACCENT }}
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-1.5 font-medium">
          <span>30 KM</span><span>300 KM</span>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* In stock */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-gray-700">Samo na stanju</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Prikaži dostupne</p>
        </div>
        <button
          onClick={() => onChange({ ...filters, inStock: !filters.inStock })}
          className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
          style={{ background: filters.inStock ? ACCENT : "#E5E7EB" }}
        >
          <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
            style={{ left: filters.inStock ? 24 : 4 }} />
        </button>
      </div>

      {/* Apply */}
      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: ACCENT }}
      >
        Primijeni ({total} {total === 1 ? "proizvod" : "proizvoda"})
      </button>

      {/* Reset */}
      <button
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-xl transition-all duration-150"
      >
        <RotateCcw size={13} /> Resetuj filtere
      </button>
    </div>
  );
}
