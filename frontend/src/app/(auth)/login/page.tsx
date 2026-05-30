"use client";

import TextInputWithLabel from "@/components/Inputs/TextInputWithLabel/TextInputWithLabel";
import styles from "./LoginPage.module.css";
import LogoIcon from "@/assets/Icons/LogoIcon";
import BlackButton from "@/components/Buttons/BlackButton/BlackButton";
import { useState } from "react";

export default function LoginPage() {
  const [step, setStep] = useState(0);

  const handleAction = () => {
    if (step === 0) setStep(1);
    else setStep(0);
  };

  return (
    <form className={styles.loginForm}>
      <LogoIcon />
      <p className={styles.hint}>
        Connectez-vous pour accéder à votre assistant d&apos;actualités IA
      </p>

      <div className={styles.sliderWindow}>
        <div
          className={styles.slider}
          style={{
            transform: `translateX(calc(-${step * 50}% - ${step * 1}rem))`,
          }}
        >
          <div className={styles.sliderChildren}>
            <TextInputWithLabel
              labelText="Adresse email"
              placeholder="votre.email@exemple.com"
            />
          </div>

          <div className={styles.sliderChildren}>
            <TextInputWithLabel
              labelText="Mot de passe"
              placeholder="Votre mot de passe"
              type="password"
            />
          </div>
        </div>
      </div>

      <BlackButton
        buttonText="Se connecter"
        onClick={handleAction}
        type="button"
      />
    </form>
  );
}
