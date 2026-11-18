import Link from "next/link";
import { ArrowRight, Banknote, CheckCircle2, BadgePercent, RotateCcw, Star, Truck } from "lucide-react";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import HeroSlider from "@/components/store/HeroSlider";
import Lisko from "@/components/store/Lisko";
import ProductOnFloor from "@/components/store/ProductOnFloor";
import { Countdown, DuringBlackNovember } from "@/components/store/BlackNovember";
import { CATALOG, CATEGORIES, MAX_DISCOUNT, bestsellers, bySlug, cardImage, discountPct, heroImage, km, topDeals } from "@/lib/catalog";

export const metadata = { alternates: { canonical: "/" } };

// Re-render the static HTML regularly so campaign blocks also leave the server
// HTML soon after 1 Dec (the client hides them at midnight on its own).
export const revalidate = 600;

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const TRUST = [
  { Icon: CheckCircle2, title: "Automatski zaprimljeno", desc: "Bez poziva i čekanja potvrde" },
  { Icon: Truck,        title: "Stiže za 1–2 dana",      desc: "Na adresu, po cijeloj BiH" },
  { Icon: Banknote,     title: "Plaćanje pouzećem",      desc: "Plaćate kuriru kad stigne" },
  { Icon: RotateCcw,    title: "Povrat 14 dana",         desc: "Ako proizvod ne odgovara" },
];

const STEPS = [
  { title: "Naručite za minutu",     desc: "Ime, adresa i broj telefona. Bez registracije i bez kartice." },
  { title: "Automatski zaprimljeno", desc: "Narudžba je 100% zaprimljena čim je pošaljete. Nema poziva ni dodatne potvrde." },
  { title: "Stiže za 1–2 dana",      desc: "Paket šaljemo odmah. Plaćate kuriru tek kad ga držite u ruci." },
];

const REVIEWS = [
  { name: "Amar K.",   city: "Sarajevo", product: "Radne patike S3",   text: "Naručio sam patike i stigle su već sutradan. Kvalitet je odličan, čelična kapica je solidna i udobne su cijeli dan." },
  { name: "Mirela H.", city: "Tuzla",    product: "Bluetooth zvučnik", text: "Zvučnik je stigao dobro upakovan, zvuk je zaista snažan za tu cijenu. Poklonila sam mužu i bio je oduševljen." },
  { name: "Edin M.",   city: "Mostar",   product: "V380 Pro kamera",   text: "Kamera radi odlično, instalacija je bila jednostavna. Slika je oštra i noćni vid je bolji nego što sam očekivao." },
];

