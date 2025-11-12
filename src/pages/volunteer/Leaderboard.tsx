import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";

const Leaderboard = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentVolunteer = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("volunteer_impact")
        .select(`
          volunteer_id,
          completed_tasks,
          performance_level,
          success_rate,
          volunteers (
            name,
            city
          )
        `)
        .order("completed_tasks", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error loading leaderboard:", error);
      } else {
        setVolunteers(data || []);
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  // 🎨 Helper function for badge colors
  const levelColor = (level: string) => {
    switch (level) {
      case "Hero":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "Leader":
        return "bg-purple-100 text-purple-800 border-purple-400";
      case "Active":
        return "bg-green-100 text-green-800 border-green-400";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // 🥇 Medal color logic
  const medalColor = (index: number) => {
    if (index === 0) return "#FFD700"; // gold
    if (index === 1) return "#C0C0C0"; // silver
    if (index === 2) return "#CD7F32"; // bronze
    return "transparent";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Loading leaderboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white p-10">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-yellow-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-yellow-600 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Volunteer Leaderboard
          </h1>
          <p className="text-gray-500 text-sm">
            🕓 Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {volunteers.length === 0 ? (
          <p className="text-center text-gray-600 py-10">
            No leaderboard data available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm rounded-lg">
              <thead className="bg-yellow-100 border border-yellow-200">
                <tr>
                  <th className="p-3 text-left">Rank</th>
                  <th className="p-3 text-left">Volunteer</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Completed Tasks</th>
                  <th className="p-3">Success Rate</th>
                  <th className="p-3">Level</th>
                </tr>
              </thead>

              <tbody>
                {volunteers.map((v, i) => {
                  const isCurrent = v.volunteer_id === currentVolunteer.id;

                  return (
                    <tr
                      key={v.volunteer_id}
                      className={`border-t transition ${
                        isCurrent
                          ? "bg-yellow-50 font-semibold border-yellow-300"
                          : "hover:bg-yellow-50"
                      }`}
                    >
                      {/* Rank */}
                      <td className="p-3 font-semibold flex items-center gap-2">
                        {i < 3 ? (
                          <Medal
                            size={18}
                            style={{ color: medalColor(i) }}
                            className="inline"
                          />
                        ) : (
                          <span className="text-gray-700">{i + 1}</span>
                        )}
                      </td>

                      {/* Volunteer Info */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Award
                            size={16}
                            className="text-yellow-500 opacity-80"
                          />
                          <span>{v.volunteers?.name || "Unknown"}</span>
                        </div>
                      </td>

                      {/* City */}
                      <td className="p-3 text-gray-600">
                        {v.volunteers?.city || "—"}
                      </td>

                      {/* Completed Tasks */}
                      <td className="p-3 font-bold text-yellow-700 text-center">
                        {v.completed_tasks || 0}
                      </td>

                      {/* Success Rate */}
                      <td className="p-3 text-gray-700 text-center">
                        {v.success_rate
                          ? `${Math.round(v.success_rate)}%`
                          : "—"}
                      </td>

                      {/* Performance Level */}
                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-medium ${levelColor(
                            v.performance_level
                          )}`}
                        >
                          {v.performance_level}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
