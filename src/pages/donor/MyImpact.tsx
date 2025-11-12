import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Heart, Activity, Gift } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MyImpact = () => {
  const [impact, setImpact] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const donor = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchImpact = async () => {
      const { data } = await supabase
        .from("donor_impact")
        .select("*")
        .eq("donor_id", donor.id)
        .single();
      setImpact(data);

      // Category-wise donations for chart
      const { data: categoryStats } = await supabase
        .from("donations")
        .select("category, count:id")
        .eq("donor_id", donor.id)
        .group("category");
      setCategoryData(categoryStats || []);
    };

    fetchImpact();
  }, []);

  const getProgressColor = (level: string) => {
    switch (level) {
      case "Gold":
        return "bg-yellow-400";
      case "Silver":
        return "bg-gray-400";
      default:
        return "bg-orange-400";
    }
  };

  const getNextMilestone = (level: string) => {
    if (level === "Bronze") return "Donate 5 more times to reach Silver level 🥈";
    if (level === "Silver") return "You're close to Gold! 10 more donations to go 🏆";
    return "You're a Gold-level donor — thank you for your huge impact!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          🌍 My Impact
        </h1>

        {!impact ? (
          <p className="text-center text-gray-600">No impact data yet. Start donating to make an impact!</p>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="p-5 border rounded-xl shadow-sm text-center">
                <Gift className="text-blue-600 mx-auto mb-2" size={28} />
                <p className="text-gray-500 text-sm">Total Donations</p>
                <p className="text-2xl font-bold text-blue-700">{impact.total_donations}</p>
              </div>

              <div className="p-5 border rounded-xl shadow-sm text-center">
                <Heart className="text-pink-600 mx-auto mb-2" size={28} />
                <p className="text-gray-500 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-pink-700">₹{impact.total_value}</p>
              </div>

              <div className="p-5 border rounded-xl shadow-sm text-center">
                <Activity className="text-green-600 mx-auto mb-2" size={28} />
                <p className="text-gray-500 text-sm">NGOs Helped</p>
                <p className="text-2xl font-bold text-green-700">{impact.ngos_helped}</p>
              </div>

              <div className="p-5 border rounded-xl shadow-sm text-center">
                <Trophy className="text-yellow-500 mx-auto mb-2" size={28} />
                <p className="text-gray-500 text-sm">Donor Level</p>
                <p className="text-2xl font-bold text-yellow-600">{impact.donor_level}</p>
              </div>
            </div>

            {/* Progress Toward Next Level */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">Progress Toward Next Level</h2>
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className={`${getProgressColor(
                    impact.donor_level
                  )} h-4 rounded-full transition-all`}
                  style={{ width: `${impact.progress_percent || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{getNextMilestone(impact.donor_level)}</p>
            </div>

            {/* Additional Insights */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="p-5 border rounded-xl bg-gray-50">
                <h3 className="font-semibold text-blue-700 mb-2">Recent Donation</h3>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong>{" "}
                  {impact.recent_donation_date
                    ? new Date(impact.recent_donation_date).toLocaleDateString()
                    : "—"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Top Category:</strong> {impact.top_category || "—"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Average Donation:</strong> ₹{impact.avg_donation_value || 0}
                </p>
              </div>

              <div className="p-5 border rounded-xl bg-gray-50">
                <h3 className="font-semibold text-blue-700 mb-4">Category-wise Donations</h3>
                {categoryData.length === 0 ? (
                  <p className="text-sm text-gray-500">No donation data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={categoryData}>
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Donations" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Last Updated */}
            <p className="text-xs text-gray-500 text-center">
              Last updated on {new Date(impact.updated_at).toLocaleString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MyImpact;
