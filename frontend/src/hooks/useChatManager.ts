import {
  getConversationsAction,
  getConversationMessagesAction,
  createConversationAction,
  sendMessageAction,
} from "@/actions/chat";
import {
  getPressReviewsAction,
  generatePressReviewAction,
} from "@/actions/pressReviews";
import { ConversationSummary, Message } from "@/models/chatModel";
import { PressReview } from "@/models/pressReviewModel";
import { useEffect, useState } from "react";

export type chatModeType = "chat" | "review";

/**
 * Custom hook to manage chat state, including conversation history,
 * message sending, and conversation selection.
 * @param initialConversationId Optional ID to load a specific conversation on mount.
 */
export function useChatManager(initialConversationId?: number) {
  const [currentConversationId, setCurrentConversationId] = useState<
    number | undefined
  >(initialConversationId);
  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [chatMode, setChatMode] = useState<chatModeType>("chat");
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewTheme, setReviewTheme] = useState("");
  // Reviews
  const [pressReviews, setPressReviews] = useState<PressReview[]>([]);
  const [isPressReviewLoading, setIsPressReviewLoading] = useState(false);
  const [pressReviewError, setPressReviewError] = useState("");

  /**
   * Fetches the list of all available conversation summaries.
   */
  const fetchConversations = async () => {
    const result = await getConversationsAction();
    console.log(result)
    if (result.success) setConversations(result.data ?? []);
  };

  const fetchPressReviews = async (conversationId: number) => {
    const result = await getPressReviewsAction(conversationId);
    if (result.success) {
      setPressReviews(result.data ?? []);
    } else {
      console.error(result.message);
    }
  };

  /**
   * Loads messages for a specific conversation ID.
   */
  const loadConversation = async (conversationId: number) => {
    try {
      setIsLoading(true);

      const [messagesResult] = await Promise.all([
        getConversationMessagesAction(conversationId),
        fetchPressReviews(conversationId),
      ]);

      if (messagesResult.success) {
        setCurrentConversationId(conversationId);
        setMessages(messagesResult.data ?? []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Switches the active conversation and clears the current message view.
   */
  const selectConversation = async (conversationId: number) => {
    setMessages([]);
    setMode("chat");
    await loadConversation(conversationId);
  };

  /**
   * Reset the UI and messages.
   */
  const newChat = () => {
    setMessages([]);
    setCurrentConversationId(undefined);
    setMode("chat");
  };

  /**
   * Triggers the creation of a new conversation on the server.
   */
  const createConversation = async () => {
    const data = await createConversationAction();
    if (!data.success) throw new Error(data.message);
    if (!data.data)
      throw new Error("Le serveur n'a pas renvoyé de conversation");

    fetchConversations();

    return data.data.id;
  };

  /**
   * Sends a message to the current conversation.
   * If no conversation exists, it creates one first.
   */
  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);

      // Optimistically add the user message to the UI
      const userMessage: Message = {
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      let convId = currentConversationId;

      // If this is the first message of a new chat, create the conversation record
      if (!convId) {
        convId = await createConversation();
        setCurrentConversationId(convId);
      }

      // Request the AI response from the server
      const result = await sendMessageAction(convId, content);
      if (!result.success || !result.data) throw new Error(result.message);

      const assistantMessage: Message = {
        role: "assistant",
        content: result.data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePressReview = async (theme: string) => {
    if (!currentConversationId) return;

    if (chatMode === "chat") setChatMode("review");

    try {
      setIsPressReviewLoading(true);
      setPressReviewError("");

      const result = await generatePressReviewAction(
        currentConversationId,
        theme,
      );

      if (!result.success) {
        setPressReviewError(result.message);
        return;
      }

      setPressReviews((prev) => [...prev, result.data]);
    } catch (error) {
      console.error(error);
      setPressReviewError("Erreur lors de la génération de la revue de presse");
    } finally {
      setIsPressReviewLoading(false);
    }
  };

  const setMode = (mode: chatModeType) => {
    if (mode === chatMode) return;
    setChatMode(mode);
  };

  /**
   * Initial setup to fetch the sidebar list and load the active chat if provided.
   */
  const initializeManager = async () => {
    await fetchConversations();

    if (initialConversationId) {
      await loadConversation(initialConversationId);
    }
  };

  useEffect(() => {
    const init = async () => fetchConversations();
    init();
  }, []);

  useEffect(() => {
    if (!initialConversationId) return;
    const init = async () => await initializeManager();
    init();
  }, [initialConversationId]);

  return {
    currentConversationId,
    messages,
    isLoading,
    conversations,
    selectConversation,
    sendMessage,
    newChat,
    chatMode,
    setMode,
    isModalOpen,
    setIsModalOpen,
    reviewTheme,
    setReviewTheme,
    pressReviews,
    generatePressReview,
    isPressReviewLoading,
    pressReviewError,
  };
}
