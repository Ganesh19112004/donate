import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Star,
  Facebook,
  Instagram,
  Twitter,
  CheckCircle
} from "lucide-react";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const FullNGOProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [ngo, setNgo] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFav, setIsFav] = useState(false);

  const [loading, setLoading] = useState(true);

  const [donorLocation, setDonorLocation] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });

  // Detect donor location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setDonorLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {}
    );
  }, []);

  // Fetch all NGO data
  useEffect(() => {
    if (!id) return;
    loadNGO();
  }, [id]);

  const loadNGO = async () => {
    setLoading(true);

    // Fetch NGO Record
    const { data: ngoData } = await supabase
      .from("ngos")
      .select("*")
      .eq("id", id)
      .single();

    setNgo(ngoData);

    // Gallery
    const { data: galleryData } = await supabase
      .from("ngo_gallery")
      .select("*")
      .eq("ngo_id", id);

    setGallery(galleryData || []);

    // Reviews
    const { data: reviewData } = await supabase
      .from("ngo_reviews")
      .select("*, donors(name, image_url)")
      .eq("ngo_id", id)
      .order("created_at", { ascending: false });

    setReviews(reviewData || []);

    // Favorite check
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = localStorage.getItem("role");

    if (user?.id && role === "donor") {
      const { data: fav } = await supabase
        .from("favorite_ngos")
        .select("*")
        .eq("donor_id", user.id)
        .eq("ngo_id", id)
        .single();

      setIsFav(!!fav);
    }

    setLoading(false);
  };

  const toggleFavorite = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) return alert("Login as donor");

    if (isFav) {
      await supabase
        .from("favorite_ngos")
        .delete()
        .eq("ngo_id", id)
        .eq("donor_id", user.id);

      setIsFav(false);
    } else {
      await supabase.from("favorite_ngos").insert({
        donor_id: user.id,
        ngo_id: id,
      });

      setIsFav(true);
    }
  };

  const calculateDistance = () => {
    if (!donorLocation.lat || !ngo?.latitude) return null;

    const R = 6371;
    const dLat = ((ngo.latitude - donorLocation.lat) * Math.PI) / 180;
    const dLon = ((ngo.longitude - donorLocation.lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(donorLocation.lat * (Math.PI / 180)) *
        Math.cos(ngo.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const distance = calculateDistance();

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!ngo) return <div className="p-8">NGO Not Found</div>;

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            {ngo.name}
            {ngo.verified && <CheckCircle className="text-green-600" />}
          </h1>

          <Link
            to="/donor/view-ngos"
            className="text-blue-600 flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        {/* FAVORITE BUTTON */}
        <button
          onClick={toggleFavorite}
          className={`px-4 py-2 rounded-lg mb-4 ${
            isFav ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"
          }`}
        >
          {isFav ? "♥ Favorited" : "♡ Add to Favorites"}
        </button>

        {/* MAIN IMAGE + CONTACT */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <img
            src={ngo.image_url || "/placeholder.png"}
            className="w-full h-56 object-cover rounded-xl border"
          />

          <div className="md:col-span-2 space-y-2">
            <p className="flex items-center text-gray-700 gap-2">
              <MapPin size={18} />
              {ngo.address}, {ngo.city}, {ngo.state}, {ngo.country}
            </p>

            {distance && (
              <p className="text-blue-700 font-semibold">
                📍 {distance.toFixed(1)} km away
              </p>
            )}

            <p>Email: {ngo.email}</p>
            <p>Phone: {ngo.phone || "Not provided"}</p>

            {/* SOCIAL LINKS */}
            <div className="flex gap-4 mt-3">
              {ngo.website && <a href={ngo.website} target="_blank"><Globe /></a>}
              {ngo.facebook && <a href={ngo.facebook} target="_blank"><Facebook /></a>}
              {ngo.instagram && <a href={ngo.instagram} target="_blank"><Instagram /></a>}
              {ngo.twitter && <a href={ngo.twitter} target="_blank"><Twitter /></a>}
            </div>
          </div>
        </div>

        {/* MAP */}
        {ngo.latitude && ngo.longitude && (
          <MapContainer
            center={[ngo.latitude, ngo.longitude]}
            zoom={15}
            style={{ height: "300px", width: "100%", borderRadius: "12px" }}
            className="mb-6"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[ngo.latitude, ngo.longitude]}
              icon={markerIcon}
            />
          </MapContainer>
        )}

        {/* ABOUT */}
        <h2 className="text-xl font-semibold text-blue-700">About</h2>
        <p className="mt-2 text-gray-700">{ngo.description}</p>

        {/* GALLERY */}
        <h2 className="text-xl font-semibold text-blue-700 mt-6">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {gallery.map((g) => (
            <img
              key={g.id}
              src={g.media_url}
              className="w-full h-32 object-cover rounded-lg border"
            />
          ))}
        </div>

        {/* REVIEWS */}
        <h2 className="text-xl font-semibold text-blue-700 mt-6">
          Reviews ({ngo.total_reviews || 0})
        </h2>

        {reviews.length === 0 && <p>No reviews yet.</p>}

        {reviews.map((r) => (
          <div
            key={r.id}
            className="mt-3 p-4 border rounded-lg bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between">
              <p className="font-bold">{r.donors?.name || "Anonymous"}</p>
              <p className="flex items-center gap-1 text-yellow-600">
                <Star size={16} /> {r.rating}
              </p>
            </div>
            <p className="text-gray-700 mt-2">{r.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FullNGOProfile;
