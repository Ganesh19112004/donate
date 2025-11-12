import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, MessageSquare, Download, Star } from "lucide-react";

const STATUS_ORDER = ["Pending", "Accepted", "Assigned", "Completed", "Cancelled"];

const DonationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    const fetchDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("donations")
        .select("*, ngos(name, email)")
        .eq("id", id)
        .single();
      if (!error) setDonation(data);

      const { data: ev } = await supabase
        .from("donation_events")
        .select("*")
        .eq("donation_id", id)
        .order("created_at", { ascending: true });
      setEvents(ev || []);

      // Related donations by same donor
      if (data?.donor_id) {
        const { data: relatedData } = await supabase
          .from("donations")
          .select("id, category, description, status, image_url")
          .eq("donor_id", data.donor_id)
          .neq("id", data.id)
          .limit(3);
        setRelated(relatedData || []);
      }

      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  const handleFeedbackSubmit = async () => {
    if (!rating || !feedback.trim()) return alert("Please give both rating & feedback");
    await supabase
      .from("donations")
      .update({ ngo_feedback: feedback })
      .eq("id", donation.id);
    await supabase.from("donation_events").insert({
      donation_id: donation.id,
      event: "Donor Feedback Added",
      note: `Rated ${rating} stars - "${feedback}"`,
    });
    alert("Thank you for your feedback!");
    setShowRating(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600">
        <Loader2 className="animate-spin" size={28} /> Loading...
      </div>
    );

  if (!donation) return <div className="p-8">Donation not found.</div>;

  const currentIndex = STATUS_ORDER.indexOf(donation.status || "Pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Donation Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Image */}
        {donation.image_url && (
          <div className="mb-6">
            <img
              src={donation.image_url}
              alt="Donation"
              className="w-full h-64 object-cover rounded-xl border"
            />
          </div>
        )}

        {/* Donation Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{donation.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quantity / Amount</p>
            <p className="font-medium">
              {donation.category === "Money" ? `₹${donation.amount}` : donation.quantity}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{donation.status}</p>
          </div>
        </div>

        {/* NGO Info */}
        {donation.ngos && (
          <div className="mb-6">
            <p className="text-sm text-gray-500">NGO</p>
            <p className="font-medium">{donation.ngos.name}</p>
            <p className="text-sm text-gray-600">{donation.ngos.email}</p>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <div className="p-4 bg-gray-50 rounded">{donation.description}</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">Progress</p>
          <div className="flex items-center gap-2">
            {STATUS_ORDER.map((s, i) => (
              <div key={s} className="flex-1 text-center">
                <div
                  className={`h-3 rounded-full ${
                    i <= currentIndex ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
                <p className="text-xs mt-2">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h3 className="font-semibold text-blue-700 mb-2">Timeline</h3>
          <ul className="space-y-2">
            {events.length === 0 && <li className="text-sm text-gray-500">No events yet.</li>}
            {events.map((ev: any) => (
              <li key={ev.id} className="p-3 border rounded-lg">
                <p className="text-sm font-semibold text-gray-700">{ev.event}</p>
                {ev.note && <p className="text-sm text-gray-600">{ev.note}</p>}
                <p className="text-xs text-gray-500">{new Date(ev.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Feedback Section */}
        {donation.status === "Completed" && !donation.ngo_feedback && (
          <div className="mb-8">
            <button
              onClick={() => setShowRating(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Star size={18} /> Give Feedback
            </button>
          </div>
        )}

        {donation.ngo_feedback && (
          <div className="mb-6">
            <h3 className="font-semibold text-green-700">Your Feedback</h3>
            <div className="mt-2 p-4 bg-green-50 rounded text-gray-700">{donation.ngo_feedback}</div>
          </div>
        )}

        {/* Related Donations */}
        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="font-semibold text-blue-700 mb-4">Other Donations You Made</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  to={`/donor/details/${r.id}`}
                  key={r.id}
                  className="border rounded-lg p-3 hover:bg-gray-50"
                >
                  {r.image_url ? (
                    <img src={r.image_url} className="h-28 w-full object-cover rounded mb-2" />
                  ) : (
                    <div className="h-28 bg-gray-100 rounded mb-2" />
                  )}
                  <p className="font-medium text-blue-700">{r.category}</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{r.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-8 justify-between items-center">
          <div className="flex gap-3">
            {donation.status === "Pending" && (
              <>
                <Link
                  to={`/donor/edit-donation/${donation.id}`}
                  className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200"
                >
                  Edit
                </Link>
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to cancel this donation?")) {
                      const { error } = await supabase
                        .from("donations")
                        .update({ status: "Cancelled" })
                        .eq("id", donation.id);
                      if (!error) {
                        alert("Donation cancelled successfully.");
                        navigate("/donor/history");
                      }
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <div className="flex gap-3">
            {donation.ngo_id && (
              <Link
                to={`/donor/messages?ngo=${donation.ngo_id}`}
                className="bg-blue-50 text-blue-700 border border-blue-300 px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-100"
              >
                <MessageSquare size={16} /> Message NGO
              </Link>
            )}
            <button
              onClick={() => window.print()}
              className="border px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <Download size={16} /> Download Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Rate Your Experience</h2>
            <div className="flex gap-2 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={28}
                  className={`cursor-pointer ${s <= (rating || 0) ? "text-yellow-500" : "text-gray-300"}`}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="Write your feedback..."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRating(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={handleFeedbackSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationDetails;
