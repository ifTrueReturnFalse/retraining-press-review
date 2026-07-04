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
import { unwrapResult, notifyError } from "@/utils/apiResult";
import { toast } from "sonner";

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

  /**
   * Fetches the list of all available conversation summaries.
   */
  const fetchConversations = async (): Promise<void> => {
    try {
      setIsConversationsLoading(true);
      const result = await getConversationsAction();
      const data = unwrapResult(
        result,
        "Impossible de récupérer les conversations",
      );
      setConversations(data ?? []);
    } catch (error) {
      notifyError(error, "Impossible de récupérer les conversations");
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
    try {
      const result = await getPressReviewsAction(conversationId);
      const data = unwrapResult(
        result,
        "Impossible de récupérer les revues de presse",
      );
      setPressReviews(data);
    } catch (error) {
      notifyError(error, "Impossible de récupérer les revues de presse");
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

      const data = unwrapResult(
        messagesResult,
        "Impossible de charger la conversation",
      );

      setCurrentConversationId(conversationId);
      setMessages(data ?? []);
    } catch (error) {
      notifyError(error, "Impossible de charger la conversation");
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
    const result = await createConversationAction();
    const data = unwrapResult(
      result,
      "Le serveur n'a pas renvoyé de conversation",
    );

    fetchConversations();

    return data.id;
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
      const replyContent = unwrapResult(
        result,
        "Le LLM n'a pas envoyé de réponse",
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: replyContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      notifyError(error, "Erreur lors de l'envoi du message");
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

      const result = await generatePressReviewAction(
        currentConversationId,
        theme,
      );
      const data = unwrapResult(
        result,
        "Erreur lors de la génération de la revue de presse",
      );

      setPressReviews((prev) => [...prev, data]);
      toast.success("Revue de presse générée !");
    } catch (error) {
      notifyError(error, "Erreur lors de la génération de la revue de presse");
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
  };
}
