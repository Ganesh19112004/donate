import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Star } from "lucide-react";

/* ⭐ Reusable Star Component */
const Stars = ({ value = 0, size = 16 }) => {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-0.5 text-yellow-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= rounded ? "#facc15" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
};

export default function NearbyNGOsPage() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllNGOs();
  }, []);

  const loadAllNGOs = async () => {
    const { data } = await supabase
      .from("ngos")
      .select(
        `
        id,
        name,
        city,
        state,
        description,
        verified,
        total_reviews,
        rating,
        image_url
      `
      )
      .order("created_at", { ascending: false });

    setNgos(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Nearby NGOs</h1>
        </div>

        {/* LIST */}
        <div className="space-y-6">

          {loading && (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-28 rounded-xl"
              />
            ))
          )}

          {!loading &&
            ngos.map((ngo) => (
              <div
                key={ngo.id}
                className="bg-white shadow-md rounded-xl p-6 flex justify-between gap-4 border hover:shadow-lg transition"
              >
                {/* LEFT */}
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {ngo.name}
                    {ngo.verified && (
                      <span className="text-blue-600 text-sm font-medium">
                        ✔ Verified
                      </span>
                    )}
                  </h2>

                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {ngo.description || "No description provided"}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {ngo.city || "Unknown"}
                    </span>

                    <div className="flex items-center gap-2">
                      <Stars value={ngo.rating || 0} />
                      <span className="text-gray-600">
                        {ngo.rating || "0.0"} ({ngo.total_reviews || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center">
                  <Link to={`/ngo/${ngo.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}
