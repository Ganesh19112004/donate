import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, AlertTriangle, CheckCircle, Package } from "lucide-react";

const NGONeeds = () => {
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    quantity: "",
    urgency: "medium",
  });

  useEffect(() => {
    loadNeeds();
  }, []);

  const loadNeeds = async () => {
    const { data } = await supabase
      .from("ngo_needs")
      .select("*")
      .eq("ngo_id", ngo.id)
      .order("created_at", { ascending: false });

    setNeeds(data || []);
    setLoading(false);
  };

  const addNeed = async () => {
    if (!form.title || !form.category) {
      alert("Category & title are required!");
      return;
    }

    await supabase.from("ngo_needs").insert({
      ngo_id: ngo.id,
      ...form,
      quantity: Number(form.quantity),
    });

    setForm({ category: "", title: "", description: "", quantity: "", urgency: "medium" });
    loadNeeds();
  };

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-700 mb-8">📦 Needed Items</h1>

      {/* Add Need Form */}
      <div className="bg-white p-6 rounded-2xl shadow mb-12">
        <h2 className="text-xl font-semibold mb-4">➕ Add New Required Item</h2>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Category (Clothes, Food...)"
            className="p-3 border rounded-lg"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <input
            type="text"
            placeholder="Title"
            className="p-3 border rounded-lg"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            type="number"
            placeholder="Quantity"
            className="p-3 border rounded-lg"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </div>

        <textarea
          placeholder="Description"
          className="p-3 border rounded-lg w-full mb-4"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          className="p-3 border rounded-lg mb-4"
          value={form.urgency}
          onChange={(e) => setForm({ ...form, urgency: e.target.value })}
        >
          <option value="low">Low Urgency</option>
          <option value="medium">Medium Urgency</option>
          <option value="high">High Urgency</option>
        </select>

        <button
          onClick={addNeed}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2"
        >
          <PlusCircle /> Add Item
        </button>
      </div>

      {/* Needs List */}
      <h2 className="text-2xl font-bold mb-4">📋 Current Needed Items</h2>

      {loading ? (
        <p>Loading...</p>
      ) : needs.length === 0 ? (
        <p className="text-gray-600">No items listed.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {needs.map((need) => (
            <div key={need.id} className="bg-white p-6 rounded-2xl shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-blue-700">{need.title}</h3>
                <UrgencyTag urgency={need.urgency} />
              </div>

              <p className="text-gray-700">{need.description}</p>

              <p className="mt-3 text-gray-600">
                <strong>Category:</strong> {need.category}
              </p>

              <p className="mt-1 text-gray-600">
                <strong>Quantity:</strong> {need.quantity}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UrgencyTag = ({ urgency }: any) => {
  const map: any = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${map[urgency]}`}>
      {urgency.toUpperCase()}
    </span>
  );
};

export default NGONeeds;
