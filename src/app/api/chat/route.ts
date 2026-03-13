import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  tool,
  type UIMessage,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { env } from "~/env";
import { appRouter } from "~/server/api/root";

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

  const caller = appRouter.createCaller({ headers: req.headers });

  const result = streamText({
    model: google("gemini-3.1-flash-lite-preview"),
    system:
      "You are a great movie connoisseur and expert recommendation assistant for a video store. " +
      "Your goal is to offer thoughtful, highly accurate, and engaging movie advice to customers. " +
      "Use your available tools to search for movies, look up actors or directors, look for what's trending right now and retrieve detailed movie information from TMDB to ensure your advice is perfectly accurate. " +
      "Tailor your recommendations based on what the user currently has in their cart. " +
      "Provide well-reasoned explanations for your suggestions, mentioning specific actors, directors, or thematic links." +
      cartContext +
      "you cannot talk about anything else. If the user asks about something that is not related to movies, politely let them know that you can only talk about movies and steer the conversation back to that topic." +
      "You can only discuss, advise, and recommend movies, you cannot do more proactive tasks such as adding movies to user's cart and such. If the user asks you to, politely let them know that you cannot and asks them to do it themselves" +
      "\n\nReply in plain text, without any formatting or markdown." +
      "Keep responses small and concise, 458 characters max" +
      "Keep a casual and friendly tone, as if you're chatting with a fellow movie lover, do not use complicated language.",
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // Allow the agent to call tools and then respond
    tools: {
      searchMovies: tool({
        description:
          "Search for movies by title to get basic information and TMDB IDs.",
        inputSchema: z.object({
          query: z
            .string()
            .describe("The search query, usually a movie title."),
        }),
        execute: async ({ query }) => {
          return await caller.movie.searchMovies({ query });
        },
      }),
      searchMoviePerson: tool({
        description:
          "Search for cast or crew members (actors, directors, etc.) to get their basic information and TMDB IDs.",
        inputSchema: z.object({
          query: z.string().describe("The name of the person."),
        }),
        execute: async ({ query }) => {
          return await caller.movie.searchMoviePerson({ query });
        },
      }),
      getMovieDetails: tool({
        description:
          "Get comprehensive details about a specific movie, including cast, crew, release date, and overview. Requires a TMDB movie ID.",
        inputSchema: z.object({
          id: z.number().describe("The TMDB ID of the movie."),
        }),
        execute: async ({ id }) => {
          return await caller.movie.getMovieDetails({ id });
        },
      }),
      getTrendingMovies: tool({
        description:
          "Get a list of currently trending movies to recommend popular choices.",
        inputSchema: z.object({}),
        execute: async () => {
          return await caller.movie.getTrendingMovies();
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
