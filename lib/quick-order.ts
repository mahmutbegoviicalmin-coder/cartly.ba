// Registry for the global quick-order pop-up (components/store/QuickOrder.tsx).
// One entry per product page. Prices are only for display: every API route
// recomputes the price on the server, so the pop-up cannot charge a wrong amount.
// When a price changes on the server, change it here and in lib/catalog.ts too.

export type QuickVariant = {
  /** Value sent to the API. */
  value: string;
  /** Big button text. */
  label: string;
  /** Second line under the label (e.g. "Djeca do 9 godina"). */
  hint?: string;
  /** Product price for this option (replaces `price`). */
  price?: number;
  soldOut?: boolean;
};

export type QuickOrderConfig = {
  api: string;
  /** Product price in KM (for one piece / the cheapest option). */
  price: number;
  delivery: number;
  /** API rejects orders without a 5-digit postal code. */
  requirePostal?: boolean;
  /** Show a 1–N quantity stepper (API reads `kolicina`). */
  maxQty?: number;
  /** Pick one size; sent as `velicina` (or as `velicine: [{velicina,kolicina}]` with sizesAsList). */
  sizes?: QuickVariant[];
  sizesAsList?: boolean;
  /** Picker label for `sizes`, default "Veličina". */
  sizeLabel?: string;
  /** Pick one colour; sent as `boja`. */
  colors?: QuickVariant[];
  /** Pick a package; sent as `bundle` (number). Each option carries its price. */
  bundles?: QuickVariant[];
  /** Fixed extra fields for this API. */
  extra?: Record<string, unknown>;
  /** Send the browser's `_crt_eid` as `externalId`. */
  externalId?: boolean;
  /** Send the page URL as `sourceUrl`. */
  sourceUrl?: boolean;
  /** Pixel content id + name for Purchase / InitiateCheckout. */
  pixelId: string;
  pixelName: string;
};

const range = (from: number, to: number, soldOut: number[] = []): QuickVariant[] =>
  Array.from({ length: to - from + 1 }, (_, i) => {
    const n = from + i;
    return { value: String(n), label: String(n), soldOut: soldOut.includes(n) };
  });

