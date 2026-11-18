import IMAGE_SIZES from "./product-images.json";

// Single source of truth for the storefront: home page, /proizvodi, the header
// search and "Možda vas zanima" on product pages all read from here.
//
// Prices mirror what each landing page charges. When a landing page price
// changes, change it here too.

export type CategoryId = "alati" | "obuca" | "dom";

export const CATEGORIES: { id: CategoryId; label: string; desc: string }[] = [
  { id: "alati", label: "Alati",          desc: "Bušilice, brusilice, pile i kompletni setovi" },
  { id: "obuca", label: "Radna obuća",    desc: "S3 zaštitne patike s čeličnom kapicom" },
  { id: "dom",   label: "Dom i tehnika",  desc: "Video nadzor, audio i korisni dodaci za kuću" },
];

export type CatalogProduct = {
  slug: string;          // route, without leading slash
  name: string;
  short: string;         // one line under the name on cards
  category: CategoryId;
  price: number;         // KM, what the landing page charges
  oldPrice?: number;     // KM, crossed-out price shown on the landing page
  image: string;         // original image used on the landing page
  /** Lifestyle photo that should fill the card instead of sitting on a grey tile. */
  cover?: boolean;
  /** Shown in "Bestseleri" on the home page. Order = position in this list. */
  bestseller?: boolean;
  /** Extra words people might search for. */
  keywords?: string;
  /**
   * Real pieces left in stock. Shown as "Ostalo na stanju: N" on the product
   * page. Leave it out when you don't know the real number: never guess.
   */
  stock?: number;
};

export const CATALOG: CatalogProduct[] = [
  // ── Alati ──────────────────────────────────────────────────────────────────
  { slug: "milwaukee-set-31",       name: "Milwaukee Set 3.1",              short: "Bušilica, udarni odvijač, brusilica, 2 baterije i kofer", category: "alati", price: 149,   oldPrice: 220,    image: "/milwaukee-set-31/hero.png",  bestseller: true, keywords: "set alata odvijac" },
  { slug: "dewalt-busilica",        name: "DeWalt 28V XR Set",              short: "Bušilica, 2 baterije, punjač i 15+ alata u koferu",    category: "alati", price: 69.9,  oldPrice: 199.9,  image: "/dewalt/busilica.webp",       bestseller: true, keywords: "busilica set alata kofer" },
  { slug: "brusilica",              name: "Akumulatorska brusilica M18",    short: "2 baterije, punjač, štitnik i kofer",                  category: "alati", price: 74.9,  oldPrice: 149.9,  image: "/brusilica/brusilica-hero.webp", bestseller: true, keywords: "flex brusilica milwaukee" },
  { slug: "motorna-pila",           name: "Motorna pila 4,9 KS",            short: "Benzinski motor, mač 40 cm, automatsko podmazivanje",  category: "alati", price: 104.9, oldPrice: 299,    image: "/motorka/motorka1.png",       bestseller: true, keywords: "motorka testera drvo" },
  { slug: "milwaukee-busilica",     name: "Milwaukee M18 bušilica",         short: "Akumulatorska bušilica 18V",                           category: "alati", price: 69.9,  oldPrice: 179.9,  image: "/images/milwaukee.png",       bestseller: true, keywords: "busilica odvijac" },
  { slug: "set-2u1",                name: "Set 2 u 1: bušilica + brusilica", short: "Dva alata u jednom setu",                             category: "alati", price: 104.9, oldPrice: 199.9,  image: "/set2u1/set.png",             bestseller: true, keywords: "set busilica brusilica" },
  { slug: "zirafa-brusilica",       name: "Žirafa brusilica za zidove",     short: "Teleskopska šipka, LED prsten, priključak za usisavač", category: "alati", price: 169.9, oldPrice: 269.9,  image: "/zirafa/heroslika.png",  keywords: "zirafa glet zid brusenje" },
  { slug: "makita-brusilica",       name: "Makita aku brusilica",           short: "Akumulatorska brusilica u kompletu",                   category: "alati", price: 84.9,  oldPrice: 139.9,  image: "/makita-brusilica/makita-1.jpg", keywords: "flex" },
  { slug: "makita-brusilica-1500w", name: "Makita brusilica 1500W",         short: "Električna brusilica 1500W",                           category: "alati", price: 57.9,  oldPrice: 124.9,  image: "/makita-1500w/hero.jpg",      keywords: "flex struja" },
  { slug: "masina-za-sisanje",      name: "Mašina za šišanje ovaca 1200W",  short: "Kofer, rezervni nož i mazivo",                         category: "alati", price: 89.9,  oldPrice: 169.9,  image: "/masina1.jpeg",               keywords: "ovce sisanje strizenje" },
  { slug: "celicna-cetka",          name: "Čelična četka za trimer",        short: "Uklanja korov i korijenje. 1+1 gratis",                category: "alati", price: 24.9,  oldPrice: 49.9,   image: "/celicnacetka.jpeg",  keywords: "trimer korov basta" },

  // ── Radna obuća ────────────────────────────────────────────────────────────
  { slug: "radne-patike-aeox",      name: "Aeox Plus S3 radne patike",      short: "Metalna kapica, kevlar đon, protuklizne",              category: "obuca", price: 59.9,  oldPrice: 139.9,  image: "/aeoxplus/11.webp",           bestseller: true, keywords: "cipele zastitne" },
  { slug: "radne-patike",           name: "Tactical Black S3 radne patike", short: "Čelična kapica, BOA Fit, anti-klizni đon",             category: "obuca", price: 59.9,  oldPrice: 99.9,   image: "/images/product-1.webp",      keywords: "cipele zastitne boa" },
  { slug: "radne-patike-hammer",    name: "Hammer S3 radne patike",         short: "S3 zaštitna obuća",                                    category: "obuca", price: 59.9,  oldPrice: 139.9,  image: "/radne-patike-hammer/hero.webp", keywords: "cipele zastitne" },
  { slug: "radne-patike-richeng",   name: "Richeng S3 radne patike",        short: "S3 zaštitna obuća",                                    category: "obuca", price: 49.9,  oldPrice: 79.9,   image: "/richeng/1.png",              keywords: "cipele zastitne" },

  // ── Dom i tehnika ──────────────────────────────────────────────────────────
  { slug: "kamera",                 name: "V380 Pro WiFi kamera",           short: "Bežični video nadzor za kuću i dvorište",              category: "dom",   price: 44.9,                     image: "/kamera2/kamerapng.webp",     bestseller: true, keywords: "video nadzor wifi ptz" },
  { slug: "airpods-pro",            name: "AirPods Pro",                    short: "Bežične slušalice",                                    category: "dom",   price: 49.9,  oldPrice: 89.9,   image: "/airpods-pro/hero.png",       keywords: "slusalice bluetooth" },
  { slug: "zvucnik",                name: "Bluetooth zvučnik ZQS",          short: "Bežični zvučnik s mikrofonom",                         category: "dom",   price: 59.9,  oldPrice: 129.9,  image: "/images/zvucnik/zvucnik1.webp", keywords: "zvucnik muzika karaoke" },
  { slug: "lezaljke",               name: "Premium ležaljka",               short: "Za dvorište, bazen i plažu",                           category: "dom",   price: 59.9,  oldPrice: 129.9,  image: "/lezaljke/lezaljka1.png",     keywords: "lezaljka basta bazen" },
  { slug: "komarnik-za-vrata",      name: "Magnetni komarnik za vrata",     short: "Montaža bez bušenja, zatvara se sam",                  category: "dom",   price: 16.9,                     image: "/komarnik/hero.webp",  keywords: "mreza komarci insekti" },
  { slug: "usmjerivac-zraka",       name: "Usmjerivač zraka za klimu",      short: "Montaža za 5 minuta, bez bušenja",                     category: "dom",   price: 13.9,                     image: "/usmjerivac/hero.png",  keywords: "klima deflektor" },
  { slug: "prsluk-za-spasavanje",   name: "Prsluk za spašavanje",           short: "Sigurnosni prsluk za vodu",                            category: "dom",   price: 42,                       image: "/prsluk/prsluk1.png",         keywords: "prsluk voda more camac" },
];

