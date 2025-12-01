import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Distance Formula (Haversine)
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

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

    // LIVE REALTIME LISTENER
    const channel = supabase
      .channel("realtime-ngos")
      .on("postgres_changes", { event: "*", schema: "public", table: "ngos" }, () => {
        loadNGOs();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const loadNGOs = async () => {
    const { data, error } = await supabase
      .from("ngos")
      .select(`
        id,
        name,
        city,
        state,
        image_url,
        description,
        verified,
        total_reviews,
        rating,
        latitude,
        longitude
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // If user allowed GPS → calculate distance
      if (userLocation) {
        data.forEach((ngo) => {
          ngo.distance = getDistance(
            userLocation.latitude,
            userLocation.longitude,
            ngo.latitude,
            ngo.longitude
          );
        });

        // Sort by nearest first
        data.sort((a, b) => (a.distance ?? 999999) - (b.distance ?? 999999));
      }

      setNgos(data.slice(0, 4)); // show only top 4
    }
  };

  const openNGODetails = (id: string) => {
    if (!user) {
      navigate("/login?redirect=ngo/" + id);
      return;
    }
    navigate(`/ngo/${id}`);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">

        <h2 className="text-3xl font-bold text-center mb-2">Nearby NGOs</h2>
        <p className="text-center text-gray-600 mb-10">
          Discover NGOs close to your area and support them instantly.
        </p>

        {/* LIST */}
        <div className="grid gap-6">
          {ngos.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg border p-5 flex items-center justify-between transition"
            >
              {/* IMAGE */}
              <img
                src={ngo.image_url || "/placeholder.png"}
                className="w-20 h-20 rounded-lg object-cover border"
              />

              {/* DETAILS */}
              <div className="flex-1 px-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {ngo.name}
                  {ngo.verified && (
                    <span className="text-blue-600 text-sm">✔ Verified</span>
                  )}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-2">
                  {ngo.description || "This NGO has not added details yet."}
                </p>

                <div className="flex gap-4 mt-3 text-gray-500 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {ngo.city || "Unknown"}
                  </span>

                  {ngo.distance && (
                    <span className="text-green-600">
                      {ngo.distance.toFixed(1)} km away
                    </span>
                  )}

                  {ngo.rating && (
                    <span>
                      ⭐ {ngo.rating}/5 ({ngo.total_reviews})
                    </span>
                  )}
                </div>
              </div>

              {/* BUTTON */}
              <Button
                onClick={() => openNGODetails(ngo.id)}
                className="flex items-center gap-2"
              >
                {user ? "View Details" : "Login to View"}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* VIEW ALL */}
        <div className="flex justify-center mt-10">
          <Link to="/nearby-ngos">
            <Button size="lg" variant="outline" className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              View All Nearby NGOs
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
