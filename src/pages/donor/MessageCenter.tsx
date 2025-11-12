import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MessageCenter = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [selectedNgo, setSelectedNgo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const donor = JSON.parse(localStorage.getItem("user") || "{}");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // 🔹 Load NGOs that donor has interacted with OR all NGOs (for now)
  useEffect(() => {
    const loadNgos = async () => {
      const { data, error } = await supabase
        .from("ngos")
        .select("id, name, email");
      if (error) console.error(error);
      else setNgos(data || []);
    };
    loadNgos();
  }, []);

  // 🔹 Load messages for selected NGO
  useEffect(() => {
    if (!selectedNgo) return;

    const loadMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("donor_messages")
        .select("*")
        .eq("donor_id", donor.id)
        .eq("ngo_id", selectedNgo.id)
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else setMessages(data || []);
      setLoading(false);
    };

    loadMessages();

    // 🔹 Real-time subscription for new messages
    const channel = supabase
      .channel("realtime-donor-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donor_messages" },
        (payload) => {
          if (
            payload.new &&
            payload.new.donor_id === donor.id &&
            payload.new.ngo_id === selectedNgo.id
          ) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedNgo]);

  // 🔹 Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedNgo) return;

    try {
      const { error } = await supabase.from("donor_messages").insert({
        donor_id: donor.id,
        ngo_id: selectedNgo.id,
        message: newMsg.trim(),
        sender_role: "donor",
      });
      if (error) throw error;
      setNewMsg("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
          <MessageCircle size={28} /> Message Center
        </h1>
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-lg border border-gray-200 rounded-2xl overflow-hidden">
        {/* NGO List */}
        <aside className="w-full md:w-1/3 border-r border-gray-200 p-6 bg-blue-50">
          <h2 className="text-lg font-semibold text-blue-700 mb-4">NGOs</h2>
          <ul className="space-y-3 max-h-[450px] overflow-y-auto">
            {ngos.map((ngo) => (
              <li
                key={ngo.id}
                onClick={() => setSelectedNgo(ngo)}
                className={`cursor-pointer p-3 rounded-lg transition ${
                  selectedNgo?.id === ngo.id
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-blue-100"
                }`}
              >
                <p className="font-semibold">{ngo.name}</p>
                <p
                  className={`text-sm ${
                    selectedNgo?.id === ngo.id ? "text-blue-100" : "text-gray-600"
                  }`}
                >
                  {ngo.email}
                </p>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat Section */}
        <main className="flex-1 p-6 flex flex-col">
          {selectedNgo ? (
            <>
              <h2 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2">
                Chat with {selectedNgo.name}
              </h2>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 border rounded-lg p-4 bg-gray-50">
                {loading ? (
                  <p className="text-gray-500 text-center">Loading messages...</p>
                ) : messages.length > 0 ? (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender_role === "donor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-xl ${
                          m.sender_role === "donor"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-green-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{m.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-600">
                    No messages yet. Start the conversation!
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                  placeholder="Type your message..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Send size={18} /> Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <p>Select an NGO from the left to start chatting.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessageCenter;
