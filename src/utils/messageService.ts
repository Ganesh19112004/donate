import { supabase } from "@/integrations/supabase/client";

/* =====================================================
   SEND MESSAGE
===================================================== */

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderRole: string,
  message: string,
  messageType = "text",
  mediaUrl = ""
) {
  return await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,

      sender_id: senderId,

      sender_role: senderRole,

      message,

      message_type: messageType,

      media_url: mediaUrl,
    });
}

/* =====================================================
   GET CHAT MESSAGES
===================================================== */

export async function getChatMessages(
  conversationId: string
) {
  return await supabase
    .from("messages")
    .select("*")
    .eq(
      "conversation_id",
      conversationId
    )
    .order("created_at", {
      ascending: true,
    });
}

/* =====================================================
   REALTIME SUBSCRIBE
===================================================== */

export function subscribeToMessages(
  conversationId: string,
  callback: any
) {
  return supabase
    .channel(
      `chat-${conversationId}`
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",

        schema: "public",

        table: "messages",
      },
      (payload) => {
        const msg: any = payload.new;

        if (
          msg.conversation_id ===
          conversationId
        ) {
          callback(msg);
        }
      }
    )
    .subscribe();
}

/* =====================================================
   MARK AS READ
===================================================== */

export async function markMessagesAsRead(
  conversationId: string,
  currentUser: string
) {
  return await supabase
    .from("messages")
    .update({
      read_status: true,
    })
    .eq(
      "conversation_id",
      conversationId
    )
    .neq("sender_id", currentUser)
    .eq("read_status", false);
}

/* =====================================================
   USER CHAT LIST
===================================================== */

export async function getUserChatList(
  userId: string
) {
  const { data } = await supabase
    .from(
      "conversation_participants"
    )
    .select(`
      conversation_id,
      conversations (
        id,
        updated_at
      )
    `)
    .eq("user_id", userId);

  return data || [];
}

/* =====================================================
   TYPING STATUS
===================================================== */

export async function sendTypingStatus(
  senderId: string,
  receiverId: string,
  typing: boolean
) {
  return await supabase
    .from("typing_status")
    .upsert({
      sender_id: senderId,

      receiver_id: receiverId,

      typing,

      updated_at: new Date(),
    });
}

export function subscribeToTyping(
  currentUser: string,
  callback: any
) {
  return supabase
    .channel(
      `typing-${currentUser}`
    )
    .on(
      "postgres_changes",
      {
        event: "*",

        schema: "public",

        table: "typing_status",
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}

/* =====================================================
   ONLINE PRESENCE
===================================================== */

export async function updatePresence(
  userId: string,
  role: string,
  online: boolean
) {
  return await supabase
    .from("user_presence")
    .upsert({
      user_id: userId,

      role,

      online,

      last_seen: new Date(),
    });
}

export function subscribeToPresence(
  callback: any
) {
  return supabase
    .channel("presence-system")
    .on(
      "postgres_changes",
      {
        event: "*",

        schema: "public",

        table: "user_presence",
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}