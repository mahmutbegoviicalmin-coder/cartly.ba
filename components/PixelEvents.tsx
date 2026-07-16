"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name: "Radne Patike S3 Tactical Black",
      content_category: "Zaštitna obuća",
      value: 59.90,
      currency: "BAM",
    });
  }, []);

  return null;
}
