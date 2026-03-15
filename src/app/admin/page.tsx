import Link from "next/link";
import { api } from "~/trpc/server";
import { GrossRevenueChart } from "./_components/gross-revenue-chart";
import { TopMoviesChart } from "./_components/top-movies-chart";
import { InvoicesTable } from "./_components/invoices-table";
import { PricesTable } from "./_components/prices-table";
import { DiscountsTable } from "./_components/discounts-table";

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
    <main className="bg-chart-1/25 min-h-screen">
      <nav className="bg-background/50 sticky top-0 z-10 inline-grid w-full grid-cols-2 items-center border-b px-4 py-3 backdrop-blur md:px-8">
        <Link href="/">
          <h1 className="font-display text-2xl font-bold tracking-tight uppercase">
            VideoStore
          </h1>
        </Link>
        <Link
          href="/admin"
          className="text-muted-foreground justify-self-end text-sm font-medium"
        >
          Admin Dashboard
        </Link>
      </nav>

      <section className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <GrossRevenueChart invoices={invoices} />
          <TopMoviesChart data={topMoviesData} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PricesTable prices={prices} movieTitles={movieTitles} />
          <DiscountsTable discounts={discounts} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <InvoicesTable invoices={invoices} />
        </div>
      </section>
    </main>
  );
}
