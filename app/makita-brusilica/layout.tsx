import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets:  ["latin", "latin-ext"],
  weight:   ["300", "400", "500", "600", "700"],
  display:  "swap",
  variable: "--font-makita",
});

export default function MakitaLayout({ children }: { children: ReactNode }) {
  return <div className={inter.variable}>{children}</div>;
}
