"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Truck, Flame } from "lucide-react";
import { event } from "@/lib/fbpixel";

const ACCENT   = "#FF6B00";
const DISCOUNT = "#FF3A00";

export interface Product {
  name:     string;
  desc:     string;
  price:    number;
  oldPrice: number;
  tag:      string;
  href:     string;
  image:    string;
  hot?:     boolean;
}

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",");
}

export default function ProductCard({
  product,
  visible,
  delay,
}: {
  product: Product;
  visible: boolean;
  delay:   number;
}) {
  const [imgError, setImgError] = useState(false);
  const [hovered,  setHovered]  = useState(false);

  const discount = Math.round((1 - product.price / product.oldPrice) * 100);
  const savings  = (product.oldPrice - product.price).toFixed(2).replace(".", ",");

  return (
    <article
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer flex flex-col"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible
          ? hovered ? "translateY(-5px)" : "translateY(0)"
          : "translateY(18px)",
        boxShadow: hovered
          ? "0 20px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        transition: visible
          ? `opacity 380ms ease-out ${delay}ms, transform 280ms ease-out, box-shadow 280ms ease-out`
          : `opacity 380ms ease-out ${delay}ms, transform 380ms ease-out ${delay}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Stretched invisible link — entire card is clickable ── */}
      <Link
        href={product.href}
        className="absolute inset-0 z-0"
        aria-label={`Pogledaj ${product.name}`}
        tabIndex={-1}
      />

      {/* ──────────────── IMAGE ──────────────── */}
      <div className="relative z-[1] bg-white" style={{ aspectRatio: "4/3" }}>
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-5 sm:p-6 transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-10 select-none">
            📦
          </div>
        )}

        {/* Najprodavanije — top left */}
        {product.hot && (
          <span
            className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold select-none"
            style={{
              color:                ACCENT,
              background:           "rgba(255,107,0,0.11)",
              backdropFilter:       "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border:               "1px solid rgba(255,107,0,0.20)",
              boxShadow:            "0 2px 8px rgba(255,107,0,0.14)",
            }}
          >
            <Flame size={10} strokeWidth={2.5} color={ACCENT} />
            Najprodavanije
          </span>
        )}

        {/* Discount — top right */}
        <span
          className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white select-none"
          style={{
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${DISCOUNT} 100%)`,
            boxShadow:  "0 3px 10px rgba(255,58,0,0.32)",
          }}
        >
          -{discount}%
        </span>
      </div>

      {/* ──────────────── BODY ──────────────── */}
      <div className="relative z-[1] flex flex-col flex-1 px-4 pt-3.5 pb-4 sm:px-5 sm:pt-4 sm:pb-5 gap-2.5">

        {/* Category tag */}
        <span
          className="self-start text-[9.5px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-md"
          style={{ color: ACCENT, background: "rgba(255,107,0,0.08)" }}
        >
          {product.tag}
        </span>

        {/* Name */}
        <h3 className="text-[14.5px] sm:text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.4em]">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-2 -mt-0.5 min-h-[2.4em]">
          {product.desc}
        </p>

        {/* Trust row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-[11.5px] font-medium text-gray-500 whitespace-nowrap">
            <CheckCircle2 size={12} color="#22c55e" strokeWidth={2.2} />
            Na stanju
          </span>
          <span className="flex items-center gap-1 text-[11.5px] font-medium text-gray-500 whitespace-nowrap">
            <Truck size={12} color="#3b82f6" strokeWidth={2.2} />
            Dostava 24h
          </span>
        </div>

        {/* ── Price block ── */}
        <div className="flex flex-col gap-1.5 mt-auto pt-1">

          {/* Row 1: current + old — always inline, never wrap */}
          <div className="flex items-end gap-2 flex-nowrap overflow-hidden">
            <span
              className="text-[18px] sm:text-[20px] font-extrabold leading-none whitespace-nowrap shrink-0"
              style={{ color: ACCENT }}
            >
              {fmt(product.price)} KM
            </span>
            <span className="text-[12px] font-medium leading-none text-gray-300 line-through whitespace-nowrap shrink-0 mb-px">
              {fmt(product.oldPrice)} KM
            </span>
          </div>

          {/* Row 2: savings pill */}
          <span
            className="self-start text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap"
            style={{
              color:      DISCOUNT,
              background: "rgba(255,58,0,0.08)",
              border:     "1px solid rgba(255,58,0,0.14)",
            }}
          >
            Uštedi {savings} KM
          </span>
        </div>

        {/* CTA — z-10 so it sits above the stretched bg link */}
        <div className="relative z-10 mt-1">
          <CTALink href={product.href} name={product.name} price={product.price} />
        </div>
      </div>
    </article>
  );
}

// ── CTA button ────────────────────────────────────────────────────────────────
function CTALink({ href, name, price }: { href: string; name: string; price: number }) {
  const [h, setH] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={() => {
        event("AddToCart", {
          content_name: name,
          value:        price,
          currency:     "BAM",
        });
      }}
      className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-white text-[12.5px] font-bold uppercase tracking-wide"
      style={{
        background: h ? `linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)` : "#111111",
        boxShadow:  h ? "0 6px 20px rgba(255,107,0,0.30)" : "none",
        transition: "background 200ms ease, box-shadow 200ms ease",
      }}
    >
      Naruči odmah
      <ArrowRight
        size={13}
        strokeWidth={2.5}
        style={{ transform: h ? "translateX(3px)" : "translateX(0)", transition: "transform 180ms ease" }}
      />
    </Link>
  );
}
