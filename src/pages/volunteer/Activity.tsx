import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Clock,
  ClipboardList,
  ActivitySquare,
  CheckCircle,
  XCircle,
} from "lucide-react";

const Activity = () => {
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load volunteer activity with safe nested joins
  useEffect(() => {
    const loadActivity = async () => {
      if (!volunteer.id) return;
      setLoading(true);

      // Step 1: Fetch volunteer activity
      const { data: activityData, error: activityError } = await supabase
        .from("volunteer_activity")
        .select("id, action, details, created_at, related_task")
        .eq("volunteer_id", volunteer.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (activityError) {
        console.error("Error loading volunteer activity:", activityError);
        setLoading(false);
        return;
      }

      // Step 2: If activities have related_task, fetch their details
      const relatedTaskIds = activityData
        .map((a) => a.related_task)
        .filter((id) => !!id);

      let relatedTasksMap: Record<string, any> = {};
      if (relatedTaskIds.length > 0) {
        const { data: relatedTasks, error: relatedErr } = await supabase
          .from("volunteer_assignments")
          .select(
            `
            id,
            status,
            donations (
              category,
              description,
              ngos (name, city)
            )
          `
          )
          .in("id", relatedTaskIds);

        if (!relatedErr && relatedTasks) {
          relatedTasksMap = Object.fromEntries(
            relatedTasks.map((t) => [t.id, t])
          );
        }
      }

      // Step 3: Merge related task info into activity entries
      const merged = activityData.map((a) => ({
        ...a,
        related_task_info: a.related_task
          ? relatedTasksMap[a.related_task] || null
          : null,
      }));

      setActivities(merged);
      setLoading(false);
    };

    loadActivity();
  }, [volunteer.id]);

  // 🕓 Smart timestamp formatting
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // 📆 Group by date (Today, Yesterday, Earlier)
  const groupActivities = () => {
    const groups: Record<string, any[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    activities.forEach((a) => {
      const d = new Date(a.created_at);
      if (d.toDateString() === today.toDateString()) groups["Today"].push(a);
      else if (d.toDateString() === yesterday.toDateString())
        groups["Yesterday"].push(a);
      else groups["Earlier"].push(a);
    });

    return groups;
  };

  const grouped = groupActivities();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your activity...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-700 mb-8 flex items-center gap-2">
          <ClipboardList size={28} /> Volunteer Activity
        </h1>

        {activities.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            No recent activities yet.
          </p>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([section, acts]) =>
              acts.length === 0 ? null : (
                <div key={section}>
                  <h2 className="text-xl font-semibold text-blue-700 mb-4 border-l-4 border-blue-500 pl-3">
                    {section}
                  </h2>
                  <ul className="space-y-4 relative border-l-2 border-blue-200 pl-6">
                    {acts.map((a) => (
                      <li
                        key={a.id}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative"
                      >
                        {/* Timeline Dot */}
                        <span className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></span>

                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-gray-800 font-medium flex items-center gap-2">
                              {a.action === "Task Completed" ? (
                                <CheckCircle
                                  className="text-green-600"
                                  size={18}
                                />
                              ) : a.action === "Task Cancelled" ? (
                                <XCircle className="text-red-600" size={18} />
                              ) : (
                                <ActivitySquare
                                  className="text-blue-600"
                                  size={18}
                                />
                              )}
                              {a.action}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {a.details || "No additional details provided."}
                            </p>

                            {/* 🧩 Related task info */}
                            {a.related_task_info && (
                              <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>
                                    {a.related_task_info.donations?.category}
                                  </strong>{" "}
                                  —{" "}
                                  {
                                    a.related_task_info.donations?.description
                                  }
                                </p>
                                {a.related_task_info.donations?.ngos && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    NGO:{" "}
                                    {
                                      a.related_task_info.donations.ngos.name
                                    }{" "}
                                    (
                                    {
                                      a.related_task_info.donations.ngos.city
                                    }
                                    )
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                            <Clock size={14} /> {formatDate(a.created_at)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
