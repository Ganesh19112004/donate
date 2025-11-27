import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Check,
  CheckCheck,
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import {
  getChatMessages,
  sendMessage,
  subscribeToMessages,
  getUserChatList,
  markMessagesAsRead,
  sendTypingStatus,
  subscribeToTyping,
} from "@/utils/messageService";

import { supabase } from "@/integrations/supabase/client";

const MessageCenter = () => {
  const donor = JSON.parse(localStorage.getItem("user") || "{}");

  const [ngos, setNgos] = useState<any[]>([]);
  const [filteredNgos, setFilteredNgos] = useState<any[]>([]);
  const [selectedNgo, setSelectedNgo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const [typing, setTyping] = useState(false);
  const [ngoTyping, setNgoTyping] = useState(false);

  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement | null>(null);
  let typingTimeout: any = null;

  /* ---------------------------------------------------------
     LOAD CHAT LIST (All NGOs donor has chatted with)
  ----------------------------------------------------------*/
  useEffect(() => {
    const loadChatList = async () => {
      const chatList = await getUserChatList(donor.id);

      const ngoIds = chatList.map((m) =>
        m.sender_id === donor.id ? m.receiver_id : m.sender_id
      );

      if (ngoIds.length === 0) return;

      const { data: ngoDetails } = await supabase
        .from("ngos")
        .select("id,name,email,image_url")
        .in("id", ngoIds);

      const merged = ngoDetails.map((ngo) => {
        const lastMsg = chatList.find(
          (m) => m.sender_id === ngo.id || m.receiver_id === ngo.id
        );

        return {
          ...ngo,
          last_message: lastMsg?.message || "",
          last_time: lastMsg?.created_at || "",
          unread: lastMsg?.receiver_id === donor.id && !lastMsg.read_status,
        };
      });

      setNgos(merged);
      setFilteredNgos(merged);
    };

    loadChatList();
  }, []);

  /* ---------------------------------------------------------
     LOAD MESSAGES WHEN NGO SELECTED
  ----------------------------------------------------------*/
  useEffect(() => {
    if (!selectedNgo) return;

    const loadMessagesNow = async () => {
      const { data } = await getChatMessages(donor.id, selectedNgo.id);
      setMessages(data || []);
      scrollBottom();

      await markMessagesAsRead(donor.id, selectedNgo.id);
    };

    loadMessagesNow();

    /* ------- REAL TIME MESSAGE LISTENER ------- */
    const channel = subscribeToMessages(
      donor.id,
      selectedNgo.id,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);

        if (newMessage.sender_id !== donor.id) {
          setNgoTyping(true);

          setTimeout(() => setNgoTyping(false), 1500);
        }

        scrollBottom();
      }
    );

    /* ------- TYPING INDICATOR LISTENER ------- */
    const typingSub = subscribeToTyping(donor.id, (payload) => {
      if (payload.sender_id === selectedNgo.id) {
        setNgoTyping(payload.typing);

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setNgoTyping(false), 2000);
      }
    });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingSub);
    };
  }, [selectedNgo]);

  /* ---------------------------------------------------------
     AUTO SCROLL
  ----------------------------------------------------------*/
  const scrollBottom = () =>
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 200);

  /* ---------------------------------------------------------
     SEND MESSAGE
  ----------------------------------------------------------*/
  const sendMsg = async () => {
    if (!newMsg.trim()) return;

    await sendMessage(
      donor.id,
      "donor",
      selectedNgo.id,
      "ngo",
      newMsg.trim()
    );

    setNewMsg("");
    scrollBottom();
  };

  /* ---------------------------------------------------------
     DONOR TYPING STATUS (broadcast)
  ----------------------------------------------------------*/
  const handleTyping = (value: string) => {
    setNewMsg(value);

    sendTypingStatus(donor.id, selectedNgo.id, true);

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      sendTypingStatus(donor.id, selectedNgo.id, false);
    }, 1200);
  };

  /* ---------------------------------------------------------
     SEARCH NGO
  ----------------------------------------------------------*/
  useEffect(() => {
    if (!search.trim()) return setFilteredNgos(ngos);

    setFilteredNgos(
      ngos.filter((n) => n.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, ngos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto flex justify-between mb-6 items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <MessageCircle size={28} /> Messages
        </h1>
      </div>

      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl flex overflow-hidden">

        {/* LEFT – NGO LIST */}
        <aside className="w-1/3 border-r bg-blue-50 p-6 flex flex-col">

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              placeholder="Search NGO..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* NGO LIST */}
          <ul className="space-y-3 overflow-y-auto max-h-[500px]">
            {filteredNgos.map((ngo) => (
              <li
                key={ngo.id}
                onClick={() => {
                  setSelectedNgo(ngo);
                  setMessages([]);
                }}
                className={`cursor-pointer p-3 rounded-xl ${
                  selectedNgo?.id === ngo.id
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-blue-100"
                }`}
              >
                <div className="flex justify-between">
                  <p className="font-semibold">{ngo.name}</p>

                  {ngo.unread && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs truncate ${
                    selectedNgo?.id === ngo.id
                      ? "text-blue-100"
                      : "text-gray-600"
                  }`}
                >
                  {ngo.last_message || "No messages yet"}
                </p>

                <p className="text-[10px] text-gray-500">
                  {ngo.last_time &&
                    new Date(ngo.last_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              </li>
            ))}
          </ul>
        </aside>

        {/* RIGHT – CHAT */}
        <main className="flex-1 p-6 flex flex-col">
          {!selectedNgo ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select an NGO to start chatting
            </div>
          ) : (
            <>
              {/* Top header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-blue-700">
                  {selectedNgo.name}
                </h2>

                <span className="text-sm text-green-600">● Online</span>
              </div>

              {/* CHAT BOX */}
              <div className="flex-1 overflow-y-auto space-y-3 bg-gray-50 p-4 rounded-lg border shadow-inner">

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender_id === donor.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-xl ${
                        m.sender_id === donor.id
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-green-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{m.message}</p>

                      <p className="text-xs mt-1 flex items-center gap-1 opacity-70">
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                        {m.sender_id === donor.id &&
                          (m.read_status ? (
                            <CheckCheck size={14} />
                          ) : (
                            <Check size={14} />
                          ))}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing */}
                {ngoTyping && (
                  <p className="text-xs text-gray-600 italic">NGO is typing…</p>
                )}

                <div ref={endRef} />
              </div>

              {/* INPUT BOX */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  value={newMsg}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                  placeholder="Type a message..."
                  className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                />

                <button
                  onClick={sendMsg}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessageCenter;
