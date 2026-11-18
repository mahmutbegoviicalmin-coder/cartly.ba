import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { relatedTo } from "@/lib/catalog";
import ProductCard from "./ProductCard";

interface Props {
  /** Slug of the product page this is shown on (excluded from the list). */
  current: string;
  title?: string;
  subtitle?: string;
  count?: number;
  /** Tighter spacing for use inside an order-success card. */
  compact?: boolean;
  className?: string;
}

/**
 * "Možda vas zanima": cross-sell grid for product landing pages, plus the
 * way back to the store. Self-contained styling so it drops into any page.
 */
export default function RelatedProducts({
  current,
  title = "Možda vas zanima",
  subtitle,
  count = 4,
  compact,
  className = "",
}: Props) {
  const items = relatedTo(current, count);
  if (!items.length) return null;

  if (compact) {
    return (
      <div className={`w-full text-left ${className}`}>
        <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-[#1D1D1F]">{title}</h3>
        {subtitle && <p className="mt-1 text-[14px] text-[#6E6E73]">{subtitle}</p>}
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
          {items.map(p => <ProductCard key={p.slug} product={p} />)}
        </div>
      </div>
    );
  }

  return (
    <section
      className={`bg-white px-4 py-16 text-[#1D1D1F] antialiased sm:px-6 lg:py-24 ${className}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.03em] sm:text-[40px]">{title}</h2>
            {subtitle && <p className="mt-2 text-[16px] text-[#6E6E73] sm:text-[17px]">{subtitle}</p>}
          </div>
          <Link href="/proizvodi" className="hidden shrink-0 items-center gap-1 text-[15px] font-medium text-[#111] underline-offset-4 hover:underline sm:inline-flex">
            Svi proizvodi <ArrowRight size={15} strokeWidth={2.25} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {items.map(p => <ProductCard key={p.slug} product={p} />)}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="inline-flex h-[48px] items-center justify-center gap-1.5 rounded-full border border-[#D2D2D7] px-6 text-[15px] font-semibold text-[#1D1D1F] transition-colors hover:bg-[#F5F5F7]">
            <ChevronLeft size={17} strokeWidth={2.25} /> Nazad na početnu
          </Link>
          <Link href="/proizvodi" className="inline-flex h-[48px] items-center justify-center gap-1.5 rounded-full bg-[#1D1D1F] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-black">
            Pogledaj sve proizvode <ArrowRight size={16} strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </section>
  );
}
