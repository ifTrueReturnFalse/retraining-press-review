import styles from "./MessageSkeleton.module.css";
import BaseSkeleton from "../BaseSkeleton/BaseSkeleton";
import classNames from "classnames";

type MessageSkeletonType = "user" | "assistant";

export default function MessageSkeleton({
  messageSkeletonType,
}: {
  messageSkeletonType: MessageSkeletonType;
}) {
  return (
    <div
      className={classNames(styles.messageSkeletonContainer, {
        [styles.user]: messageSkeletonType === "user",
      })}
    >
      <div className={`skeleton-shimmer ${styles.fakeUser}`}></div>

      <div className={styles.messageSkeleton}>
        <div className={styles.messages}>
          <BaseSkeleton className={`${styles.message} ${styles.message100}`} />
          <BaseSkeleton className={`${styles.message} ${styles.message75}`} />
          <BaseSkeleton className={`${styles.message} ${styles.message50}`} />
        </div>
        <BaseSkeleton className={styles.date} />
      </div>
    </div>
  );
}
