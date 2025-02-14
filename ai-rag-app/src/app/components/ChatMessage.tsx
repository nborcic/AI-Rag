import { Message } from "./Chat";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`p-4 rounded ${message.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
      <p>{message.content}</p>
    </div>
  );
}
