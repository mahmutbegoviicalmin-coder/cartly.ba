"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const images = [
  { src: "/images/product-1.webp", alt: "Radne Patike S3 — pogled sprijeda" },
  { src: "/images/product-2.webp", alt: "Radne Patike S3 — BOA sistem detalj" },
  { src: "/images/product-3.webp", alt: "Radne Patike S3 — đon detalj" },
  { src: "/images/product-4.webp", alt: "Radne Patike S3 — bočni pogled" },
];

export default function Gallery() {
  const [current, setCurrent] = useState(0);

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  return (
    <section className="bg-white border-t border-black/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">

        <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 text-[#FF6B00]">
          Galerija
        </h2>

        {/* Main image */}
        <div
          className="relative aspect-square sm:aspect-[4/3] bg-[#F5F5F5] overflow-hidden select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-400 ${
                i === current ? "opacity-100 z-10" : "opacity-0 z-0"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-black/10 flex items-center justify-center hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Sljedeća slika"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-black/10 flex items-center justify-center hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-3 mt-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={img.alt}
              className={`relative flex-1 aspect-square bg-[#F5F5F5] overflow-hidden border-2 transition-colors ${
                i === current ? "border-[#FF6B00]" : "border-transparent hover:border-black/20"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
