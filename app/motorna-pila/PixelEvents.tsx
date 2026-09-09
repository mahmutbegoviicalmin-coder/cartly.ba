"use client";

import { useEffect } from "react";
import { PRODUCT_ID, PRODUCT_NAME, PRODUCT_PRICE } from "./product";
import { trackViewContent } from "@/lib/analytics";

export default function PixelEvents() {
  useEffect(() => {
    trackViewContent({
      id: PRODUCT_ID,
      name: PRODUCT_NAME,
      category: "Alati",
      value: PRODUCT_PRICE,
    });
  }, []);

  return null;
}
