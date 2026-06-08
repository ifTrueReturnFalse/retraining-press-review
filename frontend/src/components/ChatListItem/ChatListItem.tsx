import styles from "./ChatListItem.module.css";

export default function ChatListItem({ date }: { date: Date }) {
  return (
    <div className={styles.container}>
      <span className={styles.title}>Discussion du</span>
      <span className={styles.date}>{date.toLocaleDateString()}</span>
    </div>
  );
}
