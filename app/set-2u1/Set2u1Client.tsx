"use client";

import {
  Battery, Briefcase, CreditCard, Disc3, Gauge, Hammer, PlugZap, RotateCcw, ShieldCheck, Sparkles, Truck, Wrench,
} from "lucide-react";
import ProductLanding, { type LandingConfig } from "@/components/landing/ProductLanding";

const CONFIG: LandingConfig = {
  slug: "set-2u1",
  pixelName: "Set 2 u 1 — Bušilica + Brusilica",
  contentId: "set-2u1",
  price: 104.9,
  oldPrice: 199.9,
  shipping: 10,
  maxQty: 5,
  api: "/api/set2u1-order",
  nameMode: "split",

  accent: "#DB011C",
  accentHover: "#B80017",
  onAccent: "#FFFFFF",
  accentText: "#C8102E",

  kicker: "Set 2 u 1 · Bušilica + brusilica",
  title: "Dva alata.\nJedna cijena.",
  subtitle: "Bušilica i brusilica na istoj bateriji, s dvije baterije, punjačem i koferom. Sve što treba za kuću, vikendicu i radionicu.",
  heroChips: ["Bušilica / odvijač", "Brusilica", "2× baterija", "Kofer"],

  trust: [
    { Icon: CreditCard, title: "Plaćanje pouzećem", desc: "Plaćate pri preuzimanju" },
    { Icon: Truck, title: "Dostava 1–2 dana", desc: "Cijela BiH, 10 KM" },
    { Icon: RotateCcw, title: "Povrat 14 dana", desc: "Bez rizika" },
    { Icon: Sparkles, title: "Spremno za rad", desc: "Raspakuj i kreni" },
  ],

  kit: {
    title: "Sve u setu.\nNema dokupljivanja.",
    text: "Dva alata, dvije baterije i punjač. Sve složeno u kofer, spremno od prvog dana.",
    image: "/landing/s2u-kit.webp",
    imageSm: "/landing/s2u-kit-sm.webp",
    items: [
      { Icon: Hammer, title: "Bušilica / odvijač", note: "Za drvo, metal i zid" },
      { Icon: Disc3, title: "Brusilica", note: "Rezanje i brušenje" },
      { Icon: ShieldCheck, title: "Štitnik i ručka", note: "Za sigurno brušenje" },
      { Icon: Battery, title: "2× baterija", note: "Jedna radi, druga se puni" },
      { Icon: PlugZap, title: "Punjač", note: "Uključen u set" },
      { Icon: Briefcase, title: "Kofer", note: "Za kuću i teren" },
    ],
  },

  valueStack: {
    title: "Dva alata\npo cijeni jednog.",
    items: ["Bušilica / odvijač", "Brusilica sa štitnikom i ručkom", "2× baterija", "Punjač", "Prenosivi kofer"],
  },

  perf: {
    kicker: "Jedna baterija, dva alata",
    title: "Buši. Reže.\nBrusi.",
    text: "Baterija se prebacuje s bušilice na brusilicu u sekundi. Dvije baterije u setu, pa posao ne staje.",
    stats: [
      { value: "2", label: "alata u jednom setu" },
      { value: "2×", label: "baterija za rad bez pauze" },
      { value: "1–2", label: "dana do vaših vrata" },
    ],
  },

  features: [
    { Icon: Gauge, title: "Podesiva snaga", desc: "Šarafljenje i bušenje bez oštećenja materijala." },
    { Icon: Disc3, title: "Brusilica bez kabla", desc: "Režite i brusite gdje god treba, bez produžnog." },
    { Icon: Wrench, title: "Za svaki posao", desc: "Montaža, popravke, renoviranje, radionica." },
    { Icon: Briefcase, title: "Sve u koferu", desc: "Ništa se ne gubi, sve je uvijek pri ruci." },
  ],

  reviews: [
    { name: "Senad M.", city: "Travnik", text: "Uzeo set za vikendicu. Bušilica i brusilica rade odlično, a baterije traju cijeli dan." },
    { name: "Jasmin T.", city: "Brčko", text: "Najbolje mi je što ide na istu bateriju. Za ovu cijenu dobiješ dva alata i kofer." },
    { name: "Kemal D.", city: "Sarajevo", text: "Stiglo za dva dana, sve uredno upakovano. Brusilica reže metal bez problema." },
  ],

  faq: [
    { q: "Šta dobijam u setu?", a: "Bušilicu/odvijač, brusilicu sa štitnikom i ručkom, dvije baterije, punjač i prenosivi kofer." },
    { q: "Da li oba alata rade na istu bateriju?", a: "Da. Obje baterije odgovaraju i bušilici i brusilici." },
    { q: "Kako plaćam?", a: "Pouzećem. Plaćate kuriru kad paket stigne, ništa unaprijed." },
    { q: "Koliko košta i koliko traje dostava?", a: "Dostava je 10,00 KM i traje 1–2 radna dana na području cijele BiH." },
    { q: "Šta se dešava nakon narudžbe?", a: "Narudžba je automatski zaprimljena čim je pošaljete, bez poziva i dodatne potvrde. Paket šaljemo odmah." },
    { q: "Mogu li vratiti set?", a: "Da, u roku od 14 dana od preuzimanja, ako je nekorišten i u originalnom pakovanju." },
  ],

  countdownKey: "s2u_cdown_end",
  toastLabel: "Set 2 u 1, bušilica + brusilica",
};

export default function Set2u1Client() {
  return <ProductLanding c={CONFIG} />;
}
