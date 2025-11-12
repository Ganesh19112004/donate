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

      // Fetch donations
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

      // Fetch volunteers (count)
      const { count: volunteerCount } = await supabase
        .from("volunteer_assignments")
        .select("volunteer_id", { count: "exact", head: true })
        .eq("ngo_id", ngo.id);

      // Fetch active campaigns (if table exists)
      const { count: campaignCount } = await supabase
        .from("ngo_campaigns")
        .select("id", { count: "exact", head: true })
        .eq("ngo_id", ngo.id)
        .eq("status", "Active");

      // Fetch recent donations
      const { data: recent } = await supabase
        .from("donations")
        .select("id, donor_id, amount, category, status, created_at")
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
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-700 text-center md:text-left">
            🏢 Welcome, {ngoName}!
          </h1>
          <div className="mt-3 md:mt-0 flex items-center gap-3 text-sm text-gray-600">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
              Verified NGO ✅
            </span>
            <Link
              to="/ngo/profile"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Gift size={28} />} label="Total Donations" value={stats.totalDonations} color="blue" />
          <StatCard icon={<Users size={28} />} label="Volunteers" value={stats.totalVolunteers} color="green" />
          <StatCard icon={<ClipboardList size={28} />} label="Active Campaigns" value={stats.activeCampaigns} color="yellow" />
          <StatCard icon={<BarChart2 size={28} />} label="Total Value" value={`₹${stats.totalValue}`} color="purple" />
          <StatCard icon={<Clock size={28} />} label="Pending" value={stats.pendingDonations} color="orange" />
          <StatCard icon={<Truck size={28} />} label="Assigned" value={stats.assignedDonations} color="indigo" />
          <StatCard icon={<CheckCircle size={28} />} label="Completed" value={stats.completedDonations} color="teal" />
          <StatCard icon={<Layers size={28} />} label="Reports" value="View" color="gray" />
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-white p-6 rounded-lg text-center shadow hover:opacity-90 transition flex flex-col items-center justify-center gap-2 ${link.bg}`}
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Donations */}
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Recent Donations</h2>
        {recentDonations.length === 0 ? (
          <p className="text-gray-600">No donations received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{d.category}</td>
                    <td className="p-3">{d.amount ? `₹${d.amount}` : "—"}</td>
                    <td className="p-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ✅ Subcomponents */
const StatCard = ({ icon, label, value, color }: any) => {
  const bg = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800",
    indigo: "bg-indigo-100 text-indigo-800",
    teal: "bg-teal-100 text-teal-800",
    gray: "bg-gray-100 text-gray-800",
  }[color];

  return (
    <div className={`${bg} p-5 rounded-xl text-center shadow-sm`}>
      <div className="mx-auto mb-2">{icon}</div>
      <p className="text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: any = {
    Completed: "bg-green-100 text-green-700",
    Accepted: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Assigned: "bg-purple-100 text-purple-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colorMap[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

/* ✅ Predefined Quick Links (safe Tailwind classes) */
const quickLinks = [
  { to: "/ngo/create", label: "Create Campaign", bg: "bg-blue-600", icon: <PlusCircle size={26} /> },
  { to: "/ngo/manage", label: "Manage Donations", bg: "bg-green-600", icon: <ClipboardList size={26} /> },
  { to: "/ngo/pending", label: "Pending Donations", bg: "bg-yellow-500", icon: <Clock size={26} /> },
  { to: "/ngo/volunteers", label: "Volunteers", bg: "bg-purple-600", icon: <Users size={26} /> },
  { to: "/ngo/messages", label: "Messages", bg: "bg-pink-600", icon: <MessageSquare size={26} /> },
  { to: "/ngo/impact", label: "Impact", bg: "bg-orange-600", icon: <BarChart2 size={26} /> },
  { to: "/ngo/campaigns", label: "Campaigns", bg: "bg-cyan-600", icon: <Layers size={26} /> },
  { to: "/ngo/reports", label: "Reports", bg: "bg-gray-600", icon: <FileText size={26} /> },
  { to: "/ngo/profile", label: "NGO Profile", bg: "bg-blue-500", icon: <UserCircle size={26} /> },
  { to: "/ngo/gallery", label: "Gallery", bg: "bg-pink-500", icon: <Image size={26} /> },
  { to: "/ngo/reviews", label: "Donor Reviews", bg: "bg-teal-600", icon: <Star size={26} /> },
  { to: "/ngo/posts", label: "Announcements", bg: "bg-indigo-600", icon: <Megaphone size={26} /> },
  { to: "/ngo/logout", label: "Logout", bg: "bg-red-600", icon: <LogOut size={26} /> },
];

export default NGODashboard;
