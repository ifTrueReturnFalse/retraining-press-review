"use client"

import { logoutAction } from "@/actions/auth";
import BlackButton from "@/components/Buttons/BlackButton/BlackButton";

export default function HomePage() {
  return (
    <div>
      <h1>Your future app</h1>
      <p>Lots of things </p>
      <BlackButton buttonText="Se déconnecter" type="button" onClick={async () => await logoutAction()}  />
    </div>
  )
}