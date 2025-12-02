import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Layers,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  List,
  Pencil,
  Trash2,
  Users,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  /* ------------------------ Load Campaigns ------------------------ */
  useEffect(() => {
    loadCampaigns();

    const channel = supabase
      .channel("ngo_campaign_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ngo_campaigns" },
        () => loadCampaigns()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("ngo_campaigns")
      .select("*")
      .eq("ngo_id", ngo.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setCampaigns(data || []);
    setLoading(false);
  };

  /* ------------------------ Update Status ------------------------ */
  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("ngo_campaigns")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Failed to update status");
      return;
    }

    loadCampaigns();
  };

  /* ----------------------- Delete Campaign ----------------------- */
  const deleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    const { error } = await supabase
      .from("ngo_campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete campaign");
      return;
    }

    loadCampaigns();
  };

  const filtered =
    filter === "All" ? campaigns : campaigns.filter((c) => c.status === filter);

  return (
    <div className="p-8 bg-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow border">
        
        {/* Header */}
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

        {/* Empty / Loading */}
        {loading ? (
          <p className="text-center text-gray-500 py-20">Loading campaigns...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-20 text-lg">
            No campaigns found.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((c) => {
              const progress =
                c.goal_amount > 0
                  ? Math.min(
                      (Number(c.raised_amount) / Number(c.goal_amount)) * 100,
                      100
                    )
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
                      alt="Campaign"
                    />
                  )}

                  <div className="p-5">
                    <h2 className="text-xl font-semibold">{c.title}</h2>
                    <p className="text-gray-600 text-sm">{c.description}</p>

                    <p className="mt-2 font-medium text-gray-800">
                      Goal: ₹{Number(c.goal_amount).toLocaleString()}
                    </p>

                    {/* Progress */}
                    <div className="mt-2 w-full bg-gray-200 h-2 rounded-xl">
                      <div
                        className="h-2 bg-blue-600 rounded-xl"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <p className="text-gray-600 text-sm mt-1">
                      Raised: ₹{Number(c.raised_amount).toLocaleString()} (
                      {Math.round(progress)}%)
                    </p>

                    {/* Status Badge */}
                    <span
                      className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                        c.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : c.status === "Paused"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {c.status}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-4">

                      {/* Pause */}
                      {c.status === "Active" && (
                        <button
                          onClick={() => updateStatus(c.id, "Paused")}
                          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          <PauseCircle size={16} /> Pause
                        </button>
                      )}

                      {/* Resume */}
                      {c.status === "Paused" && (
                        <button
                          onClick={() => updateStatus(c.id, "Active")}
                          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          <PlayCircle size={16} /> Resume
                        </button>
                      )}

                      {/* Complete */}
                      {c.status !== "Completed" && (
                        <button
                          onClick={() => updateStatus(c.id, "Completed")}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          <CheckCircle2 size={16} /> Complete
                        </button>
                      )}

                      {/* History */}
                      <button
                        onClick={() =>
                          navigate(`/ngo/campaign-history/${c.id}`)
                        }
                        className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <List size={16} /> History
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => navigate(`/ngo/campaign-edit/${c.id}`)}
                        className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <Pencil size={16} /> Edit
                      </button>

                      {/* Donors */}
                      <button
                        onClick={() =>
                          navigate(`/ngo/campaign-donors/${c.id}`)
                        }
                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <Users size={16} /> Donors
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/campaign/${c.id}`
                          );
                          alert("Share link copied!");
                        }}
                        className="flex items-center gap-1 bg-blue-800 hover:bg-blue-900 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <Share2 size={16} /> Share
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteCampaign(c.id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
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
