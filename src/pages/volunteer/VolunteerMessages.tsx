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
  Loader2,
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

const VolunteerMessages = () => {
  const volunteer = JSON.parse(
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

  const [search, setSearch] =
    useState("");

  const [typing, setTyping] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [sendingImage, setSendingImage] =
    useState(false);

  const navigate = useNavigate();

  const endRef =
    useRef<HTMLDivElement | null>(null);

  let typingTimeout: any = null;

  /* =========================================================
     ONLINE STATUS
  ========================================================= */

  useEffect(() => {
    if (!volunteer?.id) return;

    updatePresence(
      volunteer.id,
      "volunteer",
      true
    );

    const offline = () => {
      updatePresence(
        volunteer.id,
        "volunteer",
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
     LOAD USERS
  ========================================================= */

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    let finalUsers: any[] = [];

    /* =========================================================
       JOINED NGOs
    ========================================================= */

    const {
      data: joinedNgoRows,
    } = await supabase
      .from("ngo_volunteers")
      .select(`
        ngo_id
      `)
      .eq(
        "volunteer_id",
        volunteer.id
      );

    const ngoIds =
      joinedNgoRows?.map(
        (n) => n.ngo_id
      ) || [];

    if (ngoIds.length > 0) {
      const { data: ngos } =
        await supabase
          .from("ngos")
          .select(`
            id,
            name,
            image_url
          `)
          .in(
            "id",
            ngoIds
          );

      finalUsers.push(
        ...(ngos || []).map(
          (ngo) => ({
            ...ngo,
            role: "ngo",
          })
        )
      );
    }

    /* =========================================================
       ASSIGNED DONORS
    ========================================================= */

    const {
      data: assignedDonations,
    } = await supabase
      .from("donations")
      .select(`
        donor_id
      `)
      .eq(
        "assigned_volunteer",
        volunteer.id
      );

    const donorIds = [
      ...new Set(
        assignedDonations?.map(
          (d) => d.donor_id
        ) || []
      ),
    ];

    if (donorIds.length > 0) {
      const { data: donors } =
        await supabase
          .from("donors")
          .select(`
            id,
            name,
            image_url
          `)
          .in(
            "id",
            donorIds
          );

      finalUsers.push(
        ...(donors || []).map(
          (donor) => ({
            ...donor,
            role: "donor",
          })
        )
      );
    }

    /* =========================================================
       REMOVE DUPLICATES
    ========================================================= */

    const uniqueUsers =
      finalUsers.filter(
        (
          item,
          index,
          self
        ) =>
          index ===
          self.findIndex(
            (u) =>
              u.id === item.id &&
              u.role ===
                item.role
          )
      );

    /* =========================================================
       CREATE CONVERSATIONS
    ========================================================= */

    const usersWithConversations =
      await Promise.all(
        uniqueUsers.map(
          async (user) => {
            const conversationId =
              await getOrCreateConversation(
                volunteer.id,
                "volunteer",
                user.id,
                user.role
              );

            return {
              ...user,
              conversationId,
            };
          }
        )
      );

    setUsers(
      usersWithConversations
    );

    setFilteredUsers(
      usersWithConversations
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
            msg.sender_id !==
            volunteer.id
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
        volunteer.id,
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
      volunteer.id
    );
  }

  /* =========================================================
     SCROLL
  ========================================================= */

  const scrollBottom = () =>
    setTimeout(() => {
      endRef.current?.scrollIntoView(
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

    setConversationId(
      user.conversationId
    );
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
      volunteer.id,
      "volunteer",
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
      volunteer.id,
      selectedUser.id,
      true
    );

    clearTimeout(
      typingTimeout
    );

    typingTimeout =
      setTimeout(() => {
        sendTypingStatus(
          volunteer.id,
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
      volunteer.id,
      "volunteer",
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
    if (!search.trim()) {
      setFilteredUsers(users);

      return;
    }

    setFilteredUsers(
      users.filter((u) =>
        u.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )
    );
  }, [search, users]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-100">

        <div className="flex items-center gap-3 text-blue-700 font-bold text-xl">

          <Loader2 className="animate-spin" />

          Loading chats...
        </div>
      </div>
    );
  }

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

          Volunteer Messages
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
                placeholder="Search chats..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl pl-10 pr-4 py-3"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">

            {filteredUsers.length ===
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

              Select chat
            </div>
          ) : (
            <>
              {/* HEADER */}

              <div className="bg-white px-6 py-4 border-b">

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
              </div>

              {/* MESSAGES */}

              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {messages.map(
                  (msg) => {
                    const mine =
                      msg.sender_id ===
                      volunteer.id;

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

                            {
  new Date(
    msg.created_at
  ).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  )
}
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

                <div ref={endRef} />
              </div>

              {/* INPUT */}

              <div className="bg-white border-t p-4 flex items-center gap-3">

                <Smile className="text-gray-500 cursor-pointer" />

                <input
                  type="file"
                  hidden
                  id="volunteerImageUpload"
                  accept="image/*"
                  onChange={
                    uploadImage
                  }
                />

                <label htmlFor="volunteerImageUpload">

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

export default VolunteerMessages;