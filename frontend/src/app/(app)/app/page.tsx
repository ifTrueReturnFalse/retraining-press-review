"use client";

import ChatIcon from "@/assets/Icons/ChatIcon";
import styles from "./HomePage.module.css";
import { logoutAction } from "@/actions/auth";
import LogoIcon from "@/assets/Icons/LogoIcon";
import IconButton from "@/components/Buttons/IconButton/IconButton";
import DocIcon from "@/assets/Icons/DocIcon";
import { IconColoringMethod } from "@/components/Buttons/IconButton/IconButton";
import LogoutButton from "@/components/Buttons/LogoutButton/LogoutButton";
import ChatGreetings from "@/components/ChatGreetings/ChatGreetings";
import ChatListItem from "@/components/ChatListItem/ChatListItem";
import TextInputChat from "@/components/Inputs/TextInputChat/TextInputChat";
import SendButton from "@/components/Buttons/SendButton/SendButton";

export default function HomePage() {
  return (
    <div className={styles.gridContainer}>
      {/* Up row */}
      <div className={styles.hLeft}>
        <LogoIcon />
      </div>

      <header className={styles.hRight}>
        <IconButton
          icon={<ChatIcon />}
          label="Chat"
          isSelected={true}
          coloringMethod={IconColoringMethod.Stroke}
        />
        <IconButton
          icon={<DocIcon />}
          label="Revue de presse"
          isSelected={false}
          coloringMethod={IconColoringMethod.Fill}
        />
      </header>

      {/* Mid row */}

      <aside className={styles.mLeft}>
        <ChatListItem date={new Date()} />
        <ChatListItem date={new Date()} />
        <ChatListItem date={new Date()} />
      </aside>

      <main className={styles.mRight}>
        <ChatGreetings />
      </main>

      {/* Bottom row */}

      <div className={styles.lLeft}>
        <LogoutButton onClick={async () => await logoutAction()} />
      </div>

      <div className={styles.lRight}>
        <TextInputChat />
        <SendButton />
      </div>
    </div>
  );
}
