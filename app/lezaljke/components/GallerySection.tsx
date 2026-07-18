"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const PHOTOS = [
  { src: "/lezaljke/lezaljka1.png", pos: "center center" },
  { src: "/lezaljke/lezaljka2.png", pos: "center center" },
];

function Lightbox({ idx, onClose, onPrev, onNext }: {
  idx: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose, onPrev, onNext]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.94)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "60px 16px 48px",
    }}>
      {/* Image */}
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", width: "100%", maxWidth: 800,
        aspectRatio: "4/3",
      }}>
        <Image src={PHOTOS[idx].src} alt={`Ležaljka slika ${idx + 1}`}
          fill style={{ objectFit: "contain" }} sizes="90vw" priority />
      </div>

      {/* Prev */}
      <NavBtn dir="left" onClick={e => { e.stopPropagation(); onPrev(); }} />
      {/* Next */}
      <NavBtn dir="right" onClick={e => { e.stopPropagation(); onNext(); }} />

      {/* Close */}
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16,
        width: 38, height: 38, borderRadius: "50%",
        background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "#fff",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Counter */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
        borderRadius: 20, padding: "5px 14px",
        fontFamily: "var(--font-manrope), sans-serif", fontSize: 12, fontWeight: 600, color: "#fff",
      }}>
        {idx + 1} / {PHOTOS.length}
      </div>
    </div>
  );
}

function NavBtn({ dir, onClick }: { dir: "left" | "right"; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onClick} style={{
      position: "absolute",
      [dir === "left" ? "left" : "right"]: 12,
      top: "50%", transform: "translateY(-50%)",
      width: 44, height: 44, borderRadius: "50%",
      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: "#fff",
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === "left"
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

function Thumb({ src, pos, index, visible, onClick }: {
  src: string; pos: string; index: number; visible: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "zoom-in",
        aspectRatio: "4/3",
        background: "#E8EAE8",
        boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.16)" : "0 2px 8px rgba(0,0,0,0.07)",
        transform: visible
          ? hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)"
          : "translateY(16px) scale(0.97)",
        opacity: visible ? 1 : 0,
        transition: `transform 0.4s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms,
                     opacity 0.4s ease ${index * 60}ms,
                     box-shadow 0.3s ease`,
      }}
    >
      <Image
        src={src}
        alt={`Ležaljka slika ${index + 1}`}
        fill
        sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 33vw"
        style={{
          objectFit: "cover",
          objectPosition: pos,
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      {/* Dark overlay on hover */}
      <div style={{
        position: "absolute", inset: 0,
        background: hovered ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0)",
        transition: "background 0.3s",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {hovered && (
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
        )}
      </div>

      {/* Badge */}
      <div style={{
        position: "absolute", bottom: 10, left: 10,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
        borderRadius: 20, padding: "3px 10px",
        fontFamily: "var(--font-manrope), sans-serif",
        fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.05em",
      }}>
        Slika {index + 1}
      </div>
    </div>
  );
}

export default function GallerySection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const open = useCallback((i: number) => setLightboxIdx(i), []);
  const close = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx(i => i === null ? null : (i - 1 + PHOTOS.length) % PHOTOS.length), []);
  const next = useCallback(() => setLightboxIdx(i => i === null ? null : (i + 1) % PHOTOS.length), []);

  return (
    <>
      <section ref={ref} style={{
        background: "linear-gradient(180deg, #F9F9F7 0%, #FFFBEB 100%)",
        padding: "80px 16px",
      }}>
        <style suppressHydrationWarning>{`
          .gl-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
          @media (max-width: 899px) { .gl-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 479px) { .gl-grid { grid-template-columns: 1fr; } }
        `}</style>

        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Header */}
          <div style={{
            textAlign: "center", marginBottom: 48,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}>
            <p style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "#D97706", margin: "0 0 12px",
            }}>
              Uživo kod kupaca
            </p>
            <h2 style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 900, fontSize: "clamp(24px,4vw,38px)",
              color: "#0A0A0A", letterSpacing: "-0.035em", margin: "0 0 12px", lineHeight: 1.1,
            }}>
              Ležaljka u{" "}
              <span style={{
                background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                stvarnom prostoru
              </span>
            </h2>
            <p style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 14, color: "#6B7280", maxWidth: 420, margin: "0 auto", lineHeight: 1.6,
            }}>
              Pogledaj lezaljku izbliza, bez filtera i bez uređivanja.
            </p>
          </div>

          {/* Grid */}
          <div className="gl-grid">
            {PHOTOS.map((p, i) => (
              <Thumb key={p.src} src={p.src} pos={p.pos} index={i} visible={visible} onClick={() => open(i)} />
            ))}
          </div>

          {/* CTA below */}
          <div style={{
            textAlign: "center", marginTop: 36,
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.4s",
          }}>
            <p style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: 13, color: "#9CA3AF",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
              Klikni na sliku za prikaz u punoj veličini
            </p>
          </div>
        </div>
      </section>

      {lightboxIdx !== null && (
        <Lightbox idx={lightboxIdx} onClose={close} onPrev={prev} onNext={next} />
      )}
    </>
  );
}
