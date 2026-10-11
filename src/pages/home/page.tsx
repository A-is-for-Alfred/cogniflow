import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import HeroSection from "./components/HeroSection";
import FeatureCards from "./components/FeatureCards";
import CTASection from "./components/CTASection";
import AudienceSection from "./components/AudienceSection";
import StatsSection from "./components/StatsSection";
import ArticlesSection from "./components/ArticlesSection";
import BrandsSection from "./components/BrandsSection";

export default function Home() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#F9F6FF" }}>
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />
        <CTASection />
        <AudienceSection />
        <StatsSection />
        <ArticlesSection />
        <BrandsSection />
      </main>
      <Footer />
    </div>
  );
}
