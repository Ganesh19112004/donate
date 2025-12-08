import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { MapPin, Navigation, Clock, Users, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
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
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.6 },
  }),
};

const NearbyNGOs = () => {
  const [ngos, setNgos] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const [sortMode, setSortMode] = useState("distance");

  // Geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        console.warn("Location denied");
      }
    );
  }, []);

  // Load DB
  useEffect(() => {
    if (userLocation) loadNGOs();
  }, [userLocation]);

  const loadNGOs = async () => {
    const { data } = await supabase
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

    let list = data || [];

    list = list.map((ngo) => {
      if (ngo.latitude && ngo.longitude && userLocation) {
        ngo.distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          ngo.latitude,
          ngo.longitude
        );
      }
      return ngo;
    });

    if (sortMode === "distance")
      list.sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));
    if (sortMode === "rating")
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sortMode === "reviews")
      list.sort((a, b) => (b.total_reviews ?? 0) - (a.total_reviews ?? 0));

    setNgos(list.slice(0, 4));
  };

  const openDirections = (ngo) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50 relative">
      <div className="container mx-auto px-4">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold mb-4">
            🌍 NGOs Near You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We detect your location & sort NGOs automatically by nearest.
          </p>
        </motion.div>

        {/* FILTER BAR */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
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
        </motion.div>

        {/* LIST */}
        <div className="max-w-4xl mx-auto space-y-6">

          <AnimatePresence>
            {ngos.map((ngo, i) => (
              <motion.div
                key={ngo.id}
                custom={i}
                initial="hidden"
                whileInView="show"
                variants={cardAnim}
                viewport={{ once: true }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                }}
              >
                <Card className="rounded-2xl overflow-hidden border">
                  <CardContent className="p-6 flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex-1">
                      <h3 className="font-bold text-xl flex gap-2 items-center">
                        {ngo.name}
                        {ngo.verified && (
                          <span className="text-green-600 text-sm font-medium">
                            ✔ Verified
                          </span>
                        )}
                      </h3>

                      <div className="text-gray-600 flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4" /> {ngo.city}
                      </div>

                      <p className="mt-2 text-muted-foreground line-clamp-2">
                        {ngo.description}
                      </p>

                      {/* Stats */}
                      <div className="flex gap-6 text-sm mt-3 text-gray-700">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {ngo.total_reviews} reviews
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
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3 text-green-700 font-medium flex items-center gap-1"
                        >
                          📍 {ngo.distance.toFixed(2)} km away
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1.8 }}
                          >
                            🔔
                          </motion.span>
                        </motion.p>
                      )}
                    </div>

                    {/* RIGHT BUTTONS */}
                    <div className="ml-4 flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg"
                        onClick={() => openDirections(ngo)}
                      >
                        <Navigation className="h-4 w-4" /> Directions
                      </motion.button>

                      <Link to={`/ngo/${ngo.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-4 py-2 rounded-lg bg-primary text-white"
                        >
                          View Details
                        </motion.button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link to="/nearby-ngos">
            <Button size="lg" variant="outline" className="hover:bg-primary/10">
              <MapPin className="mr-2 h-5 w-5" />
              View All Nearby NGOs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NearbyNGOs;
