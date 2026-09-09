"use client";

import { useCallback, useRef } from "react";
import Footer from "@/components/Footer";
import SawHeader from "./components/SawHeader";
import ProductHero from "./components/ProductHero";
import TrustCards from "./components/TrustCards";
import SpecGrid from "./components/Specifications";
import ExplodedView from "./components/ExplodedView";
import FeatureStory from "./components/FeatureStory";
import Reviews from "./components/Reviews";
import FAQ from "./components/FAQ";
import OrderSection from "./components/OrderSection";
import FloatingCTA from "./components/FloatingCTA";
import RecentOrderNotification from "./components/RecentOrderNotification";
import { ORDER_TOTAL, PRODUCT_ID, PRODUCT_NAME, PRODUCT_PRICE } from "./product";
import { trackAddToCart, trackInitiateCheckout } from "@/lib/analytics";

export default function MotornaPilaClient() {
  const checkoutSent = useRef(false);
  const cartSent = useRef(false);

  const fireCheckout = useCallback(() => {
    if (checkoutSent.current) return;
    checkoutSent.current = true;
    trackInitiateCheckout({
      id: PRODUCT_ID,
      name: PRODUCT_NAME,
      category: "Alati",
      value: ORDER_TOTAL,
    });
  }, []);

  const fireAddToCart = useCallback(() => {
    if (cartSent.current) return;
    cartSent.current = true;
    trackAddToCart({
      id: PRODUCT_ID,
      name: PRODUCT_NAME,
      category: "Alati",
      value: PRODUCT_PRICE,
    });
  }, []);

  const goToForm = useCallback(() => {
    fireAddToCart();
    document.getElementById("naruci")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [fireAddToCart]);

  return (
    <div className="mp">
      <SawHeader onOrder={goToForm} />
      <ProductHero onOrder={goToForm} />
      <TrustCards />
      <SpecGrid />
      <ExplodedView />
      <FeatureStory />
      <Reviews />
      <FAQ />
      <OrderSection onReady={fireCheckout} />
      <Footer />
      <FloatingCTA onOrder={goToForm} />
      <RecentOrderNotification />
    </div>
  );
}
