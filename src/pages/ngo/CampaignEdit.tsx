// src/pages/ngo/CampaignEdit.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload } from "lucide-react";

export default function CampaignEdit() {
  const { id } = useParams(); // campaign ID
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    goal_amount: "",
    image_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ------------------------ Load Campaign ------------------------ */
  useEffect(() => {
    loadCampaign();
  }, []);

  const loadCampaign = async () => {
    const { data, error } = await supabase
      .from("ngo_campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert("Failed to load campaign!");
      return;
    }

    setForm({
      title: data.title || "",
      description: data.description || "",
      goal_amount: data.goal_amount || "",
      image_url: data.image_url || "",
    });

    setLoading(false);
  };

  /* ---------------------- Upload Image ---------------------- */
  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = `campaigns/${id}-${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("public")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      alert("Image upload failed!");
      return;
    }

    const url = supabase.storage
      .from("public")
      .getPublicUrl(fileName).data.publicUrl;

    setForm({ ...form, image_url: url });
  };

  /* ------------------------ Save Changes ------------------------ */
  const saveChanges = async () => {
    if (!form.title || !form.description || !form.goal_amount) {
      alert("All fields are required.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("ngo_campaigns")
      .update({
        title: form.title,
        description: form.description,
        goal_amount: Number(form.goal_amount),
        image_url: form.image_url,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert("Failed to update campaign!");
      return;
    }

    alert("Campaign updated successfully!");
    navigate("/ngo/campaigns");
  };

  if (loading) {
    return <p className="p-8 text-center">Loading campaign...</p>;
  }

  /* ---------------------------- UI ---------------------------- */
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow border">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-4 hover:underline"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-2xl font-bold mb-4">Edit Campaign</h1>

        {/* IMAGE */}
        <div className="mb-5">
          <p className="font-semibold mb-2">Campaign Image</p>

          {form.image_url ? (
            <img
              src={form.image_url}
              className="w-full h-48 object-cover rounded-lg mb-3"
              alt="Campaign"
            />
          ) : (
            <p className="text-gray-500 mb-2">No image uploaded yet.</p>
          )}

          <label className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 cursor-pointer px-4 py-2 rounded-lg w-fit">
            <Upload size={18} />
            Upload Image
            <input type="file" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        {/* TITLE */}
        <div className="mb-4">
          <label className="font-semibold">Title</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-4">
          <label className="font-semibold">Description</label>
          <textarea
            rows={4}
            className="w-full border p-2 rounded mt-1"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* GOAL AMOUNT */}
        <div className="mb-4">
          <label className="font-semibold">Goal Amount (₹)</label>
          <input
            type="number"
            className="w-full border p-2 rounded mt-1"
            value={form.goal_amount}
            onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={saveChanges}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
