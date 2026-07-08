import type { ReactNode } from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function PrslukLayout({ children }: { children: ReactNode }) {
  return <div className={`${poppins.variable} font-poppins`}>{children}</div>;
}
