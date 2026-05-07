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
  Megaphone,
  LogOut,
  Package,
  IndianRupee,
  Wallet,
  Landmark,
  TrendingUp,
  AlertCircle,
  BadgeCheck,
  Activity,
  Loader2,
} from "lucide-react";

const NGODashboard = () => {
  const ngo = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [loading, setLoading] = useState(true);

  const [ngoName, setNgoName] =
    useState("Your NGO");

  const [recentDonations, setRecentDonations] =
    useState<any[]>([]);

  const [bankDetails, setBankDetails] =
    useState<any>(null);

  const [profileCompletion, setProfileCompletion] =
    useState(0);

  const [stats, setStats] = useState({
    totalDonations: 0,

    totalVolunteers: 0,

    activeCampaigns: 0,

    totalMoneyReceived: 0,

    onlineDonations: 0,

    moneyDonors: 0,

    pendingDonations: 0,

    completedDonations: 0,

    assignedDonations: 0,

    pendingPayouts: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    if (!ngo?.id) return;

    setLoading(true);

    try {
      /* ---------------- DONATIONS ---------------- */

      const { data: donations } =
        await supabase
          .from("donations")
          .select("*")
          .eq("ngo_id", ngo.id);

      /* ---------------- MONEY RECEIVED ---------------- */

      const totalMoneyReceived =
        donations
          ?.filter(
            (d) =>
              d.status === "Completed" &&
              Number(d.amount) > 0
          )
          .reduce(
            (sum, d) =>
              sum + Number(d.amount),
            0
          ) || 0;

      /* ---------------- ONLINE DONATIONS ---------------- */

      const onlineDonations =
        donations?.filter(
          (d) =>
            d.category === "Money" &&
            d.payment_id
        ).length || 0;

      /* ---------------- PENDING PAYOUTS ---------------- */

      const pendingPayouts =
        donations
          ?.filter(
            (d) =>
              d.category === "Money" &&
              d.status === "Completed"
          )
          .reduce(
            (sum, d) =>
              sum + Number(d.amount || 0),
            0
          ) || 0;

      /* ---------------- DONOR COUNT ---------------- */

      const moneyDonors =
        donations?.filter(
          (d) => Number(d.amount) > 0
        ).length || 0;

      /* ---------------- DONATION STATS ---------------- */

      const pending =
        donations?.filter(
          (d) => d.status === "Pending"
        ).length || 0;

      const assigned =
        donations?.filter(
          (d) => d.status === "Assigned"
        ).length || 0;

      const completed =
        donations?.filter(
          (d) => d.status === "Completed"
        ).length || 0;

      /* ---------------- VOLUNTEERS ---------------- */

      const {
        count: volunteerCount,
      } = await supabase
        .from("volunteer_assignments")
        .select("volunteer_id", {
          count: "exact",
          head: true,
        })
        .eq("ngo_id", ngo.id);

      /* ---------------- CAMPAIGNS ---------------- */

      const {
        count: campaignCount,
      } = await supabase
        .from("ngo_campaigns")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("ngo_id", ngo.id)
        .eq("status", "Active");

      /* ---------------- RECENT DONATIONS ---------------- */

      const { data: recent } =
        await supabase
          .from("donations")
          .select(`
            id,
            amount,
            category,
            status,
            created_at
          `)
          .eq("ngo_id", ngo.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(5);

      /* ---------------- BANK DETAILS ---------------- */

      const { data: bank } =
        await supabase
          .from("ngo_bank_details")
          .select("*")
          .eq("ngo_id", ngo.id)
          .single();

      setBankDetails(bank);

      /* ---------------- PROFILE COMPLETION ---------------- */

      let profileFields = 0;

      if (ngo.name) profileFields++;
      if (ngo.image_url) profileFields++;
      if (ngo.description) profileFields++;
      if (ngo.address) profileFields++;
      if (ngo.phone) profileFields++;
      if (ngo.website) profileFields++;

      const completion = Math.floor(
        (profileFields / 6) * 100
      );

      setProfileCompletion(completion);

      /* ---------------- SET STATS ---------------- */

      setStats({
        totalDonations:
          donations?.length || 0,

        totalVolunteers:
          volunteerCount || 0,

        activeCampaigns:
          campaignCount || 0,

        totalMoneyReceived,

        onlineDonations,

        moneyDonors,

        pendingDonations: pending,

        assignedDonations: assigned,

        completedDonations: completed,

        pendingPayouts,
      });

      setRecentDonations(recent || []);

      setNgoName(
        ngo.name || "Your NGO"
      );
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
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

      <aside className="w-72 bg-white shadow-2xl p-6 fixed h-full overflow-y-auto rounded-r-3xl z-10">

        <h2 className="text-3xl font-extrabold text-blue-600 mb-10">
          NGO Panel
        </h2>

        <nav className="flex flex-col gap-4">

          {sidebarLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition font-medium text-gray-700"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN */}

      <main className="flex-1 ml-72 p-10">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Welcome, {ngoName}
          </h1>

          <p className="text-gray-600 mt-3 text-lg">
            Manage donations, campaigns,
            volunteers & finances.
          </p>
        </div>

        {/* MONEY HERO */}

        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-8 shadow-2xl text-white mb-10">

          <div className="flex justify-between items-center flex-wrap gap-5">

            <div>

              <p className="text-green-100 text-lg">
                Total Online Donations
              </p>

              <h2 className="text-5xl font-extrabold mt-2">
                ₹
                {stats.totalMoneyReceived}
              </h2>

              <p className="mt-3 text-green-100">
                Received from{" "}
                {stats.moneyDonors} donors
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6">

              <IndianRupee size={60} />
            </div>
          </div>
        </div>

        {/* TOP ANALYTICS */}

        <div className="grid lg:grid-cols-3 gap-6 mb-10">

          {/* BANK */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-5">

              <div>

                <p className="text-gray-500 text-sm">
                  NGO Payout Account
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                  Bank Details
                </h2>
              </div>

              <Landmark
                className="text-blue-600"
                size={36}
              />
            </div>

            {bankDetails ? (
              <div>

                <div className="flex items-center gap-2 text-green-600 font-semibold mb-3">

                  <BadgeCheck size={20} />

                  Bank Account Added
                </div>

                <p className="text-gray-700">
                  {
                    bankDetails.bank_name
                  }
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  ****
                  {bankDetails.account_number?.slice(
                    -4
                  )}
                </p>

                <Link
                  to="/ngo/bank-details"
                  className="inline-block mt-5 text-blue-600 font-semibold"
                >
                  Manage Account →
                </Link>
              </div>
            ) : (
              <div>

                <div className="flex items-center gap-2 text-red-600 font-semibold mb-3">

                  <AlertCircle size={20} />

                  No Bank Details
                </div>

                <p className="text-gray-500 text-sm">
                  Add payout account for
                  future real payments.
                </p>

                <Link
                  to="/ngo/bank-details"
                  className="inline-block mt-5 bg-blue-600 text-white px-4 py-2 rounded-xl"
                >
                  Add Bank Details
                </Link>
              </div>
            )}
          </div>

          {/* PROFILE */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-5">

              <div>

                <p className="text-gray-500 text-sm">
                  NGO Profile
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                  Completion
                </h2>
              </div>

              <Activity
                className="text-purple-600"
                size={36}
              />
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">

              <div
                style={{
                  width: `${profileCompletion}%`,
                }}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full"
              />
            </div>

            <p className="mt-4 text-3xl font-bold text-purple-700">
              {profileCompletion}%
            </p>

            <Link
              to="/ngo/profile"
              className="inline-block mt-4 text-purple-600 font-semibold"
            >
              Complete Profile →
            </Link>
          </div>

          {/* ANALYTICS */}

          <div className="bg-white rounded-3xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-5">

              <div>

                <p className="text-gray-500 text-sm">
                  Online Donations
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                  Analytics
                </h2>
              </div>

              <TrendingUp
                className="text-green-600"
                size={36}
              />
            </div>

            <div className="space-y-4">

              <div className="flex justify-between">

                <span className="text-gray-600">
                  Total Received
                </span>

                <span className="font-bold text-green-600">
                  ₹
                  {
                    stats.totalMoneyReceived
                  }
                </span>
              </div>

              <div className="flex justify-between">

                <span className="text-gray-600">
                  Online Donations
                </span>

                <span className="font-bold">
                  {
                    stats.onlineDonations
                  }
                </span>
              </div>

              <div className="flex justify-between">

                <span className="text-gray-600">
                  Pending Payouts
                </span>

                <span className="font-bold text-orange-600">
                  ₹
                  {
                    stats.pendingPayouts
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN STATS */}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">

          <StatCard
            label="Total Donations"
            value={stats.totalDonations}
            icon={<Gift />}
            gradient="from-blue-400 to-blue-600"
          />

          <StatCard
            label="Volunteers"
            value={stats.totalVolunteers}
            icon={<Users />}
            gradient="from-green-400 to-green-600"
          />

          <StatCard
            label="Campaigns"
            value={stats.activeCampaigns}
            icon={<ClipboardList />}
            gradient="from-purple-400 to-purple-600"
          />

          <StatCard
            label="Money Received"
            value={`₹${stats.totalMoneyReceived}`}
            icon={<Wallet />}
            gradient="from-emerald-400 to-green-600"
          />
        </div>

        {/* MINI STATS */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">

          <MiniStat
            label="Pending"
            value={stats.pendingDonations}
            color="yellow"
            icon={<Clock />}
          />

          <MiniStat
            label="Assigned"
            value={stats.assignedDonations}
            color="indigo"
            icon={<Truck />}
          />

          <MiniStat
            label="Completed"
            value={stats.completedDonations}
            color="green"
            icon={<CheckCircle />}
          />

          <MiniStat
            label="Donors"
            value={stats.moneyDonors}
            color="green"
            icon={<Users />}
          />

          <MiniStat
            label="Online"
            value={stats.onlineDonations}
            color="indigo"
            icon={<IndianRupee />}
          />
        </div>

        {/* QUICK ACTIONS */}

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">

          {quickLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`${item.bg} shadow-md p-6 rounded-2xl text-white hover:scale-105 transition flex flex-col items-center gap-3`}
            >
              {item.icon}

              <span className="font-semibold text-lg">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* RECENT DONATIONS */}

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Recent Donations
        </h2>

        {recentDonations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">

            <p className="text-gray-500 text-lg">
              No recent donations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-xl rounded-2xl">

            <table className="w-full text-left">

              <thead className="bg-gray-50 text-gray-700 font-semibold">

                <tr>

                  <th className="p-4">
                    Category
                  </th>

                  <th className="p-4">
                    Amount
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>

                {recentDonations.map(
                  (d) => (
                    <tr
                      key={d.id}
                      className="border-b hover:bg-gray-50 transition"
                    >

                      <td className="p-4">
                        {d.category}
                      </td>

                      <td className="p-4 font-bold text-green-600">

                        {d.amount
                          ? `₹${d.amount}`
                          : "—"}
                      </td>

                      <td className="p-4">

                        <StatusBadge
                          status={d.status}
                        />
                      </td>

                      <td className="p-4 text-gray-500">

                        {new Date(
                          d.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const StatCard = ({
  label,
  value,
  icon,
  gradient,
}: any) => (
  <div
    className={`p-6 rounded-3xl text-white bg-gradient-to-br ${gradient} shadow-xl hover:scale-[1.03] transition`}
  >

    <div className="text-4xl mb-3">
      {icon}
    </div>

    <p className="text-sm opacity-80">
      {label}
    </p>

    <p className="text-3xl font-extrabold">
      {value}
    </p>
  </div>
);

const MiniStat = ({
  label,
  value,
  color,
  icon,
}: any) => {
  const bg: any = {
    yellow:
      "bg-yellow-100 text-yellow-700",

    green:
      "bg-green-100 text-green-700",

    indigo:
      "bg-indigo-100 text-indigo-700",

    gray:
      "bg-gray-100 text-gray-700",
  };

  return (
    <div
      className={`${bg[color]} p-4 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center`}
    >

      <div className="text-xl mb-1">
        {icon}
      </div>

      <p className="text-sm">
        {label}
      </p>

      <p className="text-xl font-bold">
        {value}
      </p>
    </div>
  );
};

const StatusBadge = ({
  status,
}: any) => {
  const map: any = {
    Completed:
      "bg-green-100 text-green-700",

    Pending:
      "bg-yellow-100 text-yellow-700",

    Assigned:
      "bg-purple-100 text-purple-700",

    Cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs ${map[status]}`}
    >
      {status}
    </span>
  );
};

/* ---------------- SIDEBAR ---------------- */

const sidebarLinks = [
  {
    to: "/ngo/dashboard",
    label: "Dashboard",
    icon: <BarChart2 size={20} />,
  },

  {
    to: "/ngo/manage",
    label: "Manage Donations",
    icon: (
      <ClipboardList size={20} />
    ),
  },

  {
    to: "/ngo/money-received",
    label: "Money Received",
    icon: (
      <IndianRupee size={20} />
    ),
  },

  {
    to: "/ngo/bank-details",
    label: "Bank Details",
    icon: <Landmark size={20} />,
  },

  {
    to: "/ngo/needs",
    label: "Needed Items",
    icon: <Package size={20} />,
  },

  {
    to: "/ngo/pending",
    label: "Pending Donations",
    icon: <Clock size={20} />,
  },

  {
    to: "/ngo/volunteers",
    label: "Volunteers",
    icon: <Users size={20} />,
  },

  {
    to: "/ngo/campaigns",
    label: "Campaigns",
    icon: <Layers size={20} />,
  },

  {
    to: "/ngo/messages",
    label: "Messages",
    icon: (
      <MessageSquare size={20} />
    ),
  },

  {
    to: "/ngo/gallery",
    label: "Gallery",
    icon: <Image size={20} />,
  },

  {
    to: "/ngo/profile",
    label: "Profile",
    icon: (
      <UserCircle size={20} />
    ),
  },

  {
    to: "/ngo/logout",
    label: "Logout",
    icon: <LogOut size={20} />,
  },
];

/* ---------------- QUICK LINKS ---------------- */

const quickLinks = [
  {
    to: "/ngo/create",
    label: "Create Campaign",
    bg: "bg-blue-600",
    icon: (
      <PlusCircle size={26} />
    ),
  },

  {
    to: "/ngo/manage",
    label: "Manage Donations",
    bg: "bg-green-600",
    icon: (
      <ClipboardList size={26} />
    ),
  },

  {
    to: "/ngo/needs",
    label: "Needed Items",
    bg: "bg-orange-600",
    icon: <Package size={26} />,
  },

  {
    to: "/ngo/volunteers",
    label: "Volunteers",
    bg: "bg-purple-600",
    icon: <Users size={26} />,
  },

  {
    to: "/ngo/money-received",
    label: "Money Received",
    bg: "bg-teal-600",
    icon: (
      <IndianRupee size={26} />
    ),
  },

  {
    to: "/ngo/bank-details",
    label: "Bank Details",
    bg: "bg-emerald-600",
    icon: (
      <Landmark size={26} />
    ),
  },

  {
    to: "/ngo/gallery",
    label: "Gallery",
    bg: "bg-pink-600",
    icon: <Image size={26} />,
  },

  {
    to: "/ngo/posts",
    label: "Announcements",
    bg: "bg-indigo-600",
    icon: (
      <Megaphone size={26} />
    ),
  },
];

export default NGODashboard;