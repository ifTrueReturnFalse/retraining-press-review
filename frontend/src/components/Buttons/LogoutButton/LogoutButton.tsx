import LogoutIcon from "@/assets/Icons/LogoutIcon";
import styles from "./LogoutButton.module.css";
import { ComponentPropsWithoutRef } from "react";

export default function LogoutButton({
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button type="button" {...props} className={styles.button}>
      <span>
        <LogoutIcon />
      </span>
      <span>Se déconnecter</span>
    </button>
  );
}
