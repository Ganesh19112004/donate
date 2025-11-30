import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Loader2,
  Eye,
  Trash2,
  XCircle,
  CheckCircle,
  KeyRound,
  User,
  Users,
} from "lucide-react";

const ManageVolunteers = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  /* -------------------- Fetch volunteers + stats -------------------- */
  const loadVolunteers = async () => {
    setLoading(true);
    try {
      // 1) Basic volunteer list
      const { data: volList, error } = await supabase
        .from("volunteers")
        .select("id, name, email, phone, city, image_url, created_at, status")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const final: any[] = [];

      for (const v of volList || []) {
        // total tasks for volunteer
        const { count: totalTasks } = await supabase
          .from("volunteer_assignments")
          .select("id", { count: "exact", head: true })
          .eq("volunteer_id", v.id);

        // completed tasks
        const { count: completedTasks } = await supabase
          .from("volunteer_assignments")
          .select("id", { count: "exact", head: true })
          .eq("volunteer_id", v.id)
          .eq("status", "Delivered");

        // ngos helped
        const { count: ngosHelped } = await supabase
          .from("volunteer_assignments")
          .select("ngo_id", { count: "exact", head: true })
          .eq("volunteer_id", v.id);

        // impact row (optional)
        const { data: impact } = await supabase
          .from("volunteer_impact")
          .select("total_tasks, completed_tasks, ngos_helped, performance_level")
          .eq("volunteer_id", v.id)
          .single();

        final.push({
          ...v,
          totalTasks: Number(totalTasks) || impact?.total_tasks || 0,
          completedTasks: Number(completedTasks) || impact?.completed_tasks || 0,
          ngosHelped: Number(ngosHelped) || impact?.ngos_helped || 0,
          performance_level: impact?.performance_level || "Beginner",
        });
      }

      setVolunteers(final);
      setFiltered(final);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error loading volunteers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers();

    // realtime: subscribe to volunteers table changes
    const chan = supabase
      .channel("public:volunteers")
      .on("postgres_changes", { event: "*", schema: "public", table: "volunteers" }, () => {
        loadVolunteers();
      })
      .subscribe();

    // also listen to volunteer_assignments changes to update stats
    const chan2 = supabase
      .channel("public:volunteer_assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "volunteer_assignments" }, () => {
        loadVolunteers();
      })
      .subscribe();

    return () => {
      // unsubscribe
      // @ts-ignore - supabase channel return type
      supabase.removeChannel?.(chan);
      // @ts-ignore
      supabase.removeChannel?.(chan2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- Search filter -------------------- */
  useEffect(() => {
    setFiltered(
      volunteers.filter((v) =>
        (v.name + (v.email || "") + (v.city || "")).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, volunteers]);

  /* -------------------- Actions -------------------- */
  const resetPassword = async () => {
    if (!selected) return;
    const newPass = prompt("Enter new password for volunteer:");
    if (!newPass) return;
    await supabase.from("volunteers").update({ password: newPass }).eq("id", selected.id);
    alert("Password reset (saved to volunteers table)");
  };

  const disableVolunteer = async () => {
    if (!selected) return;
    if (!confirm("Disable this volunteer?")) return;
    await supabase.from("volunteers").update({ status: "Offline" }).eq("id", selected.id);
    alert("Volunteer disabled");
    loadVolunteers();
  };

  const verifyVolunteer = async (state: boolean) => {
    if (!selected) return;
    // volunteers table may not have verified; add column if present in DB
    await supabase.from("volunteers").update({ verified: state }).eq("id", selected.id);
    alert(state ? "Volunteer verified" : "Volunteer unverified");
    loadVolunteers();
  };

  const deleteVolunteer = async () => {
    if (!selected) return;
    if (!confirm("Permanently delete this volunteer? This will remove related records depending on DB cascade rules.")) return;
    await supabase.from("volunteers").delete().eq("id", selected.id);
    alert("Volunteer deleted");
    setOpen(false);
    setSelected(null);
    loadVolunteers();
  };

  /* -------------------- UI -------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-gray-600">
        <Loader2 size={32} className="animate-spin" />
        Loading Volunteers...
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Manage Volunteers</h1>

      {/* Search */}
      <div className="flex items-center bg-white shadow px-3 py-2 rounded-lg w-full md:w-1/2 mx-auto mb-6 border">
        <Search size={22} className="text-gray-500" />
        <input
          placeholder="Search volunteers..."
          className="ml-3 outline-none w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl shadow bg-white overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Volunteer</th>
              <th className="p-4 text-center">Tasks</th>
              <th className="p-4 text-center">Completed</th>
              <th className="p-4 text-center">NGOs Helped</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-4">
                  <img src={v.image_url || "/placeholder.png"} className="w-12 h-12 rounded-full border object-cover" />
                  <div>
                    <p className="font-semibold text-lg">{v.name}</p>
                    <p className="text-sm text-gray-500">{v.email}</p>
                    <p className="text-xs text-gray-400">Joined: {new Date(v.created_at).toLocaleDateString()}</p>
                  </div>
                </td>

                <td className="text-center p-4 font-semibold">{v.totalTasks}</td>
                <td className="text-center p-4 text-green-700 font-bold">{v.completedTasks}</td>
                <td className="text-center p-4">{v.ngosHelped}</td>

                <td className="text-center p-4">
                  {v.verified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Verified</span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">{v.status || "Available"}</span>
                  )}
                </td>

                <td className="text-center p-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
                    onClick={() => {
                      setSelected(v);
                      setOpen(true);
                    }}
                  >
                    <Eye size={18} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 text-gray-500 hover:text-black">✖</button>

            <div className="flex items-center gap-4 mb-6">
              <img src={selected.image_url || "/placeholder.png"} className="w-20 h-20 rounded-full border object-cover" />
              <div>
                <h2 className="text-2xl font-bold">{selected.name}</h2>
                <p className="text-gray-500">{selected.email}</p>
                <p className="text-sm text-gray-400">{selected.phone || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Stat label="Tasks" value={selected.totalTasks} icon={<Users size={20} />} />
              <Stat label="Completed" value={selected.completedTasks} icon={<CheckCircle size={20} />} />
              <Stat label="NGOs" value={selected.ngosHelped} icon={<User size={20} />} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ModalBtn label="Reset Password" color="orange" icon={<KeyRound size={18} />} action={resetPassword} />

              {selected.verified ? (
                <ModalBtn label="Unverify" color="black" icon={<XCircle size={18} />} action={() => verifyVolunteer(false)} />
              ) : (
                <ModalBtn label="Verify Volunteer" color="green" icon={<CheckCircle size={18} />} action={() => verifyVolunteer(true)} />
              )}

              <ModalBtn label="Disable Volunteer" color="red" icon={<XCircle size={18} />} action={disableVolunteer} />

              <ModalBtn label="Delete Volunteer" color="black" icon={<Trash2 size={18} />} action={deleteVolunteer} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------- Small Components -------------------- */
const Stat = ({ label, value, icon }: any) => (
  <div className="bg-gray-100 rounded-xl p-4 flex items-center gap-3">
    {icon}
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const ModalBtn = ({ label, icon, color, action }: any) => {
  const map: any = {
    blue: "bg-blue-600 hover:bg-blue-700",
    orange: "bg-orange-600 hover:bg-orange-700",
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
    black: "bg-black hover:bg-gray-900",
  };

  return (
    <button
      className={`w-full py-4 rounded-xl text-white flex items-center gap-3 justify-center text-lg font-semibold ${map[color]}`}
      onClick={action}
    >
      {icon} {label}
    </button>
  );
};

export default ManageVolunteers;
