"use client";
import { Forward, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useChat } from "@ai-sdk/react";
import { useAtom } from "jotai";
import { useRef, useEffect } from "react";
import { cartAtom } from "~/lib/atoms";

function getMessageText(message: {
  parts: Array<{ type: string; text?: string }>;
}): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("");
}

const AgentChat = () => {
  const [cartItems] = useAtom(cartAtom);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat();

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const text = (formData.get("message") as string).trim();
    if (!text || isLoading) return;

    const cart = cartItems.map((item) => item.title);

    void sendMessage({ text }, { body: { cart } });
    form.reset();
  };
  return (
    <>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-3 p-4">
          {messages.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {cartItems.length > 0
                ? "Ask me for movie recommendations based on your cart!"
                : "Add some movies to your cart and I'll suggest similar ones!"}
            </p>
          )}

          {messages.map((message) => {
            const text = getMessageText(message);
            if (!text && message.role === "assistant") return null;

            return (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
                    : "bg-muted text-foreground mr-auto rounded-tl-none",
                )}
              >
                {text}
              </div>
            );
          })}

          {isLoading &&
            (!messages.at(-1) ||
              messages.at(-1)?.role !== "assistant" ||
              !getMessageText(messages.at(-1)!)) && (
              <div className="bg-muted text-muted-foreground mr-auto flex items-center gap-2 rounded-lg rounded-tl-none px-3 py-2 text-sm">
                <Loader2 className="size-3 animate-spin" />
              </div>
            )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t px-4 py-3"
      >
        <div className="relative flex flex-1 items-center">
          <Input
            name="message"
            placeholder="Ask for recommendations..."
            autoComplete="off"
            disabled={isLoading}
            className="h-10 w-full pr-10"
          />
          <Button
            variant={"ghost"}
            type="submit"
            size="icon"
            disabled={isLoading}
            className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
          >
            <Forward size={16} />
          </Button>
        </div>
      </form>
    </>
  );
};

export default AgentChat;
