"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Banknote, ShieldCheck,
  ArrowRight, CheckCircle2, Zap, Headphones,
  Star, Flame,
} from "lucide-react";
import PageContainer  from "@/components/ui/PageContainer";
import SectionWrapper from "@/components/ui/SectionWrapper";

const ACCENT = "#FF6B00";

// ─── Data ──────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    slug:      "/radne-patike",
    category:  "Radna obuća",
    name:      "Radne Patike S3",
    image:     "/images/product-1.webp",
    price:     "59,90 KM",
    oldPrice:  "99,90 KM",
    discount:  40,
    hot:       true,
  },
  {
    slug:      "/kamera",
    category:  "Video nadzor",
    name:      "V380 Pro 12MP Kamera",
    image:     "/images/kamere.png",
    price:     "129,90 KM",
    oldPrice:  "149,90 KM",
    discount:  13,
    hot:       false,
  },
  {
    slug:      "/milwaukee-busilica",
    category:  "Profesionalni alat",
    name:      "Milwaukee M18 Bušilica",
    image:     "/images/milw2.webp",
    price:     "69,90 KM",
    oldPrice:  "299,90 KM",
    discount:  77,
    hot:       true,
  },
  {
    slug:      "/zvucnik",
    category:  "Bluetooth audio",
    name:      "ZQS-6239 Bluetooth Zvučnik",
    image:     "/images/zvucnik/zvucnik1.webp",
    price:     "59,90 KM",
    oldPrice:  "99,90 KM",
    discount:  40,
    hot:       false,
  },
  {
    slug:      "/brusilica",
    category:  "Profesionalni alat",
    name:      "Akumulatorska Brusilica",
    image:     "/images/brusilica.webp",
    price:     "74,90 KM",
    oldPrice:  "159,90 KM",
    discount:  53,
    hot:       true,
  },
];

const SHOE_BENEFITS = [
  "Čelična kapica S3 klase za maksimalnu zaštitu",
  "Anti-slip đon za stabilnost na svakoj površini",
  "Lagan i udoban model za nošenje cijeli dan",
  "Otporan materijal koji traje godinama",
];

const WHY_US = [
  {
    Icon:  Zap,
    title: "Brza isporuka",
    desc:  "Sve narudžbe isporučujemo u roku 24–48 sati direktno na vašu adresu.",
    color: "#3B82F6",
    bg:    "rgba(59,130,246,0.08)",
  },
  {
    Icon:  ShieldCheck,
    title: "Garantovan kvalitet",
    desc:  "Svaki proizvod prolazi provjeru kvaliteta prije nego što napusti skladište.",
    color: ACCENT,
    bg:    "rgba(255,107,0,0.08)",
  },
  {
    Icon:  Banknote,
    title: "Plaćanje pouzećem",
    desc:  "Plaćate tek kada preuzmete paket — bez kartice, bez rizika.",
    color: "#16A34A",
    bg:    "rgba(22,163,74,0.08)",
  },
  {
    Icon:  Headphones,
    title: "Podrška korisnicima",
    desc:  "Naš tim je tu za sva pitanja i pomoć — prije i nakon narudžbe.",
    color: "#7C3AED",
    bg:    "rgba(124,58,237,0.08)",
  },
];

const REVIEWS = [
  {
    name:    "Amar K.",
    city:    "Sarajevo",
    rating:  5,
    product: "Radne Patike S3",
    text:    "Naručio sam patike i stigle su već sutradan. Kvalitet je odličan, čelična kapica je solidna i udobne su cijeli dan. Svaka preporuka!",
  },
  {
    name:    "Mirela H.",
    city:    "Tuzla",
    rating:  5,
    product: "Bluetooth Zvučnik",
    text:    "Zvučnik je stigao dobro upakovan, zvuk je zaista snažan za tu cijenu. Poklonila sam mužu i bio je oduševljen. Definitivno kupujem opet.",
  },
  {
    name:    "Edin M.",
    city:    "Mostar",
    rating:  5,
    product: "V380 Pro Kamera",
    text:    "Kamera radi odlično, instalacija je bila jednostavna. Slika je oštra i noćni vid je bolji nego što sam očekivao za ovu cijenu.",
  },
];

