import Header from "@/components/Header";
import HomeHero from "@/components/HomeHero";
import HomeSections from "@/components/HomeSections";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HomeHero />
        <HomeSections />
      </main>
      <Footer />
    </>
  );
}
