import styles from "./TextInputChat.module.css";

export default function TextInputChat() {
  return <textarea className={styles.input} placeholder="Tapez votre message ici..." />;
}
