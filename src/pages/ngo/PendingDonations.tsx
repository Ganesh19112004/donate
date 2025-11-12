import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const PendingDonations = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("donations")
        .select("*, donors(name)")
        .eq("ngo_id", ngo.id)
        .eq("status", "Pending");
      setDonations(data || []);
    };
    fetchData();
  }, []);

  const handleAction = async (id: string, action: string) => {
    const newStatus = action === "accept" ? "Accepted" : "Cancelled";
    await supabase.from("donations").update({ status: newStatus }).eq("id", id);
    setDonations((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="p-8 bg-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          <Clock /> Pending Donations
        </h1>
        {donations.length === 0 ? (
          <p>No pending donations.</p>
        ) : (
          <div className="space-y-4">
            {donations.map((d) => (
              <div
                key={d.id}
                className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{d.category}</p>
                  <p className="text-sm text-gray-500">{d.donors?.name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(d.id, "accept")}
                    className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <CheckCircle size={16} /> Accept
                  </button>
                  <button
                    onClick={() => handleAction(d.id, "reject")}
                    className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingDonations;
