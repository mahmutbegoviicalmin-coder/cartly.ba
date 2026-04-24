import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import ProductPageHeader from "@/components/ProductPageHeader";
import FaqAccordion from "./FaqAccordion";
import HeroGallery from "./HeroGallery";
import OrderForm from "./OrderForm";
import SocialProofToast from "./SocialProofToast";
import FloatingOrderBar from "./FloatingOrderBar";
import PixelEvents from "./PixelEvents";

export const metadata: Metadata = {
  title: "Milwaukee M18 Bušilica — Profesionalni Alat | Cartly.ba",
  description:
    "Milwaukee M18 bežična bušilica — 18V, uključena baterija, 150Nm. Naruči online, dostava 10 KM po cijeloj BiH. Plaćanje pouzećem.",
};

// ─── Podaci ───────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Brushless motor",
    desc: "Duži vijek trajanja, manje održavanja",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="15" height="13" rx="2" />
        <path d="M16 10l4-2v10l-4-2" />
      </svg>
    ),
    title: "18V M18 platforma",
    desc: "Kompatibilnost s cijelim M18 ekosistemom",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="18" y2="18" />
      </svg>
    ),
    title: "2-brzinski mjenjač",
    desc: "Preciznost za svaki zadatak",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    title: "LED osvjetljenje",
    desc: "Vidljivost u tamnim prostorima",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Anti-vibracijski sistem",
    desc: "Komfor pri dugotrajnoj upotrebi",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="16" height="10" rx="2" /><path d="M22 11v2" /><line x1="6" y1="11" x2="6" y2="13" strokeWidth="2" /><line x1="10" y1="11" x2="10" y2="13" strokeWidth="2" />
      </svg>
    ),
    title: "Uključena baterija",
    desc: "Spreman za rad odmah iz kutije",
  },
];

const SPEC_GRID = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    label: "Napon",
    value: "18V",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    ),
    label: "Maks. bušenje",
    value: "10 mm",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="11" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="12" strokeWidth="2.5" />
      </svg>
    ),
    label: "Baterije",
    value: "2× uključene",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
    label: "Moment",
    value: "150 Nm",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    label: "Tip",
    value: "Bežična",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
    label: "Namjena",
    value: "Kućna / DIY",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    label: "Garancija",
    value: "6 mjeseci",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="15" height="13" rx="2" />
        <path d="M16 10l4-2v10l-4-2" />
      </svg>
    ),
    label: "Stanje",
    value: "Novo",
  },
];

const ZASTO = [
  {
    num: "01",
    title: "Kvalitet provjeren",
    desc: "Milwaukee alat s potvrđenim kvalitetom i certifikatima.",
  },
  {
    num: "02",
    title: "Garancija 6 mjeseci",
    desc: "Servis i zamjena dijelova u garantnom roku — bez skrivenih uvjeta.",
  },
  {
    num: "03",
    title: "Brza dostava",
    desc: "Dostava na kućnu adresu u roku 24–48h na cijeloj teritoriji BiH.",
  },
];

const TRUST = [
  "Dostava 10,00 KM",
  "Povrat 14 dana",
  "Plaćanje pouzećem",
  "Garancija 6 mjeseci",
];

const HERO_STAVKE = [
  "18V brushless motor",
  "Bežični dizajn — 150 Nm",
  "U setu: 2 baterije, punjač i prenosivi kofer",
  "LED osvjetljenje radnog mjesta",
];

// ─── Stilski pomoćnici ────────────────────────────────────────────────────────
const BEBAS: React.CSSProperties = { fontFamily: "var(--font-manrope, sans-serif)" };
const ACCENT = "#E8460A";

