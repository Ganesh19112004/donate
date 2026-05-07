import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

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
  IndianRupee,
  TrendingUp,
  Sparkles,
  BadgeCheck,
  Wallet,
  Loader2,
  Clock,
  CheckCircle,
} from "lucide-react";

const DonorDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [donor, setDonor] =
    useState<any>(null);

  const [donations, setDonations] =
    useState<any[]>([]);

  const [favoriteCount, setFavoriteCount] =
    useState(0);

  const [stats, setStats] = useState({
    total: 0,

    totalValue: 0,

    ngos: 0,

    moneyDonations: 0,

    onlineDonations: 0,

    completedDonations: 0,

    pendingDonations: 0,

    impactScore: 0,

    donorLevel: "Bronze",

    streak: 0,
  });

  useEffect(() => {
    initializeDashboard();
  }, []);

  async function initializeDashboard() {
    const storedUser =
      localStorage.getItem("user");

    const storedRole =
      localStorage.getItem("role");

    if (
      !storedUser ||
      storedRole !== "donor"
    ) {
      navigate("/auth");
      return;
    }

    const donorData =
      JSON.parse(storedUser);

    setDonor(donorData);

    setLoading(true);

    try {
      /* ---------------- DONATIONS ---------------- */

      const { data, error } =
        await supabase
          .from("donations")
          .select(`
            *,
            ngos(name)
          `)
          .eq(
            "donor_id",
            donorData.id
          )
          .order("created_at", {
            ascending: false,
          });

      if (error) throw error;

      setDonations(data || []);

      /* ---------------- FAVORITES ---------------- */

      const {
        count: favorites,
      } = await supabase
        .from("favorites")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "donor_id",
          donorData.id
        );

      setFavoriteCount(
        favorites || 0
      );

      /* ---------------- CALCULATIONS ---------------- */

      const total =
        data?.length || 0;

      const totalValue =
        (data || []).reduce(
          (sum, d) =>
            sum +
            Number(d.amount || 0),
          0
        );

      const ngos =
        new Set(
          (data || []).map(
            (d) => d.ngo_id
          )
        ).size;

      const moneyDonations =
        data?.filter(
          (d) =>
            d.category === "Money"
        ).length || 0;

      const onlineDonations =
        data?.filter(
          (d) => d.payment_id
        ).length || 0;

      const completedDonations =
        data?.filter(
          (d) =>
            d.status ===
            "Completed"
        ).length || 0;

      const pendingDonations =
        data?.filter(
          (d) =>
            d.status === "Pending"
        ).length || 0;

      /* ---------------- IMPACT SCORE ---------------- */

      const impactScore =
        total * 10 +
        ngos * 20 +
        completedDonations * 5;

      /* ---------------- DONOR LEVEL ---------------- */

      let donorLevel =
        "Bronze";

      if (total >= 25)
        donorLevel = "Diamond";
      else if (total >= 15)
        donorLevel = "Gold";
      else if (total >= 7)
        donorLevel = "Silver";

      /* ---------------- STREAK ---------------- */

      const streak = Math.min(
        total,
        30
      );

      setStats({
        total,

        totalValue,

        ngos,

        moneyDonations,

        onlineDonations,

        completedDonations,

        pendingDonations,

        impactScore,

        donorLevel,

        streak,
      });
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  function handleLogout() {
    localStorage.clear();

    navigate("/auth");
  }

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-100">

        <div className="flex items-center gap-3 text-2xl font-bold text-blue-700">

          <Loader2 className="animate-spin" />

          Loading Dashboard...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* SIDEBAR */}

      <aside className="w-72 bg-white shadow-2xl p-6 fixed h-full overflow-y-auto rounded-r-3xl hidden lg:flex flex-col justify-between">

        <div>

          <h1 className="text-3xl font-extrabold text-blue-700 mb-10">
            DanSetu
          </h1>

          <nav className="space-y-3">

            {sidebarLinks.map(
              (item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl transition font-medium"
                >
                  {item.icon}

                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-600 font-semibold hover:bg-red-50 p-3 rounded-xl transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* MAIN */}

      <main className="flex-1 lg:ml-72 p-8">

        {/* HEADER */}

        <div className="mb-10 flex flex-wrap justify-between items-center gap-5">

          <div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">

              Welcome,
              {" "}
              {donor?.name ||
                "Donor"} 👋
            </h1>

            <p className="text-gray-600 mt-3 text-lg">
              Track your impact and
              help NGOs across India.
            </p>
          </div>

          <Link
            to="/donor/create-donation"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold shadow-lg"
          >
            <PlusCircle size={20} />

            Create Donation
          </Link>
        </div>

        {/* HERO */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl mb-10">

          <div className="flex justify-between items-center flex-wrap gap-5">

            <div>

              <p className="text-blue-100 text-lg">
                Total Contributions
              </p>

              <h2 className="text-5xl font-extrabold mt-2">
                ₹
                {stats.totalValue}
              </h2>

              <p className="mt-3 text-blue-100">
                Helped{" "}
                {stats.ngos} NGOs
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6">

              <Heart size={60} />
            </div>
          </div>
        </div>

        {/* TOP ANALYTICS */}

        <div className="grid lg:grid-cols-3 gap-6 mb-10">

          {/* DONOR LEVEL */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-5">

              <div>

                <p className="text-gray-500 text-sm">
                  Donor Rank
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                  {stats.donorLevel}
                </h2>
              </div>

              <Award
                className="text-amber-500"
                size={38}
              />
            </div>

            <div className="flex items-center gap-2 text-amber-600 font-semibold">

              <BadgeCheck size={20} />

              Verified Donor
            </div>

            <p className="text-gray-500 mt-3 text-sm">
              Continue donating to
              unlock higher donor
              levels.
            </p>
          </div>

          {/* IMPACT */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-5">

              <div>

                <p className="text-gray-500 text-sm">
                  Impact Score
                </p>

                <h2 className="text-3xl font-bold text-green-600 mt-1">
                  {stats.impactScore}
                </h2>
              </div>

              <TrendingUp
                className="text-green-600"
                size={38}
              />
            </div>

            <p className="text-gray-500 text-sm">
              Based on donations,
              NGOs supported and
              completed help.
            </p>
          </div>

          {/* STREAK */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-5">

              <div>

                <p className="text-gray-500 text-sm">
                  Donation Streak
                </p>

                <h2 className="text-3xl font-bold text-purple-600 mt-1">
                  {stats.streak} Days
                </h2>
              </div>

              <Sparkles
                className="text-purple-600"
                size={38}
              />
            </div>

            <p className="text-gray-500 text-sm">
              Keep donating regularly
              to increase your streak.
            </p>
          </div>
        </div>

        {/* MAIN STATS */}

        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

          <StatCard
            icon={<Gift />}
            label="Total Donations"
            value={stats.total}
            gradient="from-blue-500 to-blue-700"
          />

          <StatCard
            icon={<IndianRupee />}
            label="Money Donations"
            value={stats.moneyDonations}
            gradient="from-green-500 to-green-700"
          />

          <StatCard
            icon={<Building2 />}
            label="NGOs Helped"
            value={stats.ngos}
            gradient="from-purple-500 to-purple-700"
          />

          <StatCard
            icon={<Wallet />}
            label="Online Donations"
            value={stats.onlineDonations}
            gradient="from-pink-500 to-rose-600"
          />
        </section>

        {/* MINI STATS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">

          <MiniStat
            icon={<Clock />}
            label="Pending"
            value={stats.pendingDonations}
            color="yellow"
          />

          <MiniStat
            icon={<CheckCircle />}
            label="Completed"
            value={
              stats.completedDonations
            }
            color="green"
          />

          <MiniStat
            icon={<Heart />}
            label="Favorites"
            value={favoriteCount}
            color="pink"
          />

          <MiniStat
            icon={<LineChart />}
            label="Impact"
            value={stats.impactScore}
            color="indigo"
          />
        </div>

        {/* QUICK ACTIONS */}

        <h2 className="text-2xl font-bold text-gray-800 mb-4">

          Quick Actions
        </h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">

          {quickLinks.map(
            (item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`${item.bg} shadow-xl p-6 rounded-3xl text-white hover:scale-105 transition flex flex-col items-center gap-3`}
              >
                {item.icon}

                <span className="font-semibold text-lg text-center">
                  {item.label}
                </span>
              </Link>
            )
          )}
        </div>

        {/* RECENT DONATIONS */}

        <section>

          <h2 className="text-2xl font-bold text-gray-800 mb-5">

            Recent Donations
          </h2>

          {donations.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 shadow-xl text-center">

              <p className="text-gray-500 text-lg">
                No donations yet.
              </p>

              <Link
                to="/donor/create-donation"
                className="inline-block mt-5 text-blue-600 font-semibold"
              >
                Create Donation →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-xl rounded-3xl">

              <table className="w-full">

                <thead className="bg-gray-50 text-gray-700">

                  <tr>

                    <th className="p-4 text-left">
                      NGO
                    </th>

                    <th className="p-4 text-left">
                      Category
                    </th>

                    <th className="p-4 text-left">
                      Description
                    </th>

                    <th className="p-4 text-left">
                      Amount
                    </th>

                    <th className="p-4 text-left">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {donations
                    .slice(0, 6)
                    .map((d) => (
                      <tr
                        key={d.id}
                        className="border-t hover:bg-gray-50 transition"
                      >

                        <td className="p-4">

                          {d.ngos?.name ||
                            "—"}
                        </td>

                        <td className="p-4">

                          {d.category}
                        </td>

                        <td className="p-4 max-w-xs truncate">

                          {
                            d.description
                          }
                        </td>

                        <td className="p-4 font-bold text-green-600">

                          {d.category ===
                          "Money"
                            ? `₹${d.amount}`
                            : d.quantity}
                        </td>

                        <td className="p-4">

                          <StatusBadge
                            status={d.status}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const StatCard = ({
  icon,
  label,
  value,
  gradient,
}: any) => (
  <div
    className={`bg-gradient-to-br ${gradient} text-white rounded-3xl p-6 shadow-xl hover:scale-[1.03] transition`}
  >

    <div className="text-4xl mb-4">
      {icon}
    </div>

    <p className="opacity-80 text-sm">
      {label}
    </p>

    <h2 className="text-3xl font-extrabold mt-1">
      {value}
    </h2>
  </div>
);

const MiniStat = ({
  icon,
  label,
  value,
  color,
}: any) => {
  const map: any = {
    yellow:
      "bg-yellow-100 text-yellow-700",

    green:
      "bg-green-100 text-green-700",

    pink:
      "bg-pink-100 text-pink-700",

    indigo:
      "bg-indigo-100 text-indigo-700",
  };

  return (
    <div
      className={`${map[color]} rounded-2xl p-5 shadow-md flex flex-col items-center`}
    >

      <div className="text-2xl mb-2">
        {icon}
      </div>

      <p className="text-sm">
        {label}
      </p>

      <p className="text-2xl font-bold">
        {value}
      </p>
    </div>
  );
};

const StatusBadge = ({
  status,
}: any) => {
  const styles: any = {
    Pending:
      "bg-yellow-100 text-yellow-700",

    Accepted:
      "bg-green-100 text-green-700",

    Completed:
      "bg-blue-100 text-blue-700",

    Cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
};

/* ---------------- SIDEBAR ---------------- */

const sidebarLinks = [
  {
    to: "/donor/dashboard",
    label: "Dashboard",
    icon: <BarChart size={20} />,
  },

  {
    to: "/donor/profile",
    label: "Profile",
    icon: <User size={20} />,
  },

  {
    to: "/donor/create-donation",
    label: "Create Donation",
    icon: (
      <PlusCircle size={20} />
    ),
  },

  {
    to: "/donor/donate-money",
    label: "Donate Money",
    icon: <Heart size={20} />,
  },

  {
    to: "/donor/my-money-donations",
    label: "Money History",
    icon: (
      <IndianRupee size={20} />
    ),
  },

  {
    to: "/donor/history",
    label: "Donation History",
    icon: <History size={20} />,
  },

  {
    to: "/donor/campaigns",
    label: "Campaigns",
    icon: <Layers size={20} />,
  },

  {
    to: "/donor/favorites",
    label: "Favorites",
    icon: <Heart size={20} />,
  },

  {
    to: "/donor/impact",
    label: "My Impact",
    icon: (
      <LineChart size={20} />
    ),
  },

  {
    to: "/donor/messages",
    label: "Messages",
    icon: (
      <MessageSquare size={20} />
    ),
  },

  {
    to: "/donor/view-ngos",
    label: "View NGOs",
    icon: (
      <Building2 size={20} />
    ),
  },

  {
    to: "/donor/settings",
    label: "Settings",
    icon: (
      <Settings size={20} />
    ),
  },
];

/* ---------------- QUICK ACTIONS ---------------- */

const quickLinks = [
  {
    to: "/donor/create-donation",
    label: "Create Donation",
    bg: "bg-blue-600",
    icon: (
      <PlusCircle size={28} />
    ),
  },

  {
    to: "/donor/donate-money",
    label: "Donate Money",
    bg: "bg-green-600",
    icon: <Heart size={28} />,
  },

  {
    to: "/donor/campaigns",
    label: "Campaigns",
    bg: "bg-purple-600",
    icon: <Layers size={28} />,
  },

  {
    to: "/donor/view-ngos",
    label: "View NGOs",
    bg: "bg-orange-600",
    icon: (
      <Building2 size={28} />
    ),
  },

  {
    to: "/donor/favorites",
    label: "Favorites",
    bg: "bg-pink-600",
    icon: <Heart size={28} />,
  },

  {
    to: "/donor/impact",
    label: "Impact",
    bg: "bg-indigo-600",
    icon: (
      <TrendingUp size={28} />
    ),
  },

  {
    to: "/donor/messages",
    label: "Messages",
    bg: "bg-teal-600",
    icon: (
      <MessageSquare size={28} />
    ),
  },

  {
    to: "/donor/history",
    label: "History",
    bg: "bg-gray-700",
    icon: <History size={28} />,
  },
];

export default DonorDashboard;