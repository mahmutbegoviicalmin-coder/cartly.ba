import type { Metadata } from "next";
import Set2u1Client from "./Set2u1Client";

export const metadata: Metadata = {
  title: "Set 2 u 1 — Bušilica + Brusilica | 104,90 KM — Cartly.ba",
  description:
    "Kompletan Set 2 u 1: bušilica i brusilica s 2 baterije, punjačem i koferom. Akcijska cijena 104,90 KM. Dostava +10 KM širom BiH, plaćanje pouzećem.",
  openGraph: {
    title: "Set 2 u 1 — Bušilica + Brusilica | 104,90 KM",
    description: "Bušilica, brusilica, 2× baterija, punjač i kofer. Akcija 104,90 KM umjesto 199,90 KM.",
    images: ["/set2u1/set.png"],
  },
};

export default function Set2u1Page() {
  return <Set2u1Client />;
}
