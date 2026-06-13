import styles from "./ChatMessage.module.css";
import classNames from "classnames";
import { Message } from "@/models/chatModel";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import UserIcon from "@/assets/Icons/UserIcon";
import MascotIcon from "@/assets/Icons/MascotIcon";

export default function ChatMessage({ message }: { message: Message }) {
  return (
    <div
      className={classNames(styles.container, {
        [styles.assistantMessage]: message.role === "assistant",
        [styles.userMessage]: message.role === "user",
      })}
    >
      <div className={styles.icon}>
        {message.role === "user" ? <UserIcon /> : <MascotIcon />}
      </div>

      <div className={styles.messageContainer}>
        <div className={styles.markdown}>
          <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
        </div>

        <p className={styles.time}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
