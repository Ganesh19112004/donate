import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import {
  ArrowLeft,
  CheckCircle,
  Building2,
  Info,
  Package,
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
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",

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

  /* -------------------- FORM -------------------- */

  const [form, setForm] = useState({
    ngo_id: "",

    category: "Books",

    donation_type: "Pickup",

    quantity: "",

    description: "",

    donor_phone: "",

    instructions: "",

    item_condition: "",

    item_details: "",

    brand: "",

    age_group: "",

    weight: "",
  });

  /* -------------------- LOCATION -------------------- */

  const [pickupLocation, setPickupLocation] =
    useState({
      lat: 20.5937,
      lng: 78.9629,

      accuracy: null as number | null,

      map_source: "manual",
    });

  /* -------------------- MAP MARKER -------------------- */

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
            const newPos =
              e.target.getLatLng();

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

  /* -------------------- LOAD NGOs -------------------- */

  const [ngos, setNgos] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ngos")
        .select(
          "id, name, city, state, image_url"
        )
        .order("name");

      setNgos(data || []);
    })();
  }, []);

  /* -------------------- LOAD DONOR -------------------- */

  useEffect(() => {
    const donor = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    setForm((f) => ({
      ...f,

      donor_phone: donor.phone || "",
    }));
  }, []);

  /* -------------------- GPS -------------------- */

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

      () =>
        alert("Failed to get location")
    );
  };

  /* -------------------- IMAGE -------------------- */

  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const handleImage = (e: any) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  /* -------------------- SUBMIT -------------------- */

  const [uploading, setUploading] =
    useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setUploading(true);

    const donor = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    let uploadedImageUrl: string | null =
      null;

    try {
      /* IMAGE UPLOAD */

      if (image) {
        const ext =
          image.name.split(".").pop();

        const fileName = `${donor.id}-${Date.now()}.${ext}`;

        const upload =
          await supabase.storage
            .from("donation-images")
            .upload(fileName, image, {
              upsert: true,
            });

        if (upload.error)
          throw upload.error;

        uploadedImageUrl =
          supabase.storage
            .from("donation-images")
            .getPublicUrl(upload.data.path)
            .data.publicUrl;
      }

      /* SAVE DONATION */

      const { error } = await supabase
        .from("donations")
        .insert({
          donor_id: donor.id,

          ngo_id: form.ngo_id,

          category: form.category,

          quantity: Number(
            form.quantity
          ),

          donation_type:
            form.donation_type,

          description:
            form.description,

          donor_phone:
            form.donor_phone,

          instructions:
            form.instructions,

          image_url:
            uploadedImageUrl,

          item_condition:
            form.item_condition,

          item_details:
            form.item_details,

          brand: form.brand,

          age_group:
            form.age_group,

          weight: form.weight,

          pickup_latitude:
            pickupLocation.lat,

          pickup_longitude:
            pickupLocation.lng,

          pickup_accuracy:
            pickupLocation.accuracy,

          pickup_map_source:
            pickupLocation.map_source,

          status: "Pending",
        });

      if (error) throw error;

      alert(
        "🎉 Donation submitted successfully!"
      );

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

        {/* HEADER */}

        <div className="flex justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 flex items-center gap-2"
          >
            <ArrowLeft />
            Back
          </button>

          <h2 className="text-2xl font-bold text-blue-700">
            Create Item Donation
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* NGO */}

          <div>
            <label className="font-semibold flex items-center gap-2">
              <Building2 />
              Select NGO
            </label>

            <select
              required
              value={form.ngo_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  ngo_id:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option value="">
                Choose NGO
              </option>

              {ngos.map((n) => (
                <option
                  key={n.id}
                  value={n.id}
                >
                  {n.name} — {n.city}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}

          <div>
            <label className="font-semibold flex items-center gap-2">
              <Package />
              Donation Category
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              {[
                "Books",
                "Clothes",
                "School Supplies",
                "Electronics",
                "Mobiles",
                "Laptops",
                "Furniture",
                "Medical Equipment",
                "Wheelchairs",
                "Blankets",
                "Toys",
                "Sports Equipment",
                "Kitchen Items",
                "Baby Care",
                "Hygiene Products",
                "Other",
              ].map((cat) => (
                <option key={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ITEM DETAILS */}

          <div>
            <label className="font-semibold">
              Item Details
            </label>

            <input
              required
              type="text"
              placeholder="Example: Winter Jackets / Study Table / 10th Science Books"
              value={form.item_details}
              onChange={(e) =>
                setForm({
                  ...form,
                  item_details:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* CONDITION */}

          <div>
            <label className="font-semibold">
              Item Condition
            </label>

            <select
              value={
                form.item_condition
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  item_condition:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option value="">
                Select Condition
              </option>

              <option>
                Brand New
              </option>

              <option>
                Like New
              </option>

              <option>
                Good
              </option>

              <option>
                Used
              </option>
            </select>
          </div>

          {/* BRAND */}

          <div>
            <label className="font-semibold">
              Brand / Company
            </label>

            <input
              type="text"
              placeholder="Example: HP, Dell, Samsung"
              value={form.brand}
              onChange={(e) =>
                setForm({
                  ...form,
                  brand:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* AGE GROUP */}

          <div>
            <label className="font-semibold">
              Suitable For
            </label>

            <select
              value={form.age_group}
              onChange={(e) =>
                setForm({
                  ...form,
                  age_group:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option value="">
                Select
              </option>

              <option>
                Children
              </option>

              <option>
                Teenagers
              </option>

              <option>
                Adults
              </option>

              <option>
                Senior Citizens
              </option>

              <option>
                Everyone
              </option>
            </select>
          </div>

          {/* QUANTITY */}

          <div>
            <label className="font-semibold">
              Quantity
            </label>

            <input
              required
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* WEIGHT */}

          <div>
            <label className="font-semibold">
              Estimated Weight
            </label>

            <input
              type="text"
              placeholder="Example: 5 KG"
              value={form.weight}
              onChange={(e) =>
                setForm({
                  ...form,
                  weight:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* PICKUP TYPE */}

          <div>
            <label className="font-semibold">
              Pickup Preference
            </label>

            <select
              value={
                form.donation_type
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  donation_type:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            >
              <option>
                Pickup
              </option>

              <option>
                Drop-off
              </option>

              <option>
                Either
              </option>
            </select>
          </div>

          {/* IMAGE */}

          <div>
            <label className="font-semibold">
              Upload Item Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="mt-2"
            />

            {preview && (
              <img
                src={preview}
                className="h-32 mt-3 rounded-lg border object-cover"
              />
            )}
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="font-semibold">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
              placeholder="Add additional details about donation item"
            />
          </div>

          {/* INSTRUCTIONS */}

          <div>
            <label className="font-semibold flex items-center gap-2">
              <Info />
              Pickup Instructions
            </label>

            <textarea
              value={form.instructions}
              onChange={(e) =>
                setForm({
                  ...form,
                  instructions:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
              placeholder="Landmark, timing, floor number etc."
            />
          </div>

          {/* PHONE */}

          <div>
            <label className="font-semibold">
              Donor Phone
            </label>

            <input
              value={form.donor_phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  donor_phone:
                    e.target.value,
                })
              }
              className="w-full p-3 border rounded-lg mt-2"
            />
          </div>

          {/* GPS */}

          <button
            type="button"
            onClick={detectGPS}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            📍 Use My GPS Location
          </button>

          {/* MAP */}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">
              Pickup Location
            </h3>

            <MapContainer
              center={[
                pickupLocation.lat,
                pickupLocation.lng,
              ]}
              zoom={14}
              style={{
                height: "250px",
                width: "100%",
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <MapRefresher
                location={
                  pickupLocation
                }
              />

              <DraggableMarker />
            </MapContainer>

            <p className="text-sm mt-2 text-gray-700">
              Lat:
              {
                pickupLocation.lat
              }{" "}
              | Lng:
              {
                pickupLocation.lng
              }

              <br />

              Accuracy:
              {" "}
              {pickupLocation.accuracy ||
                "N/A"}

              <br />

              Source:
              {" "}
              {
                pickupLocation.map_source
              }
            </p>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            {uploading ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle />
                Submit Donation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}