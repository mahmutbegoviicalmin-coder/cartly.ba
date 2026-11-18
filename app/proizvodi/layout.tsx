import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Svi proizvodi: alati, radna obuća i dom | Cartly.ba",
  description:
    "Svi proizvodi na jednom mjestu: bušilice, brusilice, motorne pile, S3 radne patike, kamere i stvari za dom. Dostava 1–2 dana po BiH, plaćanje pouzećem.",
  alternates: { canonical: "/proizvodi" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
