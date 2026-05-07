import { useEffect, useState, useRef } from "react";

import {
  ArrowLeft,
  MessageCircle,
  Search,
  Send,
  Check,
  CheckCheck,
  Smile,
  Image as ImageIcon,
  Phone,
  Video,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getChatMessages,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
  sendTypingStatus,
  subscribeToTyping,
  updatePresence,
} from "@/utils/messageService";

import { getOrCreateConversation } from "@/utils/conversationService";

import { supabase } from "@/integrations/supabase/client";

const NGOMessages = () => {
  const ngo = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [users, setUsers] =
    useState<any[]>([]);

  const [filteredUsers, setFilteredUsers] =
    useState<any[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<any>(null);

  const [conversationId, setConversationId] =
    useState("");

  const [messages, setMessages] =
    useState<any[]>([]);

  const [newMsg, setNewMsg] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [typing, setTyping] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [sendingImage, setSendingImage] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  let typingTimeout: any = null;

  /* =========================================================
     ONLINE PRESENCE
  ========================================================= */

  useEffect(() => {
    if (!ngo?.id) return;

    updatePresence(
      ngo.id,
      "ngo",
      true
    );

    const offline = () => {
      updatePresence(
        ngo.id,
        "ngo",
        false
      );
    };

    window.addEventListener(
      "beforeunload",
      offline
    );

    return () => {
      offline();

      window.removeEventListener(
        "beforeunload",
        offline
      );
    };
  }, []);

  /* =========================================================
     LOAD ONLY RELATED USERS
  ========================================================= */

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    // NGO conversations
    const {
      data: ngoConversations,
    } = await supabase
      .from(
        "conversation_participants"
      )
      .select("conversation_id")
      .eq("user_id", ngo.id);

    const conversationIds =
      ngoConversations?.map(
        (c) => c.conversation_id
      ) || [];

    if (
      conversationIds.length === 0
    ) {
      setUsers([]);

      setFilteredUsers([]);

      setLoading(false);

      return;
    }

    // Get users from those conversations
    const {
      data: participants,
    } = await supabase
      .from(
        "conversation_participants"
      )
      .select(`
        user_id,
        role,
        conversation_id
      `)
      .in(
        "conversation_id",
        conversationIds
      )
      .neq("user_id", ngo.id);

    if (!participants) {
      setLoading(false);

      return;
    }

    // remove duplicates
    const uniqueParticipants =
      participants.filter(
        (
          item,
          index,
          self
        ) =>
          index ===
          self.findIndex(
            (u) =>
              u.user_id ===
                item.user_id &&
              u.role === item.role
          )
      );

    let finalUsers: any[] = [];

    /* =========================================================
       DONORS
    ========================================================= */

    const donorIds =
      uniqueParticipants
        .filter(
          (u) =>
            u.role === "donor"
        )
        .map((u) => u.user_id);

    if (donorIds.length > 0) {
      const { data: donors } =
        await supabase
          .from("donors")
          .select(`
            id,
            name,
            image_url
          `)
          .in("id", donorIds);

      finalUsers.push(
        ...(donors || []).map(
          (d) => ({
            ...d,
            role: "donor",
          })
        )
      );
    }

    /* =========================================================
       VOLUNTEERS
    ========================================================= */

    const volunteerIds =
      uniqueParticipants
        .filter(
          (u) =>
            u.role ===
            "volunteer"
        )
        .map((u) => u.user_id);

    if (
      volunteerIds.length > 0
    ) {
      const {
        data: volunteers,
      } = await supabase
        .from("volunteers")
        .select(`
          id,
          name,
          image_url
        `)
        .in(
          "id",
          volunteerIds
        );

      finalUsers.push(
        ...(volunteers || []).map(
          (v) => ({
            ...v,
            role: "volunteer",
          })
        )
      );
    }

    setUsers(finalUsers);

    setFilteredUsers(
      finalUsers
    );

    setLoading(false);
  }

  /* =========================================================
     LOAD CHAT
  ========================================================= */

  useEffect(() => {
    if (
      !selectedUser ||
      !conversationId
    )
      return;

    loadMessages();

    const channel =
      subscribeToMessages(
        conversationId,
        (msg: any) => {
          setMessages((prev) => [
            ...prev,
            msg,
          ]);

          scrollBottom();

          if (
            msg.sender_id !== ngo.id
          ) {
            setTyping(true);

            setTimeout(() => {
              setTyping(false);
            }, 1200);
          }
        }
      );

    const typingSub =
      subscribeToTyping(
        ngo.id,
        (payload: any) => {
          if (
            payload.sender_id ===
            selectedUser.id
          ) {
            setTyping(
              payload.typing
            );

            clearTimeout(
              typingTimeout
            );

            typingTimeout =
              setTimeout(() => {
                setTyping(false);
              }, 1500);
          }
        }
      );

    return () => {
      supabase.removeChannel(
        channel
      );

      supabase.removeChannel(
        typingSub
      );
    };
  }, [selectedUser, conversationId]);

  async function loadMessages() {
    const { data } =
      await getChatMessages(
        conversationId
      );

    setMessages(data || []);

    scrollBottom();

    await markMessagesAsRead(
      conversationId,
      ngo.id
    );
  }

  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  const scrollBottom = () =>
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView(
        {
          behavior: "smooth",
        }
      );
    }, 100);

  /* =========================================================
     SELECT USER
  ========================================================= */

  async function selectUser(
    user: any
  ) {
    setSelectedUser(user);

    const convo =
      await getOrCreateConversation(
        ngo.id,
        "ngo",
        user.id,
        user.role
      );

    setConversationId(convo);
  }

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  async function handleSend() {
    if (
      !newMsg.trim() ||
      !conversationId
    )
      return;

    await sendMessage(
      conversationId,
      ngo.id,
      "ngo",
      newMsg.trim()
    );

    setNewMsg("");

    scrollBottom();
  }

  /* =========================================================
     TYPING
  ========================================================= */

  function handleTyping(
    value: string
  ) {
    setNewMsg(value);

    if (!selectedUser) return;

    sendTypingStatus(
      ngo.id,
      selectedUser.id,
      true
    );

    clearTimeout(
      typingTimeout
    );

    typingTimeout =
      setTimeout(() => {
        sendTypingStatus(
          ngo.id,
          selectedUser.id,
          false
        );
      }, 1200);
  }

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  async function uploadImage(
    e: any
  ) {
    const file =
      e.target.files[0];

    if (
      !file ||
      !conversationId
    )
      return;

    setSendingImage(true);

    const fileName =
      Date.now() + file.name;

    const { error } =
      await supabase.storage
        .from("chat-media")
        .upload(fileName, file);

    if (error) {
      alert("Upload failed");

      setSendingImage(false);

      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("chat-media")
      .getPublicUrl(fileName);

    await sendMessage(
      conversationId,
      ngo.id,
      "ngo",
      "",
      "image",
      publicUrl
    );

    setSendingImage(false);

    scrollBottom();
  }

  /* =========================================================
     SEARCH
  ========================================================= */

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);

      return;
    }

    setFilteredUsers(
      users.filter((u) =>
        u.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
      )
    );
  }, [searchQuery, users]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 md:p-6">

      <div className="max-w-7xl mx-auto flex justify-between items-center mb-5">

        <button
          onClick={() =>
            navigate(-1)
          }
          className="flex items-center gap-2 text-blue-700 font-semibold"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">

          <MessageCircle size={28} />

          NGO Messages
        </h1>
      </div>

      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden flex h-[85vh]">

        {/* SIDEBAR */}

        <aside className="w-[350px] border-r bg-slate-50 flex flex-col">

          <div className="p-4 border-b">

            <div className="relative">

              <Search
                className="absolute left-3 top-3 text-gray-500"
                size={18}
              />

              <input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl pl-10 pr-4 py-3"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">

            {loading ? (
              <p className="text-center mt-10">

                Loading chats...
              </p>
            ) : filteredUsers.length ===
              0 ? (
              <p className="text-center mt-10 text-gray-500">

                No chats yet
              </p>
            ) : (
              filteredUsers.map(
                (u) => (
                  <div
                    key={`${u.role}-${u.id}`}
                    onClick={() =>
                      selectUser(u)
                    }
                    className={`cursor-pointer p-3 rounded-2xl border transition

                    ${
                      selectedUser?.id ===
                      u.id
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-blue-50"
                    }
                    `}
                  >

                    <div className="flex gap-3 items-center">

                      <img
                        src={
                          u.image_url ||
                          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        }
                        className="w-14 h-14 rounded-full object-cover"
                      />

                      <div>

                        <h2 className="font-bold">

                          {u.name}
                        </h2>

                        <p className="text-xs opacity-70 capitalize">

                          {u.role}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </aside>

        {/* CHAT */}

        <main className="flex-1 flex flex-col bg-[#efeae2]">

          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">

              Select user to chat
            </div>
          ) : (
            <>
              {/* HEADER */}

              <div className="bg-white px-6 py-4 border-b flex justify-between items-center">

                <div className="flex items-center gap-4">

                  <img
                    src={
                      selectedUser.image_url ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  <div>

                    <h2 className="font-bold text-lg">

                      {
                        selectedUser.name
                      }
                    </h2>

                    <p className="text-sm text-green-600">

                      {typing
                        ? "Typing..."
                        : "Online"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">

                  <Phone className="cursor-pointer" />

                  <Video className="cursor-pointer" />
                </div>
              </div>

              {/* BODY */}

              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {messages.map(
                  (msg) => {
                    const mine =
                      msg.sender_id ===
                      ngo.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          mine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-2xl shadow

                          ${
                            mine
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white rounded-bl-none"
                          }
                          `}
                        >

                          {msg.message_type ===
                          "image" ? (
                            <img
                              src={
                                msg.media_url
                              }
                              className="rounded-xl max-w-xs"
                            />
                          ) : (
                            <p className="whitespace-pre-wrap break-words">

                              {
                                msg.message
                              }
                            </p>
                          )}

                          <div className="flex justify-end items-center gap-1 mt-2 text-[11px] opacity-70">

                            {new Date(
                              msg.created_at
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",

                                minute:
                                  "2-digit",
                              }
                            )}

                            {mine &&
                              (msg.read_status ? (
                                <CheckCheck size={14} />
                              ) : (
                                <Check size={14} />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                <div
                  ref={
                    messagesEndRef
                  }
                />
              </div>

              {/* INPUT */}

              <div className="bg-white border-t p-4 flex items-center gap-3">

                <Smile className="text-gray-500 cursor-pointer" />

                <input
                  type="file"
                  hidden
                  id="ngoImageUpload"
                  accept="image/*"
                  onChange={
                    uploadImage
                  }
                />

                <label htmlFor="ngoImageUpload">

                  <ImageIcon className="text-gray-500 cursor-pointer" />
                </label>

                <input
                  value={newMsg}
                  onChange={(e) =>
                    handleTyping(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>
                    e.key ===
                      "Enter" &&
                    handleSend()
                  }
                  placeholder="Type message..."
                  className="flex-1 border rounded-full px-5 py-3"
                />

                <button
                  onClick={
                    handleSend
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
                >

                  <Send size={20} />
                </button>
              </div>

              {sendingImage && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm">

                  Uploading image...
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
export default NGOMessages;