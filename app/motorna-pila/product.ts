/**
 * Image inventory — /public/motorka
 *
 * motorka1.png  1536×1024  Side 3/4, bar left. Main hero / mač section.
 * motorka2.png  1536×1024  Opposite side angle, bar right. Gallery + feature.
 * motorka3.png  1536×1024  Aggressive front-on, looking down the bar. Power section.
 * motorka4.png  1536×1024  Exploded-view composite with labelled components.
 *
 * No lifestyle / people photos in the folder.
 */

export const PRODUCT_ID = "motorna-pila";
export const PRODUCT_NAME = "Motorna pila";
export const PRODUCT_PRICE = 104.9;
export const ORIGINAL_PRICE = 299;
export const DELIVERY_PRICE = 10;
export const SAVINGS = ORIGINAL_PRICE - PRODUCT_PRICE;
export const ORDER_TOTAL = PRODUCT_PRICE + DELIVERY_PRICE;
export const DISCOUNT_PCT = Math.round((1 - PRODUCT_PRICE / ORIGINAL_PRICE) * 100);
export const CURRENCY = "BAM";

export const IMAGES = {
  hero: "/motorka/motorka1.png",
  side: "/motorka/motorka2.png",
  front: "/motorka/motorka3.png",
  exploded: "/motorka/motorka4.png",
} as const;

export const GALLERY = [
  { src: IMAGES.hero, alt: "Motorna pila 4,9 KS, bočni pregled sa mačem 40 cm" },
  { src: IMAGES.side, alt: "Motorna pila 4,9 KS, drugi ugao" },
  { src: IMAGES.front, alt: "Motorna pila 4,9 KS, pogled niz mač" },
] as const;

/** Only real one-unit pricing exists. UI is ready for more rows later. */
export const QTY_OFFERS = [
  { qty: 1, unitPrice: PRODUCT_PRICE, label: "1 komad" },
] as const;

export const SPECS = [
  { value: "4,9 KS", label: "Snaga", Icon: "Zap" },
  { value: "40 cm", label: "Dužina mača", Icon: "Ruler" },
  { value: "32", label: "Broj zuba", Icon: "Settings" },
  { value: ".325", label: "Korak lanca", Icon: "Settings" },
  { value: "6,3 kg", label: "Težina", Icon: "Weight" },
  { value: "25:1", label: "Mješavina goriva", Icon: "Fuel" },
  { value: "Automatsko", label: "Podmazivanje", Icon: "Droplets" },
] as const;

export function fmtKM(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}
