import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  Building2,
  Globe,
  Phone,
  MapPin,
  Info,
  Navigation,
} from "lucide-react";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CreateDonation = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ngo_id: "",
    category: "Books",
    donation_type: "Pickup", // NEW
    priority: "Normal", // NEW
    description: "",
    amount: "",
    quantity: "",
    donor_phone: "",
    pickup_address: "",
    instructions: "",
  });

  const [donorLocation, setDonorLocation] = useState<any>(null);
  const [ngos, setNgos] = useState<any[]>([]);
  const [selectedNGO, setSelectedNGO] = useState<any>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // 🌍 Detect donor GPS
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDonorLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => console.warn("GPS blocked")
    );
  }, []);

  // 🏢 Load NGOs
  useEffect(() => {
    const fetchNgos = async () => {
      const { data } = await supabase
        .from("ngos")
        .select(
          "id, name, city, state, country, latitude, longitude, image_url, phone, description, website, verified"
        )
        .order("name");

      setNgos(data || []);
    };
    fetchNgos();
  }, []);

  // Auto-load donor details
  useEffect(() => {
    const donor = JSON.parse(localStorage.getItem("user") || "{}");
    setForm((prev) => ({
      ...prev,
      donor_phone: donor.phone || "",
      pickup_address: donor.address || "",
    }));
  }, []);

  // Distance calculation
  const calcDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lat2) return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // On NGO selection
  const handleNGOChange = (id) => {
    const ngo = ngos.find((n) => n.id === id);
    setSelectedNGO(ngo);
    setForm({ ...form, ngo_id: id });
  };

  // Multiple image upload
  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // SUBMIT DONATION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const donor = JSON.parse(localStorage.getItem("user") || "{}");

    let uploadedUrls: string[] = [];

    try {
      // Upload images
      for (let img of images) {
        const ext = img.name.split(".").pop();
        const fileName = `${donor.id}-${Date.now()}-${Math.random()}.${ext}`;

        const { data: upload } = await supabase.storage
          .from("donation_images")
          .upload(fileName, img);

        const { data: publicUrl } = supabase.storage
          .from("donation_images")
          .getPublicUrl(upload.path);

        uploadedUrls.push(publicUrl.publicUrl);
      }

      // Insert donation
      const { error } = await supabase.from("donations").insert({
        donor_id: donor.id,
        ngo_id: form.ngo_id,
        category: form.category,
        donation_type: form.donation_type,
        priority: form.priority,
        description: form.description,
        amount:
          form.category === "Money" && form.amount
            ? Number(form.amount)
            : null,
        quantity:
          form.category !== "Money" && form.quantity
            ? Number(form.quantity)
            : null,

        image_url: uploadedUrls.length ? uploadedUrls[0] : null,
        additional_images: uploadedUrls, // NEW (optional)

        donor_phone: form.donor_phone,
        pickup_address: form.pickup_address,
        instructions: form.instructions,

        status: "Pending",
      });

      if (error) throw error;

      alert("✅ Donation submitted successfully!");
      navigate("/donor/dashboard");
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-xl rounded-2xl border border-blue-100">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600"
          >
            <ArrowLeft /> Back
          </button>
          <h1 className="text-2xl font-bold text-blue-700">
            Create Donation
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NGO SELECTION */}
          <div>
            <label className="font-semibold flex items-center gap-2">
              <Building2 /> Select NGO
            </label>

            <select
              className="p-3 w-full border rounded-lg mt-2"
              value={form.ngo_id}
              onChange={(e) => handleNGOChange(e.target.value)}
              required
            >
              <option value="">Choose NGO</option>
              {ngos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.city})
                </option>
              ))}
            </select>

            {/* NGO PREVIEW */}
            {selectedNGO && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border">
                <div className="flex gap-3">
                  <img
                    src={selectedNGO.image_url || "/placeholder.png"}
                    className="w-20 h-20 rounded-lg"
                  />
                  <div>
                    <h3 className="text-blue-700 font-bold">
                      {selectedNGO.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {selectedNGO.city}, {selectedNGO.state}
                    </p>

                    {donorLocation && selectedNGO.latitude && (
                      <p className="text-blue-700 text-sm font-medium mt-1">
                        📍 Distance:{" "}
                        {calcDistance(
                          donorLocation.lat,
                          donorLocation.lng,
                          selectedNGO.latitude,
                          selectedNGO.longitude
                        ).toFixed(1)}{" "}
                        km
                      </p>
                    )}

                    {selectedNGO.website && (
                      <a
                        href={selectedNGO.website}
                        className="text-blue-600 text-sm flex gap-1 mt-1"
                      >
                        <Globe size={14} /> Website
                      </a>
                    )}
                  </div>
                </div>

                {/* MAP */}
                {selectedNGO.latitude && (
                  <div className="mt-3">
                    <MapContainer
                      center={[selectedNGO.latitude, selectedNGO.longitude]}
                      zoom={14}
                      style={{ height: "150px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[selectedNGO.latitude, selectedNGO.longitude]}
                        icon={markerIcon}
                      />
                    </MapContainer>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CATEGORY */}
          <div>
            <label className="font-semibold">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              {[
                "Books",
                "Clothes",
                "Food",
                "Money",
                "Electronics",
                "Toys",
                "Stationery",
                "Medical Supplies",
                "Furniture",
                "Groceries",
                "Hygiene Kits",
                "Other",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* DONATION TYPE */}
          <div>
            <label className="font-semibold">Donation Type</label>
            <select
              value={form.donation_type}
              onChange={(e) =>
                setForm({ ...form, donation_type: e.target.value })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option>Pickup</option>
              <option>Drop-off</option>
              <option>Either</option>
            </select>
          </div>

          {/* PRIORITY */}
          <div>
            <label className="font-semibold">Priority</label>
            <select
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option>Normal</option>
              <option>Urgent</option>
              <option>High</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="font-semibold">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full p-3 border rounded-lg mt-2"
              placeholder="Describe your donation..."
            />
          </div>

          {/* AMOUNT OR QUANTITY */}
          {form.category === "Money" ? (
            <div>
              <label className="font-semibold">Amount (₹)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                className="w-full p-3 border rounded-lg mt-2"
              />
            </div>
          ) : (
            <div>
              <label className="font-semibold">Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                className="w-full p-3 border rounded-lg mt-2"
              />
            </div>
          )}

          {/* PICKUP DETAILS */}
          <div>
            <label className="font-semibold flex items-center gap-2">
              <MapPin /> Pickup Address
            </label>
            <input
              type="text"
              value={form.pickup_address}
              onChange={(e) =>
                setForm({ ...form, pickup_address: e.target.value })
              }
              className="mt-2 w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold">Donor Phone</label>
            <input
              type="text"
              value={form.donor_phone}
              onChange={(e) =>
                setForm({ ...form, donor_phone: e.target.value })
              }
              className="mt-2 w-full p-3 border rounded-lg"
            />
          </div>

          {/* INSTRUCTIONS */}
          <div>
            <label className="font-semibold flex gap-2">
              <Info /> Pickup Instructions
            </label>
            <textarea
              value={form.instructions}
              onChange={(e) =>
                setForm({ ...form, instructions: e.target.value })
              }
              className="w-full p-3 border rounded-lg mt-2"
              placeholder="Any special instructions for volunteers?"
            />
          </div>

          {/* MULTI IMAGE UPLOAD */}
          <div>
            <label className="font-semibold">Upload Images (max 5)</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
              className="mt-2"
            />

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="w-full h-24 rounded-lg object-cover border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            {uploading ? "Uploading..." : <><CheckCircle /> Submit Donation</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDonation;
