import styles from "./ConversationSkeleton.module.css";
import BaseSkeleton from "../BaseSkeleton/BaseSkeleton";

export default function ConversationSkeleton() {
  return (
    <div className={styles.skeletonContainer}>
      <BaseSkeleton className={styles.bigSkeleton} />
      <BaseSkeleton className={styles.smallSkeleton} />
    </div>
  );
}
