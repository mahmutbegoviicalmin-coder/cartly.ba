import type { Metadata } from "next";
import {
  Battery,
  Zap,
  Briefcase,
  Wrench,
  Shield,
  Activity,
  Timer,
  Gauge,
  Circle,
  Ruler,
  ChevronRight,
  CheckCircle2,
  Lock,
  Truck,
  RefreshCw,
} from "lucide-react";
import ProductPageHeader from "@/components/ProductPageHeader";
import HeroImage         from "./HeroImage";
import OrderForm         from "./OrderForm";
import FaqAccordion      from "./FaqAccordion";
import FloatingCTA       from "./FloatingCTA";
import SocialProofToast  from "./SocialProofToast";
import PixelEvents       from "./PixelEvents";

export const metadata: Metadata = {
  title: "Profesionalna Akumulatorska Brusilica — Komplet | Cartly.ba",
  description:
    "Akumulatorska brusilica sa 2× M18 B5 baterije, M12-18 FC punjačem i HD kaserom. Anti-kickback zaštita, AVS sistem, kočnica ispod 1s. Dostava 1–3 dana po cijeloj BiH.",
};

const ACCENT = "#FF6B00";

// ─── Data ────────────────────────────────────────────────────────────────────

const HERO_CHECKS = [
  "Anti-kickback zaštita i AVS Anti-Vibration sistem",
  "Kočnica — disk staje za manje od 1 sekunde",
  "Komplet: 2× M18 B5 baterija, punjač i HD kaseta",
  "Deadman sigurnosni prekidač",
];

const UNBOXING = [
  { Icon: Battery,  label: "2× M18 B5 Baterija",        desc: "Kapacitet 5Ah za dugotrajan profesionalni rad" },
  { Icon: Zap,      label: "M12-18 FC Punjač",           desc: "Brzo punjenje kompatibilno sa svim M18 baterijama" },
  { Icon: Briefcase,label: "HD Kaseta za prenošenje",    desc: "Čvrsta zaštita alata i baterija pri transportu" },
  { Icon: Wrench,   label: "Brusilica",                  desc: "Disk 125mm, brzina 3.500–8.500 rpm" },
];

const FEATURES = [
  { Icon: Shield,   title: "Anti-kickback zaštita",       desc: "Automatska zaštita od povratnog udarca pri blokiranju ili zahvatanju diska" },
  { Icon: Activity, title: "AVS sistem",                  desc: "Anti-vibracioni sistem smanjuje zamor i povećava preciznost pri dugotrajnom radu" },
  { Icon: Timer,    title: "Kočnica ispod 1 sekunde",     desc: "Disk se potpuno zaustavlja za manje od jedne sekunde radi maksimalne sigurnosti" },
  { Icon: Gauge,    title: "3.500–8.500 rpm",             desc: "Podesiva brzina pruža preciznu kontrolu za svaki materijal i primjenu" },
  { Icon: Circle,   title: "Promjer diska 125mm",         desc: "Standardna veličina diska, lako dostupna i kompatibilna s vodećim proizvođačima" },
  { Icon: Ruler,    title: "Dubina reza 33mm",            desc: "Maksimalna dubina reza za zahtjevne profesionalne primjene" },
];

