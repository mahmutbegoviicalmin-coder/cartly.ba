export const INK    = "#1D1D1F";
export const INK2   = "#424245";
export const MUTED  = "#6E6E73";
export const SOFT   = "#86868B";
export const BG     = "#F5F5F7";
export const PAGE   = "#FBFBFD";
export const WHITE  = "#FFFFFF";
export const LINE   = "rgba(0,0,0,0.08)";
export const TEAL   = "#00838F";
export const TEAL_T = "rgba(0,131,143,0.08)";
export const SALE   = "#D70015";
export const STAR   = "#FF9F0A";
export const F      = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", var(--font-makita), Inter, "Helvetica Neue", sans-serif`;

// ── Product + pricing (single source of truth for the client) ──────────────
export const PRODUCT     = "Makita Brusilica 1500W";
export const CONTENT_ID  = "makita-brusilica-1500w";
export const UNIT_PRICE  = 57.9;
export const OLD_PRICE   = 124.9;
export const GIFT_PRICE  = 5;
export const DELIVERY    = 0;

export function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

export const IMG = {
  hero:     "/makita-1500w/hero.jpg",
  side:     "/makita-1500w/side.jpg",
  exploded: "/makita-1500w/exploded.jpg",
};
