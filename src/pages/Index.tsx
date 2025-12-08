import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedNGOs from "@/components/FeaturedNGOs";
import NearbyNGOs from "@/components/NearbyNGOs";
import HomeCampaigns from "@/components/HomeCampaigns";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HEADER */}
      <Header />

      {/* MAIN CONTENT */}
      <main className="space-y-20">
        {/* All sections already animated */}
        <HeroSection />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <CategoriesSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <FeaturedNGOs />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <NearbyNGOs />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <HomeCampaigns />
        </motion.div>
      </main>

      {/* CTA SECTION */}
      <motion.section
        className="py-20 bg-gradient-hero text-white text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 80 }}
          >
            Ready to Make a Difference?
          </motion.h2>

          <motion.p
            className="text-lg mb-8 text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Join thousands of donors and NGOs working together to create positive change.
          </motion.p>

          <motion.div whileHover={{ scale: 1.07 }}>
            <Link to="/auth">
              <Button
                variant="secondary"
                size="lg"
                className="shadow-elevated transition-bounce"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="bg-muted py-16">
        <div className="container mx-auto px-4">

          <motion.div
            className="grid md:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >

            {/* Brand Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">DenaSetu</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Connecting communities with local NGOs to create meaningful impact through donations.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-medium">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/how-it-works" className="hover:text-foreground">How it Works</Link></li>
                <li><Link to="/auth?role=ngo" className="hover:text-foreground">NGO Registration</Link></li>
                <li><Link to="/impact" className="hover:text-foreground">Impact Stories</Link></li>
                <li><Link to="/auth?role=volunteer" className="hover:text-foreground">Volunteer</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h4 className="font-medium">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/categories/education" className="hover:text-foreground">Education</Link></li>
                <li><Link to="/categories/healthcare" className="hover:text-foreground">Healthcare</Link></li>
                <li><Link to="/categories/shelter" className="hover:text-foreground">Shelter Support</Link></li>
                <li><Link to="/categories/relief" className="hover:text-foreground">Emergency Relief</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-medium">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
          </motion.div>

          {/* Bottom */}
          <motion.div
            className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <p>&copy; {new Date().getFullYear()} DenaSetu. Making local impact through community donations.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
