import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2, FileBarChart2 } from "lucide-react";

const Reports = () => {
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    completed: 0,
    inProgress: 0,
    cancelled: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!volunteer.id) return;
      setLoading(true);

      // 1️⃣ Fetch activity logs
      const { data, error } = await supabase
        .from("volunteer_activity")
        .select("created_at, action")
        .eq("volunteer_id", volunteer.id)
        .order("created_at");

      if (error) {
        console.error("Error fetching volunteer reports:", error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // 2️⃣ Group by date for line chart
        const grouped = Object.values(
          data.reduce((acc: any, curr: any) => {
            const date = new Date(curr.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            });
            acc[date] = acc[date] || { date, actions: 0 };
            acc[date].actions++;
            return acc;
          }, {})
        );

        // 3️⃣ Summarize actions for pie chart
        const summaryStats = {
          completed: data.filter((d) => d.action === "Task Completed").length,
          inProgress: data.filter((d) => d.action === "Task In Progress").length,
          cancelled: data.filter((d) => d.action === "Task Cancelled").length,
          total: data.length,
        };

        setDailyStats(grouped);
        setSummary(summaryStats);
      }

      setLoading(false);
    };

    fetchStats();
  }, [volunteer.id]);

  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading reports...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            <FileBarChart2 className="text-blue-600" /> Volunteer Reports
          </h1>
          <p className="text-sm text-gray-500">
            Data updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <SummaryCard
            title="Total Actions"
            value={summary.total}
            color="blue"
          />
          <SummaryCard
            title="Completed Tasks"
            value={summary.completed}
            color="green"
          />
          <SummaryCard
            title="In Progress"
            value={summary.inProgress}
            color="yellow"
          />
          <SummaryCard
            title="Cancelled"
            value={summary.cancelled}
            color="red"
          />
        </div>

        {/* Charts Section */}
        {dailyStats.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No activity data available yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            {/* 📈 Line Chart */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-inner">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">
                Daily Activity Trend
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="actions"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 🥧 Pie Chart */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-inner">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">
                Task Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Completed", value: summary.completed },
                      { name: "In Progress", value: summary.inProgress },
                      { name: "Cancelled", value: summary.cancelled },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    label
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 🧩 Reusable Summary Card Component
const SummaryCard = ({ title, value, color }: any) => {
  const colorMap: any = {
    blue: "text-blue-700 border-blue-600",
    green: "text-green-700 border-green-600",
    yellow: "text-yellow-700 border-yellow-500",
    red: "text-red-700 border-red-600",
  };
  return (
    <div
      className={`bg-white shadow-md rounded-xl border-l-4 ${colorMap[color]} p-5 flex flex-col items-start justify-center`}
    >
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

export default Reports;