const SPECS = [
  { label: "Anti-kickback zaštita",        value: "Da" },
  { label: "AVS Anti-Vibration sistem",    value: "Da" },
  { label: "Kočnica",                      value: "Da" },
  { label: "Vrijeme kočenja",              value: "< 1s" },
  { label: "Promjer diska",                value: "125mm" },
  { label: "Šta je u kompletu",            value: "2× M18 B5 Baterija, M12-18 FC Punjač, HD Kaseta" },
  { label: "Maksimalna dubina reza",       value: "33mm" },
  { label: "Broj okretaja bez opterećenja",value: "3.500–8.500 rpm" },
  { label: "Standardna oprema",            value: "Sigurnosna zaštita, stezaljka, prirubnica, matica prirubnice, ključ" },
  { label: "Isporučuje se u",              value: "HD Kaseti" },
  { label: "Vrsta prekidača",              value: "Deadman prekidač (sigurnosni)" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BrusilicaPage() {
  return (
    <>
      <PixelEvents />
      <ProductPageHeader ctaHref="#narudzba" />

      <main className="overflow-x-hidden">

        {/* ═══════════════════════════════════════════════════════
            1. HERO — cream/light
        ═══════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-24"
          style={{ background: "#F8F7F4" }}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── Text ─────────────────────────────────────── */}
            <div>
              <p
                className="text-xs font-bold tracking-[0.22em] uppercase mb-5"
                style={{ color: ACCENT }}
              >
                Profesionalni alat — M18 platforma
              </p>

              <h1
                className="font-extrabold text-[#1a1a1a] mb-5 leading-[1.0]"
                style={{ fontSize: "clamp(40px, 6.5vw, 76px)", letterSpacing: "-0.03em" }}
              >
                Profesionalna{" "}
                <span style={{ color: ACCENT }}>Akumulatorska</span>
                <br />Brusilica
              </h1>

              <p className="text-[#666] text-lg mb-7 leading-relaxed">
                Komplet sa 2 baterije, punjačem i HD kaserom za prenošenje
              </p>

              <ul className="mb-8 space-y-2.5">
                {HERO_CHECKS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[#555] text-sm">
                    <CheckCircle2
                      size={15}
                      strokeWidth={2.5}
                      style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="mb-8">
                <span className="text-[#aaa] line-through text-sm font-medium">159,90 KM</span>
                <div className="mt-1 flex items-end gap-3 flex-wrap">
                  <span
                    className="font-extrabold leading-none"
                    style={{ fontSize: "clamp(44px, 6.5vw, 68px)", color: ACCENT }}
                  >
                    74,90 KM
                  </span>
                  <span className="mb-1 text-xs font-bold px-2.5 py-1 rounded-full text-white bg-green-600">
                    -53%
                  </span>
                </div>
                <p className="text-green-600 text-xs font-semibold mt-1.5">
                  Uštedite 85 KM · Ograničena ponuda
                </p>
              </div>

              {/* CTA */}
              <a
                href="#narudzba"
                className="inline-flex items-center gap-2 text-white font-bold text-base px-8 py-4 rounded-full hover:opacity-90 transition-opacity duration-150"
                style={{ background: ACCENT }}
              >
                Naruči odmah
                <ChevronRight size={18} strokeWidth={2.5} />
              </a>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-4 mt-5">
                <span className="flex items-center gap-1.5 text-[#999] text-xs">
                  <Lock size={12} strokeWidth={2} />
                  Sigurna narudžba
                </span>
                <span className="text-[#ddd]">·</span>
                <span className="flex items-center gap-1.5 text-[#999] text-xs">
                  <Truck size={12} strokeWidth={2} />
                  Dostava 10,00 KM
                </span>
                <span className="text-[#ddd]">·</span>
                <span className="flex items-center gap-1.5 text-[#999] text-xs">
                  <RefreshCw size={12} strokeWidth={2} />
                  Povrat 14 dana
                </span>
              </div>

              {/* In the box pill */}
              <div
                className="mt-6 rounded-xl px-4 py-3"
                style={{ background: "#fff", border: "1px solid #E5E2DC" }}
              >
                <p className="text-[#aaa] font-semibold mb-2" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  U kompletu dolazi:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["2× M18 B5 Baterija", "M12-18 FC Punjač", "HD Kaseta", "Brusilica"].map((item) => (
                    <span
                      key={item}
                      className="text-[#1a1a1a] text-[13px]"
                      style={{ background: "#F8F7F4", border: "1px solid #E5E2DC", borderRadius: 9999, padding: "4px 12px" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Image ────────────────────────────────────── */}
            <div className="flex justify-center lg:justify-end">
              <HeroImage />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            2. WHAT'S IN THE BOX — white
        ═══════════════════════════════════════════════════════ */}
        <section className="bg-white px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-24 border-t border-[#E5E2DC]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                Sadržaj paketa
              </p>
              <h2
                className="font-extrabold text-[#1a1a1a] leading-none"
                style={{ fontSize: "clamp(32px, 5.5vw, 68px)", letterSpacing: "-0.03em" }}
              >
                Šta je u{" "}
                <span style={{ color: ACCENT }}>kompletu</span>?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {UNBOXING.map(({ Icon, label, desc }) => (
                <div
                  key={label}
                  className="rounded-2xl p-6 flex flex-col gap-4"
                  style={{ background: "#F8F7F4", border: "1px solid #E5E2DC" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,107,0,0.08)", color: ACCENT }}
                  >
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a] text-sm mb-1 leading-tight">{label}</p>
                    <p className="text-[#888] text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            3. KEY FEATURES — cream
        ═══════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-24 border-t border-[#E5E2DC]"
          style={{ background: "#F8F7F4" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                Karakteristike
              </p>
              <h2
                className="font-extrabold text-[#1a1a1a] leading-none"
                style={{ fontSize: "clamp(32px, 5.5vw, 68px)", letterSpacing: "-0.03em" }}
              >
                Ključne{" "}
                <span style={{ color: ACCENT }}>karakteristike</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-2xl p-6 bg-white"
                  style={{ border: "1px solid #E5E2DC" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(255,107,0,0.09)", color: ACCENT }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a] text-sm leading-tight mb-1.5">{title}</p>
                    <p className="text-[#888] text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            4. FULL SPECS TABLE — white, responsive
        ═══════════════════════════════════════════════════════ */}
        <section className="bg-white px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-24 border-t border-[#E5E2DC]">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                Tehničke specifikacije
              </p>
              <h2
                className="font-extrabold text-[#1a1a1a] leading-none"
                style={{ fontSize: "clamp(32px, 5.5vw, 68px)", letterSpacing: "-0.03em" }}
              >
                Sve{" "}
                <span style={{ color: ACCENT }}>specifikacije</span>
              </h2>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E2DC" }}>
              {SPECS.map(({ label, value }, i) => (
                <div
                  key={label}
                  className="px-5 py-4 sm:px-6 sm:py-4"
                  style={{
                    background:   i % 2 === 0 ? "#fff" : "#FAFAF8",
                    borderBottom: i < SPECS.length - 1 ? "1px solid #F0EDE8" : "none",
                  }}
                >
                  {/* Mobile: stacked — Desktop: 2-col */}
                  <div className="block sm:grid sm:grid-cols-2 sm:gap-6 sm:items-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#AAAAAA] mb-0.5 sm:mb-0 sm:text-sm sm:font-medium sm:normal-case sm:tracking-normal sm:text-[#666]">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            5. ORDER FORM — cream/light
        ═══════════════════════════════════════════════════════ */}
        <section
          id="narudzba"
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28 border-t border-[#E5E2DC]"
          style={{ background: "#F8F7F4" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                Narudžba
              </p>
              <h2
                className="font-extrabold text-[#1a1a1a] leading-none"
                style={{ fontSize: "clamp(32px, 5.5vw, 68px)", letterSpacing: "-0.03em" }}
              >
                Naruči{" "}
                <span style={{ color: ACCENT }}>odmah</span>
              </h2>
              <p className="text-[#888] mt-3 text-base max-w-lg">
                Popunite formu i mi ćemo vas kontaktirati radi potvrde. Dostava za 1–3 radna dana.
              </p>
            </div>
            <OrderForm />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            6. FAQ — white
        ═══════════════════════════════════════════════════════ */}
        <section className="bg-white px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-24 border-t border-[#E5E2DC]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: ACCENT }}>
                Pitanja
              </p>
              <h2
                className="font-extrabold text-[#1a1a1a] leading-none"
                style={{ fontSize: "clamp(32px, 5.5vw, 64px)", letterSpacing: "-0.03em" }}
              >
                Često postavljana{" "}
                <span style={{ color: ACCENT }}>pitanja</span>
              </h2>
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            7. FOOTER
        ═══════════════════════════════════════════════════════ */}
        <footer
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E2DC]"
          style={{ background: "#F8F7F4" }}
        >
          <span className="font-bold text-[#1a1a1a] text-sm">
            cartly<span style={{ color: ACCENT }}>.</span>ba
          </span>
          <p className="text-[#aaa] text-xs font-medium">
            © 2026 Cartly.ba — Dostava 10 KM · Plaćanje pouzećem
          </p>
        </footer>
      </main>

      <SocialProofToast />
      <FloatingCTA />
    </>
  );
}