// ─── Root export ───────────────────────────────────────────────────────────────

export default function HomeSections() {
  return (
    <div>
      <FeaturedProducts />
      <FeaturedShoes />
      <WhyChooseUs />
      <ReviewsSection />
      <FinalCTA />
    </div>
  );
}

// ─── 1. Featured products ──────────────────────────────────────────────────────

function FeaturedProducts() {
  return (
    <SectionWrapper bg="white" spacing="md">
      <PageContainer>
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: ACCENT }}>
            Naši proizvodi
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-[#0F0F0F] tracking-tight leading-tight mb-3">
            Istaknuti proizvodi
          </h2>
          <p className="text-base text-gray-500 max-w-md mx-auto leading-relaxed">
            Pažljivo odabrani proizvodi koji kombinuju kvalitet, cijenu i praktičnost.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </PageContainer>
    </SectionWrapper>
  );
}

function ProductCard({
  slug, category, name, image, price, oldPrice, discount, hot,
}: (typeof PRODUCTS)[0]) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   "#FFFFFF",
        borderRadius: 20,
        border:       "1px solid rgba(0,0,0,0.07)",
        overflow:     "hidden",
        transform:    hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow:    hovered
          ? "0 16px 48px rgba(0,0,0,0.11)"
          : "0 2px 12px rgba(0,0,0,0.05)",
        transition:   "transform 240ms ease, box-shadow 240ms ease",
        position:     "relative",
        display:      "flex",
        flexDirection: "column",
      }}
    >
      {/* Discount badge */}
      <div style={{
        position:     "absolute",
        top:          14,
        right:        14,
        background:   "#FF3A00",
        color:        "#FFFFFF",
        fontSize:     12,
        fontWeight:   800,
        borderRadius: 8,
        padding:      "4px 9px",
        zIndex:       2,
        letterSpacing: "0.01em",
      }}>
        -{discount}%
      </div>

      {/* Hot badge */}
      {hot && (
        <div style={{
          position:    "absolute",
          top:         14,
          left:        14,
          background:  ACCENT,
          color:       "#FFFFFF",
          fontSize:    11,
          fontWeight:  700,
          borderRadius: 8,
          padding:     "4px 9px",
          zIndex:      2,
          display:     "flex",
          alignItems:  "center",
          gap:         4,
        }}>
          <Flame size={11} strokeWidth={2.5} />
          Akcija
        </div>
      )}

      {/* Image */}
      <Link href={slug} style={{ display: "block", textDecoration: "none" }}>
        <div style={{
          background:     "#FFFFFF",
          borderRadius:   "18px 18px 0 0",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "28px 24px",
          aspectRatio:    "4 / 3",
          overflow:       "hidden",
          position:       "relative",
        }}>
          <Image
            src={image}
            alt={name}
            fill
            style={{ objectFit: "contain", padding: "16px" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: "20px 20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
        <span style={{
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color:         "#AAAAAA",
          marginBottom:  6,
          display:       "block",
        }}>
          {category}
        </span>

        <Link href={slug} style={{ textDecoration: "none" }}>
          <h3 style={{
            fontSize:     15,
            fontWeight:   700,
            color:        "#0F0F0F",
            lineHeight:   1.35,
            marginBottom: 14,
          }}>
            {name}
          </h3>
        </Link>

        {/* Price — always inline, never wraps */}
        <div className="flex items-end gap-2 flex-nowrap mb-4 overflow-hidden">
          <span className="text-[19px] font-extrabold leading-none whitespace-nowrap shrink-0" style={{ color: ACCENT }}>
            {price}
          </span>
          <span className="text-[12.5px] font-medium leading-none text-gray-300 line-through whitespace-nowrap shrink-0 mb-px">
            {oldPrice}
          </span>
        </div>

        {/* CTA */}
        <CardCTA href={slug} />
      </div>
    </div>
  );
}

