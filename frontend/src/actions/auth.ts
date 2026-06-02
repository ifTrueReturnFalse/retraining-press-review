"use server";

import { LoginModel } from "@/models/authModel";
import { LoginResponseSchema } from "@/schemas/authSchemas";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function loginAction(data: LoginModel) {
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
  console.log(rawData)
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
    return { success: false, message: "Le serveur a rien une réponse nulle" };
  }

  const cookieStore = await cookies();
  cookieStore.set("access_token", apiData.data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  redirect("/login");
}
