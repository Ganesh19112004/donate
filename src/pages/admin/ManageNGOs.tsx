import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Settings,
  BarChart3,
  KeyRound,
  CircleSlash,
  Users,
  Gift,
  Layers,
} from "lucide-react";

const ManageNGOs = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal States
  const [open, setOpen] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState<any>(null);

  // Fetch NGOs with REAL stats (donations, volunteers)
  useEffect(() => {
    const fetchNgos = async () => {
      setLoading(true);

      const { data: ngoList } = await supabase
        .from("ngos")
        .select("id, name, email, city, verified, rating, total_reviews, created_at, image_url");

      if (!ngoList) {
        setLoading(false);
        return;
      }

      const final = [];

      for (const ngo of ngoList) {
        const { count: totalDonations } = await supabase
          .from("donations")
          .select("id", { count: "exact", head: true })
          .eq("ngo_id", ngo.id);

        const { count: totalVolunteers } = await supabase
          .from("ngo_volunteers")
          .select("volunteer_id", { count: "exact", head: true })
          .eq("ngo_id", ngo.id);

        const campaigns = 0;

        final.push({
          ...ngo,
          donations: totalDonations || 0,
          volunteers: totalVolunteers || 0,
          campaigns,
        });
      }

      setNgos(final);
      setFiltered(final);
      setLoading(false);
    };

    fetchNgos();
  }, []);

  useEffect(() => {
    setFiltered(
      ngos.filter((n) =>
        n.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, ngos]);

  /* ---------------- MODAL ACTIONS ---------------- */

  const verifyNGO = async (state: boolean) => {
    await supabase.from("ngos").update({ verified: state }).eq("id", selectedNGO.id);
    setSelectedNGO({ ...selectedNGO, verified: state });
    setNgos(prev => prev.map(n => n.id === selectedNGO.id ? { ...n, verified: state } : n));
  };

  const disableNGO = async () => {
    await supabase.from("ngos").update({ active: false }).eq("id", selectedNGO.id);
    alert("NGO Disabled Successfully");
  };

  const resetPassword = async () => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;
    await supabase.from("ngos").update({ password: newPassword }).eq("id", selectedNGO.id);
    alert("Password Reset Successfully");
  };

  const deleteNGO = async () => {
    if (!confirm("Delete NGO permanently?")) return;
    await supabase.from("ngos").delete().eq("id", selectedNGO.id);
    setOpen(false);
    setNgos((prev) => prev.filter((n) => n.id !== selectedNGO.id));
  };

  /* ---------------- UI ---------------- */

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-gray-600">
        <Loader2 size={32} className="animate-spin" />
        Loading NGOs...
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">
        Manage NGOs
      </h1>

      {/* Search */}
      <div className="flex items-center bg-white shadow px-3 py-2 rounded-lg w-full md:w-1/2 mx-auto mb-6 border">
        <Search size={22} className="text-gray-500" />
        <input
          placeholder="Search NGOs..."
          className="ml-3 outline-none w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl shadow bg-white overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">NGO</th>
              <th className="p-4 text-center">Donations</th>
              <th className="p-4 text-center">Volunteers</th>
              <th className="p-4 text-center">Verified</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((ngo) => (
              <tr key={ngo.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-4">
                  <img
                    src={ngo.image_url || "/placeholder.png"}
                    className="w-12 h-12 rounded-full border object-cover"
                  />
                  <div>
                    <p className="font-semibold text-lg">{ngo.name}</p>
                    <p className="text-sm text-gray-500">{ngo.email}</p>
                    <p className="text-xs text-gray-400">{ngo.city}</p>
                  </div>
                </td>

                <td className="text-center p-4">{ngo.donations}</td>
                <td className="text-center p-4">{ngo.volunteers}</td>

                <td className="text-center p-4">
                  {ngo.verified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                      Pending
                    </span>
                  )}
                </td>

                <td className="text-center p-4">
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
                    onClick={() => {
                      setSelectedNGO(ngo);
                      setOpen(true);
                    }}
                  >
                    <Eye size={22} /> View
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- NGO CONTROL MODAL ---------------- */}
      {open && selectedNGO && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative">

            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedNGO.image_url || "/placeholder.png"}
                className="w-20 h-20 rounded-xl border object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold">{selectedNGO.name}</h2>
                <p className="text-gray-500">{selectedNGO.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Stat label="Donations" value={selectedNGO.donations} icon={<Gift size={28} />} />
              <Stat label="Volunteers" value={selectedNGO.volunteers} icon={<Users size={28} />} />
              <Stat label="Campaigns" value={selectedNGO.campaigns} icon={<Layers size={28} />} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ModalBtn
                label="Open Management Page"
                color="blue"
                icon={<Eye size={28} />}
                action={() =>
                  (window.location.href = `/admin/ngo/${selectedNGO.id}/manage`)
                }
              />

              <ModalBtn
                label="Reset Password"
                color="orange"
                icon={<KeyRound size={28} />}
                action={resetPassword}
              />

              {selectedNGO.verified ? (
                <ModalBtn
                  label="Unverify"
                  color="black"
                  icon={<XCircle size={28} />}
                  action={() => verifyNGO(false)}
                />
              ) : (
                <ModalBtn
                  label="Verify NGO"
                  color="green"
                  icon={<CheckCircle size={28} />}
                  action={() => verifyNGO(true)}
                />
              )}

              <ModalBtn
                label="Disable NGO"
                color="red"
                icon={<CircleSlash size={28} />}
                action={disableNGO}
              />

              <ModalBtn
                label="Delete NGO"
                color="red"
                icon={<Trash2 size={28} />}
                action={deleteNGO}
              />
            </div>
          </div>
        </div>
      )}    

    </div>
  );
};

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
    purple: "bg-purple-600 hover:bg-purple-700",
    gray: "bg-gray-600 hover:bg-gray-700",
    orange: "bg-orange-600 hover:bg-orange-700",
    green: "bg-green-600 hover:bg-green-700",
    black: "bg-black hover:bg-gray-900",
    red: "bg-red-600 hover:bg-red-700",
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

export default ManageNGOs;
