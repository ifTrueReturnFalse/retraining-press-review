import MascotIcon from "@/assets/Icons/MascotIcon";
import styles from "./ChatGreetings.module.css";

export default function ChatGreetings() {
  return (
    <div className={styles.container}>
      <span className={styles.mascot}><MascotIcon /></span>

      <h1 className={styles.title}>Assistant Revue de Presse IA</h1>

      <p className={styles.speech}>
        Posez-moi des questions sur l&apos;actualité récente ou demandez-moi de
        générer une revue de presse sur un sujet spécifique.
      </p>

      <div className={styles.examplesContainer}>
        <p>Exemples :</p>

        <ul>
          <li>
            &quot;Quelles sont les dernières nouvelles en politique ?&quot;
          </li>
          <li>&quot;Génère une revue de presse sur la technologie&quot;</li>
          <li>&quot;Résume l&apos;actualité économique de la semaine&quot;</li>
        </ul>
      </div>
    </div>
  );
}
