type MessagePart = {
  part_kind:
    | "user-prompt"
    | "system-prompt"
    | "text"
    | "tool-call"
    | "tool-return";
  content: string;
  timestamp: string;
};

type HistoryEntry = {
  kind: "request" | "response";
  parts: MessagePart[];
  timestamp: string;
};

export type PydanticAiHistory = HistoryEntry[];
