"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name:     "Žirafa Brusilica za Zidove",
      content_category: "Alati",
      content_ids:      ["zirafa-brusilica"],
      content_type:     "product",
      value:            169.90,
      currency:         "BAM",
    });
  }, []);
  return null;
}
