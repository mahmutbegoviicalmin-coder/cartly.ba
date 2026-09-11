import type { Metadata } from "next";
import AeoxPage from "./AeoxPage";

export const metadata: Metadata = {
  title: "Aeox Plus S3 Radne Patike | 59,90 KM - Cartly.ba",
  description:
    "Aeox Plus S3 radne patike - metalna zaštitna kapica, kevlar đon, vodootporne i lagane. Veličine 41-47. Dostava širom BiH, plaćanje pouzećem. Akcijska cijena 59,90 KM umjesto 139,90 KM.",
  openGraph: {
    title: "Aeox Plus S3 Radne Patike | 59,90 KM",
    description:
      "S3 certificirane radne patike. Metalna kapica, kevlar zaštita od proboja, protuklizni đon. Veličine 41-47. Dostava 1-3 dana.",
    images: ["/aeoxplus/11.webp"],
  },
};

export default function RadnePatikeAeoxPage() {
  return <AeoxPage />;
}
