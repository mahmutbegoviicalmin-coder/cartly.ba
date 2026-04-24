"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name:     "Milwaukee M18 Bušilica",
      content_category: "Profesionalni alat",
      value:            69.90,
      currency:         "BAM",
    });
  }, []);

  return null;
}
