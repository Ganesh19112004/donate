import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import {
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ApprovalsPage = () => {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("ngos")
      .select("*")
      .eq("verified", false);

    if (error) {
      console.error(error);
      alert("Failed to load data");
      setLoading(false);
      return;
    }

    setPending(data || []);
    setLoading(false);
  };

  /* ------------------ Approve NGO ------------------ */
  const approveNGO = async (ngoId: string) => {
    if (!confirm("Approve this NGO?")) return;

    const { error } = await supabase
      .from("ngos")
      .update({ verified: true })
      .eq("id", ngoId);

    if (error) {
      console.error(error);
      alert("Failed to approve");
      return;
    }

    alert("NGO approved successfully");
    setSelected(null);
    loadPending();
  };

  /* ------------------ Reject NGO ------------------ */
  const rejectNGO = async (ngoId: string) => {
    if (!confirm("Reject this NGO? It will be removed permanently.")) return;

    const { error } = await supabase
      .from("ngos")
      .delete()
      .eq("id", ngoId);

    if (error) {
      console.error(error);
      alert("Failed to reject / delete NGO");
      return;
    }

    alert("NGO rejected & deleted");
    setSelected(null);
    loadPending();
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        <Loader2 className="animate-spin" size={30} />
        Loading pending NGOs...
      </div>
    );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
        NGO Approval Requests
      </h1>

      {/* List */}
      <div className="bg-white rounded-xl shadow p-6">
        {pending.length === 0 ? (
          <p className="text-center text-gray-500">No pending NGOs 🎉</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pending.map((ngo) => (
              <div
                key={ngo.id}
                className="border rounded-xl p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={ngo.image_url || "/placeholder.png"}
                    className="w-16 h-16 rounded-lg border object-cover"
                  />
                  <div>
                    <p className="font-semibold text-lg">{ngo.name}</p>
                    <p className="text-gray-500 text-sm">{ngo.email}</p>
                    <p className="text-gray-400 text-xs">{ngo.city}</p>
                  </div>
                </div>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
                  onClick={() => setSelected(ngo)}
                >
                  <Eye size={18} /> View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------- MODAL -------------------- */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl relative shadow-xl">

            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black text-lg"
            >
              ✖
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={selected.image_url || "/placeholder.png"}
                className="w-20 h-20 object-cover rounded-xl border"
              />
              <div>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-gray-500 text-sm">{selected.email}</p>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-3">
              <Info label="City" value={selected.city} />
              <Info label="Phone" value={selected.phone} />
              <Info label="Address" value={selected.address} />
              <Info label="State" value={selected.state} />
              <Info label="Country" value={selected.country} />
            </div>

            <div className="mt-4">
              <p className="font-medium">Description:</p>
              <p className="text-gray-600 text-sm">{selected.description || "—"}</p>
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => approveNGO(selected.id)}
                className="p-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700"
              >
                <CheckCircle /> Approve
              </button>

              <button
                onClick={() => rejectNGO(selected.id)}
                className="p-3 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-red-700"
              >
                <XCircle /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }: any) => (
  <div className="bg-gray-100 p-3 rounded-lg">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium">{value || "—"}</p>
  </div>
);

export default ApprovalsPage;
