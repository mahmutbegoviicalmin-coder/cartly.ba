import { fitInTile } from "@/lib/catalog";

interface Props {
  slug: string;
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Load right away even when not priority (e.g. upcoming slider slides). */
  eager?: boolean;
  /** Tile width / height (1 = square). */
  tileAspect?: number;
  /** Distance of the floor from the tile bottom, in % of tile height. */
  floor?: number;
  area?: number;
  maxW?: number;
  maxH?: number;
  /** Shadow colour (rgb triplet). */
  shadow?: string;
  className?: string;
}

/**
 * A product standing on the floor of its tile: sized by visual area (so wide
 * and tall products look equally big), bottom-anchored, with a contact shadow
 * exactly as wide as the product's footprint.
 */
export default function ProductOnFloor({
  slug, src, alt, sizes, priority, eager, tileAspect = 1, floor = 12, area, maxW, maxH, shadow = "110,45,25", className = "",
}: Props) {
  const { w, h } = fitInTile(slug, { area, maxW, maxH: maxH !== undefined ? maxH / tileAspect : undefined });
  const hPct = h * tileAspect; // convert from width-units to % of tile height
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-[50%]"
        style={{
          left: `${50 - w * 0.47}%`, width: `${w * 0.94}%`,
          bottom: `calc(${floor}% - ${Math.max(1.6, hPct * 0.05)}%)`, height: `${Math.max(3.2, hPct * 0.1)}%`,
          background: `radial-gradient(closest-side, rgba(${shadow},.30), rgba(${shadow},.12) 55%, rgba(${shadow},0))`,
        }}
      />
      <div className={`absolute ${className}`} style={{ left: `${(100 - w) / 2}%`, width: `${w}%`, bottom: `${floor}%`, height: `${hPct}%` }}>
        {/* Plain <img> with our own 480/800/1200 variants: the site runs with images.unoptimized, so this is how phones get small files. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={`/shop/sm/${slug}.webp 480w, /shop/md/${slug}.webp 800w, /shop/${slug}.webp 1200w`}
          sizes={sizes}
          alt={alt}
          loading={priority || eager ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : {})}
          className="absolute inset-0 h-full w-full object-contain object-bottom"
          draggable={false}
        />
      </div>
    </>
  );
}
