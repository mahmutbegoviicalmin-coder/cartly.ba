import type { Metadata } from "next";
import ProductPageHeader from "@/components/ProductPageHeader";
import Footer from "@/components/Footer";
import UsmjerivacClient from "./UsmjerivacClient";
import PixelEvents from "./PixelEvents";

export const metadata: Metadata = {
  title: "Usmjerivač Zraka Klime · Bez Direktnog Puhanja | Cartly.ba",
  description:
    "Podesivi usmjerivač zraka za zidne klime. Montaža za 5 minuta bez bušenja. Ravnomjerna raspodjela hladnog zraka. Dostava po cijeloj BiH, plaćanje pouzećem.",
};

export default function UsmjerivacPage() {
  return (
    <>
      <ProductPageHeader ctaHref="#narudzba" ctaColor="#1a5fff" />
      <main>
        <UsmjerivacClient />
      </main>
      <Footer />
      <PixelEvents />
    </>
  );
}
