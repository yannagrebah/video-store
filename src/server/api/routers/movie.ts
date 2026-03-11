import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { movieSchema, type Movie } from "~/lib/types";

const BTTF_TRILOGY_IDS = new Set([105, 165, 196]);

function getUnitPrice(id: number): number {
  return BTTF_TRILOGY_IDS.has(id) ? 15 : 20;
}

function getDiscountRate(distinctBttfCount: number): number {
  if (distinctBttfCount >= 3) return 0.2;
  if (distinctBttfCount >= 2) return 0.1;
  return 0;
}

export const movieRouter = createTRPCRouter({
  searchMovies: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }): Promise<Movie[]> => {
      const url = new URL("https://api.themoviedb.org/3/search/movie");
      url.searchParams.set("query", input.query);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${env.TMDB_API_KEY}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `TMDB API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = z
        .object({
          page: z.number(),
          results: z.array(movieSchema),
        })
        .parse(await response.json());

      return data.results.slice(0, 5).map((movie) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path ?? "",
      }));
    }),

  getPrice: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }): { unitPrice: number } => {
      return { unitPrice: getUnitPrice(input.id) };
    }),

  getDiscount: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.number(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .query(({ input }): { discountRate: number; discountAmount: number } => {
      const distinctBttfCount = input.items.filter((item) =>
        BTTF_TRILOGY_IDS.has(item.id),
      ).length;

      const discountRate = getDiscountRate(distinctBttfCount);

      const bttfTotal = input.items
        .filter((item) => BTTF_TRILOGY_IDS.has(item.id))
        .reduce((sum, item) => sum + getUnitPrice(item.id) * item.quantity, 0);

      const discountAmount = bttfTotal * discountRate;

      return { discountRate, discountAmount };
    }),
});
