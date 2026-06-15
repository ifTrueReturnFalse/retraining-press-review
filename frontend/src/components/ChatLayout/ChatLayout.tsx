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
import { useState, useEffect, useRef } from "react";
import ChatMessage from "../ChatMessage/ChatMessage";
import { useChatManager } from "@/hooks/useChatManager";

export default function ChatLayout({
  conversationId,
}: {
  conversationId?: number;
}) {
  const [chatInput, setChatInput] = useState("");
  const {
    messages,
    conversations,
    sendMessage,
    isLoading,
    selectConversation,
    currentConversationId,
  } = useChatManager(conversationId);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const handleConversation = async () => {
    try {
      setChatInput("");
      sendMessage(chatInput);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setTimeout(
      () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      300,
    );
  }, [messages]);

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
        {conversations.map((conversation, index) => (
          <ChatListItem
            key={index}
            conversation={conversation}
            onClick={() => selectConversation(conversation.id)}
          />
        ))}
      </aside>

      <main className={styles.mRight}>
        {!currentConversationId && <ChatGreetings />}
        {currentConversationId && (
          <div className={styles.messageContainer}>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messageEndRef} />
          </div>
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
