import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { MapPin, Star, Globe, CheckCircle, Image as ImgIcon, LocateFixed } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet icon fix
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Haversine distance calculation (km)
const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (!lat1 || !lat2) return Infinity;

  const R = 6371; // Earth radius
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const ViewNGOs = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any>({});
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // NEW: donor's GPS location
  const [donorLocation, setDonorLocation] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  const [distanceFilter, setDistanceFilter] = useState(""); // e.g., "10km"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNGOs();
  }, []);

  useEffect(() => {
    // auto detect donor location for distance filter
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDonorLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => console.warn("GPS blocked — distance filter disabled")
    );
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
        latitude,
        longitude,
        address,
        created_at
      `
      )
      .order("rating", { ascending: false });

    if (!error && data.length) {
      setNgos(data);

      // Load gallery
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

  // FILTERING
  const filteredNGOs = ngos.filter((ngo) => {
    const matchesSearch =
      ngo.name.toLowerCase().includes(search.toLowerCase()) ||
      ngo.email.toLowerCase().includes(search.toLowerCase());

    const matchesCity = cityFilter ? ngo.city === cityFilter : true;
    const matchesVerified = verifiedOnly ? ngo.verified === true : true;

    let matchesDistance = true;

    if (distanceFilter && donorLocation.lat && ngo.latitude) {
      const maxDist = parseInt(distanceFilter);
      const dist = calcDistance(
        donorLocation.lat!,
        donorLocation.lng!,
        ngo.latitude,
        ngo.longitude
      );

      matchesDistance = dist <= maxDist;
      ngo._distance = dist; // store distance for sorting
    }

    return matchesSearch && matchesCity && matchesVerified && matchesDistance;
  });

  // Sort by distance if applied
  if (distanceFilter) {
    filteredNGOs.sort((a: any, b: any) => (a._distance || 0) - (b._distance || 0));
  }

  const uniqueCities = Array.from(new Set(ngos.map((ng) => ng.city).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-10 border border-blue-100">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">🌍 Discover NGOs</h1>
          <Link to="/donor/dashboard" className="text-blue-600 hover:underline font-medium">
            ← Back
          </Link>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search NGOs by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 mb-6"
        />

        {/* FILTERS */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">

          {/* City */}
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
              verifiedOnly ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {verifiedOnly ? "✔ Verified Only" : "Show Verified Only"}
          </button>

          {/* Distance Filter */}
          <select
            value={distanceFilter}
            onChange={(e) => setDistanceFilter(e.target.value)}
            className="p-3 border rounded-lg"
          >
            <option value="">Sort by Distance</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </select>

          {/* Reset */}
          <button
            onClick={() => {
              setSearch("");
              setCityFilter("");
              setVerifiedOnly(false);
              setDistanceFilter("");
            }}
            className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            Reset Filters
          </button>
        </div>

        {/* Data */}
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
                  <img
                    src={ngo.image_url || "/placeholder.png"}
                    className="w-24 h-24 rounded-lg object-cover border"
                  />

                  <div>
                    <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                      {ngo.name}
                      {ngo.verified && <CheckCircle className="text-green-600" size={18} />}
                    </h2>

                    <p className="flex items-center gap-1 text-yellow-600 text-sm">
                      <Star size={16} /> {ngo.rating || "0"} ({ngo.total_reviews || 0})
                    </p>

                    <p className="flex items-center gap-1 text-gray-700 text-sm">
                      <MapPin size={14} /> {ngo.city}, {ngo.state}
                    </p>

                    {ngo.website && (
                      <a
                        href={ngo.website}
                        target="_blank"
                        className="flex items-center gap-1 text-blue-600 text-sm mt-1"
                      >
                        <Globe size={14} /> Visit Website
                      </a>
                    )}

                    {/* SHOW DISTANCE */}
                    {distanceFilter && ngo._distance && (
                      <p className="text-sm text-blue-700 font-medium">
                        📍 {ngo._distance.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mt-3 line-clamp-3">{ngo.description}</p>

                {/* MINI LEAFLET MAP */}
                {ngo.latitude && ngo.longitude && (
                  <div className="mt-4">
                    <MapContainer
                      center={[ngo.latitude, ngo.longitude]}
                      zoom={14}
                      style={{ height: "180px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[ngo.latitude, ngo.longitude]} icon={markerIcon} />
                    </MapContainer>
                  </div>
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

                {/* Full Profile */}
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
