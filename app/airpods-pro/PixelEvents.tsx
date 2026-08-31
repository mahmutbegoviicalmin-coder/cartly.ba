"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name:     "AirPods Pro",
      content_category: "Audio",
      content_ids:      ["airpods-pro"],
      content_type:     "product",
      value:            49.9,
      currency:         "BAM",
    });
  }, []);

  return null;
}
