import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NearbyNGOs() {
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    loadNGOs();
  }, []);

  const loadNGOs = async () => {
    const { data, error } = await supabase
      .from("ngos")
      .select("id, name, city, state, image_url, description, verified, total_reviews, rating")
      .order("created_at", { ascending: false })
      .limit(4); // 🔥 Show only top 4 on homepage

    if (!error) setNgos(data || []);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">NGOs Near You</h2>
        <p className="text-center text-gray-600 mb-10">
          Local NGOs that need support in your area.
        </p>

        {/* NGO LIST */}
        <div className="space-y-6">
          {ngos.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between border hover:shadow-xl transition"
            >
              {/* Left Side — NGO Info */}
              <div>
                <h3 className="font-semibold text-xl flex items-center gap-2">
                  {ngo.name}
                  {ngo.verified && (
                    <span className="text-blue-600 text-sm">✔ Verified</span>
                  )}
                </h3>

                <p className="text-gray-600 text-sm">{ngo.description || "No description available"}</p>

                <div className="flex gap-4 mt-3 text-gray-500 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {ngo.city}
                  </span>

                  {ngo.total_reviews > 0 && (
                    <span className="flex items-center gap-1">
                      ⭐ {ngo.rating}/5 ({ngo.total_reviews} reviews)
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side — Buttons */}
              <div className="flex gap-2">
                <Link to={`/ngo/${ngo.id}`}>
                  <Button variant="default">View Details</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA BUTTON */}
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
