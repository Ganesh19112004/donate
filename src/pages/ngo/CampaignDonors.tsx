// src/pages/ngo/CampaignDonors.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User } from "lucide-react";

export default function CampaignDonors() {
  const { id } = useParams(); // campaign ID
  const navigate = useNavigate();

  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonors();

    // REALTIME UPDATES
    const channel = supabase
      .channel("campaign-donors-realtime")
      .on(
        "postgres_changes",
        { event: "*", table: "campaign_donations", schema: "public" },
        () => loadDonors()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const loadDonors = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("campaign_donations")
      .select("*, donors(id, name, email, image_url)")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false });

    setDonations(data || []);
    setLoading(false);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow border">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-4 hover:underline"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Campaign Donors</h1>

        {loading ? (
          <p className="text-center py-10 text-gray-500">Loading donors...</p>
        ) : donations.length === 0 ? (
          <p className="text-center py-10 text-gray-500 text-lg">
            No donations received yet.
          </p>
        ) : (
          <div className="space-y-5">
            {donations.map((d) => (
              <div
                key={d.id}
                className="p-5 border rounded-xl shadow-sm bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  {/* Donor Image */}
                  {d.donors?.image_url ? (
                    <img
                      src={d.donors.image_url}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center">
                      <User size={28} className="text-gray-600" />
                    </div>
                  )}

                  {/* Donor Info */}
                  <div>
                    <h2 className="text-lg font-semibold">
                      {d.donors?.name || "Unknown Donor"}
                    </h2>
                    <p className="text-sm text-gray-600">{d.donors?.email}</p>
                  </div>
                </div>

                {/* Donation Info */}
                <div className="mt-4 text-sm">
                  <p>
                    <strong>Amount:</strong>{" "}
                    <span className="text-green-700 font-semibold">
                      ₹{Number(d.amount).toLocaleString()}
                    </span>
                  </p>

                  <p>
                    <strong>Payment ID:</strong>{" "}
                    <span className="text-gray-700">{d.payment_id}</span>
                  </p>

                  <p>
                    <strong>Order ID:</strong>{" "}
                    <span className="text-gray-700">{d.order_id}</span>
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(d.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
