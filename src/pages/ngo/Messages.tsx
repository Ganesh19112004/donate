import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Search,
  Send,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import {
  getChatMessages,
  sendMessage,
  subscribeToMessages,
  getUserChatList,
  markMessagesAsRead,
} from "@/utils/messageService";

import { supabase } from "@/integrations/supabase/client";

const NGOMessages = () => {
  const ngo = JSON.parse(localStorage.getItem("user") || "{}");

  const [donors, setDonors] = useState<any[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<any[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typing, setTyping] = useState(false);

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  /* ------------------------------------------------------------
     1️⃣ LOAD Donor List (Inbox)
  ------------------------------------------------------------ */
  useEffect(() => {
    const loadDonors = async () => {
      const chatList = await getUserChatList(ngo.id);

      const donorIds = chatList.map((msg) =>
        msg.sender_id === ngo.id ? msg.receiver_id : msg.sender_id
      );

      if (donorIds.length === 0) return;

      const { data: donorDetails } = await supabase
        .from("donors")
        .select("id, name, email, image_url")
        .in("id", donorIds);

      const merged = donorDetails.map((d) => {
        const lastMsg = chatList.find(
          (m) => m.sender_id === d.id || m.receiver_id === d.id
        );

        return {
          ...d,
          last_message: lastMsg?.message || "",
          last_time: lastMsg?.created_at,
          unread:
            lastMsg?.receiver_id === ngo.id && lastMsg?.read_status === false,
        };
      });

      setDonors(merged);
      setFilteredDonors(merged);
    };

    loadDonors();
  }, []);

  /* ------------------------------------------------------------
     2️⃣ LOAD Messages When Donor Selected
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!selectedDonor) return;

    const loadChat = async () => {
      setLoading(true);

      const { data } = await getChatMessages(ngo.id, selectedDonor.id);

      setMessages(data || []);
      setLoading(false);

      scrollBottom();

      await markMessagesAsRead(ngo.id, selectedDonor.id);
    };

    loadChat();

    const subscription = subscribeToMessages(
      ngo.id,
      selectedDonor.id,
      (msg) => {
        setMessages((prev) => [...prev, msg]);
        scrollBottom();

        if (msg.sender_id === selectedDonor.id) {
          setTyping(true);
          setTimeout(() => setTyping(false), 1500);
        }
      }
    );

    return () => supabase.removeChannel(subscription);
  }, [selectedDonor]);

  /* ------------------------------------------------------------
     Auto Scroll
  ------------------------------------------------------------ */
  const scrollBottom = () =>
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

  /* ------------------------------------------------------------
     SEND MESSAGE
  ------------------------------------------------------------ */
  const handleSend = async () => {
    if (!newMsg.trim() || !selectedDonor) return;

    await sendMessage(
      ngo.id,
      "ngo",
      selectedDonor.id,
      "donor",
      newMsg.trim()
    );

    setNewMsg("");
    scrollBottom();
  };

  /* ------------------------------------------------------------
     SEARCH Donor
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!searchQuery) {
      setFilteredDonors(donors);
    } else {
      setFilteredDonors(
        donors.filter((d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, donors]);

  /* ------------------------------------------------------------
     Render Message Bubble
  ------------------------------------------------------------ */
  const renderMessageBubble = (msg: any) => {
    const isMine = msg.sender_id === ngo.id;

    // Image message (img:https://)
    if (msg.message.startsWith("img:")) {
      const url = msg.message.replace("img:", "");
      return (
        <img
          src={url}
          className="w-48 rounded-xl shadow-md"
          alt="sent-img"
        />
      );
    }

    // Voice note (audio:)
    if (msg.message.startsWith("audio:")) {
      return (
        <div className="flex items-center gap-3">
          <Mic size={18} />
          <span className="text-xs opacity-80">Voice Message</span>
        </div>
      );
    }

    return <p>{msg.message}</p>;
  };

  /* ------------------------------------------------------------
     BLUE THEME STYLING
  ------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-6">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="text-3xl font-bold text-blue-800 flex items-center gap-2">
          <MessageCircle size={28} /> Messages
        </h1>
      </div>

      <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-md shadow-xl rounded-2xl flex overflow-hidden border">

        {/* LEFT — Inbox */}
        <aside className="w-1/3 bg-blue-50 border-r p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-blue-700 mb-3">Chats</h2>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-3 text-gray-500" />
            <input
              placeholder="Search donor..."
              className="pl-9 p-2 w-full border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ul className="space-y-3 max-h-[460px] overflow-y-auto">
            {filteredDonors.map((d) => (
              <li
                key={d.id}
                onClick={() => setSelectedDonor(d)}
                className={`cursor-pointer p-3 rounded-xl transition ${
                  selectedDonor?.id === d.id
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-blue-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{d.name}</p>

                  {d.unread && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>

                <p className="text-xs truncate opacity-80">
                  {d.last_message}
                </p>
              </li>
            ))}
          </ul>
        </aside>

        {/* RIGHT — Chat Window */}
        <main className="flex-1 flex flex-col p-6">

          {!selectedDonor ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a donor to chat
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-blue-700">
                  {selectedDonor.name}
                </h2>
                <span className="text-green-600 text-sm">● Online</span>
              </div>

              {/* CHAT BODY */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-white border rounded-xl shadow-inner space-y-3">

                {messages.map((msg) => {
                  const isMine = msg.sender_id === ngo.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl shadow-md ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white/80 text-gray-800 border rounded-bl-none"
                        }`}
                      >
                        {renderMessageBubble(msg)}

                        {/* TIME + TICKS */}
                        <p className="text-[11px] mt-1 opacity-80 flex items-center gap-1 justify-end">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}

                          {isMine &&
                            (msg.read_status ? (
                              <CheckCheck size={14} className="text-blue-300" />
                            ) : (
                              <Check size={14} className="text-white" />
                            ))}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* TYPING */}
                {typing && (
                  <p className="text-xs italic text-gray-500">Typing…</p>
                )}

                <div ref={messagesEndRef}></div>
              </div>

              {/* INPUT BAR */}
              <div className="flex items-center gap-3 mt-4 p-3 bg-white rounded-xl shadow-md">

                <Smile size={22} className="text-gray-500 cursor-pointer" />

                <Paperclip size={20} className="text-gray-500 cursor-pointer" />

                <ImageIcon
                  size={20}
                  className="text-gray-500 cursor-pointer"
                  onClick={() => {
                    const url = prompt("Enter image URL:");
                    if (url) {
                      sendMessage(
                        ngo.id,
                        "ngo",
                        selectedDonor.id,
                        "donor",
                        "img:" + url
                      );
                    }
                  }}
                />

                <input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Message"
                />

                <Mic size={22} className="text-gray-500 cursor-pointer" />

                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default NGOMessages;
