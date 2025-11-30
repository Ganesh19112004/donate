import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart,
  MapPin,
  Star,
  Globe,
  CheckCircle,
  Trash2,
  ArrowLeft,
} from "lucide-react";

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("recent");

  // ----------------------------
  // Load Favorite NGOs
  // ----------------------------
  useEffect(() => {
    const donor = JSON.parse(localStorage.getItem("user") || "{}");

    const loadFavorites = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("favorite_ngos")
        .select(
          `
          id,
          ngo_id,
          created_at,
          ngos (
            id,
            name,
            city,
            state,
            country,
            image_url,
            rating,
            total_reviews,
            verified,
            website
          )
        `
        )
        .eq("donor_id", donor.id)
        .order("created_at", { ascending: false });

      if (!error) setFavorites(data || []);
      setLoading(false);
    };

    loadFavorites();
  }, []);

  // ----------------------------
  // Remove Favorite NGO
  // ----------------------------
  const removeFavorite = async (favId: string) => {
    if (!confirm("Remove this NGO from favorites?")) return;

    const { error } = await supabase
      .from("favorite_ngos")
      .delete()
      .eq("id", favId);

    if (!error) {
      setFavorites((prev) => prev.filter((f) => f.id !== favId));
    }
  };

  // ----------------------------
  // Sorting Logic
  // ----------------------------
  const sortedFavorites = [...favorites].sort((a, b) => {
    if (sort === "recent") return b.created_at.localeCompare(a.created_at);
    return a.ngos.name.localeCompare(b.ngos.name);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl border">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            <Heart className="text-red-500" /> My Favorite NGOs
          </h1>
        </div>

        {/* Sort Dropdown */}
        <div className="flex justify-end mb-4">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border p-2 rounded-md"
          >
            <option value="recent">Sort: Recently Added</option>
            <option value="az">Sort: A → Z (Name)</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500 py-10">Loading favorites...</p>
        )}

        {/* Empty State */}
        {!loading && favorites.length === 0 && (
          <div className="text-center py-12">
            <Heart size={50} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-700 text-lg">You haven't added any favorites yet.</p>
            <Link
              to="/donor/view-ngos"
              className="text-blue-600 underline mt-2 inline-block"
            >
              Browse NGOs →
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {sortedFavorites.map((fav) => {
            const ngo = fav.ngos;

            return (
              <div
                key={fav.id}
                className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow hover:shadow-md transition-all"
              >
                <div className="flex gap-4">

                  {/* Image */}
                  <img
                    src={ngo.image_url || "/placeholder.png"}
                    className="w-24 h-24 rounded-lg object-cover border"
                  />

                  <div className="flex-1">
                    {/* Name */}
                    <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                      {ngo.name}
                      {ngo.verified && (
                        <CheckCircle size={18} className="text-green-600" />
                      )}
                    </h2>

                    {/* Rating */}
                    <p className="flex items-center gap-1 text-yellow-600 text-sm">
                      <Star size={16} /> {ngo.rating || "0"} ({ngo.total_reviews || 0})
                    </p>

                    {/* Location */}
                    <p className="flex items-center gap-1 text-gray-700 text-sm">
                      <MapPin size={14} />
                      {ngo.city}, {ngo.state}
                    </p>

                    {/* Website */}
                    {ngo.website && (
                      <a
                        href={ngo.website}
                        target="_blank"
                        className="flex items-center gap-1 text-blue-600 text-sm mt-1"
                      >
                        <Globe size={14} /> Visit Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-4">
                  <Link
                    to={`/donor/ngo/${ngo.id}`}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    View Profile
                  </Link>

                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Favorites;
