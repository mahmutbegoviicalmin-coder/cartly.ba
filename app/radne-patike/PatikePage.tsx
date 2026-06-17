"use client";

import { useState } from "react";
import ProductPageHeader from "@/components/ProductPageHeader";
import Hero from "@/components/Hero";
import QuickOrderCTA from "@/components/QuickOrderCTA";
import VideoSection from "@/components/VideoSection";
import Reviews from "@/components/Reviews";
import B2BSection from "@/components/B2BSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import OrderModal from "@/components/OrderModal";
import PixelEvents from "@/components/PixelEvents";
import SocialProof from "@/components/SocialProof";

export default function PatikePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined);

  const openModal = (size?: number) => {
    setSelectedSize(size);
    setModalOpen(true);
  };

  return (
    <>
      <ProductPageHeader onOrder={() => openModal()} />
      <main>
        <Hero onOrder={() => openModal()} />
        <QuickOrderCTA />
        <VideoSection />
        <Reviews />
        <B2BSection />
        <FAQ />
      </main>
      <Footer />
      <FloatingCTA onOrder={() => openModal()} />
      <OrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialSize={selectedSize}
      />
      <SocialProof />
      <PixelEvents />
    </>
  );
}
