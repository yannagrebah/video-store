import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { movieSchema, type Movie } from "~/lib/types";
import { getDiscountSummary, getUnitPrice } from "~/lib/pricing";

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
      const { discountRate, discountAmount } = getDiscountSummary(input.items);

      return { discountRate, discountAmount };
    }),
});
