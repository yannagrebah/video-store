import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { discounts } from "~/lib/db/schema/d1";

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

  create: publicProcedure
    .input(
      z.object({
        label: z.string().min(1),
        discountRate: z.number().min(0).max(1),
        movieBundles: z.array(z.array(z.number())),
      }),
    )
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
    .input(
      z.object({
        id: z.number(),
        label: z.string().min(1).optional(),
        discountRate: z.number().min(0).max(1).optional(),
        movieBundles: z.array(z.array(z.number())).optional(),
      }),
    )
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
