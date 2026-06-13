import { Message } from "@/models/chatModel";
import { PydanticAiHistory } from "@/models/pydanticAiHistory";

/**
 * Parses a JSON string representing a PydanticAI history into an array of UI-compatible Message objects.
 *
 * @param historyJson - The raw JSON string containing the conversation history.
 * @returns An array of {@link Message} objects formatted for the chat interface.
 */
export function parseHistory(historyJson: string): Message[] {
  // Parse the raw JSON string into the structured PydanticAiHistory type
  const history: PydanticAiHistory = JSON.parse(historyJson);
  const messages: Message[] = [];

  for (const entry of history) {
    // Handle user requests: look for parts with 'user-prompt' kind
    if (entry.kind === "request") {
      const userPart = entry.parts.find(
        (part) => part.part_kind === "user-prompt",
      );

      /**
       * If a user prompt is found, map it to a 'user' role message
       */
      if (userPart) {
        messages.push({
          role: "user",
          content: userPart.content,
          timestamp: new Date(userPart.timestamp),
        });
      }
    }

    // Handle assistant responses: look for parts with 'text' kind
    if (entry.kind === "response") {
      const textPart = entry.parts.find((part) => part.part_kind === "text");

      /**
       * If a text response is found, map it to an 'assistant' role message
       */
      if (textPart) {
        messages.push({
          role: "assistant",
          content: textPart.content,
          timestamp: new Date(entry.timestamp),
        });
      }
    }
  }

  return messages;
}
