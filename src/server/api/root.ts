import { movieRouter } from "~/server/api/routers/movie";
import { invoiceRouter } from "~/server/api/routers/invoice";
import { pricingRouter } from "~/server/api/routers/pricing";
import { discountRouter } from "~/server/api/routers/discount";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  movie: movieRouter,
  invoice: invoiceRouter,
  pricing: pricingRouter,
  discount: discountRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.movie.all();
 *       ^? Movie[]
 */
export const createCaller = createCallerFactory(appRouter);
