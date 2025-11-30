import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import {
  Gift,
  Heart,
  Activity,
  Trophy,
  BarChart as BarChartIcon,
  Calendar,
  Flame,
  TrendingUp,
  PieChart,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Pie,
  PieChart as RePieChart,
  Cell,
} from "recharts";

// ---------- COLORS FOR CHARTS ----------
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#e11d48",
];

const MyImpact = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);
  const [impact, setImpact] = useState<any>({
    total_donations: 0,
    total_value: 0,
    ngos_helped: 0,
    donor_level: "Bronze",
    progress_percent: 0,
    top_category: "-",
    recent_donation_date: "-",
    best_day: "-",
    streak: 0,
    highest_donation: 0,
    most_active_month: "-",
  });

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<any>({});

  useEffect(() => {
    const donor = JSON.parse(localStorage.getItem("user") || "{}");
    if (!donor?.id) return;

    const loadData = async () => {
      setLoading(true);

      // ------------------------------
      // 1️⃣ Load donations
      // ------------------------------
      const { data, error } = await supabase
        .from("donations")
        .select("amount, category, ngo_id, created_at")
        .eq("donor_id", donor.id);

      if (!data || error) {
        setLoading(false);
        return;
      }

      setDonations(data);

      // ------------------------------
      // 2️⃣ Basic analytics
      // ------------------------------
      const total = data.length;
      const totalValue = data.reduce((sum, d) => sum + Number(d.amount || 0), 0);
      const ngosHelped = new Set(data.map((d) => d.ngo_id)).size;

      const donorLevel =
        total >= 20 ? "Gold" : total >= 10 ? "Silver" : "Bronze";

      const progress = Math.min(total * 10, 100);

      const recent = data.length
        ? new Date(
            Math.max(...data.map((d) => new Date(d.created_at).getTime()))
          ).toLocaleDateString()
        : "-";

      // ------------------------------
      // 3️⃣ Category Chart
      // ------------------------------
      const catCount: any = {};
      data.forEach((d) => {
        catCount[d.category] = (catCount[d.category] || 0) + 1;
      });

      const sortedCat = Object.entries(catCount).sort((a: any, b: any) => b[1] - a[1]);
      const topCategory = sortedCat.length ? sortedCat[0][0] : "-";

      setCategoryData(
        Object.entries(catCount).map(([key, val]: any) => ({
          name: key,
          value: val,
        }))
      );

      // ------------------------------
      // 4️⃣ Monthly Chart (Trends)
      // ------------------------------
      const months: any = {};

      data.forEach((d) => {
        const m = new Date(d.created_at).toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        });
        months[m] = (months[m] || 0) + 1;
      });

      setMonthlyData(
        Object.entries(months).map(([month, count]: any) => ({
          month,
          count,
        }))
      );

      const mostActiveMonth = Object.entries(months).sort(
        (a: any, b: any) => b[1] - a[1]
      )[0]?.[0];

      // ------------------------------
      // 5️⃣ Calendar Heatmap
      // ------------------------------
      const calendar: any = {};

      data.forEach((d) => {
        const date = new Date(d.created_at).toISOString().split("T")[0];
        calendar[date] = (calendar[date] || 0) + 1;
      });

      setCalendarData(calendar);

      // ------------------------------
      // 6️⃣ Best Day + Streak
      // ------------------------------
      const dayCount: any = {};
      data.forEach((d) => {
        const day = new Date(d.created_at).toLocaleDateString("en-US", { weekday: "long" });
        dayCount[day] = (dayCount[day] || 0) + 1;
      });

      const bestDay = Object.entries(dayCount).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "-";

      // streak
      const sortedDates = Object.keys(calendar).sort();
      let streak = 0;
      let maxStreak = 0;

      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);

        const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);

        if (diff === 1) streak++;
        else streak = 1;

        maxStreak = Math.max(maxStreak, streak);
      }

      // highest donation
      const highestDonation = Math.max(
        ...data.map((d) => Number(d.amount || 0)),
        0
      );

      // ------------------------------
      // Final set state
      // ------------------------------
      setImpact({
        total_donations: total,
        total_value: totalValue,
        ngos_helped: ngosHelped,
        donor_level: donorLevel,
        progress_percent: progress,
        top_category: topCategory,
        recent_donation_date: recent,
        best_day: bestDay,
        streak: maxStreak,
        highest_donation: highestDonation,
        most_active_month: mostActiveMonth || "-",
      });

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 text-xl font-semibold">
        Loading impact...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2 justify-center mb-10">
          <BarChartIcon size={32} /> My Donation Impact
        </h1>

        {/* GRID STATS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Stat icon={Gift} label="Total Donations" value={impact.total_donations} />
          <Stat icon={Heart} label="Total Value" value={`₹${impact.total_value}`} />
          <Stat icon={Activity} label="NGOs Helped" value={impact.ngos_helped} />
          <Stat icon={Trophy} label="Level" value={impact.donor_level} />
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            Progress to Next Level
          </h2>

          <div className="bg-gray-200 h-4 rounded-full">
            <div
              className={`${
                impact.donor_level === "Gold"
                  ? "bg-yellow-400"
                  : impact.donor_level === "Silver"
                  ? "bg-gray-400"
                  : "bg-orange-400"
              } h-4 rounded-full`}
              style={{ width: `${impact.progress_percent}%` }}
            />
          </div>
        </div>

        {/* ADVANCED INSIGHTS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <InfoCard title="Top Category" value={impact.top_category} icon={PieChart} />
          <InfoCard title="Recent Donation" value={impact.recent_donation_date} icon={Calendar} />
          <InfoCard title="Most Active Month" value={impact.most_active_month} icon={TrendingUp} />
          <InfoCard title="Best Donation Day" value={impact.best_day} icon={Calendar} />
          <InfoCard title="Highest Donation" value={`₹${impact.highest_donation}`} icon={Heart} />
          <InfoCard title="Donation Streak" value={`${impact.streak} days`} icon={Flame} />
        </div>

        {/* CATEGORY PIE CHART */}
        <div className="bg-gray-50 border p-6 rounded-xl mb-10">
          <h2 className="text-lg font-bold text-blue-700 mb-4">Donations by Category</h2>

          {categoryData.length === 0 ? (
            <p className="text-gray-500">No category data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie data={categoryData} dataKey="value" outerRadius={120}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* MONTHLY BAR CHART */}
        <div className="bg-gray-50 border p-6 rounded-xl">
          <h2 className="text-lg font-bold text-blue-700 mb-4">Monthly Donations</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ---------- SMALL UI COMPONENTS ----------
const Stat = ({ icon: Icon, label, value }: any) => (
  <div className="p-5 bg-white shadow rounded-xl text-center border">
    <Icon size={28} className="text-blue-600 mx-auto mb-2" />
    <p className="text-gray-500">{label}</p>
    <p className="text-xl font-bold text-blue-700">{value}</p>
  </div>
);

const InfoCard = ({ title, value, icon: Icon }: any) => (
  <div className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
    <Icon size={25} className="text-blue-600" />
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default MyImpact;
