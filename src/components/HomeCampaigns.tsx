import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const HomeCampaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaigns();

    // 🔥 Real-time listener
    const channel = supabase
      .channel("homepage-campaigns")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ngo_campaigns" },
        () => loadCampaigns()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCampaigns = async () => {
    const { data } = await supabase
      .from("ngo_campaigns")
      .select("*, ngos(name, city, image_url)")
      .in("status", ["Active", "Paused"])
      .order("created_at", { ascending: false });

    setCampaigns(data || []);
  };

  const handleDonateClick = (campaign: any) => {
    const donor = JSON.parse(localStorage.getItem("user") || "{}");

    if (!donor?.role || donor.role !== "donor") {
      // Not logged in → send to login 
      navigate("/auth?redirect=campaign&campaign_id=" + campaign.id);
      return;
    }

    navigate("/donor/donate-campaign/" + campaign.id);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ongoing Campaigns
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support active fundraising campaigns from local NGOs helping communities right now.
          </p>
        </div>

        {/* No Campaigns */}
        {campaigns.length === 0 ? (
          <p className="text-center text-gray-500">No active campaigns right now.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((c) => {
              const progress =
                c.goal_amount > 0
                  ? Math.min((c.raised_amount / c.goal_amount) * 100, 100)
                  : 0;

              return (
                <div
                  key={c.id}
                  className="border rounded-xl overflow-hidden shadow hover:shadow-xl transition bg-white"
                >
                  {c.image_url && (
                    <img src={c.image_url} className="w-full h-40 object-cover" />
                  )}

                  <div className="p-5">

                    <h3 className="text-xl font-semibold">{c.title}</h3>

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {c.description}
                    </p>

                    {/* NGO Name */}
                    <p className="text-sm mt-2 text-blue-600 font-medium">
                      {c.ngos?.name}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-gray-200 h-2 rounded-lg overflow-hidden">
                      <div
                        className="h-2 bg-blue-600"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <p className="text-sm text-gray-700 mt-1">
                      Raised: ₹{c.raised_amount} / ₹{c.goal_amount}
                    </p>

                    {/* Donate Button */}
                    <button
                      onClick={() => handleDonateClick(c)}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Heart size={16} /> Donate Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default HomeCampaigns;
