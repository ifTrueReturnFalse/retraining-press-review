import { ComponentPropsWithoutRef } from "react";
import styles from "./NewConversationButton.module.css";

export default function NewConversationButton({
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button type="button" {...props} className={styles.button}>
      &#10229; Nouvelle discussion
    </button>
  );
}
