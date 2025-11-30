import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker image issue
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to move map programmatically
const MapRefresher = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([location.latitude, location.longitude]);
  }, [location]);
  return null;
};

const NGOProfile = () => {
  const navigate = useNavigate();
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Location state
  const [location, setLocation] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    accuracy: null as number | null,
    map_source: "manual",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from("ngos").select("*").eq("id", ngo.id).single();

      setProfile(data || {});

      if (data?.latitude && data?.longitude) {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.location_accuracy || null,
          map_source: data.map_source || "manual",
        });
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: any) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 📍 Detect GPS
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

  // Draggable marker + click events
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

  // SAVE
  const handleSave = async () => {
    let imageUrl = profile.image_url;

    if (imageFile) {
      const fileName = `${ngo.id}-${Date.now()}`;
      const { data } = await supabase.storage.from("ngo_images").upload(fileName, imageFile);

      if (data) {
        imageUrl = supabase.storage.from("ngo_images").getPublicUrl(data.path).data.publicUrl;
      }
    }

    const { error } = await supabase
      .from("ngos")
      .update({
        ...profile,
        image_url: imageUrl,
        latitude: location.latitude,
        longitude: location.longitude,
        location_accuracy: location.accuracy,
        map_source: location.map_source,
      })
      .eq("id", ngo.id);

    if (error) alert("❌ Could NOT save");
    else alert("✅ Profile updated!");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-blue-600 flex items-center gap-1">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-blue-700">NGO Profile</h1>
      </div>

      <div className="space-y-4">

        {/* IMAGE */}
        <div className="flex flex-col items-center">
          <img
            src={previewUrl || profile.image_url || "/placeholder.png"}
            className="w-28 h-28 rounded-full object-cover border mb-2"
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* TEXT FIELDS */}
        <input className="w-full border rounded p-3" name="name" value={profile.name || ""} onChange={handleChange} placeholder="NGO Name" />
        <textarea className="w-full border rounded p-3" name="description" value={profile.description || ""} onChange={handleChange} placeholder="About NGO" />
        <input className="w-full border rounded p-3" name="city" value={profile.city || ""} onChange={handleChange} placeholder="City" />
        <input className="w-full border rounded p-3" name="phone" value={profile.phone || ""} onChange={handleChange} placeholder="Contact Number" />

        {/* MAP */}
        <div className="space-y-2">
          <label className="font-semibold text-lg">NGO Live Map Location</label>

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

          <p className="text-sm text-gray-700">
            Lat: {location.latitude} | Lng: {location.longitude}<br />
            Accuracy: {location.accuracy ? `${location.accuracy}m` : "N/A"}<br />
            Source: {location.map_source}
          </p>
        </div>

        {/* SAVE */}
        <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2 rounded">
          Save Changes
        </button>

      </div>
    </div>
  );
};

export default NGOProfile;
