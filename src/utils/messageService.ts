import { supabase } from "@/integrations/supabase/client";

/* ---------------------------------------------------
   1️⃣ Fetch chat messages between two users
---------------------------------------------------- */
export const getChatMessages = async (userId: string, otherId: string) => {
  return await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherId}),
       and(sender_id.eq.${otherId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });
};

/* ---------------------------------------------------
   2️⃣ Send message (supports: text, image, audio, file)
---------------------------------------------------- */
export const sendMessage = async (
  sender_id: string,
  sender_role: "donor" | "ngo" | "volunteer",
  receiver_id: string,
  receiver_role: "donor" | "ngo" | "volunteer",
  message: string,
  message_type: "text" | "image" | "audio" | "file" | "emoji" | "system" = "text",
  media_url?: string
) => {
  return await supabase.from("messages").insert({
    sender_id,
    sender_role,
    receiver_id,
    receiver_role,
    message,
    media_url: media_url || null,
    message_type,
    read_status: false,
  });
};

/* ---------------------------------------------------
   3️⃣ Real-time subscription
---------------------------------------------------- */
export const subscribeToMessages = (
  userId: string,
  otherId: string,
  callback: (msg: any) => void
) => {
  return supabase
    .channel(`chat-${userId}-${otherId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const msg = payload.new;

        if (
          (msg.sender_id === userId && msg.receiver_id === otherId) ||
          (msg.sender_id === otherId && msg.receiver_id === userId)
        ) {
          callback(msg);
        }
      }
    )
    .subscribe();
};

/* ---------------------------------------------------
   4️⃣ Get chat inbox list
---------------------------------------------------- */
export const getUserChatList = async (userId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const map = new Map();

  data.forEach((msg) => {
    const otherUser =
      msg.sender_id === userId ? msg.receiver_id : msg.sender_id;

    if (!map.has(otherUser)) {
      map.set(otherUser, msg);
    }
  });

  return Array.from(map.values());
};

/* ---------------------------------------------------
   5️⃣ Mark as read
---------------------------------------------------- */
export const markMessagesAsRead = async (userId: string, otherId: string) => {
  return await supabase
    .from("messages")
    .update({ read_status: true })
    .eq("receiver_id", userId)
    .eq("sender_id", otherId)
    .eq("read_status", false);
};

/* ---------------------------------------------------
   6️⃣ Typing indicator
---------------------------------------------------- */
export const sendTypingStatus = async (
  sender_id: string,
  receiver_id: string,
  isTyping: boolean
) => {
  return await supabase.channel("typing-status").send({
    type: "broadcast",
    event: "typing",
    payload: {
      sender_id,
      receiver_id,
      typing: isTyping,
    },
  });
};

/* ---------------------------------------------------
   7️⃣ Subscribe to typing
---------------------------------------------------- */
export const subscribeToTyping = (
  userId: string,
  callback: (data: any) => void
) => {
  return supabase
    .channel("typing-status")
    .on("broadcast", { event: "typing" }, (payload) => {
      if (payload.payload.receiver_id === userId) {
        callback(payload.payload);
      }
    })
    .subscribe();
};

/* ---------------------------------------------------
   8️⃣ Online / Offline Presence
---------------------------------------------------- */
export const broadcastOnline = async (userId: string) => {
  return await supabase.channel("presence").track({
    id: userId,
    online: true,
    last_active: new Date().toISOString(),
  });
};

export const subscribeToOnlineStatus = (
  callback: (users: any[]) => void
) => {
  const channel = supabase.channel("presence", {
    config: {
      presence: { key: Math.random().toString() },
    },
  });

  return channel
    .on("presence", { event: "sync" }, () => {
      callback(channel.presenceState());
    })
    .subscribe();
};
