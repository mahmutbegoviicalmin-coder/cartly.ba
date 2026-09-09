import type { Metadata } from "next";
import MotornaPilaClient from "./MotornaPilaClient";
import PixelEvents from "./PixelEvents";

const TITLE = "Motorna pila 4,9 KS, 40 cm | 104,90 KM";
const DESCRIPTION =
  "Motorna pila snage 4,9 KS sa mačem od 40 cm. Automatsko podmazivanje, lanac .325. Cijena 104,90 KM, plaćanje pouzećem.";
const OG_IMAGE = "/motorka/motorka1.png";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "bs_BA",
    images: [{ url: OG_IMAGE, width: 1536, height: 1024, alt: "Motorna pila 4,9 KS sa mačem od 40 cm" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function MotornaPilaPage() {
  return (
    <>
      <MotornaPilaClient />
      <PixelEvents />
    </>
  );
}
