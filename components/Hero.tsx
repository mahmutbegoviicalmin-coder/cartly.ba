"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { event } from "@/lib/fbpixel";

const IMAGES = [
  { src: "/images/product-1.webp", alt: "Radne Patike S3 — pogled sprijeda" },
  { src: "/images/product-2.webp", alt: "Radne Patike S3 — BOA sistem detalj" },
  { src: "/images/product-3.webp", alt: "Radne Patike S3 — đon detalj" },
  { src: "/images/product-4.webp", alt: "Radne Patike S3 — bočni pogled" },
];

export default function Hero() {
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setImgIndex((i) => (i === 0 ? IMAGES.length - 1 : i - 1));
  const next = () => setImgIndex((i) => (i === IMAGES.length - 1 ? 0 : i + 1));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) next(); else prev(); }
    touchStartX.current = null;
  };

  const handleCTA = () => {
    event("AddToCart", { content_name: "Radne Patike S3 Tactical Black", value: 59.90, currency: "BAM" });
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Image Slider */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
              className="relative aspect-square bg-[#F5F5F5] overflow-hidden group select-none"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {IMAGES.map((img, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-400 ${
                    i === imgIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              ))}

              {/* Left arrow */}
              <button
                onClick={prev}
                aria-label="Prethodna slika"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 border border-black/10 flex items-center justify-center text-black/60 hover:text-black hover:border-black/30 transition-all
                  sm:opacity-0 sm:group-hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* Right arrow */}
              <button
                onClick={next}
                aria-label="Sljedeća slika"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 border border-black/10 flex items-center justify-center text-black/60 hover:text-black hover:border-black/30 transition-all
                  sm:opacity-0 sm:group-hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2">
              {IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  aria-label={`Slika ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === imgIndex
                      ? "w-5 h-2 bg-[#FF6B00]"
                      : "w-2 h-2 bg-black/20 hover:bg-black/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Badge + Title */}
            <div>
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#FF6B00] mb-3">
                Zaštitna obuća S3
              </span>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight text-[#0A0A0A]">
                Radne Patike S3
                <br />
                <span className="text-black/40">Tactical Black</span>
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-[#FF6B00]">59,90 KM</span>
              <span className="text-lg text-black/35 line-through font-medium">139,90 KM</span>
              <span className="bg-[#FF6B00] text-white text-sm font-bold px-2.5 py-1">
                −57%
              </span>
            </div>

            {/* Description */}
            <p className="text-black/60 leading-relaxed text-sm sm:text-base">
              Profesionalna zaštitna obuća s čeličnom kapicom i BOA sistemom zatvaranja.
              Dizajnirana za maksimalnu zaštitu i udobnost na radnom mjestu.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleCTA}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#FF6B00", color: "#fff", borderRadius: 8,
                padding: "16px 40px", fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 600, fontSize: 16, border: "none",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#e05e00"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#FF6B00"; }}
            >
              Naruči odmah
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-black/10">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span className="text-xs font-medium text-black/70">Plaćanje pouzećem</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <path d="M16 8h4l3 5v3h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span className="text-xs font-medium text-black/70">Dostava 10,00 KM</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                </svg>
                <span className="text-xs font-medium text-black/70">Povrat 14 dana</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