function CardCTA({ href }: { href: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            7,
        background:     hovered ? "linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)" : "#0F0F0F",
        color:          "#FFFFFF",
        fontWeight:     700,
        fontSize:       13.5,
        borderRadius:   12,
        padding:        "12px 0",
        textDecoration: "none",
        transition:     "background 240ms ease, box-shadow 240ms ease",
        boxShadow:      hovered ? "0 6px 20px rgba(255,80,0,0.35)" : "none",
        marginTop:      "auto",
        fontFamily:     "inherit",
      }}
    >
      Naruči odmah
      <ArrowRight
        size={14}
        strokeWidth={2.5}
        style={{
          transform:  hovered ? "translateX(2px)" : "translateX(0)",
          transition: "transform 220ms ease",
        }}
      />
    </Link>
  );
}

// ─── 2. Featured shoes ─────────────────────────────────────────────────────────

function FeaturedShoes() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <SectionWrapper bg="neutral" spacing="md">
      <PageContainer>
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Image side */}
        <div style={{ flex: "0 0 48%", position: "relative" }} className="w-full">
          <div style={{
            borderRadius: 28,
            overflow:     "hidden",
            background:   "#FFFFFF",
            border:       "1px solid rgba(0,0,0,0.07)",
            boxShadow:    "0 8px 48px rgba(0,0,0,0.09)",
            position:     "relative",
            aspectRatio:  "1 / 1",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            padding:      "48px",
          }}>
            {/* Glow */}
            <div style={{
              position:   "absolute",
              inset:      "20%",
              borderRadius: "50%",
              background: ACCENT,
              opacity:    0.06,
              filter:     "blur(60px)",
            }} />
            <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", zIndex: 1 }}>
              <Image
                src="/images/patike-hero.png"
                alt="Radne Patike S3"
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 1024px) 90vw, 560px"
              />
            </div>
          </div>

          {/* Floating price tag */}
          <div style={{
            position:     "absolute",
            bottom:       24,
            right:        -16,
            background:   "#FFFFFF",
            borderRadius: 16,
            border:       "1px solid rgba(0,0,0,0.07)",
            boxShadow:    "0 8px 32px rgba(0,0,0,0.10)",
            padding:      "14px 20px",
            display:      "flex",
            alignItems:   "center",
            gap:          10,
          }}
          className="hidden lg:flex"
          >
            <div style={{
              width:          40,
              height:         40,
              borderRadius:   12,
              background:     "rgba(255,107,0,0.10)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
            }}>
              <ShieldCheck size={18} color={ACCENT} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 600, marginBottom: 1 }}>Cijena</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#0F0F0F" }}>59,90 KM</span>
                <span style={{ fontSize: 12, color: "#BBBBBB", textDecoration: "line-through" }}>99,90 KM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Text side */}
        <div style={{ flex: 1, maxWidth: 520 }} className="w-full">
          <span style={{
            display:       "inline-block",
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         ACCENT,
            marginBottom:  16,
          }}>
            Istaknuti proizvod
          </span>

          <h2 style={{
            fontSize:      "clamp(30px, 3.8vw, 48px)",
            fontWeight:    800,
            color:         "#0F0F0F",
            letterSpacing: "-0.025em",
            lineHeight:    1.1,
            marginBottom:  20,
          }}>
            Radna obuća koja podnosi svaki izazov.
          </h2>

          <p style={{
            fontSize:     16,
            color:        "#6B6B6B",
            lineHeight:   1.7,
            marginBottom: 32,
            fontWeight:   400,
          }}>
            Dizajnirane za profesionalce koji ne mogu dozvoliti greške. Čvrstoća, zaštita i udobnost u jednom paru.
          </p>

          {/* Benefits */}
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 14 }}>
            {SHOE_BENEFITS.map((b) => (
              <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <CheckCircle2 size={18} color="#16A34A" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 15, color: "#2A2A2A", fontWeight: 500, lineHeight: 1.5 }}>{b}</span>
              </li>
            ))}
          </ul>

          {/* Price row (mobile visible) */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }} className="lg:hidden">
            <span style={{ fontSize: 28, fontWeight: 800, color: "#0F0F0F" }}>59,90 KM</span>
            <span style={{ fontSize: 15, color: "#BBBBBB", textDecoration: "line-through" }}>99,90 KM</span>
          </div>

          <Link
            href="/radne-patike"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            10,
              background:     "linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)",
              color:          "#FFFFFF",
              fontWeight:     700,
              fontSize:       15,
              borderRadius:   14,
              padding:        "16px 32px",
              textDecoration: "none",
              transform:      pressed ? "scale(0.96)" : hovered ? "scale(1.04)" : "scale(1)",
              boxShadow:      hovered
                ? "0 10px 32px rgba(255,80,0,0.42), 0 2px 8px rgba(255,80,0,0.22)"
                : "0 4px 18px rgba(255,80,0,0.30)",
              filter:         hovered ? "brightness(1.06)" : "brightness(1)",
              transition:     "all 240ms ease-out",
              fontFamily:     "inherit",
            }}
          >
            Naruči odmah
            <ArrowRight
              size={17}
              strokeWidth={2.5}
              style={{
                transform:  hovered ? "translateX(3px)" : "translateX(0)",
                transition: "transform 240ms ease-out",
              }}
            />
          </Link>
        </div>
      </div>
      </PageContainer>
    </SectionWrapper>
  );
}

