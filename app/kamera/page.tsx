import type { Metadata } from "next";
import KameraClient from "./KameraClient";
import { productSeo } from "@/lib/seo";

export const metadata: Metadata = {
  ...productSeo("kamera"),
  title: "WiFi Sigurnosna Kamera | Akcija 44,90 KM",
  description:
    "Zaštitite svoj dom uz pametnu WiFi sigurnosnu kameru. Noćni vid, detekcija pokreta, mobilna aplikacija i dostava širom BiH.",
  openGraph: {
    title: "WiFi PTZ Sigurnosna Kamera | Akcija 44,90 KM",
    description: "Pratite dom uživo sa mobitela. Noćni vid, AI detekcija pokreta, 355° rotacija. Dostava 24-48h, plaćanje pouzećem.",
    images: ["/kamera2/kamerapng.webp"],
  },
};

export default function KameraPage() {
  return <KameraClient />;
}