// ─── Stranica ─────────────────────────────────────────────────────────────────
export default function MilwaukeePage() {
  return (
    <>
      <PixelEvents />
      <ProductPageHeader ctaHref="#narudzba" />

      <main className="overflow-x-hidden text-[#1a1a1a] pt-16">

        {/* ═══════════════════════════════════════════════════════════
            1. HERO  —  #F8F7F4
        ═══════════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28"
          style={{ background: "#F8F7F4" }}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* ── Lijevo: tekst ──────────────────────────────── */}
            <div>
              {/* Label */}
              <p
                className="text-xs font-bold tracking-[0.22em] uppercase mb-6"
                style={{ color: ACCENT }}
              >
                Milwaukee Tool — M18 Platforma
              </p>

              {/* Naslov */}
              <h1
                className="text-[#1a1a1a] mb-5 font-extrabold"
                style={{ fontSize: "clamp(48px, 8vw, 88px)", lineHeight: 1.0, letterSpacing: "-0.04em" }}
              >
                Milwaukee<br />
                M18 Bušilica
              </h1>

              {/* Tagline */}
              <p className="text-[#4a4a4a] text-lg mb-7 leading-relaxed">
                Profesionalna snaga. Kompaktni dizajn.
              </p>

              {/* Karakteristike lista */}
              <ul className="mb-8 space-y-2.5">
                {HERO_STAVKE.map((stavka) => (
                  <li key={stavka} className="flex items-start gap-2.5 text-[#4a4a4a] text-sm">
                    <span className="font-bold text-sm flex-shrink-0 mt-0.5" style={{ color: ACCENT }}>✓</span>
                    {stavka}
                  </li>
                ))}
              </ul>

              {/* Cijena */}
              <div className="mb-8">
                <span className="text-[#aaa] line-through text-sm font-medium">179,90 KM</span>
                <div className="mt-0.5 flex items-end gap-3">
                  <span
                    className="leading-none"
                    style={{ ...BEBAS, fontSize: "clamp(48px, 7vw, 72px)", color: ACCENT }}
                  >
                    69,90 KM
                  </span>
                  <span
                    className="mb-1 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ background: "#16a34a" }}
                  >
                    −61%
                  </span>
                </div>
                <p className="text-[#16a34a] text-xs font-semibold mt-1.5">
                  Uštedite 110 KM · Ograničena ponuda
                </p>
              </div>

              {/* CTA */}
              <a
                href="#narudzba"
                className="inline-flex items-center gap-2 bg-[#E8460A] hover:bg-[#cc3d08] text-white font-bold text-lg px-8 py-4 rounded-full transition-colors duration-150"
              >
                Naruči odmah
                <ChevronRight className="w-5 h-5" />
              </a>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="flex items-center gap-1.5 text-[#888] text-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Sigurna narudžba
                </span>
                <span className="text-[#ddd]">·</span>
                <span className="flex items-center gap-1.5 text-[#888] text-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8l4-2v10l-4-2" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  Dostava 10,00 KM
                </span>
                <span className="text-[#ddd]">·</span>
                <span className="flex items-center gap-1.5 text-[#888] text-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                  </svg>
                  Povrat 14 dana
                </span>
              </div>

              {/* "U setu dolazi" pill block */}
              <div
                className="mt-5 rounded-xl px-4 py-3"
                style={{ background: "#fff", border: "1px solid #E5E2DC" }}
              >
                <p
                  className="text-[#888] font-medium mb-2"
                  style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  U setu dolazi:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["2× Baterija 18V", "Punjač", "Prenosivi kofer", "Milwaukee M18 Bušilica"].map((item) => (
                    <span
                      key={item}
                      className="text-[#1a1a1a]"
                      style={{
                        background: "#F8F7F4",
                        border: "1px solid #E5E2DC",
                        borderRadius: 9999,
                        padding: "4px 12px",
                        fontSize: 13,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Desno: galerija s thumbnailima ───────────── */}
            <div className="relative flex justify-center lg:justify-end pt-6 pb-8">
              <HeroGallery />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            2. SPECIFIKACIJE I KARAKTERISTIKE  —  #FFFFFF
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white px-6 md:px-12 lg:px-20 xl:px-28 py-24 border-t border-[#E5E2DC]">
          <div className="max-w-7xl mx-auto">

            {/* Naslov */}
            <div className="mb-12">
              <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                Tehničke karakteristike
              </p>
              <h2
                className="text-[#1a1a1a] leading-none"
                style={{ ...BEBAS, fontSize: "clamp(48px, 7vw, 80px)" }}
              >
                SPECIFIKACIJE I KARAKTERISTIKE
              </h2>
            </div>

            {/* 2×4 spec kartice */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {SPEC_GRID.map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-5 flex flex-col items-start gap-3"
                  style={{ border: "1px solid #E5E2DC" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(232,70,10,0.07)", color: ACCENT }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs text-[#aaa] font-medium mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-[#1a1a1a] leading-tight">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="border-t border-[#E5E2DC] my-10" />

            {/* 2×3 feature lista */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-2xl p-6"
                  style={{ background: "#F8F7F4", border: "1px solid #E5E2DC" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(232,70,10,0.08)", color: ACCENT }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a] text-sm leading-tight mb-1">{title}</p>
                    <p className="text-[#888] text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            3. ZAŠTO ODABRATI  —  #F2F0EB
        ═══════════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-24 border-t border-[#E5E2DC]"
          style={{ background: "#F2F0EB" }}
        >
          <div className="max-w-7xl mx-auto">

            {/* Naslov */}
            <div className="mb-14">
              <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                Prednosti
              </p>
              <h2
                className="text-[#1a1a1a] leading-none"
                style={{ ...BEBAS, fontSize: "clamp(48px, 7vw, 80px)" }}
              >
                ZAŠTO ODABRATI OVAJ ALAT?
              </h2>
            </div>

            {/* 3 kartice */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ZASTO.map(({ num, title, desc }) => (
                <div
                  key={num}
                  className="relative bg-white rounded-2xl p-8 pb-10 overflow-hidden"
                  style={{ border: "1px solid #E5E2DC" }}
                >
                  <div
                    className="leading-none mb-3"
                    style={{ ...BEBAS, fontSize: 80, color: ACCENT }}
                  >
                    {num}
                  </div>
                  <h3 className="text-[#1a1a1a] font-bold text-lg mb-2 leading-tight">{title}</h3>
                  <p className="text-[#666] text-sm leading-relaxed">{desc}</p>
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: ACCENT }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            4. FAQ  —  #FFFFFF
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white px-6 md:px-12 lg:px-20 xl:px-28 py-24 border-t border-[#E5E2DC]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                Pitanja
              </p>
              <h2
                className="text-[#1a1a1a] leading-none"
                style={{ ...BEBAS, fontSize: "clamp(48px, 7vw, 80px)" }}
              >
                ČESTO POSTAVLJANA<br />PITANJA
              </h2>
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            5. CTA BANNER  —  #E8460A
        ═══════════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28"
          style={{ background: ACCENT }}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Lijevo */}
            <div>
              <h2
                className="text-white leading-[0.9] mb-10"
                style={{ ...BEBAS, fontSize: "clamp(52px, 8vw, 92px)" }}
              >
                NARUČI DANAS.<br />DOSTAVA SUTRA.
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {TRUST.map((label) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="text-white font-bold text-sm flex-shrink-0">✓</span>
                    <span className="text-white/90 font-medium text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Desno */}
            <div className="flex flex-col gap-5 lg:items-end">
              <div className="lg:text-right">
                <p className="text-white/50 text-sm font-medium line-through mb-1">179,90 KM</p>
                <p
                  className="text-white leading-none"
                  style={{ ...BEBAS, fontSize: "clamp(72px, 10vw, 108px)" }}
                >
                  69,90 KM
                </p>
                <p className="text-white/60 text-xs mt-2">
                  + dostava 10,00 KM · Ograničena ponuda
                </p>
              </div>
              <a
                href="#narudzba"
                className="inline-flex items-center gap-3 bg-white font-bold text-lg px-10 py-5 rounded-full hover:bg-white/90 transition-colors duration-150"
                style={{ color: ACCENT }}
              >
                Naruči odmah
                <ChevronRight className="w-5 h-5" />
              </a>
              <p className="text-white/40 text-xs lg:text-right">
                Plaćanje pouzećem · Nema skrivenih troškova
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            6. NARUDŽBA FORMA  —  #F8F7F4
        ═══════════════════════════════════════════════════════════ */}
        <section
          id="narudzba"
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-24 border-t border-[#E5E2DC]"
          style={{ background: "#F8F7F4" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                Narudžba
              </p>
              <h2
                className="text-[#1a1a1a] leading-none"
                style={{ ...BEBAS, fontSize: "clamp(48px, 7vw, 80px)" }}
              >
                NARUČI ODMAH
              </h2>
              <p className="text-[#666] mt-3 text-base max-w-lg">
                Popunite formu i mi ćemo vas kontaktirati radi potvrde. Dostava za 24–48h.
              </p>
            </div>
            <OrderForm />
          </div>
        </section>

        {/* ─── Podnožje ──────────────────────────────────────────── */}
        <footer
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
          style={{ background: "#F8F7F4", borderColor: "#E5E2DC" }}
        >
          <span className="text-[#888] text-sm">© 2025 Cartly.ba — Sva prava zadržana</span>
        </footer>
      </main>

      {/* Fixed UI elemeni */}
      <SocialProofToast />
      <FloatingOrderBar />
    </>
  );
}
