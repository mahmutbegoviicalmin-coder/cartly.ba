import type { MetadataRoute } from "next";
import { CATALOG } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`,          lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/proizvodi`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...CATALOG.map(p => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p.bestseller ? 0.8 : 0.7,
    })),
  ];
}
