import { useEffect, useState, useRef } from "react";

import {
  ArrowLeft,
  MessageCircle,
  Send,
  Check,
  CheckCheck,
  Search,
  Image as ImageIcon,
  Smile,
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

const MessageCenter = () => {
  const donor = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const navigate = useNavigate();

  const endRef =
    useRef<HTMLDivElement | null>(null);

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

  let typingTimeout: any = null;

  /* =========================================================
     ONLINE PRESENCE
  ========================================================= */

  useEffect(() => {
    if (!donor?.id) return;

    updatePresence(
      donor.id,
      "donor",
      true
    );

    const offline = () => {
      updatePresence(
        donor.id,
        "donor",
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
     LOAD NGO + VOLUNTEERS
  ========================================================= */

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    let finalUsers: any[] = [];

    const { data: donations } =
      await supabase
        .from("donations")
        .select(`
          id,
          ngo_id,
          assigned_volunteer
        `)
        .eq(
          "donor_id",
          donor.id
        );

    /* =========================================================
       NGO SECTION
    ========================================================= */

    const ngoIds = [
      ...new Set(
        donations
          ?.filter(
            (d) => d.ngo_id
          )
          .map(
            (d) => d.ngo_id
          ) || []
      ),
    ];

    if (ngoIds.length > 0) {
      const { data: ngos } =
        await supabase
          .from("ngos")
          .select(`
            id,
            name,
            image_url
          `)
          .in("id", ngoIds);

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
       VOLUNTEERS SECTION
    ========================================================= */

    const volunteerIds = [
      ...new Set(
        donations
          ?.filter(
            (d) =>
              d.assigned_volunteer
          )
          .map(
            (d) =>
              d.assigned_volunteer
          ) || []
      ),
    ];

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
          (volunteer) => ({
            ...volunteer,
            role: "volunteer",
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

    const usersWithConversation =
      await Promise.all(
        uniqueUsers.map(
          async (user) => {
            const conversationId =
              await getOrCreateConversation(
                donor.id,
                "donor",
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
      usersWithConversation
    );

    setFilteredUsers(
      usersWithConversation
    );

    setLoading(false);
  }

  /* =========================================================
     LOAD MESSAGES
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
            msg.sender_id !== donor.id
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
        donor.id,
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
      donor.id
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

  async function sendMsg() {
    if (
      !newMsg.trim() ||
      !conversationId
    )
      return;

    await sendMessage(
      conversationId,
      donor.id,
      "donor",
      newMsg.trim()
    );

    setNewMsg("");

    scrollBottom();
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
      donor.id,
      "donor",
      "",
      "image",
      publicUrl
    );

    setSendingImage(false);

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
      donor.id,
      selectedUser.id,
      true
    );

    clearTimeout(
      typingTimeout
    );

    typingTimeout =
      setTimeout(() => {
        sendTypingStatus(
          donor.id,
          selectedUser.id,
          false
        );
      }, 1200);
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
      <div className="min-h-screen flex justify-center items-center">

        <Loader2 className="animate-spin text-blue-600" />
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

          Messages
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

            {filteredUsers
              .sort((a, b) => {
                if (
                  a.role ===
                    "volunteer" &&
                  b.role !==
                    "volunteer"
                )
                  return -1;

                if (
                  a.role !==
                    "volunteer" &&
                  b.role ===
                    "volunteer"
                )
                  return 1;

                return 0;
              })
              .map((user) => (
                <div
                  key={`${user.role}-${user.id}`}
                  onClick={() =>
                    selectUser(user)
                  }
                  className={`cursor-pointer p-3 rounded-2xl border transition relative overflow-hidden

                  ${
                    selectedUser?.id ===
                    user.id
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-blue-50"
                  }
                  `}
                >

                  {user.role ===
                  "volunteer" ? (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold shadow-lg">

                      VOLUNTEER
                    </div>
                  ) : (
                    <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold shadow-lg">

                      NGO
                    </div>
                  )}

                  <div className="flex gap-3 items-center">

                    <img
                      src={
                        user.image_url ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      }
                      className={`w-14 h-14 rounded-full object-cover border-4

                      ${
                        user.role ===
                        "volunteer"
                          ? "border-orange-400"
                          : "border-green-500"
                      }
                      `}
                    />

                    <div>

                      <h2 className="font-bold">

                        {user.name}
                      </h2>

                      <p className="text-xs opacity-70">

                        {user.role ===
                        "volunteer"
                          ? "Assigned Volunteer"
                          : "NGO"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </aside>

        {/* CHAT AREA */}

        <main className="flex-1 flex flex-col bg-[#efeae2]">

          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">

              Select chat
            </div>
          ) : (
            <>
              <div className="bg-white px-6 py-4 border-b">

                <div className="flex items-center gap-4">

                  <img
                    src={
                      selectedUser.image_url ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    className={`w-14 h-14 rounded-full object-cover border-4

                    ${
                      selectedUser.role ===
                      "volunteer"
                        ? "border-orange-400"
                        : "border-green-500"
                    }
                    `}
                  />

                  <div>

                    <div className="flex items-center gap-2">

                      <h2 className="font-bold text-lg">

                        {
                          selectedUser.name
                        }
                      </h2>

                      {selectedUser.role ===
                      "volunteer" ? (
                        <span className="bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">

                          VOLUNTEER
                        </span>
                      ) : (
                        <span className="bg-green-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">

                          NGO
                        </span>
                      )}
                    </div>

                    <p className="text-sm">

                      {typing
                        ? "Typing..."
                        : selectedUser.role ===
                          "volunteer"
                        ? "Assigned Volunteer"
                        : "NGO Support"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {messages.map(
                  (m) => {
                    const mine =
                      m.sender_id ===
                      donor.id;

                    return (
                      <div
                        key={m.id}
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

                          {m.message_type ===
                          "image" ? (
                            <img
                              src={
                                m.media_url
                              }
                              className="rounded-xl max-w-xs"
                            />
                          ) : (
                            <p className="whitespace-pre-wrap break-words">

                              {
                                m.message
                              }
                            </p>
                          )}

                          <div className="flex justify-end items-center gap-1 mt-2 text-[11px] opacity-70">

                            {new Date(
                              m.created_at
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
                              (m.read_status ? (
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

              <div className="bg-white border-t p-4 flex items-center gap-3">

                <Smile className="text-gray-500 cursor-pointer" />

                <input
                  type="file"
                  hidden
                  id="imageUpload"
                  accept="image/*"
                  onChange={
                    uploadImage
                  }
                />

                <label htmlFor="imageUpload">

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
                    sendMsg()
                  }
                  placeholder="Type message..."
                  className="flex-1 border rounded-full px-5 py-3"
                />

                <button
                  onClick={sendMsg}
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

export default MessageCenter;