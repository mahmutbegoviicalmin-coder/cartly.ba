"use client";

import {
  Battery, Box, Briefcase, CreditCard, Gauge, Lightbulb, PlugZap, RotateCcw, Truck, Wrench, Zap,
} from "lucide-react";
import ProductLanding, { type LandingConfig } from "@/components/landing/ProductLanding";

const CONFIG: LandingConfig = {
  slug: "milwaukee-busilica",
  pixelName: "Milwaukee M18 bušilica",
  contentId: "milwaukee-m18-busilica",
  price: 69.9,
  oldPrice: 179.9,
  shipping: 10,
  maxQty: 1,
  api: "/api/narudzba",
  nameMode: "single",

  accent: "#DB011C",
  accentHover: "#B80017",
  onAccent: "#FFFFFF",
  accentText: "#C8102E",

  kicker: "Milwaukee M18 · Brushless",
  title: "Milwaukee M18\nbušilica.",
  subtitle: "Bez četkica, snažna i lagana. S baterijom i punjačem u tvrdom koferu, spremna za rad čim je otvorite.",
  heroChips: ["Brushless motor", "Baterija i punjač", "Tvrdi kofer"],
  gallery: [
    { src: "/images/milw4.webp", alt: "Milwaukee M18 bušilica sa strane" },
    { src: "/images/milw2.webp", alt: "Steznu glavu bušilice izbliza" },
    { src: "/images/milw3.webp", alt: "Ručka i ležište baterije" },
  ],

  trust: [
    { Icon: CreditCard, title: "Plaćanje pouzećem", desc: "Plaćate pri preuzimanju" },
    { Icon: Truck, title: "Dostava 1–2 dana", desc: "Cijela BiH, 10 KM" },
    { Icon: RotateCcw, title: "Povrat 14 dana", desc: "Bez rizika" },
    { Icon: Briefcase, title: "Tvrdi kofer", desc: "Za kuću i teren" },
  ],

  kit: {
    title: "Otvorite kofer.\nI radite.",
    text: "Bušilica, baterije i punjač dolaze složeni u kofer, pa je sve uvijek na jednom mjestu.",
    image: "/landing/mlw-case.webp",
    imageSm: "/landing/mlw-case-sm.webp",
    items: [
      { Icon: Wrench, title: "Bušilica M18", note: "Brushless motor, dvije brzine" },
      { Icon: Battery, title: "M18 baterije", note: "Litij-ionske, dug rad" },
      { Icon: PlugZap, title: "Punjač", note: "Uključen u set" },
      { Icon: Box, title: "Tvrdi kofer", note: "Sve uredno složeno" },
    ],
  },

  perf: {
    kicker: "Brushless motor",
    title: "Više snage.\nManje trošenja.",
    text: "Motor bez četkica troši manje baterije i duže traje. Za zid, drvo i metal, kod kuće i na gradilištu.",
    stats: [
      { value: "18V", label: "M18 platforma" },
      { value: "2", label: "brzine za bušenje i šarafljenje" },
      { value: "LED", label: "svjetlo za tamne uglove" },
    ],
  },

  features: [
    { Icon: Zap, title: "Brushless", desc: "Veća efikasnost, duži vijek, manje održavanja." },
    { Icon: Gauge, title: "Podesivi moment", desc: "Šarafite precizno, bez oštećenja materijala." },
    { Icon: Lightbulb, title: "LED svjetlo", desc: "Vidite gdje bušite i u tamnim prostorima." },
    { Icon: Briefcase, title: "Kompaktna", desc: "Lagana u ruci, stane i u uske prostore." },
  ],

  details: [
    { src: "/images/milw2.webp", title: "Metalna stezna glava", text: "Čvrsto drži burgiju i kod jačeg pritiska." },
    { src: "/images/milw3.webp", title: "Gumirana ručka", text: "Sigurno drži i nakon cijelog dana rada." },
    { src: "/images/milw1.webp", title: "Kompaktno tijelo", text: "Stane u uske prostore i lako se nosi." },
    { src: "/images/milw4.webp", title: "M18 ležište baterije", text: "Baterija klikne na mjesto i drži čvrsto." },
  ],

  reviews: [
    { name: "Amel B.", city: "Bihać", text: "Za ovu cijenu nisam očekivao ovakvu snagu. Zid buši bez problema, a baterija traje." },
    { name: "Nermin Ć.", city: "Mostar", text: "Stigla za dan i po, u koferu sve uredno. Žena kaže da je najbolja kupovina ove godine." },
    { name: "Damir P.", city: "Doboj", text: "Koristim je za montažu namještaja i sitne radove. Lagana, tiha i jaka." },
  ],

  faq: [
    { q: "Da li bušilica dolazi s baterijom?", a: "Da, u setu su baterija i punjač. Bušilica je odmah spremna za upotrebu." },
    { q: "Koliko traje baterija?", a: "Pri normalnoj upotrebi 2–3 sata rada. Punjenje traje oko 60 minuta." },
    { q: "Je li pogodna za kućnu upotrebu?", a: "Da, idealna je za kuću i renoviranje: montaža namještaja, bušenje zidova, šarafljenje." },
    { q: "Kako plaćam i koliko je dostava?", a: "Plaćate pouzećem kuriru pri preuzimanju. Dostava je 10,00 KM i traje 1–2 radna dana po cijeloj BiH." },
    { q: "Šta se dešava nakon narudžbe?", a: "Narudžba je automatski zaprimljena čim je pošaljete, bez poziva i dodatne potvrde. Paket šaljemo odmah." },
    { q: "Mogu li vratiti proizvod?", a: "Da, u roku od 14 dana od prijema, ako je nekorišten i u originalnoj ambalaži." },
  ],

  countdownKey: "milw_cdown_end",
  toastLabel: "Milwaukee M18 bušilica",
};

export default function BusilicaClient() {
  return <ProductLanding c={CONFIG} />;
}
