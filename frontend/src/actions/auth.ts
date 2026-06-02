"use server";

import { LoginModel } from "@/models/authModel";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    return { error: "Identifiants invalides" };
  }

  const tokenData = await response.json();

  const cookieStore = await cookies();
  cookieStore.set("access_token", tokenData.access_token, {
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
