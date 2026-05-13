import type { Metadata } from "next";
import ProductPageHeader from "@/components/ProductPageHeader";
import TickerBar         from "@/components/TickerBar";
import CetkaClient       from "./CetkaClient";
import PixelEvents       from "./PixelEvents";

export const metadata: Metadata = {
  title: "Čelična Četka za Trimer 1+1 GRATIS — Cartly.ba",
  description:
    "Profesionalna čelična četka za trimer — uklanja korov, suhu travu i korijenje. Akcija 1+1 GRATIS, samo 19,90 KM. Dostava po cijeloj BiH, plaćanje pouzećem.",
};

export default function CelicnaCetkaPage() {
  return (
    <>
      <PixelEvents />
      <ProductPageHeader ctaHref="#narudzba" />
      <TickerBar />
      <CetkaClient />
    </>
  );
}