export const QUICK_ORDER: Record<string, QuickOrderConfig> = {
  "milwaukee-set-31":       { api: "/api/milwaukee-set-order", price: 149,   delivery: 10, requirePostal: true, maxQty: 3, externalId: true, pixelId: "milwaukee-set-31", pixelName: "Milwaukee Set 3.1" },
  "dewalt-busilica":        { api: "/api/dewalt-order",        price: 69.9,  delivery: 10, pixelId: "dewalt-busilica", pixelName: "DeWalt 28V XR Set" },
  "brusilica":              { api: "/api/brusilica-order",     price: 74.9,  delivery: 10, externalId: true, pixelId: "brusilica-m18-set", pixelName: "Akumulatorska Brusilica M18 Set" },
  "motorna-pila":           { api: "/api/orders",              price: 104.9, delivery: 10, requirePostal: true, externalId: true, extra: { productId: "motorna-pila" }, pixelId: "motorna-pila", pixelName: "Motorna pila 4,9 KS" },
  "milwaukee-busilica":     { api: "/api/narudzba",            price: 69.9,  delivery: 10, pixelId: "milwaukee-busilica", pixelName: "Milwaukee M18 bušilica" },
  "set-2u1":                { api: "/api/set2u1-order",        price: 104.9, delivery: 10, requirePostal: true, maxQty: 3, pixelId: "set-2u1", pixelName: "Set 2 u 1" },
  "zirafa-brusilica":       { api: "/api/zirafa-order",        price: 169.9, delivery: 10, externalId: true, pixelId: "zirafa-brusilica", pixelName: "Žirafa brusilica" },
  "makita-brusilica":       { api: "/api/makita-order",        price: 84.9,  delivery: 0,  requirePostal: true, externalId: true, sourceUrl: true, pixelId: "makita-brusilica", pixelName: "Makita aku brusilica" },
  "makita-brusilica-1500w": { api: "/api/makita-1500-order",   price: 57.9,  delivery: 0,  requirePostal: true, externalId: true, sourceUrl: true, pixelId: "makita-brusilica-1500w", pixelName: "Makita brusilica 1500W" },
  "masina-za-sisanje":      { api: "/api/masina-order",        price: 89.9,  delivery: 10, maxQty: 3, externalId: true, pixelId: "masina-za-sisanje", pixelName: "Mašina za šišanje ovaca 1200W" },
  "celicna-cetka":          { api: "/api/cetka-order",         price: 24.9,  delivery: 10, pixelId: "celicna-cetka", pixelName: "Čelična četka za trimer (1+1 gratis)" },
  "radne-patike-aeox":      { api: "/api/aeox-order",          price: 59.9,  delivery: 0,  maxQty: 3, sizes: range(41, 47, [41, 46, 47]), pixelId: "radne-patike-aeox", pixelName: "Aeox Plus S3 radne patike" },
  "radne-patike":           { api: "/api/order",               price: 59.9,  delivery: 10, maxQty: 3, sizes: range(39, 47, [47]), sizesAsList: true, pixelId: "radne-patike", pixelName: "Tactical Black S3 radne patike" },
  "radne-patike-hammer":    { api: "/api/hammer-order",        price: 59.9,  delivery: 10, maxQty: 3, sizes: range(39, 47), pixelId: "radne-patike-hammer", pixelName: "Hammer S3 radne patike" },
  "radne-patike-richeng":   { api: "/api/richeng-order",       price: 49.9,  delivery: 10, maxQty: 3, sizes: range(36, 47), pixelId: "radne-patike-richeng", pixelName: "Richeng S3 radne patike" },
  "kamera":                 { api: "/api/kamera-order",        price: 44.9,  delivery: 10, maxQty: 3, pixelId: "kamera", pixelName: "V380 Pro WiFi kamera" },
  "airpods-pro":            { api: "/api/airpods-order",       price: 49.9,  delivery: 10, maxQty: 3, externalId: true, pixelId: "airpods-pro", pixelName: "AirPods Pro" },
  "zvucnik":                { api: "/api/order-zvucnik",       price: 59.9,  delivery: 10, maxQty: 3, pixelId: "zvucnik", pixelName: "Bluetooth zvučnik ZQS" },
  "lezaljke":               { api: "/api/lezaljka-order",      price: 59.9,  delivery: 10, maxQty: 3, externalId: true, extra: { boja: "maslinasto-siva" }, pixelId: "lezaljke", pixelName: "Premium ležaljka" },
  "komarnik-za-vrata": {
    api: "/api/komarnik-order", price: 16.9, delivery: 10, externalId: true, pixelId: "komarnik-za-vrata", pixelName: "Magnetni komarnik za vrata",
    bundles: [
      { value: "1", label: "1 komad",  price: 16.9 },
      { value: "2", label: "2 komada", price: 24.9 },
      { value: "3", label: "3 komada", price: 33.9 },
    ],
  },
  "usmjerivac-zraka": {
    api: "/api/usmjerivac-order", price: 13.9, delivery: 10, externalId: true, pixelId: "usmjerivac-zraka", pixelName: "Usmjerivač zraka za klimu",
    bundles: [
      { value: "1", label: "1 komad",  price: 13.9 },
      { value: "2", label: "2 komada", price: 21.9 },
      { value: "3", label: "3 komada", price: 28.9 },
      { value: "4", label: "4 komada", price: 34.9 },
    ],
  },
  "prsluk-za-spasavanje": {
    api: "/api/prsluk-order", price: 42, delivery: 10, externalId: true, pixelId: "prsluk-za-spasavanje", pixelName: "Prsluk za spašavanje",
    sizeLabel: "Veličina",
    sizes: [
      { value: "S",         label: "S",         hint: "Djeca do 9 godina",  price: 42 },
      { value: "M",         label: "M",         hint: "Djeca do 15 godina", price: 45 },
      { value: "3XL",       label: "3XL",       hint: "Odrasli",            price: 49 },
      { value: "PORODICNI", label: "Porodični", hint: "S + M + 2XL + 2XL",  price: 154.9 },
    ],
    colors: [
      { value: "Narandžasta",         label: "Narandžasta" },
      { value: "Fluorescentno zelena", label: "Fluorescentno zelena" },
    ],
  },
};

export const quickOrderFor = (slug: string) => QUICK_ORDER[slug];
