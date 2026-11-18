import PatikePage from "./PatikePage";
import { productSeo } from "@/lib/seo";

export const metadata = {
  ...productSeo("radne-patike"),
  title: "Tactical Black S3 — Radne Patike | Cartly.ba",
  description: "EN ISO 20345 S3 certificirane radne patike s BOA® Fit sistemom. Čelična kapica, anti-klizajući đon, lagane i udobne. Dostava po BiH · Plaćanje pouzećem.",
};

export default function RadnePatike() {
  return <PatikePage />;
}
