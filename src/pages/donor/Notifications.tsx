import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Notifications = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { alert("Login"); return; }
    const user = JSON.parse(stored);
    const fetch = async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setNotes(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const markRead = async (id: number) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotes((n) => n.map(x => x.id === id ? { ...x, is_read: true } : x));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        {notes.length === 0 ? <p className="text-gray-500">No notifications.</p> : (
          <ul className="space-y-3">
            {notes.map(n => (
              <li key={n.id} className={`p-3 rounded border ${n.is_read ? "bg-gray-50" : "bg-white"}`}>
                <div className="flex justify-between">
                  <div>{n.message}</div>
                  <div className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                {!n.is_read && <button onClick={() => markRead(n.id)} className="mt-2 text-sm text-blue-600">Mark read</button>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
