import { ConversationSummary } from "@/models/chatModel";
import styles from "./ChatListItem.module.css";
import { ComponentPropsWithoutRef } from "react";

interface ChatListItemProps extends ComponentPropsWithoutRef<"button"> {
  conversation: ConversationSummary;
}

export default function ChatListItem({
  conversation,
  ...props
}: ChatListItemProps) {
  return (
    <button className={styles.container} type="button" {...props}>
      <span className={styles.title}>Discussion du</span>
      <span className={styles.date}>
        {new Date(conversation.created_at).toLocaleDateString()}
      </span>
    </button>
  );
}
