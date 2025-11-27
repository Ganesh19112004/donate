import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, CheckCircle, X } from "lucide-react";

const JoinNGO = () => {
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");

  const [ngos, setNgos] = useState<any[]>([]);
  const [joinedNgos, setJoinedNgos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [selectedNgo, setSelectedNgo] = useState<any | null>(null);

  // 🚀 Load NGOs
  useEffect(() => {
    const loadNGOs = async () => {
      setLoading(true);

      const { data: list } = await supabase
        .from("ngos")
        .select("id, name, city, image_url, verified, rating, total_reviews");

      const { data: joined } = await supabase
        .from("ngo_volunteers")
        .select("ngo_id")
        .eq("volunteer_id", volunteer.id);

      setNgos(list || []);
      setJoinedNgos(joined?.map((x) => x.ngo_id) || []);
      setLoading(false);
    };

    loadNGOs();
  }, []);

  // 🚀 Join
  const handleJoin = async (ngoId: string) => {
    await supabase.from("ngo_volunteers").insert({
      ngo_id: ngoId,
      volunteer_id: volunteer.id,
    });
    setJoinedNgos([...joinedNgos, ngoId]);
  };

  // 🚫 Leave
  const handleLeave = async (ngoId: string) => {
    await supabase
      .from("ngo_volunteers")
      .delete()
      .eq("ngo_id", ngoId)
      .eq("volunteer_id", volunteer.id);
    setJoinedNgos(joinedNgos.filter((i) => i !== ngoId));
  };

  // 📌 Unique cities for dropdown filter
  const uniqueCities = [...new Set(ngos.map((n) => n.city).filter(Boolean))];

  // 🔍 Filter + Sort Logic
  const filteredNgos = ngos
    .filter((ngo) => {
      const matchSearch =
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ngo.city || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchCity = cityFilter ? ngo.city === cityFilter : true;

      return matchSearch && matchCity;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "verified") return Number(b.verified) - Number(a.verified);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  if (loading)
    return <div className="text-center py-14 text-gray-500">Loading NGOs...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">
          🤝 Explore & Join NGOs
        </h1>

        {/* 🔍 Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          {/* Search */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full md:w-1/2 shadow-inner">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search NGOs by name or city..."
              className="bg-transparent w-full outline-none text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-gray-700"
          >
            <option value="">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg text-gray-700"
          >
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
            <option value="verified">Verified First</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* 🌍 NGO Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredNgos.map((ngo) => {
            const isJoined = joinedNgos.includes(ngo.id);

            return (
              <div
                key={ngo.id}
                className={`border rounded-xl p-5 shadow-md hover:shadow-lg transition relative ${
                  isJoined ? "bg-green-50 border-green-200" : "bg-white"
                }`}
              >
                <img
                  src={ngo.image_url || "/placeholder.png"}
                  alt={ngo.name}
                  className="h-36 w-full object-cover rounded-lg mb-3"
                />

                <h2 className="text-lg font-semibold text-blue-700">
                  {ngo.name}
                </h2>

                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPin size={16} className="mr-1 text-gray-500" />
                  {ngo.city || "—"}
                </p>

                {ngo.verified && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    Verified NGO
                  </p>
                )}

                <p className="text-xs text-yellow-600 mt-1">
                  ⭐ {ngo.rating || 0} / 5 ({ngo.total_reviews || 0} reviews)
                </p>

                {/* Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedNgo(ngo)}
                    className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      isJoined ? handleLeave(ngo.id) : handleJoin(ngo.id)
                    }
                    className={`flex-1 py-2 rounded-lg text-white ${
                      isJoined
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isJoined ? "Leave" : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📌 NGO Details Modal */}
      {selectedNgo && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl relative">
            <button
              className="absolute top-3 right-3"
              onClick={() => setSelectedNgo(null)}
            >
              <X size={26} className="text-red-600" />
            </button>

            <img
              src={selectedNgo.image_url || "/placeholder.png"}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />

            <h2 className="text-2xl font-bold text-blue-700">
              {selectedNgo.name}
            </h2>

            <p className="text-gray-700 mt-2">
              📍 {selectedNgo.city || "Not specified"}
            </p>

            <p className="text-gray-600 mt-3 text-sm">
              ⭐ Rating: {selectedNgo.rating || 0} / 5 (
              {selectedNgo.total_reviews || 0} reviews)
            </p>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedNgo(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinNGO;
