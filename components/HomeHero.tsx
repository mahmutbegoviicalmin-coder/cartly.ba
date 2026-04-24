"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Truck, Banknote, ShieldCheck, PackageCheck,
  Shield, Zap, Feather, Volume2, Bluetooth, Gift,
} from "lucide-react";

const AUTOPLAY_MS = 5500;

// ─── Slide data ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    badge:          "Akcija do kraja aprila",
    badgeBg:        "rgba(255,107,0,0.10)",
    badgeColor:     "#FF6B00",
    headline:       "Uštedi na top\nproizvodima do kraja\naprila.",
    headlineMobile: "Uštedi na top\nproizvodima.",
    sub:            "Od radne obuće do praktičnih uređaja za dom i svakodnevnicu. Poruči brzo i jednostavno uz plaćanje pouzećem.",
    subMobile:      "Brza dostava, plaćanje pouzećem i provjeren kvalitet na svakom koraku.",
    features: [
      { Icon: Truck,        label: "Dostava 24–48h"      },
      { Icon: Banknote,     label: "Plaćanje pouzećem"   },
      { Icon: ShieldCheck,  label: "Provjeren kvalitet"  },
      { Icon: PackageCheck, label: "Laka narudžba"       },
    ],
    cta:        "Pogledaj ponudu",
    ctaHref:    "/proizvodi",
    visual:     "collage",
    bg:         "#FAFAF7",
    accentColor: "#FF6B00",
  },
  {
    badge:          "Radna obuća S3",
    badgeBg:        "rgba(255,107,0,0.10)",
    badgeColor:     "#FF6B00",
    headline:       "Sigurnost i udobnost\nza cijeli radni dan.",
    headlineMobile: "Sigurnost i udobnost\nza cijeli radni dan.",
    sub:            "Čelična kapica, anti-slip đon i stabilnost na koju možeš računati u svakom koraku.",
    subMobile:      "Čelična kapica, anti-slip đon i stabilnost na svakom terenu.",
    features: [
      { Icon: Shield,  label: "Čelična kapica"       },
      { Icon: Zap,     label: "Anti-slip đon"         },
      { Icon: Feather, label: "Lagan i udoban model" },
    ],
    cta:        "Naruči odmah",
    ctaHref:    "/radne-patike",
    visual:     "/images/patike-hero.png",
    bg:         "#FAF8F4",
    accentColor: "#FF6B00",
  },
  {
    badge:          "Bluetooth zvučnik",
    badgeBg:        "rgba(124,58,237,0.10)",
    badgeColor:     "#7C3AED",
    headline:       "Jak zvuk i zabava\ngdje god da si.",
    headlineMobile: "Jak zvuk i zabava\ngdje god da si.",
    sub:            "Praktičan bluetooth zvučnik za kuću, druženja i pokret, sa modernim dizajnom i snažnim zvukom.",
    subMobile:      "Bluetooth zvučnik za kuću, poklon i svaku prigodu.",
    features: [
      { Icon: Volume2,   label: "Snažan zvuk"    },
      { Icon: Bluetooth, label: "Bluetooth 5.0"  },
      { Icon: Gift,      label: "Idealan poklon" },
    ],
    cta:        "Pogledaj proizvod",
    ctaHref:    "/zvucnik",
    visual:     "/images/zvucnik/zvucnik1.webp",
    bg:         "#F8F6FC",
    accentColor: "#7C3AED",
  },
];

const TRUST = [
  { Icon: Truck,        label: "Ekspresna dostava 24–48h", color: "#3B82F6", bg: "rgba(59,130,246,0.08)"  },
  { Icon: Banknote,     label: "Plaćanje pouzećem",        color: "#16A34A", bg: "rgba(22,163,74,0.08)"   },
  { Icon: ShieldCheck,  label: "Provjeren kvalitet",       color: "#FF6B00", bg: "rgba(255,107,0,0.08)"   },
  { Icon: PackageCheck, label: "Jednostavna narudžba",     color: "#7C3AED", bg: "rgba(124,58,237,0.08)"  },
];

