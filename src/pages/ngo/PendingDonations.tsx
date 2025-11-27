import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  User,
  CalendarDays,
} from "lucide-react";

const PendingDonations = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchPendingDonations();
  }, []);

  const fetchPendingDonations = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("donations")
      .select(
        `
        id,
        category,
        description,
        amount,
        quantity,
        image_url,
        created_at,
        donors(name, email)
      `
      )
      .eq("ngo_id", ngo.id)
      .eq("status", "Pending")
      .order("created_at", { ascending: false });

    if (!error) setDonations(data || []);
    setLoading(false);
  };

  // ⭐ Accept or Reject Donation
  const handleAction = async (id: string, action: "accept" | "reject") => {
    const newStatus = action === "accept" ? "Accepted" : "Cancelled";

    // 1️⃣ Update donation table
    await supabase
      .from("donations")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // 2️⃣ Log into timeline
    await supabase.from("donation_events").insert({
      donation_id: id,
      event: action === "accept" ? "Donation Accepted" : "Donation Rejected",
      note:
        action === "accept"
          ? "NGO accepted the donation"
          : "NGO rejected the donation",
      created_by: ngo.id,
    });

    // 3️⃣ Update UI
    setDonations((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          <Clock /> Pending Donations
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading donations...</p>
        ) : donations.length === 0 ? (
          <p className="text-center text-gray-600">No pending donations.</p>
        ) : (
          <div className="space-y-5">
            {donations.map((d) => (
              <div
                key={d.id}
                className="p-5 border rounded-xl shadow-sm hover:shadow-md transition bg-white flex flex-col md:flex-row gap-4"
              >
                {/* Image */}
                <div className="w-full md:w-40 h-40 bg-gray-100 rounded-lg flex justify-center items-center overflow-hidden border">
                  {d.image_url ? (
                    <img
                      src={d.image_url}
                      className="w-full h-full object-cover"
                      alt="Donation"
                    />
                  ) : (
                    <Package size={32} className="text-gray-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-blue-700">
                    {d.category}
                  </h2>

                  <p className="text-gray-700 mt-1">{d.description}</p>

                  <div className="mt-2 text-sm text-gray-600 flex flex-col gap-1">
                    {d.amount && (
                      <p>
                        <span className="font-semibold text-blue-700">Amount:</span>{" "}
                        ₹{d.amount}
                      </p>
                    )}
                    {d.quantity && (
                      <p>
                        <span className="font-semibold text-blue-700">
                          Quantity:
                        </span>{" "}
                        {d.quantity}
                      </p>
                    )}
                  </div>

                  {/* Donor Info */}
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} />
                    <span>
                      {d.donors?.name} ({d.donors?.email})
                    </span>
                  </div>

                  {/* Date */}
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <CalendarDays size={12} />
                    {new Date(d.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col justify-center gap-3">
                  <button
                    onClick={() => handleAction(d.id, "accept")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                  >
                    <CheckCircle size={16} /> Accept
                  </button>

                  <button
                    onClick={() => handleAction(d.id, "reject")}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingDonations;
