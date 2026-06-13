import { Message } from "@/models/chatModel";
import { PydanticAiHistory } from "@/models/pydanticAiHistory";

export function parseHistory(historyJson: string): Message[] {
  const history: PydanticAiHistory = JSON.parse(historyJson);
  const messages: Message[] = [];

  for (const entry of history) {
    if (entry.kind === "request") {
      const userPart = entry.parts.find(
        (part) => part.part_kind === "user-prompt",
      );

      if (userPart) {
        messages.push({
          role: "user",
          content: userPart.content,
          timestamp: new Date(userPart.timestamp),
        });
      }
    }

    if (entry.kind === "response") {
      const textPart = entry.parts.find((part) => part.part_kind === "text");

      if (textPart) {
        messages.push({
          role: "assistant",
          content: textPart.content,
          timestamp: new Date(textPart.timestamp),
        });
      }
    }
  }

  return messages;
}
