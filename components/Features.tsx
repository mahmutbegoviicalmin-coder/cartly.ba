"use client";

import {
  ShieldCheck, Zap, Droplets, Feather, Settings, Grip,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ACCENT = "#FF6B00";

const features: {
  icon: LucideIcon;
  num: string;
  title: string;
  text: string;
  highlight?: string;
}[] = [
  {
    icon: ShieldCheck,
    num: "01",
    title: "Čelična kapica 200J",
    text: "Certificirana zaštita od udara i pritiska po EN ISO 20345 S3 standardu. Prsti su sigurni i na najtežim radilištima.",
    highlight: "S3 Certifikat",
  },
  {
    icon: Zap,
    num: "02",
    title: "Kevlar đon",
    text: "Čavli, šarafi i oštri predmeti prolaze kroz pod · ali ne i do vaše noge. Zaštita od proboja do 1.100 N.",
    highlight: "1.100 N zaštita",
  },
  {
    icon: Droplets,
    num: "03",
    title: "Vodootporna membrana",
    text: "Mokri teren, blato i kiša ne mogu ništa. Noge ostaju potpuno suhe tokom cijelog radnog dana.",
    highlight: "100% vodonepropusno",
  },
  {
    icon: Feather,
    num: "04",
    title: "Ultralagane · 650g",
    text: "Upola lakše od klasičnih zaštitnih cipela. Nosite ih cijeli dan bez umora i povećajte svoju produktivnost.",
    highlight: "Svega 650g",
  },
  {
    icon: Settings,
    num: "05",
    title: "BOA® Fit System",
    text: "Jedno okretanje dugmeta i patika savršeno pristaje na nogu. Brzo, precizno i bez pertli · za 3 sekunde.",
    highlight: "BOA® tehnologija",
  },
  {
    icon: Grip,
    num: "06",
    title: "Anti-klizajući SRC đon",
    text: "SRC sertifikat. Ulje, voda i mokra podloga ne mogu ništa. Grip koji drži čvrsto na svakom koraku.",
    highlight: "SRC Certifikat",
  },
];

export default function Features() {
  return (
    <section style={{ background: "#fff", borderTop: "1px solid #F0F0F0" }}>

      {/* Header band */}
      <div style={{ background: "#0A0A0A", padding: "52px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(255,107,0,0.15)", color: ACCENT,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", padding: "5px 14px", borderRadius: 4,
            fontFamily: "var(--font-manrope), sans-serif", marginBottom: 18,
          }}>
            Tehnologija i zaštita
          </span>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, letterSpacing: "-0.03em",
              color: "#fff", lineHeight: 1.08, margin: 0,
              fontFamily: "var(--font-manrope), sans-serif",
            }}>
              Zašto Radne Patike <span style={{ color: ACCENT }}>S3?</span>
            </h2>
            <p style={{
              fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 340,
              lineHeight: 1.6, margin: 0,
              fontFamily: "var(--font-manrope), sans-serif",
            }}>
              6 tehnologija zaštite u jednoj lagnoj patici. Ništa slično ne postoji na domaćem tržištu.
            </p>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 24px 64px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}>
          {features.map(({ icon: Icon, num, title, text, highlight }) => (
            <div
              key={title}
              style={{
                background: "#FAFAFA",
                border: "1px solid #EEEEEE",
                borderRadius: 18,
                padding: "28px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "border-color 200ms, box-shadow 200ms, transform 200ms",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "rgba(255,107,0,0.3)";
                el.style.boxShadow   = "0 8px 32px rgba(255,107,0,0.08)";
                el.style.transform   = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#EEEEEE";
                el.style.boxShadow   = "none";
                el.style.transform   = "translateY(0)";
              }}
            >
              {/* Number watermark */}
              <span aria-hidden="true" style={{
                position: "absolute", top: 16, right: 20,
                fontSize: 48, fontWeight: 900, color: "rgba(0,0,0,0.04)",
                fontFamily: "var(--font-manrope), sans-serif",
                letterSpacing: "-0.05em", lineHeight: 1, userSelect: "none",
              }}>
                {num}
              </span>

              {/* Icon circle */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(255,107,0,0.12) 0%, rgba(255,107,0,0.06) 100%)",
                border: "1px solid rgba(255,107,0,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={22} strokeWidth={1.75} color={ACCENT} />
              </div>

              <div>
                <h3 style={{
                  fontSize: 16, fontWeight: 800, color: "#0A0A0A",
                  marginBottom: 8, lineHeight: 1.25,
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  {title}
                </h3>
                <p style={{
                  fontSize: 14, color: "rgba(10,10,10,0.55)", lineHeight: 1.65,
                  margin: 0, fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  {text}
                </p>
              </div>

              {highlight && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 11, fontWeight: 700, color: ACCENT,
                  background: "rgba(255,107,0,0.08)", borderRadius: 20,
                  padding: "4px 12px", letterSpacing: "0.06em", textTransform: "uppercase",
                  width: "fit-content",
                  fontFamily: "var(--font-manrope), sans-serif",
                }}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill={ACCENT}>
                    <circle cx="6" cy="6" r="6"/>
                  </svg>
                  {highlight}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div style={{
          marginTop: 40, borderRadius: 20,
          background: "linear-gradient(135deg, #FF6B00 0%, #E85E00 100%)",
          padding: "28px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 20,
        }}>
          <div>
            <p style={{
              fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 4px",
              fontFamily: "var(--font-manrope), sans-serif", letterSpacing: "-0.02em",
            }}>
              Sve 6 tehnologija · samo 59,90 KM
            </p>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0,
              fontFamily: "var(--font-manrope), sans-serif",
            }}>
              Plaćanje pouzećem · Dostava 1–3 radna dana · Povrat 14 dana
            </p>
          </div>
          <a
            href="#order"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#FF6B00",
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 800, fontSize: 15, textDecoration: "none",
              borderRadius: 12, padding: "14px 28px",
              whiteSpace: "nowrap", letterSpacing: "0.01em",
              boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            }}
          >
            Naruči odmah
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
