import { ComponentPropsWithRef } from "react";
import styles from "./BlackButton.module.css";

interface BlackButtonProps extends ComponentPropsWithRef<"button"> {
  buttonText: string;
}

export default function BlackButton({
  buttonText,
  ...props
}: BlackButtonProps) {
  return (
    <button className={styles.button} {...props}>
      {buttonText}
    </button>
  );
}
