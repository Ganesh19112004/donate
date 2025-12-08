import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, ArrowUpRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Distance Formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lat2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function NearbyNGOs() {
  const [ngos, setNgos] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {}
    );

    loadNGOs();

    const channel = supabase
      .channel("realtime-ngos")
      .on("postgres_changes", { event: "*", schema: "public", table: "ngos" }, () => {
        loadNGOs();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const loadNGOs = async () => {
    const { data } = await supabase
      .from("ngos")
      .select(`id,name,city,state,image_url,description,verified,total_reviews,rating,latitude,longitude`)
      .order("created_at", { ascending: false });

    if (data) {
      if (userLocation) {
        data.forEach((ngo) => {
          ngo.distance = getDistance(
            userLocation.latitude,
            userLocation.longitude,
            ngo.latitude,
            ngo.longitude
          );
        });

        data.sort((a, b) => (a.distance ?? 999999) - (b.distance ?? 999999));
      }

      setNgos(data.slice(0, 4));
      setLoading(false);
    }
  };

  const openNGODetails = (id) => {
    if (!user) {
      navigate("/auth?role=donor&redirect=ngo/" + id);
      return;
    }
    navigate(`/ngo/${id}`);
  };

  // STAGGER CARD REVEAL
  const cardAnim = {
    hidden: { opacity: 0, y: 40 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.5 },
    }),
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-2">Nearby NGOs</h2>
          <p className="text-muted-foreground text-lg">
            Automatically sorted by closest to you.
          </p>
        </motion.div>

        {/* LIST */}
        <div className="space-y-6 max-w-4xl mx-auto">

          {/* LOADING SKELETON */}
          {loading && (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-xl" />
            ))
          )}

          <AnimatePresence>
            {!loading && ngos.map((ngo, i) => (
              <motion.div
                key={ngo.id}
                custom={i}
                variants={cardAnim}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 16px 30px rgba(0,0,0,0.12)",
                }}
                className="bg-white rounded-xl border shadow-sm p-5 flex items-center gap-4 transition"
              >
                {/* IMAGE */}
                <motion.img
                  src={ngo.image_url || "/placeholder.png"}
                  className="w-20 h-20 object-cover rounded-lg border"
                  whileHover={{ scale: 1.05 }}
                />

                {/* DETAILS */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {ngo.name}
                    {ngo.verified && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2.2 }}
                        className="text-green-600 text-sm font-medium"
                      >
                        ✔ Verified
                      </motion.span>
                    )}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {ngo.description}
                  </p>

                  <div className="flex gap-4 mt-2 text-gray-500 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {ngo.city || "Unknown"}
                    </span>

                    {ngo.distance && (
                      <motion.span
                        className="text-green-700 font-medium"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        📍 {ngo.distance.toFixed(1)} km
                      </motion.span>
                    )}

                    {ngo.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {ngo.rating}/5 ({ngo.total_reviews})
                      </span>
                    )}
                  </div>
                </div>

                {/* BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  onClick={() => openNGODetails(ngo.id)}
                >
                  {user ? "View" : "Sign Up"}
                  <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* VIEW ALL */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex justify-center mt-12"
        >
          <Link to="/nearby-ngos">
            <Button size="lg" variant="outline" className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              View All Nearby NGOs
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