// ─── 3. Why choose us ──────────────────────────────────────────────────────────

function WhyChooseUs() {
  return (
    <SectionWrapper bg="white" spacing="md">
      <PageContainer>

        <div className="text-center mb-10 md:mb-12">
          <span style={{
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         ACCENT,
            display:       "block",
            marginBottom:  12,
          }}>
            Zašto Cartly
          </span>
          <h2 style={{
            fontSize:      "clamp(28px, 3.5vw, 42px)",
            fontWeight:    800,
            color:         "#0F0F0F",
            letterSpacing: "-0.025em",
            lineHeight:    1.1,
          }}>
            Kupovina bez kompromisa.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {WHY_US.map(({ Icon, title, desc, color, bg }) => (
            <WhyCard key={title} Icon={Icon} title={title} desc={desc} color={color} bg={bg} />
          ))}
        </div>
      </PageContainer>
    </SectionWrapper>
  );
}

function WhyCard({ Icon, title, desc, color, bg }: {
  Icon: React.ElementType; title: string; desc: string; color: string; bg: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   "#FFFFFF",
        border:       "1px solid rgba(0,0,0,0.07)",
        borderRadius: 20,
        padding:      "28px 24px",
        transform:    hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow:    hovered ? "0 12px 36px rgba(0,0,0,0.09)" : "0 2px 10px rgba(0,0,0,0.04)",
        transition:   "transform 220ms ease, box-shadow 220ms ease",
      }}
    >
      <div style={{
        width:          52,
        height:         52,
        borderRadius:   16,
        background:     bg,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        marginBottom:   20,
      }}>
        <Icon size={22} color={color} strokeWidth={2} />
      </div>
      <h3 style={{
        fontSize:     16,
        fontWeight:   700,
        color:        "#0F0F0F",
        marginBottom: 10,
        lineHeight:   1.3,
      }}>
        {title}
      </h3>
      <p style={{
        fontSize:   14,
        color:      "#777777",
        lineHeight: 1.65,
        fontWeight: 400,
      }}>
        {desc}
      </p>
    </div>
  );
}

// ─── 4. Reviews ────────────────────────────────────────────────────────────────

function ReviewsSection() {
  return (
    <SectionWrapper bg="neutral" spacing="md">
      <PageContainer>

        <div className="text-center mb-10 md:mb-12">
          <span style={{
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         ACCENT,
            display:       "block",
            marginBottom:  12,
          }}>
            Recenzije
          </span>
          <h2 style={{
            fontSize:      "clamp(28px, 3.5vw, 42px)",
            fontWeight:    800,
            color:         "#0F0F0F",
            letterSpacing: "-0.025em",
            lineHeight:    1.1,
            marginBottom:  12,
          }}>
            Šta kažu naši kupci.
          </h2>
          <p style={{ fontSize: 16, color: "#777", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
            Hiljade zadovoljnih kupaca širom Bosne i Hercegovine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.name} {...r} />
          ))}
        </div>
      </PageContainer>
    </SectionWrapper>
  );
}

