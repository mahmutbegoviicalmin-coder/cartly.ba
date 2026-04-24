import type { Metadata } from "next";
import ProductPageHeader from "@/components/ProductPageHeader";
import ImageGallery     from "./ImageGallery";
import OrderForm        from "./OrderForm";
import SocialProofToast from "./SocialProofToast";
import LiveCounter      from "./LiveCounter";
import FloatingCTA      from "./FloatingCTA";
import PixelEvents      from "./PixelEvents";

export const metadata: Metadata = {
  title:       "Bluetooth Zvučnik ZQS-6239 — 40W, Bežični Mikrofon | Cartly.ba",
  description: "Bluetooth zvučnik ZQS-6239 sa bežičnim mikrofonom, 40W, IPX5, USB-C, FM radio. 59,90 KM. Plaćanje pouzećem. Dostava Brza Pošta.",
};

const ACCENT = "#FF6B00";

// ─── Data ────────────────────────────────────────────────────────────────────
const HIGHLIGHTS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
    title: "40W Crystal Sound",
    desc:  "Kristalno čist zvuk s dubokim basom za svako slavlje.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8"  y1="23" x2="16" y2="23" />
      </svg>
    ),
    title: "Bežični Mikrofon",
    desc:  "Idealan za karaoke, slavlja i zabave u zatvorenom i otvorenom prostoru.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </svg>
    ),
    title: "Bluetooth 5.0",
    desc:  "Stabilan bežični signal do 10 metara udaljenosti.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="16" height="10" rx="2" />
        <path d="M22 11v2" />
        <line x1="6"  y1="11" x2="6"  y2="13" strokeWidth="2.5" />
        <line x1="10" y1="11" x2="10" y2="13" strokeWidth="2.5" />
      </svg>
    ),
    title: "6h Autonomija",
    desc:  "Baterija od 3000mAh osigurava do 6 sati neprekidne muzike.",
  },
];

const SPECS: [string, string][] = [
  ["Model",         "ZQS-6239"],
  ["Bluetooth",     "5.0 · domet 10m"],
  ["Snaga",         "40W RMS"],
  ["Frekvencija",   "60Hz – 20kHz"],
  ["Baterija",      "3000mAh · do 6h"],
  ["Punjenje",      "USB-C"],
  ["Mikrofon",      "Bežični 2.4GHz"],
  ["Vodootpornost", "IPX5"],
  ["FM Radio",      "Da"],
  ["USB / microSD", "Da / Da"],
  ["Dimenzije",     "32 × 13 × 13 cm"],
  ["Težina",        "~1.8 kg"],
];

const REVIEWS = [
  {
    ime:   "Kenan Muratović",
    grad:  "Sarajevo",
    datum: "18. april 2025.",
    tekst: "Zvuk je fenomenalan za ovu cijenu. Mikrofon radi savršeno, koristio sam na slavlju i svi su bili oduševljeni. Dostava je stigla za 2 dana, bez problema.",
  },
  {
    ime:   "Amira Hadžić",
    grad:  "Tuzla",
    datum: "21. april 2025.",
    tekst: "Naručila za karaoke noć sa prijateljicama. Bass je jak, mikrofon hvatao bez šuma. Jedino što bi moglo biti bolje je veći displej. Inače, super kupovina!",
  },
  {
    ime:   "Darko Jurić",
    grad:  "Mostar",
    datum: "14. april 2025.",
    tekst: "Odlična kvaliteta zvuka za 40W zvučnik. Bluetooth 5.0 se odmah uparovao s telefonom, domet stvarno ide do 10 metara. Preporučujem svima.",
  },
  {
    ime:   "Selma Kovačević",
    grad:  "Zenica",
    datum: "25. april 2025.",
    tekst: "Naručila pouzećem, sve prošlo super. Zvučnik je veći nego što sam mislila ali kvalitet je odličan. USB-C punjenje je veliki plus. Petice zaslužena.",
  },
];

