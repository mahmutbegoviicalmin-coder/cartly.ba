"use client";

import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name:     "Čelična Četka za Trimer",
      content_category: "Vrtlarstvo",
      value:             19.90,
      currency:         "BAM",
    });
  }, []);

  return null;
}
