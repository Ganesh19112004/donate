import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageSquare, Loader2 } from "lucide-react";

const VolunteerMessages = () => {
  const volunteer = JSON.parse(localStorage.getItem("user") || "{}");
  const [ngos, setNgos] = useState<any[]>([]);
  const [selectedNgo, setSelectedNgo] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Load unique NGOs with whom the volunteer has communicated or joined
  useEffect(() => {
    const loadNgos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ngo_volunteers")
        .select("ngo_id, ngos(name)")
        .eq("volunteer_id", volunteer.id);

      if (error) {
        console.error("Error fetching NGOs:", error);
        setLoading(false);
        return;
      }

      const uniqueNgos = data
        ? Array.from(new Map(data.map((n: any) => [n.ngo_id, n])).values())
        : [];

      setNgos(uniqueNgos.map((n: any) => ({ id: n.ngo_id, name: n.ngos.name })));
      setLoading(false);
    };
    loadNgos();
  }, [volunteer.id]);

  // ✅ Load messages for the selected NGO
  useEffect(() => {
    if (!selectedNgo) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("ngo_volunteer_messages")
        .select("*")
        .eq("volunteer_id", volunteer.id)
        .eq("ngo_id", selectedNgo)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
        scrollToBottom();
      }
    };

    fetchMessages();

    // 🔄 Poll for new messages every 5s
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedNgo, volunteer.id]);

  // ✅ Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  // ✅ Send message
  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedNgo) return;

    const { error } = await supabase.from("ngo_volunteer_messages").insert({
      volunteer_id: volunteer.id,
      ngo_id: selectedNgo,
      message: newMsg,
      sender_role: "volunteer",
    });

    if (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
      return;
    }

    setNewMsg("");
    scrollToBottom();

    // Refresh messages instantly
    const { data } = await supabase
      .from("ngo_volunteer_messages")
      .select("*")
      .eq("volunteer_id", volunteer.id)
      .eq("ngo_id", selectedNgo)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Loading messages...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-10">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-blue-100 flex flex-col">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          <MessageSquare size={22} /> Volunteer Messages
        </h1>

        {/* NGO Selection */}
        <select
          className="border p-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-400"
          value={selectedNgo}
          onChange={(e) => setSelectedNgo(e.target.value)}
        >
          <option value="">-- Select NGO to chat with --</option>
          {ngos.map((ngo) => (
            <option key={ngo.id} value={ngo.id}>
              {ngo.name}
            </option>
          ))}
        </select>

        {selectedNgo ? (
          <>
            {/* Messages Box */}
            <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50 shadow-inner">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                  No messages yet. Start the conversation 👋
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex mb-3 ${
                      m.sender_role === "volunteer"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg text-sm ${
                        m.sender_role === "volunteer"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{m.message}</p>
                      <p className="text-[10px] opacity-70 mt-1 text-right">
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                className="border rounded-lg p-3 flex-1 focus:ring-2 focus:ring-blue-400"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 transition"
              >
                <Send size={16} /> Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-600 text-center mt-8">
            Please select an NGO to start chatting 💬
          </p>
        )}
      </div>
    </div>
  );
};

export default VolunteerMessages;
