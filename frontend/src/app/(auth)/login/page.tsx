import TextInputWithLabel from "@/components/Inputs/TextInputWithLabel/TextInputWithLabel";
import styles from "./LoginPage.module.css";
import LogoIcon from "@/assets/Icons/LogoIcon";
import BlackButton from "@/components/Buttons/BlackButton/BlackButton";

export default function LoginPage() {
  return (
    <form className={styles.loginForm}>
      <LogoIcon />
      <p className={styles.hint}>
        Connectez-vous pour accéder à votre assistant d&apos;actualités IA
      </p>
      <TextInputWithLabel
        labelText="Adresse email"
        placeholder="votre.email@exemple.com"
      />
      <BlackButton buttonText="Se connecter" />
    </form>
  );
}
