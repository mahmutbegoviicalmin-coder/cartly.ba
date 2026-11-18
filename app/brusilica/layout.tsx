import type { Metadata } from "next";
import { productSeo } from "@/lib/seo";

export const metadata: Metadata = {
  ...productSeo("brusilica"),
  title: "Akumulatorska brusilica M18 · 2 baterije, punjač i kofer | 74,90 KM — Cartly.ba",
  description:
    "Akumulatorska kutna brusilica M18 s 2 baterije, punjačem, štitnikom i koferom. Akcija 74,90 KM umjesto 149,90 KM. Dostava 1–2 dana po cijeloj BiH, plaćanje pouzećem.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
