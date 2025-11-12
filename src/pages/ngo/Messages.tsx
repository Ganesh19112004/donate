import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

const NGOMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("donor_messages")
        .select("*")
        .eq("ngo_id", ngo.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();
  }, []);

  const sendMessage = async (donorId: string) => {
    if (!newMsg.trim()) return;
    await supabase.from("donor_messages").insert({
      donor_id: donorId,
      ngo_id: ngo.id,
      message: newMsg,
      sender_role: "ngo",
    });
    setNewMsg("");
  };

  return (
    <div className="p-8 bg-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">💬 Message Donors</h1>

        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-lg ${
                  m.sender_role === "ngo"
                    ? "bg-blue-100 text-blue-800 text-right"
                    : "bg-gray-100 text-left"
                }`}
              >
                {m.message}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="flex-1 border rounded-lg p-2"
            placeholder="Type your message..."
          />
          <button
            onClick={() => sendMessage(messages[0]?.donor_id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"
          >
            <Send size={18} /> Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default NGOMessages;
