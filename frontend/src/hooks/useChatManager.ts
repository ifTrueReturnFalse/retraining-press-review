import {
  getConversationsAction,
  getConversationMessagesAction,
  createConversationAction,
  sendMessageAction,
} from "@/actions/chat";
import { ConversationSummary, Message } from "@/models/chatModel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useChatManager(initialConversationId?: number) {
  const [currentConversationId, setCurrentConversationId] = useState<
    number | undefined
  >(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const router = useRouter();

  const fetchConversations = async () => {
    const result = await getConversationsAction();
    if (result.success) setConversations(result.data ?? []);
  };

  const loadConversation = async (conversationId: number) => {
    try {
      setIsLoading(true);
      const result = await getConversationMessagesAction(conversationId);

      if (result.success) {
        setCurrentConversationId(conversationId);
        setMessages(result.data ?? []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = async (conversationId: number) => {
    setMessages([]);
    await loadConversation(conversationId);
  };

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);

      const userMessage: Message = {
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      let convId = currentConversationId;

      if (!convId) {
        const data = await createConversationAction();

        if (!data.success) throw new Error(data.message);

        convId = data.data.id;
        router.replace(`/?conversation=${convId}`);
        setCurrentConversationId(convId);
      }

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
  };
}
