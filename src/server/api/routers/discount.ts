import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type schema from "~/lib/db/schema/d1";
import { discounts } from "~/lib/db/schema/d1";
import { discountSchema } from "~/lib/types";

export const getBestDiscount = (
  movieIds: number[],
  discounts: (typeof schema.discounts.$inferSelect)[],
) => {
  // Filter discounts that apply to the given movie IDs
  const applicableDiscounts = discounts.filter((discount) =>
    discount.movieBundles.some((bundle) =>
      [bundle].flat(2).every((movieId) => movieIds.includes(movieId)),
    ),
  );
  if (applicableDiscounts.length === 0) {
    return null;
  }

  // Return only the best discount
  const bestDiscount = applicableDiscounts.reduce((best, current) =>
    current.discountRate > best.discountRate ? current : best,
  );

  return bestDiscount;
};
export const discountRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx: { db } }) => {
    try {
      const results = await db.query.discounts.findMany();
      return results ?? [];
    } catch (error) {
      console.error("[discount.getAll] Error fetching discounts:", error);
      return [];
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx: { db }, input }) => {
      try {
        const result = await db.query.discounts.findFirst({
          where: eq(discounts.id, input.id),
        });

        return result ?? null;
      } catch (error) {
        console.error(
          `[discount.getById] Error fetching discount ${input.id}:`,
          error,
        );
        return null;
      }
    }),

  getApplicable: publicProcedure
    .input(z.object({ movieIds: z.array(z.number()) }))
    .query(async ({ ctx: { db }, input }) => {
      try {
        const results = await db.query.discounts.findMany();
        return getBestDiscount(input.movieIds, results);
      } catch (error) {
        console.error(
          `[discount.getApplicable] Error fetching applicable discounts for movies ${input.movieIds.join(", ")}:`,
          error,
        );
        return null;
      }
    }),
  create: publicProcedure
    .input(discountSchema.omit({ id: true }))
    .mutation(async ({ ctx: { db }, input }) => {
      const result = await db
        .insert(discounts)
        .values({
          label: input.label,
          discountRate: input.discountRate,
          movieBundles: input.movieBundles,
        })
        .returning();

      return result[0];
    }),

  update: publicProcedure
    .input(discountSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      const { id, ...updateData } = input;

      const result = await db
        .update(discounts)
        .set(updateData)
        .where(eq(discounts.id, id))
        .returning();

      return result[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx: { db }, input }) => {
      await db.delete(discounts).where(eq(discounts.id, input.id));

      return { success: true };
    }),
});
