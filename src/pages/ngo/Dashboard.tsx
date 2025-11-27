import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Gift,
  Users,
  ClipboardList,
  BarChart2,
  MessageSquare,
  PlusCircle,
  FileText,
  Truck,
  CheckCircle,
  Clock,
  Layers,
  UserCircle,
  Image,
  Star,
  Megaphone,
  LogOut,
} from "lucide-react";

const NGODashboard = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalVolunteers: 0,
    activeCampaigns: 0,
    totalValue: 0,
    pendingDonations: 0,
    completedDonations: 0,
    assignedDonations: 0,
  });
  const [ngoName, setNgoName] = useState("Your NGO");
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      if (!ngo?.id) return;
      setLoading(true);

      const { data: donations } = await supabase
        .from("donations")
        .select("*")
        .eq("ngo_id", ngo.id);

      const totalValue =
        donations?.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;

      const pendingDonations =
        donations?.filter((d) => d.status === "Pending").length || 0;
      const assignedDonations =
        donations?.filter((d) => d.status === "Assigned").length || 0;
      const completedDonations =
        donations?.filter((d) => d.status === "Completed").length || 0;

      const { count: volunteerCount } = await supabase
        .from("volunteer_assignments")
        .select("volunteer_id", { count: "exact", head: true })
        .eq("ngo_id", ngo.id);

      const { count: campaignCount } = await supabase
        .from("ngo_campaigns")
        .select("id", { count: "exact", head: true })
        .eq("ngo_id", ngo.id)
        .eq("status", "Active");

      const { data: recent } = await supabase
        .from("donations")
        .select(
          "id, donor_id, amount, category, status, created_at"
        )
        .eq("ngo_id", ngo.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalDonations: donations?.length || 0,
        totalVolunteers: volunteerCount || 0,
        activeCampaigns: campaignCount || 0,
        totalValue,
        pendingDonations,
        assignedDonations,
        completedDonations,
      });

      setRecentDonations(recent || []);
      setNgoName(ngo.name || "Your NGO");
      setLoading(false);
    };

    fetchData();
  }, [ngo.id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg font-semibold">
        Loading dashboard...
      </div>
    );

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* ------------ SIDEBAR ------------ */}
      <aside className="w-72 bg-white shadow-2xl p-6 fixed h-full overflow-y-auto z-10 rounded-r-3xl">
        <h2 className="text-3xl font-extrabold text-blue-600 mb-10">
          NGO Panel
        </h2>

        <nav className="flex flex-col gap-4 text-gray-700">
          {sidebarLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition font-medium"
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ------------ MAIN CONTENT ------------ */}
      <main className="flex-1 ml-72 p-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
            Welcome, {ngoName}
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Manage your donations, volunteers, campaigns & more.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <StatCard label="Total Donations" value={stats.totalDonations} icon={<Gift />} gradient="from-blue-400 to-blue-600" />
          <StatCard label="Volunteers" value={stats.totalVolunteers} icon={<Users />} gradient="from-green-400 to-green-600" />
          <StatCard label="Active Campaigns" value={stats.activeCampaigns} icon={<ClipboardList />} gradient="from-purple-400 to-purple-600" />
          <StatCard label="Total Value" value={`₹${stats.totalValue}`} icon={<BarChart2 />} gradient="from-orange-400 to-orange-600" />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-12">
          <MiniStat label="Pending" value={stats.pendingDonations} color="yellow" icon={<Clock />} />
          <MiniStat label="Assigned" value={stats.assignedDonations} color="indigo" icon={<Truck />} />
          <MiniStat label="Completed" value={stats.completedDonations} color="green" icon={<CheckCircle />} />
          <MiniStat label="Reports" value="View" color="gray" icon={<Layers />} />
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {quickLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`${item.bg} shadow-md p-6 rounded-2xl text-white hover:scale-105 transition flex flex-col items-center gap-3`}
            >
              {item.icon}
              <span className="font-semibold text-lg">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Donations */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Donations</h2>
        {recentDonations.length === 0 ? (
          <p className="text-gray-600">No recent donations.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-xl rounded-xl">
            <table className="w-full text-left rounded-xl">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {recentDonations.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-gray-100 transition">
                    <td className="p-3">{d.category}</td>
                    <td className="p-3">{d.amount ? `₹${d.amount}` : "—"}</td>
                    <td className="p-3"><StatusBadge status={d.status} /></td>
                    <td className="p-3 text-gray-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </main>
    </div>
  );
};

/* STAT CARD (Large Gradient Animated) */
const StatCard = ({ label, value, icon, gradient }: any) => (
  <div className={`p-6 rounded-3xl text-white bg-gradient-to-br ${gradient} shadow-xl hover:scale-[1.03] transition`}>
    <div className="text-4xl mb-3">{icon}</div>
    <p className="text-sm opacity-80">{label}</p>
    <p className="text-3xl font-extrabold">{value}</p>
  </div>
);

/* MINI STAT */
const MiniStat = ({ label, value, color, icon }: any) => {
  const bg = {
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    indigo: "bg-indigo-100 text-indigo-700",
    gray: "bg-gray-100 text-gray-700",
  }[color];

  return (
    <div className={`${bg} p-4 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center`}>
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-sm">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};

/* STATUS BADGE */
const StatusBadge = ({ status }: any) => {
  const map: any = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Assigned: "bg-purple-100 text-purple-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${map[status]}`}>
      {status}
    </span>
  );
};

/* SIDEBAR LINKS */
const sidebarLinks = [
  { to: "/ngo/dashboard", label: "Dashboard", icon: <BarChart2 size={20} /> },
  { to: "/ngo/manage", label: "Manage Donations", icon: <ClipboardList size={20} /> },
  { to: "/ngo/pending", label: "Pending Donations", icon: <Clock size={20} /> },
  { to: "/ngo/volunteers", label: "Volunteers", icon: <Users size={20} /> },
  { to: "/ngo/campaigns", label: "Campaigns", icon: <Layers size={20} /> },
  { to: "/ngo/messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { to: "/ngo/gallery", label: "Gallery", icon: <Image size={20} /> },
  { to: "/ngo/profile", label: "Profile", icon: <UserCircle size={20} /> },
  { to: "/ngo/logout", label: "Logout", icon: <LogOut size={20} /> },
];

/* QUICK ACTIONS */
const quickLinks = [
  { to: "/ngo/create", label: "Create Campaign", bg: "bg-blue-600", icon: <PlusCircle size={26} /> },
  { to: "/ngo/manage", label: "Manage Donations", bg: "bg-green-600", icon: <ClipboardList size={26} /> },
  { to: "/ngo/volunteers", label: "Volunteers", bg: "bg-purple-600", icon: <Users size={26} /> },
  { to: "/ngo/pending", label: "Pending", bg: "bg-yellow-500", icon: <Clock size={26} /> },
  { to: "/ngo/gallery", label: "Gallery", bg: "bg-pink-600", icon: <Image size={26} /> },
  { to: "/ngo/reports", label: "Reports", bg: "bg-gray-600", icon: <FileText size={26} /> },
  { to: "/ngo/posts", label: "Announcements", bg: "bg-indigo-600", icon: <Megaphone size={26} /> },
  { to: "/ngo/logout", label: "Logout", bg: "bg-red-600", icon: <LogOut size={26} /> },
];

export default NGODashboard;
