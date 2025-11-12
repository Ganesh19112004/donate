import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Package, Loader2 } from "lucide-react";

const ManageDonations = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!ngo?.id) return;
    fetchDonations();
    fetchVolunteers();
  }, []);

  // 🟦 Fetch NGO donations
  const fetchDonations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("donations")
      .select("*, donors(name, email, image_url)")
      .eq("ngo_id", ngo.id)
      .neq("status", "Cancelled")
      .order("created_at", { ascending: false });

    if (!error) setDonations(data || []);
    else console.error(error);
    setLoading(false);
  };

  // 🟩 Fetch Volunteers (linked by ngo_id or ngo_volunteers mapping)
  const fetchVolunteers = async () => {
    let { data: volunteers } = await supabase
      .from("volunteers")
      .select("id, name, email")
      .eq("ngo_id", ngo.id);

    if (!volunteers?.length) {
      const { data: mapped } = await supabase
        .from("ngo_volunteers")
        .select("volunteers (id, name, email)")
        .eq("ngo_id", ngo.id);
      volunteers = mapped?.map((m: any) => m.volunteers) || [];
    }

    setVolunteers(volunteers || []);
  };

  // ✅ Accept Donation
  const handleAccept = async (id: string) => {
    await supabase.from("donations").update({
      status: "Accepted",
      updated_at: new Date(),
    }).eq("id", id);

    await supabase.from("donation_events").insert({
      donation_id: id,
      event: "Accepted",
      created_by: ngo.id,
    });

    alert("✅ Donation accepted!");
    fetchDonations();
  };

  // ❌ Reject Donation
  const handleReject = async (id: string) => {
    await supabase.from("donations").update({
      status: "Cancelled",
      updated_at: new Date(),
    }).eq("id", id);

    await supabase.from("donation_events").insert({
      donation_id: id,
      event: "Rejected",
      created_by: ngo.id,
    });

    alert("❌ Donation rejected!");
    fetchDonations();
  };

  // 🚚 Assign Volunteer
  const handleAssignVolunteer = async (donationId: string, volunteerId: string) => {
    if (!volunteerId || volunteerId === "Select") return;
    setAssigning(donationId);

    // Update donation record
    await supabase.from("donations").update({
      assigned_volunteer: volunteerId,
      status: "Assigned",
      assigned_at: new Date(),
      updated_at: new Date(),
    }).eq("id", donationId);

    // Create assignment record
    await supabase.from("volunteer_assignments").insert({
      donation_id: donationId,
      volunteer_id: volunteerId,
      ngo_id: ngo.id,
      status: "Assigned",
    });

    // Log event
    await supabase.from("donation_events").insert({
      donation_id: donationId,
      event: "Volunteer Assigned",
      created_by: ngo.id,
    });

    setAssigning(null);
    alert("🚚 Volunteer assigned successfully!");
    fetchDonations();
  };

  // 🎉 Mark Completed
  const handleComplete = async (id: string) => {
    await supabase.from("donations").update({
      status: "Completed",
      delivered_at: new Date(),
      updated_at: new Date(),
      ngo_feedback: feedback[id] || null,
    }).eq("id", id);

    await supabase.from("donation_events").insert({
      donation_id: id,
      event: "Completed",
      note: feedback[id] || null,
      created_by: ngo.id,
    });

    alert("🎉 Donation marked as completed!");
    fetchDonations();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          📦 Manage Donations
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : donations.length === 0 ? (
          <p className="text-center text-gray-600">No donations available right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-xl text-sm">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="p-3">Image</th>
                  <th className="p-3">Donor</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Amount / Qty</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">
                      {d.image_url ? (
                        <img src={d.image_url} alt="Donation" className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          <Package size={20} />
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium">{d.donors?.name}</td>
                    <td className="p-3">{d.category}</td>
                    <td className="p-3 max-w-xs truncate">{d.description}</td>
                    <td className="p-3">{d.amount ? `₹${d.amount}` : d.quantity || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          d.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : d.status === "Accepted"
                            ? "bg-blue-100 text-blue-700"
                            : d.status === "Assigned"
                            ? "bg-purple-100 text-purple-700"
                            : d.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 flex flex-col gap-2">
                      {d.status === "Pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(d.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            <CheckCircle size={14} /> Accept
                          </button>
                          <button
                            onClick={() => handleReject(d.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )}

                      {d.status === "Accepted" && (
                        <select
                          onChange={(e) => handleAssignVolunteer(d.id, e.target.value)}
                          disabled={assigning === d.id}
                          className="border p-2 rounded-lg"
                        >
                          <option value="">Assign Volunteer</option>
                          {volunteers.map((v) => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      )}

                      {d.status === "Assigned" && (
                        <div className="flex flex-col gap-2">
                          <textarea
                            placeholder="Add feedback..."
                            className="border p-2 rounded text-sm"
                            value={feedback[d.id] || ""}
                            onChange={(e) =>
                              setFeedback({ ...feedback, [d.id]: e.target.value })
                            }
                          />
                          <button
                            onClick={() => handleComplete(d.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Mark Completed
                          </button>
                        </div>
                      )}

                      {d.status === "Completed" && (
                        <span className="text-green-700 flex items-center gap-1">
                          <CheckCircle size={14} /> Completed
                        </span>
                      )}
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

export default ManageDonations;
