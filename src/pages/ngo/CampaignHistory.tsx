// src/pages/ngo/CampaignHistory.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CampaignHistory() {
  const { id } = useParams(); // campaign_id
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();

    // 🔥 Live updates
    const channel = supabase
      .channel("campaign-history-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaign_donations" },
        () => loadHistory()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const loadHistory = async () => {
    setLoading(true);

    // 1️⃣ Load campaign
    const { data: campaignData } = await supabase
      .from("ngo_campaigns")
      .select("*")
      .eq("id", id)
      .single();

    setCampaign(campaignData);

    // 2️⃣ Load donations + donor info
    const { data: donationList } = await supabase
      .from("campaign_donations")
      .select("*, donors(name, email, image_url)")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false });

    setDonations(donationList || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading campaign history...
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white shadow border rounded-2xl p-6">

        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-3xl font-bold mt-4 mb-2">{campaign?.title}</h1>
        <p className="text-gray-600 mb-6">{campaign?.description}</p>

        <h2 className="text-xl font-semibold mb-3">Donation History</h2>

        {donations.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No donations yet.
          </p>
        ) : (
          <div className="space-y-4">
            {donations.map((d) => (
              <div
                key={d.id}
                className="border rounded-lg p-4 shadow-sm bg-gray-50"
              >
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    {d.donors?.image_url ? (
                      <img
                        src={d.donors.image_url}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-300">
                        <User />
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">{d.donors?.name || "Unknown Donor"}</p>
                      <p className="text-sm text-gray-600">{d.donors?.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700">
                      ₹{Number(d.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Payment ID: {d.payment_id || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 mt-3 text-gray-600 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(d.created_at).toLocaleDateString()}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {new Date(d.created_at).toLocaleTimeString()}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
