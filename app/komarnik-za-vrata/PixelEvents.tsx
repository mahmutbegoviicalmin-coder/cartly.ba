"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name:     "Magnetni Komarnik za Vrata",
      content_category: "Kućni dodaci",
      value:            16.90,
      currency:         "BAM",
    });
  }, []);
  return null;
}
