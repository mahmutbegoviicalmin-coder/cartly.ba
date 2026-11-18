import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CatalogProduct, cardImage, discountPct, km } from "@/lib/catalog";
import { BlackNovemberPriceNote, DiscountBadge } from "./BlackNovember";
import ProductOnFloor from "./ProductOnFloor";

interface Props {
  product: CatalogProduct;
  priority?: boolean;
}

/*
 * Store palette: page #FFF8F4, tiles #FDF1EC, ink #2A1E18, muted #8C7B72,
 * line #F0E3DC, accent #F45B39 (hover #DB4724).
 * Products stand on the tile floor (bottom-anchored, contact shadow), never float.
 */
export default function ProductCard({ product: p, priority }: Props) {
  const d = discountPct(p);

  return (
    <Link
      href={`/${p.slug}`}
      className="group flex min-w-0 flex-col rounded-[24px] bg-white p-2 shadow-[0_1px_2px_rgba(42,30,24,0.04)] ring-1 ring-[#F0E3DC] transition-[box-shadow,transform] duration-300 ease-out hover:shadow-[0_18px_40px_-18px_rgba(244,91,57,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F45B39] active:scale-[0.985] sm:hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[radial-gradient(120%_90%_at_50%_15%,#FFFFFF_0%,#FBF1EB_55%,#F6E4DA_100%)]">
        <ProductOnFloor
          slug={p.slug}
          src={cardImage(p)}
          alt={p.name}
          priority={priority}
          sizes="(max-width: 640px) 34vw, 200px"
          floor={13}
          className="transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] [transform-origin:50%_100%] group-hover:scale-[1.06]"
        />
        <div className="absolute left-2 top-2"><DiscountBadge pct={d} /></div>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-3">
        <h3 className="line-clamp-2 min-h-[2.6em] text-[14px] font-semibold leading-[1.3] text-[#2A1E18] sm:text-[15px]">{p.name}</h3>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {p.oldPrice && <p className="whitespace-nowrap text-[12px] tabular-nums text-[#B3A49B] line-through">{km(p.oldPrice)}</p>}
            <p className="whitespace-nowrap text-[16px] font-bold tabular-nums tracking-[-0.01em] text-[#F45B39] sm:text-[18px]">{km(p.price)}</p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDEDE7] text-[#F45B39] transition-all duration-300 group-hover:bg-[#F45B39] group-hover:text-white sm:h-9 sm:w-9">
            <ArrowRight size={17} strokeWidth={2.25} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
        <BlackNovemberPriceNote />
      </div>
    </Link>
  );
}
