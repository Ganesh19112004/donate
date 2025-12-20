import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ================= LEAFLET ICON FIX ================= */
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* ================= MAP REFRESH ================= */
const MapRefresher = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.latitude, location.longitude]);
  }, [location, map]);
  return null;
};

export default function NGOProfile() {
  const navigate = useNavigate();
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [location, setLocation] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    accuracy: null,
    map_source: "manual",
  });

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!ngo?.id) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("ngos")
        .select("*")
        .eq("id", ngo.id)
        .single();

      if (error) {
        alert("Failed to load profile");
        return;
      }

      setProfile(data);

      if (data.latitude && data.longitude) {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.location_accuracy,
          map_source: data.map_source || "manual",
        });
      }
    };

    load();
  }, [ngo?.id]);

  /* ================= FORM ================= */
  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* ================= GPS ================= */
  const handleDetectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          map_source: "gps",
        });
        alert("📍 Location updated");
      },
      () => alert("Failed to get GPS location")
    );
  };

  /* ================= MAP MARKER ================= */
  const DraggableMarker = () => {
    const [markerPos, setMarkerPos] = useState({
      lat: location.latitude,
      lng: location.longitude,
    });

    useMapEvents({
      click(e) {
        setMarkerPos(e.latlng);
        setLocation({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
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
            const pos = e.target.getLatLng();
            setMarkerPos(pos);
            setLocation({
              latitude: pos.lat,
              longitude: pos.lng,
              accuracy: null,
              map_source: "manual",
            });
          },
        }}
      />
    );
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!ngo?.id) return alert("Invalid NGO");

    let imageUrl = profile.image_url;
    let imagePath = profile.image_path;

    /* -------- IMAGE UPLOAD -------- */
    if (imageFile) {
      if (imagePath) {
        await supabase.storage.from("ngo_images").remove([imagePath]);
      }

      const path = `${ngo.id}/${Date.now()}-${imageFile.name}`;
      const upload = await supabase.storage
        .from("ngo_images")
        .upload(path, imageFile, { upsert: true });

      if (upload.error) {
        alert(upload.error.message);
        return;
      }

      imagePath = path;
      imageUrl = supabase.storage
        .from("ngo_images")
        .getPublicUrl(path).data.publicUrl;
    }

    /* -------- UPDATE DB -------- */
    const { error } = await supabase
      .from("ngos")
      .update({
        name: profile.name,
        description: profile.description,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        website: profile.website,
        facebook: profile.facebook,
        instagram: profile.instagram,
        twitter: profile.twitter,
        image_url: imageUrl,
        image_path: imagePath,
        latitude: location.latitude,
        longitude: location.longitude,
        location_accuracy: location.accuracy,
        map_source: location.map_source,
        updated_at: new Date(),
      })
      .eq("id", ngo.id);

    if (error) {
      console.error(error);
      alert("❌ Failed to save profile");
    } else {
      alert("✅ Profile updated successfully");
      window.location.reload();
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="flex justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 flex gap-1"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-blue-700">NGO Profile</h1>
      </div>

      {/* IMAGE */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={previewUrl || profile.image_url || "/placeholder.png"}
          className="w-32 h-32 rounded-full object-cover border"
        />
        <label className="mt-3 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
          Upload Image
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </label>
      </div>

      {/* FORM */}
      <div className="space-y-4">
        {[
          ["name", "NGO Name"],
          ["phone", "Phone"],
          ["address", "Address"],
          ["city", "City"],
          ["state", "State"],
          ["country", "Country"],
          ["website", "Website"],
          ["facebook", "Facebook"],
          ["instagram", "Instagram"],
          ["twitter", "Twitter"],
        ].map(([key, label]) => (
          <input
            key={key}
            name={key}
            value={profile[key] || ""}
            onChange={handleChange}
            className="w-full border rounded p-3"
            placeholder={label}
          />
        ))}

        <textarea
          name="description"
          value={profile.description || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="About NGO"
        />
      </div>

      {/* MAP */}
      <div className="mt-8">
        <button
          onClick={handleDetectLocation}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          📍 Use GPS Location
        </button>

        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={14}
          style={{ height: "350px", marginTop: 20 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapRefresher location={location} />
          <DraggableMarker />
        </MapContainer>
      </div>

      <button
        onClick={handleSave}
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded text-lg"
      >
        Save Changes
      </button>
    </div>
  );
}
