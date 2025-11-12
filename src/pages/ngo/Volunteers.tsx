import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, XCircle } from "lucide-react";

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Fetch volunteers joined to this NGO
  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("ngo_volunteers")
        .select(`
          id,
          joined_at,
          volunteers (
            id,
            name,
            email,
            phone,
            city,
            image_url,
            created_at
          )
        `)
        .eq("ngo_id", ngo.id)
        .order("joined_at", { ascending: false });

      if (error) console.error(error);
      else setVolunteers(data || []);

      setLoading(false);
    };

    fetchVolunteers();
  }, [ngo.id]);

  // ✅ Remove a volunteer from NGO
  const handleRemoveVolunteer = async (volunteerId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to remove this volunteer from your NGO?"
    );
    if (!confirmDelete) return;

    await supabase
      .from("ngo_volunteers")
      .delete()
      .eq("ngo_id", ngo.id)
      .eq("volunteer_id", volunteerId);

    setVolunteers(
      volunteers.filter((v) => v.volunteers.id !== volunteerId)
    );
    alert("Volunteer removed successfully ✅");
  };

  // ✅ Filter volunteers by search
  const filteredVolunteers = volunteers.filter((v) => {
    const name = v.volunteers?.name?.toLowerCase() || "";
    const city = v.volunteers?.city?.toLowerCase() || "";
    return (
      name.includes(searchQuery.toLowerCase()) ||
      city.includes(searchQuery.toLowerCase())
    );
  });

  if (loading)
    return (
      <div className="text-center py-10 text-gray-600">
        Loading volunteers...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-8 flex items-center gap-2">
          <Users size={30} /> NGO Volunteers
        </h1>

        {/* 🔍 Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full md:w-1/2 shadow-inner">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search volunteers by name or city..."
              className="bg-transparent w-full outline-none text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 📋 Volunteer Table */}
        {filteredVolunteers.length === 0 ? (
          <p className="text-gray-600 text-center py-10">
            No volunteers found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-xl text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-3 text-left">Profile</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3 text-left">Joined</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((v) => (
                  <tr
                    key={v.volunteers.id}
                    className="border-t hover:bg-blue-50 transition"
                  >
                    <td className="p-3">
                      <img
                        src={
                          v.volunteers.image_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            v.volunteers.name || "V"
                          )}`
                        }
                        alt="Profile"
                        className="w-10 h-10 rounded-full border object-cover"
                      />
                    </td>
                    <td className="p-3 font-medium text-gray-800">
                      {v.volunteers.name}
                    </td>
                    <td className="p-3 text-gray-600">
                      {v.volunteers.email}
                    </td>
                    <td className="p-3 text-gray-600">
                      {v.volunteers.phone || "—"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {v.volunteers.city || "—"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {new Date(v.joined_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveVolunteer(v.volunteers.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition flex items-center justify-center gap-1 mx-auto"
                      >
                        <XCircle size={16} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 📊 Summary Section */}
        {volunteers.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-around text-center">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl w-64 shadow-sm">
              <h2 className="text-lg font-semibold text-blue-700">
                Total Volunteers
              </h2>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {volunteers.length}
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl w-64 shadow-sm">
              <h2 className="text-lg font-semibold text-green-700">
                Cities Represented
              </h2>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {
                  new Set(
                    volunteers
                      .map((v) => v.volunteers.city)
                      .filter((c) => c && c.trim() !== "")
                  ).size
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Volunteers;
