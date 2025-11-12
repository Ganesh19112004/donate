import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Activity, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, Bar, BarChart as Chart, XAxis, YAxis, Tooltip } from "recharts";

const VolunteerImpact = () => {
  const [impact, setImpact] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchImpact = async () => {
      const { data } = await supabase
        .from("volunteer_impact")
        .select("*")
        .eq("volunteer_id", volunteer.id)
        .single();
      setImpact(data);

      const { data: tasks } = await supabase
        .from("volunteer_assignments")
        .select("status, assigned_at")
        .eq("volunteer_id", volunteer.id);

      // Create a basic time trend
      const grouped = tasks?.reduce((acc: any, t: any) => {
        const date = new Date(t.assigned_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      setTrend(Object.entries(grouped || {}).map(([date, count]) => ({ date, count })));
    };
    fetchImpact();
  }, [volunteer.id]);

  if (!impact)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your impact...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            <Activity size={28} /> My Impact
          </h1>
          <Link to="/volunteer/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-600">
            <h3 className="font-semibold text-blue-700">Total Tasks</h3>
            <p className="text-2xl font-bold">{impact.total_tasks}</p>
          </div>
          <div className="bg-green-50 p-5 rounded-xl border-l-4 border-green-600">
            <h3 className="font-semibold text-green-700">Completed</h3>
            <p className="text-2xl font-bold">{impact.completed_tasks}</p>
          </div>
          <div className="bg-purple-50 p-5 rounded-xl border-l-4 border-purple-600">
            <h3 className="font-semibold text-purple-700">NGOs Helped</h3>
            <p className="text-2xl font-bold">{impact.ngos_helped}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl border shadow">
          <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <BarChart size={20} /> Weekly Task Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <Chart data={trend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </Chart>
          </ResponsiveContainer>
        </div>

        <div className="mt-10 text-center">
          <CalendarDays size={22} className="mx-auto text-blue-500" />
          <p className="text-gray-500">Performance Level</p>
          <h3 className="text-2xl font-bold text-blue-700 mt-1">
            {impact.performance_level}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default VolunteerImpact;
