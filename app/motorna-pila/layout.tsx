import type { ReactNode } from "react";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./motorna.css";

const display = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

export default function MotornaPilaLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable} ${body.className}`}>
      {children}
    </div>
  );
}
