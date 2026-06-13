"use client";

import ChatIcon from "@/assets/Icons/ChatIcon";
import styles from "./ChatLayout.module.css";
import { logoutAction } from "@/actions/auth";
import LogoIcon from "@/assets/Icons/LogoIcon";
import IconButton from "@/components/Buttons/IconButton/IconButton";
import DocIcon from "@/assets/Icons/DocIcon";
import { IconColoringMethod } from "@/components/Buttons/IconButton/IconButton";
import LogoutButton from "@/components/Buttons/LogoutButton/LogoutButton";
import ChatGreetings from "@/components/ChatGreetings/ChatGreetings";
import ChatListItem from "@/components/ChatListItem/ChatListItem";
import TextInputChat from "@/components/Inputs/TextInputChat/TextInputChat";
import SendButton from "@/components/Buttons/SendButton/SendButton";
import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { RawConversationResponse } from "@/models/chatModel";
import { parseHistory } from "@/utils/parseHistory";
import { clientFetch } from "@/services/clientApi";

export default function ChatLayout({
  conversationId,
}: {
  conversationId?: number;
}) {
  const [chatInput, setChatInput] = useState("");
  const { messages, setMessages, sendMessage, isLoading } =
    useChat(conversationId);

  const handleConversation = async () => {
    setChatInput("");
    sendMessage(chatInput);
  };

  useEffect(() => {
    if (!conversationId) return;
    if (messages.length > 0) return;

    const loadHistory = async () => {
      const data = await clientFetch<RawConversationResponse>(
        `/chat/${conversationId}`,
        {
          method: "GET",
        },
      );

      if (!data.data) return;

      setMessages(parseHistory(data.data?.history_json));
    };

    loadHistory();
  }, [conversationId]);

  return (
    <div className={styles.gridContainer}>
      {/* Up row */}
      <div className={styles.hLeft}>
        <LogoIcon />
      </div>

      <header className={styles.hRight}>
        <IconButton
          icon={<ChatIcon />}
          label="Chat"
          isSelected={true}
          coloringMethod={IconColoringMethod.Stroke}
        />
        <IconButton
          icon={<DocIcon />}
          label="Revue de presse"
          isSelected={false}
          coloringMethod={IconColoringMethod.Fill}
        />
      </header>

      {/* Mid row */}

      <aside className={styles.mLeft}>
        <ChatListItem date={new Date()} />
        <ChatListItem date={new Date()} />
        <ChatListItem date={new Date()} />
      </aside>

      <main className={styles.mRight}>
        {!conversationId && <ChatGreetings />}
        {conversationId && (
          <>
            {messages.map((message, index) => (
              <p key={index}>
                {message.role} : {message.content}
              </p>
            ))}
          </>
        )}
      </main>

      {/* Bottom row */}

      <div className={styles.lLeft}>
        <LogoutButton onClick={async () => await logoutAction()} />
      </div>

      <div className={styles.lRight}>
        <TextInputChat
          value={chatInput}
          onChange={setChatInput}
          onSubmit={handleConversation}
          disabled={isLoading}
        />
        <SendButton onClick={handleConversation} type="button" />
      </div>
    </div>
  );
}
