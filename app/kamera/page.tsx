import type { Metadata } from "next";
import KameraClient from "./KameraClient";

export const metadata: Metadata = {
  title: "WiFi Sigurnosna Kamera | Akcija 44,90 KM",
  description:
    "ZaĹˇtitite svoj dom uz pametnu WiFi sigurnosnu kameru. NoÄ‡ni vid, detekcija pokreta, mobilna aplikacija i dostava Ĺˇirom BiH.",
  openGraph: {
    title: "WiFi PTZ Sigurnosna Kamera | Akcija 44,90 KM",
    description: "Pratite dom uĹľivo sa mobitela. NoÄ‡ni vid, AI detekcija pokreta, 355Â° rotacija. Dostava 24-48h, plaÄ‡anje pouzeÄ‡em.",
    images: ["/kamera2/kamerapng.webp"],
  },
};

export default function KameraPage() {
  return <KameraClient />;
}

