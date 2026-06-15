"use server";

import {
  Conversation,
  ConversationResponse,
  GetAllConversationsResponse,
  ConversationSummary,
  RawConversationResponse,
} from "@/models/chatModel";
import { serverFetch } from "@/services/serverApi";
import { parseHistory } from "@/utils/parseHistory";

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

/**
 * Server action to retrieve all conversations for the authenticated user.
 *
 * @returns A promise resolving to the API response containing an array of conversation summaries
 *          or an error object if the request fails.
 */
export async function getConversationsAction(): Promise<
  | { success: true; data: ConversationSummary[] }
  | { success: false; message: string }
> {
  try {
    // Fetch the list of conversations from the backend
    const data = await serverFetch<GetAllConversationsResponse>(
      "/conversations",
      { method: "GET" },
    );

    // Check if the API returned a success status and valid data array
    if (!data.success || !data.data)
      return { success: false, message: data.message || "Aucune conversation" };

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Erreur chargement conversations : ", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des conversations",
    };
  }
}

export async function getConversationMessagesAction(conversationId: number) {
  try {
    const data = await serverFetch<RawConversationResponse>(
      `/conversations/${conversationId}`,
    );

    if (!data.success || !data.data) {
      return { success: false, message: "Conversation introuvable" };
    }

    return {
      success: true,
      data: parseHistory(data.data.history_json),
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erreur serveur" };
  }
}

export async function sendMessageAction(
  conversationId: number,
  message: string,
) {
  try {
    const data = await serverFetch<ConversationResponse>(
      `/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ message: message }),
      },
    );

    if (!data.success || !data.message) {
      return { success: false, message: "Pas de réponse du serveur" };
    }

    return { success: true, data: data.message };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erreur serveur" };
  }
}
