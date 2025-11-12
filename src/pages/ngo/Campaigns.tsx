import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layers } from "lucide-react";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("ngo_campaigns")
        .select("*")
        .eq("ngo_id", ngo.id);
      setCampaigns(data || []);
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 bg-blue-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          <Layers /> Manage Campaigns
        </h1>
        {campaigns.length === 0 ? (
          <p>No campaigns yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="p-5 border rounded-lg shadow hover:bg-gray-50 transition"
              >
                <h2 className="font-semibold text-lg">{c.title}</h2>
                <p className="text-sm text-gray-600">{c.description}</p>
                <p className="text-sm mt-2">Goal: ₹{c.goal_amount}</p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    c.status === "Active"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {c.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