const TAGS = ["Bežični mikrofon", "Bluetooth 5.0", "IPX5", "USB-C punjenje", "FM Radio"];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ZvucnikPage() {
  return (
    <>
      <PixelEvents />
      <ProductPageHeader ctaHref="#naruci" />

      <main
        className="overflow-x-hidden text-gray-900 pt-[60px] md:pt-[68px]"
        style={{ background: "#f8f8f8" }}
      >

        {/* ════════════════════════════════════════════════════════════
            1. HERO
        ════════════════════════════════════════════════════════════ */}
        <section className="bg-white px-5 md:px-10 lg:px-16 xl:px-24 py-14 md:py-20 border-b border-gray-100">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* LEFT — image gallery */}
            <ImageGallery />

            {/* RIGHT — product info */}
            <div className="flex flex-col gap-6">

              {/* Live viewer count */}
              <LiveCounter />

              {/* Name */}
              <div>
                <p className="text-[#FF6B00] text-xs font-semibold tracking-widest uppercase mb-2">
                  Model ZQS-6239 · Prvomajska akcija
                </p>
                <h1 className="text-gray-900 font-extrabold" style={{ fontSize: "clamp(38px, 5vw, 58px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
                  Bluetooth Zvučnik<br />
                  <span style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400, color: "#9CA3AF", letterSpacing: "-0.01em" }}>sa Bežičnim Mikrofonom</span>
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="1">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-500 text-sm">4.9 · 47 recenzija</span>
              </div>

              {/* Price block */}
              <div className="rounded-2xl p-5 flex flex-col gap-1 bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-gray-900" style={{ fontSize: "clamp(36px, 6vw, 52px)", lineHeight: 1 }}>
                    59,90 KM
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 line-through text-base font-medium">129,90 KM</span>
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: ACCENT }}>
                      -54% popust
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery row */}
              <div className="flex items-center gap-2.5 text-sm text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <path d="M16 8l4-2v10l-4-2" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>
                  Dostava <strong className="text-gray-900">10,00 KM</strong> · Brza Pošta · 1–3 radna dana
                </span>
              </div>

              {/* Feature tag pills */}
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-gray-700 rounded-full px-3 py-1.5 bg-gray-100 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <a
                href="#naruci"
                className="flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90"
                style={{ background: ACCENT }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Naruči odmah
              </a>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
                {[
                  { label: "Plaćanje pouzećem", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                  { label: "Povrat 14 dana",    d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5" },
                ].map(({ label, d }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={d} />
                    </svg>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            2. PRODUCT HIGHLIGHTS
        ════════════════════════════════════════════════════════════ */}
        <section className="px-5 md:px-10 lg:px-16 xl:px-24 py-16 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#FF6B00] text-xs font-semibold tracking-widest uppercase mb-3">Karakteristike</p>
            <h2 className="text-gray-900 font-bold text-3xl mb-10">Zašto ZQS-6239?</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {HIGHLIGHTS.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl p-6 flex flex-col gap-4 bg-white border border-gray-200 hover:border-orange-300 transition-colors duration-150 shadow-sm"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#fff7ed", color: ACCENT }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-sm leading-tight mb-1">{title}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. SPECIFICATIONS
        ════════════════════════════════════════════════════════════ */}
        <section className="px-5 md:px-10 lg:px-16 xl:px-24 py-16 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#FF6B00] text-xs font-semibold tracking-widest uppercase mb-3">Specifikacije</p>
            <h2 className="text-gray-900 font-bold text-3xl mb-10">Tehničke specifikacije</h2>

            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              {SPECS.map(([label, value], i) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-6 py-4"
                  style={{
                    background:   i % 2 === 0 ? "#ffffff" : "#f9f9f9",
                    borderBottom: i < SPECS.length - 1 ? "1px solid #e5e5e5" : "none",
                  }}
                >
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="text-gray-900 text-sm font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            4. ORDER FORM
        ════════════════════════════════════════════════════════════ */}
        <section
          id="naruci"
          className="px-5 md:px-10 lg:px-16 xl:px-24 py-20 bg-gray-50 border-b border-gray-100"
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-[#FF6B00] text-xs font-semibold tracking-widest uppercase mb-3 text-center">Narudžba</p>
            <h2 className="text-gray-900 font-bold text-3xl text-center mb-2">Naruči odmah</h2>
            <p className="text-gray-500 text-sm text-center mb-10">
              Dostava Brza Pošta · 1–3 radna dana · Plaćanje pouzećem
            </p>

            <div className="rounded-2xl p-6 md:p-8 bg-white border border-gray-200 shadow-sm">
              <OrderForm />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            5. REVIEWS
        ════════════════════════════════════════════════════════════ */}
        <section className="px-5 md:px-10 lg:px-16 xl:px-24 py-16 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-10">
              <div>
                <p className="text-[#FF6B00] text-xs font-semibold tracking-widest uppercase mb-3">Recenzije</p>
                <h2 className="text-gray-900 font-bold text-3xl">Što kažu kupci</h2>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto pb-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="1">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-900 font-bold">4.9</span>
                <span className="text-gray-400 text-sm">· 47 recenzija</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {REVIEWS.map(({ ime, grad, datum, tekst }) => (
                <div
                  key={ime}
                  className="rounded-2xl p-6 flex flex-col gap-4 bg-white border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{ime}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{grad} · {datum}</p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 flex-shrink-0"
                      style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-[11px] font-semibold text-green-700">Potvrđena kupovina</span>
                    </div>
                  </div>

                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="1">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">{tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Footer ──────────────────────────────────────────────── */}
        <footer className="px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 text-xs text-gray-400 bg-white">
          <span>© 2025 Cartly.ba — Sva prava zadržana</span>
          <span>Bluetooth Zvučnik ZQS-6239</span>
        </footer>
      </main>

      <SocialProofToast />
      <FloatingCTA />
    </>
  );
}

