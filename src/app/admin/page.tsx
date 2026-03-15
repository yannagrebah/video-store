import Link from "next/link";
import { api } from "~/trpc/server";
import { GrossRevenueChart } from "./_components/gross-revenue-chart";
import { TopMoviesChart } from "./_components/top-movies-chart";
import { InvoicesTable } from "./_components/invoices-table";
import { PricesTable } from "./_components/prices-table";
import { DiscountsTable } from "./_components/discounts-table";
import { ArrowRight } from "lucide-react";

export default async function Admin() {
  const [invoices, prices, discounts] = await Promise.all([
    api.invoice.getAll(),
    api.pricing.getAll(),
    api.discount.getAll(),
  ]);

  // Compute top movies from invoices
  const movieCounts = new Map<number, number>();
  invoices.forEach((invoice) => {
    invoice.items.forEach((item) => {
      movieCounts.set(
        item.movieId,
        (movieCounts.get(item.movieId) ?? 0) + item.quantity,
      );
    });
  });

  const sortedMovies = Array.from(movieCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topMoviesData = await Promise.all(
    sortedMovies.map(async ([movieId, count]) => {
      try {
        const movie = await api.movie.getMovieDetails({
          id: movieId,
          credits: false,
        });
        return {
          title:
            movie.title +
            (movie.release_date
              ? ` (${new Date(movie.release_date).getFullYear()})`
              : ""),
          count,
        };
      } catch {
        return { title: `Movie ID: ${movieId}`, count };
      }
    }),
  );

  // Get titles for prices
  const movieTitles: Record<number, string> = {};
  await Promise.all(
    prices.map(async (price) => {
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
    <section className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <GrossRevenueChart invoices={invoices} />
        <TopMoviesChart data={topMoviesData} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link href="/admin/prices" className="group">
          <PricesTable
            moviePrices={prices}
            movieTitles={movieTitles}
            title={
              <span className="flex items-center gap-1">
                Movie Prices
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            }
          />
        </Link>
        <Link href="/admin/discounts" className="group md:col-span-2">
          <DiscountsTable
            discounts={discounts}
            title={
              <span className="flex items-center gap-1">
                Active Discounts
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            }
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Link href="/admin/invoices" className="group">
          <InvoicesTable
            invoices={invoices}
            title={
              <span className="flex items-center gap-1">
                Recent Invoices
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            }
          />
        </Link>
      </div>
    </section>
  );
}
