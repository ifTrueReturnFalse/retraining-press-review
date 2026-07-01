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
  const [isConversationsLoading, setIsConversationsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isLLMResponding, setIsLLMResponding] = useState(false);
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
  const fetchConversations = async (): Promise<void> => {
    try {
      setIsConversationsLoading(true);
      const result = await getConversationsAction();
      if (result.success) setConversations(result.data ?? []);
    } finally {
      setIsConversationsLoading(false);
    }
  };

  /**
   * Fetches press reviews for a given conversation ID.
   * Sets the `pressReviews` state with the fetched data or logs an error.
   *
   * @param conversationId The ID of the conversation to fetch press reviews for.
   * @returns A Promise that resolves when the fetch operation is complete.
   */
  const fetchPressReviews = async (conversationId: number) => {
    const result = await getPressReviewsAction(conversationId);
    if (result.success) {
      setPressReviews(result.data ?? []);
    } else {
      console.error(result.message);
    }
  };

  /**
   * Loads messages and press reviews for a specific conversation ID.
   * Sets `currentConversationId` and `messages` states upon success.
   * Handles loading state and error logging.
   *
   * @param conversationId The ID of the conversation to load.
   * @returns A Promise that resolves when the conversation is loaded.
   * Loads messages for a specific conversation ID.
   */
  const loadConversation = async (conversationId: number) => {
    try {
      setIsMessagesLoading(true);

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
      setIsMessagesLoading(false);
    }
  };

  /**
   * Switches the active conversation to the given `conversationId`.
   * Clears current messages, sets chat mode to "chat", and then loads the new conversation.
   *
   * @param conversationId The ID of the conversation to select.
   * @returns A Promise that resolves once the conversation is selected and loaded.
   * Switches the active conversation and clears the current message view.
   */
  const selectConversation = async (conversationId: number) => {
    setMessages([]);
    setMode("chat");
    await loadConversation(conversationId);
  };

  /**
   * Resets the chat interface to a new, empty chat state.
   * Clears messages, unsets the current conversation ID, and sets the mode to "chat".
   *
   * Reset the UI and messages.
   */
  const newChat = () => {
    setMessages([]);
    setPressReviews([]);
    setCurrentConversationId(undefined);
    setMode("chat");
  };

  /**
   * Creates a new conversation record on the server.
   * Fetches the updated list of conversations after creation.
   *
   * @returns A Promise that resolves with the ID of the newly created conversation.
   * @throws An error if the conversation creation fails or if the server response is invalid.
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
   * If no conversation is active, it first creates a new one.
   * Optimistically adds the user's message to the UI before sending.
   * Appends the AI's response to the messages list upon successful receipt.
   * Handles loading state and error logging.
   *
   * Sends a message to the current conversation.
   * If no conversation exists, it creates one first.
   */
  const sendMessage = async (content: string) => {
    try {
      setIsLLMResponding(true);

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
      setIsLLMResponding(false);
    }
  };

  /**
   * Generates a new press review for the `currentConversationId` with the given `theme`.
   * If the current chat mode is "chat", it switches to "review" mode.
   * Closes the modal and handles loading, success, and error states for press review generation.
   *
   * @param theme The theme or topic for which to generate the press review.
   * @returns A Promise that resolves when the press review generation is complete.
   */
  const generatePressReview = async (theme: string) => {
    if (!currentConversationId) return;

    if (chatMode === "chat") setMode("review");
    setIsModalOpen(false);

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
      setReviewTheme("");
    }
  };

  /**
   * Sets the current chat mode.
   * This function ensures that the mode is only updated if it's different from the current `chatMode`.
   *
   * @param mode The new chat mode to set, either "chat" or "review".
   * @returns void
   */
  const setMode = (mode: chatModeType) => {
    if (mode === chatMode) return;
    setChatMode(mode);
  };

  /**
   * Initial setup to fetch the sidebar list and load the active chat if provided.
   * This function is called once on component mount or when `initialConversationId` changes.
   * It first fetches all conversations and then, if `initialConversationId` is present,
   * loads the messages and press reviews for that specific conversation.
   *
   * @returns A Promise that resolves when the initialization is complete.
   */
  const initializeManager = async () => {
    await fetchConversations();

    if (initialConversationId) {
      await loadConversation(initialConversationId);
    }
  };

  useEffect(() => {
    /**
     * Effect hook to fetch conversations when the component mounts.
     * It calls `fetchConversations` once to populate the sidebar.
     */
    const init = async () => fetchConversations();
    init();
  }, []);

  useEffect(() => {
    if (!initialConversationId) return;
    /**
     * Effect hook to initialize the chat manager when `initialConversationId` changes.
     * This ensures that if a specific conversation ID is provided, the manager
     * loads that conversation's messages and press reviews.
     * It prevents re-initialization if `initialConversationId` is undefined.
     */
    const init = async () => await initializeManager();
    init();
  }, [initialConversationId]);

  return {
    currentConversationId,
    messages,
    isConversationsLoading,
    conversations,
    selectConversation,
    isMessagesLoading,
    sendMessage,
    isLLMResponding,
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
