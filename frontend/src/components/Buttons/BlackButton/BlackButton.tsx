import { ComponentPropsWithRef } from "react";
import styles from "./BlackButton.module.css";
import classNames from "classnames";

interface BlackButtonProps extends ComponentPropsWithRef<"button"> {
  buttonText: string;
}

export default function BlackButton({
  buttonText,
  className,
  ...props
}: BlackButtonProps) {
  return (
    <button className={classNames(styles.button, className)} {...props}>
      {buttonText}
    </button>
  );
}
