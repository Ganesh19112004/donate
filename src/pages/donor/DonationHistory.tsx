import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Gift } from "lucide-react";

const DonationHistory = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const donor = JSON.parse(localStorage.getItem("user") || "{}");
    const fetchDonations = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*, ngos(name)")
        .eq("donor_id", donor.id)
        .order("created_at", { ascending: false });
      if (!error) setDonations(data || []);
    };
    fetchDonations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
            <Gift size={26} /> Donation History
          </h1>
        </div>

        {donations.length === 0 ? (
          <p className="text-center text-gray-600 mt-10">
            You haven’t made any donations yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((d) => (
              <div
                key={d.id}
                onClick={() => navigate(`/donor/details/${d.id}`)}
                className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition p-5 border border-gray-200 flex flex-col hover:-translate-y-1 duration-200"
              >
                {d.image_url ? (
                  <img
                    src={d.image_url}
                    alt={d.category}
                    className="h-40 w-full object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="h-40 w-full bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                <h2 className="text-lg font-semibold text-blue-700 mb-1">
                  {d.category}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {d.description}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">
                      <strong>NGO:</strong> {d.ngos?.name || "—"}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        d.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : d.status === "Accepted"
                          ? "bg-blue-100 text-blue-700"
                          : d.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                    View Details
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

export default DonationHistory;
