import { supabase } from "@/integrations/supabase/client";

export async function getOrCreateConversation(
  user1: string,
  role1: string,
  user2: string,
  role2: string
) {
  // Find all conversations for user1
  const { data: existing } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user1);

  if (existing?.length) {
    for (const convo of existing) {
      const { data: participants } =
        await supabase
          .from(
            "conversation_participants"
          )
          .select("*")
          .eq(
            "conversation_id",
            convo.conversation_id
          );

      const hasUser1 =
        participants?.some(
          (p) =>
            p.user_id === user1
        );

      const hasUser2 =
        participants?.some(
          (p) =>
            p.user_id === user2
        );

      if (hasUser1 && hasUser2) {
        return convo.conversation_id;
      }
    }
  }

  // Create new conversation
  const { data: newConversation } =
    await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();

  if (!newConversation)
    return null;

  // Add both users
  await supabase
    .from(
      "conversation_participants"
    )
    .insert([
      {
        conversation_id:
          newConversation.id,

        user_id: user1,

        role: role1,
      },

      {
        conversation_id:
          newConversation.id,

        user_id: user2,

        role: role2,
      },
    ]);

  return newConversation.id;
}