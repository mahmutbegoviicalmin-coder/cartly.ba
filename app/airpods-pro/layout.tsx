import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight:  ["200", "300", "400", "500", "600"],
  display: "swap",
  variable: "--font-airpods",
});

export default function AirPodsLayout({ children }: { children: ReactNode }) {
  return <div className={`${inter.variable} ${inter.className}`}>{children}</div>;
}
