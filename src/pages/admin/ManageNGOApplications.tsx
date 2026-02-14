import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react";

const ManageNGOApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ngo_applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setApplications(data || []);
    setLoading(false);
  };

  /* ---------------- APPROVE NGO ---------------- */
  const approveNGO = async (app: any) => {
    try {
      // 1️⃣ Insert into ngos table
      const { error: insertError } = await supabase
        .from("ngos")
        .insert({
          name: app.ngo_name,
          email: app.email,
          password: app.password,
          image_url: app.photo_url,
          image_path: app.photo_url,
          verified: true,
          created_at: new Date(),
          updated_at: new Date(),
        });

      if (insertError) {
        alert("Error creating NGO account: " + insertError.message);
        return;
      }

      // 2️⃣ Update application status
      await supabase
        .from("ngo_applications")
        .update({ status: "approved" })
        .eq("id", app.id);

      alert("NGO Approved Successfully!");
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };

  /* ---------------- REJECT NGO ---------------- */
  const rejectNGO = async (id: string) => {
    if (!confirm("Reject this application?")) return;

    await supabase
      .from("ngo_applications")
      .update({ status: "rejected" })
      .eq("id", id);

    fetchApplications();
  };

  /* ---------------- DELETE APPLICATION ---------------- */
  const deleteApplication = async (id: string) => {
    if (!confirm("Delete this application permanently?")) return;

    await supabase.from("ngo_applications").delete().eq("id", id);
    fetchApplications();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">
        NGO Applications (Pending Verification)
      </h1>

      {applications.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow">
          No pending applications.
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-xl shadow border"
            >
              <div className="flex gap-6 items-center">
                <img
                  src={app.photo_url || "/placeholder.png"}
                  className="w-24 h-24 rounded-xl object-cover border"
                />

                <div className="flex-1">
                  <h2 className="text-xl font-bold">{app.ngo_name}</h2>
                  <p className="text-gray-600">{app.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Reg No: {app.registration_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    PAN: {app.pan_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    Aadhaar: {app.aadhar_number}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => approveNGO(app)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>

                  <button
                    onClick={() => rejectNGO(app.id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <XCircle size={18} /> Reject
                  </button>

                  <button
                    onClick={() => deleteApplication(app.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageNGOApplications;
