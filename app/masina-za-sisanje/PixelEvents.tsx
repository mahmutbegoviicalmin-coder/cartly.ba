"use client";
import { useEffect } from "react";
import { event } from "@/lib/fbpixel";

export default function PixelEvents() {
  useEffect(() => {
    event("ViewContent", {
      content_name: "Masina za Sisanje Ovaca 850W",
      content_category: "Poljoprivredni alati",
      value: 89.90,
      currency: "BAM",
    });
  }, []);
  return null;
}
