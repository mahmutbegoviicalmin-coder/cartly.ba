import Link from "next/link";
import { CATALOG, CATEGORIES } from "@/lib/catalog";

export default function StoreFooter() {
  return (
    <footer className="border-t border-[#F0E3DC] bg-white px-4 pb-10 pt-12 text-[13px] text-[#8C7B72] sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-[20px] font-bold tracking-[-0.03em] text-[#1D1D1F]">
              cartly<span className="text-[#F45B39]">.</span>ba
            </Link>
            <p className="mt-3 max-w-[260px] leading-relaxed">
              Alat, radna obuća i oprema za dom. Dostava po cijeloj BiH, plaćanje pouzećem.
            </p>
          </div>
          {CATEGORIES.map(c => (
            <div key={c.id}>
              <Link href={`/proizvodi?kategorija=${c.id}`} className="text-[13px] font-semibold text-[#1D1D1F] hover:underline">{c.label}</Link>
              <ul className="mt-3 space-y-2">
                {CATALOG.filter(p => p.category === c.id).slice(0, 6).map(p => (
                  <li key={p.slug}><Link href={`/${p.slug}`} className="hover:text-[#1D1D1F] hover:underline">{p.name}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-[#F0E3DC] pt-5 sm:flex-row">
          <span>© 2026 Cartly.ba</span>
          <span>Dostava 1–2 radna dana · Plaćanje pouzećem</span>
        </div>
      </div>
    </footer>
  );
}
