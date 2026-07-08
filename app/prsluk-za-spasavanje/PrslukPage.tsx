"use client";

import { useEffect, useState } from "react";
import { event } from "@/lib/fbpixel";
import Header from "./components/Header";
import UrgencyBar from "./components/UrgencyBar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import WhyChoose from "./components/WhyChoose";
import Gallery from "./components/Gallery";
import Sizes from "./components/Sizes";
import Colors from "./components/Colors";
import Benefits from "./components/Benefits";
import Reviews from "./components/Reviews";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import FloatingCTA from "./components/FloatingCTA";
import SocialProof from "./components/SocialProof";
import OrderModal from "./components/OrderModal";

const SIZE_PRICES: Record<string, number> = { S: 42, M: 45, "3XL": 49 };
const BASE_PRICE = 42;

export default function PrslukPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingSize, setPendingSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("Narandžasta");

  useEffect(() => {
    event("ViewContent", {
      content_name: "Sigurnosni Prsluk za Spašavanje",
      content_ids: ["prsluk-spasavanje"],
      content_type: "product",
      value: BASE_PRICE,
      currency: "BAM",
    });
  }, []);

  const openOrder = (size?: string) => {
    event("AddToCart", {
      content_name: "Sigurnosni Prsluk za Spašavanje",
      content_ids: ["prsluk-spasavanje"],
      content_type: "product",
      value: size ? SIZE_PRICES[size] : BASE_PRICE,
      currency: "BAM",
    });
    setPendingSize(size ?? null);
    setModalOpen(true);
  };

  return (
    <>
      <Header onOrder={() => openOrder()} />
      <main>
        <UrgencyBar />
        <Hero onOrder={() => openOrder()} />
        <TrustBar />
        <WhyChoose />
        <Gallery />
        <Sizes onOrder={(size) => openOrder(size)} />
        <Colors selected={selectedColor} onSelect={setSelectedColor} />
        <Benefits />
        <Reviews />
        <FAQ />
        <FinalCTA onOrder={() => openOrder()} />
      </main>

      <FloatingCTA onOrder={() => openOrder()} />
      <SocialProof />
      <OrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialSize={pendingSize}
        initialColor={selectedColor}
      />
    </>
  );
}
