import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Loader2,
  Eye,
  Trash2,
  XCircle,
  CheckCircle,
  Mail,
  Gift,
  User,
} from "lucide-react";

const ManageDonors = () => {
  const [donors, setDonors] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  /* ---------------------------------------------------------
     FETCH DONORS WITH REAL STATS
  ------------------------------------------------------------ */
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        // 1) fetch donors
        const { data: donorList } = await supabase
          .from("donors")
          .select("id, name, email, phone, image_url, created_at");

        const final: any[] = [];

        // 2) fetch stats for each donor
        for (const donor of donorList || []) {
          const { count: donationCount } = await supabase
            .from("donations")
            .select("id", { count: "exact", head: true })
            .eq("donor_id", donor.id);

          const { data: donationData } = await supabase
            .from("donations")
            .select("amount")
            .eq("donor_id", donor.id);

          const totalValue =
            donationData?.reduce(
              (sum: number, d: any) => sum + (Number(d.amount) || 0),
              0
            ) || 0;

          const { count: ngosHelped } = await supabase
            .from("donations")
            .select("ngo_id", { count: "exact", head: true })
            .eq("donor_id", donor.id);

          final.push({
            ...donor,
            donations: donationCount || 0,
            totalValue,
            ngosHelped: ngosHelped || 0,
          });
        }

        setDonors(final);
        setFiltered(final);
      } catch (e) {
        console.error("Error loading donors:", e);
      }

      setLoading(false);
    };

    load();
  }, []);

  /* ---------------------------------------------------------
     SEARCH
  ------------------------------------------------------------ */
  useEffect(() => {
    setFiltered(
      donors.filter((d) =>
        (d.name + d.email).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, donors]);

  /* ---------------------------------------------------------
     ACTION CONTROLS
  ------------------------------------------------------------ */
const verifyDonor = async (state: boolean) => {
  await supabase.from("donors").update({ verified: state }).eq("id", selected.id);
  alert(state ? "Donor Verified" : "Donor Unverified");
};

const resetPassword = async () => {
  const pass = prompt("Enter new password for the donor:");
  if (!pass) return;
  await supabase.from("donors").update({ password: pass }).eq("id", selected.id);
  alert("Password updated.");
};

const banDonor = async () => {
  if (!confirm("Ban this donor permanently?")) return;
  await supabase.from("donors").update({ banned: true }).eq("id", selected.id);
  alert("Donor banned.");
};

  const disableDonor = async () => {
    if (!confirm("Disable this donor?")) return;

    await supabase
      .from("donors")
      .update({ active: false })
      .eq("id", selected.id);

    setSelected({ ...selected, active: false });
    alert("Donor disabled.");
  };

  const deleteDonor = async () => {
    if (!confirm("Permanently delete this donor?")) return;

    await supabase.from("donors").delete().eq("id", selected.id);

    setDonors((prev) => prev.filter((d) => d.id !== selected.id));
    setFiltered((prev) => prev.filter((d) => d.id !== selected.id));
    setOpen(false);
    alert("Donor deleted.");
  };

  /* ---------------------------------------------------------
     UI RENDER
  ------------------------------------------------------------ */

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-gray-600">
        <Loader2 size={32} className="animate-spin" />
        Loading Donors...
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">
        Manage Donors
      </h1>

      {/* Search Bar */}
      <div className="flex items-center bg-white shadow px-3 py-2 rounded-lg w-full md:w-1/2 mx-auto mb-6 border">
        <Search size={22} className="text-gray-500" />
        <input
          placeholder="Search donors..."
          className="ml-3 outline-none w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Donors Table */}
      <div className="rounded-xl shadow bg-white overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Donor</th>
              <th className="p-4 text-center">Donations</th>
              <th className="p-4 text-center">Total Value</th>
              <th className="p-4 text-center">NGOs Helped</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((donor) => (
              <tr key={donor.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-4">
                  <img
                    src={donor.image_url || "/placeholder.png"}
                    className="w-12 h-12 rounded-full border object-cover"
                  />
                  <div>
                    <p className="font-semibold text-lg">{donor.name}</p>
                    <p className="text-sm text-gray-500">{donor.email}</p>
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(donor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </td>

                <td className="text-center p-4 font-semibold">{donor.donations}</td>
                <td className="text-center p-4 text-green-700 font-bold">
                  ₹{donor.totalValue}
                </td>
                <td className="text-center p-4">{donor.ngosHelped}</td>

                <td className="text-center p-4">
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
                    onClick={() => {
                      setSelected(donor);
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

      {/* ---------------- DONOR MODAL ---------------- */}
      {open && selected && (
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
                src={selected.image_url || "/placeholder.png"}
                className="w-20 h-20 rounded-full border object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold">{selected.name}</h2>
                <p className="text-gray-500">{selected.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Stat label="Donations" value={selected.donations} icon={<Gift size={28} />} />
              <Stat label="Total Value" value={`₹${selected.totalValue}`} icon={<Mail size={28} />} />
              <Stat label="NGOs Helped" value={selected.ngosHelped} icon={<User size={28} />} />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <ModalBtn
                label="Disable Donor"
                color="red"
                icon={<XCircle size={28} />}
                action={disableDonor}
              />

              <ModalBtn
                label="Delete Donor"
                color="black"
                icon={<Trash2 size={28} />}
                action={deleteDonor}
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

/* ---------------------------------------------------------
   Small Components
------------------------------------------------------------ */

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

export default ManageDonors;
