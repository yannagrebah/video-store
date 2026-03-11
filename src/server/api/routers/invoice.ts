import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { calculateCartPricing, getUnitPrice } from "~/lib/pricing";
import { generateInvoicePdf } from "~/lib/generate-invoice-pdf";

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
  create: publicProcedure
    .input(createInvoiceInputSchema)
    .mutation(async ({ input }) => {
      const lineItems = input.items.map((item) => {
        const unitPrice = getUnitPrice(item.id);
        const lineTotal = unitPrice * item.quantity;

        return {
          ...item,
          unitPrice,
          lineTotal,
        };
      });

      const { subtotal, discountRate, discountAmount, total } =
        calculateCartPricing(
          lineItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        );

      const now = new Date();
      const purchaseDate = now.toISOString();

      const pdfBytes = await generateInvoicePdf({
        lineItems,
        purchaseDate,
        subtotal,
        discountRate,
        discountAmount,
        total,
      });

      const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

      return {
        fileName: `invoice-${now.toISOString().slice(0, 10)}.pdf`,
        mimeType: "application/pdf" as const,
        pdfBase64,
        purchaseDate,
        subtotal,
        discountRate,
        discountAmount,
        total,
      };
    }),
});
