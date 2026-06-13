import { Conversation, ConversationResponse } from "@/models/chatModel";
import { serverFetch } from "@/services/serverApi";

/**
 * Server action to initialize a new chat conversation.
 * It calls the backend API to persist a new conversation record.
 *
 * @returns A promise resolving to a success object with the new Conversation
 *          or a failure object with an error message.
 */
export async function createConversationAction(): Promise<
  { success: true; data: Conversation } | { success: false; message: string }
> {
  try {
    // Perform an authenticated POST request to the backend /conversations endpoint
    const data = await serverFetch<ConversationResponse>("/conversations", {
      method: "POST",
    });

    // Validate the API response structure and success flag
    if (!data.success || !data.data) {
      return {
        success: false,
        message: data.message || "Echec lors de la création de la discussion",
      };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Crash lors de la création d'une discussion", error);
    return {
      success: false,
      message: "Echec lors de la création de la discussion",
    };
  }
}
