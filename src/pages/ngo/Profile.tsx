import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet Marker Icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Map Refresher Component
const MapRefresher = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.latitude, location.longitude]);
  }, [location]);
  return null;
};

export default function NGOProfile() {
  const navigate = useNavigate();
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [location, setLocation] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    accuracy: null as number | null,
    map_source: "manual",
  });

  // ------------------ LOAD PROFILE ------------------
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ngos")
        .select("*")
        .eq("id", ngo.id)
        .single();

      if (data) {
        setProfile(data);
        if (data.latitude && data.longitude) {
          setLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.location_accuracy,
            map_source: data.map_source || "manual",
          });
        }
      }
    })();
  }, []);

  // ------------------ FORM HANDLING ------------------
  const handleChange = (e: any) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ------------------ GPS LOCATION ------------------
  const handleDetectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          map_source: "gps",
        });

        alert("📍 GPS Location Updated!");
      },
      () => alert("Failed to get GPS location")
    );
  };

  // ------------------ DRAGGABLE MAP MARKER ------------------
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
            const newPos = e.target.getLatLng();
            setMarkerPos(newPos);

            setLocation({
              latitude: newPos.lat,
              longitude: newPos.lng,
              accuracy: null,
              map_source: "manual",
            });
          },
        }}
      />
    );
  };

  // ------------------ SAVE PROFILE ------------------
  const handleSave = async () => {
    let finalImageUrl = profile.image_url;
    let finalImagePath = profile.image_path;

    // -------- 1. Upload new image --------
    if (imageFile) {
      // Delete old image if exists
      if (finalImagePath) {
        await supabase.storage.from("ngo_images").remove([finalImagePath]);
      }

      const filePath = `${ngo.id}/${Date.now()}-${imageFile.name}`;
      const upload = await supabase.storage
        .from("ngo_images")
        .upload(filePath, imageFile);

      if (upload.error) {
        alert("❌ Image upload failed!");
      } else {
        finalImagePath = filePath;
        finalImageUrl = supabase.storage
          .from("ngo_images")
          .getPublicUrl(filePath).data.publicUrl;
      }
    }

    // -------- 2. Update DB --------
    const { error } = await supabase
      .from("ngos")
      .update({
        ...profile,
        image_url: finalImageUrl,
        image_path: finalImagePath,
        latitude: location.latitude,
        longitude: location.longitude,
        location_accuracy: location.accuracy,
        map_source: location.map_source,
        updated_at: new Date(),
      })
      .eq("id", ngo.id);

    if (error) {
      alert("❌ Failed to save profile.");
    } else {
      alert("✅ Profile updated successfully!");
      window.location.reload();
    }
  };

  // ------------------ UI ------------------
  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 flex items-center gap-1"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-blue-700">NGO Profile</h1>
      </div>

      {/* IMAGE UPLOAD */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={previewUrl || profile.image_url || "/placeholder.png"}
          className="w-32 h-32 rounded-full object-cover border shadow"
        />
        <label className="mt-3 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md">
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      </div>

      {/* PROFILE FORM */}
      <div className="space-y-4">
        <input
          name="name"
          value={profile.name || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="NGO Name"
        />

        <textarea
          name="description"
          value={profile.description || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="About NGO"
        />

        <input
          name="phone"
          value={profile.phone || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="Phone Number"
        />

        <input
          name="address"
          value={profile.address || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="Full Address"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="city"
            value={profile.city || ""}
            onChange={handleChange}
            className="w-full border rounded p-3"
            placeholder="City"
          />
          <input
            name="state"
            value={profile.state || ""}
            onChange={handleChange}
            className="w-full border rounded p-3"
            placeholder="State"
          />
        </div>

        <input
          name="country"
          value={profile.country || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="Country"
        />

        {/* WEBSITE + SOCIALS */}
        <input
          name="website"
          value={profile.website || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="Website Link"
        />

        <input
          name="facebook"
          value={profile.facebook || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="Facebook Link"
        />

        <input
          name="instagram"
          value={profile.instagram || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="Instagram Link"
        />

        <input
          name="twitter"
          value={profile.twitter || ""}
          onChange={handleChange}
          className="w-full border rounded p-3"
          placeholder="Twitter Link"
        />
      </div>

      {/* MAP SECTION */}
      <div className="mt-8">
        <h2 className="font-semibold text-lg mb-2">NGO Location (Map)</h2>

        <button
          onClick={handleDetectLocation}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          📍 Use My GPS Location
        </button>

        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={14}
          style={{ height: "350px", width: "100%", marginTop: "20px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapRefresher location={location} />
          <DraggableMarker />
        </MapContainer>

        <p className="text-sm text-gray-700 mt-2">
          Lat: {location.latitude} | Lng: {location.longitude} <br />
          Accuracy: {location.accuracy || "N/A"} <br />
          Location Source: {location.map_source}
        </p>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded text-lg"
      >
        Save Changes
      </button>
    </div>
  );
}
