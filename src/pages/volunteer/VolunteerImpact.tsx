import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Activity,
  CheckCircle,
  XCircle,
  Timer,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  Bar,
  BarChart as Chart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const VolunteerImpact = () => {
  const [impact, setImpact] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchImpact = async () => {
      setLoading(true);

      // -------------------------
      // 1️⃣ FETCH IMPACT SUMMARY
      // -------------------------
      const { data: impactData } = await supabase
        .from("volunteer_impact")
        .select("*")
        .eq("volunteer_id", volunteer.id)
        .maybeSingle(); // prevents throwing error when no row exists

      // fallback values if no row exists
      const fallbackImpact = {
        total_tasks: 0,
        completed_tasks: 0,
        cancelled_tasks: 0,
        active_tasks: 0,
        success_rate: 0,
        ngos_helped: 0,
        performance_level: "Beginner",
        last_active: new Date().toISOString(),
      };

      // always set impact to safe object
      setImpact(impactData || fallbackImpact);

      // -------------------------
      // 2️⃣ FETCH TREND DATA
      // -------------------------
      const { data: tasks } = await supabase
        .from("volunteer_assignments")
        .select("status, assigned_at")
        .eq("volunteer_id", volunteer.id);

      const grouped = tasks?.reduce((acc: any, t: any) => {
        if (!t.assigned_at) return acc;
        const date = new Date(t.assigned_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      setTrend(
        Object.entries(grouped).map(([date, count]) => ({ date, count }))
      );

      setLoading(false);
    };

    fetchImpact();
  }, []);

  // SHOW LOADER
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your impact...
      </div>
    );

  const performanceColors: any = {
    Beginner: "bg-gray-200 text-gray-700",
    Active: "bg-blue-200 text-blue-700",
    Leader: "bg-purple-200 text-purple-700",
    Hero: "bg-green-200 text-green-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-10 border border-blue-100">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            <Activity size={28} /> My Volunteer Impact
          </h1>

          <Link to="/volunteer/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <StatBox title="Total Tasks" value={impact.total_tasks} color="blue" Icon={Activity} />
          <StatBox title="Completed" value={impact.completed_tasks} color="green" Icon={CheckCircle} />
          <StatBox title="Cancelled" value={impact.cancelled_tasks} color="red" Icon={XCircle} />
          <StatBox title="Active" value={impact.active_tasks} color="purple" Icon={Timer} />
        </div>

        {/* SUCCESS RATE */}
        <div className="bg-white p-6 rounded-xl shadow border mb-10">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-green-700">
            <TrendingUp /> Success Rate
          </h3>

          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${impact.success_rate || 0}%` }}
            />
          </div>

          <p className="text-green-700 font-semibold mt-2">
            {impact.success_rate || 0}% Success
          </p>
        </div>

        {/* TREND CHART */}
        <div className="bg-white p-6 rounded-xl shadow border mb-10">
          <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <BarChart size={20} /> Weekly Task Trend
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <Chart data={trend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </Chart>
          </ResponsiveContainer>
        </div>

        {/* PERFORMANCE */}
        <div className="text-center">
          <CalendarDays size={22} className="mx-auto text-blue-500" />
          <p className="text-gray-500">Performance Level</p>

          <span
            className={`px-4 py-2 rounded-full font-bold text-lg ${
              performanceColors[impact.performance_level]
            }`}
          >
            {impact.performance_level}
          </span>

          <p className="text-gray-500 mt-4">
            Last Active:{" "}
            <strong>{new Date(impact.last_active).toLocaleString()}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

// ⭐ Reusable Stat Component
const StatBox = ({ title, value, color, Icon }: any) => {
  const colorMap: any = {
    blue: "border-blue-600 text-blue-700",
    green: "border-green-600 text-green-700",
    red: "border-red-600 text-red-700",
    purple: "border-purple-600 text-purple-700",
  };

  return (
    <div className={`bg-white p-5 rounded-xl shadow border-l-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-3">
        <Icon size={28} className={colorMap[color].split(" ")[1]} />
        <div>
          <h3 className="font-semibold text-gray-700">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerImpact;
