import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Calendar,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AssignedTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!volunteer.id) return;

    const fetchTasks = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("volunteer_assignments")
        .select(`
          id,
          status,
          notes,
          assigned_at,
          updated_at,
          donations (
            id,
            category,
            description,
            image_url,
            quantity,
            amount,
            status,
            donor_id,
            pickup_address,
            pickup_instructions,
            donors (
              name,
              email,
              phone,
              address,
              image_url
            ),
            ngos (
              id,
              name,
              city,
              image_url,
              phone
            )
          )
        `)
        .eq("volunteer_id", volunteer.id)
        .order("assigned_at", { ascending: false });

      if (!error) setTasks(data || []);
      setLoading(false);
    };

    fetchTasks();
  }, [volunteer.id]);

  // ⭐ UPDATE STATUS + UPDATE DONATION STATUS + INSERT TIMELINE EVENT
  const handleStatusUpdate = async (
    assignmentId: string,
    donationId: string,
    newStatus: string
  ) => {
    // 1️⃣ Update assignment
    const { error: assignError } = await supabase
      .from("volunteer_assignments")
      .update({
        status: newStatus,
        updated_at: new Date(),
        ...(newStatus === "Delivered" && { completion_time: new Date() }),
      })
      .eq("id", assignmentId);

    if (assignError) return alert("❌ Failed to update volunteer assignment");

    // 2️⃣ Map volunteer status → donation status
    const donationStatusMap: any = {
      "In Progress": "In Progress",
      Delivered: "Delivered",
      Cancelled: "Accepted", // allow NGO to re-assign if volunteer cancels
    };

    await supabase
      .from("donations")
      .update({
        status: donationStatusMap[newStatus],
        updated_at: new Date(),
        ...(newStatus === "Delivered" && { delivered_at: new Date() }),
      })
      .eq("id", donationId);

    // 3️⃣ Insert event
    await supabase.from("donation_events").insert({
      donation_id: donationId,
      event:
        newStatus === "Delivered"
          ? "Donation Delivered"
          : newStatus === "Cancelled"
          ? "Volunteer Cancelled Task"
          : "Volunteer Started Task",
      note:
        newStatus === "Delivered"
          ? "Volunteer delivered the donation successfully."
          : newStatus === "Cancelled"
          ? "Volunteer could not complete the task."
          : "Volunteer is heading for pickup/delivery.",
    });

    alert(`✔ Status updated to: ${newStatus}`);

    // 4️⃣ Update UI
    setTasks((prev) =>
      prev.map((t) =>
        t.id === assignmentId
          ? { ...t, status: newStatus }
          : t
      )
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading tasks...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">My Assigned Tasks</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-600">No tasks assigned yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tasks.map((task) => {
              const donation = task.donations;
              const donor = donation?.donors;
              const ngo = donation?.ngos;

              return (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-xl shadow-md p-6 bg-white hover:shadow-lg transition"
                >
                  
                  {/* NGO */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={ngo?.image_url || "/placeholder.png"}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <div>
                      <h3 className="font-bold text-blue-700 text-lg">{ngo?.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={12} /> {ngo?.city || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone size={12} /> {ngo?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Donation */}
                  <div className="flex gap-4 items-start mb-4">
                    <img
                      src={donation?.image_url || "/placeholder.png"}
                      className="w-24 h-24 rounded-lg border object-cover"
                    />

                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-lg">
                        {donation?.category}
                      </p>
                      <p className="text-sm text-gray-600">{donation?.description}</p>

                      {donation?.amount && (
                        <p className="text-green-700 font-bold mt-1">
                          ₹ {donation.amount}
                        </p>
                      )}
                      {donation?.quantity && (
                        <p className="text-gray-700">Qty: {donation.quantity}</p>
                      )}
                    </div>
                  </div>

                  {/* Donor */}
                  <div className="mb-4 bg-gray-50 p-3 rounded-xl border">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <User size={14} /> Donor Details
                    </h4>

                    <p className="text-sm font-semibold">{donor?.name}</p>
                    <p className="text-xs text-gray-600">{donor?.email}</p>

                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Phone size={12} /> {donor?.phone || "Not provided"}
                    </p>

                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin size={12} /> {donor?.address || "No address"}
                    </p>

                    {donation?.pickup_address && (
                      <p className="text-xs text-gray-700 mt-1">
                        <strong>Pickup:</strong> {donation.pickup_address}
                      </p>
                    )}

                    {donation?.pickup_instructions && (
                      <p className="text-xs text-gray-700 mt-1">
                        <strong>Instructions:</strong> {donation.pickup_instructions}
                      </p>
                    )}
                  </div>

                  {/* Assignment Info */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> Assigned on:{" "}
                      {new Date(task.assigned_at).toLocaleDateString()}
                    </p>

                    <span
                      className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                        task.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : task.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : task.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-4">
                    {task.status !== "Delivered" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(task.id, donation.id, "In Progress")
                        }
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-sm"
                      >
                        <Clock size={14} />
                        In Progress
                      </button>
                    )}

                    {task.status !== "Delivered" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(task.id, donation.id, "Delivered")
                        }
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-sm"
                      >
                        <CheckCircle size={14} />
                        Delivered
                      </button>
                    )}

                    {task.status !== "Cancelled" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(task.id, donation.id, "Cancelled")
                        }
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                      >
                        <XCircle size={14} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedTasks;
