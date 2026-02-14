import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { MapPin, Navigation, Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- DISTANCE CALCULATOR ---------------- */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const cardAnim = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.6 },
  }),
};

const NearbyNGOs = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [sortMode, setSortMode] = useState("distance");

  /* ---------------- GET USER LOCATION ---------------- */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserLocation(location);
        loadNGOs(location);
      },
      () => {
        console.warn("Location denied");
        loadNGOs(null);
      }
    );
  }, []);

  useEffect(() => {
    loadNGOs(userLocation);
  }, [sortMode]);

  /* ---------------- LOAD NGOs ---------------- */
  const loadNGOs = async (location: any) => {
    const { data } = await supabase
      .from("ngos")
      .select(`
        id,
        name,
        city,
        description,
        verified,
        rating,
        total_reviews,
        latitude,
        longitude,
        created_at,
        updated_at
      `)
      .eq("verified", true);

    if (!data || data.length === 0) {
      setNgos([]);
      return;
    }

    let list = [...data];

    /* -------- DISTANCE -------- */
    if (location) {
      list = list.map((ngo: any) => ({
        ...ngo,
        distance:
          ngo.latitude && ngo.longitude
            ? calculateDistance(
                location.latitude,
                location.longitude,
                ngo.latitude,
                ngo.longitude
              )
            : null,
      }));
    }

    /* -------- SMART PRIORITY SORT -------- */
    list.sort((a: any, b: any) => {
      // 1️⃣ Highest rating
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      if (ratingA !== ratingB) return ratingB - ratingA;

      // 2️⃣ Profile completeness score
      const score = (ngo: any) => {
        let s = 0;
        if (ngo.city) s++;
        if (ngo.description) s++;
        if (ngo.latitude && ngo.longitude) s++;
        if (ngo.total_reviews > 0) s++;
        return s;
      };

      const scoreA = score(a);
      const scoreB = score(b);
      if (scoreA !== scoreB) return scoreB - scoreA;

      // 3️⃣ Joined first (older first)
      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
    });

    /* -------- SORT MODE OVERRIDE -------- */
    if (sortMode === "distance" && location) {
      list.sort((a: any, b: any) => (a.distance ?? 9999) - (b.distance ?? 9999));
    }

    if (sortMode === "rating") {
      list.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    if (sortMode === "reviews") {
      list.sort(
        (a: any, b: any) => (b.total_reviews ?? 0) - (a.total_reviews ?? 0)
      );
    }

    setNgos(list.slice(0, 3)); // Only top 3
  };

  const openDirections = (ngo: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4">
            🌍 Trusted NGOs Near You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Showing verified NGOs ranked by quality & profile strength.
          </p>
        </div>

        {/* FILTER */}
        <div className="flex justify-center gap-4 mb-10">
          <Button
            variant={sortMode === "distance" ? "default" : "outline"}
            onClick={() => setSortMode("distance")}
          >
            Nearest
          </Button>

          <Button
            variant={sortMode === "rating" ? "default" : "outline"}
            onClick={() => setSortMode("rating")}
          >
            Top Rated
          </Button>

          <Button
            variant={sortMode === "reviews" ? "default" : "outline"}
            onClick={() => setSortMode("reviews")}
          >
            Most Reviewed
          </Button>
        </div>

        {/* LIST */}
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {ngos.map((ngo, i) => (
              <motion.div
                key={ngo.id}
                custom={i}
                initial="hidden"
                animate="show"
                variants={cardAnim}
              >
                <Card className="rounded-2xl overflow-hidden border">
                  <CardContent className="p-6 flex justify-between">

                    <div className="flex-1">
                      <h3 className="font-bold text-xl flex gap-2 items-center">
                        {ngo.name}
                        <span className="text-green-600 text-sm">
                          ✔ Verified
                        </span>
                      </h3>

                      <div className="text-gray-600 flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4" /> {ngo.city}
                      </div>

                      <p className="mt-2 text-muted-foreground line-clamp-2">
                        {ngo.description}
                      </p>

                      <div className="flex gap-6 text-sm mt-3 text-gray-700">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {ngo.total_reviews ?? 0} reviews
                        </div>
                        <div>⭐ {ngo.rating ?? 0}/5</div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Joined {new Date(ngo.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {ngo.distance && (
                        <p className="mt-3 text-green-700 font-medium">
                          📍 {ngo.distance.toFixed(2)} km away
                        </p>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg"
                        onClick={() => openDirections(ngo)}
                      >
                        <Navigation className="h-4 w-4" /> Directions
                      </button>

                      <Link to={`/ngo/${ngo.id}`}>
                        <button className="px-4 py-2 rounded-lg bg-primary text-white">
                          View Details
                        </button>
                      </Link>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mt-12">
          <Link to="/nearby-ngos">
            <Button size="lg" variant="outline">
              <MapPin className="mr-2 h-5 w-5" />
              View All NGOs
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default NearbyNGOs;
