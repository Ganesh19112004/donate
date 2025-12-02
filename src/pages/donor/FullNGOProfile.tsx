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
  CheckCircle,
} from "lucide-react";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Marker icon
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

  // Review states
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const donor = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");

  // Donor location
  const [donorLocation, setDonorLocation] = useState({
    lat: null as number | null,
    lng: null as number | null,
  });

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

  useEffect(() => {
    if (id) loadNGO();
  }, [id]);

  const loadNGO = async () => {
    setLoading(true);

    // ---- NGO DATA ----
    const { data: ngoData } = await supabase
      .from("ngos")
      .select("*")
      .eq("id", id)
      .single();

    setNgo(ngoData);

    // ---- GALLERY ----
    const { data: gData } = await supabase
      .from("ngo_gallery")
      .select("*")
      .eq("ngo_id", id);

    setGallery(gData || []);

    // ---- REVIEWS ----
    const { data: reviewData } = await supabase
      .from("ngo_reviews")
      .select("*, donors(name, image_url)")
      .eq("ngo_id", id)
      .order("created_at", { ascending: false });

    setReviews(reviewData || []);

    // ---- FAVORITE + ALREADY REVIEWED ----
    if (donor?.id && role === "donor") {
      const { data: fav } = await supabase
        .from("favorite_ngos")
        .select("*")
        .eq("donor_id", donor.id)
        .eq("ngo_id", id)
        .maybeSingle();

      setIsFav(!!fav);

      const { data: already } = await supabase
        .from("ngo_reviews")
        .select("*")
        .eq("donor_id", donor.id)
        .eq("ngo_id", id)
        .maybeSingle();

      setAlreadyReviewed(!!already);
    }

    setLoading(false);
  };

  // ⭐ Add / Remove Favorite
  const toggleFavorite = async () => {
    if (!donor?.id || role !== "donor")
      return alert("Only donors can favorite NGOs");

    if (isFav) {
      await supabase
        .from("favorite_ngos")
        .delete()
        .eq("donor_id", donor.id)
        .eq("ngo_id", id);

      setIsFav(false);
    } else {
      await supabase.from("favorite_ngos").insert({
        donor_id: donor.id,
        ngo_id: id,
      });
      setIsFav(true);
    }
  };

  // ⭐ Submit Review
  const submitReview = async () => {
    if (role !== "donor") return alert("Only donors can review!");
    if (alreadyReviewed) return alert("You already reviewed this NGO!");
    if (rating === 0) return alert("Select a rating!");
    if (reviewText.trim().length < 3)
      return alert("Review must be at least 3 characters!");

    await supabase.from("ngo_reviews").insert({
      donor_id: donor.id,
      ngo_id: id,
      rating,
      review: reviewText,
    });

    // Update rating impact
    await supabase.rpc("update_ngo_impact", { ngo: id });

    setReviewText("");
    setRating(0);
    setAlreadyReviewed(true);

    loadNGO();
  };

  // 🌍 Distance Calculation
  const distance = (() => {
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
  })();

  if (loading) return <div className="text-center p-10">Loading NGO...</div>;
  if (!ngo) return <div className="p-10">NGO Not Found</div>;

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            {ngo.name}
            {ngo.verified && <CheckCircle className="text-green-600" />}
          </h1>

          <Link to="/donor/view-ngos" className="text-blue-600 flex gap-1">
            <ArrowLeft size={18} /> Back
          </Link>
        </div>

        {/* FAVORITE BUTTON */}
        <button
          onClick={toggleFavorite}
          className={`mb-4 px-4 py-2 rounded-lg ${
            isFav ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"
          }`}
        >
          {isFav ? "♥ Favorited" : "♡ Add to Favorites"}
        </button>

        {/* MAIN IMAGE + DETAILS */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <img
            src={ngo.image_url || "/placeholder.png"}
            className="w-full h-56 rounded-xl object-cover border"
          />

          <div className="md:col-span-2 space-y-2">
            <p className="flex gap-2 text-gray-700">
              <MapPin size={18} />
              {ngo.address}, {ngo.city}, {ngo.state}, {ngo.country}
            </p>

            {distance && (
              <p className="text-blue-700 font-semibold">
                📍 {distance.toFixed(1)} km away
              </p>
            )}

            <p>Email: {ngo.email}</p>
            <p>Phone: {ngo.phone || " Not provided"}</p>

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
            <Marker position={[ngo.latitude, ngo.longitude]} icon={markerIcon} />
          </MapContainer>
        )}

        {/* ABOUT */}
        <h2 className="text-xl font-semibold text-blue-700">About</h2>
        <p className="text-gray-700 mt-2">{ngo.description || "No description available"}</p>

        {/* GALLERY */}
        <h2 className="text-xl font-semibold text-blue-700 mt-6">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {gallery.length > 0 ? (
            gallery.map((g) => (
              <img
                key={g.id}
                src={g.media_url}
                className="h-32 w-full object-cover rounded-lg border"
              />
            ))
          ) : (
            <p>No gallery images uploaded.</p>
          )}
        </div>

        {/* REVIEWS */}
        {/* REVIEWS HEADER WITH AVG RATING */}
