import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedNGOs from "@/components/FeaturedNGOs";
import NearbyNGOs from "@/components/NearbyNGOs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HomeCampaigns from "@/components/HomeCampaigns";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ✅ Header Section */}
      <Header />

      {/* ✅ Main content */}
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedNGOs />
        <NearbyNGOs />
        <HomeCampaigns /> 
      </main>

      {/* ✅ CTA Section */}
      <section className="py-20 bg-gradient-hero text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">
            Join thousands of donors and NGOs working together to create positive change.
          </p>
          <Link to="/auth">
            <Button
              variant="secondary"
              size="lg"
              className="shadow-elevated transition-bounce hover:scale-105"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* ✅ Footer Section */}
      <footer className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">DenaSetu</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Connecting communities with local NGOs to create meaningful impact through direct donations.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-medium">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/how-it-works" className="hover:text-foreground transition-smooth">How it Works</Link></li>
                <li><Link to="/ngo-registration" className="hover:text-foreground transition-smooth">NGO Registration</Link></li>
                <li><Link to="/impact" className="hover:text-foreground transition-smooth">Impact Stories</Link></li>
                <li><Link to="/volunteer" className="hover:text-foreground transition-smooth">Volunteer</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h4 className="font-medium">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/categories?type=education" className="hover:text-foreground transition-smooth">Education</Link></li>
                <li><Link to="/categories?type=healthcare" className="hover:text-foreground transition-smooth">Healthcare</Link></li>
                <li><Link to="/categories?type=shelter" className="hover:text-foreground transition-smooth">Shelter Support</Link></li>
                <li><Link to="/categories?type=relief" className="hover:text-foreground transition-smooth">Emergency Relief</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-medium">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-foreground transition-smooth">Contact Us</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-foreground transition-smooth">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-smooth">Terms of Service</Link></li>
                <li><Link to="/faq" className="hover:text-foreground transition-smooth">FAQ</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 DenaSetu. Making local impact through community donations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
