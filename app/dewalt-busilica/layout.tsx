import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";

const sora = Sora({
  weight:   ["600", "700", "800"],
  subsets:  ["latin"],
  variable: "--font-sora",
  display:  "swap",
});

const inter = Inter({
  weight:   ["400", "500", "600"],
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

export const metadata: Metadata = {
  title:       "DeWalt 28V XR Bušilica — Kompletan Set | Cartly.ba",
  description: "DeWalt 28V XR akumulatorska bušilica sa 2 baterije, punjačem i kompletnim setom alata u tvrdom koferu. Dostava 1–3 dana po cijeloj BiH.",
};

export default function DeWaltLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${sora.variable} ${inter.variable}`}
      style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
    >
      {children}
    </div>
  );
}
