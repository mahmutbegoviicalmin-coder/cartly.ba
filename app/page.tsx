import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import CTABanner from "@/components/CTABanner";
import Features from "@/components/Features";
import Gallery from "@/components/Gallery";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import OrderForm from "@/components/OrderForm";
import Footer from "@/components/Footer";
import SocialProof from "@/components/SocialProof";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <CTABanner />
        <Features />
        <CTABanner />
        <Gallery />
        <Reviews />
        <CTABanner />
        <FAQ />
        <CTABanner />
        <OrderForm />
      </main>
      <Footer />
      <SocialProof />
    </>
  );
}
