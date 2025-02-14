import { useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: message }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer,
        role: "assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, something went wrong. Please try again.",
        role: "assistant",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
