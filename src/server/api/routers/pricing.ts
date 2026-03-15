import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { prices } from "~/lib/db/schema/d1";
import { moviePriceSchema } from "~/lib/types";

export const pricingRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx: { db } }) => {
    try {
      const results = await db.query.prices.findMany();
      return results ?? [];
    } catch (error) {
      console.error("[pricing.getAll] Error fetching prices:", error);
      return [];
    }
  }),

  getByMovieId: publicProcedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ ctx: { db }, input }) => {
      try {
        const [result, defaultPrice] = await Promise.all([
          db.query.prices.findFirst({
            where: eq(prices.movieId, input.movieId),
          }),
          db.query.prices.findFirst({
            where: eq(prices.movieId, 0),
          }),
        ]);

        return result ?? defaultPrice ?? null;
      } catch (error) {
        console.error(
          `[pricing.getByMovieId] Error fetching price for movie ${input.movieId}:`,
          error,
        );
        return null;
      }
    }),

  upsert: publicProcedure
    .input(moviePriceSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      const result = await db
        .insert(prices)
        .values({
          movieId: input.movieId,
          price: input.price,
        })
        .onConflictDoUpdate({
          target: prices.movieId,
          set: { price: input.price },
        })
        .returning();

      return result[0];
    }),

  delete: publicProcedure
    .input(z.object({ movieId: z.number() }))
    .mutation(async ({ ctx: { db }, input }) => {
      await db.delete(prices).where(eq(prices.movieId, input.movieId));

      return { success: true };
    }),
});
