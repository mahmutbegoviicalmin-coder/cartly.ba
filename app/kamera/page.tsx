import type { Metadata } from "next";
import KameraClient from "./KameraClient";

export const metadata: Metadata = {
  title: "V380 Pro WiFi Kamera 12MP — Cartly.ba",
  description:
    "Vanjska sigurnosna kamera V380 Pro WiFi 12MP. Trostruko sočivo, 360° pokrivenost, noćni vid, IP66 vodootpornost. Samo 129,90 KM. Plaćanje pouzećem.",
};

export default function KameraPage() {
  return <KameraClient />;
}
