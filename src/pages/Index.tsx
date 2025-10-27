import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import HowItWorks from "@/components/how-it-works";
import PharmacistCallToAction from "@/components/pharmacist-call-to-action";
import Footer from "@/components/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8">
        <HeroSection />
        <HowItWorks />
        <PharmacistCallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
