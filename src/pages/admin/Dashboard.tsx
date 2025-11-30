import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Building2,
  HeartHandshake,
  Gift,
  ClipboardList,
  BarChart3,
  MessageSquare,
  LineChart,
  Settings,
  LogOut,
  ArrowRight,
  Activity,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Loader2,
  FileBarChart,
  BellRing,
  Database,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    ngos: 0,
    donors: 0,
    volunteers: 0,
    donations: 0,
    pending: 0,
    completed: 0,
    totalValue: 0,
    activeCampaigns: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fetch All Stats
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const [{ count: ngos }, { count: donors }, { count: volunteers }] =
        await Promise.all([
          supabase.from("ngos").select("id", { count: "exact", head: true }),
          supabase.from("donors").select("id", { count: "exact", head: true }),
          supabase.from("volunteers").select("id", { count: "exact", head: true }),
        ]);

      const { data: donationsData } = await supabase
        .from("donations")
        .select("*");

      const totalValue =
        donationsData?.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;

      const pending =
        donationsData?.filter((d) => d.status === "Pending").length || 0;
      const completed =
        donationsData?.filter((d) => d.status === "Completed").length || 0;

      const { count: activeCampaigns } = await supabase
        .from("ngo_campaigns")
        .select("id", { count: "exact", head: true })
        .eq("status", "Active");

      const { data: recent } = await supabase
        .from("donation_events")
        .select("event, note, created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      setStats({
        ngos,
        donors,
        volunteers,
        donations: donationsData?.length || 0,
        pending,
        completed,
        totalValue,
        activeCampaigns: activeCampaigns || 0,
      });

      setRecentActivity(recent || []);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const pieData = [
    { name: "Pending", value: stats.pending },
    { name: "Completed", value: stats.completed },
  ];

  const COLORS = ["#facc15", "#22c55e"];

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-3">
        <Loader2 size={30} className="animate-spin" />
        <p>Loading Admin Dashboard...</p>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-72 bg-white shadow-xl p-6 flex flex-col justify-between border-r">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-700 mb-8">
            Admin Panel
          </h1>

          <nav className="space-y-3">
            {sidebarItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-100 text-blue-700 transition font-medium"
              >
                <Icon size={20} /> {label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-blue-700">
              Welcome, Admin 👑
            </h1>
            <p className="text-gray-600">
              Full control over NGOs, Volunteers, Donors & System Analytics.
            </p>
          </div>

          <Link
            to="/admin/reports"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            Generate Reports <ArrowRight size={18} />
          </Link>
        </div>

        {/* STATS GRID */}
        <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6 mb-12">
          <StatCard label="Total NGOs" value={stats.ngos} icon={Building2} color="blue" />
          <StatCard label="Total Donors" value={stats.donors} icon={Users} color="green" />
          <StatCard label="Volunteers" value={stats.volunteers} icon={HeartHandshake} color="purple" />
          <StatCard label="Total Donations" value={stats.donations} icon={Gift} color="yellow" />
        </div>

        {/* VALUE + PIE CHART */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* TOTAL VALUE */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
            <h2 className="text-xl font-bold text-blue-700 mb-3">Total Donation Value</h2>
            <p className="text-4xl font-extrabold text-green-600">₹{stats.totalValue}</p>
            <p className="text-gray-600 mt-2">Across all NGOs and Donors</p>
          </div>

          {/* PIE CHART */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-blue-700 mb-3">Donation Status Overview</h2>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    innerRadius={60}
                    outerRadius={90}
                    label
                    data={pieData}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`${item.bg} shadow p-6 rounded-xl text-white hover:scale-105 transition flex flex-col items-center gap-3`}
            >
              {item.icon}
              <span className="text-lg font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-xl font-bold text-blue-700 mb-4">
            Recent System Activity
          </h2>

          {recentActivity.length === 0 ? (
            <p className="text-gray-500">No recent events found.</p>
          ) : (
            <ul className="divide-y">
              {recentActivity.map((a, idx) => (
                <li key={idx} className="py-3 flex justify-between">
                  <span className="text-gray-700">{a.event}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

/* ---- REUSABLE STAT CARD ---- */
const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const map: any = {
    blue: "text-blue-700 border-blue-600",
    green: "text-green-700 border-green-600",
    purple: "text-purple-700 border-purple-600",
    yellow: "text-yellow-700 border-yellow-500",
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow border-l-4 ${map[color]}`}>
      <div className="flex items-center gap-3">
        <Icon size={32} className={map[color].split(" ")[0]} />
        <div>
          <h3 className="font-semibold text-gray-700">{label}</h3>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

/* SIDEBAR OPTIONS */
const sidebarItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/ngos", label: "Manage NGOs", icon: Building2 },
  { to: "/admin/donors", label: "Manage Donors", icon: Users },
  { to: "/admin/volunteers", label: "Manage Volunteers", icon: HeartHandshake },
  { to: "/admin/donations", label: "All Donations", icon: Gift },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/system", label: "System Monitor", icon: Database },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

/* QUICK ACTIONS */
const quickActions = [
  { to: "/admin/create-ngo", label: "Add NGO", bg: "bg-blue-600", icon: <Building2 size={28} /> },
  { to: "/admin/create-donor", label: "Add Donor", bg: "bg-green-600", icon: <Users size={28} /> },
  { to: "/admin/create-volunteer", label: "Add Volunteer", bg: "bg-purple-600", icon: <HeartHandshake size={28} /> },
  { to: "/admin/donations", label: "View Donations", bg: "bg-yellow-500", icon: <Gift size={28} /> },
  { to: "/admin/reports", label: "Reports", bg: "bg-gray-700", icon: <FileBarChart size={28} /> },
  { to: "/admin/system", label: "System Logs", bg: "bg-red-600", icon: <Activity size={28} /> },
  { to: "/admin/messages", label: "Admin Messages", bg: "bg-indigo-600", icon: <MessageSquare size={28} /> },
  { to: "/admin/settings", label: "Settings", bg: "bg-orange-600", icon: <Settings size={28} /> },
];

export default AdminDashboard;
