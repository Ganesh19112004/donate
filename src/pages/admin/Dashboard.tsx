import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

import {
  Users,
  Building2,
  HeartHandshake,
  Gift,
  BarChart3,
  Settings,
  LogOut,
  ArrowRight,
  Activity,
  ShieldCheck,
  Loader2,
  FileBarChart,
  Database,
  IndianRupee,
  TrendingUp,
  Sparkles,
  BadgeCheck,
  ClipboardCheck,
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

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState({
      ngos: 0,
      donors: 0,
      volunteers: 0,
      donations: 0,
      pending: 0,
      completed: 0,
      totalValue: 0,
      activeCampaigns: 0,
    });

  const [recentActivity, setRecentActivity] =
    useState<any[]>([]);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    try {
      const [
        { count: ngos },
        { count: donors },
        { count: volunteers },
      ] = await Promise.all([
        supabase
          .from("ngos")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("donors")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("volunteers")
          .select("id", {
            count: "exact",
            head: true,
          }),
      ]);

      const {
        data: donationsData,
      } = await supabase
        .from("donations")
        .select("*");

      const totalValue =
        donationsData?.reduce(
          (sum, d) =>
            sum +
            (Number(d.amount) ||
              0),
          0
        ) || 0;

      const pending =
        donationsData?.filter(
          (d) =>
            d.status ===
            "Pending"
        ).length || 0;

      const completed =
        donationsData?.filter(
          (d) =>
            d.status ===
            "Completed"
        ).length || 0;

      const {
        count: activeCampaigns,
      } = await supabase
        .from("ngo_campaigns")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "status",
          "Active"
        );

      const { data: recent } =
        await supabase
          .from(
            "donation_events"
          )
          .select(`
            event,
            note,
            created_at
          `)
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(10);

      setStats({
        ngos: ngos || 0,
        donors: donors || 0,
        volunteers:
          volunteers || 0,
        donations:
          donationsData?.length ||
          0,
        pending,
        completed,
        totalValue,
        activeCampaigns:
          activeCampaigns || 0,
      });

      setRecentActivity(
        recent || []
      );
    } catch (err) {
      console.error(err);

      alert(
        "Failed to load dashboard"
      );
    }

    setLoading(false);
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  function handleLogout() {
    localStorage.clear();

    navigate("/auth");
  }

  const pieData = [
    {
      name: "Pending",
      value: stats.pending,
    },

    {
      name: "Completed",
      value: stats.completed,
    },
  ];

  const COLORS = [
    "#facc15",
    "#22c55e",
  ];

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-100">

        <Loader2
          className="animate-spin text-blue-600"
          size={50}
        />

        <p className="text-lg font-semibold text-gray-600">

          Loading Dashboard...
        </p>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">

      {/* SIDEBAR */}

      <aside className="w-72 bg-white shadow-2xl border-r flex flex-col justify-between p-6">

        <div>

          {/* LOGO */}

          <div className="mb-10">

            <div className="flex items-center gap-3">

              <div className="bg-blue-600 p-3 rounded-2xl text-white">

                <ShieldCheck
                  size={30}
                />
              </div>

              <div>

                <h1 className="text-3xl font-black text-blue-700">

                  Admin
                </h1>

                <p className="text-gray-500 text-sm">

                  Control Center
                </p>
              </div>
            </div>
          </div>

          {/* MENU */}

          <nav className="space-y-3">

            {sidebarItems.map(
              ({
                to,
                label,
                icon: Icon,
              }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition font-semibold"
                >

                  <Icon size={20} />

                  {label}
                </Link>
              )
            )}
          </nav>
        </div>

        {/* LOGOUT */}

        <button
          onClick={
            handleLogout
          }
          className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-700 hover:bg-red-100 transition font-bold"
        >

          <LogOut size={20} />

          Logout
        </button>
      </aside>

      {/* MAIN */}

      <main className="flex-1 p-8">

        {/* HERO */}

        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-[32px] text-white p-8 shadow-2xl mb-10">

          <div className="absolute top-0 right-0 opacity-10">

            <Sparkles size={250} />
          </div>

          <div className="relative z-10 flex justify-between items-center">

            <div>

              <h1 className="text-5xl font-black mb-3">

                Welcome Admin 👑
              </h1>

              <p className="text-blue-100 text-lg">

                Monitor NGOs,
                Donors,
                Volunteers &
                Donations
              </p>
            </div>

            <Link
              to="/admin/reports"
              className="bg-white text-blue-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition"
            >

              Reports

              <ArrowRight
                size={20}
              />
            </Link>
          </div>
        </div>

        {/* STATS */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <StatCard
            label="NGOs"
            value={stats.ngos}
            icon={Building2}
            color="blue"
          />

          <StatCard
            label="Donors"
            value={stats.donors}
            icon={Users}
            color="green"
          />

          <StatCard
            label="Volunteers"
            value={
              stats.volunteers
            }
            icon={
              HeartHandshake
            }
            color="purple"
          />

          <StatCard
            label="Donations"
            value={
              stats.donations
            }
            icon={Gift}
            color="yellow"
          />
        </div>

        {/* VALUE + PIE */}

        <div className="grid lg:grid-cols-2 gap-8 mb-10">

          {/* TOTAL VALUE */}

          <div className="bg-white rounded-[28px] p-8 shadow-xl border">

            <div className="flex items-center gap-4 mb-6">

              <div className="bg-green-100 p-4 rounded-2xl">

                <IndianRupee
                  className="text-green-700"
                  size={32}
                />
              </div>

              <div>

                <h2 className="text-2xl font-black text-green-700">

                  Total Donation Value
                </h2>

                <p className="text-gray-500">

                  All NGO donations combined
                </p>
              </div>
            </div>

            <h1 className="text-6xl font-black text-green-600">

              ₹
              {stats.totalValue.toLocaleString()}
            </h1>

            <div className="mt-6 flex items-center gap-2 text-green-700 font-semibold">

              <TrendingUp
                size={20}
              />

              Growing donation ecosystem
            </div>
          </div>

          {/* PIE */}

          <div className="bg-white rounded-[28px] p-8 shadow-xl border">

            <div className="flex items-center gap-4 mb-6">

              <div className="bg-blue-100 p-4 rounded-2xl">

                <BarChart3
                  className="text-blue-700"
                  size={30}
                />
              </div>

              <div>

                <h2 className="text-2xl font-black text-blue-700">

                  Donation Status
                </h2>

                <p className="text-gray-500">

                  Pending vs Completed
                </p>
              </div>
            </div>

            <div className="w-full h-72">

              <ResponsiveContainer>

                <PieChart>

                  <Pie
                    innerRadius={
                      70
                    }
                    outerRadius={
                      100
                    }
                    data={pieData}
                    dataKey="value"
                    label
                  >

                    {pieData.map(
                      (
                        _,
                        i
                      ) => (
                        <Cell
                          key={i}
                          fill={
                            COLORS[
                              i
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="mb-10">

          <div className="flex items-center gap-3 mb-5">

            <ClipboardCheck
              className="text-blue-700"
              size={28}
            />

            <h2 className="text-3xl font-black text-gray-800">

              Quick Actions
            </h2>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">

            {quickActions.map(
              (item) => (
                <Link
                  key={
                    item.label
                  }
                  to={item.to}
                  className={`${item.bg} text-white p-7 rounded-[28px] shadow-xl hover:scale-105 transition flex flex-col items-center gap-4`}
                >

                  {
                    item.icon
                  }

                  <span className="text-xl font-bold">

                    {
                      item.label
                    }
                  </span>
                </Link>
              )
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}

        <div className="bg-white rounded-[28px] shadow-xl border p-8">

          <div className="flex items-center gap-3 mb-6">

            <Activity
              className="text-blue-700"
              size={28}
            />

            <h2 className="text-3xl font-black text-blue-700">

              Recent Activity
            </h2>
          </div>

          {recentActivity.length ===
          0 ? (
            <div className="text-center py-16 text-gray-500">

              No recent activity
            </div>
          ) : (
            <div className="space-y-4">

              {recentActivity.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl hover:bg-blue-50 transition"
                  >

                    <div>

                      <h3 className="font-bold text-gray-800">

                        {
                          item.event
                        }
                      </h3>

                      <p className="text-gray-500 text-sm">

                        {
                          item.note
                        }
                      </p>
                    </div>

                    <div className="text-sm text-gray-500">

                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: any) => {
  const colors: any = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border:
        "border-blue-600",
    },

    green: {
      bg: "bg-green-100",
      text: "text-green-700",
      border:
        "border-green-600",
    },

    purple: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border:
        "border-purple-600",
    },

    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border:
        "border-yellow-500",
    },
  };

  return (
    <div
      className={`bg-white rounded-[28px] shadow-xl border-l-4 ${colors[color].border} p-6`}
    >

      <div className="flex items-center gap-4">

        <div
          className={`${colors[color].bg} p-4 rounded-2xl`}
        >

          <Icon
            className={
              colors[color].text
            }
            size={30}
          />
        </div>

        <div>

          <p className="text-gray-500 font-semibold">

            {label}
          </p>

          <h2 className="text-4xl font-black">

            {value}
          </h2>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SIDEBAR
========================================================= */

const sidebarItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },

  {
    to: "/admin/ngos",
    label: "Manage NGOs",
    icon: Building2,
  },

  {
    to: "/admin/donors",
    label: "Manage Donors",
    icon: Users,
  },

  {
    to: "/admin/volunteers",
    label:
      "Manage Volunteers",
    icon: HeartHandshake,
  },

  {
    to: "/admin/donations",
    label: "Donations",
    icon: Gift,
  },

  {
    to: "/admin/reports",
    label: "Reports",
    icon: FileBarChart,
  },

  {
    to: "/admin/system",
    label: "System Monitor",
    icon: Database,
  },

  {
    to: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },

  {
    to: "/admin/ngo-applications",
    label:
      "NGO Applications",
    icon: ShieldCheck,
  },
];

/* =========================================================
   QUICK ACTIONS
========================================================= */

const quickActions = [
  {
    to: "/admin/create-ngo",
    label: "Add NGO",
    bg: "bg-blue-600",
    icon: (
      <Building2 size={34} />
    ),
  },

  {
    to: "/admin/create-donor",
    label: "Add Donor",
    bg: "bg-green-600",
    icon: (
      <Users size={34} />
    ),
  },

  {
    to: "/admin/create-volunteer",
    label:
      "Add Volunteer",
    bg: "bg-purple-600",
    icon: (
      <HeartHandshake
        size={34}
      />
    ),
  },

  {
    to: "/admin/donations",
    label:
      "View Donations",
    bg: "bg-yellow-500",
    icon: (
      <Gift size={34} />
    ),
  },

  {
    to: "/admin/reports",
    label: "Reports",
    bg: "bg-gray-700",
    icon: (
      <FileBarChart
        size={34}
      />
    ),
  },

  {
    to: "/admin/system",
    label:
      "System Logs",
    bg: "bg-red-600",
    icon: (
      <Activity
        size={34}
      />
    ),
  },

  {
    to: "/admin/settings",
    label: "Settings",
    bg: "bg-orange-600",
    icon: (
      <Settings
        size={34}
      />
    ),
  },
];

export default AdminDashboard;