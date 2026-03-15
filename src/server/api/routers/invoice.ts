import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { calculateCartPricing } from "~/lib/pricing";
import { generateInvoicePdf } from "~/lib/generate-invoice-pdf";
import { invoices } from "~/lib/db/schema/d1";
import { fetchTMDB } from "./movie";
import { movieDetailsSchema } from "~/lib/types";
import { getBestDiscount } from "./discount";

const createInvoiceInputSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number(),
        title: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
});

export const invoiceRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx: { db } }) => {
    try {
      const results = await db.query.invoices.findMany();
      return results ?? [];
    } catch (error) {
      console.error("[invoice.getAll] Error fetching invoices:", error);
      return [];
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx: { db }, input }) => {
      try {
        const result = await db.query.invoices.findFirst({
          where: eq(invoices.id, input.id),
        });

        return result ?? null;
      } catch (error) {
        console.error(
          `[invoice.getById] Error fetching invoice ${input.id}:`,
          error,
        );
        return null;
      }
    }),

  create: publicProcedure
    .input(createInvoiceInputSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      // First fetch applicable prices map
      const movieIds = Array.from(new Set(input.items.map((i) => i.id)));
      const moviePrices = await db.query.prices.findMany({
        where: (prices, { or }) =>
          or(
            ...movieIds.map((id) => eq(prices.movieId, id)),
            eq(prices.movieId, 0), // default price
          ),
      });
      const defaultPriceObj = moviePrices.find((p) => p.movieId === 0);
      const pricesMap = new Map<number, number>();
      movieIds.forEach((id) => {
        const priceObj = moviePrices.find((p) => p.movieId === id);
        pricesMap.set(
          id,
          priceObj ? priceObj.price : (defaultPriceObj?.price ?? 0),
        );
      });

      // Then fetch applicable discounts
      const bestDiscount = getBestDiscount(
        movieIds,
        await db.query.discounts.findMany(),
      );

      const { subtotal, discountAmount, total, discountRate } =
        calculateCartPricing(
          input.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          pricesMap,
          bestDiscount,
        );

      const result = await db
        .insert(invoices)
        .values({
          items: input.items.map((item) => ({
            movieId: item.id,
            quantity: item.quantity,
            unitPrice: pricesMap.get(item.id) ?? defaultPriceObj?.price ?? 0,
          })),
          subtotal,
          discountAmount,
          discountRate,
          total,
        })
        .returning();

      return result[0];
    }),

  generatePdf: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx: { db }, input }) => {
      const result = await db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
      });
      const invoice = result ?? null;

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }
      const lineItems = await Promise.all(
        invoice.items.map(async (item) => {
          const movieDetails = movieDetailsSchema.safeParse(
            await fetchTMDB(`/movie/${item.movieId}`),
          );
          const title = movieDetails.data?.title ?? `Movie ID ${item.movieId}`;
          return {
            title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.unitPrice * item.quantity,
          };
        }),
      );

      const purchaseDate =
        invoice.createdAt?.toISOString() ?? new Date().toISOString();

      const pdfBytes = await generateInvoicePdf({
        lineItems,
        purchaseDate,
        subtotal: invoice.subtotal,
        discountRate: invoice.discountRate,
        discountAmount: invoice.discountAmount,
        total: invoice.total,
      });

      const pdfBase64 = btoa(
        Array.from(new Uint8Array(pdfBytes))
          .map((b) => String.fromCharCode(b))
          .join(""),
      );

      return {
        fileName: `invoice-${purchaseDate.slice(0, 10)}.pdf`,
        mimeType: "application/pdf" as const,
        pdfBase64,
      };
    }),
});
