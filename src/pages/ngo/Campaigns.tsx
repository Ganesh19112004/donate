import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layers, PauseCircle, PlayCircle, CheckCircle2 } from "lucide-react";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadCampaigns();

    // 🔥 REAL-TIME LISTENER
    const channel = supabase
      .channel("campaign-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ngo_campaigns" },
        (payload) => {
          console.log("Realtime update:", payload);
          loadCampaigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCampaigns = async () => {
    const { data } = await supabase
      .from("ngo_campaigns")
      .select("*")
      .eq("ngo_id", ngo.id)
      .order("created_at", { ascending: false });

    setCampaigns(data || []);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase
      .from("ngo_campaigns")
      .update({ status: newStatus })
      .eq("id", id);
  };

  const filtered =
    filter === "All" ? campaigns : campaigns.filter((c) => c.status === filter);

  return (
    <div className="p-8 bg-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow border">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
            <Layers /> Manage Campaigns
          </h1>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="All">All Campaigns</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* EMPTY */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-20 text-lg">
            No campaigns found.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((c) => {
              const progress =
                c.goal_amount > 0
                  ? Math.min((c.raised_amount / c.goal_amount) * 100, 100)
                  : 0;

              return (
                <div
                  key={c.id}
                  className="border rounded-xl shadow-lg bg-white hover:shadow-2xl transition overflow-hidden"
                >
                  {c.image_url && (
                    <img
                      src={c.image_url}
                      className="w-full h-40 object-cover"
                    />
                  )}

                  <div className="p-5">
                    <h2 className="text-xl font-semibold">{c.title}</h2>
                    <p className="text-gray-600 text-sm">{c.description}</p>

                    {/* PROGRESS BAR */}
                    <p className="mt-2 font-medium text-gray-800">
                      Goal: ₹{Number(c.goal_amount).toLocaleString()}
                    </p>

                    <div className="mt-2 w-full bg-gray-200 h-2 rounded-xl">
                      <div
                        style={{ width: `${progress}%` }}
                        className="h-2 bg-blue-600 rounded-xl"
                      ></div>
                    </div>

                    <p className="text-gray-600 text-sm mt-1">
                      Raised: ₹{Number(c.raised_amount).toLocaleString()} ({Math.round(progress)}%)
                    </p>

                    <span
                      className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold
                        ${
                          c.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : c.status === "Paused"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {c.status}
                    </span>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 mt-4">

                      {c.status === "Active" && (
                        <button
                          onClick={() => updateStatus(c.id, "Paused")}
                          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          <PauseCircle size={16} /> Pause
                        </button>
                      )}

                      {c.status === "Paused" && (
                        <button
                          onClick={() => updateStatus(c.id, "Active")}
                          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          <PlayCircle size={16} /> Resume
                        </button>
                      )}

                      {c.status !== "Completed" && (
                        <button
                          onClick={() => updateStatus(c.id, "Completed")}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          <CheckCircle2 size={16} /> Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
