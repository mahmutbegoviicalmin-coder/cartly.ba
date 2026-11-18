"use client";

import { usePathname } from "next/navigation";
import { bySlug } from "@/lib/catalog";
import { productJsonLd, storeJsonLd } from "@/lib/seo";

/**
 * JSON-LD for Google: OnlineStore on the home page, Product + Offer on every
 * product page. Rendered during SSR (usePathname works on the server), so it
 * is in the HTML Google fetches.
 */
export function StructuredData() {
  const path = usePathname() || "/";
  const slug = path.split("/")[1] || "";
  const data = path === "/" ? storeJsonLd() : bySlug(slug) ? productJsonLd(slug) : null;
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; "<" is escaped so text can't close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
