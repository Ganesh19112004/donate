import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Upload, Loader2 } from "lucide-react";

export default function CreateCampaign() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    goal_amount: "",
  });

  const handleUpload = async () => {
    if (!image) return null;

    const fileName = `campaign_${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from("campaigns")
      .upload(fileName, image);

    if (error) return null;

    const url = supabase.storage.from("campaigns").getPublicUrl(fileName).data.publicUrl;
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const ngo = JSON.parse(localStorage.getItem("user") || "{}");

    const imageUrl = await handleUpload();

    const { error } = await supabase.from("ngo_campaigns").insert({
      ngo_id: ngo.id,
      title: form.title,
      description: form.description,
      goal_amount: Number(form.goal_amount),
      status: "Active",
      image_url: imageUrl,
    });

    setLoading(false);

    if (error) {
      alert("❌ Error: " + error.message);
    } else {
      alert("✅ Campaign created successfully!");
      navigate("/ngo/campaigns");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl space-y-6 border"
      >
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <PlusCircle size={28} /> Create Campaign
        </h1>

        {/* Image Upload */}
        <label className="border-2 border-dashed p-6 rounded-xl text-center cursor-pointer bg-gray-50 hover:bg-gray-100">
          <Upload size={24} className="mx-auto mb-2" />
          <p>Upload Campaign Banner</p>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>
        {image && (
          <p className="text-sm text-green-600">Selected: {image.name}</p>
        )}

        <input
          name="title"
          placeholder="Campaign Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border p-3 rounded-lg"
          required
        />

        <textarea
          name="description"
          placeholder="Campaign Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="w-full border p-3 rounded-lg"
          required
        />

        <input
          type="number"
          name="goal_amount"
          placeholder="Goal Amount (₹)"
          value={form.goal_amount}
          onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
          className="w-full border p-3 rounded-lg"
          required
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded-lg w-full flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <PlusCircle />} 
          Create Campaign
        </button>
      </form>
    </div>
  );
}
