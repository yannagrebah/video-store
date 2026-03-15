import z from "zod";

const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  release_date: z.string().optional(),
  poster_path: z.string().nullable(),
});

const moviePersonSchema = z.object({
  name: z.string(),
  gender: z.number().transform((val) => {
    switch (val) {
      case 0:
        return "Not set / not specified";
      case 1:
        return "Female";
      case 2:
        return "Male";
      case 3:
        return "Non-binary";
      default:
        return "Unknown";
    }
  }),
  known_for_department: z.string(),
  known_for: z.array(
    z.object({
      title: z.string().optional(),
      media_type: z.string(),
      release_date: z.string().optional(),
    }),
  ),
});

const movieDetailsSchema = movieSchema.extend({
  overview: z.string().optional(),
  genres: z.array(z.object({ name: z.string() })).optional(),
  credits: z
    .object({
      cast: z.array(
        moviePersonSchema.omit({ known_for: true }).extend({
          character: z.string().optional(),
        }),
      ),
      crew: z.array(
        moviePersonSchema.omit({ known_for: true }).extend({
          job: z.string().optional(),
        }),
      ),
    })
    .optional(),
});

const invoiceSchema = z.object({
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

const discountSchema = z.object({
  id: z.number(),
  label: z.string().min(1),
  discountRate: z.number().min(0).max(1),
  movieBundles: z.array(z.array(z.number())),
});

const moviePriceSchema = z.object({
  movieId: z.number().int().nonnegative(),
  price: z.number().min(0),
});

type Movie = z.infer<typeof movieSchema>;

type MoviePerson = z.infer<typeof moviePersonSchema>;

type MovieDetails = z.infer<typeof movieDetailsSchema>;

interface MovieCart extends Movie {
  quantity: number;
}

export type { Movie, MovieCart, MoviePerson, MovieDetails };
export {
  movieSchema,
  moviePersonSchema,
  movieDetailsSchema,
  invoiceSchema,
  discountSchema,
  moviePriceSchema,
};
