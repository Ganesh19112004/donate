import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Users, ArrowLeft } from "lucide-react";

export default function NearbyNGOsPage() {
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    loadAllNGOs();
  }, []);

  const loadAllNGOs = async () => {
    const { data } = await supabase
      .from("ngos")
      .select("id, name, city, state, description, verified, total_reviews, rating, image_url")
      .order("created_at", { ascending: false });

    setNgos(data || []);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">

        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Nearby NGOs</h1>
        </div>

        <div className="space-y-6">
          {ngos.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-white shadow-md rounded-xl p-6 flex justify-between border hover:shadow-lg transition"
            >
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {ngo.name}
                  {ngo.verified && (
                    <span className="text-blue-600 text-sm">✔ Verified</span>
                  )}
                </h2>

                <p className="text-gray-600 text-sm">
                  {ngo.description || "No description provided"}
                </p>

                <div className="flex gap-4 mt-3 text-gray-500 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {ngo.city}
                  </span>

                  {ngo.total_reviews > 0 && (
                    <span>⭐ {ngo.rating}/5</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
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
