import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const ViewNGOs = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNgos = async () => {
      const { data, error } = await supabase
        .from("ngos")
        .select("id, name, email, created_at");

      if (error) console.error("Error loading NGOs:", error);
      else setNgos(data || []);
      setLoading(false);
    };

    fetchNgos();
  }, []);

  const filtered = ngos.filter((ngo) =>
    ngo.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading NGOs...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-10 border border-blue-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Explore NGOs</h1>
          <Link
            to="/donor/dashboard"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Back
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search NGOs by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 mb-6"
        />

        {filtered.length === 0 ? (
          <p className="text-center text-gray-600">No NGOs found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((ngo) => (
              <div
                key={ngo.id}
                className="p-6 bg-blue-50 rounded-xl border border-blue-100 shadow hover:shadow-md transition-all"
              >
                <h2 className="text-xl font-semibold text-blue-700">
                  {ngo.name}
                </h2>
                <p className="text-gray-600">{ngo.email}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Joined on {new Date(ngo.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewNGOs;
