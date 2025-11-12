import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, User, Package, Truck, CheckCircle } from "lucide-react";

const DonationDetailsNGO = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [volunteer, setVolunteer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("donations")
        .select("*, donors(name, email, image_url)")
        .eq("id", id)
        .single();
      if (!error) setDonation(data);

      const { data: ev } = await supabase
        .from("donation_events")
        .select("*")
        .eq("donation_id", id)
        .order("created_at", { ascending: true });
      setEvents(ev || []);

      if (data?.assigned_volunteer) {
        const { data: vol } = await supabase
          .from("volunteers")
          .select("name, email")
          .eq("id", data.assigned_volunteer)
          .single();
        setVolunteer(vol);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );

  if (!donation) return <div className="p-8">Donation not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">
            Donation Details (NGO View)
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Image */}
        {donation.image_url && (
          <img
            src={donation.image_url}
            alt="Donation"
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-semibold">{donation.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quantity / Amount</p>
            <p className="font-semibold">
              {donation.amount ? `₹${donation.amount}` : donation.quantity}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold">{donation.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-semibold">
              {new Date(donation.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Donor Info */}
        <div className="mb-6 border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
            <User size={18} /> Donor Information
          </h3>
          <div className="flex items-center gap-3">
            {donation.donors?.image_url ? (
              <img
                src={donation.donors.image_url}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {donation.donors?.name?.[0]}
              </div>
            )}
            <div>
              <p className="font-medium">{donation.donors?.name}</p>
              <p className="text-sm text-gray-500">{donation.donors?.email}</p>
            </div>
          </div>
        </div>

        {/* Volunteer Info */}
        {volunteer && (
          <div className="mb-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <Truck size={18} /> Assigned Volunteer
            </h3>
            <p className="font-medium">{volunteer.name}</p>
            <p className="text-sm text-gray-500">{volunteer.email}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <Package size={18} /> Donation Timeline
          </h3>
          {events.length === 0 ? (
            <p className="text-sm text-gray-500">No events recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((ev) => (
                <li key={ev.id} className="border p-3 rounded-lg bg-gray-50">
                  <p className="font-semibold">{ev.event}</p>
                  {ev.note && <p className="text-sm text-gray-600">{ev.note}</p>}
                  <p className="text-xs text-gray-400">
                    {new Date(ev.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDetailsNGO;
