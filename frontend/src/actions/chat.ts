"use server";

import {
  Message,
  Conversation,
  GetAllConversationsResponse,
  ConversationSummary,
} from "@/models/chatModel";
import {
  GetAllConversationsResponseSchema,
  // ConversationResponseSchema, // Not used, RawConversationResponseSchema is used instead
  RawConversationResponseSchema,
} from "@/schemas/chatSchema";
import { serverFetch } from "@/services/serverApi";
import { parseHistory } from "@/utils/parseHistory";
import { z } from "zod";

/**
 * Server action to create a new conversation.
 * It sends a POST request to the backend API to create a new conversation record.
 * The response is validated using `RawConversationResponseSchema` and the history is parsed.
 *
 * @returns A promise resolving to an object indicating success or failure. If successful, it contains the newly created `Conversation` object.
 */
export async function createConversationAction(): Promise<
  { success: true; data: Conversation } | { success: false; message: string }
> {
  try {
    const rawData = await serverFetch("/conversations", { method: "POST" });

    const parsedResponse = RawConversationResponseSchema.safeParse(rawData);

    if (!parsedResponse.success) {
      console.error(
        "Erreur de validation de l'API : ",
        z.treeifyError(parsedResponse.error),
      );
      return {
        success: false,
        message: "Erreur de communication avec le serveur",
      };
    }

    const apiData = parsedResponse.data;

    if (!apiData.success || !apiData.data) {
      return {
        success: false,
        message:
          apiData.message || "Echec lors de la création de la discussion",
      };
    }

    return {
      success: true,
      data: {
        ...apiData.data,
        history_json: parseHistory(apiData.data.history_json),
      },
    };
  } catch (error) {
    console.error("Crash lors de la création d'une discussion", error);
    return {
      success: false,
      message: "Echec lors de la création de la discussion",
    };
  }
}

/**
 * Server action to retrieve all conversation summaries for the current user.
 * It fetches data from the backend API and validates the response using `GetAllConversationsResponseSchema`.
 *
 * @returns A promise resolving to an object indicating success or failure. If successful, it contains an array of `ConversationSummary` objects.
 */
export async function getConversationsAction(): Promise<
  | { success: true; data: ConversationSummary[] }
  | { success: false; message: string }
> {
  try {
    // Fetch the list of conversations from the backend
    const rawData = await serverFetch<GetAllConversationsResponse>(
      "/conversations",
      { method: "GET" },
    );

    const parsedResponse = GetAllConversationsResponseSchema.safeParse(rawData);

    if (!parsedResponse.success) {
      console.error(
        "Erreur de validation de l'API",
        z.treeifyError(parsedResponse.error),
      );
      return {
        success: false,
        message: "Erreur de communication avec le serveur",
      };
    }

    const apiData = parsedResponse.data;

    if (!apiData?.success || !apiData.data) {
      return {
        success: false,
        message: apiData?.message || "Aucune conversation",
      };
    }

    return { success: true, data: apiData.data };
  } catch (error) {
    console.error("Erreur chargement conversations : ", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des conversations",
    };
  }
}

/**
 * Server action to retrieve all messages for a specific conversation.
 * It fetches data from the backend API using the conversation ID and validates the response.
 * The raw history string from the API is parsed into a `Message` array.
 *
 * @param conversationId The ID of the conversation to retrieve messages from.
 * @returns A promise resolving to an object indicating success or failure. If successful, it contains an array of `Message` objects.
 */
export async function getConversationMessagesAction(
  conversationId: number,
): Promise<
  { success: true; data: Message[] } | { success: false; message: string }
> {
  try {
    const rawData = await serverFetch(`/conversations/${conversationId}`);

    const parsedResponse = RawConversationResponseSchema.safeParse(rawData);

    if (!parsedResponse.success) {
      console.error(
        "Erreur de validation de l'API : ",
        z.treeifyError(parsedResponse.error),
      );
      return {
        success: false,
        message: "Erreur de communication avec le serveur",
      };
    }

    const apiData = parsedResponse.data;

    if (!apiData.success || !apiData.data) {
      return { success: false, message: "Conversation introuvable" };
    }

    return {
      success: true,
      data: parseHistory(apiData.data.history_json),
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erreur serveur" };
  }
}

/**
 * Server action to send a message within a specific conversation.
 * It sends a POST request to the backend API with the message content.
 * The response, which typically contains the AI's reply, is validated and returned.
 *
 * @param conversationId The ID of the conversation to send the message to.
 * @param message The content of the message to send.
 * @returns A promise resolving to an object indicating success or failure. If successful, it contains the AI's response message as a string.
 */
export async function sendMessageAction(
  conversationId: number,
  message: string,
): Promise<
  { success: true; data: string } | { success: false; message: string }
> {
  try {
    const rawData = await serverFetch(
      `/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ message: message }),
      },
    );

    const parsedResponse = RawConversationResponseSchema.safeParse(rawData);

    if (!parsedResponse.success) {
      console.error(
        "Erreur de validation de l'API : ",
        z.treeifyError(parsedResponse.error),
      );
      return {
        success: false,
        message: "Erreur de communication avec le serveur",
      };
    }

    const apiData = parsedResponse.data;

    if (!apiData.success || !apiData.message) {
      return { success: false, message: "Pas de réponse du serveur" };
    }

    return { success: true, data: apiData.message };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erreur serveur" };
  }
}