function ReviewCard({ name, city, rating, product, text }: (typeof REVIEWS)[0]) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   "#FFFFFF",
        borderRadius: 20,
        border:       "1px solid rgba(0,0,0,0.07)",
        padding:      "28px",
        transform:    hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow:    hovered ? "0 12px 36px rgba(0,0,0,0.09)" : "0 2px 10px rgba(0,0,0,0.04)",
        transition:   "transform 220ms ease, box-shadow 220ms ease",
        display:      "flex",
        flexDirection: "column",
        gap:          16,
      }}
    >
      {/* Stars */}
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={16} fill="#FF6B00" color="#FF6B00" strokeWidth={0} />
        ))}
      </div>

      {/* Quote */}
      <p style={{
        fontSize:   15,
        color:      "#333333",
        lineHeight: 1.68,
        fontWeight: 400,
        flex:       1,
      }}>
        &ldquo;{text}&rdquo;
      </p>

      {/* Author */}
      <div style={{
        display:    "flex",
        alignItems: "center",
        gap:        12,
        paddingTop: 16,
        borderTop:  "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width:          40,
          height:         40,
          borderRadius:   "50%",
          background:     `rgba(255,107,0,0.10)`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          fontSize:       15,
          fontWeight:     700,
          color:          ACCENT,
        }}>
          {name.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F0F0F" }}>{name}</div>
          <div style={{ fontSize: 12, color: "#AAAAAA", fontWeight: 500 }}>{city} · {product}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{
            fontSize:     10,
            fontWeight:   700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color:        "#16A34A",
            background:   "rgba(22,163,74,0.09)",
            borderRadius: 6,
            padding:      "4px 8px",
          }}>
            Verificiran
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 5. Final CTA ──────────────────────────────────────────────────────────────

function FinalCTA() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <section style={{ background: "#FFFFFF", padding: "24px 24px 80px" }}>
      <div
        style={{
          maxWidth:     1320,
          margin:       "0 auto",
          borderRadius: 28,
          background:   "#1a1a1a",
          padding:      "72px 48px",
          textAlign:    "center",
          position:     "relative",
          overflow:     "hidden",
        }}
      >
        {/* Accent glow */}
        <div style={{
          position:     "absolute",
          top:          "50%",
          left:         "50%",
          transform:    "translate(-50%, -50%)",
          width:        600,
          height:       300,
          borderRadius: "50%",
          background:   ACCENT,
          opacity:      0.06,
          filter:       "blur(100px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{
            display:       "inline-block",
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:         ACCENT,
            marginBottom:  20,
          }}>
            Cartly · Bosna i Hercegovina
          </span>

          <h2 style={{
            fontSize:      "clamp(30px, 4.5vw, 54px)",
            fontWeight:    800,
            color:         "#FFFFFF",
            letterSpacing: "-0.03em",
            lineHeight:    1.1,
            marginBottom:  20,
            maxWidth:      700,
            margin:        "0 auto 20px",
          }}>
            Sve što trebaš, na jednom mjestu.
          </h2>

          <p style={{
            fontSize:     16,
            color:        "rgba(255,255,255,0.55)",
            lineHeight:   1.7,
            maxWidth:     480,
            margin:       "0 auto 40px",
            fontWeight:   400,
          }}>
            Ekspresna dostava, plaćanje pouzećem i provjeren kvalitet na svakom koraku.
          </p>

          <Link
            href="/proizvodi"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            10,
              background:     "linear-gradient(135deg, #FF7A20 0%, #FF5000 100%)",
              color:          "#FFFFFF",
              fontWeight:     700,
              fontSize:       16,
              borderRadius:   16,
              padding:        "18px 40px",
              textDecoration: "none",
              transform:      pressed ? "scale(0.96)" : hovered ? "scale(1.05)" : "scale(1)",
              boxShadow:      hovered
                ? "0 12px 40px rgba(255,80,0,0.50), 0 2px 8px rgba(255,80,0,0.30)"
                : "0 6px 24px rgba(255,80,0,0.35)",
              filter:         hovered ? "brightness(1.08)" : "brightness(1)",
              transition:     "all 240ms ease-out",
              fontFamily:     "inherit",
            }}
          >
            Pogledaj sve proizvode
            <ArrowRight
              size={18}
              strokeWidth={2.5}
              style={{
                transform:  hovered ? "translateX(3px)" : "translateX(0)",
                transition: "transform 240ms ease-out",
              }}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
