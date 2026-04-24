"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name:     "Akumulatorska Brusilica",
      content_category: "Profesionalni alat",
      value:            74.9,
      currency:         "BAM",
    });
  }, []);

  return null;
}
