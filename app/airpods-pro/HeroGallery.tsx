"use client";

import React, { useEffect, useRef, useState } from "react";
import { INK, BG, LINE } from "./theme";

export const HERO_IMAGES = [
  { src: "/airpods-pro/hero.png", alt: "AirPods Pro u MagSafe kućištu" },
  { src: "/airpods-pro/earbuds.png", alt: "AirPods Pro slušalice" },
  { src: "/airpods-pro/case.png", alt: "MagSafe kućište za punjenje" },
];

export default function HeroGallery() {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function go(n: number) {
    const el = scroller.current;
    if (!el) return;
    const next = (n + HERO_IMAGES.length) % HERO_IMAGES.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  }

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
      setIndex(Math.min(Math.max(i, 0), HERO_IMAGES.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      el.scrollTo({ left: index * el.clientWidth });
    };
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [index]);

  return (
    <div className="ap-gallery">
      <div className="ap-gallery-frame">
        <div ref={scroller} className="ap-gallery-track">
          {HERO_IMAGES.map((img) => (
            <div key={img.src} className="ap-gallery-slide">
              <img src={img.src} alt={img.alt} draggable={false} />
            </div>
          ))}
        </div>

        <button type="button" className="ap-gallery-nav ap-gallery-prev" onClick={() => go(index - 1)} aria-label="Prethodna slika">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button type="button" className="ap-gallery-nav ap-gallery-next" onClick={() => go(index + 1)} aria-label="Sljedeća slika">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="ap-gallery-dots">
        {HERO_IMAGES.map((img, i) => (
          <button
            key={img.src}
            type="button"
            aria-label={`Slika ${i + 1}`}
            onClick={() => go(i)}
            style={{
              width: i === index ? 18 : 7,
              height: 7,
              borderRadius: 980,
              border: "none",
              padding: 0,
              cursor: "pointer",
              background: i === index ? INK : LINE,
              transition: "width 0.2s, background 0.2s",
            }}
          />
        ))}
      </div>

      <div className="ap-gallery-thumbs">
        {HERO_IMAGES.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => go(i)}
            className="ap-gallery-thumb"
            style={{
              borderColor: i === index ? INK : "transparent",
              opacity: i === index ? 1 : 0.55,
            }}
          >
            <img src={img.src} alt="" />
          </button>
        ))}
      </div>

      <style suppressHydrationWarning>{`
        .ap-gallery { width: 100%; }
        .ap-gallery-frame {
          position: relative;
          background: ${BG};
          border-radius: 28px;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .ap-gallery-track {
          display: flex;
          height: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .ap-gallery-track::-webkit-scrollbar { display: none; }
        .ap-gallery-slide {
          min-width: 100%;
          height: 100%;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }
        .ap-gallery-slide img {
          width: 86%;
          height: 86%;
          object-fit: contain;
          pointer-events: none;
        }
        .ap-gallery-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.92);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .ap-gallery-prev { left: 12px; }
        .ap-gallery-next { right: 12px; }
        .ap-gallery-dots {
          display: flex;
          justify-content: center;
          gap: 7px;
          margin-top: 14px;
        }
        .ap-gallery-thumbs {
          display: none;
          justify-content: center;
          gap: 10px;
          margin-top: 14px;
        }
        .ap-gallery-thumb {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          overflow: hidden;
          background: ${BG};
          border: 1.5px solid transparent;
          padding: 0;
          cursor: pointer;
        }
        .ap-gallery-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
          box-sizing: border-box;
        }
        @media (min-width: 760px) {
          .ap-gallery-thumbs { display: flex; }
        }
        @media (max-width: 520px) {
          .ap-gallery-frame { border-radius: 22px; }
          .ap-gallery-nav { width: 34px; height: 34px; }
          .ap-gallery-prev { left: 8px; }
          .ap-gallery-next { right: 8px; }
        }
      `}</style>
    </div>
  );
}
