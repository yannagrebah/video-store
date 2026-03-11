import z from "zod";

export const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  release_date: z.string().optional(),
  poster_path: z.string().nullable(),
});

type Movie = z.infer<typeof movieSchema>;

interface MovieCart extends Movie {
  quantity: number;
}

export type { Movie, MovieCart };
