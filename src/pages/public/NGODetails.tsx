import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Globe, Star, Image, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NGODetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ngo, setNgo] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [reviews, setReviews] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    loadNGO();
    loadGallery();
    loadNeeds();
    loadReviews();
  }, []);

  const loadNGO = async () => {
    const { data } = await supabase.from("ngos").select("*").eq("id", id).single();
    setNgo(data);
  };

  const loadGallery = async () => {
    const { data } = await supabase
      .from("ngo_gallery")
      .select("*")
      .eq("ngo_id", id)
      .limit(5);

    setGallery(data || []);
  };

  const loadNeeds = async () => {
    const { data } = await supabase
      .from("ngo_needs")
      .select("*")
      .eq("ngo_id", id)
      .order("created_at", { ascending: false })
      .limit(5);

    setNeeds(data || []);
  };

  const loadReviews = async () => {
    const { data } = await supabase
      .from("ngo_reviews")
      .select("rating, review, created_at")
      .eq("ngo_id", id)
      .order("created_at", { ascending: false })
      .limit(3);

    setReviews(data || []);
  };

  if (!ngo) return <div className="p-10 text-center text-xl">Loading NGO details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">

      {/* IMAGE BANNER */}
      <div className="relative w-full h-60 rounded-xl overflow-hidden shadow-lg">
        <img
          src={ngo.image_url || "/placeholder.png"}
          className="w-full h-full object-cover"
        />
        {ngo.verified && (
          <span className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            ✔ Verified NGO
          </span>
        )}
      </div>

      {/* NAME */}
      <h1 className="text-4xl font-bold mt-6 text-center">{ngo.name}</h1>

      {/* LOCATION */}
      <p className="text-gray-600 text-center mt-2 flex items-center justify-center gap-1">
        <MapPin className="h-4 w-4" />
        {ngo.city}, {ngo.state}, {ngo.country}
      </p>

      {/* RATING */}
      {ngo.rating && (
        <p className="text-center text-yellow-600 font-semibold mt-1">
          ⭐ {ngo.rating}/5 ({ngo.total_reviews} reviews)
        </p>
      )}

      {/* DESCRIPTION */}
      <p className="mt-6 text-gray-700 leading-relaxed text-lg">
        {ngo.description || "This NGO has not provided a description yet."}
      </p>

      {/* PUBLIC INFO SECTION */}
      <div className="mt-10 border rounded-xl p-6 bg-gray-50 shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Basic Information</h2>

        <div className="space-y-2 text-gray-700">
          <p><b>Pincode:</b> {ngo.pincode || "Not provided"}</p>
          <p><b>State:</b> {ngo.state || "Not provided"}</p>
          <p><b>Country:</b> {ngo.country || "Not provided"}</p>
        </div>
      </div>

      {/* 🔐 FULL DETAILS ONLY FOR LOGGED-IN DONORS */}
      {!user ? (
        <div className="mt-10 p-6 border rounded-xl bg-primary/5 text-center">
          <h2 className="text-xl font-semibold mb-2">Want Full NGO Details?</h2>
          <p className="text-gray-700 mb-4">
            Login as a donor to view full contact details, needs, gallery, and more.
          </p>
          <Button
            onClick={() => navigate(`/auth?redirect=/ngo/${id}`)}
            className="flex items-center gap-2 mx-auto"
          >
            Login to View More
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : user.role !== "donor" ? (
        <div className="mt-10 p-6 border rounded-xl bg-orange-50 text-center">
          <h2 className="text-xl font-semibold mb-2">Limited Access</h2>
          <p className="text-gray-700 mb-4">
            Only donors can view full NGO details.  
          </p>
        </div>
      ) : (
        <>
          {/* CONTACT CARD */}
          <div className="mt-10 border rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

            <div className="space-y-3 text-gray-700">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> {ngo.phone || "Not Provided"}
              </p>

              <p><b>Address:</b> {ngo.address || "Not provided"}</p>

              {ngo.website && (
                <p className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <a href={ngo.website} target="_blank" className="text-blue-600 underline">
                    Visit Website
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* NEEDS */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Current Needs</h2>

            {needs.length === 0 ? (
              <p className="text-gray-600">No needs listed.</p>
            ) : (
              <ul className="space-y-3">
                {needs.map((item) => (
                  <li
                    key={item.id}
                    className="p-4 border rounded-xl bg-gray-50 shadow-sm"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm mt-1"><b>Quantity:</b> {item.quantity}</p>
                    <p className="text-sm"><b>Urgency:</b> {item.urgency}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* GALLERY */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Gallery</h2>

            {gallery.length === 0 ? (
              <p className="text-gray-600">This NGO has not uploaded photos yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img) => (
                  <img
                    key={img.id}
                    src={img.media_url}
                    className="rounded-xl h-32 w-full object-cover shadow"
                  />
                ))}
              </div>
            )}
          </div>

          {/* REVIEWS */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-3">Recent Reviews</h2>

            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-xl bg-gray-50 shadow-sm"
                  >
                    <p className="text-yellow-600 font-semibold">
                      ⭐ {rev.rating}
                    </p>
                    <p className="text-gray-700 mt-2">{rev.review}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
