import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  ArrowLeft,
  MessageSquare,
  Download,
  Star,
  Truck,
  User,
  MapPin,
  CalendarDays,
} from "lucide-react";

const STATUS_ORDER = [
  "Pending",
  "Accepted",
  "Assigned",
  "In Progress",
  "Delivered",
  "Completed",
  "Cancelled",
];

const DonationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [volunteer, setVolunteer] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);

    const load = async () => {
      setLoading(true);

      // Fetch donation
      const { data, error } = await supabase
        .from("donations")
        .select("*, ngos(id, name, phone, city, verified)")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setDonation(data);

      // Fetch events
      const { data: ev } = await supabase
        .from("donation_events")
        .select("*")
        .eq("donation_id", id)
        .order("created_at");

      setEvents(ev || []);

      // Fetch volunteer
      if (data.assigned_volunteer) {
        const { data: vol } = await supabase
          .from("volunteers")
          .select("id, name, phone, city")
          .eq("id", data.assigned_volunteer)
          .single();
        setVolunteer(vol);
      }

      // Related donations
      const { data: r } = await supabase
        .from("donations")
        .select("id, category, description, image_url")
        .eq("donor_id", data.donor_id)
        .neq("id", id)
        .limit(3);

      setRelated(r || []);
      setLoading(false);
    };

    load();
  }, [id]);

  // Submit Feedback
  const handleFeedbackSubmit = async () => {
    if (!rating || !feedback.trim()) return alert("Enter rating & feedback!");

    await supabase
      .from("donations")
      .update({ donor_rating: rating, ngo_feedback: feedback })
      .eq("id", id);

    await supabase.from("donation_events").insert({
      donation_id: id,
      event: "Feedback Added",
      note: `${rating}⭐ - ${feedback}`,
    });

    alert("Thanks for your feedback!");
    setShowRating(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );

  if (!donation) return <div className="p-8">Donation not found.</div>;

  const currentIndex = STATUS_ORDER.indexOf(donation.status);

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-5xl mx-auto bg-white p-8 shadow-lg rounded-2xl border">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Donation Details</h1>
          <button onClick={() => navigate(-1)} className="text-blue-600 flex items-center gap-1">
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Image */}
        {donation.image_url && (
          <img
            src={donation.image_url}
            className="w-full h-64 rounded-xl object-cover mb-6"
          />
        )}

        {/* Details */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-gray-500 text-sm">Category</p>
            <p className="font-semibold">{donation.category}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Amount / Qty</p>
            <p className="font-semibold">
              {donation.category === "Money" ? `₹${donation.amount}` : donation.quantity}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Status</p>
            <p className="font-bold text-blue-700">{donation.status}</p>
          </div>
        </div>

        {/* NGO Info */}
        {donation.ngos && (
          <div className="p-4 rounded-lg bg-blue-50 border mb-6">
            <h3 className="font-semibold text-blue-700">NGO Details</h3>
            <p>{donation.ngos.name}</p>
            <p className="text-gray-600">{donation.ngos.city}</p>
            {donation.ngos.verified && <p className="text-green-600 text-sm">Verified NGO</p>}
          </div>
        )}

        {/* Volunteer */}
        {volunteer && (
          <div className="p-4 rounded-lg bg-green-50 border mb-6">
            <h3 className="font-semibold text-green-700 flex items-center gap-2">
              <Truck size={16} /> Assigned Volunteer
            </h3>
            <p className="font-medium">{volunteer.name}</p>
            <p className="text-gray-600">{volunteer.city}</p>
            <p className="text-gray-600">📞 {volunteer.phone}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div>
          <p className="text-gray-500 text-sm mb-1">Progress</p>
          <div className="flex gap-2">
            {STATUS_ORDER.map((s, i) => (
              <div key={s} className="flex-1 text-center">
                <div className={`h-3 rounded-full ${i <= currentIndex ? "bg-blue-600" : "bg-gray-200"}`} />
                <p className="text-xs mt-1">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-8">
          <h3 className="font-semibold text-blue-700 mb-2">Donation Timeline</h3>
          <ul className="space-y-2">
            {events.map((ev) => (
              <li key={ev.id} className="p-3 bg-gray-50 border rounded-lg">
                <p className="font-semibold">{ev.event}</p>
                {ev.note && <p className="text-gray-600">{ev.note}</p>}
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <CalendarDays size={12} /> {new Date(ev.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Related Donations */}
        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="font-semibold text-blue-700 mb-3">Other Donations</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  to={`/donor/details/${r.id}`}
                  key={r.id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  {r.image_url ? (
                    <img src={r.image_url} className="h-28 w-full object-cover rounded mb-2" />
                  ) : (
                    <div className="h-28 bg-gray-200 rounded mb-2" />
                  )}
                  <p className="font-medium text-blue-700">{r.category}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          {/* Donor Edit/Cancel */}
          {donation.status === "Pending" && (
            <div className="flex gap-3">
              <Link
                to={`/donor/edit-donation/${donation.id}`}
                className="bg-yellow-100 px-4 py-2 rounded"
              >
                Edit
              </Link>
              <button
                onClick={async () => {
                  if (confirm("Cancel donation?")) {
                    await supabase.from("donations").update({ status: "Cancelled" }).eq("id", id);
                    navigate("/donor/history");
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Message + Receipt */}
          <div className="flex gap-3">
            {donation.ngo_id && (
              <Link
                to={`/donor/messages?ngo=${donation.ngo_id}`}
                className="border px-4 py-2 rounded text-blue-700"
              >
                <MessageSquare size={16} /> Message NGO
              </Link>
            )}
            <button
              onClick={() => window.print()}
              className="border px-4 py-2 rounded"
            >
              <Download size={16} /> Receipt
            </button>
          </div>
        </div>

        {/* Rating Modal */}
        {showRating && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
              <h2 className="text-xl font-bold text-center text-blue-700 mb-4">
                Rate Donation Experience
              </h2>

              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={28}
                    className={`cursor-pointer ${
                      n <= (rating || 0) ? "text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => setRating(n)}
                  />
                ))}
              </div>

              <textarea
                className="border p-2 w-full rounded mb-4"
                placeholder="Write feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border rounded" onClick={() => setShowRating(false)}>
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleFeedbackSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DonationDetails;
