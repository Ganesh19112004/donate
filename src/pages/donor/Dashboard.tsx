import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  PlusCircle,
  History,
  LogOut,
  Gift,
  BarChart,
  Settings,
  Building2,
  Heart,
  Award,
  User,
  MessageSquare,
  LineChart,
  Layers,
} from "lucide-react";

const DonorDashboard = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [donor, setDonor] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    ngos: 0,
    level: "Bronze",
  });
  const navigate = useNavigate();

  // ✅ Only localStorage-based auth check
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (!storedUser || storedRole !== "donor") {
      navigate("/auth");
      return;
    }

    const donorData = JSON.parse(storedUser);
    setDonor(donorData);

    const loadDonations = async () => {
      try {
        const { data, error } = await supabase
          .from("donations")
          .select(
            "id, category, amount, quantity, status, description, ngo_id, ngos(name)"
          )
          .eq("donor_id", donorData.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setDonations(data || []);

        // Stats calculation
        const totalValue = (data || []).reduce(
          (sum, d) => sum + (Number(d.amount) || 0),
          0
        );
        const ngoCount = new Set((data || []).map((d) => d.ngo_id)).size;
        const total = data?.length || 0;
        const level = total > 15 ? "Gold" : total > 5 ? "Silver" : "Bronze";

        setStats({ total, totalValue, ngos: ngoCount, level });
      } catch (err) {
        console.error("Error fetching donations:", err);
      }
    };

    loadDonations();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-700 mb-8">
            DenaSetu
          </h1>

          <nav className="space-y-3">
            <Link
              to="/donor/dashboard"
              className="flex items-center gap-3 text-blue-600 font-semibold bg-blue-50 p-3 rounded-lg"
            >
              <BarChart size={20} /> Dashboard
            </Link>

            <Link
              to="/donor/profile"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <User size={20} /> Profile
            </Link>

            <Link
              to="/donor/create-donation"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <PlusCircle size={20} /> Create Donation
            </Link>
            <Link
  to="/donor/donate-money"
  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
>
  <Heart size={20} /> Donate Money
</Link>


            <Link
              to="/donor/history"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <History size={20} /> Donation History
            </Link>

            {/* ⭐ Ongoing Campaigns */}
            <Link
              to="/donor/campaigns"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <Layers size={20} /> Ongoing Campaigns
            </Link>

            <Link
              to="/donor/favorites"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <Heart size={20} /> Favorites
            </Link>

            <Link
              to="/donor/impact"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <LineChart size={20} /> My Impact
            </Link>

            <Link
              to="/donor/messages"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <MessageSquare size={20} /> Message Center
            </Link>

            <Link
              to="/donor/view-ngos"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg"
            >
              <Building2 size={20} /> View NGOs
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
          className="flex items-center gap-3 text-red-600 font-semibold hover:text-red-700 p-3 rounded-lg"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Section */}
      <main className="flex-1 p-8">
        {/* Page Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">
              Welcome, {donor?.name || "Donor"} 👋
            </h1>
            <p className="text-gray-600">
              Here’s your donation summary and activity overview.
            </p>
          </div>

          <Link
            to="/donor/create-donation"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <PlusCircle size={18} /> New Donation
          </Link>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white shadow-md border rounded-xl p-6 text-center">
            <Gift className="mx-auto text-blue-600 mb-3" size={32} />
            <h2 className="text-2xl font-bold text-blue-700">
              {stats.total}
            </h2>
            <p className="text-gray-600">Total Donations</p>
          </div>

          <div className="bg-white shadow-md border rounded-xl p-6 text-center">
            <BarChart className="mx-auto text-green-600 mb-3" size={32} />
            <h2 className="text-2xl font-bold text-green-700">
              ₹{stats.totalValue}
            </h2>
            <p className="text-gray-600">Total Value Donated</p>
          </div>

          <div className="bg-white shadow-md border rounded-xl p-6 text-center">
            <Building2 className="mx-auto text-purple-600 mb-3" size={32} />
            <h2 className="text-2xl font-bold text-purple-700">
              {stats.ngos}
            </h2>
            <p className="text-gray-600">NGOs Helped</p>
          </div>

          <div className="bg-white shadow-md border rounded-xl p-6 text-center">
            <Award className="mx-auto text-amber-500 mb-3" size={32} />
            <h2 className="text-2xl font-bold text-amber-600">
              {stats.level}
            </h2>
            <p className="text-gray-600">Donor Level</p>
          </div>
        </section>

        {/* Recent Donations */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            Recent Donations
          </h2>

          {donations.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md border overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="p-4 text-left">NGO</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Amount / Qty</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {donations.slice(0, 5).map((d) => (
                    <tr
                      key={d.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4">{d.ngos?.name || "—"}</td>
                      <td className="p-4">{d.category}</td>
                      <td className="p-4 truncate max-w-xs">
                        {d.description}
                      </td>
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
            </div>
          ) : (
            <p className="text-center text-gray-600">
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
