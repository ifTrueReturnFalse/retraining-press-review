import styles from "./TextInputChat.module.css";

interface TextInputChatProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export default function TextInputChat({
  value,
  onChange,
  onSubmit,
  disabled,
}: TextInputChatProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <textarea
      className={styles.input}
      placeholder="Tapez votre message ici..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    />
  );
}
