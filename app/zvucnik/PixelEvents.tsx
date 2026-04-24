"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name:     "ZQS-6239 Bluetooth Zvučnik",
      content_category: "Bluetooth audio",
      value:            59.90,
      currency:         "BAM",
    });
  }, []);

  return null;
}
