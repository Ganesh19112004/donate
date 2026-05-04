import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PlusCircle,
  History,
  User,
  LogOut,
  Gift,
  BarChart,
  Settings,
  Building2,
  MessageCircle,
  Bell,
  Heart,
  Award,
  TrendingUp,
} from "lucide-react";

const DonorDashboard = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [donor, setDonor] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, totalValue: 0, ngos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (!storedUser || storedRole !== "donor") {
      alert("You must be logged in as a donor.");
      window.location.href = "/auth";
      return;
    }

    const user = JSON.parse(storedUser);
    setDonor(user);

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // Fetch donations
        const { data, error } = await supabase
          .from("donations")
          .select("*, ngos(name)")
          .eq("donor_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDonations(data || []);

        // Compute quick stats
        const totalValue = data
          ?.filter((d: any) => d.amount)
          .reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);

        const ngoCount = new Set(data?.map((d: any) => d.ngo_id)).size;

        setStats({
          total: data?.length || 0,
          totalValue: totalValue || 0,
          ngos: ngoCount || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700 mb-8">DanSetu</h1>

          <nav className="space-y-3">
            <Link
              to="/donor/dashboard"
              className="flex items-center gap-3 text-blue-600 font-semibold bg-blue-50 p-3 rounded-lg"
            >
              <BarChart size={20} /> Dashboard
            </Link>

            <Link
              to="/donor/create-donation"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <PlusCircle size={20} /> Create Donation
            </Link>

            <Link
              to="/donor/history"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <History size={20} /> Donation History
            </Link>

            <Link
              to="/donor/favorites"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <Heart size={20} /> Favorites
            </Link>

            <Link
              to="/donor/view-ngos"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <Building2 size={20} /> Explore NGOs
            </Link>

            <Link
              to="/donor/my-impact"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <TrendingUp size={20} /> My Impact
            </Link>

            <Link
              to="/donor/messages"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <MessageCircle size={20} /> Messages
            </Link>

            <Link
              to="/donor/notifications"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <Bell size={20} /> Notifications
            </Link>

            <Link
              to="/donor/profile"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <User size={20} /> My Profile
            </Link>

            <Link
              to="/donor/settings"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <Settings size={20} /> Settings
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-600 font-semibold hover:text-red-700 p-3 rounded-lg transition-all"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">
              Welcome, {donor?.name || "Donor"} 👋
            </h1>
            <p className="text-gray-600">
              Here’s a snapshot of your donation journey and contributions.
            </p>
          </div>

          <Link
            to="/donor/create-donation"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <PlusCircle size={18} /> New Donation
          </Link>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6 text-center">
            <Gift className="mx-auto text-blue-600 mb-3" size={32} />
            <h2 className="text-2xl font-bold text-blue-700">{stats.total}</h2>
            <p className="text-gray-600">Total Donations</p>
          </div>

          <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6 text-center">
            <BarChart className="mx-auto text-green-600 mb-3" size={32} />
            <h2 className="text-2xl font-bold text-green-700">
              ₹{stats.totalValue}
            </h2>
            <p className="text-gray-600">Total Value Donated</p>
          </div>

          <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6 text-center">
            <Building2 className="mx-auto text-purple-600 mb-3" size={32} />
            <h2 className="text-2xl font-bold text-purple-700">
              {stats.ngos}
            </h2>
            <p className="text-gray-600">NGOs Helped</p>
          </div>

          <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6 text-center">
            <Award className="mx-auto text-amber-500 mb-3" size={32} />
            <h2 className="text-2xl font-bold text-amber-600">
              {stats.total > 15
                ? "Gold"
                : stats.total > 5
                ? "Silver"
                : "Bronze"}
            </h2>
            <p className="text-gray-600">Donor Level</p>
          </div>
        </section>

        {/* Recent Donations Table */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            Recent Donations
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading your donations...</p>
          ) : donations.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-4 text-left text-gray-700">NGO</th>
                    <th className="p-4 text-left text-gray-700">Category</th>
                    <th className="p-4 text-left text-gray-700">Description</th>
                    <th className="p-4 text-left text-gray-700">
                      Quantity / Amount
                    </th>
                    <th className="p-4 text-left text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.slice(0, 5).map((d: any) => (
                    <tr key={d.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{d.ngos?.name || "—"}</td>
                      <td className="p-4">{d.category}</td>
                      <td className="p-4 truncate max-w-xs">{d.description}</td>
                      <td className="p-4">
                        {d.category === "Money"
                          ? `₹${d.amount}`
                          : d.quantity}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            d.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : d.status === "Accepted"
                              ? "bg-green-100 text-green-700"
                              : d.status === "Completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 text-right">
                <Link
                  to="/donor/history"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-6">
              You haven’t made any donations yet.{" "}
              <Link
                to="/donor/create-donation"
                className="text-blue-600 underline"
              >
                Create one now!
              </Link>
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default DonorDashboard;
