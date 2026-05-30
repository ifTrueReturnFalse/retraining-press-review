import { ComponentPropsWithRef, useId } from "react";
import styles from "./TextInputWithLabel.module.css";

interface TextInputWithLabelProps extends ComponentPropsWithRef<"input"> {
  labelText: string;
}

export default function TextInputWithLabel({
  labelText,
  id,
  ref,
  ...props
}: TextInputWithLabelProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={styles.container}>
      <label htmlFor={inputId}>{labelText}</label>
      <input type="text" id={inputId} ref={ref} {...props} />
    </div>
  );
}