function SectionHead({ eyebrow, title, href, linkLabel = "Pogledaj sve" }: { eyebrow?: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="min-w-0">
        {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#F45B39]">{eyebrow}</p>}
        <h2 className="mt-2 text-[30px] font-bold leading-[1.05] tracking-[-0.035em] text-[#2A1E18] sm:text-[44px]">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[14px] font-semibold text-[#2A1E18] ring-1 ring-[#F0E3DC] transition-colors hover:text-[#F45B39] sm:inline-flex">
          {linkLabel} <ArrowRight size={15} strokeWidth={2.25} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const best  = bestsellers();
  const deals = topDeals(8);
  const duo   = [bySlug("set-2u1"), bySlug("radne-patike-aeox")].filter(Boolean) as NonNullable<ReturnType<typeof bySlug>>[];

  return (
    <div className="bg-[#FFF8F4] text-[#2A1E18] antialiased" style={{ fontFamily: FONT }}>
      <StoreHeader />

      <main>
        <h1 className="sr-only">Cartly.ba: alat, radna obuća i oprema za dom uz plaćanje pouzećem</h1>

        <HeroSlider />

        {/* ═══ Trust ═══════════════════════════════════════════════════════ */}
        <section className="px-3 pt-4 sm:px-6 sm:pt-6">
          <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-2 rounded-[28px] bg-white p-2 ring-1 ring-[#F0E3DC] lg:grid-cols-4">
            {TRUST.map(({ Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3 rounded-[20px] p-3 sm:p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDEDE7] text-[#F45B39]">
                  <Icon size={19} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-tight sm:text-[15px]">{title}</p>
                  <p className="mt-1 text-[12px] leading-snug text-[#8C7B72] sm:text-[13px]">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ═══ Black November ══════════════════════════════════════════════ */}
        <DuringBlackNovember>
          <section id="black-november" className="scroll-mt-24 px-3 pt-14 sm:px-6 lg:pt-20">
            <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[36px] bg-[#F45B39]">
              <div aria-hidden className="tape-stripes tape-stripes-move h-3" />
              <div className="px-4 pb-10 pt-8 sm:px-10 sm:pb-14 sm:pt-12">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex items-end gap-3 text-white">
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#F45B39]">
                        <BadgePercent size={14} strokeWidth={2.5} /> Black November
                      </p>
                      <h2 className="mt-3 text-[36px] font-black leading-[0.98] tracking-[-0.045em] sm:text-[56px]">Popusti do −{MAX_DISCOUNT}%</h2>
                      <p className="mt-2 text-[15px] text-white/85 sm:text-[17px]">Najveća sniženja ove godine. Cijene se vraćaju 1. decembra.</p>
                    </div>
                    <Lisko size={92} bubble="top-end" messages={["Klikni me!", "Najbolje cijene su ovdje 👇", "Ne čekaj, ističe 30.11.!"]} className="ml-auto hidden sm:block lg:hidden" />
                  </div>
                  <div className="flex items-end gap-4">
                    <Countdown />
                    <Lisko size={96} bubble="top-end" messages={["Klikni me!", "Najbolje cijene su ovdje 👇", "Ne čekaj, ističe 30.11.!"]} className="hidden lg:block" />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {deals.map((p, i) => <div key={p.slug} className={i >= 4 ? "hidden md:block" : ""}><ProductCard product={p} /></div>)}
                </div>

                <div className="mt-8 flex justify-center">
                  <Link href="/proizvodi?sort=discount" className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-bold text-[#F45B39] shadow-[0_10px_24px_-12px_rgba(80,20,5,0.5)] transition-transform hover:scale-[1.02] active:scale-95">
                    Sve Black November ponude <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
              <div aria-hidden className="tape-stripes tape-stripes-move h-3" />
            </div>
          </section>
        </DuringBlackNovember>

        {/* ═══ Bestsellers ═════════════════════════════════════════════════ */}
        <section id="bestseleri" className="scroll-mt-16 px-3 py-14 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-[1200px]">
            <SectionHead eyebrow="Najprodavanije" title="Bestseleri." href="/proizvodi" linkLabel="Svi proizvodi" />
            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {best.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 2} />)}
            </div>
          </div>
        </section>

        {/* ═══ Feature duo ═════════════════════════════════════════════════ */}
        {duo.length === 2 && (
          <section className="px-3 sm:px-6">
            <div className="mx-auto grid max-w-[1200px] gap-3 md:grid-cols-2">
              {duo.map((p, i) => {
                const d = discountPct(p);
                return (
                  <Link key={p.slug} href={`/${p.slug}`} className={`group relative flex flex-col overflow-hidden rounded-[32px] p-7 ring-1 ring-[#F0E3DC] sm:p-10 ${i === 0 ? "bg-white" : "bg-[#FDEDE7]"}`}>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#F45B39]">{d > 0 ? `Uštedite ${d}%` : "Izdvojeno"}</p>
                    <h3 className="mt-2 text-[26px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[34px]">{p.name}</h3>
                    <p className="mt-1.5 text-[15px] text-[#8C7B72]">{p.short}</p>
                    <div className="relative mt-2 aspect-[16/10] w-full">
                      <ProductOnFloor slug={p.slug} src={heroImage(p)} alt="" sizes="(max-width: 768px) 60vw, 460px" tileAspect={1.6} floor={6} area={0.42} maxW={0.86} maxH={0.88} className="transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] [transform-origin:50%_100%] group-hover:scale-[1.05]" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[22px] font-bold tabular-nums text-[#F45B39]">{km(p.price)}</span>
                      <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[#2A1E18]/[0.04] px-5 text-[14px] font-semibold transition-colors group-hover:bg-[#F45B39] group-hover:text-white">
                        Pogledaj <ArrowRight size={15} strokeWidth={2.25} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ Categories ══════════════════════════════════════════════════ */}
        <section className="px-3 py-14 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-[1200px]">
            <SectionHead eyebrow="Kategorije" title="Kupujte po kategoriji." />
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {CATEGORIES.map(c => {
                const items = CATALOG.filter(p => p.category === c.id);
                const lead  = items.find(p => p.bestseller) ?? items[0];
                return (
                  <Link key={c.id} href={`/proizvodi?kategorija=${c.id}`} className="group flex flex-col rounded-[28px] bg-white p-2 ring-1 ring-[#F0E3DC] transition-shadow duration-300 hover:shadow-[0_18px_40px_-18px_rgba(244,91,57,0.35)]">
                    <div className="relative aspect-[5/4] overflow-hidden rounded-[22px] bg-[radial-gradient(120%_90%_at_50%_15%,#FFFFFF_0%,#FBF1EB_55%,#F6E4DA_100%)]">
                      {lead && <ProductOnFloor slug={lead.slug} src={cardImage(lead)} alt="" sizes="(max-width: 768px) 50vw, 260px" tileAspect={1.25} floor={12} area={0.3} maxH={0.7} className="transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] [transform-origin:50%_100%] group-hover:scale-[1.06]" />}
                    </div>
                    <div className="flex items-end justify-between gap-3 px-4 pb-4 pt-4">
                      <div>
                        <h3 className="text-[21px] font-bold tracking-[-0.02em]">{c.label}</h3>
                        <p className="mt-0.5 text-[14px] text-[#8C7B72]">{items.length} proizvoda</p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEDE7] text-[#F45B39] transition-colors group-hover:bg-[#F45B39] group-hover:text-white">
                        <ArrowRight size={17} strokeWidth={2.25} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ How it works + Lisko ════════════════════════════════════════ */}
        <section className="px-3 sm:px-6">
          <div className="mx-auto grid max-w-[1200px] gap-3 lg:grid-cols-[1fr_2fr]">
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-[#FDEDE7] p-8 sm:p-10">
              <Lisko size={150} bubble="right" messages={["Ćao, ja sam Lisko! 👋", "Narudžba se zaprima automatski.", "Paket stiže za 1–2 dana!", "Plaćaš tek kad stigne."]} />
              <div className="mt-8">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#F45B39]">Upoznajte Liska</p>
                <h2 className="mt-2 text-[28px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[34px]">Brz kao lisica. Paket stiže za 1–2 dana.</h2>
              </div>
            </div>
            <ol className="grid gap-3 rounded-[32px] bg-white p-3 ring-1 ring-[#F0E3DC] sm:grid-cols-3">
              {STEPS.map(({ title, desc }, i) => (
                <li key={title} className="rounded-[24px] bg-[#FFF8F4] p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDEDE7] text-[14px] font-bold text-[#F45B39]">{i + 1}</span>
                  <h3 className="mt-5 text-[18px] font-bold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.6] text-[#8C7B72]">{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ Reviews ═════════════════════════════════════════════════════ */}
        <section className="px-3 py-14 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-[1200px]">
            <SectionHead eyebrow="Recenzije" title="Šta kažu kupci." />
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {REVIEWS.map(r => (
                <figure key={r.name} className="flex flex-col rounded-[28px] bg-white p-7 ring-1 ring-[#F0E3DC]">
                  <div className="flex gap-0.5" aria-label="5 od 5">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} strokeWidth={0} className="fill-[#F45B39]" />)}
                  </div>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-[1.65] sm:text-[16px]">&bdquo;{r.text}&ldquo;</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 text-[13px]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDEDE7] text-[14px] font-bold text-[#F45B39]">{r.name[0]}</span>
                    <span>
                      <span className="block font-semibold">{r.name}</span>
                      <span className="text-[#8C7B72]">{r.city} · {r.product}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Final CTA ═══════════════════════════════════════════════════ */}
        <section className="px-3 pb-14 sm:px-6 lg:pb-20">
          <div className="mx-auto max-w-[1200px] rounded-[36px] bg-[#FDEDE7] px-6 py-14 text-center sm:px-12 sm:py-20">
            <Lisko size={110} bubble="top" messages={["Hajde, pogledaj sve!", "Imamo " + CATALOG.length + " proizvoda 🛒"]} className="mx-auto" />
            <h2 className="mx-auto mt-6 max-w-[640px] text-[30px] font-bold leading-[1.08] tracking-[-0.035em] sm:text-[46px]">Pronađite ono što vam treba.</h2>
            <p className="mx-auto mt-3 max-w-[460px] text-[15px] leading-relaxed text-[#8C7B72] sm:text-[17px]">
              {CATALOG.length} proizvoda. Narudžba se zaprima automatski, a paket stiže za 1–2 dana.
            </p>
            <Link href="/proizvodi" className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#F45B39] px-7 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(244,91,57,0.7)] transition-colors hover:bg-[#DB4724]">
              Pogledaj sve proizvode <ArrowRight size={16} strokeWidth={2.25} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
