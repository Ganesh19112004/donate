import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, CheckCircle, Building2, Globe, Phone } from "lucide-react";

const CreateDonation = () => {
  const [form, setForm] = useState({
    ngo_id: "",
    category: "Books",
    description: "",
    amount: "",
    quantity: "",
  });
  const [ngos, setNgos] = useState<any[]>([]);
  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // 🏢 Fetch NGOs properly
  useEffect(() => {
    const fetchNgos = async () => {
      const { data, error } = await supabase
        .from("ngos")
        .select("id, name, city, state, country, verified, image_url, description, website, phone")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading NGOs:", error);
        alert("⚠️ Unable to load NGOs. Try again later.");
      } else {
        setNgos(data || []);
      }
    };
    fetchNgos();
  }, []);

  // 🧠 Handle form updates
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Update selected NGO details dynamically
    if (name === "ngo_id") {
      const selected = ngos.find((n) => n.id === value);
      setSelectedNGO(selected || null);
    }
  };

  // 🖼️ Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 💾 Submit donation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ngo_id) return alert("Please select an NGO to donate to.");
    if (!form.description.trim()) return alert("Please enter a donation description.");

    setUploading(true);
    const donor = JSON.parse(localStorage.getItem("user") || "{}");

    if (!donor.id) {
      alert("⚠️ User session not found. Please log in again.");
      navigate("/auth");
      return;
    }

    let imageUrl: string | null = null;

    try {
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `${donor.id}-${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("donation_images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("donation_images")
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrl.publicUrl;
      }

      const { error } = await supabase.from("donations").insert({
        donor_id: donor.id,
        ngo_id: form.ngo_id,
        category: form.category,
        description: form.description,
        amount: form.category === "Money" && form.amount ? Number(form.amount) : null,
        quantity: form.category !== "Money" && form.quantity ? Number(form.quantity) : null,
        image_url: imageUrl,
        status: "Pending",
      });

      if (error) throw error;

      alert("✅ Donation created successfully!");
      navigate("/donor/dashboard");
    } catch (err: any) {
      console.error("Error creating donation:", err);
      alert("❌ " + (err.message || "Failed to create donation"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-extrabold text-blue-700">Create Donation</h1>
      </div>

      {/* Donation Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl border border-gray-200 rounded-2xl p-8 w-full max-w-3xl space-y-6"
      >
        {/* NGO Selection */}
        <div>
          <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
            <Building2 size={18} /> Select NGO
          </label>
          <select
            name="ngo_id"
            value={form.ngo_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">-- Choose an NGO --</option>
            {ngos.length === 0 ? (
              <option disabled>Loading NGOs...</option>
            ) : (
              ngos.map((ngo) => (
                <option key={ngo.id} value={ngo.id}>
                  {ngo.name} {ngo.city ? `(${ngo.city})` : ""}
                </option>
              ))
            )}
          </select>

          {/* Selected NGO Preview */}
          {selectedNGO && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-4">
              <img
                src={selectedNGO.image_url || "/placeholder.png"}
                alt={selectedNGO.name}
                className="w-16 h-16 rounded-lg object-cover border"
              />
              <div>
                <h3 className="font-semibold text-blue-700">{selectedNGO.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedNGO.city}, {selectedNGO.state || ""} {selectedNGO.country || ""}
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {selectedNGO.description || "No description available."}
                </p>
                <div className="flex gap-3 mt-2 text-xs text-gray-600">
                  {selectedNGO.website && (
                    <a
                      href={selectedNGO.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Globe size={12} /> Website
                    </a>
                  )}
                  {selectedNGO.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {selectedNGO.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
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
            ].map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your donation..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
            rows={3}
          />
        </div>

        {/* Amount / Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {form.category === "Money" ? (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Number of items"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Upload Image (optional)</label>
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-blue-50 transition">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg mb-3 shadow"
              />
            ) : (
              <Upload className="text-blue-500 mb-3" size={36} />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition"
            >
              {previewUrl ? "Change Image" : "Choose Image"}
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 transition"
        >
          {uploading ? (
            <>
              <span className="animate-spin">⏳</span> Uploading...
            </>
          ) : (
            <>
              <CheckCircle size={20} /> Submit Donation
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateDonation;
