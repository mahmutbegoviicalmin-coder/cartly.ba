import type { Metadata } from "next";
import HammerPage from "./HammerPage";

export const metadata: Metadata = {
  title: "Hammer S3 Radne Patike | 59,90 KM — Cartly.ba",
  description:
    "Hammer S3 radne patike — čelična zaštitna kapica, vodootporne, lagane. Veličine 39–47. Dostava širom BiH, plaćanje pouzećem. Akcijska cijena 59,90 KM umjesto 139,90 KM.",
  openGraph: {
    title: "Hammer S3 Radne Patike | 59,90 KM",
    description: "S3 certificirane radne patike. Čelična kapica, vodootpornost, protuklizni đon. Veličine 39–47. Dostava 1–3 dana.",
    images: ["/radne-patike-hammer/hero.webp"],
  },
};

export default function RadnePatikeHammerPage() {
  return <HammerPage />;
}