// ─── Root component ────────────────────────────────────────────────────────────
export default function HomeHero() {
  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);
  const [paused,  setPaused]  = useState(false);
  const timer       = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((idx: number) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setCurrent((idx + SLIDES.length) % SLIDES.length);
      setFading(false);
    }, 280);
  }, [fading]);

  const prev = useCallback(() => go(current - 1), [current, go]);
  const next = useCallback(() => go(current + 1), [current, go]);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(next, AUTOPLAY_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused, next]);

  const slide = SLIDES[current];

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 44) { if (diff > 0) next(); else prev(); }
    touchStartX.current = null;
  };

  return (
    <section className="w-full px-3 pt-5 pb-0 lg:px-5 lg:pt-7" style={{ background: "#F5F2EE" }}>

      {/* ════════════════════════════════════════════════════
          MOBILE HERO  (visible below lg)
      ════════════════════════════════════════════════════ */}
      <div
        className="block lg:hidden rounded-[20px] overflow-hidden"
        style={{
          background:  slide.bg,
          border:      "1px solid rgba(0,0,0,0.055)",
          boxShadow:   "0 2px 24px rgba(0,0,0,0.07)",
          transition:  "background 500ms ease",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            opacity:    fading ? 0 : 1,
            transform:  fading ? "translateY(6px)" : "translateY(0)",
            transition: "opacity 280ms ease, transform 280ms ease",
          }}
        >
          {/* ── Text block ── */}
          <div className="px-5 pt-6 pb-4">

            {/* Badge */}
            <span
              className="inline-flex items-center gap-1.5 mb-3"
              style={{
                fontSize:      10,
                fontWeight:    700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color:         slide.accentColor,
                background:    slide.badgeBg,
                borderRadius:  999,
                padding:       "4px 11px",
              }}
            >
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: slide.accentColor, flexShrink: 0,
              }} />
              {slide.badge}
            </span>

            {/* Headline */}
            <h2
              className="mb-2.5"
              style={{
                fontSize:      "clamp(24px, 7.2vw, 32px)",
                fontWeight:    800,
                color:         "#0F0F0F",
                lineHeight:    1.1,
                letterSpacing: "-0.028em",
                whiteSpace:    "pre-line",
              }}
            >
              {slide.headlineMobile}
            </h2>

            {/* Subtitle */}
            <p
              className="mb-4"
              style={{
                fontSize:   13.5,
                color:      "#6B6B6B",
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              {slide.subMobile}
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {slide.features.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1"
                  style={{
                    fontSize:     11,
                    fontWeight:   600,
                    color:        "#2A2A2A",
                    background:   "rgba(0,0,0,0.045)",
                    borderRadius: 7,
                    padding:      "5px 9px",
                    border:       "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Icon size={11} strokeWidth={2.2} color={slide.accentColor} />
                  {label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <MobileCTA href={slide.ctaHref} label={slide.cta} color={slide.accentColor} />
          </div>

          {/* ── Product image ── */}
          <div className="px-6 pb-2" style={{ position: "relative" }}>
            {slide.visual === "collage"
              ? <MobileCollage />
              : <MobileProductImage src={slide.visual} alt={slide.badge} accentColor={slide.accentColor} />
            }
          </div>

          {/* ── Dot indicators ── */}
          <div className="flex items-center justify-center gap-1.5 pb-5 pt-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width:        i === current ? 20 : 6,
                  height:       6,
                  borderRadius: 999,
                  background:   i === current ? slide.accentColor : "rgba(0,0,0,0.15)",
                  border:       "none",
                  cursor:       "pointer",
                  padding:      0,
                  transition:   "all 360ms ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          DESKTOP HERO  (visible lg and above)
      ════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:block relative"
        style={{
          maxWidth:     1320,
          margin:       "0 auto",
          borderRadius: 28,
          overflow:     "hidden",
          background:   slide.bg,
          border:       "1px solid rgba(0,0,0,0.055)",
          boxShadow:    "0 2px 48px rgba(0,0,0,0.07)",
          transition:   "background 500ms ease",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex flex-row"
          style={{
            minHeight:  560,
            opacity:    fading ? 0 : 1,
            transform:  fading ? "translateY(10px)" : "translateY(0)",
            transition: "opacity 300ms ease, transform 300ms ease",
          }}
        >
          {/* Left: text */}
          <div
            className="flex flex-col justify-center"
            style={{ flex: "0 0 52%", padding: "60px 56px 52px" }}
          >
            <div style={{ marginBottom: 24 }}>
              <span style={{
                display:       "inline-flex",
                alignItems:    "center",
                gap:           7,
                fontSize:      11,
                fontWeight:    700,
                letterSpacing: "0.11em",
                textTransform: "uppercase",
                color:         slide.accentColor,
                background:    slide.badgeBg,
                borderRadius:  999,
                padding:       "6px 14px",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: slide.accentColor, flexShrink: 0,
                }} />
                {slide.badge}
              </span>
            </div>

            <h2 style={{
              fontSize:      "clamp(36px, 4.2vw, 58px)",
              fontWeight:    800,
              color:         "#0F0F0F",
              lineHeight:    1.08,
              letterSpacing: "-0.03em",
              marginBottom:  22,
              whiteSpace:    "pre-line",
            }}>
              {slide.headline}
            </h2>

            <p style={{
              fontSize:     15.5,
              color:        "#6B6B6B",
              lineHeight:   1.7,
              marginBottom: 28,
              maxWidth:     420,
              fontWeight:   400,
            }}>
              {slide.sub}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
              {slide.features.map(({ Icon, label }) => (
                <span
                  key={label}
                  style={{
                    display:      "inline-flex",
                    alignItems:   "center",
                    gap:          6,
                    fontSize:     12,
                    fontWeight:   600,
                    color:        "#2A2A2A",
                    background:   "rgba(0,0,0,0.045)",
                    borderRadius: 8,
                    padding:      "7px 12px",
                    border:       "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Icon size={13} strokeWidth={2.2} color={slide.accentColor} />
                  {label}
                </span>
              ))}
            </div>

            <SliderCTA href={slide.ctaHref} label={slide.cta} color={slide.accentColor} />

            <div style={{ display: "flex", gap: 7, marginTop: 44 }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Slide ${i + 1}`}
                  style={{
                    width:        i === current ? 26 : 7,
                    height:       7,
                    borderRadius: 999,
                    background:   i === current ? slide.accentColor : "rgba(0,0,0,0.14)",
                    border:       "none",
                    cursor:       "pointer",
                    padding:      0,
                    transition:   "all 380ms ease",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: visual */}
          <div style={{
            flex:           "1 1 48%",
            position:       "relative",
            minHeight:      340,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "48px 52px 48px 16px",
          }}>
            {slide.visual === "collage"
              ? <ProductCollage />
              : <ProductImage src={slide.visual} alt={slide.badge} accentColor={slide.accentColor} />
            }
          </div>
        </div>

        <NavArrow direction="prev" onClick={prev} />
        <NavArrow direction="next" onClick={next} />
      </div>

      {/* ─── Trust row ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "12px 0 28px" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 8 }}>
          {TRUST.map(({ Icon, label, color, bg }) => (
            <TrustCard key={label} Icon={Icon} label={label} color={color} bg={bg} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Mobile CTA (full-width) ───────────────────────────────────────────────────
function MobileCTA({ href, label, color }: { href: string; label: string; color: string }) {
  const isOrange = color === "#FF6B00";
  const grad = isOrange
    ? "linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)"
    : `linear-gradient(135deg, #8B5CF6 0%, ${color} 100%)`;
  const shadow = isOrange
    ? "0 4px 18px rgba(255,80,0,0.32)"
    : "0 4px 18px rgba(124,58,237,0.28)";

  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 w-full rounded-xl font-bold text-white"
      style={{
        background:     grad,
        boxShadow:      shadow,
        padding:        "13px 20px",
        fontSize:       14,
        letterSpacing:  "0.01em",
        textDecoration: "none",
        fontFamily:     "inherit",
      }}
    >
      {label}
      <ArrowRight size={15} strokeWidth={2.5} />
    </Link>
  );
}

// ─── Mobile product image ──────────────────────────────────────────────────────
function MobileProductImage({ src, alt, accentColor }: { src: string; alt: string; accentColor: string }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", maxHeight: 200 }}>
      {/* Glow */}
      <div style={{
        position:     "absolute",
        inset:        "15%",
        borderRadius: "50%",
        background:   accentColor,
        opacity:      0.07,
        filter:       "blur(40px)",
        zIndex:       0,
      }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit: "contain", objectPosition: "center" }}
          sizes="(max-width: 1024px) 80vw, 420px"
          priority
        />
      </div>
    </div>
  );
}

// ─── Mobile collage (slide 1) ──────────────────────────────────────────────────
function MobileCollage() {
  const cards = [
    { src: "/images/product-1.webp",       label: "Radne patike", r: "-3deg"  },
    { src: "/images/kamere.png",            label: "Kamera",       r: "2.5deg" },
    { src: "/images/milw2.webp",            label: "Milwaukee",    r: "3deg"   },
    { src: "/images/zvucnik/zvucnik1.webp", label: "Zvučnik",      r: "-2deg"  },
  ];

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "1fr 1fr",
      gap:                 10,
      width:               "100%",
    }}>
      {cards.map(({ src, label, r }) => (
        <div
          key={label}
          style={{
            background:     "#FFFFFF",
            borderRadius:   14,
            border:         "1px solid rgba(0,0,0,0.07)",
            boxShadow:      "0 3px 14px rgba(0,0,0,0.07)",
            padding:        12,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            aspectRatio:    "1/1",
            transform:      `rotate(${r})`,
          }}
        >
          <div style={{ position: "relative", width: "78%", aspectRatio: "1/1" }}>
            <Image
              src={src}
              alt={label}
              fill
              style={{ objectFit: "contain" }}
              sizes="120px"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Desktop product image ─────────────────────────────────────────────────────
function ProductImage({ src, alt, accentColor }: { src: string; alt: string; accentColor: string }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
      <div style={{
        position:     "absolute",
        inset:        "12%",
        borderRadius: "50%",
        background:   accentColor,
        opacity:      0.07,
        filter:       "blur(60px)",
        zIndex:       0,
      }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", aspectRatio: "1/1" }}>
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit: "contain", objectPosition: "center" }}
          sizes="(max-width: 1024px) 80vw, 420px"
          priority
        />
      </div>
    </div>
  );
}

// ─── Desktop collage ───────────────────────────────────────────────────────────
function ProductCollage() {
  const cards = [
    { src: "/images/product-1.webp",        label: "Radne patike", r: "-4deg",  tx: "-8px",  ty: "8px"  },
    { src: "/images/kamere.png",             label: "Kamera",       r: "3.5deg", tx: "8px",   ty: "4px"  },
    { src: "/images/milw2.webp",             label: "Milwaukee",    r: "4deg",   tx: "-4px",  ty: "-8px" },
    { src: "/images/zvucnik/zvucnik1.webp",  label: "Zvučnik",      r: "-3deg",  tx: "6px",   ty: "-4px" },
  ];

  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "1fr 1fr",
      gap:                 14,
      width:               "100%",
      maxWidth:            380,
    }}>
      {cards.map(({ src, label, r, tx, ty }) => (
        <div
          key={label}
          style={{
            background:     "#FFFFFF",
            borderRadius:   18,
            border:         "1px solid rgba(0,0,0,0.07)",
            boxShadow:      "0 4px 20px rgba(0,0,0,0.08)",
            padding:        16,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            aspectRatio:    "1/1",
            transform:      `rotate(${r}) translate(${tx}, ${ty})`,
            transition:     "transform 300ms ease",
          }}
        >
          <div style={{ position: "relative", width: "80%", aspectRatio: "1/1" }}>
            <Image
              src={src}
              alt={label}
              fill
              style={{ objectFit: "contain" }}
              sizes="160px"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Desktop CTA ───────────────────────────────────────────────────────────────
function SliderCTA({ href, label, color }: { href: string; label: string; color: string }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isOrange = color === "#FF6B00";
  const grad = isOrange
    ? "linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)"
    : `linear-gradient(135deg, #8B5CF6 0%, ${color} 100%)`;
  const shadow = isOrange
    ? hovered ? "0 8px 32px rgba(255,80,0,0.42), 0 2px 8px rgba(255,80,0,0.22)" : "0 4px 18px rgba(255,80,0,0.30)"
    : hovered ? "0 8px 32px rgba(124,58,237,0.40), 0 2px 8px rgba(124,58,237,0.20)" : "0 4px 18px rgba(124,58,237,0.28)";

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            10,
        background:     grad,
        color:          "white",
        fontWeight:     700,
        fontSize:       15,
        letterSpacing:  "0.01em",
        borderRadius:   14,
        padding:        "15px 30px",
        textDecoration: "none",
        alignSelf:      "flex-start",
        userSelect:     "none",
        transform:      pressed ? "scale(0.96)" : hovered ? "scale(1.04)" : "scale(1)",
        boxShadow:      shadow,
        filter:         hovered ? "brightness(1.06)" : "brightness(1)",
        transition:     "transform 240ms ease-out, box-shadow 240ms ease-out, filter 200ms ease",
        fontFamily:     "inherit",
      }}
    >
      {label}
      <ArrowRight
        size={17}
        strokeWidth={2.5}
        style={{
          transform:  hovered ? "translateX(3px)" : "translateX(0)",
          transition: "transform 240ms ease-out",
        }}
      />
    </Link>
  );
}

// ─── Desktop nav arrow ─────────────────────────────────────────────────────────
function NavArrow({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isNext = direction === "next";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isNext ? "Sljedeći" : "Prethodni"}
      style={{
        position:       "absolute",
        top:            "50%",
        transform:      `translateY(-50%) scale(${hovered ? 1.1 : 1})`,
        [isNext ? "right" : "left"]: 18,
        width:          44,
        height:         44,
        borderRadius:   "50%",
        background:     hovered ? "#FFFFFF" : "rgba(255,255,255,0.80)",
        border:         "1px solid rgba(0,0,0,0.09)",
        boxShadow:      hovered ? "0 4px 24px rgba(0,0,0,0.13)" : "0 2px 10px rgba(0,0,0,0.07)",
        cursor:         "pointer",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        color:          "#2A2A2A",
        transition:     "all 200ms ease",
        zIndex:         10,
        backdropFilter: "blur(8px)",
      }}
    >
      {isNext
        ? <ChevronRight size={20} strokeWidth={2} />
        : <ChevronLeft  size={20} strokeWidth={2} />
      }
    </button>
  );
}

// ─── Trust card ────────────────────────────────────────────────────────────────
function TrustCard({ Icon, label, color, bg }: {
  Icon:  React.ElementType;
  label: string;
  color: string;
  bg:    string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          12,
        background:   "#FFFFFF",
        border:       "1px solid rgba(0,0,0,0.07)",
        borderRadius: 16,
        padding:      "13px 16px",
        cursor:       "default",
        transform:    hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow:    hovered ? "0 8px 28px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
        transition:   "transform 220ms ease, box-shadow 220ms ease",
      }}
    >
      <div style={{
        width:          38,
        height:         38,
        borderRadius:   11,
        background:     bg,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
      }}>
        <Icon size={17} color={color} strokeWidth={2} />
      </div>
      <span style={{
        fontSize:   12.5,
        fontWeight: 600,
        color:      "#2A2A2A",
        lineHeight: 1.35,
      }}>
        {label}
      </span>
    </div>
  );
}
