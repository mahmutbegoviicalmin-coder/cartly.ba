"use client";

import { SlidersHorizontal, ChevronDown, Wrench, Camera, HardHat, Speaker, RotateCcw } from "lucide-react";

export interface FilterState {
  categories: string[];
  priceMax:   number;
  inStock:    boolean;
  sortBy:     string;
}

const CATEGORIES = [
  { label: "ALATI",        Icon: Wrench   },
  { label: "VIDEO NADZOR", Icon: Camera   },
  { label: "RADNA OBUĆA",  Icon: HardHat  },
  { label: "DOM",          Icon: Speaker  },
];

const SORT_OPTIONS = [
  { value: "default",    label: "Preporučeno"   },
  { value: "price-asc",  label: "Cijena: niža"  },
  { value: "price-desc", label: "Cijena: viša"  },
  { value: "name-asc",   label: "Naziv A → Z"   },
];

const ACCENT = "#FF6B00";

interface Props {
  filters:  FilterState;
  onChange: (f: FilterState) => void;
  total:    number;
}

const isDirty = (f: FilterState) =>
  f.categories.length > 0 || f.priceMax < 300 || f.inStock || f.sortBy !== "default";

export default function FilterSidebar({ filters, onChange, total }: Props) {
  function toggleCat(label: string) {
    const next = filters.categories.includes(label)
      ? filters.categories.filter(c => c !== label)
      : [...filters.categories, label];
    onChange({ ...filters, categories: next });
  }

  function reset() {
    onChange({ categories: [], priceMax: 300, inStock: false, sortBy: "default" });
  }

  return (
    <aside className="hidden lg:block w-[240px] xl:w-[260px] shrink-0 self-start sticky top-24">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} style={{ color: ACCENT }} />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-800">Filteri</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">{total} {total === 1 ? "proizvod" : "proizvoda"}</span>
        </div>

        <div className="p-5 space-y-6">

          {/* Sort */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2.5">
              Sortiraj
            </label>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={e => onChange({ ...filters, sortBy: e.target.value })}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer transition-all duration-150"
                style={{ ["--tw-ring-color" as string]: "rgba(255,107,0,0.25)" }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Categories */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
              Kategorija
            </label>
            <div className="space-y-1.5">
              {CATEGORIES.map(({ label, Icon }) => {
                const active = filters.categories.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => toggleCat(label)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-left transition-all duration-150 ${
                      active
                        ? "text-orange-600 border border-orange-200"
                        : "text-gray-600 border border-transparent hover:bg-gray-50"
                    }`}
                    style={{ background: active ? "rgba(255,107,0,0.06)" : "" }}
                  >
                    <Icon size={14} style={{ color: active ? ACCENT : "#AAAAAA", flexShrink: 0 }} />
                    {label}
                    {active && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: ACCENT }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Price range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                Max. cijena
              </label>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>
                {filters.priceMax} KM
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={300}
              step={10}
              value={filters.priceMax}
              onChange={e => onChange({ ...filters, priceMax: Number(e.target.value) })}
              className="w-full cursor-pointer"
              style={{ accentColor: ACCENT }}
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1.5 font-medium">
              <span>30 KM</span>
              <span>300 KM</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* In stock toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-gray-700">Samo na stanju</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Prikaži dostupne</p>
            </div>
            <button
              onClick={() => onChange({ ...filters, inStock: !filters.inStock })}
              className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
              style={{ background: filters.inStock ? ACCENT : "#E5E7EB" }}
              aria-label="Toggle in-stock filter"
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
                style={{ left: filters.inStock ? 24 : 4 }}
              />
            </button>
          </div>

          {/* Reset */}
          {isDirty(filters) && (
            <>
              <div className="h-px bg-gray-100" />
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-xl transition-all duration-150"
              >
                <RotateCcw size={13} />
                Resetuj filtere
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
