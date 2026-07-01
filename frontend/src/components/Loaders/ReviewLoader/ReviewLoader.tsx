import LottieLoader from "../LottieLoader/LottieLoader";
import styles from "./ReviewLoader.module.css";

export default function ReviewLoader() {
  return (
    <div className={styles.loaderContainer}>
      <LottieLoader
        src="/animations/writing.json"
        style={{ height: "6rem", width: "6rem" }}
      />
      <p className={styles.hint}>Votre revue est en cours de rédaction. </p>
    </div>
  );
}
