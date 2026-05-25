import ProductPageHeader from "@/components/ProductPageHeader";
import TickerBar from "@/components/TickerBar";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import VideoSection from "@/components/VideoSection";
import B2BSection from "@/components/B2BSection";
import Features from "@/components/Features";
import OrderForm from "@/components/OrderForm";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import SocialProof from "@/components/SocialProof";
import PixelEvents from "@/components/PixelEvents";

export default function RadnePatike() {
  return (
    <>
      <ProductPageHeader ctaHref="#order" />
      <TickerBar />
      <main>
        <Hero />
        <StatsBar />
        <VideoSection />
        <B2BSection />
        <Features />
        <OrderForm />
        <Reviews />
        <FAQ />
      </main>
      <Footer />
      <FloatingCTA />
      <SocialProof />
      <PixelEvents />
    </>
  );
}
