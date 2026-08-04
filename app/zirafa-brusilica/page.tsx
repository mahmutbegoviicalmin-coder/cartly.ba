import type { Metadata } from "next";
import ProductPageHeader from "@/components/ProductPageHeader";
import Footer from "@/components/Footer";
import ZirafaClient from "./ZirafaClient";
import PixelEvents from "./PixelEvents";

export const metadata: Metadata = {
  title: "Žirafa Brusilica za Zidove · Brušenje Bez Ljestvi | Cartly.ba",
  description:
    "Žirafa brusilica za zidove i plafone sa teleskopskom šipkom i LED osvjetljenjem. Brusite zidove i plafone bez ljestvi i skele. Akcija -37%, dostava po cijeloj BiH, plaćanje pouzećem.",
};

export default function ZirafaPage() {
  return (
    <>
      <ProductPageHeader ctaHref="#narudzba" ctaColor="#0284C7" />
      <main>
        <ZirafaClient />
      </main>
      <Footer />
      <PixelEvents />
    </>
  );
}
