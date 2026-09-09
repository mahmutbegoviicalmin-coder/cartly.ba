"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GALLERY } from "../product";

export default function ProductGallery() {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const current = GALLERY[index];

  function go(n: number) {
    setIndex((n + GALLERY.length) % GALLERY.length);
  }

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < 40) return;
    go(index + (dx < 0 ? 1 : -1));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  return (
    <div className="mp-gal">
      <div className="mp-gal-main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <Image
          src={current.src}
          alt={current.alt}
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 760px) 100vw, 640px"
        />
        <button type="button" className="mp-gal-nav mp-gal-prev" onClick={() => go(index - 1)} aria-label="Prethodna slika">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button type="button" className="mp-gal-nav mp-gal-next" onClick={() => go(index + 1)} aria-label="Sljedeća slika">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
      <div className="mp-gal-thumbs">
        {GALLERY.map((img, i) => (
          <button
            key={img.src}
            type="button"
            className={i === index ? "is-on" : undefined}
            onClick={() => setIndex(i)}
            aria-label={img.alt}
            aria-current={i === index ? "true" : undefined}
          >
            <Image src={img.src} alt="" width={480} height={320} sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}
