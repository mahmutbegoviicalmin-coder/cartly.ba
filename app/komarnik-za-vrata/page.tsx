import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ProductPageHeader from "@/components/ProductPageHeader";
import TickerBar from "@/components/TickerBar";
import Footer from "@/components/Footer";
import KomarnikClient from "./KomarnikClient";
import KomarnikFloatingCTA from "./FloatingCTA";
import PixelEvents from "./PixelEvents";

const displayFont = Plus_Jakarta_Sans({
  subsets:  ["latin"],
  weight:   ["700", "800"],
  variable: "--font-display",
  display:  "swap",
});

export const metadata: Metadata = {
  title: "Magnetni Komarnik za Vrata · Bez Bušenja | Cartly.ba",
  description:
    "Magnetni komarnik sa samozatvarajućim panelima. Montaža za 2 minute bez bušenja. Zaštita od komaraca i insekata. Dostava po cijeloj BiH, plaćanje pouzećem.",
};

export default function KomarnikPage() {
  return (
    <div className={displayFont.variable}>
      <ProductPageHeader ctaHref="#narudzba" ctaColor="#5C8B5A" />
      <main>
        <KomarnikClient />
      </main>
      <Footer />
      <KomarnikFloatingCTA />
      <PixelEvents />
    </div>
  );
}
