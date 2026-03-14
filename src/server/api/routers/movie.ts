import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import {
  movieDetailsSchema,
  movieSchema,
  moviePersonSchema,
  type Movie,
  type MovieDetails,
  type MoviePerson,
} from "~/lib/types";
import { getDiscountSummary, getUnitPrice } from "~/lib/pricing";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function fetchTMDB(
  endpoint: string,
  params?: Record<string, string | number>,
) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

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

  return await response.json();
}

export const movieRouter = createTRPCRouter({
  searchMovies: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }): Promise<Movie[]> => {
      const rawData = await fetchTMDB("/search/movie", { query: input.query });

      const data = z
        .object({
          page: z.number(),
          results: z.array(movieSchema),
        })
        .parse(rawData);

      return data.results.slice(0, 5).map((movie) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path ?? "",
      }));
    }),

  searchMoviePerson: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }): Promise<MoviePerson[]> => {
      const rawData = await fetchTMDB("/search/person", { query: input.query });

      const data = z
        .object({
          page: z.number(),
          results: z.array(moviePersonSchema),
        })
        .parse(rawData);

      return data.results.slice(0, 5);
    }),

  getMovieDetails: publicProcedure
    .input(z.object({ id: z.number(), credits: z.boolean().default(true) }))
    .query(async ({ input }): Promise<MovieDetails> => {
      const rawData = await fetchTMDB(
        `/movie/${input.id}`,
        input.credits ? { append_to_response: "credits" } : undefined,
      );

      return movieDetailsSchema.parse(rawData);
    }),
  getTrendingMovies: publicProcedure.query(async () => {
    const rawData = await fetchTMDB("/trending/movie/week");

    const data = z
      .object({
        page: z.number(),
        results: z.array(movieSchema),
      })
      .parse(rawData);

    return data.results.slice(0, 5).map((movie) => ({
      title: movie.title,
      release_date: movie.release_date,
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
