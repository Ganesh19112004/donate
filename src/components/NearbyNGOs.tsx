import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { MapPin, Navigation, Clock, Users } from "lucide-react";

// Distance calculation (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const NearbyNGOs = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);

  // 1️⃣ Get current user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        alert("Unable to detect your location. Showing default NGOs.");
      }
    );
  }, []);

  // 2️⃣ Load NGOs from DB
  useEffect(() => {
    if (userLocation) {
      loadNGOs();
    }
  }, [userLocation]);

  const loadNGOs = async () => {
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
        total_reviews,
        latitude,
        longitude
      `);

    if (!error && data) {
      // 3️⃣ Add distance for each NGO
      const ngosWithDistance = data
        .map((ngo) => {
          if (ngo.latitude && ngo.longitude) {
            ngo.distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              ngo.latitude,
              ngo.longitude
            );
          } else {
            ngo.distance = null;
          }
          return ngo;
        })
        // Sort by nearest first
        .sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999))
        // Limit 4 for homepage
        .slice(0, 4);

      setNgos(ngosWithDistance);
    }
  };

  // 4️⃣ Google Maps direction generator
  const openDirections = (ngo: any) => {
    if (!ngo.latitude || !ngo.longitude) {
      alert("NGO does not have a valid location.");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}`;
    window.open(url, "_blank");
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
            Automatically detect nearby NGOs and start helping instantly.
          </p>
        </div>

        {/* List */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4 mb-8">
            
            {ngos.map((ngo) => (
              <Card key={ngo.id} className="transition-smooth hover:shadow-soft border rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg flex items-center gap-1">
                          {ngo.name}
                          {ngo.verified && <span className="text-blue-600 text-sm">✔ Verified</span>}
                        </h3>

                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {ngo.city}
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-3">
                        {ngo.description || "No description available."}
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

                      {/* Distance */}
                      {ngo.distance && (
                        <p className="mt-2 text-sm text-green-700 font-medium">
                          📍 {ngo.distance.toFixed(2)} km away
                        </p>
                      )}
                    </div>

                    {/* RIGHT BUTTONS */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDirections(ngo)}
                      >
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

          {/* View All */}
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
