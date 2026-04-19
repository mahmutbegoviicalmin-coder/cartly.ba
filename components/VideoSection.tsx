"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ShieldCheck, Zap, Droplets, Feather, Settings, Grip } from "lucide-react";
import { event } from "@/lib/fbpixel";

const VIDEO_ID = "079Ngl6w5eQ";

const features = [
  { Icon: ShieldCheck, text: "Čelična kapica certificirana po EN ISO 20345 S3" },
  { Icon: Zap,         text: "Kevlar đon — zaštita od proboja do 1.100 N" },
  { Icon: Droplets,    text: "Vodootporna membrana — noge ostaju suhe" },
  { Icon: Feather,     text: "Svega 650g — upola lakše od klasičnih zaštitnih cipela" },
  { Icon: Settings,    text: "BOA sistem — precizno podešavanje za 3 sekunde" },
  { Icon: Grip,        text: "SRC anti-klizajući đon — grip na svakoj podlozi" },
];

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section style={{ background: "#111111", padding: "80px 0" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 64,
        }}
        className="video-section-inner"
      >

        {/* LEFT — VIDEO */}
        <div
          style={{ flex: "0 0 45%", display: "flex", justifyContent: "center" }}
          className="video-col"
        >
          <div
            style={{
              width: "100%",
              maxWidth: 340,
              aspectRatio: "9 / 16",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              position: "relative",
              background: "#000",
            }}
          >
            {playing ? (
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
              />
            ) : (
              <>
                <Image
                  src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                  alt="Video recenzija — Radne Patike S3"
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <button
                  onClick={() => setPlaying(true)}
                  aria-label="Pokreni video"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "rgba(255,107,0,0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "videoPulse 2s ease-in-out infinite",
                    }}
                  >
                    <Play size={28} color="#fff" fill="#fff" strokeWidth={0} style={{ marginLeft: 3 }} />
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT — CONTENT */}
        <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", gap: 0 }} className="content-col">

          {/* Badge */}
          <span
            style={{
              display: "inline-block",
              width: "fit-content",
              background: "rgba(255,107,0,0.15)",
              color: "#FF6B00",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: 50,
              marginBottom: 20,
            }}
          >
            Video recenzija
          </span>

          {/* Title */}
          <h2
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 40,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Vidi ih<span style={{ color: "#FF6B00" }}> uživo</span>
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 16,
              color: "#888888",
              marginBottom: 0,
              lineHeight: 1.5,
            }}
          >
            Svaki detalj koji nije vidljiv na slici.
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: "#1F1F1F", margin: "24px 0" }} />

          {/* Feature rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
            {features.map(({ Icon, text }) => (
              <div
                key={text}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 8px", borderRadius: 8, transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,107,0,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={20} color="#FF6B00" strokeWidth={2} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#fff",
                    lineHeight: 1.4,
                  }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href="#order"
            onClick={() => event("AddToCart", { content_name: "Radne Patike S3 Tactical Black", value: 59.90, currency: "BAM" })}
            style={{
              display: "block",
              textAlign: "center",
              background: "#FF6B00",
              color: "#fff",
              fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: 8,
              padding: "16px",
              transition: "background 0.15s",
              marginBottom: 12,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#E85E00"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FF6B00"; }}
          >
            Naruči sada
          </a>

          {/* Below CTA */}
          <p
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 12,
              color: "#555",
              textAlign: "center",
              margin: 0,
            }}
          >
            Dostava Euro Express &bull; 1–3 radna dana
          </p>
        </div>
      </div>

    </section>
  );
}
