"use client";

import {
  Battery, Briefcase, CreditCard, Disc3, Gauge, Hammer, Lightbulb, PlugZap, RotateCcw, ShieldCheck, Truck, Wrench, Zap,
} from "lucide-react";
import ProductLanding, { type LandingConfig } from "@/components/landing/ProductLanding";

const CONFIG: LandingConfig = {
  slug: "milwaukee-set-31",
  pixelName: "Milwaukee Set 3.1",
  contentId: "milwaukee-set-31",
  price: 149,
  oldPrice: 220,
  shipping: 10,
  maxQty: 5,
  api: "/api/milwaukee-set-order",
  nameMode: "split",
  sendExternalId: true,

  accent: "#DB011C",
  accentHover: "#B80017",
  onAccent: "#FFFFFF",
  accentText: "#C8102E",

  kicker: "Milwaukee M18 · Set 3 u 1",
  title: "Tri alata.\nJedan kofer.",
  subtitle: "Bušilica, udarni odvijač i brusilica na istoj bateriji. Dvije baterije od 5.0 Ah i brzi punjač, sve u Milwaukee koferu.",
  heroChips: ["Bušilica", "Udarni odvijač 226 Nm", "Brusilica", "2× baterija 5.0 Ah"],

  trust: [
    { Icon: CreditCard, title: "Plaćanje pouzećem", desc: "Plaćate pri preuzimanju" },
    { Icon: Truck, title: "Dostava 1–2 dana", desc: "Cijela BiH, 10 KM" },
    { Icon: RotateCcw, title: "Povrat 14 dana", desc: "Bez rizika" },
    { Icon: Briefcase, title: "Milwaukee kofer", desc: "Sve na jednom mjestu" },
  ],

  kit: {
    title: "Sve za posao.\nU jednom koferu.",
    text: "Otvorite kofer i krenite: tri alata, dvije baterije i punjač. Jedna baterija pogoni sve.",
    image: "/landing/ms3-kit.webp",
    imageSm: "/landing/ms3-kit-sm.webp",
    items: [
      { Icon: Hammer, title: "Bušilica / odvijač", note: "Podesivi moment i LED svjetlo" },
      { Icon: Zap, title: "Udarni odvijač", note: "Do 226 Nm za tvrde šarafe" },
      { Icon: Disc3, title: "Brusilica", note: "Rezanje i brušenje metala i keramike" },
      { Icon: Battery, title: "2× baterija 5.0 Ah", note: "M18 platforma, dug rad" },
      { Icon: PlugZap, title: "Brzi punjač", note: "Spremno za sljedeći posao" },
      { Icon: Briefcase, title: "Kofer i pribor", note: "Bočna ručka, štitnik, ključ" },
    ],
  },

  perf: {
    kicker: "Snaga Milwaukee M18",
    title: "Buši. Šarafi.\nReže.",
    text: "Jedna baterija za sva tri alata. Dok jednom radite, druga se puni, pa posao ne staje.",
    stats: [
      { value: "226", label: "Nm momenta udarnog odvijača" },
      { value: "5.0", label: "Ah po bateriji, dvije u setu" },
      { value: "3", label: "alata na istoj bateriji" },
    ],
  },

  features: [
    { Icon: Gauge, title: "Kontrola momenta", desc: "Precizno šarafljenje bez oštećenja materijala." },
    { Icon: Lightbulb, title: "LED svjetlo", desc: "Vidite gdje bušite i u tamnim uglovima." },
    { Icon: Wrench, title: "Za kuću i teren", desc: "Od namještaja do gradilišta, jedan set." },
    { Icon: ShieldCheck, title: "Čvrst kofer", desc: "Alat je zaštićen u autu i na poslu." },
  ],

  reviews: [
    { name: "Edin H.", city: "Zenica", text: "Set je stigao za dva dana. Udarni odvijač je zvijer, brusilica radi kao prava. Za ovu cijenu nema greške." },
    { name: "Mirza K.", city: "Sarajevo", text: "Najviše mi znači što sve ide na istu bateriju. Kofer je čvrst, sve uredno složeno." },
    { name: "Adnan S.", city: "Tuzla", text: "Kupio za vikendicu i radove po kući. Baterije traju cijeli dan, preporuka." },
  ],

  faq: [
    { q: "Šta tačno dobijam u setu?", a: "Bušilicu/odvijač, udarni odvijač, brusilicu, dvije baterije od 5.0 Ah, brzi punjač i pribor (bočna ručka, štitnik i ključ), sve u Milwaukee koferu." },
    { q: "Da li sva tri alata rade na istu bateriju?", a: "Da. Obje baterije odgovaraju svim alatima u setu, pa možete raditi jednom dok se druga puni." },
    { q: "Kako plaćam?", a: "Pouzećem. Plaćate kuriru kad paket stigne, ništa ne plaćate unaprijed." },
    { q: "Koliko košta i koliko traje dostava?", a: "Dostava je 10,00 KM i traje 1–2 radna dana na području cijele BiH." },
    { q: "Šta se dešava nakon narudžbe?", a: "Narudžba je automatski zaprimljena čim je pošaljete, bez poziva i dodatne potvrde. Paket šaljemo odmah." },
    { q: "Mogu li vratiti set?", a: "Da, u roku od 14 dana od preuzimanja, ako je set nekorišten i u originalnom pakovanju." },
  ],

  countdownKey: "ms3_cdown_end",
  toastLabel: "Milwaukee Set 3.1",
};

export default function MilwaukeeSetClient() {
  return <ProductLanding c={CONFIG} />;
}
