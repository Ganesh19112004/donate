import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import {
  IndianRupee,
  Calendar,
  Building2,
} from "lucide-react";

export default function MyMoneyDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const donor = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadDonations();
  }, []);

  async function loadDonations() {
    setLoading(true);

    const { data, error } = await supabase
      .from("donations")
      .select(`
        *,
        ngos(name,image_url)
      `)
      .eq("donor_id", donor.id)
      .eq("category", "Money")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load donations");
    }

    setDonations(data || []);

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <h1 className="text-4xl font-bold text-blue-700 mb-8">
            My Donations
          </h1>

          {loading ? (
            <p>Loading...</p>
          ) : donations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">
                No donations found
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {donations.map((d) => (
                <div
                  key={d.id}
                  className="bg-slate-50 rounded-2xl p-5 border"
                >

                  <div className="flex justify-between items-center">

                    <div className="flex gap-4 items-center">

                      <img
                        src={
                          d.ngos?.image_url ||
                          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        }
                        className="w-20 h-20 rounded-xl object-cover"
                      />

                      <div>

                        <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                          <Building2 size={22} />
                          {d.ngos?.name}
                        </h2>

                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                          <Calendar size={16} />
                          {new Date(
                            d.created_at
                          ).toLocaleString()}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          Payment ID:
                          {" "}
                          {d.payment_id || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">

                      <p className="text-3xl font-bold text-green-600 flex items-center gap-1">
                        <IndianRupee size={28} />
                        {d.amount}
                      </p>

                      <p className="text-sm text-gray-500 mt-2">
                        {d.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}