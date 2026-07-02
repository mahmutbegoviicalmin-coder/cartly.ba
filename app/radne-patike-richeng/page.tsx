import type { Metadata } from "next";
import RichengPage from "./RichengPage";

export const metadata: Metadata = {
  title: "Richeng S3 Radne Patike | 49,90 KM — Cartly.ba",
  description:
    "Richeng S3 radne patike — čelična zaštitna kapica, vodootporne, lagane. Veličine 36–47. Dostava širom BiH, plaćanje pouzećem.",
  openGraph: {
    title: "Richeng S3 Radne Patike | 49,90 KM",
    description: "S3 certificirane radne patike. Čelična kapica, vodootpornost, protuklizni đon. Veličine 36–47. Dostava 1–3 dana.",
    images: ["/richeng/1.png"],
  },
};

export default function RadnePatikePage() {
  return <RichengPage />;
}
