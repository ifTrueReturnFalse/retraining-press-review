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
import { useChatManager, chatModeType } from "@/hooks/useChatManager";
import NewConversationButton from "../Buttons/NewConversationButton/NewConversationButton";
import classNames from "classnames";
import GenerateReviewButton from "../Buttons/GenerateReviewButton/GenerateReviewButton";
import PressReview from "../PressReview/PressReview";
import TextInputWithLabel from "../Inputs/TextInputWithLabel/TextInputWithLabel";
import BlackButton from "../Buttons/BlackButton/BlackButton";

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
    newChat,
    chatMode,
    setMode,
    isModalOpen,
    setIsModalOpen,
    reviewTheme,
    setReviewTheme,
    pressReviews,
  } = useChatManager(conversationId);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleConversation = async () => {
    try {
      setChatInput("");
      sendMessage(chatInput);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChatMode = (mode: chatModeType) => {
    if (mode === chatMode) return;
    setMode(mode);
    if (mode === "chat") {
      setTimeout(
        () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        300,
      );
    }
  };

  useEffect(() => {
    setTimeout(
      () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      300,
    );
  }, [messages]);

  useEffect(() => {
    if (isModalOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
    setReviewTheme("");
  }, [isModalOpen]);

  return (
    <div className={styles.gridContainer}>
      <dialog
        ref={dialogRef}
        className={styles.modal}
        onClose={() => setIsModalOpen(false)}
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className={styles.modalCloseButton}
        >
          Fermer
        </button>

        <div className={styles.modalGreet}>
          <h2>Générer une revue de presse</h2>
          <p>Donner un thème à votre revue de presse</p>
        </div>

        <div className={styles.modalActions}>
          <TextInputWithLabel
            labelText="Thème de la revue de presse"
            value={reviewTheme}
            onChange={(e) => setReviewTheme(e.target.value)}
          />
          <BlackButton buttonText="Générer" />
        </div>
      </dialog>

      {/* Up row */}
      <div className={styles.hLeft}>
        <LogoIcon />
      </div>

      <header className={styles.hRight}>
        <div
          className={classNames(
            styles.buttonWrapper,
            styles.newConversationWrapper,
            {
              [styles.hidden]: currentConversationId === undefined,
            },
          )}
        >
          <NewConversationButton onClick={() => newChat()} />
        </div>
        <div className={styles.controlButtonContainer}>
          <IconButton
            icon={<ChatIcon />}
            label="Chat"
            isSelected={chatMode === "chat"}
            onClick={() => handleChatMode("chat")}
            coloringMethod={IconColoringMethod.Stroke}
          />
          <IconButton
            icon={<DocIcon />}
            label="Revue de presse"
            isSelected={chatMode === "review"}
            disabled={!currentConversationId}
            onClick={() => handleChatMode("review")}
            coloringMethod={IconColoringMethod.Fill}
          />
        </div>
        <div
          className={classNames(styles.buttonWrapper, {
            [styles.hidden]: currentConversationId === undefined,
          })}
        >
          <GenerateReviewButton onClick={() => setIsModalOpen(true)} />
        </div>
      </header>

      {/* Mid row */}

      <aside className={styles.mLeft}>
        {[...conversations]
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
          .map((conversation) => (
            <ChatListItem
              key={conversation.id}
              conversation={conversation}
              onClick={() => selectConversation(conversation.id)}
            />
          ))}
      </aside>

      <main className={styles.mRight}>
        {!currentConversationId && <ChatGreetings />}
        {currentConversationId && chatMode === "chat" && (
          <div className={styles.messageContainer}>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messageEndRef} />
          </div>
        )}
        {currentConversationId && chatMode === "review" && (
          <div className={styles.reviewMainContainer}>
            <h1 className={styles.reviewTitle}>Revues de Presse</h1>
            <p className={styles.reviewHint}>
              Consultez et gérez vos revues de presse générées par l&apos;IA
            </p>
            <div className={styles.reviewSubContainer}>
              {pressReviews.map((pressReview) => (
                <PressReview
                  key={pressReview.id}
                  content={pressReview.content}
                  generatedAt={pressReview.created_at.toISOString()}
                  newsType={pressReview.theme}
                />
              ))}
            </div>
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
        <SendButton
          onClick={handleConversation}
          type="button"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
