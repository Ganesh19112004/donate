import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const NGOImpact = () => {
  const [impact, setImpact] = useState<any[]>([]);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("donations")
        .select("category, amount")
        .eq("ngo_id", ngo.id)
        .eq("status", "Completed");
      const grouped = data?.reduce((acc, d) => {
        acc[d.category] = (acc[d.category] || 0) + (Number(d.amount) || 0);
        return acc;
      }, {});
      setImpact(Object.entries(grouped || {}).map(([k, v]) => ({ category: k, amount: v })));
    };
    fetchData();
  }, []);

  return (
    <div className="p-10 min-h-screen bg-blue-50">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">📊 NGO Impact Analysis</h1>
        {impact.length === 0 ? (
          <p>No completed donations yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={impact}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default NGOImpact;
