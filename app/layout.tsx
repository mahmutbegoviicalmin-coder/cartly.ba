import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Radne Patike S3 — Tactical Black | Cartly.ba",
  description: "Profesionalna zaštitna obuća S3 s čeličnom kapicom i BOA sistemom zatvaranja. Samo 59,90 KM. Naruči online, plaćanje pouzećem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs" className={inter.variable}>
      <body className="antialiased bg-white text-black font-sans">
        {children}
      </body>
    </html>
  );
}
