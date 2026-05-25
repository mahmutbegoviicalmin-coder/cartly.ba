import type { Metadata } from "next";
import ProductPageHeader from "@/components/ProductPageHeader";
import TickerBar from "@/components/TickerBar";
import Footer from "@/components/Footer";
import MasinaClient from "./MasinaClient";
import MasinaFloatingCTA from "./FloatingCTA";
import PixelEvents from "./PixelEvents";

export const metadata: Metadata = {
  title: "Mašina za šišanje ovaca 850W · Kompletni set | Cartly.ba",
  description: "Profesionalna mašina za šišanje ovaca 850W. U setu: rezervni nož GRATIS, kofer za prenošenje i mazivo. Plaćanje pouzećem, dostava po cijeloj BiH.",
};

export default function MasinaPage() {
  return (
    <>
      <ProductPageHeader ctaHref="#order" />
      <TickerBar />
      <main>
        <MasinaClient />
      </main>
      <Footer />
      <MasinaFloatingCTA />
      <PixelEvents />
    </>
  );
}
