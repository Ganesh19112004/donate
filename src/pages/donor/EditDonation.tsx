import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";

const EditDonation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<any>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("donations").select("*").eq("id", id).single();
      if (error) {
        alert("Failed to load donation.");
        return;
      }
      setDonation(data);
      setCategory(data.category);
      setDescription(data.description);
      setQuantity(data.quantity || 1);
      setAmount(data.amount || "");
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donation) return;
    if (donation.status !== "Pending") return alert("Cannot edit after NGO accepts.");
    setSaving(true);
    try {
      const { error } = await supabase.from("donations").update({
        category, description, quantity, amount: category === "Money" ? amount : null, updated_at: new Date()
      }).eq("id", donation.id);
      if (error) throw error;

      await supabase.from("donation_events").insert({
        donation_id: donation.id,
        event: "Edited by donor",
        note: "Donor updated donation details"
      });

      alert("Updated.");
      navigate(`/donor/details/${donation.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!donation) return <div className="p-8">Donation not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Edit Donation</h1>
          <Link to={`/donor/details/${donation.id}`} className="text-blue-600 hover:underline">
            <ArrowLeft size={14}/> Back
          </Link>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <label className="block">
            <span>Category</span>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded">
              <option value="">--select--</option>
              <option>Electronics</option>
              <option>Clothes</option>
              <option>Books</option>
              <option>Stationeries</option>
              <option>Housing Staffs</option>
              <option>Money</option>
            </select>
          </label>

          <label className="block">
            <span>Description</span>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded" required/>
          </label>

          {category !== "Money" ? (
            <label className="block">
              <span>Quantity</span>
              <input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} min={1} className="w-full border p-2 rounded" />
            </label>
          ) : (
            <label className="block">
              <span>Amount (₹)</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded" />
            </label>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDonation;
