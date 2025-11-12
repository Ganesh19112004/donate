import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle } from "lucide-react";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    goal_amount: "",
    status: "Active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ngo = JSON.parse(localStorage.getItem("user") || "{}");

    const { error } = await supabase.from("ngo_campaigns").insert({
      ngo_id: ngo.id,
      title: form.title,
      description: form.description,
      goal_amount: Number(form.goal_amount),
      status: "Active",
    });

    if (error) alert("❌ Error creating campaign: " + error.message);
    else {
      alert("✅ Campaign created successfully!");
      navigate("/ngo/campaigns");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-10 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg space-y-4"
      >
        <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <PlusCircle /> Create New Campaign
        </h1>
        <input
          name="title"
          placeholder="Campaign Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded p-3"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded p-3"
          rows={4}
          required
        />
        <input
          name="goal_amount"
          type="number"
          placeholder="Goal Amount (₹)"
          value={form.goal_amount}
          onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
          className="w-full border rounded p-3"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full"
        >
          Create Campaign
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;
