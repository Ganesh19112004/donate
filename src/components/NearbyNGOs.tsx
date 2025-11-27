import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { MapPin, Navigation, Clock, Users } from "lucide-react";

const NearbyNGOs = () => {
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    loadNearbyNGOs();
  }, []);

  const loadNearbyNGOs = async () => {
    const { data, error } = await supabase
      .from("ngos")
      .select(`
        id,
        name,
        city,
        state,
        description,
        verified,
        rating,
        total_reviews
      `)
      .order("created_at", { ascending: false })
      .limit(4); // show only 4 on homepage

    if (!error && data) {
      setNgos(data);
    }
  };

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            NGOs Near You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find trusted NGOs in your area that need immediate support.
            Helping locally creates the strongest impact.
          </p>
        </div>

        {/* NGOs List */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4 mb-8">
            {ngos.map((ngo) => (
              <Card
                key={ngo.id}
                className="transition-smooth hover:shadow-soft border rounded-xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* LEFT SIDE — NGO Info */}
                    <div className="flex-1">
                      {/* Title + Distance */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {ngo.name}
                          {ngo.verified && (
                            <span className="text-blue-600 text-sm">✔ Verified</span>
                          )}
                        </h3>

                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {ngo.city}
                        </div>
                      </div>

                      {/* Short description */}
                      <p className="text-muted-foreground mb-3">
                        {ngo.description || "This NGO has not provided details yet."}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {ngo.total_reviews || 0} reviews
                        </div>

                        {ngo.rating && (
                          <div className="flex items-center">
                            ⭐ {ngo.rating}/5
                          </div>
                        )}

                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Updated recently
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE — Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                      </Button>

                      <Link to={`/ngo/${ngo.id}`}>
                        <Button className="gradient-hero text-primary-foreground">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* VIEW ALL BUTTON */}
          <div className="text-center">
            <Link to="/nearby-ngos">
              <Button size="lg" variant="outline" className="transition-smooth hover:bg-accent">
                <MapPin className="mr-2 h-5 w-5" />
                View All Nearby NGOs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NearbyNGOs;
