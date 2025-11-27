import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { MapPin, Star, Globe, CheckCircle, Image as ImgIcon } from "lucide-react";

const ViewNGOs = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any>({});
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load NGOs
  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("ngos")
      .select(
        `
        id,
        name,
        email,
        phone,
        city,
        state,
        country,
        description,
        verified,
        image_url,
        website,
        rating,
        total_reviews,
        created_at
      `
      )
      .order("rating", { ascending: false });

    if (!error && data.length) {
      setNgos(data);

      // Fetch gallery for each NGO
      data.forEach(async (ngo) => {
        const { data: gData } = await supabase
          .from("ngo_gallery")
          .select("*")
          .eq("ngo_id", ngo.id)
          .limit(6);

        setGallery((prev) => ({ ...prev, [ngo.id]: gData || [] }));
      });
    }

    setLoading(false);
  };

  // Search & Filter Logic
  const filteredNGOs = ngos.filter((ngo) => {
    const matchesSearch =
      ngo.name.toLowerCase().includes(search.toLowerCase()) ||
      ngo.email.toLowerCase().includes(search.toLowerCase());

    const matchesCity = cityFilter ? ngo.city === cityFilter : true;

    const matchesVerified = verifiedOnly ? ngo.verified === true : true;

    return matchesSearch && matchesCity && matchesVerified;
  });

  const uniqueCities = Array.from(new Set(ngos.map((ng) => ng.city).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-10 border border-blue-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            🌍 Discover NGOs
          </h1>
          <Link
            to="/donor/dashboard"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Back
          </Link>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search NGOs by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 mb-6"
        />

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="p-3 border rounded-lg"
          >
            <option value="">Filter by City</option>
            {uniqueCities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>

          {/* Verified */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`p-3 rounded-lg border ${
              verifiedOnly
                ? "bg-green-600 text-white border-green-600"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {verifiedOnly ? "✔ Showing Verified NGOs" : "Show Only Verified NGOs"}
          </button>

          <button
            onClick={() => {
              setSearch("");
              setCityFilter("");
              setVerifiedOnly(false);
            }}
            className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            Reset Filters
          </button>
        </div>

        {/* Data Loading */}
        {loading ? (
          <p className="text-center text-gray-600">Loading NGOs...</p>
        ) : filteredNGOs.length === 0 ? (
          <p className="text-center text-gray-600">No NGOs found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredNGOs.map((ngo) => (
              <div
                key={ngo.id}
                className="p-6 bg-blue-50 rounded-xl border border-blue-100 shadow hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  {/* NGO Image */}
                  <img
                    src={ngo.image_url || "/placeholder.png"}
                    className="w-24 h-24 rounded-lg object-cover border"
                  />

                  <div>
                    <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                      {ngo.name}
                      {ngo.verified && (
                        <CheckCircle className="text-green-600" size={18} />
                      )}
                    </h2>

                    {/* Rating */}
                    <p className="flex items-center gap-1 text-yellow-600 text-sm">
                      <Star size={16} /> {ngo.rating || "0"} ({ngo.total_reviews || 0})
                    </p>

                    {/* Location */}
                    <p className="flex items-center gap-1 text-gray-700 text-sm">
                      <MapPin size={14} /> {ngo.city}, {ngo.state}
                    </p>

                    {/* Website */}
                    {ngo.website && (
                      <a
                        href={ngo.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 text-sm mt-1"
                      >
                        <Globe size={14} /> Visit Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mt-3 line-clamp-3">{ngo.description}</p>

                {/* Google Maps */}
                {ngo.address && (
                  <iframe
                    className="w-full h-40 mt-3 rounded-lg border"
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      ngo.address
                    )}&output=embed`}
                  />
                )}

                {/* Gallery */}
                <div className="mt-4">
                  <h3 className="text-blue-700 font-semibold mb-2 flex items-center gap-2">
                    <ImgIcon size={18} /> Gallery
                  </h3>

                  {gallery[ngo.id]?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {gallery[ngo.id].map((g: any) => (
                        <img
                          key={g.id}
                          src={g.media_url}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No gallery items uploaded.</p>
                  )}
                </div>

                <Link
                  to={`/donor/ngo/${ngo.id}`}
                  className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  View Full Profile →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewNGOs;
