"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { loginAction } from "@/actions/auth";

import TextInputWithLabel from "@/components/Inputs/TextInputWithLabel/TextInputWithLabel";
import styles from "./LoginPage.module.css";
import LogoIcon from "@/assets/Icons/LogoIcon";
import BlackButton from "@/components/Buttons/BlackButton/BlackButton";
import { LoginSchema } from "@/schemas/authSchemas";
import { LoginModel } from "@/models/authModel";
import classNames from "classnames";

export default function LoginPage() {
  // Handle the state of the form (0: Email address, 1: Password)
  const [step, setStep] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();

  // React Hook Form
  const {
    register,
    handleSubmit,
    trigger,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginModel>({
    resolver: zodResolver(LoginSchema),
  });

  // Make sure the focus happen after the animation
  useEffect(() => {
    // Using a timeout to keep animation working with the auto focus
    const timeoutId = setTimeout(() => {
      if (step === 0) {
        setFocus("email");
      } else if (step === 1) {
        setFocus("password");
      }
    }, 300); // 300ms, slighty longer than the translation

    return () => clearTimeout(timeoutId);
  }, [step, setFocus]);

  /**
   * Handles the primary button action.
   * If on the first step, validates the email before proceeding to the password step.
   * @param event - The mouse event from the button click.
   */
  const handleAction = async (event: React.MouseEvent) => {
    if (step === 0) {
      event.preventDefault();
      const isEmailValid = await trigger("email");
      if (isEmailValid) {
        setStep(1);
      }
    }
  };

  /**
   * Final form submission handler.
   * @param data - The validated login credentials (email and password).
   */
  const onSubmit = async (data: LoginModel) => {
    setGlobalError(null);

    const result = await loginAction(data);

    if (result.success) {
      router.push("/app");
    } else {
      setGlobalError(result.error || "Une erreur est survenue");
      setStep(0);
    }
  };

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
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
              {...register("email")}
            />

            <div
              className={classNames(styles.errorWrapper, {
                [styles.errorVisible]: errors.email?.message && step === 0,
              })}
            >
              <p className={styles.error}>{errors.email?.message}</p>
            </div>
          </div>

          <div className={styles.sliderChildren}>
            <TextInputWithLabel
              labelText="Mot de passe"
              placeholder="Votre mot de passe"
              type="password"
              {...register("password")}
            />

            <div
              className={classNames(styles.errorWrapper, {
                [styles.errorVisible]: errors.password?.message && step === 1,
              })}
            >
              <p className={styles.error}>{errors.password?.message}</p>
            </div>

            <div
              className={classNames(styles.buttonWrapper, {
                [styles.buttonHidden]: step !== 1,
              })}
            >
              <BlackButton
                buttonText="Modifier email"
                type="button"
                className={styles.buttonContent}
                onClick={() => setStep(0)}
              />
            </div>
          </div>
        </div>
      </div>

      <BlackButton
        buttonText={isSubmitting ? "Connexion..." : "Se connecter"}
        onClick={handleAction}
        disabled={isSubmitting}
        type="submit"
      />

      <div
        className={classNames(styles.errorWrapper, {
          [styles.errorVisible]: globalError !== null,
        })}
      >
        <p className={styles.error}>{globalError}</p>
      </div>
    </form>
  );
}
