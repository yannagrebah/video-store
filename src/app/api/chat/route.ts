import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { env } from "~/env";

const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, cart } = (await req.json()) as {
    messages: UIMessage[];
    cart?: string[];
  };

  const cartContext =
    cart && cart.length > 0
      ? `\n\nThe user currently has the following movies in their cart: ${cart.join(", ")}.`
      : "\n\nThe user's cart is currently empty.";

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    system:
      "You are a helpful movie recommendation assistant for a video store. " +
      "Based on the movies the user has in their cart, you suggest similar movies they might enjoy. " +
      "Keep your recommendations concise and relevant. " +
      "For each recommendation, briefly explain why the user might like it based on what's already in their cart." +
      cartContext +
      "\n\nReply in plain text, without any formatting or markdown.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
