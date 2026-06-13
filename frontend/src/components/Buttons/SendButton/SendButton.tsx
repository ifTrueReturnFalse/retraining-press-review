import SendIcon from "@/assets/Icons/SendIcon";
import styles from "./SendButton.module.css";
import { ComponentPropsWithoutRef } from "react";

export default function SendButton({
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button className={styles.button} type="button" {...props}>
      <SendIcon />
    </button>
  );
}
