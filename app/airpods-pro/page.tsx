import type { Metadata } from "next";
import Footer from "@/components/Footer";
import AirPodsClient from "./AirPodsClient";
import PixelEvents from "./PixelEvents";

export const metadata: Metadata = {
  title: "AirPods Pro · ANC, Adaptive Audio, MagSafe | Cartly.ba",
  description:
    "AirPods Pro sa aktivnim poništavanjem buke, Adaptive Audio i MagSafe kućištem. 49,90 KM plus 10 KM dostava. Plaćanje pouzećem, dostava po cijeloj BiH.",
};

export default function AirPodsProPage() {
  return (
    <>
      <AirPodsClient />
      <Footer />
      <PixelEvents />
    </>
  );
}
