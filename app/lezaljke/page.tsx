import LezaljkaPage from "./LezaljkaPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Lezaljka – 3 Boje | Cartly.ba",
  description: "Luksuzna lezaljka u 3 boje: tamno zelena, bordo i crna. Idealna za baštu, terasu ili bazen. Naruči uz dostavu po Bosni i Hercegovini. Samo 69,90 KM.",
};

export default function Page() {
  return <LezaljkaPage />;
}
