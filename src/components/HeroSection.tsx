import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const HeroSection = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    partnerNGOs: 0,
    totalDonors: 0,
    totalVolunteers: 0,
    totalCities: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: donations } = await supabase.from("donations").select("id");
    const { data: ngos } = await supabase.from("ngos").select("id, city");
    const { data: donors } = await supabase.from("donors").select("id");
    const { data: volunteers } = await supabase.from("volunteers").select("id");

    const uniqueCities =
      ngos?.reduce((set, ngo) => {
        if (ngo.city) set.add(ngo.city.trim().toLowerCase());
        return set;
      }, new Set()) || new Set();

    setStats({
      totalDonations: donations?.length || 0,
      partnerNGOs: ngos?.length || 0,
      totalDonors: donors?.length || 0,
      totalVolunteers: volunteers?.length || 0,
      totalCities: uniqueCities.size || 0,
    });
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 gradient-subtle"></div>

      <div className="container relative mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="space-y-8"
          >
            <motion.div variants={fadeUp} className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Connecting you to
                <span className="text-primary block">local NGOs</span>
                that need your help
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Make a direct impact in your community by donating exactly what NGOs need most.
                Every contribution matters—big or small.
              </p>
            </motion.div>

            {/* BUTTONS */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/donor/create-donation">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    size="lg"
                    className="gradient-hero text-primary-foreground shadow-warm transition-bounce"
                  >
                    Start Donating
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>

              <Link to="/nearby-ngos">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="transition-smooth hover:bg-accent"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Find Nearby NGOs
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* STATS */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6"
            >
              {[
                { label: "Donations", value: stats.totalDonations },
                { label: "Partner NGOs", value: stats.partnerNGOs },
                { label: "Cities Covered", value: stats.totalCities },
                { label: "Donors", value: stats.totalDonors },
                { label: "Volunteers", value: stats.totalVolunteers },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { delay: i * 0.12 } },
                  }}
                  className="text-center p-4 rounded-xl bg-white shadow hover:shadow-lg transition-smooth"
                >
                  <div className="text-3xl font-bold text-primary">
                    {item.value}+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </motion.div>

          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            whileHover={{ scale: 1.03 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-warm">
              <motion.img
                src={heroImage}
                alt="Community helping NGOs"
                className="w-full h-[500px] object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.8 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
