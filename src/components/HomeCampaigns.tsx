import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const HomeCampaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaigns();

    const channel = supabase
      .channel("homepage-campaigns")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ngo_campaigns" },
        () => loadCampaigns()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
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
      navigate("/auth?redirect=campaign&campaign_id=" + campaign.id);
      return;
    }

    navigate("/donor/donate-campaign/" + campaign.id);
  };

  return (
    <motion.section
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto px-4">
        
        {/* Heading */}
        <motion.div
          variants={cardVariants}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ❤️ Ongoing Campaigns
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support fundraising campaigns from NGOs making real impact right now.
          </p>
        </motion.div>

        {/* No Campaigns */}
        {campaigns.length === 0 ? (
          <motion.p
            variants={cardVariants}
            className="text-center text-gray-500"
          >
            No active campaigns right now.
          </motion.p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((c, i) => {
              const progress =
                c.goal_amount > 0
                  ? Math.min((c.raised_amount / c.goal_amount) * 100, 100)
                  : 0;

              return (
                <motion.div
                  key={c.id}
                  variants={cardVariants}
                  whileHover={{
                    y: -8,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 140 }}
                  className="rounded-xl overflow-hidden bg-white border"
                >
                  {/* Campaign Image */}
                  {c.image_url && (
                    <motion.img
                      src={c.image_url}
                      className="w-full h-44 object-cover"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.6 }}
                    />
                  )}

                  {/* Content */}
                  <div className="p-6 space-y-4">

                    <h3 className="text-xl font-semibold line-clamp-2">
                      {c.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {c.description}
                    </p>

                    <p className="text-sm text-primary font-medium">
                      {c.ngos?.name}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-gray-200 h-2 rounded-lg overflow-hidden">
                      <motion.div
                        className="h-2 bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                      ></motion.div>
                    </div>

                    <p className="text-sm text-gray-700">
                      Raised: ₹{c.raised_amount} / ₹{c.goal_amount}
                    </p>

                    {/* Donate Button */}
                    <motion.button
                      onClick={() => handleDonateClick(c)}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Heart size={16} /> Donate Now
                    </motion.button>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </motion.section>
  );
};

export default HomeCampaigns;
