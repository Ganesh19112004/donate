import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  FileDown,
  Loader2,
  Users,
  Building2,
  Gift,
  HeartHandshake,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
} from "lucide-react";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

export default function Reports() {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    ngos: 0,
    donors: 0,
    volunteers: 0,
    donations: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalValue: 0,
  });

  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [topNGOs, setTopNGOs] = useState<any[]>([]);
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [topVolunteers, setTopVolunteers] = useState<any[]>([]);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);

    // 1️⃣ TOTAL COUNTS
    const [{ count: ngos }, { count: donors }, { count: volunteers }] =
      await Promise.all([
        supabase.from("ngos").select("id", { count: "exact", head: true }),
        supabase.from("donors").select("id", { count: "exact", head: true }),
        supabase.from("volunteers").select("id", { count: "exact", head: true }),
      ]);

    // 2️⃣ ALL DONATIONS
    const { data: donations } = await supabase.from("donations").select("*");

    const totalValue =
      donations?.reduce((s, d) => s + (Number(d.amount) || 0), 0) || 0;

    const completed =
      donations?.filter((d) => d.status === "Completed").length || 0;

    const pending =
      donations?.filter((d) => d.status === "Pending").length || 0;

    const cancelled =
      donations?.filter((d) => d.status === "Cancelled").length || 0;

    // 3️⃣ CATEGORY BREAKDOWN
    const groupedCategories: any = {};
    donations?.forEach((d) => {
      if (!groupedCategories[d.category]) groupedCategories[d.category] = 0;
      groupedCategories[d.category] += 1;
    });

    const categoryChart = Object.keys(groupedCategories).map((key) => ({
      name: key,
      value: groupedCategories[key],
    }));

    // 4️⃣ MONTHLY TREND
    const monthly: any = {};
    donations?.forEach((d) => {
      const m = new Date(d.created_at).toLocaleString("en-US", {
        month: "short",
      });

      if (!monthly[m]) monthly[m] = 0;
      monthly[m] += Number(d.amount) || 0;
    });

    const monthlyTrendData = Object.keys(monthly).map((key) => ({
      month: key,
      value: monthly[key],
    }));

    // 5️⃣ TOP NGOs
    const { data: ngoRanks } = await supabase
      .from("ngo_impact")
      .select("total_value, total_donations, ngo_id")
      .order("total_value", { ascending: false })
      .limit(5);

    const enrichedNGOs = await Promise.all(
      ngoRanks?.map(async (n) => {
        const { data: ngoInfo } = await supabase
          .from("ngos")
          .select("name,city")
          .eq("id", n.ngo_id)
          .single();

        return {
          ...ngoInfo,
          total_value: n.total_value,
          total_donations: n.total_donations,
        };
      }) || []
    );

    // 6️⃣ TOP DONORS
    const { data: donorRanks } = await supabase
      .from("donor_impact")
      .select("*")
      .order("total_value", { ascending: false })
      .limit(5);

    const enrichedDonors = await Promise.all(
      donorRanks?.map(async (d) => {
        const { data: donorInfo } = await supabase
          .from("donors")
          .select("name,city")
          .eq("id", d.donor_id)
          .single();
        return { ...donorInfo, ...d };
      }) || []
    );

    // 7️⃣ TOP VOLUNTEERS
    const { data: volunteerRanks } = await supabase
      .from("volunteer_impact")
      .select("*")
      .order("completed_tasks", { ascending: false })
      .limit(5);

    const enrichedVolunteers = await Promise.all(
      volunteerRanks?.map(async (v) => {
        const { data: volInfo } = await supabase
          .from("volunteers")
          .select("name,city")
          .eq("id", v.volunteer_id)
          .single();
        return { ...volInfo, ...v };
      }) || []
    );

    // FINAL SET
    setSummary({
      ngos,
      donors,
      volunteers,
      donations: donations?.length || 0,
      pending,
      completed,
      cancelled,
      totalValue,
    });

    setCategoryData(categoryChart);
    setMonthlyTrend(monthlyTrendData);
    setTopNGOs(enrichedNGOs);
    setTopDonors(enrichedDonors);
    setTopVolunteers(enrichedVolunteers);

    setLoading(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );

  return (
    <div className="p-10 bg-gray-100 min-h-screen space-y-10">
      <h1 className="text-4xl font-bold text-blue-700">📊 System Reports</h1>

      {/* SUMMARY CARDS */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard label="NGOs" value={summary.ngos} icon={<Building2 />} color="blue" />
        <StatCard label="Donors" value={summary.donors} icon={<Users />} color="green" />
        <StatCard label="Volunteers" value={summary.volunteers} icon={<HeartHandshake />} color="purple" />
        <StatCard label="Donations" value={summary.donations} icon={<Gift />} color="yellow" />
      </div>

      {/* DONATION STATUS */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatusCard label="Pending" value={summary.pending} color="yellow" />
        <StatusCard label="Completed" value={summary.completed} color="green" />
        <StatusCard label="Cancelled" value={summary.cancelled} color="red" />
      </div>

      {/* TOTAL VALUE */}
      <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-600">
        <h2 className="text-xl font-bold text-blue-700 mb-3">Total Donation Value</h2>
        <p className="text-4xl font-extrabold text-green-600">₹{summary.totalValue}</p>
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* CATEGORY PIE CHART */}
        <ChartContainer title="Donation Category Distribution" icon={<PieIcon />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* MONTHLY TREND */}
        <ChartContainer title="Monthly Donation Trend" icon={<BarChart3 />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* TOP LISTS */}
      <div className="grid md:grid-cols-3 gap-8">
        <TopList title="Top NGOs" data={topNGOs} valueKey="total_value" />
        <TopList title="Top Donors" data={topDonors} valueKey="total_value" />
        <TopList title="Top Volunteers" data={topVolunteers} valueKey="completed_tasks" />
      </div>

      {/* EXPORT BUTTONS */}
      <div className="flex gap-4 mt-10">
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
          <FileDown size={18} /> Export PDF
        </button>
        <button className="bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
          <FileDown size={18} /> Export CSV
        </button>
        <button className="bg-yellow-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
          <FileDown size={18} /> Export Excel
        </button>
      </div>
    </div>
  );
}

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#facc15",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
];

/* COMPONENTS */

const StatCard = ({ label, value, icon, color }: any) => (
  <div className={`bg-white p-6 rounded-xl shadow border-l-4 border-${color}-600`}>
    <div className="flex gap-3 items-center">
      <span className={`text-${color}-700 text-3xl`}>{icon}</span>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const StatusCard = ({ label, value, color }: any) => (
  <div className={`bg-${color}-100 p-6 rounded-xl shadow text-${color}-700 text-center`}>
    <p className="text-sm">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const ChartContainer = ({ title, icon, children }: any) => (
  <div className="bg-white p-6 rounded-xl shadow border">
    <div className="flex gap-2 items-center mb-3 text-blue-700 font-bold text-lg">
      {icon} {title}
    </div>
    {children}
  </div>
);

const TopList = ({ title, data, valueKey }: any) => (
  <div className="bg-white p-6 rounded-xl shadow border">
    <h3 className="text-lg font-bold text-blue-700 mb-3">{title}</h3>

    {data.length === 0 ? (
      <p className="text-gray-500">No records.</p>
    ) : (
      <ul className="space-y-2">
        {data.map((item: any, i: number) => (
          <li key={i} className="flex justify-between text-gray-700">
            <span>
              {i + 1}. {item.name} ({item.city || "—"})
            </span>
            <span className="font-semibold">
              {item[valueKey]}
              {valueKey === "total_value" ? "₹" : ""}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);
