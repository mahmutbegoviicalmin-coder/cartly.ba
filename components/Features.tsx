import {
  ShieldCheck,
  Zap,
  Droplets,
  Feather,
  Settings,
  Grip,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: "Čelična kapica",
    text: "Štiti prste od udara i pritiska težih predmeta. Certificirano po EN ISO 20345 S3 standardu.",
  },
  {
    icon: Zap,
    title: "Kevlar đon",
    text: "Čavli, šarafi i oštri predmeti prolaze kroz pod ali ne i do vaše noge. Maksimalna zaštita odozdo.",
  },
  {
    icon: Droplets,
    title: "Vodootporne",
    text: "Mokri teren, blato i kiša ne mogu ništa. Noge ostaju suhe tokom cijelog radnog dana.",
  },
  {
    icon: Feather,
    title: "Ultralagane",
    text: "Nosite ih cijeli dan bez umora. Lakše od klasičnih zaštitnih cipela i veća produktivnost.",
  },
  {
    icon: Settings,
    title: "BOA sistem",
    text: "Jedno okretanje dugmeta i patika savršeno pristaje na nogu. Brzo, precizno i bez pertli.",
  },
  {
    icon: Grip,
    title: "Anti-klizajući đon",
    text: "SRC sertifikat. Ulje, voda i mokra podloga ne mogu ništa. Grip koji drži na svakom koraku.",
  },
];

export default function Features() {
  return (
    <section className="bg-[#F5F5F5] border-t border-black/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-10 lg:mb-14 text-[#0A0A0A]">
          Zašto Radne Patike <span className="text-[#FF6B00]">S3?</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-black/10 p-6 flex flex-col gap-4 hover:border-[#FF6B00]/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} strokeWidth={1.8} className="text-[#FF6B00]" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1.5 text-[#0A0A0A]">{title}</h3>
                <p className="text-sm text-black/55 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
