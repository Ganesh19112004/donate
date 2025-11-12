import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, XCircle, ArrowLeft, Package, MapPin } from "lucide-react";
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
            created_at,
            ngos (id, name, city, image_url)
          )
        `)
        .eq("volunteer_id", volunteer.id)
        .order("assigned_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        alert("⚠️ Failed to load assignments.");
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [volunteer.id]);

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from("volunteer_assignments")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId);

    if (error) {
      alert("❌ Failed to update status.");
      console.error(error);
    } else {
      alert(`✅ Task marked as ${newStatus}`);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your assigned tasks...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
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
              const ngo = donation?.ngos;

              return (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-xl shadow-sm p-5 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition"
                >
                  {/* NGO Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={ngo?.image_url || "/placeholder.png"}
                      alt={ngo?.name}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <div>
                      <h3 className="font-semibold text-blue-700">{ngo?.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={12} /> {ngo?.city || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Donation Info */}
                  <div className="flex gap-3 items-start">
                    <img
                      src={donation?.image_url || "/placeholder.png"}
                      alt="Donation"
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{donation?.category}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{donation?.description}</p>
                      {donation?.amount && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          💰 ₹{donation.amount}
                        </p>
                      )}
                      {donation?.quantity && (
                        <p className="text-sm text-gray-700">Qty: {donation.quantity}</p>
                      )}
                    </div>
                  </div>

                  {/* Task Info */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      Assigned on {new Date(task.assigned_at).toLocaleDateString()}
                    </p>
                    <p
                      className={`inline-block px-3 py-1 text-sm rounded-full mt-2 ${
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
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    {task.status !== "Delivered" && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, "In Progress")}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition text-sm"
                      >
                        <Clock size={14} /> In Progress
                      </button>
                    )}
                    {task.status !== "Delivered" && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, "Delivered")}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition text-sm"
                      >
                        <CheckCircle size={14} /> Delivered
                      </button>
                    )}
                    {task.status !== "Cancelled" && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, "Cancelled")}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition text-sm"
                      >
                        <XCircle size={14} /> Cancel
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
