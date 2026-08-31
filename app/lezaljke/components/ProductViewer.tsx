"use client";

import { useState } from "react";
import Image from "next/image";
import { PRODUCT, PRODUCT_IMAGES } from "./types";

export default function ProductViewer() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const src = PRODUCT_IMAGES[activeIdx];

  return (
    <div className="relative flex flex-col items-center justify-center select-none gap-4">

      {/* Ambient glow behind image */}
      <div
        className="absolute inset-0 rounded-3xl blur-3xl opacity-30 transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at center, ${PRODUCT.hex}55 0%, transparent 70%)` }}
      />

      {/* Main image container */}
      <div
        className="relative w-full max-w-[560px] cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          transform: hovered ? "translateY(-8px) scale(1.015)" : "translateY(0) scale(1)",
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ aspectRatio: "1/1", background: `linear-gradient(145deg, ${PRODUCT.bg} 0%, #FFFBEB 100%)` }}
        >
          <Image
            src={src}
            alt="Premium lezaljka tamno maslinasto siva"
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            style={{ objectFit: "contain", objectPosition: "center", padding: "24px" }}
            priority
          />

          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.06)" }} />
        </div>

        {/* Color badge */}
        <div
          className="absolute -bottom-4 left-6 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: PRODUCT.hex }}
          />
          <span className="text-xs font-bold text-gray-800 tracking-wide">
            {PRODUCT.label}
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="relative z-10 flex gap-3 mt-2">
        {PRODUCT_IMAGES.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => setActiveIdx(i)}
            className="relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all"
            style={{
              borderColor: activeIdx === i ? PRODUCT.hex : "rgba(0,0,0,0.08)",
              opacity: activeIdx === i ? 1 : 0.7,
            }}
          >
            <Image src={img} alt={`Prikaz ${i + 1}`} fill sizes="64px" style={{ objectFit: "contain", padding: 4 }} />
          </button>
        ))}
      </div>
    </div>
  );
}
