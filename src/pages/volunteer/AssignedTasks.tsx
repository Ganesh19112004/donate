import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  User,
  Navigation,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVolunteerTracking } from "@/hooks/useVolunteerTracking";

/* =======================
   TASK CARD
======================= */
const TaskCard = ({ task, volunteerId, onStatusChange }: any) => {
  const donation = task.donations;
  const donor = donation?.donors;
  const ngo = task.ngos;

  /* ================= GPS TRACKING ================= */
  useVolunteerTracking(
    task.id,
    volunteerId,
    task.status === "Accepted" || task.status === "In Progress"
  );

  /* ================= NAVIGATION ================= */
  const goToPickup = () => {
    if (!donation?.pickup_latitude || !donation?.pickup_longitude) {
      alert("Pickup location not available");
      return;
    }
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${donation.pickup_latitude},${donation.pickup_longitude}`,
      "_blank"
    );
  };

  const goToNGO = () => {
    if (!ngo?.latitude || !ngo?.longitude) {
      alert("NGO location not available");
      return;
    }
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}`,
      "_blank"
    );
  };

  return (
    <div className="border rounded-xl p-6 shadow bg-white">
      {/* NGO */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={ngo?.image_url || "/placeholder.png"}
          className="w-12 h-12 rounded-lg border"
        />
        <div>
          <h3 className="font-bold text-blue-700">{ngo?.name}</h3>
          <p className="text-sm flex items-center gap-1 text-gray-600">
            <MapPin size={12} /> {ngo?.city}
          </p>
          <p className="text-sm flex items-center gap-1 text-gray-600">
            <Phone size={12} /> {ngo?.phone || "N/A"}
          </p>
        </div>
      </div>

      {/* Donation */}
      <div className="flex gap-4 mb-4">
        <img
          src={donation?.image_url || "/placeholder.png"}
          className="w-20 h-20 rounded border"
        />
        <div>
          <p className="font-semibold">{donation?.category}</p>
          <p className="text-sm text-gray-600">{donation?.description}</p>
          {donation?.quantity && (
            <p className="text-sm">Qty: {donation.quantity}</p>
          )}
        </div>
      </div>

      {/* Donor */}
      <div className="bg-gray-50 p-3 rounded mb-4">
        <p className="font-semibold flex items-center gap-1">
          <User size={14} /> {donor?.name}
        </p>
        <p className="text-xs">{donor?.phone}</p>
        <p className="text-xs">{donor?.address}</p>
      </div>

      {/* Status */}
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Calendar size={12} />
        Assigned: {new Date(task.assigned_at).toLocaleDateString()}
      </p>

      <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
        {task.status}
      </span>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3 mt-4">

        {task.status === "Assigned" && (
          <button
            onClick={() => onStatusChange(task.id, donation.id, "Accepted")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Accept Task
          </button>
        )}

        {(task.status === "Accepted" || task.status === "In Progress") && (
          <button
            onClick={goToPickup}
            className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <Navigation size={14} /> Pickup
          </button>
        )}

        {task.status === "Accepted" && (
          <button
            onClick={() => onStatusChange(task.id, donation.id, "In Progress")}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <Clock size={14} /> Start Delivery
          </button>
        )}

        {task.status === "In Progress" && (
          <button
            onClick={goToNGO}
            className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <MapPin size={14} /> NGO
          </button>
        )}

        {task.status === "In Progress" && (
          <button
            onClick={() => onStatusChange(task.id, donation.id, "Delivered")}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <CheckCircle size={14} /> Delivered
          </button>
        )}

        {task.status !== "Delivered" && (
          <button
            onClick={() => onStatusChange(task.id, donation.id, "Cancelled")}
            className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <XCircle size={14} /> Cancel
          </button>
        )}
      </div>
    </div>
  );
};

/* =======================
   ASSIGNED TASKS PAGE
======================= */
const AssignedTasks = () => {
  const navigate = useNavigate();
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!volunteer?.id) return;

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("volunteer_assignments")
        .select(`
          id,
          status,
          assigned_at,
          donations (
            id,
            category,
            description,
            image_url,
            quantity,
            pickup_latitude,
            pickup_longitude,
            donors ( name, phone, address )
          ),
          ngos (
            id,
            name,
            city,
            image_url,
            phone,
            latitude,
            longitude
          )
        `)
        .eq("volunteer_id", volunteer.id)
        .order("assigned_at", { ascending: false });

      if (error) console.error(error);
      setTasks(data || []);
      setLoading(false);
    };

    fetchTasks();
  }, [volunteer.id]);

  const handleStatusChange = async (
    assignmentId: string,
    donationId: string,
    newStatus: string
  ) => {
    await supabase
      .from("volunteer_assignments")
      .update({
        status: newStatus,
        updated_at: new Date(),
        ...(newStatus === "Delivered" && {
          completion_time: new Date(),
        }),
      })
      .eq("id", assignmentId);

    const donationStatusMap: any = {
      Accepted: "In Progress",
      "In Progress": "In Progress",
      Delivered: "Delivered",
      Cancelled: "Accepted",
    };

    await supabase
      .from("donations")
      .update({ status: donationStatusMap[newStatus] })
      .eq("id", donationId);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === assignmentId ? { ...t, status: newStatus } : t
      )
    );
  };

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading tasks...</div>;

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-700">My Assigned Tasks</h1>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-600">
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-600">No tasks assigned</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                volunteerId={volunteer.id}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedTasks;
