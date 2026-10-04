"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";
import { PRODUCT, CONTENT_ID, UNIT_PRICE } from "./theme";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name:     PRODUCT,
      content_category: "Profesionalni alat",
      content_ids:      [CONTENT_ID],
      content_type:     "product",
      value:            UNIT_PRICE,
      currency:         "BAM",
    });
  }, []);

  return null;
}
