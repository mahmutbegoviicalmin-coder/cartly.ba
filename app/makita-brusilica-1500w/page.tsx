import type { Metadata } from "next";
import Footer from "@/components/Footer";
import MakitaClient from "./MakitaClient";
import PixelEvents from "./PixelEvents";
import { productSeo } from "@/lib/seo";

export const metadata: Metadata = {
  ...productSeo("makita-brusilica-1500w"),
  title: "Makita Brusilica 1500W sa Potenciometrom | Cartly.ba",
  description:
    "Makita brusilica 1500 W sa potenciometrom i 6 brzina, 12.000 o/min, garancija 24 mjeseca. Akcija 57,90 KM umjesto 124,90 KM. Besplatna dostava, plaćanje pouzećem po cijeloj BiH.",
};

export default function Makita1500Page() {
  return (
    <>
      <MakitaClient />
      <Footer />
      <PixelEvents />
    </>
  );
}
