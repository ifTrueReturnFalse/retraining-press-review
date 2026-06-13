import { useState } from "react";
import { ConversationResponse, Message } from "@/models/chatModel";
import { createConversationAction } from "@/actions/chat";
import { useRouter, usePathname } from "next/navigation";
import { clientFetch } from "@/services/clientApi";

/**
 * Custom hook to manage chat state and interactions.
 * Handles message history, loading states, and conversation initialization.
 *
 * @param conversationId - Optional ID of an existing conversation.
 */
export function useChat(conversationId?: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Sends a message to the AI assistant.
   * If no conversation exists, it creates one first.
   *
   * @param content - The text content of the user's message.
   */
  const sendMessage = async (content: Message["content"]) => {
    try {
      setIsLoading(true);

      let convId = conversationId;

      // If this is the first message of a new session, initialize the conversation on the server
      if (!convId) {
        const data = await createConversationAction();
        if (!data.success) {
          throw new Error(data.message);
        }
        // Update local ID and sync the URL with the new conversation ID
        convId = data.data.id;
        router.replace(`${pathname}?conversation=${convId}`);
      }

      const userMessage: Message = {
        role: "user",
        content,
        timestamp: new Date(),
      };
      // Optimistic update: show user message immediately
      setMessages((prev) => [...prev, userMessage]);

      // Proxy the request through our Next.js API route to handle authentication headers
      const data = await clientFetch<ConversationResponse>("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: convId,
          message: content,
        }),
      });

      if (!data.message) {
        throw new Error("Pas de message reçu du serveur");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage,
  };
}
