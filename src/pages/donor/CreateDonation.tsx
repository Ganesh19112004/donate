// src/pages/donor/CreateDonation.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  CheckCircle,
  Building2,
  MapPin,
  Info,
} from "lucide-react";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* -------------------- Marker Icon -------------------- */
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* -------------------- Map Refresher -------------------- */
const MapRefresher = ({ location }: any) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lng]);
  }, [location]);
  return null;
};

export default function CreateDonation() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ngo_id: "",
    category: "Books",
    donation_type: "Pickup",
    description: "",
    quantity: "",
    donor_phone: "",
    instructions: "",
  });

  /* -------------------- LOCATION -------------------- */
  const [pickupLocation, setPickupLocation] = useState({
    lat: 20.5937,
    lng: 78.9629,
    accuracy: null as number | null,
    map_source: "manual",
  });

  /* -------------------- Map Marker -------------------- */
  const DraggableMarker = () => {
    const [markerPos, setMarkerPos] = useState({
      lat: pickupLocation.lat,
      lng: pickupLocation.lng,
    });

    useMapEvents({
      click(e) {
        setMarkerPos(e.latlng);
        setPickupLocation({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          accuracy: null,
          map_source: "manual",
        });
      },
    });

    return (
      <Marker
        draggable
        icon={markerIcon}
        position={markerPos}
        eventHandlers={{
          dragend: (e) => {
            const newPos = e.target.getLatLng();
            setMarkerPos(newPos);
            setPickupLocation({
              lat: newPos.lat,
              lng: newPos.lng,
              accuracy: null,
              map_source: "manual",
            });
          },
        }}
      />
    );
  };

  /* ---------------------- Load NGOs ---------------------- */
  const [ngos, setNgos] = useState<any[]>([]);
  const [selectedNGO, setSelectedNGO] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ngos")
        .select("id, name, city, state, latitude, longitude, image_url")
        .order("name");

      setNgos(data || []);
    })();
  }, []);

  /* ---------------------- Load Donor ---------------------- */
  useEffect(() => {
    const donor = JSON.parse(localStorage.getItem("user") || "{}");
    setForm((f) => ({
      ...f,
      donor_phone: donor.phone || "",
    }));
  }, []);

  /* ---------------------- Select NGO ---------------------- */
  const handleNGOChange = (id: string) => {
    const ngo = ngos.find((n) => n.id === id);
    setSelectedNGO(ngo);
    setForm({ ...form, ngo_id: id });
  };

  /* ---------------------- GPS Detect ---------------------- */
  const detectGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickupLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          map_source: "gps",
        });
        alert("📍 GPS Location Set!");
      },
      () => alert("Failed to get location")
    );
  };

  /* ---------------------- Image Upload ---------------------- */
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =====================================================
                      SUBMIT HANDLER
     ===================================================== */

  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setUploading(true);

    const donor = JSON.parse(localStorage.getItem("user") || "{}");
    let uploadedImageUrl: string | null = null;

    try {
      // Upload item image
      if (image) {
        const ext = image.name.split(".").pop();
        const fileName = `${donor.id}-${Date.now()}.${ext}`;

        const upload = await supabase.storage
          .from("donation_images")
          .upload(fileName, image);

        if (upload.error) throw upload.error;

        uploadedImageUrl = supabase.storage
          .from("donation_images")
          .getPublicUrl(upload.data.path).data.publicUrl;
      }

      // Save donation
      const { error } = await supabase.from("donations").insert({
        donor_id: donor.id,
        ngo_id: form.ngo_id,
        category: form.category,
        quantity: Number(form.quantity),
        donation_type: form.donation_type,

        description: form.description,
        donor_phone: form.donor_phone,
        instructions: form.instructions,

        image_url: uploadedImageUrl,

        pickup_latitude: pickupLocation.lat,
        pickup_longitude: pickupLocation.lng,
        pickup_accuracy: pickupLocation.accuracy,
        pickup_map_source: pickupLocation.map_source,

        status: "Pending",
      });

      if (error) throw error;

      alert("🎉 Donation submitted!");
      navigate("/donor/dashboard");
    } catch (err: any) {
      alert("❌ " + err.message);
    }

    setUploading(false);
  };

  /* =====================================================
                          UI
     ===================================================== */

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-xl rounded-2xl">

        <div className="flex justify-between mb-6">
          <button onClick={() => navigate(-1)} className="text-blue-600 flex items-center gap-2">
            <ArrowLeft /> Back
          </button>
          <h2 className="text-2xl font-bold text-blue-700">Create Donation</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NGO SELECT */}
          <div>
            <label className="font-semibold flex items-center gap-2">
              <Building2 /> Select NGO
            </label>

            <select
              required
              value={form.ngo_id}
              onChange={(e) => handleNGOChange(e.target.value)}
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option value="">Choose NGO</option>
              {ngos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} — {n.city}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="font-semibold">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full p-3 border rounded-lg mt-2"
            >
              {[
                "Books",
                "Clothes",
                "Food",
                "Electronics",
                "Toys",
                "Furniture",
                "Groceries",
                "Hygiene Kits",
                "Medical Supplies",
                "Other",
              ].map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* QUANTITY */}
          <div>
            <label className="font-semibold">Quantity</label>
            <input
              required
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* DONATION TYPE */}
          <div>
            <label className="font-semibold">Donation Type</label>
            <select
              value={form.donation_type}
              onChange={(e) => setForm({ ...form, donation_type: e.target.value })}
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option>Pickup</option>
              <option>Drop-off</option>
              <option>Either</option>
            </select>
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="font-semibold">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleImage} />

            {preview && (
              <img src={preview} className="h-24 mt-3 rounded-lg border object-cover" />
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="font-semibold">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* INSTRUCTIONS */}
          <div>
            <label className="font-semibold flex items-center gap-2">
              <Info /> Instructions
            </label>
            <textarea
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="font-semibold">Donor Phone</label>
            <input
              value={form.donor_phone}
              onChange={(e) => setForm({ ...form, donor_phone: e.target.value })}
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* GPS BUTTON */}
          <button
            type="button"
            onClick={detectGPS}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            📍 Use My GPS Location
          </button>

          {/* LOCATION MAP */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Pickup Location</h3>

            <MapContainer
              center={[pickupLocation.lat, pickupLocation.lng]}
              zoom={14}
              style={{ height: "250px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapRefresher location={pickupLocation} />
              <DraggableMarker />
            </MapContainer>

            <p className="text-sm mt-2 text-gray-700">
              Lat: {pickupLocation.lat} | Lng: {pickupLocation.lng} <br />
              Accuracy: {pickupLocation.accuracy || "N/A"} <br />
              Source: {pickupLocation.map_source}
            </p>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            {uploading ? "Saving..." : <><CheckCircle /> Submit Donation</>}
          </button>
        </form>
      </div>
    </div>
  );
}
