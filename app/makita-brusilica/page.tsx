import type { Metadata } from "next";
import Footer from "@/components/Footer";
import MakitaClient from "./MakitaClient";
import PixelEvents from "./PixelEvents";
import { productSeo } from "@/lib/seo";

export const metadata: Metadata = {
  ...productSeo("makita-brusilica"),
  title: "Makita Aku Brusilica sa Potenciometrom | Cartly.ba",
  description:
    "Makita aku brusilica sa regulacijom brzine, brushless motorom i 2 baterije. Akcija 84,90 KM umjesto 139,90 KM. Besplatna dostava, plaćanje pouzećem po cijeloj BiH.",
};

export default function MakitaBrusilicaPage() {
  return (
    <>
      <MakitaClient />
      <Footer />
      <PixelEvents />
    </>
  );
}
