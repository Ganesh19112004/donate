import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

const NGOReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("ngo_reviews")
        .select("*, donors(name)")
        .eq("ngo_id", ngo.id)
        .order("created_at", { ascending: false });
      setReviews(data || []);
    };
    fetchReviews();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">⭐ Donor Reviews</h1>

      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-blue-700">{r.donors?.name}</p>
                <div className="flex">
                  {Array(r.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-500" />
                    ))}
                </div>
              </div>
              <p className="text-gray-700">{r.review}</p>
              <p className="text-xs text-gray-400">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NGOReviews;
