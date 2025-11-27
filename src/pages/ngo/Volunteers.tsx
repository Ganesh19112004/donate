import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Search,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Send,
} from "lucide-react";

const Volunteers = () => {
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  const [joinedVolunteers, setJoinedVolunteers] = useState<any[]>([]);
  const [availableVolunteers, setAvailableVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  // ------------------------------------------------------------
  // 🟦 FETCH VOLUNTEERS
  // ------------------------------------------------------------
  useEffect(() => {
    loadVolunteers();
  }, [ngo.id]);

  const loadVolunteers = async () => {
    setLoading(true);

    // 1️⃣ Fetch joined volunteers
    const { data: joined, error: jErr } = await supabase
      .from("ngo_volunteers")
      .select(`
        id,
        volunteer_id,
        joined_at,
        volunteers (
          id, name, email, phone, city, image_url, created_at
        )
      `)
      .eq("ngo_id", ngo.id);

    if (jErr) console.error(jErr);

    const joinedIds = joined?.map((v) => v.volunteer_id) || [];

    // 2️⃣ Fetch all volunteers
    const { data: allVols, error: aErr } = await supabase
      .from("volunteers")
      .select("id, name, email, phone, city, image_url, created_at");

    if (aErr) console.error(aErr);

    // 3️⃣ Available = not joined
    const available = allVols?.filter((v) => !joinedIds.includes(v.id)) || [];

    setJoinedVolunteers(joined || []);
    setAvailableVolunteers(available);
    setLoading(false);
  };

  // ------------------------------------------------------------
  // ❌ Remove volunteer
  // ------------------------------------------------------------
  const removeVolunteer = async (volId: string) => {
    await supabase
      .from("ngo_volunteers")
      .delete()
      .eq("ngo_id", ngo.id)
      .eq("volunteer_id", volId);

    loadVolunteers();
  };

  // ------------------------------------------------------------
  // 📩 Request volunteer
  // ------------------------------------------------------------
  const requestVolunteer = async (volId: string) => {
    await supabase.from("ngo_volunteer_messages").insert({
      ngo_id: ngo.id,
      volunteer_id: volId,
      message: `NGO "${ngo.name}" invites you to join as a volunteer.`,
      sender_role: "ngo",
    });

    alert("Request sent!");
  };

  // ------------------------------------------------------------
  // 🔍 Filter helper
  // ------------------------------------------------------------
  const filterList = (list: any[]) =>
    list.filter((v) => {
      const item = v.volunteers || v;
      return (
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.city || "").toLowerCase().includes(search.toLowerCase())
      );
    });

  // ------------------------------------------------------------
  // Modal
  // ------------------------------------------------------------
  const VolunteerModal = ({ v, close }: any) => {
    const data = v.volunteers || v;

    return (
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">
          <button className="absolute top-3 right-3" onClick={close}>
            <XCircle className="text-red-600" size={26} />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={
                data.image_url ||
                `https://ui-avatars.com/api/?name=${data.name}`
              }
              className="w-20 h-20 rounded-full border object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-blue-700">{data.name}</h2>
              <p className="text-gray-600">{data.city || "Unknown"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <Mail size={18} className="text-blue-600" /> {data.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={18} className="text-green-600" />{" "}
              {data.phone || "—"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={18} className="text-red-600" />{" "}
              {data.city || "—"}
            </p>
          </div>

          {!joinedVolunteers.some((j) => j.volunteer_id === data.id) && (
            <button
              onClick={() => requestVolunteer(data.id)}
              className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg"
            >
              <Send size={16} /> Send Request
            </button>
          )}
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------
  // Render UI
  // ------------------------------------------------------------
  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading...</p>;

  return (
    <div className="p-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-3">
          <Users size={30} /> Manage Volunteers
        </h1>

        {/* Search */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center w-full md:w-1/2">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              className="bg-transparent outline-none w-full"
              placeholder="Search volunteers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Joined Volunteers */}
        <h2 className="text-xl font-semibold text-blue-700 mb-3">
          👥 Volunteers in Your NGO
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {filterList(joinedVolunteers).map((v) => (
            <div
              key={v.volunteer_id}
              className="p-4 bg-blue-50 border border-blue-200 rounded-xl shadow"
            >
              <img
                src={
                  v.volunteers.image_url ||
                  `https://ui-avatars.com/api/?name=${v.volunteers.name}`
                }
                className="w-24 h-24 rounded-full mx-auto mb-3 border"
              />
              <h3 className="text-center font-semibold text-blue-700">
                {v.volunteers.name}
              </h3>
              <p className="text-center text-gray-600">
                {v.volunteers.city || "—"}
              </p>

              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                  onClick={() => setSelected(v)}
                >
                  View
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded-lg"
                  onClick={() => removeVolunteer(v.volunteer_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Available Volunteers */}
        <h2 className="text-xl font-semibold text-green-700 mb-3">
          🟢 Available Volunteers
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {filterList(availableVolunteers).map((v) => (
            <div
              key={v.id}
              className="p-4 bg-white border rounded-xl shadow"
            >
              <img
                src={
                  v.image_url || `https://ui-avatars.com/api/?name=${v.name}`
                }
                className="w-24 h-24 rounded-full mx-auto mb-3 border"
              />

              <h3 className="text-center font-semibold">{v.name}</h3>
              <p className="text-center text-gray-600">{v.city}</p>

              <button
                onClick={() => requestVolunteer(v.id)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg mt-3"
              >
                <Send size={16} /> Send Request
              </button>

              <button
                className="w-full bg-gray-100 py-2 rounded-lg mt-2"
                onClick={() => setSelected(v)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <VolunteerModal 
          v={selected} 
          close={() => setSelected(null)} 
        />
      )}
    </div>
  );
};

export default Volunteers;
