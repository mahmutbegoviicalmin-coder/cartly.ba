"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAN = "var(--font-manrope), sans-serif";
const ACC = "#B33000";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { damping: 28, stiffness: 90, mass: 0.9 };

// ─── Trust items ──────────────────────────────────────────────────────────────
const TRUST = [
  "Plaćanje pouzećem",
  "Dostava 24–48h",
  "Povrat 14 dana",
  "Provjeren kvalitet",
];

// ─── Products ─────────────────────────────────────────────────────────────────
const PRODUCTS = {
  shoe:   { src: "/images/product-1.webp", alt: "Radne Patike S3",     label: "Radne Patike S3",     sub: "Zaštitna obuća · S3",   price: "59,90 KM" },
  drill:  { src: "/images/milwaukee.png",  alt: "Milwaukee M18",        label: "Milwaukee M18",       sub: "Profesionalni alat",     price: "69,90 KM" },
  camera: { src: "/images/kamere.png",     alt: "Sigurnosna Kamera",    label: "Sigurnosna Kamera",   sub: "Video nadzor 12MP",      price: "89,90 KM" },
};

// ─── Reusable product glass card ──────────────────────────────────────────────
function GlassCard({
  product,
  imgH,
  radius = 24,
  shadow = "0 32px 80px rgba(0,0,0,0.13), 0 8px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)",
  sizes = "300px",
  glow = false,
}: {
  product: (typeof PRODUCTS)[keyof typeof PRODUCTS];
  imgH: number;
  radius?: number;
  shadow?: string;
  sizes?: string;
  glow?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        background: "rgba(255,255,255,0.75)",
        borderRadius: radius,
        border: "1px solid rgba(255,255,255,0.92)",
        boxShadow: shadow,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Ambient glow behind image */}
      {glow && (
        <div aria-hidden style={{
          position: "absolute", bottom: "20%", left: "50%",
          transform: "translateX(-50%)",
          width: "65%", height: "35%",
          background: "radial-gradient(ellipse, rgba(255,107,0,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      )}

      {/* Image area */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "28px 20px 12px",
        position: "relative",
      }}>
        <div style={{ position: "relative", width: "100%", height: imgH }}>
          <Image
            src={product.src}
            alt={product.alt}
            fill
            sizes={sizes}
            style={{ objectFit: "contain", mixBlendMode: "multiply" }}
            priority={glow}
          />
        </div>
      </div>

      {/* Info strip */}
      <div style={{
        padding: "12px 20px 18px",
        borderTop: "1px solid rgba(0,0,0,0.055)",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}>
        <p style={{
          margin: "0 0 2px",
          fontSize: 9, fontWeight: 700, color: "#BBBBBB",
          letterSpacing: "0.12em", textTransform: "uppercase",
          fontFamily: MAN,
        }}>
          {product.sub}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0A0A0A", fontFamily: MAN }}>
            {product.label}
          </p>
          <span style={{ fontSize: 16, fontWeight: 900, color: ACC, letterSpacing: "-0.03em", fontFamily: MAN, flexShrink: 0 }}>
            {product.price}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);

  /* Mouse parallax */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const sx   = useSpring(rawX, SPRING);
  const sy   = useSpring(rawY, SPRING);

  // Layers at different depths
  const shoeX  = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const shoeY  = useTransform(sy, [-0.5, 0.5], [-6,  6]);
  const deepX  = useTransform(sx, [-0.5, 0.5], [-20, 20]);
  const deepY  = useTransform(sy, [-0.5, 0.5], [-14, 14]);
  const midX   = useTransform(sx, [-0.5, 0.5], [-15, 15]);
  const midY   = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  const onMove = useCallback(
    (e: MouseEvent) => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set((e.clientX - r.left) / r.width  - 0.5);
      rawY.set((e.clientY - r.top)  / r.height - 0.5);
    },
    [rawX, rawY],
  );

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [onMove]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#FAF8F5",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Background layers ── */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 55% 60% at 75% 48%, rgba(255,107,0,0.08) 0%, transparent 65%),
          radial-gradient(ellipse 35% 50% at 18% 28%, rgba(255,180,80,0.05) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 60% 80%, rgba(255,60,0,0.04) 0%, transparent 55%)
        `,
      }} />

      {/* Grain texture */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.55,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
      }} />

      {/* ── Main content ── */}
      <div
        className="hh-wrap"
        style={{
          maxWidth: 1320, margin: "0 auto",
          padding: "88px 60px 100px",
          display: "flex", gap: 80, alignItems: "center",
          position: "relative", zIndex: 2,
        }}
      >

        {/* ════════ LEFT ════════ */}
        <div className="hh-left" style={{ flex: "0 0 44%", maxWidth: "44%", display: "flex", flexDirection: "column" }}>

          {/* Social proof badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              width: "fit-content", marginBottom: 36,
              background: "rgba(255,255,255,0.86)",
              border: "1px solid rgba(0,0,0,0.075)",
              borderRadius: 999,
              padding: "6px 16px 6px 8px",
              boxShadow: "0 2px 14px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div style={{
              background: `linear-gradient(135deg, #FF7A20, ${ACC})`,
              borderRadius: 999, padding: "4px 11px",
              fontSize: 11, fontWeight: 800, color: "#fff",
              letterSpacing: "0.02em", fontFamily: MAN,
            }}>
              2,000+
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#111", lineHeight: 1, fontFamily: MAN }}>
                zadovoljnih kupaca
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="9" height="9" viewBox="0 0 24 24" fill="#F59E0B">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                <span style={{ fontSize: 10, fontWeight: 600, color: "#999", marginLeft: 3, fontFamily: MAN }}>4.9</span>
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <h1 style={{ margin: "0 0 22px" }}>
            <motion.span
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              style={{
                display: "block",
                fontSize: "clamp(42px, 4.8vw, 76px)",
                fontWeight: 900, color: "#0A0A0A",
                letterSpacing: "-0.045em",
                fontFamily: MAN, lineHeight: 1.04,
              }}
            >
              Kupuj pametno.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
              style={{
                display: "block",
                fontSize: "clamp(42px, 4.8vw, 76px)",
                fontWeight: 900,
                letterSpacing: "-0.045em",
                fontFamily: MAN, lineHeight: 1.04,
                background: `linear-gradient(110deg, ${ACC} 10%, #FF8040 55%, ${ACC} 90%)`,
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              className="hh-shine"
            >
              Plati kad stigne.
            </motion.span>
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
            style={{
              fontSize: 16, color: "#888", lineHeight: 1.75,
              fontFamily: MAN, maxWidth: 400, margin: "0 0 44px",
              fontWeight: 400,
            }}
          >
            Premium radna obuća, alati i oprema za dom —<br />
            naruči online, plati tek kad paket stigne.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease: EASE }}
            style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 52 }}
          >
            <Link href="/proizvodi" className="hh-btn-primary">
              Pogledaj ponudu
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a href="#kategorije" className="hh-btn-ghost">
              Kako funkcioniše
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.44 }}
            style={{
              display: "flex", flexWrap: "wrap", gap: "10px 28px",
              borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 28,
            }}
          >
            {TRUST.map((t) => (
              <span key={t} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontSize: 13, fontWeight: 600, color: "#777",
                fontFamily: MAN,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ════════ RIGHT · floating composition ════════ */}
        <div
          className="hh-right"
          style={{ flex: 1, position: "relative", height: 580 }}
        >
          {/* Ambient glow orb */}
          <div aria-hidden style={{
            position: "absolute", top: "20%", right: "15%",
            width: 360, height: 360,
            background: "radial-gradient(circle, rgba(255,107,0,0.11) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
            filter: "blur(48px)", zIndex: 0,
          }} />

          {/* ── SHOE · main hero product ── */}
          <motion.div
            style={{
              position: "absolute",
              left: "4%", top: "6%", width: "62%", height: "80%",
              zIndex: 3, x: shoeX, y: shoeY,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.15, ease: EASE }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: "100%", height: "100%" }}
              >
                <Link
                  href="/radne-patike"
                  style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}
                  className="hh-card-link"
                >
                  <GlassCard
                    product={PRODUCTS.shoe}
                    imgH={210}
                    sizes="380px"
                    radius={28}
                    glow
                    shadow="0 48px 110px rgba(0,0,0,0.14), 0 14px 36px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.98), 0 0 0 1px rgba(0,0,0,0.03)"
                  />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── DRILL · top-right ── */}
          <motion.div
            style={{
              position: "absolute",
              right: "0%", top: "2%", width: "43%", height: "45%",
              zIndex: 4, x: deepX, y: deepY,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, x: 24, y: -16 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                style={{ width: "100%", height: "100%" }}
              >
                <Link
                  href="/milwaukee-busilica"
                  style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}
                  className="hh-card-link"
                >
                  <GlassCard
                    product={PRODUCTS.drill}
                    imgH={102}
                    sizes="220px"
                    radius={22}
                  />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── CAMERA · bottom-right ── */}
          <motion.div
            style={{
              position: "absolute",
              right: "3%", bottom: "3%", width: "41%", height: "44%",
              zIndex: 4, x: midX, y: midY,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, x: 20, y: 24 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
            >
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
                style={{ width: "100%", height: "100%" }}
              >
                <Link
                  href="/kamera"
                  style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}
                  className="hh-card-link"
                >
                  <GlassCard
                    product={PRODUCTS.camera}
                    imgH={96}
                    sizes="210px"
                    radius={22}
                  />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Global styles ── */}
      <style suppressHydrationWarning>{`
        @keyframes hh-shine {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .hh-shine {
          animation: hh-shine 4s ease-in-out 1.2s infinite;
        }

        .hh-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #FF7A20 0%, #FF4800 100%);
          color: #fff; text-decoration: none;
          font-family: ${MAN}; font-weight: 800; font-size: 15px;
          border-radius: 14px; padding: 16px 28px;
          box-shadow: 0 8px 28px rgba(255,72,0,0.28);
          letter-spacing: 0.01em;
          transition: transform 240ms cubic-bezier(0.22,1,0.36,1),
                      box-shadow 240ms ease, filter 180ms ease;
        }
        .hh-btn-primary:hover {
          transform: translateY(-3px) scale(1.035);
          box-shadow: 0 18px 48px rgba(255,72,0,0.38);
          filter: brightness(1.06);
        }
        .hh-btn-primary:active { transform: scale(0.96); }

        .hh-btn-ghost {
          display: inline-flex; align-items: center;
          color: #555; text-decoration: none;
          font-family: ${MAN}; font-weight: 700; font-size: 15px;
          border-radius: 14px; padding: 15px 22px;
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(8px);
          transition: border-color 180ms ease, background 180ms ease, transform 200ms ease;
        }
        .hh-btn-ghost:hover {
          border-color: rgba(0,0,0,0.2);
          background: rgba(255,255,255,0.95);
          transform: translateY(-2px);
        }

        .hh-card-link {
          transition: transform 300ms cubic-bezier(0.22,1,0.36,1), filter 300ms ease;
        }
        .hh-card-link:hover {
          transform: scale(1.025) translateY(-4px) !important;
          filter: drop-shadow(0 24px 48px rgba(0,0,0,0.12));
        }

        @media (max-width: 1024px) {
          .hh-wrap  { flex-direction: column !important; gap: 52px !important; padding: 56px 28px 72px !important; }
          .hh-left  { max-width: 100% !important; flex: none !important; }
          .hh-right { flex: none !important; width: 100% !important; height: 440px !important; }
        }
        @media (max-width: 640px) {
          .hh-right { height: 360px !important; }
          .hh-btn-primary, .hh-btn-ghost { font-size: 14px !important; padding: 14px 20px !important; }
        }
      `}</style>
    </section>
  );
}
