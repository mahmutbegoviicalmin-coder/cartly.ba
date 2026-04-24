"use client";

import { useState } from "react";
import Image from "next/image";

const IMAGES = [
  { src: "/images/zvucnik/zvucnik1.webp", alt: "Bluetooth Zvučnik ZQS-6239 — pogled 1" },
  { src: "/images/zvucnik/zvucnik2.webp", alt: "Bluetooth Zvučnik ZQS-6239 — pogled 2" },
  { src: "/images/zvucnik/zvucnik3.webp", alt: "Bluetooth Zvučnik ZQS-6239 — pogled 3" },
  { src: "/images/zvucnik/zvucnik4.webp", alt: "Bluetooth Zvučnik ZQS-6239 — pogled 4" },
];

const ACCENT = "#FF6B00";

export default function ImageGallery() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      {/* PRVOMAJSKA AKCIJA badge + main image */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 aspect-square">
        {/* Badge */}
        <div
          className="absolute top-4 left-4 z-10 text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg"
          style={{ background: ACCENT }}
        >
          Prvomajska akcija
        </div>

        <Image
          src={IMAGES[selected].src}
          alt={IMAGES[selected].alt}
          fill
          className="object-contain transition-opacity duration-200"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-3">
        {IMAGES.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setSelected(i)}
            className="relative flex-1 rounded-xl overflow-hidden focus:outline-none transition-all duration-150"
            style={{
              aspectRatio: "1/1",
              background: "#f9f9f9",
              border: selected === i
                ? `2px solid ${ACCENT}`
                : "2px solid #e5e5e5",
              opacity: selected === i ? 1 : 0.6,
            }}
            aria-label={`Prikaži sliku ${i + 1}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-contain"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
