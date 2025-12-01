import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";
import { Link } from "react-router-dom";

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
    // Count Donations
    const { data: donations } = await supabase
      .from("donations")
      .select("id");

    // Count NGOs
    const { data: ngos } = await supabase
      .from("ngos")
      .select("id, city");

    // Count Donors
    const { data: donors } = await supabase
      .from("donors")
      .select("id");

    // Count Volunteers
    const { data: volunteers } = await supabase
      .from("volunteers")
      .select("id");

    // Unique Cities
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
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Connecting you to
                <span className="text-primary block">local NGOs</span>
                that need your help
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Make a direct impact in your community by donating exactly what NGOs need most.
                Every contribution matters—big or small.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/donor/create-donation">
                <Button
                  size="lg"
                  className="gradient-hero text-primary-foreground shadow-warm transition-bounce hover:scale-105"
                >
                  Start Donating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/nearby-ngos">
                <Button
                  variant="outline"
                  size="lg"
                  className="transition-smooth hover:bg-accent"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Find Nearby NGOs
                </Button>
              </Link>
            </div>

            {/* REAL-TIME STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6">

              <div className="text-center p-4 rounded-xl bg-white shadow">
                <div className="text-3xl font-bold text-primary">
                  {stats.totalDonations}+
                </div>
                <div className="text-sm text-muted-foreground">Donations</div>
              </div>

              <div className="text-center p-4 rounded-xl bg-white shadow">
                <div className="text-3xl font-bold text-primary">
                  {stats.partnerNGOs}+
                </div>
                <div className="text-sm text-muted-foreground">Partner NGOs</div>
              </div>

              <div className="text-center p-4 rounded-xl bg-white shadow">
                <div className="text-3xl font-bold text-primary">
                  {stats.totalCities}+
                </div>
                <div className="text-sm text-muted-foreground">Cities Covered</div>
              </div>

              <div className="text-center p-4 rounded-xl bg-white shadow">
                <div className="text-3xl font-bold text-primary">
                  {stats.totalDonors}+
                </div>
                <div className="text-sm text-muted-foreground">Donors</div>
              </div>

              <div className="text-center p-4 rounded-xl bg-white shadow">
                <div className="text-3xl font-bold text-primary">
                  {stats.totalVolunteers}+
                </div>
                <div className="text-sm text-muted-foreground">Volunteers</div>
              </div>

            </div>
          </div>

          {/* IMAGE */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-warm">
              <img
                src={heroImage}
                alt="Community helping NGOs"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
