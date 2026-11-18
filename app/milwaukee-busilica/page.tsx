import type { Metadata } from "next";
import BusilicaClient from "./BusilicaClient";
import { productSeo } from "@/lib/seo";

export const metadata: Metadata = {
  ...productSeo("milwaukee-busilica"),
  title: "Milwaukee M18 bušilica | 69,90 KM | Cartly.ba",
  description:
    "Akumulatorska bušilica Milwaukee M18 s brushless motorom, baterijom, punjačem i koferom. Akcija 69,90 KM umjesto 179,90 KM. Dostava 1–2 dana, plaćanje pouzećem.",
  openGraph: {
    title: "Milwaukee M18 bušilica | 69,90 KM",
    description: "Brushless bušilica s baterijom, punjačem i koferom. Plaćanje pouzećem.",
    images: ["/images/milwaukee.png"],
  },
};

export default function Page() {
  return <BusilicaClient />;
}