<h2 className="text-xl font-semibold text-blue-700 mt-8">Reviews</h2>

<div className="mt-3 bg-gray-100 p-4 rounded-xl shadow">

  {/* ⭐ Average Rating */}
  <div className="flex items-center gap-3">
    <h3 className="text-4xl font-bold text-yellow-500">
      {(reviews.length > 0
        ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
        : "0.0")}
    </h3>

    <div>
      <div className="flex text-yellow-500">
        {[1,2,3,4,5].map((s) => (
          <Star
            key={s}
            size={22}
            className={(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length) >= s
              ? "fill-yellow-500"
              : "text-gray-400"
            }
          />
        ))}
      </div>
      <p className="text-gray-600 text-sm">
        {reviews.length} total review(s)
      </p>
    </div>
  </div>

  {/* ⭐ Rating Breakdown Bars */}
  <div className="mt-4 space-y-2">
    {[5,4,3,2,1].map((star) => {
      const count = reviews.filter((r) => r.rating === star).length;
      const percent = reviews.length ? (count / reviews.length) * 100 : 0;

      return (
        <div key={star} className="flex items-center gap-2">
          <span className="w-10 text-sm font-medium">{star} ★</span>

          <div className="flex-1 h-3 bg-gray-300 rounded-full overflow-hidden">
            <div
              style={{ width: `${percent}%` }}
              className="h-full bg-yellow-500 rounded-full"
            ></div>
          </div>

          <span className="w-8 text-sm text-gray-700">{count}</span>
        </div>
      );
    })}
  </div>
</div>


        {/* WRITE REVIEW */}
        {role === "donor" && !alreadyReviewed && (
          <div className="bg-gray-100 p-4 rounded-lg mt-4 shadow">
            <p className="font-semibold text-gray-800 mb-2">Write a Review</p>

            {/* Stars */}
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={24}
                  onClick={() => setRating(s)}
                  className={`cursor-pointer ${
                    s <= rating ? "text-yellow-500" : "text-gray-400"
                  }`}
                />
              ))}
            </div>

            {/* Text */}
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="Write your feedback..."
            />

            <button
              onClick={submitReview}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Review
            </button>
          </div>
        )}

        {alreadyReviewed && (
          <p className="text-green-700 mt-2">✔ You already reviewed this NGO</p>
        )}

        {/* Existing Reviews */}
        {reviews.length === 0 && <p className="mt-3">No reviews yet.</p>}

        {reviews.map((r) => (
          <div key={r.id} className="mt-3 p-4 rounded-lg bg-gray-50 border shadow-sm">
            <div className="flex justify-between">
              <p className="font-bold">{r.donors?.name || "Anonymous"}</p>

              <p className="flex items-center gap-1 text-yellow-600">
                <Star size={16} /> {r.rating}
              </p>
            </div>

            <p className="mt-2 text-gray-700">{r.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FullNGOProfile;
