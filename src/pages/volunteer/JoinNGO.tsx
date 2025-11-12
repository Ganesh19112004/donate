import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

const JoinNGO = () => {
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");
  const [ngos, setNgos] = useState<any[]>([]);
  const [joinedNgos, setJoinedNgos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fetch all NGOs and joined NGOs
  useEffect(() => {
    const loadNGOs = async () => {
      setLoading(true);

      // Fetch all NGOs
      const { data: allNgos, error } = await supabase
        .from("ngos")
        .select("id, name, city, image_url, verified");

      if (error) console.error(error);

      // Fetch joined NGOs for the volunteer
      const { data: joined, error: joinedErr } = await supabase
        .from("ngo_volunteers")
        .select("ngo_id")
        .eq("volunteer_id", volunteer.id);

      if (joinedErr) console.error(joinedErr);

      const joinedIds = joined?.map((j) => j.ngo_id) || [];
      setNgos(allNgos || []);
      setJoinedNgos(joinedIds);
      setLoading(false);
    };

    loadNGOs();
  }, [volunteer.id]);

  // ✅ Handle Join NGO
  const handleJoin = async (ngoId: string) => {
    await supabase.from("ngo_volunteers").insert({
      ngo_id: ngoId,
      volunteer_id: volunteer.id,
    });
    setJoinedNgos([...joinedNgos, ngoId]);
  };

  // ✅ Handle Leave NGO
  const handleLeave = async (ngoId: string) => {
    await supabase
      .from("ngo_volunteers")
      .delete()
      .eq("ngo_id", ngoId)
      .eq("volunteer_id", volunteer.id);
    setJoinedNgos(joinedNgos.filter((id) => id !== ngoId));
  };

  // ✅ Filter NGOs based on search input
  const filteredNgos = ngos.filter(
    (ngo) =>
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ngo.city || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return <div className="text-center py-10 text-gray-600">Loading NGOs...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">
          🤝 Join or Leave NGOs
        </h1>

        {/* 🔍 Search Bar */}
        <div className="flex items-center justify-center mb-8">
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
        </div>

        {/* 🧡 Joined NGOs Section */}
        {joinedNgos.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              ✅ Your Joined NGOs
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {ngos
                .filter((ngo) => joinedNgos.includes(ngo.id))
                .map((ngo) => (
                  <div
                    key={ngo.id}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={ngo.image_url || "/placeholder.png"}
                      alt={ngo.name}
                      className="h-36 w-full object-cover rounded-lg mb-3"
                    />
                    <h2 className="text-lg font-semibold text-blue-700">
                      {ngo.name}
                    </h2>
                    <p className="text-sm text-gray-600">{ngo.city || "—"}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {ngo.verified ? "✅ Verified NGO" : "Not Verified"}
                    </p>
                    <button
                      onClick={() => handleLeave(ngo.id)}
                      className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Leave NGO
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 💙 All NGOs Section */}
        <div>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            🌍 Explore NGOs
          </h2>
          {filteredNgos.length === 0 ? (
            <p className="text-gray-600 text-center py-6">
              No NGOs found matching your search.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredNgos.map((ngo) => {
                const isJoined = joinedNgos.includes(ngo.id);
                return (
                  <div
                    key={ngo.id}
                    className={`border rounded-xl p-5 shadow-sm hover:shadow-md transition ${
                      isJoined
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-blue-100"
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
                    <p className="text-sm text-gray-600">{ngo.city || "—"}</p>
                    {ngo.verified && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Verified NGO
                      </p>
                    )}
                    <button
                      onClick={() =>
                        isJoined ? handleLeave(ngo.id) : handleJoin(ngo.id)
                      }
                      className={`mt-4 w-full py-2 rounded-lg text-white transition ${
                        isJoined
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isJoined ? "Leave NGO" : "Join NGO"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinNGO;
