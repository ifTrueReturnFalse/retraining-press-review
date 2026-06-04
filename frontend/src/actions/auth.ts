"use server";

import { LoginModel } from "@/models/authModel";
import { LoginResponseSchema } from "@/schemas/authSchemas";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

/**
 * Authenticates a user using their credentials.
 * It communicates with the backend API, validates the response, 
 * and securely sets an HTTP-only cookie with the access token if successful.
 *
 * @param data - The login credentials containing the user's email and password.
 * @returns An object indicating the success status and an optional error message.
 */
export async function loginAction(data: LoginModel) {
  try {
    // 1. Send the login request to the API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: data.email,
          password: data.password,
        }),
      },
    );

    if (!response.ok) {
      return { success: false, message: "Identifiants invalides" };
    }

    const rawData = await response.json();
    // 2. Safely parse and validate the API response structure using Zod
    const parsedResponse = LoginResponseSchema.safeParse(rawData);

    if (!parsedResponse.success) {
      console.error(
        "Erreur de validation de l'API : ",
        z.treeifyError(parsedResponse.error),
      );
      return {
        success: false,
        message: "Erreur de communication avec le serveur",
      };
    }

    const apiData = parsedResponse.data;

    if (!apiData.success) {
      return {
        success: false,
        message: apiData.message || "Identifiants invalides",
      };
    }

    if (!apiData.data) {
      return { success: false, message: "Le serveur a envoyé une réponse nulle" };
    }

    // 3. Store the access token securely in the user's cookies
    const cookieStore = await cookies();
    cookieStore.set("access_token", apiData.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Network crash in loginAction : ", error);

    return {
      success: false,
      message:
        "Le serveur d'authentification est inacessible.\nVeuillez rééssayer plus tard.",
    };
  }
}

/**
 * Logs out the current user by destroying their session.
 * It deletes the access token cookie and redirects the user back to the login page.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  redirect("/login");
}
