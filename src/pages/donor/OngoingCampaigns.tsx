import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layers } from "lucide-react";

export default function OngoingCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const RAZORPAY_KEY_ID = "rzp_test_RmaCFr0K8J6NKZ";

  useEffect(() => {
    loadCampaigns();

    // 🔥 Realtime updates
    const channel = supabase
      .channel("realtime-campaigns")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ngo_campaigns" },
        () => loadCampaigns()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("ngo_campaigns")
      .select("*, ngos(name, image_url)")
      .eq("status", "Active")
      .order("created_at", { ascending: false });

    setCampaigns(data || []);
    setLoading(false);
  };

  const openPayment = async (campaign: any) => {
    const donor = JSON.parse(localStorage.getItem("user") || "{}");

    const amount = prompt("Enter donation amount (₹):");
    if (!amount || isNaN(Number(amount))) {
      alert("Invalid amount");
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Number(amount) * 100,
      currency: "INR",
      name: campaign.title,
      description: "Donation to NGO Campaign",

      handler: async (response: any) => {
        alert("Payment Successful ✔");

        // 👉 1. Update campaign amount
        await supabase
          .from("ngo_campaigns")
          .update({
            raised_amount: campaign.raised_amount + Number(amount),
          })
          .eq("id", campaign.id);

        // 👉 2. Save donation
        await supabase.from("campaign_donations").insert({
          campaign_id: campaign.id,
          donor_id: donor?.id || null,
          amount: Number(amount),
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          status: "SUCCESS",
        });

        loadCampaigns();
      },

      theme: { color: "#2563eb" },
    };

    // @ts-ignore
    const rzp = new Razorpay(options);
    rzp.open();
  };

  return (
    <div className="p-8 bg-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white shadow border rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2 mb-6">
          <Layers /> Ongoing Campaigns
        </h1>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-lg">
            No active campaigns right now.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map((c) => {
              const progress =
                c.goal_amount > 0
                  ? Math.min((c.raised_amount / c.goal_amount) * 100, 100)
                  : 0;

              return (
                <div
                  key={c.id}
                  className="border rounded-xl shadow bg-white hover:shadow-lg transition overflow-hidden"
                >
                  {c.image_url && (
                    <img src={c.image_url} className="w-full h-40 object-cover" />
                  )}

                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-blue-700">
                      {c.title}
                    </h2>

                    <p className="text-gray-600 text-sm mt-1">{c.description}</p>

                    <p className="mt-3 font-medium text-gray-900">
                      Goal: ₹{Number(c.goal_amount).toLocaleString()}
                    </p>

                    <div className="mt-2 bg-gray-200 h-2 rounded-xl">
                      <div
                        className="h-2 bg-blue-600 rounded-xl"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <p className="text-gray-600 text-sm mt-1">
                      Raised: ₹{Number(c.raised_amount).toLocaleString()} ({Math.round(progress)}%)
                    </p>

                    <button
                      onClick={() => openPayment(c)}
                      className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                    >
                      Donate Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
