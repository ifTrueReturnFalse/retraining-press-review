import DocIcon from "@/assets/Icons/DocIcon";
import styles from "./GenerateReviewButton.module.css";
import { ComponentPropsWithoutRef } from "react";

export default function GenerateReviewButton({
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button type="button" className={styles.button} {...props}>
      <DocIcon />
      <p>Générer une revue de presse</p>
    </button>
  );
}
