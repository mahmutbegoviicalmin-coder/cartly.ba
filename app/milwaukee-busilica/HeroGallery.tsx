"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const IMAGES = [
  { src: "/images/milw1.webp", alt: "Milwaukee M18 Bušilica — pogled 1" },
  { src: "/images/milw2.webp", alt: "Milwaukee M18 Bušilica — pogled 2" },
  { src: "/images/milw3.webp", alt: "Milwaukee M18 Bušilica — pogled 3" },
  { src: "/images/milw4.webp", alt: "Milwaukee M18 Bušilica — pogled 4" },
];

const ACCENT = "#E8460A";

export default function HeroGallery() {
  const [selected, setSelected] = useState(1); // milw2.webp as default
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, closeLightbox]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  return (
    <>
      <div className="relative flex flex-col gap-4 w-full max-w-[560px] mx-auto lg:mx-0">

        {/* Glavna slika */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="relative w-full rounded-2xl overflow-hidden cursor-zoom-in focus:outline-none group shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
          style={{ aspectRatio: "4/5", background: "#F2F0EB" }}
          aria-label="Povećaj sliku"
        >
          {/* Na stanju badge — inside image container */}
          <div
            className="absolute top-4 right-4 z-10 bg-white rounded-xl shadow-md px-3 py-2 flex items-center gap-2"
            style={{ border: "1px solid #f0ede8" }}
          >
            <span className="w-2 h-2 rounded-full bg-[#16a34a] flex-shrink-0" />
            <span className="text-sm font-semibold text-[#1a1a1a]">Na stanju</span>
          </div>
          <Image
            src={IMAGES[selected].src}
            alt={IMAGES[selected].alt}
            fill
            className="object-contain transition-opacity duration-200"
            priority
            sizes="(max-width: 768px) 100vw, 560px"
          />
          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#444] opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            Povećaj
          </div>
        </button>

        {/* Thumbnails */}
        <div className="flex gap-3">
          {IMAGES.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setSelected(i)}
              className="relative flex-1 rounded-xl overflow-hidden transition-all duration-150 focus:outline-none"
              style={{
                aspectRatio: "1/1",
                border: selected === i ? `2px solid ${ACCENT}` : "2px solid transparent",
                background: "#F2F0EB",
                boxShadow: selected === i ? `0 0 0 1px ${ACCENT}20` : "none",
                opacity: selected === i ? 1 : 0.7,
              }}
              aria-label={`Prikaži sliku ${i + 1}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-contain"
                sizes="100px"
              />
            </button>
          ))}
        </div>

        {/* Recenzije kartica */}
        <div
          className="absolute -bottom-4 -left-3 sm:-left-6 bg-white rounded-xl shadow-md px-4 py-3 flex items-center gap-2.5 z-10"
          style={{ border: "1px solid #f0ede8" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          <div>
            <p className="text-sm font-bold text-[#1a1a1a] leading-none">4.9 / 5.0</p>
            <p className="text-[10px] text-[#888] mt-0.5">312 recenzija</p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-xl focus:outline-none"
            aria-label="Zatvori"
          >
            ✕
          </button>

          {/* Image */}
          <div
            className="relative w-[90vw] max-w-3xl"
            style={{ aspectRatio: "4/3" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={IMAGES[selected].src}
              alt={IMAGES[selected].alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {/* Thumbnail nav */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {IMAGES.map((img, i) => (
              <button
                key={img.src}
                onClick={() => setSelected(i)}
                className="relative w-14 h-14 rounded-lg overflow-hidden transition-all duration-150 focus:outline-none"
                style={{
                  border: selected === i ? `2px solid ${ACCENT}` : "2px solid rgba(255,255,255,0.2)",
                  background: "#222",
                  opacity: selected === i ? 1 : 0.6,
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
