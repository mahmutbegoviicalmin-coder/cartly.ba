import ProductPageHeader from "@/components/ProductPageHeader";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import VideoSection from "@/components/VideoSection";
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
      <main>
        <Hero />
        <StatsBar />
        <VideoSection />
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