export const km = (n: number) =>
  `${n.toFixed(2).replace(".", ",")} KM`;

export const discountPct = (p: CatalogProduct) =>
  p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

/** Optimised 800px card image generated from `image` (public/products/<slug>.webp (transparent cut-out)). */
export const cardImage = (p: CatalogProduct) => `/shop/sm/${p.slug}.webp`;

/** Full 1200px cut-out, for the hero slider and large feature tiles. */
export const heroImage = (p: CatalogProduct) => `/shop/${p.slug}.webp`;

export const categoryLabel = (id: CategoryId) => CATEGORIES.find(c => c.id === id)?.label ?? "";

export const bySlug = (slug: string) => CATALOG.find(p => p.slug === slug);

export const bestsellers = () => CATALOG.filter(p => p.bestseller);

/** Same category first (bestsellers before others), then fill from other categories. */
export function relatedTo(slug: string, count = 4): CatalogProduct[] {
  const self = bySlug(slug);
  const others = CATALOG.filter(p => p.slug !== slug);
  const rank = (p: CatalogProduct) => (p.bestseller ? 0 : 1);
  const same = others.filter(p => p.category === self?.category).sort((a, b) => rank(a) - rank(b));
  const rest = others.filter(p => p.category !== self?.category).sort((a, b) => rank(a) - rank(b));
  return [...same, ...rest].slice(0, count);
}

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

export function searchCatalog(q: string): CatalogProduct[] {
  const terms = fold(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return CATALOG.filter(p => {
    const hay = fold(`${p.name} ${p.short} ${p.keywords ?? ""} ${CATEGORIES.find(c => c.id === p.category)?.label ?? ""}`);
    return terms.every(t => hay.includes(t));
  });
}

/** Biggest discount across the catalogue, for "popusti do −X%". */
export const MAX_DISCOUNT = Math.max(...CATALOG.map(discountPct));

/** Store accent colour (header, links, home page). Product landing pages keep their own colours. */
/** The one accent colour on store pages, used only for discounts and the campaign. */
export const BRAND = "#F45B39";

/** Biggest discounts first, for the Black November deals rail. */
export const topDeals = (count = 8) =>
  [...CATALOG].filter(p => discountPct(p) > 0).sort((a, b) => discountPct(b) - discountPct(a)).slice(0, count);

/**
 * Size of a product inside a square tile so every product reads equally big:
 * wide items (chainsaw, shoes) and tall items (drill) get the same visual area,
 * capped by the tile. Returns width/height as % of the tile.
 */
export function fitInTile(slug: string, { area = 0.36, maxW = 0.82, maxH = 0.64 } = {}) {
  const dims = (IMAGE_SIZES as Record<string, number[]>)[slug] ?? [1, 1];
  const r = dims[0] / dims[1];
  let w = Math.sqrt(area * r), h = Math.sqrt(area / r);
  if (w > maxW) { w = maxW; h = w / r; }
  if (h > maxH) { h = maxH; w = h * r; }
  return { w: +(w * 100).toFixed(2), h: +(h * 100).toFixed(2) };
}
