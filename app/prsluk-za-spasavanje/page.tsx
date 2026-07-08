import type { Metadata } from "next";
import PrslukPage from "./PrslukPage";

export const metadata: Metadata = {
  title: "Sigurnosni Prsluk za Spašavanje na Vodi | Cartly.ba",
  description:
    "Sigurnosni prsluk za spašavanje na vodi — certificirana zaštita za djecu i odrasle. Dostupne veličine S, M i 3XL. Dostava širom BiH, plaćanje pouzećem.",
  openGraph: {
    title: "Sigurnosni Prsluk za Spašavanje na Vodi",
    description:
      "Uživajte u vodi bez brige. Certificirani sigurnosni prsluk, dostupan u više veličina i boja. Brza dostava, plaćanje pouzećem.",
    images: ["/prsluk/prsluk1png.png"],
  },
};

export default function Page() {
  return <PrslukPage />;
}
