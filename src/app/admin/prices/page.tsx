import { Pencil, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { PricesTable } from "../_components/prices-table";
import ConfirmDeleteDialog from "./_components/confirm-delete-dialog";
import UpsertMoviePriceDialog from "./_components/upsert-movie-price-dialog";

export default async function PricesPage() {
  const moviePrices = await api.pricing.getAll();

  // Get titles for prices
  const movieTitles: Record<number, string> = {};
  await Promise.all(
    moviePrices.map(async (price) => {
      if (price.movieId > 0) {
        try {
          const movie = await api.movie.getMovieDetails({
            id: price.movieId,
            credits: false,
          });
          movieTitles[price.movieId] = movie.title;
        } catch {
          movieTitles[price.movieId] = `Movie ID: ${price.movieId}`;
        }
      }
    }),
  );

  return (
    <section className="bg-background mx-auto h-[calc(100vh-4rem)] space-y-6 p-4 md:min-w-4xl md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Prices</h2>
        <p className="text-muted-foreground">
          Manage movie pricing and default store prices.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Manage Prices</h2>
          <UpsertMoviePriceDialog>
            <Button>
              <Plus className="size-4" />
              Add Price
            </Button>
          </UpsertMoviePriceDialog>
        </div>

        <PricesTable
          moviePrices={moviePrices}
          movieTitles={movieTitles}
          title={null}
          renderAction={(price) => (
            <div className="flex justify-end gap-2">
              <UpsertMoviePriceDialog
                moviePrice={price}
                initialMovieTitle={movieTitles[price.movieId]}
              >
                <Button variant="outline" size="icon">
                  <Pencil className="size-4" />
                </Button>
              </UpsertMoviePriceDialog>
              {price.movieId !== 0 && (
                <ConfirmDeleteDialog
                  movieId={price.movieId}
                  movieTitle={
                    movieTitles[price.movieId] ?? `Movie ID: ${price.movieId}`
                  }
                />
              )}
            </div>
          )}
        />
      </div>
    </section>
  );
}
