"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name:     "Usmjerivač Zraka Klime",
      content_category: "Kućni dodaci",
      content_ids:      ["usmjerivac-zraka"],
      content_type:     "product",
      value:            19.90,
      currency:         "BAM",
    });
  }, []);
  return null;
}
