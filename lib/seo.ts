import type { Metadata } from "next";
import { BLACK_NOVEMBER_END } from "./campaign-dates";
import { bySlug, CATALOG, categoryLabel, heroImage } from "./catalog";

/** Public site address. Set NEXT_PUBLIC_SITE_URL in Vercel if the domain changes. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.cartlybih.store").replace(/\/$/, "");
export const SITE_NAME = "Cartly.ba";

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/** Brand shown in Google for each product (only where the product really is that brand). */
const BRANDS: Record<string, string> = {
  "milwaukee-set-31": "Milwaukee", "milwaukee-busilica": "Milwaukee", "brusilica": "Milwaukee",
  "dewalt-busilica": "DeWalt", "makita-brusilica": "Makita", "makita-brusilica-1500w": "Makita",
  "radne-patike-aeox": "Aeox", "radne-patike-hammer": "Hammer", "radne-patike-richeng": "Richeng",
  "kamera": "V380",
};

/**
 * Canonical URL + Open Graph image for a product page. Spread it first in the
 * page's own `metadata` so the page's title/description still win:
 *   export const metadata = { ...productSeo("kamera"), title: "…" }
 */
export function productSeo(slug: string): Metadata {
  const p = bySlug(slug);
  const image = p ? abs(heroImage(p)) : undefined;
  return {
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "website",
      url: `/${slug}`,
      siteName: SITE_NAME,
      locale: "bs_BA",
      title: p?.name,
      description: p?.short,
      images: image ? [{ url: image, alt: p?.name }] : undefined,
    },
  };
}

/** schema.org Product + Offer for Google rich results / free product listings. */
export function productJsonLd(slug: string) {
  const p = bySlug(slug);
  if (!p) return null;
  const now = Date.now();
  const validUntil = new Date(now < BLACK_NOVEMBER_END ? BLACK_NOVEMBER_END - 1 : now + 90 * 86_400_000).toISOString().slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short,
    image: [abs(heroImage(p)), abs(p.image)],
    sku: p.slug,
    category: categoryLabel(p.category),
    brand: { "@type": "Brand", name: BRANDS[slug] ?? SITE_NAME },
    url: abs(`/${slug}`),
    offers: {
      "@type": "Offer",
      url: abs(`/${slug}`),
      priceCurrency: "BAM",
      price: p.price.toFixed(2),
      priceValidUntil: validUntil,
      availability: p.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "10.00", currency: "BAM" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "BA" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "BA",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
  };
}

/** schema.org Organization + OnlineStore for the home page. */
export function storeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs("/lisko/lisko-320.webp"),
    description: "Online prodavnica u Bosni i Hercegovini: alati, radna obuća i stvari za dom. Dostava 1–2 dana, plaćanje pouzećem.",
    areaServed: { "@type": "Country", name: "Bosna i Hercegovina" },
    currenciesAccepted: "BAM",
    paymentAccepted: "Gotovina pri preuzimanju (pouzećem)",
    ...(process.env.NEXT_PUBLIC_CONTACT_PHONE || process.env.NEXT_PUBLIC_CONTACT_EMAIL
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            areaServed: "BA",
            availableLanguage: ["bs", "hr", "sr"],
            ...(process.env.NEXT_PUBLIC_CONTACT_PHONE ? { telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE } : {}),
            ...(process.env.NEXT_PUBLIC_CONTACT_EMAIL ? { email: process.env.NEXT_PUBLIC_CONTACT_EMAIL } : {}),
          },
        }
      : {}),
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/proizvodi?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export const PRODUCT_SLUGS = CATALOG.map(p => p.slug);
