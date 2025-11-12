import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle,
  Users,
  BarChart3,
  ArrowRight,
  LogOut,
  MessageSquare,
  User,
  LineChart,
  Home,
  Smile,
  HeartHandshake,
  Activity,
  Trophy,
  FileBarChart,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const VolunteerDashboard = () => {
  const [impact, setImpact] = useState<any>({
    total_tasks: 0,
    completed_tasks: 0,
    active_tasks: 0,
    ngos_helped: 0,
    success_rate: 0,
    performance_level: "Beginner",
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Fetch Dashboard Data
  useEffect(() => {
    if (!volunteer.id) return;
    const fetchData = async () => {
      setLoading(true);

      const { data: impactData } = await supabase
        .from("volunteer_impact")
        .select("*")
        .eq("volunteer_id", volunteer.id)
        .single();
      if (impactData) setImpact(impactData);

      const { data: tasks } = await supabase
        .from("volunteer_assignments")
        .select(`
          id, status, assigned_at, updated_at,
          donations (category, description, image_url, amount, quantity, status),
          ngos (name, city)
        `)
        .eq("volunteer_id", volunteer.id)
        .order("assigned_at", { ascending: false })
        .limit(5);
      if (tasks) setRecentTasks(tasks);

      const { data: actions } = await supabase
        .from("volunteer_activity")
        .select("action, details, created_at")
        .eq("volunteer_id", volunteer.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (actions) setActivity(actions);

      setLoading(false);
    };
    fetchData();
  }, [volunteer.id]);

  // ✅ Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate("/auth");
  };

  // 📊 Chart Data for Progress
  const chartData = [
    { name: "Completed", value: impact.completed_tasks },
    { name: "Active", value: impact.active_tasks },
  ];
  const COLORS = ["#22c55e", "#facc15"];

  const progressPercent =
    impact.total_tasks > 0
      ? Math.round((impact.completed_tasks / impact.total_tasks) * 100)
      : 0;

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-3">
        <Loader2 size={28} className="animate-spin" />
        <p>Loading your dashboard...</p>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🧭 Sidebar */}
      <aside className="w-64 bg-white shadow-xl p-6 border-r border-gray-200 hidden md:flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-700 mb-8">
            Volunteer Panel
          </h2>
          <nav className="space-y-3">
            {[
              { to: "/volunteer/dashboard", label: "Dashboard", icon: Home },
              { to: "/volunteer/tasks", label: "Assigned Tasks", icon: ClipboardList },
              { to: "/volunteer/join-ngo", label: "Join NGOs", icon: HeartHandshake },
              { to: "/volunteer/activity", label: "Activity", icon: Activity },
              { to: "/volunteer/impact", label: "My Impact", icon: LineChart },
              { to: "/volunteer/leaderboard", label: "Leaderboard", icon: Trophy },
              { to: "/volunteer/reports", label: "Reports", icon: FileBarChart },
              { to: "/volunteer/messages", label: "Messages", icon: MessageSquare },
              { to: "/volunteer/profile", label: "Profile", icon: User },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-100 text-blue-700 font-medium transition"
              >
                <Icon size={18} /> {label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* 🌟 Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">
              Welcome, {volunteer.name || "Volunteer"} 👋
            </h1>
            <p className="text-gray-500">
              “Small acts, when multiplied by millions, can transform the world.”
            </p>
          </div>
          <Link
            to="/volunteer/tasks"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            View Tasks <ArrowRight size={18} />
          </Link>
        </div>

        {/* 📊 Stats Section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Tasks"
            value={impact.total_tasks}
            color="blue"
            icon={ClipboardList}
          />
          <StatCard
            title="Completed Tasks"
            value={impact.completed_tasks}
            color="green"
            icon={CheckCircle}
            trend="up"
          />
          <StatCard
            title="Active Tasks"
            value={impact.active_tasks}
            color="yellow"
            icon={BarChart3}
          />
          <StatCard
            title="NGOs Helped"
            value={impact.ngos_helped}
            color="purple"
            icon={Users}
          />
        </div>

        {/* 🧭 Progress Chart + Level */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 flex flex-col md:flex-row items-center justify-around">
          <div className="w-72 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  label
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-blue-700 mb-2">
              Performance Overview
            </h3>
            <p className="text-gray-600 mb-2">
              Completion Rate:{" "}
              <span className="font-semibold text-green-600">
                {progressPercent}%
              </span>
            </p>
            <p className="text-gray-600">
              Current Level:{" "}
              <span className="font-semibold text-blue-600">
                {impact.performance_level}
              </span>
            </p>
            <Smile size={28} className="mt-3 mx-auto md:mx-0 text-blue-500" />
          </div>
        </div>

        {/* 🕒 Recent Activity Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-10">
          <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <Activity size={20} /> Recent Volunteer Activity
          </h2>
          {activity.length === 0 ? (
            <p className="text-gray-600">No recent actions recorded.</p>
          ) : (
            <ul className="divide-y">
              {activity.map((a) => (
                <li key={a.created_at} className="py-3 flex justify-between">
                  <span className="text-gray-700">{a.action}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 🗂️ Recent Tasks Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <ClipboardList size={20} /> Recent Assignments
          </h2>
          {recentTasks.length === 0 ? (
            <p className="text-gray-600">No recent assignments yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {recentTasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// 🧩 Components
const StatCard = ({ title, value, color, icon: Icon, trend }: any) => {
  const colorMap: any = {
    blue: "border-blue-600 text-blue-700",
    green: "border-green-600 text-green-700",
    yellow: "border-yellow-500 text-yellow-700",
    purple: "border-purple-600 text-purple-700",
  };
  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 border-l-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-3">
        <Icon className={`${colorMap[color].split(" ")[1]}`} size={28} />
        <div>
          <h3 className="font-semibold text-gray-700">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        {trend && (
          <div className="ml-auto">
            {trend === "up" ? (
              <TrendingUp size={18} className="text-green-500" />
            ) : (
              <TrendingDown size={18} className="text-red-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ task }: any) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
    <div className="flex items-center gap-3 mb-2">
      <img
        src={task.donations?.image_url || "/placeholder.png"}
        alt="Donation"
        className="w-16 h-16 rounded-lg object-cover border"
      />
      <div>
        <h3 className="font-semibold text-blue-700">
          {task.donations?.category}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {task.donations?.description}
        </p>
      </div>
    </div>
    <div className="flex justify-between items-center text-sm mt-2">
      <span
        className={`px-2 py-1 rounded-full ${
          task.status === "Delivered"
            ? "bg-green-100 text-green-700"
            : task.status === "In Progress"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {task.status}
      </span>
      <p className="text-gray-500">
        {task.ngos?.name} ({task.ngos?.city})
      </p>
    </div>
  </div>
);

export default VolunteerDashboard;
