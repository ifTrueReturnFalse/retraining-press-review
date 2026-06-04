"use client";

import styles from "./HomePage.module.css";
import { logoutAction } from "@/actions/auth";
import LogoIcon from "@/assets/Icons/LogoIcon";
import BlackButton from "@/components/Buttons/BlackButton/BlackButton";

export default function HomePage() {
  return (
    <div className={styles.gridContainer}>
      <div className={styles.hLeft}>
        <LogoIcon />
      </div>
      <header className={styles.hRight}>Menu interactif</header>

      <aside className={styles.mLeft}>Toutes les discussions</aside>
      <main className={styles.rRight}>La discussion en cours</main>

      <div className={styles.lLeft}>
        <BlackButton
          buttonText="Se déconnecter"
          type="button"
          onClick={async () => await logoutAction()}
        />
      </div>
      <div className={styles.lRight}>Input pour chatter</div>
    </div>
  );
}
