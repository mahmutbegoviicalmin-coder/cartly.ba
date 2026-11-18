import LezaljkaPage from "./LezaljkaPage";
import { Metadata } from "next";
import { productSeo } from "@/lib/seo";

export const metadata: Metadata = {
  ...productSeo("lezaljke"),
  title: "Premium Lezaljka | Cartly.ba",
  description: "Luksuzna lezaljka u tamno maslinasto sivoj boji, s UV otpornom tkaninom i čeličnim okvirom. Idealna za baštu, terasu ili bazen. Naruči uz dostavu po Bosni i Hercegovini. Samo 59,90 KM.",
};

export default function Page() {
  return <LezaljkaPage />;
}
