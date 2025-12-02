import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Star, ArrowLeft, Heart, Building2 } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// CATEGORY TITLES
const categoryTitles: any = {
  education: "Education & Learning Support",
  healthcare: "Healthcare & Medical Aid",
  shelter: "Shelter & Housing Support",
  relief: "Emergency & Disaster Relief",
};

// CATEGORY DESCRIPTIONS
const categoryDescriptions: any = {
  education:
    "These NGOs work to provide books, stationary, educational help, and support for students in need.",
  healthcare:
    "These NGOs provide medicines, medical support, health camps, and frontline medical services.",
  shelter:
    "Shelter support NGOs help homeless people, old-age homes, orphanages, and community shelters.",
  relief:
    "Emergency NGOs working during floods, earthquakes, fires, or humanitarian crises.",
};

export default function CategoryPage() {
  const { type } = useParams();
  const [ngos, setNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const title = categoryTitles[type || "education"] || "NGO Category";
  const description = categoryDescriptions[type || "education"];

  useEffect(() => {
    loadNGOs();
  }, [type]);

  const loadNGOs = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("ngos")
      .select("*")
      .ilike("description", `%${type}%`);

    setNgos(data || []);
    setLoading(false);
  };

  const filtered = ngos.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue-50 py-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* 🔙 Back */}
        <Link
          to="/"
          className="text-blue-600 flex items-center gap-2 mb-6 hover:underline"
        >
          <ArrowLeft /> Back to Home
        </Link>

        {/* 🏷 Header */}
        <div className="bg-white p-10 rounded-2xl shadow-xl border mb-10">
          <h1 className="text-4xl font-bold text-blue-700 mb-3">
            {title}
          </h1>
          <p className="text-gray-700 text-lg max-w-3xl">{description}</p>
        </div>

        {/* 🔍 Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search NGOs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 border rounded-xl shadow bg-white"
          />
        </div>

        {/* NGO LIST */}
        {loading ? (
          <p className="text-center text-gray-600 py-10">Loading NGOs...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-600 text-lg py-10">
            No NGOs found under this category.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            {filtered.map((ngo) => (
              <div
                key={ngo.id}
                className="bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition"
              >
                {/* Top Section */}
                <div className="flex gap-6">
                  <img
                    src={ngo.image_url || "/placeholder.png"}
                    className="w-28 h-28 rounded-xl object-cover shadow"
                  />

                  <div>
                    <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                      {ngo.name}
                      {ngo.verified && (
                        <CheckCircle className="text-green-600" size={18} />
                      )}
                    </h2>

                    <p className="text-sm flex items-center gap-1 text-yellow-600">
                      <Star size={16} /> {ngo.rating || 0} ({ngo.total_reviews || 0})
                    </p>

                    <p className="text-sm flex items-center gap-1 text-gray-700">
                      <MapPin size={14} /> {ngo.city}, {ngo.state}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-gray-700">{ngo.description}</p>

                {/* MAP */}
                {ngo.latitude && (
                  <div className="mt-4">
                    <MapContainer
                      center={[ngo.latitude, ngo.longitude]}
                      zoom={14}
                      style={{ height: "180px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[ngo.latitude, ngo.longitude]}
                        icon={markerIcon}
                      />
                    </MapContainer>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 mt-6">
                  <Link
                    to={`/donor/ngo/${ngo.id}`}
                    className="flex-1 text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Profile →
                  </Link>

                  <Link
                    to="/donor/donate-money"
                    className="flex-1 text-center py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Donate ₹
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
